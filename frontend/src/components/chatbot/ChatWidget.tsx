import { useRef, useEffect, useCallback } from 'react';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWidget() {
  const { messages, isStreaming, sendMessage, clearChat } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // Scroll to the beginning of the last assistant message when a new response starts
  const scrollToLastAssistant = useCallback(() => {
    if (lastAssistantRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const element = lastAssistantRef.current;
      const elementTop = element.offsetTop - container.offsetTop;

      container.scrollTo({
        top: elementTop - 16, // Small padding from top
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    // Only scroll when a new message pair is added (user + assistant)
    if (messages.length > prevMessageCountRef.current && messages.length >= 2) {
      const lastMessage = messages[messages.length - 1];
      // Scroll when assistant message appears (starts empty during streaming)
      if (lastMessage?.role === 'assistant') {
        // Small delay to ensure DOM is updated
        setTimeout(scrollToLastAssistant, 50);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToLastAssistant]);

  const handleNewChat = () => {
    clearChat();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'white',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            TUM Credit Recognition
          </h2>
          <p style={{
            margin: '2px 0 0',
            fontSize: 11,
            opacity: 0.85,
            fontWeight: 500
          }}>
            Ask questions about credit transfer
          </p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          title="Start new chat"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: 'white',
            height: 32,
            paddingInline: 12,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <span style={{ fontSize: 14 }}>+</span>
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          background: '#f8fafc'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: 18, fontWeight: 600 }}>
              Welcome!
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              maxWidth: 300,
              marginInline: 'auto',
              lineHeight: 1.6,
              color: '#64748b'
            }}>
              Ask questions about credit recognition at TUM. For example: "How does the OLA work?"
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
              return (
                <div key={i} ref={isLastAssistant ? lastAssistantRef : undefined}>
                  <ChatMessage message={msg} />
                </div>
              );
            })}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', marginBottom: 12 }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#e2e8f0',
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  Typing...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: 16, background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
