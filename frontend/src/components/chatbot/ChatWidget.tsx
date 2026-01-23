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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: '#0051a2',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>TUM Credit Recognition</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8 }}>Ask questions about credit transfer</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: 6,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fafafa' }}>
        {messages.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <h3 style={{ margin: '0 0 12px', color: '#333', fontSize: 18, fontWeight: 500 }}>Welcome!</h3>
            <p style={{ margin: 0, fontSize: 14, maxWidth: 300, marginInline: 'auto', lineHeight: 1.6, color: '#666' }}>
              Ask questions about credit recognition at TUM. For example: "How does the OLA work?"
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', marginBottom: 12 }}>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#e8e8e8', color: '#666', fontSize: 14 }}>Typing...</div>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: 16, background: 'white', borderTop: '1px solid #eee' }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
