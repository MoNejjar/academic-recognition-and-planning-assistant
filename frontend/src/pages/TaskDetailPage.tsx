import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, GraduationCap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getTaskDetail, TaskItem } from '../data/taskManager';
import ModuleCard from '../components/analytics/ModuleCard';
import { TUM_COLORS } from '../styles/tumStyles';
import { getApiUrl, getTaskAgeColor } from '../utils/staffUtils';

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [task, setTask] = useState<TaskItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Determine where the user came from
    const from = (location.state as any)?.from || 'tasks';
    const submissionId = (location.state as any)?.submissionId;

    useEffect(() => {
        loadTask();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    const loadTask = async () => {
        setLoading(true);
        try {
            const foundTask = await getTaskDetail(taskId || '');
            setTask(foundTask || null);
        } catch (error) {
            console.error('Failed to load task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!task || !confirm(`Change status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const API_URL = getApiUrl();
            
            // Use the tasks API endpoint to update status
            const response = await fetch(
                `${API_URL}/api/tasks/tasks/${task.id}/status?status=${newStatus}`,
                { method: 'PATCH' }
            );

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            alert(`Task status updated to ${newStatus}`);
            // Reload task
            await loadTask();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading task...</div>;
    }

    const moduleResult = task?.result;

    if (!task || !moduleResult) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Task not found</div>;
    }

    // Check if this is a real submission (not a manual test)
    const isRealSubmission = !!task.submissionId;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32, fontFamily: 'Arial, sans-serif' }}>
            {/* Header / Nav */}
            <div style={{ marginBottom: 24 }}>
                <button
                    onClick={() => {
                        if (from === 'submission' && submissionId) {
                            navigate(`/staff/submissions/${submissionId}`);
                        } else if (from === 'archive') {
                            navigate('/staff/archive');
                        } else if (from === 'kanban') {
                            navigate('/staff/kanban');
                        } else {
                            navigate('/staff/tasks');
                        }
                    }}
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
                    {from === 'submission' ? 'Back to Submission' : 
                     from === 'archive' ? 'Back to Archive' :
                     from === 'kanban' ? 'Back to Kanban' : 'Back to Tasks'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                            Verify Module Recognition
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: TUM_COLORS.gray50, fontSize: 14, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={16} />
                                <span style={{ fontWeight: 500, color: TUM_COLORS.gray80 }}>{task.studentName}</span>
                            </div>
                            <div style={{ width: 1, height: 16, backgroundColor: '#D1D5DB' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <GraduationCap size={16} />
                                <span>{task.university}</span>
                            </div>
                            {task.createdAt && (
                                <>
                                    <div style={{ width: 1, height: 16, backgroundColor: '#D1D5DB' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={16} style={{ color: getTaskAgeColor(task.createdAt) }} />
                                        <span style={{ fontWeight: 500, color: getTaskAgeColor(task.createdAt) }}>
                                            Created: {new Date(task.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {isRealSubmission && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                onClick={() => handleStatusUpdate('approved')}
                                disabled={updating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: updating ? '#9ca3af' : '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    cursor: updating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <CheckCircle2 size={18} />
                                Approve Recognition
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={updating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: updating ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    cursor: updating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <XCircle size={18} />
                                Reject
                            </button>
                        </div>
                    )}
                    {!isRealSubmission && (
                        <div style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', borderRadius: 6, fontSize: 14, color: TUM_COLORS.gray50 }}>
                            Test Task (No Actions Available)
                        </div>
                    )}
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
