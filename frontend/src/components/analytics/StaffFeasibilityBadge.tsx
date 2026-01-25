
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const TUM_COLORS = {
    blue: '#0065BD',
    green: '#A2AD00',
    orange: '#E37222',
    gray80: '#333333',
};

// Traffic Light Colors
const TRAFFIC_COLORS = {
    green: '#22c55e',
    yellow: '#f59e0b',
    red: '#ef4444',
};

interface Props {
    score: number;
}

export default function StaffFeasibilityBadge({ score }: Props) {
    let color = TRAFFIC_COLORS.red;
    let label = 'HIGH RISK / REJECT';
    let description = 'Equivalence score is below 40%. Automatic rejection recommended.';
    let icon = XCircle;

    if (score >= 80) {
        color = TRAFFIC_COLORS.green;
        label = 'LIKELY FEASIBLE';
        description = 'High equivalence >80%. Review for formality checks.';
        icon = CheckCircle2;
    } else if (score >= 40) {
        color = TRAFFIC_COLORS.yellow;
        label = 'REQUIRES REVIEW';
        description = 'Partial match (40-79%). Professor decision required.';
        icon = AlertTriangle;
    }

    const Icon = icon;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: 'white',
            border: `1px solid #E5E7EB`,
            borderLeft: `6px solid ${color}`,
            borderRadius: 8,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} color={color} />
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Feasibility Assessment
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: TUM_COLORS.gray80 }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 14, color: '#6B7280' }}>
                        {description}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: color }}>
                    {Math.round(score)}%
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                    Overall Match
                </div>
            </div>
        </div>
    );
}
