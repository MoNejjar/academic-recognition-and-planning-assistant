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
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    CheckCircle2, 
    XCircle, 
    Clock,
    Building2,
    FileText,
    AlertCircle,
    Pause,
    Crown,
    Pin,
    X,
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
// Final Verdict Display Component
// ============================================

interface FinalVerdictDisplayProps {
    verdict: {
        content: string;
        author_name: string;
        author_role: string;
        created_at: string;
    };
    status: string;
}

function FinalVerdictDisplay({ verdict, status }: FinalVerdictDisplayProps) {
    const isApproved = status === 'approved';
    
    return (
        <div style={{
            backgroundColor: isApproved ? '#F0FDF4' : '#FEF2F2',
            border: `2px solid ${isApproved ? '#22c55e' : '#ef4444'}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
        }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 12,
            }}>
                <Pin size={16} style={{ color: isApproved ? '#22c55e' : '#ef4444' }} />
                <span style={{ 
                    fontSize: 14, 
                    fontWeight: 700, 
                    color: isApproved ? '#166534' : '#991B1B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }}>
                    Final Decision: {isApproved ? 'Approved' : 'Rejected'}
                </span>
            </div>
            
            <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: 15, 
                lineHeight: 1.6, 
                color: TUM_COLORS.gray80,
                whiteSpace: 'pre-wrap',
            }}>
                {verdict.content}
            </p>
            
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontSize: 12,
                color: TUM_COLORS.gray50,
            }}>
                <Crown size={12} style={{ color: '#6366f1' }} />
                <span style={{ fontWeight: 500 }}>{verdict.author_name}</span>
                <span>•</span>
                <span>{new Date(verdict.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}</span>
            </div>
        </div>
    );
}

// ============================================
// Final Verdict Modal Component
// ============================================

interface FinalVerdictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    actionType: 'approved' | 'rejected';
    submitting: boolean;
}

function FinalVerdictModal({ isOpen, onClose, onSubmit, actionType, submitting }: FinalVerdictModalProps) {
    const [message, setMessage] = useState('');
    
    if (!isOpen) return null;
    
    const isApprove = actionType === 'approved';
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSubmit(message.trim());
        }
    };
    
    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
        }}>
            <div style={{
                backgroundColor: TUM_COLORS.white,
                borderRadius: 16,
                width: '100%',
                maxWidth: 520,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isApprove ? '#F0FDF4' : '#FEF2F2',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {isApprove ? (
                            <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
                        ) : (
                            <XCircle size={24} style={{ color: '#ef4444' }} />
                        )}
                        <div>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: 18, 
                                fontWeight: 700, 
                                color: TUM_COLORS.gray80,
                            }}>
                                {isApprove ? 'Approve Recognition' : 'Reject Recognition'}
                            </h2>
                            <p style={{ 
                                margin: 0, 
                                fontSize: 13, 
                                color: TUM_COLORS.gray50,
                            }}>
                                Provide your final verdict message
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            padding: 8,
                            borderRadius: 8,
                            color: TUM_COLORS.gray50,
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                    <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: TUM_COLORS.gray80,
                        marginBottom: 8,
                    }}>
                        Final Verdict Message <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <p style={{
                        fontSize: 12,
                        color: TUM_COLORS.gray50,
                        marginBottom: 12,
                    }}>
                        This message will be displayed at the top of the application and communicated to the student.
                    </p>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={isApprove 
                            ? "e.g., The submitted course demonstrates sufficient equivalence to the TUM module. Full credit recognition is granted..."
                            : "e.g., The submitted course does not meet the required learning outcomes. The following gaps were identified..."
                        }
                        disabled={submitting}
                        style={{
                            width: '100%',
                            minHeight: 150,
                            padding: 14,
                            border: `1px solid ${TUM_COLORS.gray20}`,
                            borderRadius: 8,
                            fontSize: 14,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = TUM_COLORS.blue}
                        onBlur={(e) => e.target.style.borderColor = TUM_COLORS.gray20}
                        autoFocus
                    />
                    
                    {/* Actions */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: 12,
                        marginTop: 20,
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                color: TUM_COLORS.gray80,
                                border: `1px solid ${TUM_COLORS.gray20}`,
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 14,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!message.trim() || submitting}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: !message.trim() || submitting 
                                    ? '#9ca3af' 
                                    : isApprove ? '#22c55e' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: !message.trim() || submitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {submitting ? (
                                <>
                                    <div style={{
                                        width: 16,
                                        height: 16,
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    {isApprove ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                    Confirm {isApprove ? 'Approval' : 'Rejection'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
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

interface FinalVerdict {
    content: string;
    author_name: string;
    author_role: string;
    created_at: string;
}

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [task, setTask] = useState<TaskItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [finalVerdict, setFinalVerdict] = useState<FinalVerdict | null>(null);
    
    // Modal state
    const [showVerdictModal, setShowVerdictModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'approved' | 'rejected'>('approved');
    
    // Determine navigation context
    const from = (location.state as any)?.from || 'tasks';
    const submissionId = (location.state as any)?.submissionId;
    
    // Get user role from context (set when logging in from landing page)
    const { userRole, userName } = useUser();
    const currentUserRole: 'professor' | 'staff' = userRole === 'professor' ? 'professor' : 'staff';
    const currentUserName = userName || (currentUserRole === 'professor' ? 'Prof. Reviewer' : 'Staff Member');

    useEffect(() => {
        loadTask();
        loadFinalVerdict();
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

    const loadFinalVerdict = async () => {
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`);
            if (response.ok) {
                const data = await response.json();
                if (data.final_verdict) {
                    setFinalVerdict(data.final_verdict);
                }
            }
        } catch (error) {
            console.error('Failed to load final verdict:', error);
        }
    };

    const handleApproveClick = () => {
        setPendingAction('approved');
        setShowVerdictModal(true);
    };

    const handleRejectClick = () => {
        setPendingAction('rejected');
        setShowVerdictModal(true);
    };

    const handleVerdictSubmit = async (message: string) => {
        if (!task) return;

        setUpdating(true);
        try {
            const API_URL = getApiUrl();
            
            // First, post the final verdict comment
            const commentResponse = await fetch(`${API_URL}/api/tasks/${task.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: message,
                    author_role: currentUserRole,
                    author_name: currentUserName,
                    is_final_verdict: true,
                }),
            });

            if (!commentResponse.ok) {
                throw new Error('Failed to post final verdict');
            }

            const newVerdict = await commentResponse.json();
            setFinalVerdict(newVerdict);
            
            // Then update the status
            const statusResponse = await fetch(
                `${API_URL}/api/tasks/tasks/${task.id}/status?status=${pendingAction}`,
                { method: 'PATCH' }
            );

            if (!statusResponse.ok) {
                throw new Error('Failed to update status');
            }

            setShowVerdictModal(false);
            await loadTask();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to submit decision. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleHoldStatus = async () => {
        if (!task) return;
        
        if (!confirm('Put this task on hold? You can return to it later.')) return;

        setUpdating(true);
        try {
            const API_URL = getApiUrl();
            const response = await fetch(
                `${API_URL}/api/tasks/tasks/${task.id}/status?status=on_hold`,
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
                            onApprove={handleApproveClick}
                            onReject={handleRejectClick}
                            onHold={handleHoldStatus}
                        />
                    )}
                    
                    {!isRealSubmission && (
                        <Badge label="Test Task - No Actions Available" variant="neutral" />
                    )}
                </div>
            </div>

            {/* Final Verdict Display - At Top of Content */}
            {finalVerdict && (task.status === 'approved' || task.status === 'rejected') && (
                <FinalVerdictDisplay verdict={finalVerdict} status={task.status} />
            )}

            {/* Main Content - Single Column Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Student Information */}
                <StudentInfoCard task={task} />
                
                {/* Module Recognition Analysis */}
                <ModuleCardModern result={moduleResult} />
                
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

            {/* Final Verdict Modal */}
            <FinalVerdictModal
                isOpen={showVerdictModal}
                onClose={() => setShowVerdictModal(false)}
                onSubmit={handleVerdictSubmit}
                actionType={pendingAction}
                submitting={updating}
            />
        </div>
    );
}
