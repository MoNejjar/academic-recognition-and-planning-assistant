import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, SourceReference, ChatStreamChunk } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEY_CHAT_ID = 'arip_chat_id';
const STORAGE_KEY_OLD = 'arip_chat_state'; // For migration

// --- Storage functions (only chat_id, not messages) ---

function loadChatIdFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_CHAT_ID);
  } catch {
    return null;
  }
}

function saveChatIdToStorage(chatId: string | null): void {
  try {
    if (chatId) {
      localStorage.setItem(STORAGE_KEY_CHAT_ID, chatId);
    } else {
      localStorage.removeItem(STORAGE_KEY_CHAT_ID);
    }
  } catch {
    // Ignore storage errors
  }
}

function clearChatIdStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CHAT_ID);
  } catch {
    // Ignore
  }
}

function migrateOldStorage(): string | null {
  // One-time migration from old format that stored messages
  try {
    const oldState = localStorage.getItem(STORAGE_KEY_OLD);
    if (oldState) {
      const parsed = JSON.parse(oldState);
      const chatId = parsed.chatId || null;
      if (chatId) {
        localStorage.setItem(STORAGE_KEY_CHAT_ID, chatId);
      }
      localStorage.removeItem(STORAGE_KEY_OLD);
      return chatId;
    }
  } catch {
    // Ignore migration errors
    localStorage.removeItem(STORAGE_KEY_OLD);
  }
  return null;
}

// --- API functions ---

interface ChatHistoryResponse {
  chat_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

async function fetchChatHistory(
  chatId: string,
  signal?: AbortSignal
): Promise<ChatHistoryResponse | null> {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/history/${chatId}`, { signal });

  if (response.status === 404) {
    return null; // Chat no longer exists
  }

  if (response.status === 429) {
    throw new Error('Rate limited. Please wait a moment.');
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

// --- Hook ---

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingHistory: boolean;
  chatId: string | null;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize chatId from storage (with migration)
  const initialChatId = migrateOldStorage() || loadChatIdFromStorage();
  const chatIdRef = useRef<string | null>(initialChatId);

  const abortRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef('');
  const historyFetchedRef = useRef(false);

  // Fetch history from backend on mount if chatId exists
  useEffect(() => {
    const storedChatId = chatIdRef.current;

    if (!storedChatId || historyFetchedRef.current) {
      return;
    }

    historyFetchedRef.current = true;
    setIsLoadingHistory(true);

    const abortController = new AbortController();

    fetchChatHistory(storedChatId, abortController.signal)
      .then((response) => {
        // Check if aborted before setting state (prevents setState on unmounted)
        if (abortController.signal.aborted) return;

        if (response) {
          // Backend has the chat - load messages
          setMessages(
            response.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              sources: msg.sources,
            }))
          );
        } else {
          // Chat no longer exists (404) - start fresh
          chatIdRef.current = null;
          clearChatIdStorage();
          setMessages([]);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Check if aborted before setting state
        if (abortController.signal.aborted) return;

        // Network error or other issue - start fresh
        chatIdRef.current = null;
        clearChatIdStorage();
        setMessages([]);
        setError('Failed to load chat history. Starting fresh.');
      })
      .finally(() => {
        // Check if aborted before setting state
        if (abortController.signal.aborted) return;
        setIsLoadingHistory(false);
      });

    return () => abortController.abort();
  }, []);

  const updateLastAssistant = useCallback((update: Partial<ChatMessage>) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, ...update };
      }
      return updated;
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || isLoadingHistory) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setError(null);
      setIsStreaming(true);
      streamingTextRef.current = '';

      setMessages((prev) => [
        ...prev,
        { role: 'user', content, timestamp: new Date().toISOString() },
        { role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      try {
        const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, chat_id: chatIdRef.current }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let sources: SourceReference[] = [];
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            let data: ChatStreamChunk;
            try {
              data = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            // Save chatId when we get it from backend
            if (data.chat_id && !chatIdRef.current) {
              chatIdRef.current = data.chat_id;
              saveChatIdToStorage(data.chat_id);
            }

            switch (data.type) {
              case 'text':
                if (typeof data.content === 'string') {
                  streamingTextRef.current += data.content;
                  updateLastAssistant({ content: streamingTextRef.current });
                }
                break;
              case 'sources':
                if (Array.isArray(data.content)) {
                  sources = data.content as SourceReference[];
                }
                break;
              case 'done':
                updateLastAssistant({ sources });
                break;
              case 'error':
                if (typeof data.content === 'string') {
                  setError(data.content);
                  updateLastAssistant({ content: `Error: ${data.content}` });
                }
                break;
            }
          }
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;

        let msg = 'An unknown error occurred';
        if (e instanceof TypeError && e.message.includes('fetch')) {
          msg = 'Network error: Server not reachable';
        } else if (e instanceof Error) {
          msg = e.message;
        }

        setError(msg);
        updateLastAssistant({ content: `Error: ${msg}` });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, isLoadingHistory, updateLastAssistant]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    chatIdRef.current = null;
    historyFetchedRef.current = false;
    setError(null);
    setIsStreaming(false);
    setIsLoadingHistory(false);
    clearChatIdStorage();
  }, []);

  return {
    messages,
    isStreaming,
    isLoadingHistory,
    chatId: chatIdRef.current,
    error,
    sendMessage,
    clearChat,
  };
}

export default useChat;
