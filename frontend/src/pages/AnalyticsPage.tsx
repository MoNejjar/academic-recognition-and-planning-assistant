/**
 * Analytics Page - TUM Corporate Design (Light Mode Only)
 * Following TUM brand guidelines
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    BookOpen,
    GraduationCap,
    Sparkles,
    Info,
    ArrowLeft,
    Lightbulb,
    Shield,
    HelpCircle
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

import { AnalyticsResponse, ModuleAnalysisResult } from '../types/analyticsTypes';
import { CourseMatchBadge } from '../components/common/StatusBadges';

interface Props {
    data: AnalyticsResponse | null;
    isLoading?: boolean;
}

// TUM Color palette
const TUM_COLORS = {
    blue: '#0065BD',
    blueDark: '#005293',
    blueDarker: '#003359',
    white: '#FFFFFF',
    black: '#000000',
    gray80: '#333333',
    gray50: '#808080',
    gray20: '#CCCCCC',
    grayLight: '#DAD7CB',
    orange: '#E37222',
    green: '#A2AD00',
    lightBlue1: '#98C6EA',
    lightBlue2: '#64A0C8',
};

// Status colors (kept consistent for severity)
const STATUS_COLORS = {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
};

const ExplanationTooltip = ({ text }: { text: string }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', marginLeft: 8, verticalAlign: 'middle' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <HelpCircle size={15} color={TUM_COLORS.gray50} style={{ cursor: 'help' }} />
            {visible && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 10,
                    padding: '8px 12px',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    fontSize: 12,
                    borderRadius: 4,
                    width: 220,
                    textAlign: 'center',
                    zIndex: 50,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    lineHeight: 1.4,
                    fontWeight: 400
                }}>
                    {text}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: -4,
                        borderWidth: 4,
                        borderStyle: 'solid',
                        borderColor: '#1f2937 transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

function ScoreDisplay({ score }: { score: number }) {
    const color = score >= 75 ? STATUS_COLORS.success : score >= 50 ? STATUS_COLORS.warning : STATUS_COLORS.error;

    return (
        <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 264} 264`}
                />
            </svg>
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>{Math.round(score)}%</span>
            </div>
        </div>
    );
}

function ModuleCard({ result }: { result: ModuleAnalysisResult }) {
    const [expanded, setExpanded] = useState(false);

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
                            <CourseMatchBadge decision={result.decisionHint} />
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

function LoadingSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ height: 128, backgroundColor: '#E5E7EB', borderRadius: 8, animation: 'pulse 2s infinite' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 96, backgroundColor: '#E5E7EB', borderRadius: 8 }} />)}
            </div>
            <div style={{ height: 256, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
        </div>
    );
}

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

export default function AnalyticsPage({ data, isLoading }: Props) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', padding: 32 }}>
                <div style={{ maxWidth: 1152, margin: '0 auto' }}>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', padding: 32 }}>
                <div style={{ maxWidth: 1152, margin: '0 auto' }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CCCCCC',
                        borderRadius: 8,
                        textAlign: 'center',
                        padding: '64px 32px',
                    }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto 16px',
                            borderRadius: '50%',
                            backgroundColor: '#F5F5F5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <BarChart3 size={32} color={TUM_COLORS.gray50} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>No Analytics Data</h2>
                        <p style={{ color: TUM_COLORS.gray50, maxWidth: 400, margin: '0 auto 24px' }}>
                            Complete the module mapping workflow and click "Preview Analytics" to see your analysis results.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                backgroundColor: TUM_COLORS.blue,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: 14,
                            }}
                        >
                            <ArrowLeft size={16} />
                            Back to Start
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const summaryData = [
        { name: 'Highly Equivalent', value: data.modulesHighlyEquivalent, fill: STATUS_COLORS.success },
        { name: 'Partial', value: data.modulesPartial, fill: STATUS_COLORS.warning },
        { name: 'Insufficient', value: data.modulesInsufficient, fill: STATUS_COLORS.error },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', padding: 32, fontFamily: "Arial, sans-serif" }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 4 }}>
                            Credit Recognition Analysis
                        </h1>
                        <p style={{ color: TUM_COLORS.gray50, margin: 0 }}>
                            AI-powered equivalence assessment • {data.llmModelUsed}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/review')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            border: `1px solid ${TUM_COLORS.blue}`,
                            color: TUM_COLORS.blue,
                            backgroundColor: 'transparent',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: 14,
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Review
                    </button>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14, color: TUM_COLORS.gray50, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                                    Average Score
                                    <ExplanationTooltip text="Overall equivalence score across all modules analyzed." />
                                </div>
                                <p style={{ fontSize: 28, fontWeight: 700, color: TUM_COLORS.blue, margin: 0 }}>
                                    {Math.round(data.averageScore)}%
                                </p>
                            </div>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(0, 101, 189, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={24} color={TUM_COLORS.blue} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14, color: TUM_COLORS.gray50, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                                    Highly Equivalent
                                    <ExplanationTooltip text="Modules with a high probability (>75%) of being recognized." />
                                </div>
                                <p style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLORS.success, margin: 0 }}>
                                    {data.modulesHighlyEquivalent}
                                </p>
                            </div>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle2 size={24} color={STATUS_COLORS.success} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14, color: TUM_COLORS.gray50, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                                    Partial Match
                                    <ExplanationTooltip text="Modules that may require additional documentation or workload comparison (50-75%)." />
                                </div>
                                <p style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLORS.warning, margin: 0 }}>
                                    {data.modulesPartial}
                                </p>
                            </div>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={24} color={STATUS_COLORS.warning} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14, color: TUM_COLORS.gray50, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                                    Insufficient
                                    <ExplanationTooltip text="Modules with low similarity or insufficient overlap with TUM curriculum." />
                                </div>
                                <p style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLORS.error, margin: 0 }}>
                                    {data.modulesInsufficient}
                                </p>
                            </div>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <XCircle size={24} color={STATUS_COLORS.error} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                        <BarChart3 size={20} />
                        Module Recognition Distribution
                        <ExplanationTooltip text="Visual breakdown of your modules categorized by likelihood of recognition." />
                    </h2>
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={summaryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={6}
                                    stroke="none"
                                >
                                    {summaryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span style={{ color: TUM_COLORS.gray80, fontSize: 13, fontWeight: 500 }}>{value}</span>}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Disclaimer */}
                <div style={{
                    backgroundColor: 'rgba(152, 198, 234, 0.2)',
                    border: '1px solid rgba(100, 160, 200, 0.5)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                }}>
                    <Info size={20} color={TUM_COLORS.blue} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                        <strong style={{ color: TUM_COLORS.blue }}>AI-Assisted Analysis:</strong>{' '}
                        These results are generated by an AI model and serve as recommendations only.
                        Final credit recognition decisions are made by TUM academic staff based on
                        official guidelines and individual case assessment.
                    </div>
                </div>

                {/* Module Results */}
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <GraduationCap size={20} />
                        Detailed Module Analysis
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data.moduleResults.map((result) => (
                            <ModuleCard key={result.tumModuleNr} result={result} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: TUM_COLORS.gray50 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={16} />
                            Analysis completed at {new Date(data.analysisTimestamp).toLocaleString()}
                        </div>
                        <div>
                            Model: {data.llmModelUsed}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
