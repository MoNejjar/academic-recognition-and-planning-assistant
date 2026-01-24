/**
 * Staff Filters Component
 * 
 * Quick filters and auto-detected flags for staff triage.
 * Follows 50 Golden Rules: dark mode, hover states, 8-point spacing.
 */


import { AnalysisFlag, FlagType } from '../../types/analyticsTypes';
import './analytics.css';

interface StaffFiltersProps {
    flags: AnalysisFlag[];
    onFilterLowMatches?: () => void;
    onFilterMissingOutcomes?: () => void;
}

const FLAG_ICONS: { [key in FlagType]: string } = {
    credit_mismatch: '💰',
    missing_mandatory_lo: '📚',
    level_mismatch: '📊',
    language_mismatch: '🌐',
    low_confidence: '⚠️',
    depth_gap: '📐',
};

const FLAG_LABELS: { [key in FlagType]: string } = {
    credit_mismatch: 'Credit Mismatch',
    missing_mandatory_lo: 'Missing LO',
    level_mismatch: 'Level Mismatch',
    language_mismatch: 'Language Mismatch',
    low_confidence: 'Low Confidence',
    depth_gap: 'Depth Gap',
};

export default function StaffFilters({ flags, onFilterLowMatches, onFilterMissingOutcomes }: StaffFiltersProps) {
    return (
        <div className="analytics-card">
            <div className="analytics-grid analytics-grid-2 analytics-mobile-stack" style={{ alignItems: 'start' }}>
                {/* Auto-Flags */}
                <div style={{ minWidth: 280 }}>
                    <h5 style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600,
                        color: 'var(--analytics-text-primary)',
                        margin: '0 0 var(--space-3) 0'
                    }}>
                        🚦 Auto-Detected Issues
                    </h5>
                    {flags.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {flags.map((flag, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-3) var(--space-4)',
                                        borderRadius: 'var(--radius-md)',
                                        background: flag.severity === 'critical' ? 'var(--analytics-error-bg)' : 'var(--analytics-warning-bg)',
                                        border: `1px solid ${flag.severity === 'critical' ? 'var(--analytics-error)' : 'var(--analytics-warning)'}40`
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-lg)', marginTop: 2 }}>
                                        {FLAG_ICONS[flag.flagType]}
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            color: flag.severity === 'critical' ? 'var(--analytics-error)' : 'var(--analytics-warning)'
                                        }}>
                                            {FLAG_LABELS[flag.flagType]}
                                        </span>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--analytics-text-secondary)' }}>
                                            {flag.message}
                                        </span>
                                        {flag.details && (
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--analytics-text-tertiary)', fontStyle: 'italic' }}>
                                                {flag.details}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--analytics-success-bg)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--analytics-success)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500
                        }}>
                            <span style={{ fontSize: 'var(--font-size-base)' }}>✅</span>
                            No issues detected
                        </div>
                    )}
                </div>

                {/* Quick Filters */}
                <div style={{ minWidth: 200 }}>
                    <h5 style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 600,
                        color: 'var(--analytics-text-primary)',
                        margin: '0 0 var(--space-3) 0'
                    }}>
                        🔎 Quick Filters
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <button
                            className="analytics-btn analytics-btn-secondary"
                            onClick={onFilterLowMatches}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            Show Low Matches Only
                        </button>
                        <button
                            className="analytics-btn analytics-btn-secondary"
                            onClick={onFilterMissingOutcomes}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            Show Missing TUM Outcomes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
