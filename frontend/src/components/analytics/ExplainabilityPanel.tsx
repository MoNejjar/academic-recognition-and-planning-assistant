/**
 * Explainability Panel Component
 * 
 * Displays "Why This Score?" explanation with key strengths and gaps.
 * Follows 50 Golden Rules: dark mode, 8-point spacing, proper transitions.
 */


import './analytics.css';

interface ExplainabilityPanelProps {
    explanation: string;
    keyStrengths: string[];
    keyGaps: string[];
    confidence: number;
    inputQuality: 'poor' | 'adequate' | 'rich';
}

export default function ExplainabilityPanel({
    explanation,
    keyStrengths,
    keyGaps,
    confidence,
    inputQuality
}: ExplainabilityPanelProps) {
    const getQualityBadgeClass = () => {
        switch (inputQuality) {
            case 'poor': return 'analytics-badge-error';
            case 'adequate': return 'analytics-badge-warning';
            case 'rich': return 'analytics-badge-success';
            default: return '';
        }
    };

    return (
        <div className="analytics-card">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
            }}>
                <h4 className="analytics-card-title" style={{ margin: 0 }}>
                    🧠 Why This Score?
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className={`analytics-badge ${getQualityBadgeClass()}`}>
                        Input: {inputQuality}
                    </span>
                    <span className="analytics-badge" style={{
                        background: 'var(--analytics-bg-tertiary)',
                        color: 'var(--analytics-text-secondary)'
                    }}>
                        Confidence: {Math.round(confidence * 100)}%
                    </span>
                </div>
            </div>

            {/* Main explanation */}
            <div style={{
                background: 'linear-gradient(135deg, var(--analytics-info-bg) 0%, var(--analytics-accent-bg) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                borderLeft: '4px solid var(--analytics-accent)'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: 'var(--font-size-base)',
                    lineHeight: 1.7,
                    color: 'var(--analytics-text-primary)'
                }}>
                    {explanation}
                </p>
            </div>

            {/* Strengths and Gaps Grid */}
            <div className="analytics-grid analytics-grid-2 analytics-mobile-stack">
                {/* Strengths */}
                <div style={{
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)'
                }}>
                    <h5 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600,
                        color: 'var(--analytics-text-primary)',
                        margin: '0 0 var(--space-3) 0'
                    }}>
                        <span style={{ color: 'var(--analytics-success)' }}>✔</span> Key Strengths
                    </h5>
                    {keyStrengths.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                            {keyStrengths.map((strength, i) => (
                                <li key={i} style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--analytics-text-secondary)',
                                    marginBottom: 'var(--space-2)',
                                    lineHeight: 'var(--line-height)'
                                }}>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-muted)',
                            fontStyle: 'italic',
                            margin: 0
                        }}>
                            No notable strengths identified
                        </p>
                    )}
                </div>

                {/* Gaps */}
                <div style={{
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)'
                }}>
                    <h5 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600,
                        color: 'var(--analytics-text-primary)',
                        margin: '0 0 var(--space-3) 0'
                    }}>
                        <span style={{ color: 'var(--analytics-error)' }}>✖</span> Key Gaps
                    </h5>
                    {keyGaps.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                            {keyGaps.map((gap, i) => (
                                <li key={i} style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--analytics-text-secondary)',
                                    marginBottom: 'var(--space-2)',
                                    lineHeight: 'var(--line-height)'
                                }}>
                                    {gap}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-muted)',
                            fontStyle: 'italic',
                            margin: 0
                        }}>
                            No significant gaps identified
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
