
import { useState } from 'react';
import { Columns, EyeOff, Eye } from 'lucide-react';
import { LearningOutcomeMatch } from '../../types/analyticsTypes';

const TUM_COLORS = {
    gray80: '#333333',
    blue: '#0065BD',
};

interface Props {
    matches: LearningOutcomeMatch[];
}

export default function ContentDiffViewer({ matches }: Props) {
    const [showOnlyMismatches, setShowOnlyMismatches] = useState(false);

    const filteredMatches = showOnlyMismatches
        ? matches.filter(m => m.matchLevel !== 'high')
        : matches;

    return (
        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            {/* Header with Filter */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Columns size={18} />
                    Side-by-Side Content Comparison
                </div>
                <button
                    onClick={() => setShowOnlyMismatches(!showOnlyMismatches)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        backgroundColor: showOnlyMismatches ? '#DBEAFE' : 'white',
                        border: '1px solid #D1D5DB',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        color: showOnlyMismatches ? '#1E40AF' : '#374151',
                        cursor: 'pointer'
                    }}
                >
                    {showOnlyMismatches ? <Eye size={14} /> : <EyeOff size={14} />}
                    {showOnlyMismatches ? 'Showing Mismatches Only' : 'Filter: Show Mismatches Only'}
                </button>
            </div>

            {/* Diff Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #E5E7EB', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <div style={{ padding: '12px 20px', borderRight: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>Source Content</div>
                <div style={{ padding: '12px 20px', backgroundColor: '#F9FAFB' }}>TUM Requirements</div>
            </div>

            {/* Content */}
            <div>
                {filteredMatches.map((match, i) => {
                    // Determine colors based on match level
                    let bg = '#FFFFFF';
                    let tumBg = '#FFFFFF';
                    let badgeColor = '#9CA3AF';

                    if (match.matchLevel === 'high') {
                        bg = '#F0FDF4'; // lighter green
                        tumBg = '#DCFCE7'; // light green
                        badgeColor = '#16A34A';
                    } else if (match.matchLevel === 'medium') {
                        bg = '#FFFBEB'; // darker yellow/orange
                        tumBg = '#FEF3C7';
                        badgeColor = '#D97706';
                    } else {
                        bg = '#FEF2F2'; // light red
                        tumBg = '#FEE2E2';
                        badgeColor = '#DC2626';
                    }

                    return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #E5E7EB' }}>
                            {/* Source Side */}
                            <div style={{ padding: 16, borderRight: '1px solid #E5E7EB', backgroundColor: bg, fontSize: 13, color: TUM_COLORS.gray80, lineHeight: 1.5 }}>
                                {match.externalLo}
                            </div>

                            {/* TUM Side */}
                            <div style={{ padding: 16, backgroundColor: tumBg, position: 'relative' }}>
                                <div style={{ fontSize: 13, color: TUM_COLORS.gray80, lineHeight: 1.5 }}>
                                    {match.tumLo || "No direct equivalent found."}
                                </div>
                                <div style={{
                                    marginTop: 8,
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    backgroundColor: 'white',
                                    border: `1px solid ${badgeColor}`,
                                    color: badgeColor,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    {match.matchLevel} Match
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredMatches.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>
                        No items found matching the current filter.
                    </div>
                )}
            </div>
        </div>
    );
}
