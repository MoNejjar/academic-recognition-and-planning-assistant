import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle,
    ChevronDown,
    Calendar,
    User,
    GraduationCap,
    FileText
} from 'lucide-react';
import { TaskItem } from '../data/taskManager';

const TUM_COLORS = {
    blue: '#3070b3',
    gray80: '#1F2937',
    gray50: '#6B7280',
};

interface SubmissionItem {
    submission_id: string;
    student_name: string;
    tum_email: string;
    previous_university: string;
    previous_country: string;
    submission_date: string;
    modules_count: number;
    average_score: number;
}

type ViewMode = 'tasks' | 'submissions';

const STORAGE_KEY = 'tum_archive_view_mode';

export default function ArchivePage() {
    const navigate = useNavigate();
    // Load view mode from localStorage, default to 'tasks' if not set
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const savedMode = localStorage.getItem(STORAGE_KEY);
        return (savedMode === 'tasks' || savedMode === 'submissions') ? savedMode : 'tasks';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Task-specific data and filters
    const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
    const [taskFilters, setTaskFilters] = useState({
        status: 'all',
        decision: 'all',
        minScore: '',
        maxScore: '',
        university: 'all',
        dateFrom: '',
        dateTo: '',
    });
    
    // Submission-specific data and filters
    const [allSubmissions, setAllSubmissions] = useState<SubmissionItem[]>([]);
    const [submissionFilters, setSubmissionFilters] = useState({
        university: 'all',
        country: 'all',
        minModules: '',
        maxModules: '',
        minAvgScore: '',
        maxAvgScore: '',
        dateFrom: '',
        dateTo: '',
    });
    
    const [loading, setLoading] = useState(true);

    // Save view mode to localStorage whenever it changes
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem(STORAGE_KEY, mode);
    };

    // Fetch tasks
    useEffect(() => {
        if (viewMode === 'tasks') {
            loadTasks();
        }
    }, [viewMode]);

    // Fetch submissions
    useEffect(() => {
        if (viewMode === 'submissions') {
            loadSubmissions();
        }
    }, [viewMode]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/tasks/tasks?limit=1000`);
            
            if (response.ok) {
                const data = await response.json();
                setAllTasks(data.tasks || []);
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/submissions/submissions?limit=1000`);
            
            if (response.ok) {
                const data = await response.json();
                setAllSubmissions(data.submissions || []);
            }
        } catch (error) {
            console.error('Failed to load submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks
    const filteredTasks = allTasks.filter(task => {
        // Search filter
        const matchesSearch =
            task.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.tumModuleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.tumModuleNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.university.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Status filter
        if (taskFilters.status !== 'all' && task.status !== taskFilters.status) return false;

        // Decision filter
        if (taskFilters.decision !== 'all' && task.decision !== taskFilters.decision) return false;

        // Score range filter
        if (taskFilters.minScore && task.score < parseFloat(taskFilters.minScore)) return false;
        if (taskFilters.maxScore && task.score > parseFloat(taskFilters.maxScore)) return false;

        // University filter
        if (taskFilters.university !== 'all' && task.university !== taskFilters.university) return false;

        // Date range filter
        if (taskFilters.dateFrom && task.submissionDate) {
            const taskDate = new Date(task.submissionDate);
            const fromDate = new Date(taskFilters.dateFrom);
            if (taskDate < fromDate) return false;
        }
        if (taskFilters.dateTo && task.submissionDate) {
            const taskDate = new Date(task.submissionDate);
            const toDate = new Date(taskFilters.dateTo);
            if (taskDate > toDate) return false;
        }

        return true;
    });

    // Filter submissions
    const filteredSubmissions = allSubmissions.filter(submission => {
        // Search filter
        const matchesSearch =
            submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.tum_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.previous_university.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.previous_country.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // University filter
        if (submissionFilters.university !== 'all' && submission.previous_university !== submissionFilters.university) return false;

        // Country filter
        if (submissionFilters.country !== 'all' && submission.previous_country !== submissionFilters.country) return false;

        // Module count range
        if (submissionFilters.minModules && submission.modules_count < parseInt(submissionFilters.minModules)) return false;
        if (submissionFilters.maxModules && submission.modules_count > parseInt(submissionFilters.maxModules)) return false;

        // Average score range
        if (submissionFilters.minAvgScore && submission.average_score < parseFloat(submissionFilters.minAvgScore)) return false;
        if (submissionFilters.maxAvgScore && submission.average_score > parseFloat(submissionFilters.maxAvgScore)) return false;

        // Date range filter
        if (submissionFilters.dateFrom) {
            const subDate = new Date(submission.submission_date);
            const fromDate = new Date(submissionFilters.dateFrom);
            if (subDate < fromDate) return false;
        }
        if (submissionFilters.dateTo) {
            const subDate = new Date(submission.submission_date);
            const toDate = new Date(submissionFilters.dateTo);
            if (subDate > toDate) return false;
        }

        return true;
    });

    // Get unique values for dropdowns
    const uniqueUniversities = Array.from(new Set(allTasks.map(t => t.university).filter(Boolean)));
    const uniqueSubmissionUniversities = Array.from(new Set(allSubmissions.map(s => s.previous_university).filter(Boolean)));
    const uniqueCountries = Array.from(new Set(allSubmissions.map(s => s.previous_country).filter(Boolean)));

    const getDecisionBadge = (decision: string) => {
        switch (decision) {
            case 'highly_equivalent':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 size={12} /> High Match</span>;
            case 'partial':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><AlertTriangle size={12} /> Partial</span>;
            case 'insufficient':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Insufficient</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unknown</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pending</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const resetFilters = () => {
        if (viewMode === 'tasks') {
            setTaskFilters({
                status: 'all',
                decision: 'all',
                minScore: '',
                maxScore: '',
                university: 'all',
                dateFrom: '',
                dateTo: '',
            });
        } else {
            setSubmissionFilters({
                university: 'all',
                country: 'all',
                minModules: '',
                maxModules: '',
                minAvgScore: '',
                maxAvgScore: '',
                dateFrom: '',
                dateTo: '',
            });
        }
    };

    return (
        <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    Archive
                </h1>
                <p style={{ color: TUM_COLORS.gray50 }}>
                    Browse and search through all {viewMode === 'tasks' ? 'module verification tasks' : 'student submissions'}.
                </p>
            </div>

            {/* View Mode Toggle */}
            <div style={{ 
                display: 'flex',
                gap: 8,
                marginBottom: 24,
                backgroundColor: 'white',
                padding: 4,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                width: 'fit-content'
            }}>
                <button
                    onClick={() => handleViewModeChange('tasks')}
                    style={{
                        padding: '10px 24px',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        backgroundColor: viewMode === 'tasks' ? TUM_COLORS.blue : 'transparent',
                        color: viewMode === 'tasks' ? 'white' : TUM_COLORS.gray50,
                        transition: 'all 0.2s'
                    }}
                >
                    <FileText size={16} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                    Tasks
                </button>
                <button
                    onClick={() => handleViewModeChange('submissions')}
                    style={{
                        padding: '10px 24px',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        backgroundColor: viewMode === 'submissions' ? TUM_COLORS.blue : 'transparent',
                        color: viewMode === 'submissions' ? 'white' : TUM_COLORS.gray50,
                        transition: 'all 0.2s'
                    }}
                >
                    <GraduationCap size={16} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                    Submissions
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: TUM_COLORS.gray50 }}>
                    Loading {viewMode}...
                </div>
            ) : (
                <>
                    {/* Search and Filter Bar */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        marginBottom: 24
                    }}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: showFilters ? 16 : 0 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <input
                                    type="text"
                                    placeholder={viewMode === 'tasks' ? "Search student, module, or university..." : "Search student, email, university, or country..."}
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

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    backgroundColor: showFilters ? '#F3F4F6' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                <Filter size={18} />
                                Filters
                                <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div style={{
                                borderTop: '1px solid #E5E7EB',
                                paddingTop: 16,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 16
                            }}>
                                {viewMode === 'tasks' ? (
                                    <>
                                        {/* Task Filters */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Status</label>
                                            <select
                                                value={taskFilters.status}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, status: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Decision</label>
                                            <select
                                                value={taskFilters.decision}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, decision: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            >
                                                <option value="all">All Decisions</option>
                                                <option value="highly_equivalent">High Match</option>
                                                <option value="partial">Partial Match</option>
                                                <option value="insufficient">Insufficient</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>University</label>
                                            <select
                                                value={taskFilters.university}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, university: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            >
                                                <option value="all">All Universities</option>
                                                {uniqueUniversities.map(uni => (
                                                    <option key={uni} value={uni}>{uni}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Min Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={taskFilters.minScore}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, minScore: e.target.value })}
                                                placeholder="0"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Max Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={taskFilters.maxScore}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, maxScore: e.target.value })}
                                                placeholder="100"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Date From</label>
                                            <input
                                                type="date"
                                                value={taskFilters.dateFrom}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, dateFrom: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Date To</label>
                                            <input
                                                type="date"
                                                value={taskFilters.dateTo}
                                                onChange={(e) => setTaskFilters({ ...taskFilters, dateTo: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Submission Filters */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>University</label>
                                            <select
                                                value={submissionFilters.university}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, university: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            >
                                                <option value="all">All Universities</option>
                                                {uniqueSubmissionUniversities.map(uni => (
                                                    <option key={uni} value={uni}>{uni}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Country</label>
                                            <select
                                                value={submissionFilters.country}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, country: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            >
                                                <option value="all">All Countries</option>
                                                {uniqueCountries.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Min Modules</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={submissionFilters.minModules}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, minModules: e.target.value })}
                                                placeholder="0"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Max Modules</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={submissionFilters.maxModules}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, maxModules: e.target.value })}
                                                placeholder="Any"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Min Avg Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={submissionFilters.minAvgScore}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, minAvgScore: e.target.value })}
                                                placeholder="0"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Max Avg Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={submissionFilters.maxAvgScore}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, maxAvgScore: e.target.value })}
                                                placeholder="100"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Date From</label>
                                            <input
                                                type="date"
                                                value={submissionFilters.dateFrom}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, dateFrom: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TUM_COLORS.gray50, marginBottom: 4 }}>Date To</label>
                                            <input
                                                type="date"
                                                value={submissionFilters.dateTo}
                                                onChange={(e) => setSubmissionFilters({ ...submissionFilters, dateTo: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Reset Filters Button */}
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        onClick={resetFilters}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            color: TUM_COLORS.gray50
                                        }}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Count */}
                    <div style={{ marginBottom: 16, fontSize: 14, color: TUM_COLORS.gray50 }}>
                        Showing {viewMode === 'tasks' ? filteredTasks.length : filteredSubmissions.length} of {viewMode === 'tasks' ? allTasks.length : allSubmissions.length} {viewMode}
                    </div>

                    {/* Tasks Table */}
                    {viewMode === 'tasks' && (
                        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Module</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Student</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>University</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Score</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Decision</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <tr
                                                key={task.id}
                                                style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.1s' }}
                                                onClick={() => navigate(`/staff/tasks/${task.id}`, { state: { from: 'archive' } })}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: 500, color: TUM_COLORS.gray80 }}>{task.tumModuleTitle}</div>
                                                    <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginTop: 2 }}>{task.tumModuleNr} • {task.tumEcts} ECTS</div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <User size={16} color="#6B7280" />
                                                        <span style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>{task.studentName}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: 14, color: TUM_COLORS.gray80 }}>{task.university}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: 6,
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        backgroundColor: task.score >= 80 ? '#DCFCE7' : task.score >= 60 ? '#FEF3C7' : '#FEE2E2',
                                                        color: task.score >= 80 ? '#166534' : task.score >= 60 ? '#854D0E' : '#991B1B'
                                                    }}>
                                                        {task.score.toFixed(0)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>{getDecisionBadge(task.decision)}</td>
                                                <td style={{ padding: '16px 24px' }}>{getStatusBadge(task.status)}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: TUM_COLORS.gray50 }}>
                                                        <Calendar size={14} />
                                                        {task.submissionDate ? formatDate(task.submissionDate) : 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: TUM_COLORS.gray50 }}>
                                                No tasks found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Submissions Table */}
                    {viewMode === 'submissions' && (
                        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Student</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>University</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Country</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Modules</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Avg Score</th>
                                        <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmissions.length > 0 ? (
                                        filteredSubmissions.map((submission) => (
                                            <tr
                                                key={submission.submission_id}
                                                style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.1s' }}
                                                onClick={() => navigate(`/staff/submissions/${submission.submission_id}`)}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: 500, color: TUM_COLORS.gray80 }}>{submission.student_name}</div>
                                                    <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginTop: 2 }}>{submission.tum_email}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: 14, color: TUM_COLORS.gray80 }}>{submission.previous_university}</td>
                                                <td style={{ padding: '16px 24px', fontSize: 14, color: TUM_COLORS.gray80 }}>{submission.previous_country}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: 6,
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        backgroundColor: '#EEF2FF',
                                                        color: '#4338CA'
                                                    }}>
                                                        {submission.modules_count}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: 6,
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        backgroundColor: submission.average_score >= 80 ? '#DCFCE7' : submission.average_score >= 60 ? '#FEF3C7' : '#FEE2E2',
                                                        color: submission.average_score >= 80 ? '#166534' : submission.average_score >= 60 ? '#854D0E' : '#991B1B'
                                                    }}>
                                                        {submission.average_score.toFixed(0)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: TUM_COLORS.gray50 }}>
                                                        <Calendar size={14} />
                                                        {formatDate(submission.submission_date)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: TUM_COLORS.gray50 }}>
                                                No submissions found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
