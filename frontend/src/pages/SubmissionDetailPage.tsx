import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    GraduationCap, 
    Globe, 
    Calendar,
    FileText,
    ExternalLink,
    XCircle
} from 'lucide-react';
import { PersonalData } from '../types';
import { TUM_COLORS } from '../styles/tumStyles';
import { DecisionBadge } from '../components/common/StatusBadges';
import { getApiUrl, formatDateTime } from '../utils/staffUtils';

interface ModuleResult {
    tum_module_nr: string;
    tum_module_title: string;
    tum_ects: string;
    overall_score: number;
    decision_hint: string;
    decision_hint_text: string;
    source_summary: string;
}

interface SubmissionDetail {
    submission_id: string;
    personal_data: PersonalData;
    submission_date: string;
    student_name: string;
    tum_email: string;
    previous_university: string;
    previous_country: string;
    mapping_file_name?: string;
    analytics: {
        total_modules_analyzed: number;
        average_score: number;
        modules_highly_equivalent: number;
        modules_partial: number;
        modules_insufficient: number;
        module_results: ModuleResult[];
        llm_model_used?: string;
        analysis_timestamp?: string;
    };
}

export default function SubmissionDetailPage() {
    const navigate = useNavigate();
    const { submissionId } = useParams<{ submissionId: string }>();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSubmission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionId]);

    const loadSubmission = async () => {
        if (!submissionId) {
            setError('No submission ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/api/submissions/submissions/${submissionId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load submission: ${response.statusText}`);
            }
            
            const data = await response.json();
            setSubmission(data);
        } catch (error) {
            console.error('Failed to load submission:', error);
            setError(error instanceof Error ? error.message : 'Failed to load submission');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', padding: 48, color: TUM_COLORS.gray50 }}>
                    Loading submission details...
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/staff/archive')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        marginBottom: 24
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Archive
                </button>
                <div style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 8,
                    padding: 24,
                    textAlign: 'center'
                }}>
                    <XCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>
                        Error Loading Submission
                    </h2>
                    <p style={{ color: '#991B1B' }}>{error || 'Submission not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/staff/archive')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    marginBottom: 24,
                    color: TUM_COLORS.gray80
                }}
            >
                <ArrowLeft size={16} />
                Back to Archive
            </button>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    Submission Details
                </h1>
                <p style={{ color: TUM_COLORS.gray50, fontSize: 14 }}>
                    ID: {submission.submission_id}
                </p>
            </div>

            {/* Student Information Card */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 20 }}>
                    Student Information
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <User size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Name</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                {(submission.personal_data as any).first_name} {(submission.personal_data as any).surname}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <Mail size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>TUM Email</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                {submission.tum_email}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <GraduationCap size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Previous University</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                {submission.previous_university}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <Globe size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Country</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                {submission.previous_country}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                        <Calendar size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Submission Date</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                {formatDateTime(submission.submission_date)}
                            </div>
                        </div>
                    </div>

                    {submission.mapping_file_name && (
                        <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                            <FileText size={20} color={TUM_COLORS.blue} style={{ marginTop: 2 }} />
                            <div>
                                <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Mapping File</div>
                                <div style={{ fontSize: 15, fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                    {submission.mapping_file_name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Summary Card */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 20 }}>
                    Analytics Summary
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: TUM_COLORS.blue }}>
                            {submission.analytics.total_modules_analyzed}
                        </div>
                        <div style={{ fontSize: 13, color: TUM_COLORS.gray50, marginTop: 4 }}>Total Modules</div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: TUM_COLORS.blue }}>
                            {submission.analytics.average_score.toFixed(0)}
                        </div>
                        <div style={{ fontSize: 13, color: TUM_COLORS.gray50, marginTop: 4 }}>Avg Score</div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#DCFCE7', borderRadius: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#166534' }}>
                            {submission.analytics.modules_highly_equivalent}
                        </div>
                        <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>High Match</div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#854D0E' }}>
                            {submission.analytics.modules_partial}
                        </div>
                        <div style={{ fontSize: 13, color: '#854D0E', marginTop: 4 }}>Partial</div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#991B1B' }}>
                            {submission.analytics.modules_insufficient}
                        </div>
                        <div style={{ fontSize: 13, color: '#991B1B', marginTop: 4 }}>Insufficient</div>
                    </div>
                </div>
            </div>

            {/* Module Results / Tasks List */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 24
            }}>
                <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: TUM_COLORS.gray80 }}>
                        Module Recognition Results
                    </h2>
                    <p style={{ fontSize: 14, color: TUM_COLORS.gray50, marginTop: 4 }}>
                        Click on any module to view detailed analytics
                    </p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                TUM Module
                            </th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                Source Courses
                            </th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                Score
                            </th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                Decision
                            </th>
                            <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {submission.analytics.module_results.map((module, index) => (
                            <tr
                                key={index}
                                style={{ borderBottom: '1px solid #E5E7EB' }}
                            >
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 500, color: TUM_COLORS.gray80 }}>
                                        {module.tum_module_title}
                                    </div>
                                    <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginTop: 2 }}>
                                        {module.tum_module_nr} • {module.tum_ects} ECTS
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: 14, color: TUM_COLORS.gray80 }}>
                                    <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {module.source_summary}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        backgroundColor: module.overall_score >= 80 ? '#DCFCE7' : module.overall_score >= 60 ? '#FEF3C7' : '#FEE2E2',
                                        color: module.overall_score >= 80 ? '#166534' : module.overall_score >= 60 ? '#854D0E' : '#991B1B'
                                    }}>
                                        {module.overall_score.toFixed(0)}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <DecisionBadge decision={module.decision_hint} />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <button
                                        onClick={async () => {
                                            // Fetch tasks for this submission to find the specific task ID
                                            try {
                                                const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
                                                const response = await fetch(`${API_URL}/api/tasks/tasks?limit=1000`);
                                                if (response.ok) {
                                                    const data = await response.json();
                                                    // Find task matching this submission and module
                                                    const matchingTask = data.tasks?.find((t: any) => 
                                                        t.submissionId === submissionId && 
                                                        t.tumModuleNr === module.tum_module_nr
                                                    );
                                                    if (matchingTask) {
                                                        navigate(`/staff/tasks/${matchingTask.id}`, { 
                                                            state: { from: 'submission', submissionId: submissionId } 
                                                        });
                                                    } else {
                                                        // Fallback if task not found
                                                        navigate('/staff/tasks');
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Failed to fetch task:', error);
                                                navigate('/staff/tasks');
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '6px 12px',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: 6,
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            color: TUM_COLORS.blue,
                                            fontWeight: 500
                                        }}
                                    >
                                        View Task
                                        <ExternalLink size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Additional Personal Data Section */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 24
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 20 }}>
                    Additional Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Course at TUM</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).course_at_tum}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Aimed Degree</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).aimed_degree}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Registration Number</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).registration_number_at_tum}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Semester at TUM</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).semester_at_tum}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Previous Degree Program</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).previous_degree_program}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Diploma</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {submission.personal_data.diploma}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Number of Semesters</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).number_of_semesters_in_previous_course}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Workload per Credit</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).workload_of_one_credit}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 4 }}>Grade Range</div>
                        <div style={{ fontSize: 14, color: TUM_COLORS.gray80 }}>
                            {(submission.personal_data as any).minimum_passing_grade_at_former_university} - {(submission.personal_data as any).maximum_grade_at_former_university}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
