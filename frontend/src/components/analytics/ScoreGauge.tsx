/**
 * Score Gauge Component
 * 
 * Displays the equivalence score as a circular gauge with color bands.
 * Follows 50 Golden Rules: 200ms transitions, dark mode aware colors.
 */

import React from 'react';
import { getScoreColor } from '../../types/analyticsTypes';
import './analytics.css';

interface ScoreGaugeProps {
    score: number;
    size?: number;
    showLabel?: boolean;
}

export default function ScoreGauge({ score, size = 120, showLabel = true }: ScoreGaugeProps) {
    const color = getScoreColor(score);
    const strokeWidth = size * 0.1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const center = size / 2;

    const getLabel = () => {
        if (score >= 80) return 'Strong';
        if (score >= 60) return 'Partial';
        return 'Weak';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)'
        }}>
            <svg width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--analytics-bg-tertiary)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${circumference}`}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: 'stroke-dasharray var(--transition-slow)' }}
                />
                {/* Score text */}
                <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: size * 0.28,
                        fontWeight: 700,
                        fill: color,
                        fontFamily: 'var(--font-family)'
                    }}
                >
                    {Math.round(score)}%
                </text>
            </svg>
            {showLabel && (
                <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                }}>
                    {getLabel()}
                </div>
            )}
        </div>
    );
}
