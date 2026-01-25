
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { TUM_COLORS } from '../../styles/tumStyles';
import { DecisionHint } from '../../types/analyticsTypes';
import { useState } from 'react';

// Status colors (kept consistent for severity)
export const STATUS_COLORS = {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
};

export const ExplanationTooltip = ({ text }: { text: string }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', marginLeft: 8, verticalAlign: 'middle' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <HelpCircle size={15} color={TUM_COLORS.gray50} style={{ cursor: 'help' }} />
            {visible && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 10,
                    padding: '8px 12px',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    fontSize: 12,
                    borderRadius: 4,
                    width: 220,
                    textAlign: 'center',
                    zIndex: 50,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    lineHeight: 1.4,
                    fontWeight: 400
                }}>
                    {text}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: -4,
                        borderWidth: 4,
                        borderStyle: 'solid',
                        borderColor: '#1f2937 transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

export function ScoreDisplay({ score }: { score: number }) {
    const color = score >= 75 ? STATUS_COLORS.success : score >= 50 ? STATUS_COLORS.warning : STATUS_COLORS.error;

    return (
        <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 264} 264`}
                />
            </svg>
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>{Math.round(score)}%</span>
            </div>
        </div>
    );
}

export function DecisionBadge({ hint }: { hint: DecisionHint }) {
    const config = {
        highly_equivalent: { label: 'Highly Equivalent', bg: STATUS_COLORS.success, icon: CheckCircle2 },
        partial: { label: 'Partial Match', bg: STATUS_COLORS.warning, icon: AlertTriangle },
        insufficient: { label: 'Insufficient', bg: STATUS_COLORS.error, icon: XCircle }
    };

    const { label, bg, icon: Icon } = config[hint];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: bg,
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
        }}>
            <Icon size={14} />
            {label}
        </span>
    );
}
