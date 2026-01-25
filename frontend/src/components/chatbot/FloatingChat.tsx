import { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { width, height } = useWindowSize();

  const isMobile = width < 640;

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    overflow: 'hidden',
    background: 'white',
  };

  const chatStyle: React.CSSProperties = isMobile
    ? { ...baseStyle, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 0 }
    : {
        ...baseStyle,
        bottom: 90,
        right: 24,
        width: Math.min(560, width * 0.45),
        height: Math.min(height - 130, height * 0.6),
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      };

  return (
    <>
      {isOpen && (
        <div style={chatStyle}>
          <ChatWidget onClose={() => setIsOpen(false)} />
        </div>
      )}

      {(!isOpen || !isMobile) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? '✕' : '💬'}
        </button>
      )}
    </>
  );
}
