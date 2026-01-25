/**
 * Learning Outcome Table Component
 * 
 * Displays the row-by-row alignment between external and TUM learning outcomes.
 * Follows 50 Golden Rules: dark mode, hover states, smooth transitions.
 */

import React, { useState } from 'react';
import {
    LearningOutcomeMatch,
    getMatchLevelColor,
    getMatchLevelEmoji
} from '../../types/analyticsTypes';
import './analytics.css';

interface LearningOutcomeTableProps {
    matches: LearningOutcomeMatch[];
}

export default function LearningOutcomeTable({ matches }: LearningOutcomeTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    if (matches.length === 0) {
        return (
            <div className="analytics-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <p style={{ color: 'var(--analytics-text-tertiary)' }}>No learning outcome comparisons available.</p>
            </div>
        );
    }

    return (
        <div className="analytics-card">
            <h4 className="analytics-card-title">📋 Learning Outcomes Mapping</h4>

            <div style={{ overflowX: 'auto' }}>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>External Learning Outcome</th>
                            <th>TUM Learning Outcome</th>
                            <th style={{ textAlign: 'center', width: 100 }}>Match</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => {
                            const isExpanded = expandedRow === index;
                            const color = getMatchLevelColor(match.matchLevel);
                            const emoji = getMatchLevelEmoji(match.matchLevel);

                            return (
                                <React.Fragment key={index}>
                                    <tr
                                        style={{
                                            cursor: 'pointer',
                                            background: isExpanded ? 'var(--analytics-bg-secondary)' : 'transparent'
                                        }}
                                        onClick={() => setExpandedRow(isExpanded ? null : index)}
                                    >
                                        <td style={{ fontWeight: 600, color: 'var(--analytics-text-tertiary)' }}>
                                            {match.externalLoIndex}
                                        </td>
                                        <td style={{ maxWidth: 300 }}>
                                            <div style={{
                                                color: 'var(--analytics-text-primary)',
                                                fontSize: 'var(--font-size-sm)',
                                                lineHeight: 'var(--line-height)'
                                            }}>
                                                {match.externalLo}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: 300 }}>
                                            {match.tumLo ? (
                                                <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: 'var(--space-1) var(--space-2)',
                                                        background: 'var(--analytics-info-bg)',
                                                        color: 'var(--analytics-info)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: 600,
                                                        marginRight: 'var(--space-2)'
                                                    }}>
                                                        LO#{match.tumLoIndex}
                                                    </span>
                                                    <span style={{ color: 'var(--analytics-text-primary)' }}>{match.tumLo}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--analytics-text-muted)', fontStyle: 'italic' }}>
                                                    — No match
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span
                                                className="analytics-badge"
                                                style={{
                                                    background: `${color}15`,
                                                    border: `1px solid ${color}40`,
                                                    color
                                                }}
                                            >
                                                {emoji} {match.matchLevel.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Expanded explanation row */}
                                    {isExpanded && (
                                        <tr style={{ background: 'var(--analytics-bg-secondary)' }}>
                                            <td colSpan={4} style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                                                <div style={{
                                                    background: 'var(--analytics-bg-primary)',
                                                    border: '1px solid var(--analytics-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: 'var(--space-4)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 'var(--space-2)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--analytics-text-tertiary)'
                                                    }}>
                                                        <span>💡 Explanation</span>
                                                        <span style={{
                                                            padding: 'var(--space-1) var(--space-2)',
                                                            background: 'var(--analytics-bg-secondary)',
                                                            borderRadius: 'var(--radius-sm)'
                                                        }}>
                                                            Confidence: {Math.round(match.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <p style={{
                                                        margin: 0,
                                                        color: 'var(--analytics-text-secondary)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        lineHeight: 'var(--line-height)'
                                                    }}>
                                                        {match.explanation}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--analytics-text-muted)',
                textAlign: 'center'
            }}>
                💡 Click a row to see the detailed explanation
            </div>
        </div>
    );
}
