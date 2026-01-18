import { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'min(500px, 85vw)',
            height: 'min(700px, 80vh)',
            zIndex: 1000,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: 'white',
          }}
        >
          <ChatWidget onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#0051a2',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,81,162,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          zIndex: 1001,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
