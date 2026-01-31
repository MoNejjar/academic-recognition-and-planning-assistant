/**
 * Analytics Types for Credit Recognition Analysis
 * 
 * TypeScript interfaces matching the backend Pydantic models.
 */

// ============================================
// Enums
// ============================================

export type MatchLevel = 'high' | 'medium' | 'low' | 'none';

export type BloomLevel =
    | 'remember'
    | 'understand'
    | 'apply'
    | 'analyze'
    | 'evaluate'
    | 'create';

export type DecisionHint = 'highly_equivalent' | 'partial' | 'insufficient';

export type FlagType =
    | 'credit_mismatch'
    | 'missing_mandatory_lo'
    | 'level_mismatch'
    | 'language_mismatch'
    | 'low_confidence'
    | 'depth_gap';

// ============================================
// Learning Outcome Analysis
// ============================================

export interface LearningOutcomeMatch {
    externalLo: string;
    externalLoIndex: number;
    tumLo: string | null;
    tumLoIndex: number | null;
    matchLevel: MatchLevel;
    explanation: string;
    confidence: number;
}

export interface TUMOutcomeCoverage {
    tumLo: string;
    tumLoIndex: number;
    isCovered: boolean;
    coveredBy: number[];
    coverageQuality: MatchLevel;
}

// ============================================
// Depth Analysis
// ============================================

export interface DepthComparison {
    externalLoIndex: number;
    tumLoIndex: number | null;
    externalBloomLevel: BloomLevel;
    tumBloomLevel: BloomLevel | null;
    depthGap: number;
    hasDepthGap: boolean;
    note: string | null;
}

export interface ContentGranularity {
    theoreticalBalance: number;
    mathematicalRigor: number;
    hasLabComponent: boolean;
    hasProjectComponent: boolean;
    assessmentTypes: string[];
}

// ============================================
// Coverage Metrics
// ============================================

export interface CoverageMetrics {
    tumOutcomesCoveredPercent: number;
    tumOutcomesMissingPercent: number;
    externalOutcomesExcessPercent: number;
    totalTumOutcomes: number;
    totalExternalOutcomes: number;
    coveredCount: number;
    missingCount: number;
}

// ============================================
// Flags & Confidence
// ============================================

export interface AnalysisFlag {
    flagType: FlagType;
    severity: 'warning' | 'critical';
    message: string;
    details: string | null;
}

export interface ConfidenceIndicators {
    overallConfidence: number;
    inputQuality: 'poor' | 'adequate' | 'rich';
    uncertaintyAreas: string[];
    llmReasoningNotes: string | null;
}

// ============================================
// Module Analysis Result
// ============================================

export interface ModuleAnalysisResult {
    // Module identification
    tumModuleNr: string;
    tumModuleTitle: string;
    tumEcts: string;
    sourceSummary: string;

    // Primary metrics
    overallScore: number;
    decisionHint: DecisionHint;
    decisionHintText: string;

    // Learning outcome analysis
    learningOutcomeMatches: LearningOutcomeMatch[];
    tumOutcomeCoverage: TUMOutcomeCoverage[];
    coverageMetrics: CoverageMetrics;

    // Depth analysis
    depthAnalysis: DepthComparison[];
    contentGranularity: ContentGranularity | null;

    // Explainability
    explanation: string;
    keyStrengths: string[];
    keyGaps: string[];

    // Confidence & flags
    confidence: ConfidenceIndicators;
    flags: AnalysisFlag[];

    // Professor deep-dive
    detailedReasoning: string | null;
    ambiguityNotes: string[];
    recognitionSuggestions: string[];
}

// ============================================
// Analytics Response
// ============================================

export interface AnalyticsResponse {
    totalModulesAnalyzed: number;
    averageScore: number;
    modulesHighlyEquivalent: number;
    modulesPartial: number;
    modulesInsufficient: number;
    moduleResults: ModuleAnalysisResult[];
    analysisTimestamp: string;
    llmModelUsed: string | null;
}

// ============================================
// Helpers
// ============================================

export function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
}

export function getScoreBand(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

export function getMatchLevelColor(level: MatchLevel): string {
    switch (level) {
        case 'high': return '#22c55e';
        case 'medium': return '#eab308';
        case 'low': return '#f97316';
        case 'none': return '#ef4444';
        default: return '#6b7280';
    }
}

export function getMatchLevelEmoji(level: MatchLevel): string {
    switch (level) {
        case 'high': return '🟢';
        case 'medium': return '🟡';
        case 'low': return '🟠';
        case 'none': return '🔴';
        default: return '⚪';
    }
}

export function getDecisionHintEmoji(hint: DecisionHint): string {
    switch (hint) {
        case 'highly_equivalent': return '✅';
        case 'partial': return '⚠️';
        case 'insufficient': return '❌';
        default: return '❓';
    }
}

export function bloomLevelToNumber(level: BloomLevel): number {
    const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    return levels.indexOf(level) + 1;
}

