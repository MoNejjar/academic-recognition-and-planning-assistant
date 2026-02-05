/**
 * Comment Thread Component
 * 
 * Chat-like interface for professor-staff communication on tasks.
 * Features:
 * - Different visual styling for professor vs staff messages
 * - Final verdict comment pinned at top
 * - Real-time comment submission
 * - Notification system for new messages from other role
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Send, Crown, User, MessageSquare, AlertCircle, Pin, Bell } from 'lucide-react';
import { TUM_COLORS } from '../../styles/tumStyles';
import { InfoTooltip } from './SharedComponents';

// ============================================
// Types
// ============================================

interface Comment {
    id: number;
    task_id: string;
    author_role: 'professor' | 'staff';
    author_name: string;
    content: string;
    is_final_verdict: boolean;
    created_at: string;
}

interface CommentThreadProps {
    taskId: string;
    currentUserRole: 'professor' | 'staff';
    currentUserName: string;
    taskStatus?: string;
}

// ============================================
// API Functions
// ============================================

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Helper to get/set seen comments from localStorage
function getSeenCommentIds(taskId: string, userRole: string): Set<number> {
    try {
        const key = `seen_comments_${taskId}_${userRole}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Failed to load seen comments from localStorage:', e);
    }
    return new Set();
}

function saveSeenCommentIds(taskId: string, userRole: string, seenIds: Set<number>): void {
    try {
        const key = `seen_comments_${taskId}_${userRole}`;
        localStorage.setItem(key, JSON.stringify(Array.from(seenIds)));
    } catch (e) {
        console.error('Failed to save seen comments to localStorage:', e);
    }
}

async function fetchComments(taskId: string): Promise<{ 
    final_verdict: Comment | null;
    comments: Comment[];
}> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
}

async function postComment(taskId: string, data: {
    content: string;
    author_role: string;
    author_name: string;
    is_final_verdict: boolean;
}): Promise<Comment> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to post comment');
    }
    return response.json();
}

// ============================================
// Single Comment Component
// ============================================

interface CommentBubbleProps {
    comment: Comment;
    isPinned?: boolean;
    isUnread?: boolean;
    onVisible?: (commentId: number) => void;
}

function CommentBubble({ comment, isPinned = false, isUnread = false, onVisible }: CommentBubbleProps) {
    const bubbleRef = useRef<HTMLDivElement>(null);
    const isProfessor = comment.author_role === 'professor';
    
    // Use IntersectionObserver to detect when this comment becomes visible
    useEffect(() => {
        if (!isUnread || !onVisible || !bubbleRef.current) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onVisible(comment.id);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        observer.observe(bubbleRef.current);
        
        return () => observer.disconnect();
    }, [isUnread, onVisible, comment.id]);
    
    // Different glow/styling for professor vs staff
    const bubbleStyle: React.CSSProperties = {
        padding: '14px 18px',
        borderRadius: 12,
        maxWidth: '85%',
        position: 'relative',
        ...(isProfessor ? {
            backgroundColor: '#EEF2FF',
            border: '1px solid #C7D2FE',
            boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(99, 102, 241, 0.1)',
            marginLeft: 'auto',
        } : {
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginRight: 'auto',
        }),
        ...(isPinned && {
            border: '2px solid #22c55e',
            boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(34, 197, 94, 0.2)',
        }),
    };

    return (
        <div 
            ref={bubbleRef}
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: isProfessor ? 'flex-end' : 'flex-start',
                marginBottom: 16,
                position: 'relative',
            }}
        >
            {/* Unread indicator */}
            {isUnread && (
                <div style={{
                    position: 'absolute',
                    left: isProfessor ? 'auto' : -8,
                    right: isProfessor ? -8 : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
                }} />
            )}
            {/* Author info */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                marginBottom: 6,
                flexDirection: isProfessor ? 'row-reverse' : 'row',
            }}>
                <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: isProfessor ? '#6366F1' : TUM_COLORS.orange,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {isProfessor ? (
                        <Crown size={12} color="white" />
                    ) : (
                        <User size={12} color="white" />
                    )}
                </div>
                <span style={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: isProfessor ? '#6366F1' : TUM_COLORS.orange,
                }}>
                    {comment.author_name}
                </span>
                <span style={{ fontSize: 11, color: TUM_COLORS.gray50 }}>
                    {new Date(comment.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
                {isPinned && (
                    <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: 11,
                        color: '#22c55e',
                        fontWeight: 500,
                    }}>
                        <Pin size={10} />
                        Final Verdict
                    </span>
                )}
            </div>
            
            {/* Message bubble */}
            <div style={bubbleStyle}>
                <p style={{ 
                    margin: 0, 
                    fontSize: 14, 
                    lineHeight: 1.5, 
                    color: TUM_COLORS.gray80,
                    whiteSpace: 'pre-wrap',
                }}>
                    {comment.content}
                </p>
            </div>
        </div>
    );
}

