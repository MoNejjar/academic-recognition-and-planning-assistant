import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, SourceReference, ChatStreamChunk } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  chatId: string | null;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef('');

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

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    // Abort any previous request
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
      let buffer = ''; // Buffer for incomplete SSE lines

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new data to buffer and split by newlines
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          let data: ChatStreamChunk;
          try {
            data = JSON.parse(line.slice(6));
          } catch (parseError) {
            console.error('Failed to parse SSE chunk:', line);
            continue;
          }

          if (data.chat_id && !chatIdRef.current) {
            chatIdRef.current = data.chat_id;
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
                updateLastAssistant({ content: `Fehler: ${data.content}` });
              }
              break;
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;

      let msg = 'Ein unbekannter Fehler ist aufgetreten';
      if (e instanceof TypeError && e.message.includes('fetch')) {
        msg = 'Netzwerkfehler: Server nicht erreichbar';
      } else if (e instanceof Error) {
        msg = e.message;
      }

      setError(msg);
      updateLastAssistant({ content: `Fehler: ${msg}` });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, updateLastAssistant]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    chatIdRef.current = null;
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    chatId: chatIdRef.current,
    error,
    sendMessage,
    clearChat
  };
}

export default useChat;
