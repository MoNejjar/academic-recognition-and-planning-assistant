/**
 * Summary Card Component
 * 
 * Displays the primary equivalence score, decision hint, and AI disclaimer.
 * Follows 50 Golden Rules: dark mode, 8-point spacing, proper transitions.
 */


import {
    DecisionHint,
    getDecisionHintEmoji
} from '../../types/analyticsTypes';
import ScoreGauge from './ScoreGauge';
import './analytics.css';

interface SummaryCardProps {
    score: number;
    decisionHint: DecisionHint;
    decisionHintText: string;
}

export default function SummaryCard({ score, decisionHint, decisionHintText }: SummaryCardProps) {
    // const color = getScoreColor(score);
    const emoji = getDecisionHintEmoji(decisionHint);

    // Get badge class based on decision
    const getBadgeClass = () => {
        switch (decisionHint) {
            case 'highly_equivalent': return 'analytics-badge-success';
            case 'partial': return 'analytics-badge-warning';
            case 'insufficient': return 'analytics-badge-error';
            default: return '';
        }
    };

    return (
        <div className="analytics-card" style={{
            background: 'linear-gradient(135deg, var(--analytics-bg-secondary) 0%, var(--analytics-bg-primary) 100%)'
        }}>
            <div className="analytics-mobile-stack" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <ScoreGauge score={score} size={140} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    flex: 1,
                    minWidth: 200
                }}>
                    {/* Decision Badge */}
                    <div
                        className={`analytics-badge ${getBadgeClass()}`}
                        style={{
                            padding: 'var(--space-3) var(--space-5)',
                            fontSize: 'var(--font-size-base)',
                            display: 'inline-flex',
                            alignSelf: 'flex-start'
                        }}
                    >
                        <span style={{ fontSize: 'var(--font-size-xl)' }}>{emoji}</span>
                        <span style={{ fontWeight: 600 }}>{decisionHintText}</span>
                    </div>

                    {/* AI Disclaimer */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--analytics-text-tertiary)',
                        fontStyle: 'italic'
                    }}>
                        <span>⚠️</span>
                        <span>AI-supported suggestion (not a decision)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
