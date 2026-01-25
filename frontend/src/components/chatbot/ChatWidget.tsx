import { useRef, useEffect, useCallback } from 'react';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWidget() {
  const { messages, isStreaming, isLoadingHistory, sendMessage, clearChat } = useChat();
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
        top: elementTop - 16,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && messages.length >= 2) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
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
          disabled={isLoadingHistory}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: 'white',
            height: 32,
            paddingInline: 12,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: isLoadingHistory ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: isLoadingHistory ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoadingHistory) e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          }}
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
        {isLoadingHistory ? (
          // Loading state
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: 36,
              height: 36,
              border: '3px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading chat history...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : messages.length === 0 ? (
          // Welcome state
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
          // Messages
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
        <ChatInput onSend={sendMessage} disabled={isStreaming || isLoadingHistory} />
      </div>
    </div>
  );
}
