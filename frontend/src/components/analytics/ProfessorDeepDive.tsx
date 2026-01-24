/**
 * Professor Deep Dive Component
 * 
 * Expandable container with detailed academic analysis for professors.
 * Follows 50 Golden Rules: dark mode, proper transitions, 8-point spacing.
 */

import React, { useState } from 'react';
import { ConfidenceIndicators } from '../../types/analyticsTypes';
import './analytics.css';

interface ProfessorDeepDiveProps {
    detailedReasoning: string | null;
    ambiguityNotes: string[];
    recognitionSuggestions: string[];
    confidence: ConfidenceIndicators;
}

export default function ProfessorDeepDive({
    detailedReasoning,
    ambiguityNotes,
    recognitionSuggestions,
    confidence
}: ProfessorDeepDiveProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="analytics-card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="analytics-btn"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'linear-gradient(135deg, var(--analytics-accent-bg) 0%, var(--analytics-bg-secondary) 100%)',
                    border: 'none',
                    borderRadius: 0,
                    color: 'var(--analytics-accent)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-base)'
                }}
            >
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{isExpanded ? '🔼' : '🔽'}</span>
                <span style={{ flex: 1 }}>
                    {isExpanded ? 'Hide' : 'Show'} Detailed Academic Analysis
                </span>
                <span className="analytics-badge" style={{
                    background: 'var(--analytics-accent)',
                    color: 'white'
                }}>
                    👨‍🏫 Professor View
                </span>
            </button>

            {isExpanded && (
                <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* Detailed Reasoning */}
                    {detailedReasoning && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--analytics-bg-secondary)',
                            borderRadius: 'var(--radius-md)'
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
                                📝 Detailed Reasoning
                            </h5>
                            <p style={{
                                margin: 0,
                                fontSize: 'var(--font-size-sm)',
                                lineHeight: 1.7,
                                color: 'var(--analytics-text-secondary)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {detailedReasoning}
                            </p>
                        </div>
                    )}

                    {/* Confidence Details */}
                    <div style={{
                        padding: 'var(--space-4)',
                        background: 'var(--analytics-bg-secondary)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <h5 style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--analytics-text-primary)',
                            margin: '0 0 var(--space-4) 0'
                        }}>
                            🔒 Confidence Assessment
                        </h5>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {/* Overall Confidence */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--analytics-text-secondary)',
                                    minWidth: 130
                                }}>
                                    Overall Confidence
                                </span>
                                <div className="analytics-progress" style={{ flex: 1, maxWidth: 200 }}>
                                    <div
                                        className="analytics-progress-fill"
                                        style={{
                                            width: `${confidence.overallConfidence * 100}%`,
                                            background: 'linear-gradient(90deg, var(--analytics-accent), #6d28d9)'
                                        }}
                                    />
                                </div>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 600,
                                    color: 'var(--analytics-accent)',
                                    minWidth: 40
                                }}>
                                    {Math.round(confidence.overallConfidence * 100)}%
                                </span>
                            </div>

                            {/* Input Quality */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--analytics-text-secondary)',
                                    minWidth: 130
                                }}>
                                    Input Quality
                                </span>
                                <span className={`analytics-badge ${confidence.inputQuality === 'rich' ? 'analytics-badge-success' :
                                        confidence.inputQuality === 'adequate' ? 'analytics-badge-warning' : 'analytics-badge-error'
                                    }`}>
                                    {confidence.inputQuality.charAt(0).toUpperCase() + confidence.inputQuality.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Uncertainty Areas */}
                        {confidence.uncertaintyAreas.length > 0 && (
                            <div style={{
                                marginTop: 'var(--space-4)',
                                paddingTop: 'var(--space-3)',
                                borderTop: '1px solid var(--analytics-border)'
                            }}>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 500,
                                    color: 'var(--analytics-text-secondary)'
                                }}>
                                    ⚠️ Areas of Uncertainty:
                                </span>
                                <ul style={{ margin: 'var(--space-2) 0 0 0', paddingLeft: 'var(--space-5)' }}>
                                    {confidence.uncertaintyAreas.map((area, i) => (
                                        <li key={i} style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--analytics-text-tertiary)',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* LLM Notes */}
                        {confidence.llmReasoningNotes && (
                            <div style={{
                                marginTop: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'var(--analytics-bg-primary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--analytics-border)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--analytics-text-secondary)' }}>
                                    🤖 LLM Notes:
                                </span>
                                <p style={{
                                    margin: 'var(--space-2) 0 0 0',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--analytics-text-tertiary)',
                                    fontStyle: 'italic'
                                }}>
                                    {confidence.llmReasoningNotes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Ambiguity Notes */}
                    {ambiguityNotes.length > 0 && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--analytics-bg-secondary)',
                            borderRadius: 'var(--radius-md)'
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
                                ❓ Ambiguity Notes
                            </h5>
                            <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                                {ambiguityNotes.map((note, i) => (
                                    <li key={i} style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--analytics-text-tertiary)',
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recognition Suggestions */}
                    {recognitionSuggestions.length > 0 && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--analytics-bg-secondary)',
                            borderRadius: 'var(--radius-md)'
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
                                💡 Recognition Suggestions
                            </h5>
                            <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                                {recognitionSuggestions.map((suggestion, i) => (
                                    <li key={i} style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--analytics-text-secondary)',
                                        marginBottom: 'var(--space-2)',
                                        lineHeight: 'var(--line-height)'
                                    }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
