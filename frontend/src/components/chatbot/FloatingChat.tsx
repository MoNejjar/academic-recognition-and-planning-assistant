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

  // Button is 56px tall at bottom: 20, so chat window starts at bottom: 90 (20 + 56 + 14 gap)
  const chatStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        borderRadius: 0,
        overflow: 'hidden',
        background: 'white',
      }
    : {
        position: 'fixed',
        bottom: 90, // Above the toggle button
        right: 24,
        width: Math.min(560, width * 0.45),
        height: Math.min(height - 130, height * 0.6), // 60% of viewport height max
        zIndex: 1000,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        background: 'white',
      };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div style={chatStyle}>
          <ChatWidget onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Toggle Button - always at bottom-right, chat window sits above it */}
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
      )}
    </>
  );
}
