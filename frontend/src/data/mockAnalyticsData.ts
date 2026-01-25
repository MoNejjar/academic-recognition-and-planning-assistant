/**
 * Mock Analytics Data
 * 
 * Realistic dummy data for testing the analytics page without backend.
 */

import { AnalyticsResponse } from '../types/analyticsTypes';

export const mockAnalyticsData: AnalyticsResponse = {
    totalModulesAnalyzed: 3,
    averageScore: 74.3,
    modulesHighlyEquivalent: 1,
    modulesPartial: 2,
    modulesInsufficient: 0,
    analysisTimestamp: new Date().toISOString(),
    llmModelUsed: 'gpt-4o (Demo Mode)',
    moduleResults: [
        // Module 1: High equivalence
        {
            tumModuleNr: 'IN2001',
            tumModuleTitle: 'Algorithms and Data Structures',
            tumEcts: '8',
            sourceSummary: 'CS201 - Data Structures (Stanford), CS202 - Algorithm Design (Stanford)',
            overallScore: 85,
            decisionHint: 'highly_equivalent',
            decisionHintText: 'Highly equivalent – can likely be recognized',
            learningOutcomeMatches: [
                {
                    externalLo: 'Analyze time and space complexity of algorithms using Big-O notation',
                    externalLoIndex: 1,
                    tumLo: 'Students can analyze algorithmic complexity and determine asymptotic bounds',
                    tumLoIndex: 1,
                    matchLevel: 'high',
                    explanation: 'Both outcomes focus on algorithmic complexity analysis with formal notation.',
                    confidence: 0.92
                },
                {
                    externalLo: 'Design and implement fundamental data structures including linked lists, trees, graphs, and hash tables',
                    externalLoIndex: 2,
                    tumLo: 'Students can implement standard data structures and understand their tradeoffs',
                    tumLoIndex: 2,
                    matchLevel: 'high',
                    explanation: 'Direct alignment on data structure implementation skills.',
                    confidence: 0.88
                },
                {
                    externalLo: 'Apply divide-and-conquer and dynamic programming strategies to solve computational problems',
                    externalLoIndex: 3,
                    tumLo: 'Students master algorithmic paradigms including divide-and-conquer, greedy, and dynamic programming',
                    tumLoIndex: 3,
                    matchLevel: 'high',
                    explanation: 'Covers major algorithmic paradigms with high overlap.',
                    confidence: 0.85
                },
                {
                    externalLo: 'Implement graph traversal algorithms (BFS, DFS) and shortest path algorithms',
                    externalLoIndex: 4,
                    tumLo: 'Students can apply graph algorithms to solve practical problems',
                    tumLoIndex: 4,
                    matchLevel: 'medium',
                    explanation: 'TUM outcome is broader; external is more specific to traversal algorithms.',
                    confidence: 0.75
                }
            ],
            tumOutcomeCoverage: [],
            coverageMetrics: {
                tumOutcomesCoveredPercent: 87,
                tumOutcomesMissingPercent: 13,
                externalOutcomesExcessPercent: 5,
                totalTumOutcomes: 8,
                totalExternalOutcomes: 9,
                coveredCount: 7,
                missingCount: 1
            },
            depthAnalysis: [
                {
                    externalLoIndex: 1,
                    tumLoIndex: 1,
                    externalBloomLevel: 'analyze',
                    tumBloomLevel: 'analyze',
                    depthGap: 0,
                    hasDepthGap: false,
                    note: 'Both at the Analyze level – good alignment'
                },
                {
                    externalLoIndex: 3,
                    tumLoIndex: 3,
                    externalBloomLevel: 'apply',
                    tumBloomLevel: 'evaluate',
                    depthGap: -1,
                    hasDepthGap: true,
                    note: 'TUM requires deeper evaluation of paradigm selection'
                }
            ],
            contentGranularity: null,
            explanation: 'The external courses from Stanford provide comprehensive coverage of fundamental algorithms and data structures. The combined content from CS201 and CS202 addresses most TUM learning outcomes with strong conceptual alignment.',
            keyStrengths: [
                'Strong algorithm analysis skills demonstrated',
                'Comprehensive data structure implementation experience',
                'Good coverage of algorithmic paradigms'
            ],
            keyGaps: [
                'Missing explicit coverage of amortized analysis',
                'Less emphasis on formal proofs of correctness'
            ],
            confidence: {
                overallConfidence: 0.87,
                inputQuality: 'rich',
                uncertaintyAreas: ['Proof-based content assessment'],
                llmReasoningNotes: 'High confidence due to detailed syllabi provided'
            },
            flags: [],
            detailedReasoning: 'Stanford CS201 and CS202 together form a rigorous foundation in algorithms and data structures. The Stanford curriculum is well-regarded and closely mirrors the TUM approach to teaching these fundamentals. The main difference lies in TUM\'s stronger emphasis on formal correctness proofs, which is partially addressed but not as prominently featured in the Stanford courses.',
            ambiguityNotes: [
                'The Stanford syllabus mentions "basic proofs" but the depth is unclear'
            ],
            recognitionSuggestions: [
                'Consider full recognition with note about proof-based methods',
                'Student may benefit from supplementary material on formal verification'
            ]
        },
        // Module 2: Partial equivalence
        {
            tumModuleNr: 'IN2100',
            tumModuleTitle: 'Software Engineering',
            tumEcts: '6',
            sourceSummary: 'SE101 - Introduction to Software Engineering (MIT)',
            overallScore: 68,
            decisionHint: 'partial',
            decisionHintText: 'Partially equivalent – manual review recommended',
            learningOutcomeMatches: [
                {
                    externalLo: 'Apply software development methodologies including Agile and Waterfall',
                    externalLoIndex: 1,
                    tumLo: 'Students understand and can apply modern software development processes',
                    tumLoIndex: 1,
                    matchLevel: 'high',
                    explanation: 'Direct alignment on software development methodologies.',
                    confidence: 0.85
                },
                {
                    externalLo: 'Write unit tests and integration tests using industry-standard frameworks',
                    externalLoIndex: 2,
                    tumLo: 'Students can design and implement comprehensive test strategies',
                    tumLoIndex: 2,
                    matchLevel: 'medium',
                    explanation: 'External focuses on implementation; TUM emphasizes strategic design.',
                    confidence: 0.72
                },
                {
                    externalLo: 'Use version control systems (Git) effectively in team settings',
                    externalLoIndex: 3,
                    tumLo: null,
                    tumLoIndex: null,
                    matchLevel: 'none',
                    explanation: 'No direct TUM equivalent – covered as prerequisite knowledge.',
                    confidence: 0.65
                }
            ],
            tumOutcomeCoverage: [],
            coverageMetrics: {
                tumOutcomesCoveredPercent: 65,
                tumOutcomesMissingPercent: 35,
                externalOutcomesExcessPercent: 15,
                totalTumOutcomes: 6,
                totalExternalOutcomes: 5,
                coveredCount: 4,
                missingCount: 2
            },
            depthAnalysis: [
                {
                    externalLoIndex: 1,
                    tumLoIndex: 1,
                    externalBloomLevel: 'apply',
                    tumBloomLevel: 'apply',
                    depthGap: 0,
                    hasDepthGap: false,
                    note: null
                },
                {
                    externalLoIndex: 2,
                    tumLoIndex: 2,
                    externalBloomLevel: 'apply',
                    tumBloomLevel: 'create',
                    depthGap: -2,
                    hasDepthGap: true,
                    note: 'TUM expects students to design test strategies, not just implement'
                }
            ],
            contentGranularity: null,
            explanation: 'MIT SE101 covers foundational software engineering concepts but at a more introductory level than TUM IN2100. Key gaps exist in software architecture and advanced testing strategies.',
            keyStrengths: [
                'Solid foundation in development methodologies',
                'Practical team collaboration experience'
            ],
            keyGaps: [
                'Missing software architecture design patterns',
                'Limited coverage of requirements engineering',
                'No formal methods for software specification'
            ],
            confidence: {
                overallConfidence: 0.75,
                inputQuality: 'adequate',
                uncertaintyAreas: ['Architecture content depth', 'Project work scope'],
                llmReasoningNotes: 'Course description lacks detail on advanced topics'
            },
            flags: [
                {
                    flagType: 'missing_mandatory_lo',
                    severity: 'warning',
                    message: 'Missing coverage of software architecture',
                    details: 'TUM LO#4 (Design software architectures) not addressed'
                },
                {
                    flagType: 'credit_mismatch',
                    severity: 'warning',
                    message: 'Credit difference detected',
                    details: 'External: 4 credits, TUM: 6 ECTS'
                }
            ],
            detailedReasoning: 'The MIT introductory course provides a good starting point but does not reach the depth expected in TUM\'s software engineering module. The course focuses more on practical development skills rather than the theoretical underpinnings of software architecture and design patterns that TUM emphasizes.',
            ambiguityNotes: [
                'MIT course projects may cover architecture implicitly',
                'Unclear if design patterns are covered in practice sessions'
            ],
            recognitionSuggestions: [
                'Partial recognition recommended (4 of 6 ECTS)',
                'Student should take supplementary module on software architecture',
                'Consider practical project review for additional credits'
            ]
        },
        // Module 3: Lower partial
        {
            tumModuleNr: 'IN2020',
            tumModuleTitle: 'Database Systems',
            tumEcts: '6',
            sourceSummary: 'DB110 - Fundamentals of Databases (ETH Zürich)',
            overallScore: 72,
            decisionHint: 'partial',
            decisionHintText: 'Partially equivalent – manual review recommended',
            learningOutcomeMatches: [
                {
                    externalLo: 'Design relational database schemas using normalization principles up to 3NF',
                    externalLoIndex: 1,
                    tumLo: 'Students can design normalized database schemas (up to BCNF)',
                    tumLoIndex: 1,
                    matchLevel: 'medium',
                    explanation: 'External covers 3NF; TUM requires BCNF understanding.',
                    confidence: 0.78
                },
                {
                    externalLo: 'Write complex SQL queries including joins, subqueries, and aggregations',
                    externalLoIndex: 2,
                    tumLo: 'Students master SQL and relational algebra',
                    tumLoIndex: 2,
                    matchLevel: 'high',
                    explanation: 'Strong SQL skills demonstrated in both curricula.',
                    confidence: 0.88
                },
                {
                    externalLo: 'Understand transaction concepts including ACID properties',
                    externalLoIndex: 3,
                    tumLo: 'Students can analyze transaction processing and concurrency control',
                    tumLoIndex: 3,
                    matchLevel: 'medium',
                    explanation: 'External covers basics; TUM goes deeper into concurrency.',
                    confidence: 0.70
                }
            ],
            tumOutcomeCoverage: [],
            coverageMetrics: {
                tumOutcomesCoveredPercent: 75,
                tumOutcomesMissingPercent: 25,
                externalOutcomesExcessPercent: 0,
                totalTumOutcomes: 8,
                totalExternalOutcomes: 6,
                coveredCount: 6,
                missingCount: 2
            },
            depthAnalysis: [
                {
                    externalLoIndex: 1,
                    tumLoIndex: 1,
                    externalBloomLevel: 'apply',
                    tumBloomLevel: 'analyze',
                    depthGap: -1,
                    hasDepthGap: true,
                    note: 'TUM requires deeper analysis of normalization tradeoffs'
                },
                {
                    externalLoIndex: 2,
                    tumLoIndex: 2,
                    externalBloomLevel: 'apply',
                    tumBloomLevel: 'apply',
                    depthGap: 0,
                    hasDepthGap: false,
                    note: null
                }
            ],
            contentGranularity: null,
            explanation: 'ETH Zürich DB110 provides solid database fundamentals with good SQL coverage. Gaps exist in advanced normalization (BCNF) and query optimization strategies that TUM covers in depth.',
            keyStrengths: [
                'Excellent SQL query writing skills',
                'Good understanding of relational model',
                'Transaction basics well covered'
            ],
            keyGaps: [
                'BCNF normalization not covered',
                'Query optimization and execution plans limited',
                'No coverage of distributed databases'
            ],
            confidence: {
                overallConfidence: 0.80,
                inputQuality: 'rich',
                uncertaintyAreas: ['Lab work content'],
                llmReasoningNotes: 'ETH course materials were detailed and well-documented'
            },
            flags: [
                {
                    flagType: 'level_mismatch',
                    severity: 'warning',
                    message: 'Depth gap in normalization topic',
                    details: 'ETH covers 3NF, TUM expects BCNF proficiency'
                }
            ],
            detailedReasoning: 'The ETH Zürich database course is well-structured and covers most fundamental concepts. The main differences lie in the depth of normalization theory (3NF vs BCNF) and the absence of query optimization content. ETH\'s practical focus on SQL is a strength, but TUM\'s curriculum includes more theoretical database concepts.',
            ambiguityNotes: [
                'ETH lab exercises may include optimization practice',
                'Student project scope not fully documented'
            ],
            recognitionSuggestions: [
                'Recognition with supplementary requirement on BCNF',
                'Student could demonstrate BCNF knowledge through brief exam',
                'Consider practical assessment of query optimization skills'
            ]
        }
    ]
};
