/**
 * Shared UI Components for the Application
 * 
 * Reusable components following TUM design guidelines and modern UI/UX principles.
 * Includes tooltips, collapsible sections, and common visual elements.
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, HelpCircle, Info } from 'lucide-react';
import { TUM_COLORS } from '../../styles/tumStyles';

// ============================================
// Tooltip Component (Portal-based for z-index fix)
// ============================================

interface TooltipProps {
    content: string;
    children?: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            
            let top = 0;
            let left = 0;
            
            switch (position) {
                case 'top':
                    top = rect.top + scrollY - 8;
                    left = rect.left + scrollX + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + scrollY + 8;
                    left = rect.left + scrollX + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + scrollY + rect.height / 2;
                    left = rect.left + scrollX - 8;
                    break;
                case 'right':
                    top = rect.top + scrollY + rect.height / 2;
                    left = rect.right + scrollX + 8;
                    break;
            }
            
            setTooltipPosition({ top, left });
        }
    }, [isVisible, position]);

    const getTransform = () => {
        switch (position) {
            case 'top': return 'translate(-50%, -100%)';
            case 'bottom': return 'translate(-50%, 0)';
            case 'left': return 'translate(-100%, -50%)';
            case 'right': return 'translate(0, -50%)';
            default: return 'translate(-50%, -100%)';
        }
    };

    return (
        <div
            ref={triggerRef}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || (
                <HelpCircle 
                    size={14} 
                    style={{ 
                        color: TUM_COLORS.gray50, 
                        marginLeft: 4,
                        cursor: 'help',
                    }} 
                />
            )}
            {isVisible && createPortal(
                <div
                    style={{
                        position: 'absolute',
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        transform: getTransform(),
                        backgroundColor: TUM_COLORS.gray80,
                        color: TUM_COLORS.white,
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: 1.4,
                        maxWidth: 280,
                        zIndex: 99999,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                    }}
                >
                    <div style={{ whiteSpace: 'normal' }}>{content}</div>
                </div>,
                document.body
            )}
        </div>
    );
}

// ============================================
// Info Tooltip (inline help)
// ============================================

interface InfoTooltipProps {
    text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
    return (
        <Tooltip content={text}>
            <Info 
                size={14} 
                style={{ 
                    color: TUM_COLORS.blue, 
                    marginLeft: 6,
                    cursor: 'help',
                    opacity: 0.7,
                }} 
            />
        </Tooltip>
    );
}

// ============================================
// Collapsible Section
// ============================================

interface CollapsibleSectionProps {
    title: string;
    tooltip?: string;
    icon?: ReactNode;
    defaultExpanded?: boolean;
    children: ReactNode;
    headerColor?: string;
    accentColor?: string;
}

export function CollapsibleSection({
    title,
    tooltip,
    icon,
    defaultExpanded = false,
    children,
    headerColor = TUM_COLORS.gray80,
    accentColor = TUM_COLORS.blue,
}: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div style={{
            border: `1px solid ${TUM_COLORS.gray20}`,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: TUM_COLORS.white,
        }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isExpanded ? 'rgba(0, 101, 189, 0.04)' : TUM_COLORS.white,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {icon && <span style={{ color: accentColor, display: 'flex' }}>{icon}</span>}
                    <span style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: headerColor,
                    }}>
                        {title}
                    </span>
                    {tooltip && <InfoTooltip text={tooltip} />}
                </div>
                <div style={{ color: TUM_COLORS.gray50, display: 'flex' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>
            
            <div style={{
                maxHeight: isExpanded ? 2000 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
            }}>
                <div style={{ 
                    padding: 20, 
                    borderTop: `1px solid ${TUM_COLORS.gray20}`,
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Metric Display Component
// ============================================

interface MetricDisplayProps {
    label: string;
    tooltip?: string;
    value: string | number;
    subValue?: string;
    color?: string;
    showBar?: boolean;
    barPercent?: number;
    barColor?: string;
}

export function MetricDisplay({
    label,
    tooltip,
    value,
    subValue,
    color = TUM_COLORS.gray80,
    showBar = false,
    barPercent = 0,
    barColor = TUM_COLORS.blue,
}: MetricDisplayProps) {
    return (
        <div>
            <div style={{ 
                fontSize: 11, 
                color: TUM_COLORS.gray50, 
                textTransform: 'uppercase', 
                letterSpacing: 0.5, 
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
            }}>
                {label}
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            
            {showBar ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                        flex: 1, 
                        height: 8, 
                        backgroundColor: '#E5E7EB', 
                        borderRadius: 4, 
                        overflow: 'hidden' 
                    }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${Math.min(100, Math.max(0, barPercent))}%`, 
                            backgroundColor: barColor, 
                            borderRadius: 4,
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color, minWidth: 45 }}>
                        {value}
                    </span>
                </div>
            ) : (
                <div>
                    <span style={{ fontSize: 16, fontWeight: 600, color }}>
                        {value}
                    </span>
                    {subValue && (
                        <span style={{ fontSize: 13, color: TUM_COLORS.gray50, marginLeft: 4 }}>
                            {subValue}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// Badge Component
// ============================================

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md';
}

const badgeColors = {
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    error: { bg: '#fee2e2', text: '#991b1b' },
    info: { bg: '#dbeafe', text: '#1e40af' },
    neutral: { bg: '#f3f4f6', text: '#374151' },
};

export function Badge({ label, variant = 'neutral', size = 'md' }: BadgeProps) {
    const colors = badgeColors[variant];
    const padding = size === 'sm' ? '2px 6px' : '4px 10px';
    const fontSize = size === 'sm' ? 11 : 12;

    return (
        <span style={{
            display: 'inline-block',
            padding,
            borderRadius: 4,
            fontSize,
            fontWeight: 500,
            backgroundColor: colors.bg,
            color: colors.text,
        }}>
            {label}
        </span>
    );
}

// ============================================
// Score Ring Component
// ============================================

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

export function ScoreRing({ score, size = 72, strokeWidth = 6 }: ScoreRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;
    
    // Color based on score
    const getColor = () => {
        if (score >= 75) return '#22c55e';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: size * 0.28, fontWeight: 700, color: TUM_COLORS.gray80 }}>
                    {Math.round(score)}
                </div>
                <div style={{ fontSize: size * 0.14, color: TUM_COLORS.gray50 }}>
                    /100
                </div>
            </div>
        </div>
    );
}

// ============================================
// Assessment Quality Indicator
// ============================================

interface AssessmentQualityProps {
    confidence: number;
    inputQuality: 'poor' | 'adequate' | 'rich';
    uncertaintyAreas?: string[];
}

export function AssessmentQuality({ confidence, inputQuality, uncertaintyAreas = [] }: AssessmentQualityProps) {
    // Calculate combined assessment quality score
    const qualityMultiplier = inputQuality === 'rich' ? 1.0 : inputQuality === 'adequate' ? 0.85 : 0.6;
    const assessmentScore = Math.round(confidence * 100 * qualityMultiplier);
    
    // Determine reliability level
    const getReliabilityLevel = () => {
        if (assessmentScore >= 80) return { label: 'High Reliability', variant: 'success' as const };
        if (assessmentScore >= 60) return { label: 'Moderate Reliability', variant: 'warning' as const };
        return { label: 'Low Reliability', variant: 'error' as const };
    };
    
    const reliability = getReliabilityLevel();
    
    // Determine data completeness message
    const getDataMessage = () => {
        if (inputQuality === 'rich') return 'Comprehensive course data provided';
        if (inputQuality === 'adequate') return 'Standard course data available';
        return 'Limited course data - review with caution';
    };

    return (
        <div style={{
            backgroundColor: reliability.variant === 'success' ? 'rgba(34, 197, 94, 0.08)' : 
                           reliability.variant === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 
                           'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${reliability.variant === 'success' ? 'rgba(34, 197, 94, 0.3)' : 
                                 reliability.variant === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 
                                 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 8,
            padding: 16,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TUM_COLORS.gray80 }}>
                        Assessment Quality
                    </span>
                    <InfoTooltip text="Combined measure of AI confidence and input data quality. Higher scores indicate more reliable analysis." />
                </div>
                <Badge label={reliability.label} variant={reliability.variant} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ 
                        height: 8, 
                        backgroundColor: '#E5E7EB', 
                        borderRadius: 4, 
                        overflow: 'hidden' 
                    }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${assessmentScore}%`, 
                            backgroundColor: reliability.variant === 'success' ? '#22c55e' : 
                                           reliability.variant === 'warning' ? '#f59e0b' : '#ef4444',
                            borderRadius: 4,
                        }} />
                    </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: TUM_COLORS.gray80, minWidth: 40 }}>
                    {assessmentScore}%
                </span>
            </div>
            
            <p style={{ fontSize: 13, color: TUM_COLORS.gray50, margin: 0 }}>
                {getDataMessage()}
            </p>
            
            {uncertaintyAreas.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 6 }}>
                        Areas requiring attention:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {uncertaintyAreas.slice(0, 3).map((area, i) => (
                            <span key={i} style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: 4,
                                color: TUM_COLORS.gray80,
                            }}>
                                {area}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
