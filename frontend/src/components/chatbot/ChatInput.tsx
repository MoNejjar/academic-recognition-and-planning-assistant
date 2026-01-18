import { useState, useRef, useEffect } from 'react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

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
      alignItems: 'flex-end',
      gap: 10,
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: 10,
      padding: '6px 6px 6px 14px',
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
          lineHeight: 1.4,
          background: 'transparent',
        }}
      />
      <button
        onClick={submit}
        disabled={!canSend}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          background: canSend ? '#0051a2' : '#e0e0e0',
          color: canSend ? 'white' : '#999',
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
