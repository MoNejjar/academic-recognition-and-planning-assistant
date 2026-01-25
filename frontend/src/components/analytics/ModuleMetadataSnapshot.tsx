/**
 * Module Metadata Snapshot Component
 * 
 * Side-by-side comparison of external course and TUM module metadata.
 * Follows 50 Golden Rules: dark mode, 8-point spacing, responsive design.
 */


import './analytics.css';

interface ModuleMetadataSnapshotProps {
    // External
    externalName: string;
    externalUniversity?: string;
    externalCredits: string;
    // TUM
    tumModuleNr: string;
    tumModuleTitle: string;
    tumEcts: string;
}

export default function ModuleMetadataSnapshot({
    externalName,
    externalUniversity,
    externalCredits,
    tumModuleNr,
    tumModuleTitle,
    tumEcts,
}: ModuleMetadataSnapshotProps) {
    return (
        <div className="analytics-card">
            <h4 className="analytics-card-title">📄 Module Comparison</h4>

            <div className="analytics-mobile-stack" style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 'var(--space-4)'
            }}>
                {/* External Column */}
                <div style={{
                    flex: 1,
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                }}>
                    <div style={{
                        marginBottom: 'var(--space-3)',
                        paddingBottom: 'var(--space-3)',
                        borderBottom: '1px solid var(--analytics-border)'
                    }}>
                        <span className="analytics-badge" style={{
                            background: 'var(--analytics-accent)',
                            color: 'white',
                            padding: 'var(--space-2) var(--space-3)',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            External
                        </span>
                    </div>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--analytics-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 'var(--space-1)'
                        }}>
                            Name
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-primary)',
                            fontWeight: 500
                        }}>
                            {externalName}
                        </span>
                    </div>
                    {externalUniversity && (
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <span style={{
                                display: 'block',
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--analytics-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                marginBottom: 'var(--space-1)'
                            }}>
                                University
                            </span>
                            <span style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--analytics-text-primary)',
                                fontWeight: 500
                            }}>
                                {externalUniversity}
                            </span>
                        </div>
                    )}
                    <div>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--analytics-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 'var(--space-1)'
                        }}>
                            Credits
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-primary)',
                            fontWeight: 500
                        }}>
                            {externalCredits} ECTS
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 'var(--font-size-2xl)',
                    color: 'var(--analytics-text-muted)',
                    padding: '0 var(--space-2)'
                }}>
                    ↔
                </div>

                {/* TUM Column */}
                <div style={{
                    flex: 1,
                    background: 'var(--analytics-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                }}>
                    <div style={{
                        marginBottom: 'var(--space-3)',
                        paddingBottom: 'var(--space-3)',
                        borderBottom: '1px solid var(--analytics-border)'
                    }}>
                        <span className="analytics-badge" style={{
                            background: 'var(--analytics-info)',
                            color: 'white',
                            padding: 'var(--space-2) var(--space-3)',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            TUM
                        </span>
                    </div>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--analytics-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 'var(--space-1)'
                        }}>
                            Module
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-primary)',
                            fontWeight: 500
                        }}>
                            {tumModuleNr}
                        </span>
                    </div>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--analytics-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 'var(--space-1)'
                        }}>
                            Title
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-primary)',
                            fontWeight: 500
                        }}>
                            {tumModuleTitle}
                        </span>
                    </div>
                    <div>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--analytics-text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 'var(--space-1)'
                        }}>
                            Credits
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--analytics-text-primary)',
                            fontWeight: 500
                        }}>
                            {tumEcts} ECTS
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
