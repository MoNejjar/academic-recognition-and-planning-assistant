/**
 * Modern Module Analysis Card
 * 
 * A redesigned, modular component for displaying module analysis results.
 * Features:
 * - Collapsible sections for organized information architecture
 * - Assessment Quality indicator (merged confidence + input quality)
 * - Simple coverage & match visualizations (replacing Bloom's taxonomy)
 * - Comprehensive tooltips throughout
 * - TUM brand colors and modern design
 */

import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    BookOpen,
    Target,
    Lightbulb,
    Sparkles,
    TrendingUp,
    Layers,
} from 'lucide-react';

import { ModuleAnalysisResult } from '../../types/analyticsTypes';
import { TUM_COLORS } from '../../styles/tumStyles';
import { 
    CollapsibleSection, 
    ScoreRing, 
    Badge, 
    MetricDisplay,
    AssessmentQuality,
    InfoTooltip,
} from '../common/SharedComponents';

// ============================================
// Decision Badge Component
// ============================================

function DecisionBadge({ hint }: { hint: string }) {
    const config = {
        highly_equivalent: { label: 'Highly Equivalent', variant: 'success' as const },
        partial: { label: 'Partial Match', variant: 'warning' as const },
        insufficient: { label: 'Insufficient', variant: 'error' as const },
    };
    
    const { label, variant } = config[hint as keyof typeof config] || config.insufficient;
    return <Badge label={label} variant={variant} />;
}

// ============================================
// Coverage Visualization
// ============================================

interface CoverageVizProps {
    covered: number;
    total: number;
    label: string;
    tooltip?: string;
}

function CoverageVisualization({ covered, total, label, tooltip }: CoverageVizProps) {
    const percent = total > 0 ? Math.round((covered / total) * 100) : 0;
    
    return (
        <div style={{
            padding: 20,
            backgroundColor: '#FAFAFA',
            borderRadius: 8,
            textAlign: 'center',
        }}>
            <div style={{ 
                fontSize: 11, 
                color: TUM_COLORS.gray50, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {label}
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            
            {/* Visual representation */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 4, 
                marginBottom: 12,
                flexWrap: 'wrap',
            }}>
                {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            backgroundColor: i < covered ? '#22c55e' : '#E5E7EB',
                            transition: 'background-color 0.2s',
                        }}
                    />
                ))}
                {total > 12 && (
                    <span style={{ fontSize: 11, color: TUM_COLORS.gray50, alignSelf: 'center' }}>
                        +{total - 12}
                    </span>
                )}
            </div>
            
            <div style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80 }}>
                {covered}<span style={{ fontSize: 14, color: TUM_COLORS.gray50 }}>/{total}</span>
            </div>
            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginTop: 4 }}>
                {percent}% covered
            </div>
        </div>
    );
}

// ============================================
// Match Quality Distribution
// ============================================

interface MatchDistributionProps {
    matches: { matchLevel: string }[];
}

