import { useState, useEffect, useCallback, useRef } from 'react';
import ChatWidget from './ChatWidget';

const STORAGE_KEY_HEIGHT = 'arip_chat_height';
const MIN_HEIGHT = 300;
const MAX_HEIGHT_RATIO = 0.85;

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function loadHeight(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HEIGHT);
    if (stored) {
      const height = parseInt(stored, 10);
      if (!isNaN(height) && height >= MIN_HEIGHT) {
        return height;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveHeight(height: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_HEIGHT, String(height));
  } catch {
    // Ignore
  }
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { width, height: windowHeight } = useWindowSize();
  const isMobile = width < 640;

  // Calculate max height based on window
  const maxHeight = Math.floor(windowHeight * MAX_HEIGHT_RATIO);

  // Initialize height from storage or default
  const [chatHeight, setChatHeight] = useState<number>(() => {
    const stored = loadHeight();
    const defaultHeight = Math.min(windowHeight - 130, windowHeight * 0.6);
    return stored ? Math.min(stored, maxHeight) : defaultHeight;
  });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Handle resize drag
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeStartHeight.current = chatHeight;
  }, [chatHeight]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const delta = resizeStartY.current - clientY; // Inverted because dragging up increases height
      const newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, resizeStartHeight.current + delta));
      setChatHeight(newHeight);
    };

    const handleEnd = () => {
      setIsResizing(false);
      saveHeight(chatHeight);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, chatHeight, maxHeight]);

  // Clamp height when window resizes
  useEffect(() => {
    if (chatHeight > maxHeight) {
      setChatHeight(maxHeight);
    }
  }, [maxHeight, chatHeight]);

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
        width: Math.min(420, width * 0.4),
        height: chatHeight,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
      };

  return (
    <>
      {isOpen && (
        <div style={chatStyle}>
          {/* Resize Handle - only on desktop */}
          {!isMobile && (
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 12,
                cursor: 'ns-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                background: 'transparent',
              }}
            >
              {/* Visual handle indicator */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: isResizing ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.4)',
                  marginTop: 4,
                  transition: 'background 0.15s',
                }}
              />
            </div>
          )}
          <ChatWidget />
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
