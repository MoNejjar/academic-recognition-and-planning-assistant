import { useRef, useEffect } from 'react';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Props {
  onClose?: () => void;
}

export default function ChatWidget({ onClose }: Props) {
  const { messages, isStreaming, sendMessage } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>TUM Credit Recognition</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.85, fontWeight: 500 }}>Ask questions about credit transfer</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc' }}>
        {messages.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: 18, fontWeight: 600 }}>Welcome!</h3>
            <p style={{ margin: 0, fontSize: 14, maxWidth: 300, marginInline: 'auto', lineHeight: 1.6, color: '#64748b' }}>
              Ask questions about credit recognition at TUM. For example: "How does the OLA work?"
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', marginBottom: 12 }}>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#e2e8f0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>Typing...</div>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      <div style={{ padding: 16, background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
