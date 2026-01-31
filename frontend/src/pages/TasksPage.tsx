import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { getTasks, TaskItem } from '../data/taskManager';
import { TUM_COLORS } from '../styles/tumStyles';
import { getTaskAgeColor, formatDate } from '../utils/staffUtils';

export default function TasksPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
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

    // Filter tasks - show pending and on_hold tasks
    const activeTasks = allTasks.filter(task => task.status === 'pending' || task.status === 'on_hold');
    
    const filteredTasks = activeTasks.filter(task => {
        const matchesSearch =
            task.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.tumModuleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.tumModuleNr.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    Module Verification Tasks
                </h1>
                <p style={{ color: TUM_COLORS.gray50 }}>
                    Review and approve individual module recognitions across all applications.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: TUM_COLORS.gray50 }}>
                    Loading tasks...
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: 24,
                        backgroundColor: 'white',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #E5E7EB'
                    }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search student, module name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            border: '1px solid #E5E7EB',
                            borderRadius: 6,
                            fontSize: 14,
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={20} color="#6B7280" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 32px 10px 12px',
                            border: '1px solid #E5E7EB',
                            borderRadius: 6,
                            fontSize: 14,
                            outline: 'none',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Module</th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Student</th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>AI Score</th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Created</th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <tr
                                    key={task.id}
                                    style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.1s' }}
                                    onClick={() => {
                                        // Prevent navigation if user is selecting text
                                        const selection = window.getSelection();
                                        if (selection && selection.toString().length > 0) {
                                            return;
                                        }
                                        navigate(`/staff/tasks/${task.id}`, { state: { from: 'tasks' } });
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: TUM_COLORS.gray80 }}>{task.tumModuleTitle}</div>
                                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{task.tumModuleNr} • {task.tumEcts} ECTS</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6B7280' }}>
                                                {task.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 500, color: TUM_COLORS.gray80 }}>{task.studentName}</div>
                                                <div style={{ fontSize: 12, color: '#6B7280' }}>{task.university}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }}>
                                                <div style={{ width: `${task.score}%`, height: '100%', backgroundColor: task.score >= 75 ? '#22c55e' : task.score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: TUM_COLORS.gray80 }}>{Math.round(task.score)}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: '4px 12px',
                                            borderRadius: 12,
                                            backgroundColor: task.status === 'pending' ? '#EFF6FF' : '#FFF7ED',
                                            color: task.status === 'pending' ? '#1e40af' : TUM_COLORS.orange
                                        }}>
                                            {task.status === 'pending' ? 'Pending Review' : 'On Hold'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 13, color: getTaskAgeColor(task.createdAt), fontWeight: 500 }}>
                                            {task.createdAt ? formatDate(task.createdAt) : 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: 13,
                                            color: '#9CA3AF',
                                            fontWeight: 500,
                                            transition: 'color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = TUM_COLORS.blue}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                                        >
                                            Review →
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>
                                    No tasks found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
                </>
            )}
        </div>
    );
}
