
import { useNavigate } from "react-router-dom";
import { mockApplications } from "../data/mockApplications";
import { FileText, Calendar, Clock, ChevronRight, User, University, GraduationCap } from "lucide-react";

const TUM_COLORS = {
    blue: '#0065BD',
    gray80: '#333333',
    gray50: '#808080',
    gray20: '#E5E7EB',
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending Review' },
        reviewed: { bg: '#DBEAFE', color: '#1E40AF', label: 'Under Review' },
        approved: { bg: '#DCFCE7', color: '#166534', label: 'Approved' },
        rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' }
    };

    const { bg, color, label } = config[status] || config.pending;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: bg,
            color: color,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5
        }}>
            {label}
        </span>
    );
};

export default function ApplicationsPage() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={28} color={TUM_COLORS.blue} />
                    Credit Recognition Applications
                </h1>
                <p style={{ color: TUM_COLORS.gray50, margin: 0 }}>
                    Manage and review incoming applications from students.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mockApplications.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => navigate(`/staff/applications/${app.id}`)}
                        style={{
                            backgroundColor: 'white',
                            border: `1px solid ${TUM_COLORS.gray20}`,
                            borderRadius: 12,
                            padding: 24,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(250px, 1.5fr) 1fr 1fr auto',
                            alignItems: 'center',
                            gap: 24,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = TUM_COLORS.blue;
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = TUM_COLORS.gray20;
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        {/* Student Column */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: TUM_COLORS.gray50
                            }}>
                                <User size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: TUM_COLORS.gray80 }}>{app.studentName}</div>
                                <div style={{ fontSize: 13, color: TUM_COLORS.gray50, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <Clock size={12} />
                                    Submitted {app.submissionDate}
                                </div>
                            </div>
                        </div>

                        {/* University Column */}
                        <div>
                            <div style={{ fontSize: 13, color: TUM_COLORS.gray50, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <University size={14} />
                                Previous University
                            </div>
                            <div style={{ fontWeight: 600, color: TUM_COLORS.gray80 }}>{app.university}</div>
                            <div style={{ fontSize: 13, color: TUM_COLORS.gray50 }}>{app.degree}</div>
                        </div>

                        {/* Status Column */}
                        <div>
                            <div style={{ fontSize: 13, color: TUM_COLORS.gray50, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <GraduationCap size={14} />
                                Feasibility Score
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontSize: 20, fontWeight: 700, color: app.score >= 80 ? '#166534' : app.score >= 50 ? '#D97706' : '#991B1B' }}>
                                    {app.score}%
                                </span>
                                <StatusBadge status={app.status} />
                            </div>
                        </div>

                        {/* Action Column */}
                        <div>
                            <ChevronRight size={24} color={TUM_COLORS.gray20} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
