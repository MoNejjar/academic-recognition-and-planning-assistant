/**
 * Analytics Skeleton Loader
 * 
 * Displays loading skeleton while analytics data is being fetched.
 * Rule 37: Skeleton loaders beat spinners.
 */


import './analytics.css';

export default function AnalyticsSkeleton() {
    return (
        <div className="analytics-container">
            <div className="analytics-content">
                {/* Header Skeleton */}
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="analytics-skeleton analytics-skeleton-title" style={{ width: '40%' }} />
                    <div className="analytics-skeleton analytics-skeleton-text" style={{ width: '60%' }} />
                </div>

                {/* Summary Card Skeleton */}
                <div className="analytics-card analytics-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                        <div
                            className="analytics-skeleton analytics-skeleton-circle"
                            style={{ width: 140, height: 140 }}
                        />
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div className="analytics-skeleton" style={{ width: '80%', height: 48, marginBottom: 'var(--space-4)' }} />
                            <div className="analytics-skeleton analytics-skeleton-text" style={{ width: '60%' }} />
                        </div>
                    </div>
                </div>

                {/* Metadata Skeleton */}
                <div className="analytics-card analytics-section">
                    <div className="analytics-skeleton analytics-skeleton-title" style={{ width: '30%' }} />
                    <div className="analytics-grid analytics-grid-2" style={{ marginTop: 'var(--space-4)' }}>
                        <div className="analytics-skeleton" style={{ height: 120 }} />
                        <div className="analytics-skeleton" style={{ height: 120 }} />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="analytics-card analytics-section">
                    <div className="analytics-skeleton analytics-skeleton-title" style={{ width: '40%' }} />
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                                <div className="analytics-skeleton" style={{ width: 40, height: 20 }} />
                                <div className="analytics-skeleton" style={{ flex: 2, height: 20 }} />
                                <div className="analytics-skeleton" style={{ flex: 2, height: 20 }} />
                                <div className="analytics-skeleton" style={{ width: 80, height: 20 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coverage Skeleton */}
                <div className="analytics-card analytics-section">
                    <div className="analytics-skeleton analytics-skeleton-title" style={{ width: '35%' }} />
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ marginBottom: 'var(--space-4)' }}>
                                <div className="analytics-skeleton analytics-skeleton-text" style={{ width: '30%' }} />
                                <div className="analytics-skeleton" style={{ height: 8, marginTop: 'var(--space-2)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
