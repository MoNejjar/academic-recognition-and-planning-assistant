
import { ArrowRightLeft } from 'lucide-react';

const TUM_COLORS = {
    gray80: '#333333',
    blue: '#0065BD',
};

export default function EctsConversionTable() {
    return (
        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontWeight: 600, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowRightLeft size={18} />
                    Workload Conversion
                </div>
            </div>
            <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>Source Unit</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TUM_COLORS.gray80 }}>1.0 Credit</div>
                    </div>
                    <div style={{ color: '#9CA3AF' }}>→</div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>Calculated ECTS</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TUM_COLORS.blue }}>~1.5 ECTS</div>
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                    Based on 1 Credit = 25-30 hours workload
                </div>
            </div>
        </div>
    );
}
