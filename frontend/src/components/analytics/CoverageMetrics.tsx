/**
 * Coverage Metrics Component
 * 
 * Displays coverage percentages as horizontal progress bars.
 * Follows 50 Golden Rules: dark mode, 8-point spacing, smooth transitions.
 */


import { CoverageMetrics as CoverageMetricsType } from '../../types/analyticsTypes';
import './analytics.css';

interface CoverageMetricsProps {
    metrics: CoverageMetricsType;
}

export default function CoverageMetrics({ metrics }: CoverageMetricsProps) {
    return (
        <div className="analytics-card">
            <h4 className="analytics-card-title">📊 Coverage Summary</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Covered */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-secondary)'
                        }}>
                            <span>✅</span> TUM outcomes covered
                        </span>
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--analytics-success)'
                        }}>
                            {Math.round(metrics.tumOutcomesCoveredPercent)}%
                        </span>
                    </div>
                    <div className="analytics-progress">
                        <div
                            className="analytics-progress-fill"
                            style={{
                                width: `${metrics.tumOutcomesCoveredPercent}%`,
                                background: 'linear-gradient(90deg, var(--analytics-success), #16a34a)'
                            }}
                        />
                    </div>
                </div>

                {/* Missing */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-secondary)'
                        }}>
                            <span>❌</span> TUM outcomes missing
                        </span>
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--analytics-error)'
                        }}>
                            {Math.round(metrics.tumOutcomesMissingPercent)}%
                        </span>
                    </div>
                    <div className="analytics-progress">
                        <div
                            className="analytics-progress-fill"
                            style={{
                                width: `${metrics.tumOutcomesMissingPercent}%`,
                                background: 'linear-gradient(90deg, var(--analytics-error), #dc2626)'
                            }}
                        />
                    </div>
                </div>

                {/* Excess */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-secondary)'
                        }}>
                            <span>➕</span> External excess content
                        </span>
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--analytics-info)'
                        }}>
                            {Math.round(metrics.externalOutcomesExcessPercent)}%
                        </span>
                    </div>
                    <div className="analytics-progress">
                        <div
                            className="analytics-progress-fill"
                            style={{
                                width: `${metrics.externalOutcomesExcessPercent}%`,
                                background: 'linear-gradient(90deg, var(--analytics-info), #2563eb)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Counts */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--analytics-border)',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--analytics-text-primary)' }}>
                        {metrics.coveredCount}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--analytics-text-tertiary)' }}>
                        / {metrics.totalTumOutcomes} TUM LOs
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--analytics-text-primary)' }}>
                        {metrics.totalExternalOutcomes}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--analytics-text-tertiary)' }}>
                        External LOs
                    </span>
                </div>
            </div>
        </div>
    );
}
