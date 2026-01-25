
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

const TUM_COLORS = {
    gray80: '#333333',
    gray50: '#808080',
};

export default function DocumentAuditList() {
    // Mock checklist logic - in real app would check if files exist in backend
    const items = [
        { label: 'Module Catalog / Syllabus', status: 'present', required: true },
        { label: 'Transcript of Records', status: 'present', required: true },
        { label: 'Grade Scaling Table', status: 'missing', required: false }, // Mock missing
        { label: 'University Acceleration Status', status: 'present', required: false },
    ];

    return (
        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <div style={{ fontWeight: 600, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} />
                    Document Audit
                </div>
            </div>
            <div>
                {items.map((item, i) => (
                    <div key={i} style={{
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: i < items.length - 1 ? '1px solid #F3F4F6' : 'none'
                    }}>
                        <span style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {item.label}
                            {item.required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
                        </span>
                        {item.status === 'present' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                                <CheckCircle2 size={16} /> Present
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: item.required ? '#EF4444' : '#F59E0B', fontWeight: 500 }}>
                                <XCircle size={16} /> {item.required ? 'Missing (Required)' : 'Not Found'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
