/**
 * Task Detail Page - Modern Redesign
 * 
 * A comprehensive view for reviewing recognition applications.
 * Features:
 * - Modular layout with clear visual hierarchy
 * - Professor-Staff communication thread
 * - Collapsible sections for organized information
 * - Comprehensive tooltips and guidance
 * - TUM brand styling
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    GraduationCap, 
    CheckCircle2, 
    XCircle, 
    Clock,
    Building2,
    FileText,
    AlertCircle,
    Pause,
} from 'lucide-react';
import { getTaskDetail, TaskItem } from '../data/taskManager';
import ModuleCardModern from '../components/analytics/ModuleCardModern';
import { CommentThread } from '../components/common/CommentThread';
import { TUM_COLORS } from '../styles/tumStyles';
import { getApiUrl, getTaskAgeColor } from '../utils/staffUtils';
import { InfoTooltip, Badge } from '../components/common/SharedComponents';
import { useUser } from '../context/UserContext';

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        pending: { label: 'Pending Review', color: '#92400E', bg: '#FEF3C7', icon: Clock },
        approved: { label: 'Approved', color: '#166534', bg: '#DCFCE7', icon: CheckCircle2 },
        rejected: { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2', icon: XCircle },
        on_hold: { label: 'On Hold', color: '#1E40AF', bg: '#DBEAFE', icon: Pause },
    };
    
    const { label, color, bg, icon: Icon } = config[status] || config.pending;
    
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: bg,
            color: color,
        }}>
            <Icon size={14} />
            {label}
        </span>
    );
}

// ============================================
// Action Buttons Component
// ============================================

interface ActionButtonsProps {
    updating: boolean;
    onApprove: () => void;
    onReject: () => void;
    onHold: () => void;
}

function ActionButtons({ updating, onApprove, onReject, onHold }: ActionButtonsProps) {
    return (
        <div style={{ display: 'flex', gap: 10 }}>
            <button 
                onClick={onApprove}
                disabled={updating}
                style={{
                    padding: '10px 20px',
                    backgroundColor: updating ? '#9ca3af' : '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                }}
            >
                <CheckCircle2 size={18} />
                Approve
            </button>
            <button 
                onClick={onReject}
                disabled={updating}
                style={{
                    padding: '10px 20px',
                    backgroundColor: updating ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                }}
            >
                <XCircle size={18} />
                Reject
            </button>
            <button 
                onClick={onHold}
                disabled={updating}
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: TUM_COLORS.gray80,
                    border: `1px solid ${TUM_COLORS.gray20}`,
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                }}
            >
                <Pause size={18} />
                Put on Hold
            </button>
        </div>
    );
}

// ============================================
// Student Info Card
// ============================================

interface StudentInfoProps {
    task: TaskItem;
}

function StudentInfoCard({ task }: StudentInfoProps) {
    return (
        <div style={{
            backgroundColor: TUM_COLORS.white,
            border: `1px solid ${TUM_COLORS.gray20}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
        }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 16,
                color: TUM_COLORS.gray80,
            }}>
                <User size={18} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Student Information</span>
                <InfoTooltip text="Details about the student who submitted this recognition request" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        Student Name
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                        {task.studentName}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: TUM_COLORS.gray50, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        Previous University
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} />
                        {task.university}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main TaskDetailPage Component
// ============================================

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [task, setTask] = useState<TaskItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Determine navigation context
    const from = (location.state as any)?.from || 'tasks';
    const submissionId = (location.state as any)?.submissionId;
    
    // Get user role from context (set when logging in from landing page)
    const { userRole, userName } = useUser();
    const currentUserRole: 'professor' | 'staff' = userRole === 'professor' ? 'professor' : 'staff';
    const currentUserName = userName || (currentUserRole === 'professor' ? 'Prof. Reviewer' : 'Staff Member');

    useEffect(() => {
        loadTask();
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
        if (!task) return;
        
        const confirmMessages: Record<string, string> = {
            approved: 'Are you sure you want to APPROVE this recognition request? This decision will be communicated to the student.',
            rejected: 'Are you sure you want to REJECT this recognition request? Please ensure you have documented the reasons.',
            on_hold: 'Put this task on hold? You can return to it later.',
        };

        if (!confirm(confirmMessages[newStatus] || `Change status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const API_URL = getApiUrl();
            const response = await fetch(
                `${API_URL}/api/tasks/tasks/${task.id}/status?status=${newStatus}`,
                { method: 'PATCH' }
            );

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            await loadTask();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
                color: TUM_COLORS.gray50,
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: 40, 
                        height: 40, 
                        border: `3px solid ${TUM_COLORS.gray20}`,
                        borderTopColor: TUM_COLORS.blue,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    Loading task details...
                </div>
            </div>
        );
    }

    const moduleResult = task?.result;

    // Not found state
    if (!task || !moduleResult) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: TUM_COLORS.gray50, marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, color: TUM_COLORS.gray80, marginBottom: 8 }}>Task Not Found</h2>
                    <p style={{ color: TUM_COLORS.gray50, marginBottom: 24 }}>
                        The requested task could not be found or may have been removed.
                    </p>
                    <button
                        onClick={() => navigate('/staff/tasks')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: TUM_COLORS.blue,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Return to Tasks
                    </button>
                </div>
            </div>
        );
    }

    const isRealSubmission = !!task.submissionId;
    const isDecided = task.status === 'approved' || task.status === 'rejected';

    return (
        <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            padding: 32, 
            fontFamily: "'Inter', Arial, sans-serif",
            backgroundColor: TUM_COLORS.grayBg,
            minHeight: '100vh',
        }}>
            {/* Back Navigation */}
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: TUM_COLORS.gray50,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    marginBottom: 24,
                    padding: 0,
                }}
            >
                <ArrowLeft size={16} />
                {from === 'submission' ? 'Back to Submission' : 
                 from === 'archive' ? 'Back to Archive' :
                 from === 'kanban' ? 'Back to Kanban' : 'Back to Tasks'}
            </button>

            {/* Page Header */}
            <div style={{
                backgroundColor: TUM_COLORS.white,
                border: `1px solid ${TUM_COLORS.gray20}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <h1 style={{ 
                                fontSize: 22, 
                                fontWeight: 700, 
                                color: TUM_COLORS.gray80, 
                                margin: 0,
                            }}>
                                Module Recognition Review
                            </h1>
                            <StatusBadge status={task.status} />
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 20, 
                            color: TUM_COLORS.gray50, 
                            fontSize: 14,
                            flexWrap: 'wrap',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FileText size={14} />
                                Task ID: <code style={{ 
                                    fontSize: 12, 
                                    backgroundColor: '#F3F4F6', 
                                    padding: '2px 6px', 
                                    borderRadius: 4,
                                }}>{task.id}</code>
                            </span>
                            
                            {task.createdAt && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} style={{ color: task.status === 'pending' ? getTaskAgeColor(task.createdAt) : undefined }} />
                                    Submitted: {new Date(task.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                            
                            {task.decisionDate && (
                                <span style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 6,
                                    color: task.status === 'approved' ? '#166534' : '#991B1B',
                                }}>
                                    {task.status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    Decision: {new Date(task.decisionDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isRealSubmission && !isDecided && (
                        <ActionButtons
                            updating={updating}
                            onApprove={() => handleStatusUpdate('approved')}
                            onReject={() => handleStatusUpdate('rejected')}
                            onHold={() => handleStatusUpdate('on_hold')}
                        />
                    )}
                    
                    {!isRealSubmission && (
                        <Badge label="Test Task - No Actions Available" variant="neutral" />
                    )}
                </div>
            </div>

            {/* Main Content - Single Column Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Student Information */}
                <StudentInfoCard task={task} />
                
                {/* Module Recognition Analysis */}
                <ModuleCardModern result={moduleResult} defaultExpanded={true} />
                
                {/* Discussion Thread - Below Module Overview */}
                <CommentThread
                    taskId={task.id}
                    currentUserRole={currentUserRole}
                    currentUserName={currentUserName}
                    taskStatus={task.status}
                />
            </div>

            {/* CSS Animation for spinner */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
