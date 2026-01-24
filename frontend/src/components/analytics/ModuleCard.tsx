
import { useState } from 'react';
import {
    BarChart3,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    BookOpen,
    GraduationCap,
    Sparkles,
    Lightbulb,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

import { ModuleAnalysisResult } from '../../types/analyticsTypes';
import { TUM_COLORS } from '../../styles/tumStyles';
import { ScoreDisplay, DecisionBadge, ExplanationTooltip, STATUS_COLORS } from './AnalyticsCommon';

// Custom sharp/modern tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                minWidth: 160,
                color: TUM_COLORS.gray80
            }}>
                {label && <div style={{ fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>{label}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: entry.color || entry.fill || entry.payload.fill }}></div>
                                <span style={{ color: TUM_COLORS.gray80 }}>{entry.name}</span>
                            </div>
                            <span style={{ fontWeight: 600, color: TUM_COLORS.gray80 }}>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function ModuleCard({ result, defaultExpanded = false }: { result: ModuleAnalysisResult, defaultExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const bloomData = result.depthAnalysis.slice(0, 6).map((d) => ({
        name: `LO ${d.externalLoIndex}`,
        external: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].indexOf(d.externalBloomLevel) + 1,
        tum: d.tumBloomLevel ? ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].indexOf(d.tumBloomLevel) + 1 : 0,
    }));

    return (
        <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CCCCCC',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
            {/* Header */}
            <div style={{ padding: 24, borderBottom: '1px solid #CCCCCC' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                    <ScoreDisplay score={result.overallScore} />

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: TUM_COLORS.blue,
                                color: '#FFFFFF',
                                fontSize: 12,
                                fontFamily: 'monospace',
                                borderRadius: 4,
                            }}>
                                {result.tumModuleNr}
                            </span>
                            <DecisionBadge hint={result.decisionHint} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 4 }}>
                            {result.tumModuleTitle}
                        </h3>
                        <p style={{ fontSize: 14, color: TUM_COLORS.gray50, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GraduationCap size={16} />
                            {result.tumEcts} ECTS • {result.sourceSummary}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, borderBottom: '1px solid #CCCCCC' }}>
                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        Coverage
                        <ExplanationTooltip text="Percentage of TUM learning outcomes satisfied by your source modules." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${result.coverageMetrics.tumOutcomesCoveredPercent}%`, backgroundColor: STATUS_COLORS.success, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                            {Math.round(result.coverageMetrics.tumOutcomesCoveredPercent)}%
                        </span>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        Confidence
                        <ExplanationTooltip text="AI's certainty level based on the richness of provided course data." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${result.confidence.overallConfidence * 100}%`, backgroundColor: TUM_COLORS.blue, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                            {Math.round(result.confidence.overallConfidence * 100)}%
                        </span>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        LO Matches
                        <ExplanationTooltip text="Number of specific learning outcomes matched out of the total required." />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                        {result.coverageMetrics.coveredCount} / {result.coverageMetrics.totalTumOutcomes}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        Input Quality
                        <ExplanationTooltip text="Assessment of how detailed the source course descriptions are." />
                    </div>
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        backgroundColor: result.confidence.inputQuality === 'rich' ? '#dcfce7' : result.confidence.inputQuality === 'adequate' ? '#fef3c7' : '#fee2e2',
                        color: result.confidence.inputQuality === 'rich' ? '#166534' : result.confidence.inputQuality === 'adequate' ? '#92400e' : '#991b1b',
                    }}>
                        {result.confidence.inputQuality}
                    </span>
                </div>
            </div>

            {/* Explanation */}
            <div style={{ padding: 24, borderBottom: '1px solid #CCCCCC' }}>
                <div style={{
                    backgroundColor: 'rgba(152, 198, 234, 0.2)',
                    border: '1px solid rgba(100, 160, 200, 0.5)',
                    borderRadius: 8,
                    padding: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TUM_COLORS.blue, fontWeight: 500, marginBottom: 8 }}>
                        <Lightbulb size={16} />
                        Why This Score?
                    </div>
                    <p style={{ fontSize: 14, color: TUM_COLORS.gray80, lineHeight: 1.6, margin: 0 }}>
                        {result.explanation}
                    </p>
                </div>
            </div>

            {/* Strengths & Gaps */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, borderBottom: '1px solid #CCCCCC' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: STATUS_COLORS.success, fontWeight: 500, marginBottom: 12 }}>
                        <CheckCircle2 size={16} />
                        Key Strengths
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {result.keyStrengths.slice(0, 3).map((s, i) => (
                            <li key={i} style={{ fontSize: 14, color: TUM_COLORS.gray80, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ color: STATUS_COLORS.success }}>•</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: STATUS_COLORS.error, fontWeight: 500, marginBottom: 12 }}>
                        <XCircle size={16} />
                        Key Gaps
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {result.keyGaps.slice(0, 3).map((g, i) => (
                            <li key={i} style={{ fontSize: 14, color: TUM_COLORS.gray80, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ color: STATUS_COLORS.error }}>•</span>
                                {g}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
                <div style={{ padding: 24, borderBottom: '1px solid #CCCCCC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: STATUS_COLORS.warning, fontWeight: 500, marginBottom: 12 }}>
                        <AlertTriangle size={16} />
                        Detected Issues
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {result.flags.map((flag, i) => (
                            <span key={i} style={{
                                display: 'inline-flex',
                                type: 'button',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 500,
                                backgroundColor: flag.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                                color: flag.severity === 'critical' ? '#991b1b' : '#92400e',
                            }}>
                                {flag.message}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Expand/Collapse */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    color: TUM_COLORS.blue,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                }}
            >
                {expanded ? (
                    <>
                        <ChevronUp size={16} />
                        Hide Details
                    </>
                ) : (
                    <>
                        <ChevronDown size={16} />
                        Show Learning Outcomes & Depth Analysis
                    </>
                )}
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div style={{ borderTop: '1px solid #CCCCCC' }}>
                    {/* Learning Outcomes */}
                    <div style={{ padding: 24, borderBottom: '1px solid #CCCCCC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TUM_COLORS.gray80, fontWeight: 500, marginBottom: 16 }}>
                            <BookOpen size={16} />
                            Learning Outcome Mappings
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F5F5F5' }}>
                                        <th style={{ textAlign: 'left', padding: 12, fontWeight: 500, color: TUM_COLORS.gray80 }}>External LO</th>
                                        <th style={{ textAlign: 'left', padding: 12, fontWeight: 500, color: TUM_COLORS.gray80 }}>TUM LO</th>
                                        <th style={{ textAlign: 'center', padding: 12, fontWeight: 500, color: TUM_COLORS.gray80 }}>Match</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.learningOutcomeMatches.slice(0, 5).map((match, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #CCCCCC' }}>
                                            <td style={{ padding: 12, color: TUM_COLORS.gray80 }}>
                                                {match.externalLo.length > 60 ? match.externalLo.slice(0, 60) + '...' : match.externalLo}
                                            </td>
                                            <td style={{ padding: 12, color: TUM_COLORS.gray80 }}>
                                                {match.tumLo ? (match.tumLo.length > 60 ? match.tumLo.slice(0, 60) + '...' : match.tumLo) : '—'}
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    backgroundColor: match.matchLevel === 'high' ? '#dcfce7' : match.matchLevel === 'medium' ? '#fef3c7' : match.matchLevel === 'low' ? '#f3f4f6' : '#fee2e2',
                                                    color: match.matchLevel === 'high' ? '#166534' : match.matchLevel === 'medium' ? '#92400e' : match.matchLevel === 'low' ? '#374151' : '#991b1b',
                                                }}>
                                                    {match.matchLevel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bloom's Taxonomy */}
                    {bloomData.length > 0 && (
                        <div style={{ padding: 24, borderBottom: '1px solid #CCCCCC' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TUM_COLORS.gray80, fontWeight: 500, marginBottom: 16 }}>
                                <BarChart3 size={16} />
                                Bloom's Taxonomy Depth Comparison
                            </div>
                            <div style={{ height: 200, backgroundColor: '#F9F9F9', borderRadius: 8, padding: 16 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bloomData} layout="vertical">
                                        <XAxis type="number" domain={[0, 6]} tick={{ fill: TUM_COLORS.gray50 }} />
                                        <YAxis type="category" dataKey="name" width={50} tick={{ fill: TUM_COLORS.gray50 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="external" name="External" fill={TUM_COLORS.lightBlue2} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="tum" name="TUM" fill={TUM_COLORS.blue} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: TUM_COLORS.gray50 }}>
                                Scale: 1=Remember, 2=Understand, 3=Apply, 4=Analyze, 5=Evaluate, 6=Create
                            </div>
                        </div>
                    )}

                    {/* Recognition Suggestions */}
                    {result.recognitionSuggestions.length > 0 && (
                        <div style={{ padding: 24 }}>
                            <div style={{
                                backgroundColor: 'rgba(227, 114, 34, 0.1)',
                                border: '1px solid rgba(227, 114, 34, 0.3)',
                                borderRadius: 8,
                                padding: 16,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TUM_COLORS.orange, fontWeight: 500, marginBottom: 12 }}>
                                    <Sparkles size={16} />
                                    Recognition Suggestions
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                    {result.recognitionSuggestions.map((s, i) => (
                                        <li key={i} style={{ fontSize: 14, color: TUM_COLORS.gray80, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <span style={{ color: TUM_COLORS.orange }}>→</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