function MatchDistribution({ matches }: MatchDistributionProps) {
    const counts = {
        high: matches.filter(m => m.matchLevel === 'high').length,
        medium: matches.filter(m => m.matchLevel === 'medium').length,
        low: matches.filter(m => m.matchLevel === 'low').length,
        none: matches.filter(m => m.matchLevel === 'none').length,
    };
    const total = matches.length || 1;

    const bars = [
        { label: 'Strong', count: counts.high, color: '#22c55e' },
        { label: 'Moderate', count: counts.medium, color: '#f59e0b' },
        { label: 'Weak', count: counts.low, color: '#9ca3af' },
        { label: 'None', count: counts.none, color: '#ef4444' },
    ];

    return (
        <div>
            <div style={{ 
                fontSize: 11, 
                color: TUM_COLORS.gray50, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
            }}>
                Match Quality Distribution
                <InfoTooltip text="Shows how strongly your source courses align with TUM learning outcomes. More green = better alignment." />
            </div>
            
            {/* Stacked bar */}
            <div style={{ 
                display: 'flex', 
                height: 24, 
                borderRadius: 4, 
                overflow: 'hidden',
                marginBottom: 12,
            }}>
                {bars.map((bar, i) => (
                    bar.count > 0 && (
                        <div
                            key={i}
                            style={{
                                width: `${(bar.count / total) * 100}%`,
                                backgroundColor: bar.color,
                                transition: 'width 0.3s',
                            }}
                        />
                    )
                ))}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {bars.map((bar, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: 2, 
                            backgroundColor: bar.color 
                        }} />
                        <span style={{ fontSize: 12, color: TUM_COLORS.gray50 }}>
                            {bar.label}: {bar.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Main ModuleCardModern Component
// ============================================

interface ModuleCardModernProps {
    result: ModuleAnalysisResult;
}

export default function ModuleCardModern({ result }: ModuleCardModernProps) {

    return (
        <div style={{
            backgroundColor: TUM_COLORS.white,
            border: `1px solid ${TUM_COLORS.gray20}`,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
            {/* Header - Always Visible */}
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 24 }}>
                    {/* Score Ring */}
                    <ScoreRing score={result.overallScore} size={80} />
                    
                    {/* Module Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{
                                padding: '4px 10px',
                                backgroundColor: TUM_COLORS.blue,
                                color: TUM_COLORS.white,
                                fontSize: 12,
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                borderRadius: 4,
                            }}>
                                {result.tumModuleNr}
                            </span>
                            <DecisionBadge hint={result.decisionHint} />
                        </div>
                        
                        <h3 style={{ 
                            fontSize: 18, 
                            fontWeight: 700, 
                            color: TUM_COLORS.gray80, 
                            margin: '0 0 8px 0',
                            lineHeight: 1.3,
                        }}>
                            {result.tumModuleTitle}
                        </h3>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 16, 
                            fontSize: 14, 
                            color: TUM_COLORS.gray50,
                            flexWrap: 'wrap',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Target size={14} />
                                {result.tumEcts} ECTS
                            </span>
                            <span>•</span>
                            <span>{result.sourceSummary}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Metrics Row */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 20,
                    marginTop: 24,
                    padding: 20,
                    backgroundColor: '#FAFAFA',
                    borderRadius: 8,
                }}>
                    <MetricDisplay
                        label="Coverage"
                        tooltip="What percentage of TUM module requirements are satisfied by your source courses"
                        value={`${Math.round(result.coverageMetrics.tumOutcomesCoveredPercent)}%`}
                        showBar
                        barPercent={result.coverageMetrics.tumOutcomesCoveredPercent}
                        barColor="#22c55e"
                    />
                    <MetricDisplay
                        label="Outcomes Matched"
                        tooltip="Number of TUM learning outcomes that have corresponding coverage from your courses"
                        value={`${result.coverageMetrics.coveredCount}/${result.coverageMetrics.totalTumOutcomes}`}
                    />
                    <MetricDisplay
                        label="Source Courses"
                        tooltip="Number of courses from your previous university mapped to this TUM module"
                        value={result.sourceSummary.split(',').length.toString()}
                        subValue="courses"
                    />
                </div>
            </div>

            {/* Flags Banner (if any) */}
            {result.flags.length > 0 && (
                <div style={{
                    padding: '12px 24px',
                    backgroundColor: result.flags.some(f => f.severity === 'critical') ? '#FEE2E2' : '#FEF3C7',
                    borderTop: `1px solid ${result.flags.some(f => f.severity === 'critical') ? '#FECACA' : '#FDE68A'}`,
                    borderBottom: `1px solid ${result.flags.some(f => f.severity === 'critical') ? '#FECACA' : '#FDE68A'}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <AlertTriangle size={16} color={result.flags.some(f => f.severity === 'critical') ? '#DC2626' : '#D97706'} />
                        <span style={{ 
                            fontSize: 13, 
                            fontWeight: 500, 
                            color: result.flags.some(f => f.severity === 'critical') ? '#991B1B' : '#92400E',
                        }}>
                            Attention Required:
                        </span>
                        {result.flags.map((flag, i) => (
                            <span key={i} style={{
                                fontSize: 12,
                                padding: '2px 8px',
                                backgroundColor: flag.severity === 'critical' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                                borderRadius: 4,
                                color: flag.severity === 'critical' ? '#DC2626' : '#D97706',
                            }}>
                                {flag.message}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Collapsible Sections */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Explanation Section */}
                <CollapsibleSection
                    title="Analysis Overview"
                    tooltip="AI-generated explanation of how this score was determined"
                    icon={<Lightbulb size={16} />}
                    defaultExpanded={true}
                    accentColor={TUM_COLORS.blue}
                >
                    <div style={{
                        backgroundColor: 'rgba(0, 101, 189, 0.05)',
                        border: '1px solid rgba(0, 101, 189, 0.15)',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 20,
                    }}>
                        <p style={{ 
                            fontSize: 14, 
                            color: TUM_COLORS.gray80, 
                            lineHeight: 1.7, 
                            margin: 0,
                        }}>
                            {result.explanation}
                        </p>
                    </div>

                    {/* Strengths & Gaps */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 8, 
                                color: '#22c55e', 
                                fontWeight: 600, 
                                marginBottom: 12,
                                fontSize: 13,
                            }}>
                                <CheckCircle2 size={16} />
                                Key Strengths
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {result.keyStrengths.slice(0, 4).map((s, i) => (
                                    <li key={i} style={{ 
                                        fontSize: 13, 
                                        color: TUM_COLORS.gray80, 
                                        marginBottom: 8,
                                        paddingLeft: 16,
                                        position: 'relative',
                                    }}>
                                        <span style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            color: '#22c55e',
                                        }}>✓</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 8, 
                                color: '#ef4444', 
                                fontWeight: 600, 
                                marginBottom: 12,
                                fontSize: 13,
                            }}>
                                <XCircle size={16} />
                                Key Gaps
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {result.keyGaps.slice(0, 4).map((g, i) => (
                                    <li key={i} style={{ 
                                        fontSize: 13, 
                                        color: TUM_COLORS.gray80, 
                                        marginBottom: 8,
                                        paddingLeft: 16,
                                        position: 'relative',
                                    }}>
                                        <span style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            color: '#ef4444',
                                        }}>✗</span>
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Assessment Quality Section */}
                <CollapsibleSection
                    title="Assessment Quality"
                    tooltip="Indicates how reliable this analysis is based on the AI confidence and quality of input data"
                    icon={<TrendingUp size={16} />}
                    defaultExpanded={false}
                    accentColor={TUM_COLORS.green}
                >
                    <AssessmentQuality
                        confidence={result.confidence.overallConfidence}
                        inputQuality={result.confidence.inputQuality}
                        uncertaintyAreas={result.confidence.uncertaintyAreas}
                    />
                    
                    {result.confidence.llmReasoningNotes && (
                        <div style={{ 
                            marginTop: 16, 
                            padding: 12, 
                            backgroundColor: '#F9FAFB',
                            borderRadius: 6,
                            fontSize: 13,
                            color: TUM_COLORS.gray50,
                            fontStyle: 'italic',
                        }}>
                            <strong>AI Note:</strong> {result.confidence.llmReasoningNotes}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Learning Outcomes Section */}
                <CollapsibleSection
                    title="Learning Outcome Details"
                    tooltip="Detailed breakdown of how each learning outcome from your courses maps to TUM requirements"
                    icon={<BookOpen size={16} />}
                    defaultExpanded={false}
                    accentColor={TUM_COLORS.orange}
                >
                    {/* Visual Summary */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 20,
                        marginBottom: 24,
                    }}>
                        <CoverageVisualization
                            covered={result.coverageMetrics.coveredCount}
                            total={result.coverageMetrics.totalTumOutcomes}
                            label="TUM Outcomes Coverage"
                            tooltip="Each square represents one TUM learning outcome. Green = covered by your courses."
                        />
                        <div style={{ padding: 20, backgroundColor: '#FAFAFA', borderRadius: 8 }}>
                            <MatchDistribution matches={result.learningOutcomeMatches} />
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ 
                            width: '100%', 
                            fontSize: 13, 
                            borderCollapse: 'collapse',
                            border: `1px solid ${TUM_COLORS.gray20}`,
                            borderRadius: 8,
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F9FAFB' }}>
                                    <th style={{ 
                                        textAlign: 'left', 
                                        padding: '12px 16px', 
                                        fontWeight: 600, 
                                        color: TUM_COLORS.gray80,
                                        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                    }}>
                                        Your Course Outcome
                                    </th>
                                    <th style={{ 
                                        textAlign: 'left', 
                                        padding: '12px 16px', 
                                        fontWeight: 600, 
                                        color: TUM_COLORS.gray80,
                                        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                    }}>
                                        TUM Requirement
                                    </th>
                                    <th style={{ 
                                        textAlign: 'center', 
                                        padding: '12px 16px', 
                                        fontWeight: 600, 
                                        color: TUM_COLORS.gray80,
                                        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                        width: 100,
                                    }}>
                                        Match
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.learningOutcomeMatches.slice(0, 8).map((match, i) => (
                                    <tr key={i} style={{ 
                                        backgroundColor: i % 2 === 0 ? TUM_COLORS.white : '#FAFAFA',
                                    }}>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            color: TUM_COLORS.gray80,
                                            borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                            maxWidth: 300,
                                        }}>
                                            {match.externalLo.length > 80 
                                                ? match.externalLo.slice(0, 80) + '...' 
                                                : match.externalLo}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            color: TUM_COLORS.gray80,
                                            borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                            maxWidth: 300,
                                        }}>
                                            {match.tumLo 
                                                ? (match.tumLo.length > 80 ? match.tumLo.slice(0, 80) + '...' : match.tumLo)
                                                : <span style={{ color: TUM_COLORS.gray50 }}>—</span>}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            textAlign: 'center',
                                            borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                                        }}>
                                            <Badge 
                                                label={match.matchLevel} 
                                                variant={
                                                    match.matchLevel === 'high' ? 'success' :
                                                    match.matchLevel === 'medium' ? 'warning' :
                                                    match.matchLevel === 'low' ? 'neutral' : 'error'
                                                }
                                                size="sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {result.learningOutcomeMatches.length > 8 && (
                            <p style={{ 
                                fontSize: 12, 
                                color: TUM_COLORS.gray50, 
                                textAlign: 'center',
                                marginTop: 12,
                            }}>
                                Showing 8 of {result.learningOutcomeMatches.length} matches
                            </p>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Recognition Suggestions */}
                {result.recognitionSuggestions.length > 0 && (
                    <CollapsibleSection
                        title="Recognition Suggestions"
                        tooltip="AI-generated recommendations to help with the recognition decision"
                        icon={<Sparkles size={16} />}
                        defaultExpanded={false}
                        accentColor={TUM_COLORS.orange}
                    >
                        <div style={{
                            backgroundColor: 'rgba(227, 114, 34, 0.08)',
                            border: '1px solid rgba(227, 114, 34, 0.2)',
                            borderRadius: 8,
                            padding: 16,
                        }}>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {result.recognitionSuggestions.map((s, i) => (
                                    <li key={i} style={{ 
                                        fontSize: 14, 
                                        color: TUM_COLORS.gray80, 
                                        marginBottom: i < result.recognitionSuggestions.length - 1 ? 12 : 0,
                                        paddingLeft: 20,
                                        position: 'relative',
                                        lineHeight: 1.5,
                                    }}>
                                        <span style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            color: TUM_COLORS.orange,
                                        }}>→</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {result.ambiguityNotes.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ 
                                    fontSize: 12, 
                                    color: TUM_COLORS.gray50,
                                    marginBottom: 8,
                                    fontWeight: 500,
                                }}>
                                    Points to Consider:
                                </div>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: 20,
                                    fontSize: 13,
                                    color: TUM_COLORS.gray50,
                                }}>
                                    {result.ambiguityNotes.map((note, i) => (
                                        <li key={i} style={{ marginBottom: 4 }}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CollapsibleSection>
                )}

                {/* Detailed Reasoning (Professor Deep-Dive) */}
                {result.detailedReasoning && (
                    <CollapsibleSection
                        title="Detailed Technical Analysis"
                        tooltip="In-depth technical analysis for professors reviewing this recognition request"
                        icon={<Layers size={16} />}
                        defaultExpanded={false}
                        accentColor={TUM_COLORS.blueDark}
                    >
                        <div style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray80,
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                        }}>
                            {result.detailedReasoning}
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
