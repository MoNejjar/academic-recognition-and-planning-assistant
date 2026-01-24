/**
 * Depth Analysis Component
 * 
 * Displays Bloom's Taxonomy comparison between external and TUM learning outcomes.
 * Follows 50 Golden Rules: dark mode, 8-point spacing, smooth 300ms transitions.
 */

import React from 'react';
import {
    DepthComparison,
    BloomLevel,
    bloomLevelToNumber
} from '../../types/analyticsTypes';
import './analytics.css';

interface DepthAnalysisProps {
    analysis: DepthComparison[];
}

const BLOOM_LEVELS: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const BLOOM_LABELS: { [key: string]: string } = {
    remember: 'Remember',
    understand: 'Understand',
    apply: 'Apply',
    analyze: 'Analyze',
    evaluate: 'Evaluate',
    create: 'Create',
};

export default function DepthAnalysis({ analysis }: DepthAnalysisProps) {
    if (analysis.length === 0) {
        return (
            <div className="analytics-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <p style={{ color: 'var(--analytics-text-tertiary)' }}>No depth analysis available.</p>
            </div>
        );
    }

    return (
        <div className="analytics-card">
            <h4 className="analytics-card-title">📐 Bloom's Taxonomy Depth Analysis</h4>
            <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--analytics-text-tertiary)',
                margin: '0 0 var(--space-4) 0'
            }}>
                Comparing cognitive levels between external and TUM learning outcomes
            </p>

            {/* Legend */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-5)',
                marginBottom: 'var(--space-5)',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--analytics-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 'var(--radius-sm)', background: 'var(--analytics-info)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--analytics-text-secondary)' }}>External</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 'var(--radius-sm)', background: 'var(--analytics-success)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--analytics-text-secondary)' }}>TUM</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {analysis.map((item, index) => {
                    const extLevel = bloomLevelToNumber(item.externalBloomLevel);
                    const tumLevel = item.tumBloomLevel ? bloomLevelToNumber(item.tumBloomLevel) : 0;
                    const maxLevel = 6;

                    // Distinct colors for each LO
                    const hue = (index * 50) % 360;
                    const externalColor = `hsl(${hue}, 70%, 50%)`;
                    const externalColorDark = `hsl(${hue}, 70%, 40%)`;
                    const tumColor = `hsl(${(hue + 120) % 360}, 60%, 45%)`;
                    const tumColorDark = `hsl(${(hue + 120) % 360}, 60%, 35%)`;

                    return (
                        <div key={index} style={{
                            padding: 'var(--space-4)',
                            background: 'var(--analytics-bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${externalColor}`
                        }}>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--analytics-text-primary)',
                                marginBottom: 'var(--space-3)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>
                                    Learning Outcome #{item.externalLoIndex}
                                    {item.tumLoIndex && (
                                        <span style={{ fontWeight: 400, color: 'var(--analytics-text-tertiary)' }}>
                                            {' '}↔ TUM LO #{item.tumLoIndex}
                                        </span>
                                    )}
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--analytics-bg-tertiary)',
                                    color: 'var(--analytics-text-secondary)'
                                }}>
                                    #{index + 1}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {/* External bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <span style={{
                                        width: 65,
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--analytics-text-secondary)',
                                        fontWeight: 500
                                    }}>
                                        External:
                                    </span>
                                    <div style={{
                                        flex: 1,
                                        height: 28,
                                        background: 'var(--analytics-bg-tertiary)',
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(extLevel / maxLevel) * 100}%`,
                                            borderRadius: 'var(--radius-sm)',
                                            background: `linear-gradient(90deg, ${externalColor}, ${externalColorDark})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingLeft: 'var(--space-2)',
                                            transition: 'width var(--transition-slow)',
                                            minWidth: 90
                                        }}>
                                            <span style={{ color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                                                {BLOOM_LABELS[item.externalBloomLevel]} ({extLevel}/6)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* TUM bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <span style={{
                                        width: 65,
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--analytics-text-secondary)',
                                        fontWeight: 500
                                    }}>
                                        TUM:
                                    </span>
                                    <div style={{
                                        flex: 1,
                                        height: 28,
                                        background: 'var(--analytics-bg-tertiary)',
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden'
                                    }}>
                                        {tumLevel > 0 ? (
                                            <div style={{
                                                height: '100%',
                                                width: `${(tumLevel / maxLevel) * 100}%`,
                                                borderRadius: 'var(--radius-sm)',
                                                background: `linear-gradient(90deg, ${tumColor}, ${tumColorDark})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingLeft: 'var(--space-2)',
                                                transition: 'width var(--transition-slow)',
                                                minWidth: 90
                                            }}>
                                                <span style={{ color: '#fff', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                                                    {item.tumBloomLevel && BLOOM_LABELS[item.tumBloomLevel]} ({tumLevel}/6)
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--analytics-text-muted)',
                                                fontStyle: 'italic',
                                                paddingLeft: 'var(--space-2)',
                                                lineHeight: '28px'
                                            }}>
                                                No TUM match
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gap indicator */}
                            {item.hasDepthGap && (
                                <div style={{ marginTop: 'var(--space-3)' }}>
                                    <span className={`analytics-badge ${item.depthGap > 0 ? 'analytics-badge-success' : 'analytics-badge-error'}`}>
                                        {item.depthGap > 0 ? '↑ External deeper' : '↓ TUM deeper'}
                                    </span>
                                </div>
                            )}

                            {/* Note */}
                            {item.note && (
                                <div style={{
                                    marginTop: 'var(--space-3)',
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--analytics-text-tertiary)',
                                    fontStyle: 'italic'
                                }}>
                                    💡 {item.note}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Scale reference */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 'var(--space-5)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--analytics-border)'
            }}>
                {BLOOM_LEVELS.map((level, i) => (
                    <div key={level} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-1)'
                    }}>
                        <span style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--analytics-bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            color: 'var(--analytics-text-secondary)'
                        }}>
                            {i + 1}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--analytics-text-muted)' }}>
                            {BLOOM_LABELS[level].slice(0, 3)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
