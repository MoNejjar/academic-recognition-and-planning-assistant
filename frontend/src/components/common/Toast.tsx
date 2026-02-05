import { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { TUM_COLORS } from '../../styles/tumStyles';

type ToastProps = {
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
    duration?: number;
};

export default function Toast({ message, type = 'error', onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'error':
                return {
                    background: '#FEE2E2',
                    borderColor: TUM_COLORS.error,
                    color: '#991B1B',
                    icon: <AlertCircle size={20} />,
                };
            case 'success':
                return {
                    background: '#D1FAE5',
                    borderColor: '#10B981',
                    color: '#065F46',
                    icon: <CheckCircle size={20} />,
                };
            case 'info':
            default:
                return {
                    background: '#DBEAFE',
                    borderColor: TUM_COLORS.blue,
                    color: '#1E40AF',
                    icon: <AlertCircle size={20} />,
                };
        }
    };

    const style = getStyles();

    return (
        <div
            style={{
                position: 'fixed',
                top: 24,
                right: 24,
                maxWidth: 400,
                background: style.background,
                border: `2px solid ${style.borderColor}`,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
            <div style={{ color: style.color, flexShrink: 0 }}>
                {style.icon}
            </div>
            <div style={{ flex: 1, color: style.color, fontSize: 14, fontWeight: 500 }}>
                {message}
            </div>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    color: style.color,
                    opacity: 0.7,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                }}
            >
                <X size={18} />
            </button>
        </div>
    );
}
