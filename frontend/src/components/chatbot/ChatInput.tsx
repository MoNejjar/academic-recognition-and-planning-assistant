import { useState, useRef, useEffect } from 'react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 100)}px`;
    }
  }, [message]);

  const submit = () => {
    const text = message.trim();
    if (text && !disabled) {
      onSend(text);
      setMessage('');
    }
  };

  const canSend = !disabled && message.trim();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '6px 6px 6px 14px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <textarea
        ref={ref}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())}
        placeholder="Ask a question..."
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          padding: '6px 0',
          fontSize: 14,
          border: 'none',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          minHeight: 20,
          maxHeight: 100,
          lineHeight: 1.5,
          background: 'transparent',
          color: '#1e293b',
        }}
      />
      <button
        onClick={submit}
        disabled={!canSend}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          background: canSend ? '#3b82f6' : '#e2e8f0',
          color: canSend ? 'white' : '#94a3b8',
          border: 'none',
          cursor: canSend ? 'pointer' : 'not-allowed',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
      >
        Send
      </button>
    </div>
  );
}
