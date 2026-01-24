
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { getTaskById } from '../data/taskManager';
import ModuleCard from '../components/analytics/ModuleCard';
import { TUM_COLORS } from '../styles/tumStyles';

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const task = getTaskById(taskId || '');

    // For mock data, we might need the moduleResult. For custom tasks, it's attached.
    // The getTaskById already returns the 'result' property on the item.
    const moduleResult = task?.result;

    if (!task || !moduleResult) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Task not found</div>;
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32, fontFamily: 'Arial, sans-serif' }}>
            {/* Header / Nav */}
            <div style={{ marginBottom: 24 }}>
                <button
                    onClick={() => navigate('/staff/tasks')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#6B7280',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        marginBottom: 16
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Tasks
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                            Verify Module Recognition
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: TUM_COLORS.gray50, fontSize: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={16} />
                                <span style={{ fontWeight: 500, color: TUM_COLORS.gray80 }}>{task.studentName}</span>
                            </div>
                            <div style={{ width: 1, height: 16, backgroundColor: '#D1D5DB' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <GraduationCap size={16} />
                                <span>{task.university}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{
                            padding: '10px 20px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <CheckCircle2 size={18} />
                            Approve Recognition
                        </button>
                        <button style={{
                            padding: '10px 20px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <XCircle size={18} />
                            Reject
                        </button>
                    </div>
                </div>
            </div>

            {/* Content using reused ModuleCard */}
            <div style={{ marginTop: 24 }}>
                <ModuleCard result={moduleResult} defaultExpanded={true} />
            </div>

            {/* Context / Additional Info could go here */}
            <div style={{ marginTop: 24, padding: 24, backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 12 }}>Professorial Notes</h3>
                <textarea
                    placeholder="Add internal notes regarding this decision..."
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 6,
                        border: '1px solid #D1D5DB',
                        minHeight: 100,
                        fontSize: 14,
                        fontFamily: 'inherit'
                    }}
                />
            </div>
        </div>
    );
}
