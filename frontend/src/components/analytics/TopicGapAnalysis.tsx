
import { AlertTriangle } from 'lucide-react';

const TUM_COLORS = {
    gray80: '#333333',
};

interface Props {
    gaps: string[];
}

export default function TopicGapAnalysis({ gaps }: Props) {
    if (!gaps || gaps.length === 0) return null;

    return (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #FECACA', backgroundColor: '#FEF2F2' }}>
                <div style={{ fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} />
                    The Missing Delta: Topics Required but Not Found
                </div>
            </div>
            <div style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 16 }}>
                    The following specific topics are essential for the TUM module but were not detected in the source syllabus. This is the primary reason for a non-equivalent score.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gaps.map((gap, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '8px 12px',
                            backgroundColor: 'white',
                            border: '1px solid #FCA5A5',
                            borderRadius: 6
                        }}>
                            <span style={{ color: '#EF4444', fontWeight: 700 }}>❌</span>
                            <span style={{ fontSize: 14, color: TUM_COLORS.gray80, fontWeight: 500 }}>{gap}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
