
import { useState, useEffect } from 'react';
import { getTasks, TaskItem } from '../data/taskManager';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, MoreHorizontal } from 'lucide-react';
import { TUM_COLORS } from '../styles/tumStyles';

// Kanban Column Component for Tasks
const KanbanColumn = ({ title, tasks, color, navigate }: { title: string, tasks: TaskItem[], color: string, navigate: any }) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 280 }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: `2px solid ${color}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: TUM_COLORS.gray80 }}>{title}</h3>
                    <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: TUM_COLORS.gray50,
                        backgroundColor: '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: 12
                    }}>
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => navigate(`/staff/tasks/${task.id}`, { state: { from: 'kanban' } })}
                            style={{
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 8,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #E5E7EB',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: color,
                                    backgroundColor: `${color}15`,
                                    padding: '4px 8px',
                                    borderRadius: 4
                                }}>
                                    {task.score}% Match
                                </span>
                                <MoreHorizontal size={16} color={TUM_COLORS.gray20} />
                            </div>

                            <h4 style={{ fontSize: 15, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 4 }}>
                                {task.tumModuleNr}
                            </h4>
                            <div style={{ fontSize: 13, color: TUM_COLORS.gray50, marginBottom: 8 }}>
                                {task.tumModuleTitle}
                            </div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <BookOpen size={14} />
                                {task.university}
                            </div>

                            <div style={{ paddingTop: 12, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
                                <Calendar size={14} />
                                {task.tumEcts} ECTS • {task.decision}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        padding: 24,
                        textAlign: 'center',
                        fontSize: 13,
                        color: '#9CA3AF',
                        border: '2px dashed #E5E7EB',
                        borderRadius: 8
                    }}>
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
};

export default function KanbanPage() {
    const navigate = useNavigate();
    const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const tasks = await getTasks();
            setAllTasks(tasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get all tasks and group by status/decision
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const reviewedTasks = allTasks.filter(t => t.status === 'reviewed');
    const approvedTasks = allTasks.filter(t => t.status === 'approved' || t.decision === 'highly_equivalent');
    const rejectedTasks = allTasks.filter(t => t.status === 'rejected' || t.decision === 'insufficient');

    return (
        <div style={{ height: 'calc(100vh - 40px)', padding: 32, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    Task Overview Board
                </h1>
                <p style={{ color: TUM_COLORS.gray50 }}>
                    Kanban overview of all module recognition tasks.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: TUM_COLORS.gray50 }}>
                    Loading tasks...
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }}>
                    <KanbanColumn
                        title="Pending Review"
                        tasks={pendingTasks}
                        color="#64748B"
                        navigate={navigate}
                    />

                    <KanbanColumn
                        title="Under Review"
                        tasks={reviewedTasks}
                        color="#E37222"
                        navigate={navigate}
                    />

                    <KanbanColumn
                        title="Approved"
                        tasks={approvedTasks}
                        color="#22c55e"
                        navigate={navigate}
                    />

                    <KanbanColumn
                        title="Rejected"
                        tasks={rejectedTasks}
                        color="#ef4444"
                        navigate={navigate}
                    />
                </div>
            )}
        </div>
    );
}