// ============================================
// Main Comment Thread Component
// ============================================

export function CommentThread({ 
    taskId, 
    currentUserRole, 
    currentUserName,
    taskStatus = 'pending',
}: CommentThreadProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [finalVerdict, setFinalVerdict] = useState<Comment | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isFinalVerdict, setIsFinalVerdict] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [unreadCommentIds, setUnreadCommentIds] = useState<Set<number>>(new Set());

    // Load comments
    useEffect(() => {
        loadComments();
    }, [taskId]);

    // Mark a comment as read when it becomes visible
    const handleCommentVisible = useCallback((commentId: number) => {
        setUnreadCommentIds((prev: Set<number>) => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
        });
        
        // Persist to localStorage
        const currentSeen = getSeenCommentIds(taskId, currentUserRole);
        currentSeen.add(commentId);
        saveSeenCommentIds(taskId, currentUserRole, currentSeen);
    }, [taskId, currentUserRole]);

    // Scroll to first unread message
    const scrollToUnread = useCallback(() => {
        if (messagesContainerRef.current && unreadCommentIds.size > 0) {
            const unreadArray = Array.from(unreadCommentIds) as number[];
            const firstUnreadId = Math.min(...unreadArray);
            const element = messagesContainerRef.current.querySelector(`[data-comment-id="${firstUnreadId}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [unreadCommentIds]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await fetchComments(taskId);
            setFinalVerdict(data.final_verdict);
            setComments(data.comments);
            
            // Mark comments from the other role as unread (only ones not previously seen)
            if (data.comments.length > 0) {
                const currentSeenIds = getSeenCommentIds(taskId, currentUserRole);
                const otherRoleComments = data.comments.filter(
                    c => c.author_role !== currentUserRole && !currentSeenIds.has(c.id)
                );
                if (otherRoleComments.length > 0) {
                    setUnreadCommentIds(new Set(otherRoleComments.map(c => c.id)));
                }
            }
            
            setError(null);
        } catch (err) {
            setError('Failed to load comments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        // Validate final verdict permissions
        if (isFinalVerdict && currentUserRole !== 'professor') {
            setError('Only professors can add final verdict comments');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            
            const comment = await postComment(taskId, {
                content: newComment.trim(),
                author_role: currentUserRole,
                author_name: currentUserName,
                is_final_verdict: isFinalVerdict,
            });

            if (isFinalVerdict) {
                setFinalVerdict(comment);
            } else {
                setComments(prev => [...prev, comment]);
            }

            setNewComment('');
            setIsFinalVerdict(false);
            
            // Mark our own comment as seen
            const currentSeen = getSeenCommentIds(taskId, currentUserRole);
            currentSeen.add(comment.id);
            saveSeenCommentIds(taskId, currentUserRole, currentSeen);
            
            // Scroll to bottom after sending
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err: any) {
            setError(err.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const canAddFinalVerdict = currentUserRole === 'professor' && !finalVerdict;
    const isTaskDecided = taskStatus === 'approved' || taskStatus === 'rejected';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 400,
            backgroundColor: TUM_COLORS.white,
            border: `1px solid ${TUM_COLORS.gray20}`,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${TUM_COLORS.gray20}`,
                backgroundColor: '#FAFAFA',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MessageSquare size={18} color={TUM_COLORS.blue} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: TUM_COLORS.gray80 }}>
                        Discussion
                    </span>
                    <InfoTooltip text="Communication thread between professors and staff regarding this recognition application." />
                    <span style={{ 
                        marginLeft: 'auto', 
                        fontSize: 12, 
                        color: TUM_COLORS.gray50,
                    }}>
                        {comments.length} message{comments.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Final Verdict (pinned at top) */}
            {finalVerdict && (
                <div style={{
                    padding: 16,
                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                    borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
                }}>
                    <CommentBubble comment={finalVerdict} isPinned />
                </div>
            )}

            {/* Messages area */}
            <div 
                ref={messagesContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 20,
                    backgroundColor: '#FAFAFA',
                    position: 'relative',
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', color: TUM_COLORS.gray50, padding: 40 }}>
                        Loading comments...
                    </div>
                ) : comments.length === 0 && !finalVerdict ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: TUM_COLORS.gray50, 
                        padding: 40,
                    }}>
                        <MessageSquare size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p style={{ margin: 0, fontSize: 14 }}>No comments yet</p>
                        <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                            Start a discussion about this application
                        </p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} data-comment-id={comment.id}>
                            <CommentBubble 
                                comment={comment} 
                                isUnread={unreadCommentIds.has(comment.id)}
                                onVisible={handleCommentVisible}
                            />
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* New messages notification - rendered via portal to body */}
            {unreadCommentIds.size > 0 && createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    animation: 'notificationSlideUp 0.3s ease-out',
                }}>
                    <style>{`
                        @keyframes notificationSlideUp {
                            from {
                                opacity: 0;
                                transform: translateX(-50%) translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(-50%) translateY(0);
                            }
                        }
                    `}</style>
                    <button
                        onClick={scrollToUnread}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 24,
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        <Bell size={16} />
                        {unreadCommentIds.size} new message{unreadCommentIds.size !== 1 ? 's' : ''} from {
                            comments.find(c => unreadCommentIds.has(c.id))?.author_role === 'professor' 
                                ? 'Professor' 
                                : 'Staff'
                        }
                    </button>
                </div>,
                document.body
            )}

            {/* Error message */}
            {error && (
                <div style={{
                    padding: '12px 20px',
                    backgroundColor: '#FEE2E2',
                    borderTop: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <AlertCircle size={16} color="#DC2626" />
                    <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
                </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} style={{
                padding: 16,
                borderTop: `1px solid ${TUM_COLORS.gray20}`,
                backgroundColor: TUM_COLORS.white,
            }}>
                {/* Final verdict checkbox (professors only) */}
                {canAddFinalVerdict && isTaskDecided && (
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12,
                        fontSize: 13,
                        color: '#6366F1',
                        cursor: 'pointer',
                    }}>
                        <input
                            type="checkbox"
                            checked={isFinalVerdict}
                            onChange={(e) => setIsFinalVerdict(e.target.checked)}
                            style={{ accentColor: '#6366F1' }}
                        />
                        <Crown size={14} />
                        <span style={{ fontWeight: 500 }}>Mark as Final Verdict</span>
                        <InfoTooltip text="Final verdict comments are pinned at the top of the discussion and can only be added by professors after a decision is made." />
                    </label>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: currentUserRole === 'professor' ? '#6366F1' : TUM_COLORS.orange,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {currentUserRole === 'professor' ? (
                            <Crown size={14} color="white" />
                        ) : (
                            <User size={14} color="white" />
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', gap: 10 }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={`Add a comment as ${currentUserRole}...`}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                border: `1px solid ${TUM_COLORS.gray20}`,
                                borderRadius: 8,
                                fontSize: 14,
                                resize: 'none',
                                minHeight: 44,
                                maxHeight: 120,
                                fontFamily: 'inherit',
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: newComment.trim() && !submitting ? TUM_COLORS.blue : '#E5E7EB',
                                color: newComment.trim() && !submitting ? 'white' : TUM_COLORS.gray50,
                                border: 'none',
                                borderRadius: 8,
                                cursor: newComment.trim() && !submitting ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 14,
                                fontWeight: 500,
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CommentThread;
