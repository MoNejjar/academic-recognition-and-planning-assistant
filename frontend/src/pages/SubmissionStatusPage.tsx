import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Home, FileCheck, UserCheck, Mail } from 'lucide-react';
import { TUM_COLORS } from '../styles/tumStyles';

type SubmissionState = 'loading' | 'success' | 'error';

interface LocationState {
    submissionData?: any;
}

export default function SubmissionStatusPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState<SubmissionState>('loading');
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const submissionAttempted = useRef(false);

    useEffect(() => {
        const locationState = location.state as LocationState;
        
        if (!locationState?.submissionData) {
            // No submission data, redirect back
            navigate('/student');
            return;
        }

        // Prevent duplicate submissions in React StrictMode or on re-renders
        if (submissionAttempted.current) {
            return;
        }
        submissionAttempted.current = true;

        submitApplication(locationState.submissionData);
    }, []);

    const submitApplication = async (submissionData: any) => {
        try {
            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/submissions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Backend error:', error);
                const errorMessage = typeof error.detail === 'string' 
                    ? error.detail 
                    : 'An error occurred while processing your submission';
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setSubmissionId(result.submission_id);
            setState('success');
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
            setState('error');
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleSubmitAnother = () => {
        navigate('/student/personal-data');
    };

    // Evaluation Process Component (shown in both loading and success states)
    const EvaluationProcess = () => (
        <div style={{
            backgroundColor: '#F9FAFB',
            border: `1px solid ${TUM_COLORS.gray30}`,
            borderRadius: 12,
            padding: 32,
            marginTop: 32,
            textAlign: 'left'
        }}>
            <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: TUM_COLORS.gray80,
                marginBottom: 24,
                textAlign: 'center'
            }}>
                Application Evaluation Process
            </h3>

            {/* Step 1: Formal Check */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
                    <div style={{
                        minWidth: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2
                    }}>
                        <FileCheck size={20} color={TUM_COLORS.blue} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: TUM_COLORS.gray80,
                            marginBottom: 8
                        }}>
                            1. Formal Check by the ASA
                        </h4>
                        <p style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.8,
                            marginBottom: 12,
                            fontWeight: 500
                        }}>
                            The ASA will check your application with attention to:
                        </p>
                        <ul style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray60,
                            lineHeight: 1.8,
                            paddingLeft: 24,
                            margin: 0,
                            listStyleType: 'disc',
                            listStylePosition: 'outside'
                        }}>
                            <li style={{ marginBottom: 10, paddingLeft: 4 }}>
                                <strong>Is the application formally correct and complete?</strong> Have all the necessary documents been submitted? Was the module successfully passed (transcript)?
                            </li>
                            <li style={{ marginBottom: 10, paddingLeft: 4 }}>
                                <strong>If your application does not pass the formal check,</strong> ASA will suggest failing the application due to formal insufficiency.
                            </li>
                            <li style={{ paddingLeft: 4 }}>
                                <strong>If your documents meet all the formal requirements,</strong> they will be forwarded to the faculty member responsible for the module for content evaluation.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Step 2: Content Evaluation */}
            <div>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
                    <div style={{
                        minWidth: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#F0FDF4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2
                    }}>
                        <UserCheck size={20} color="#22c55e" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: TUM_COLORS.gray80,
                            marginBottom: 8
                        }}>
                            2. Content-Related Evaluation
                        </h4>
                        <p style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.8,
                            marginBottom: 12,
                            fontWeight: 500
                        }}>
                            The faculty member who is responsible for the module will check your application with attention to:
                        </p>
                        <ul style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray60,
                            lineHeight: 1.8,
                            paddingLeft: 24,
                            margin: 0,
                            marginBottom: 12,
                            listStyleType: 'disc',
                            listStylePosition: 'outside'
                        }}>
                            <li style={{ paddingLeft: 4 }}>
                                <strong>Do the learning outcomes and skills match</strong> (module descriptions)?
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Email Notification */}
            <div style={{
                marginTop: 24,
                padding: 18,
                backgroundColor: '#EFF6FF',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'start',
                gap: 12
            }}>
                <Mail size={22} color={TUM_COLORS.blue} style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{
                    fontSize: 14,
                    color: TUM_COLORS.gray60,
                    lineHeight: 1.8,
                    margin: 0
                }}>
                    The evaluation result will be shared with you via <strong style={{ color: TUM_COLORS.gray80 }}>email</strong> and the results will be entered in <strong style={{ color: TUM_COLORS.gray80 }}>TUMonline</strong>.
                </p>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F4F6',
            padding: 32,
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                maxWidth: 700,
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 48,
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                {state === 'loading' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <Loader2 
                                size={64} 
                                color={TUM_COLORS.blue} 
                                style={{ animation: 'spin 1s linear infinite' }}
                            />
                        </div>
                        <h1 style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: TUM_COLORS.gray80,
                            marginBottom: 16
                        }}>
                            Processing Your Application
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.6
                        }}>
                            Please wait while we analyze your module mappings and generate your recognition report.
                            This may take a few moments...
                        </p>

                        <EvaluationProcess />
                    </>
                )}

                {state === 'success' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircle2 size={48} color="#22c55e" />
                            </div>
                        </div>
                        <h1 style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: TUM_COLORS.gray80,
                            marginBottom: 16
                        }}>
                            Application Submitted Successfully!
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.6,
                            marginBottom: 8
                        }}>
                            Your module recognition application has been received and analyzed.
                        </p>
                        {submissionId && (
                            <div style={{
                                backgroundColor: '#F9FAFB',
                                padding: 16,
                                borderRadius: 8,
                                marginTop: 24,
                                marginBottom: 24
                            }}>
                                <p style={{
                                    fontSize: 14,
                                    color: TUM_COLORS.gray50,
                                    marginBottom: 4
                                }}>
                                    Submission ID:
                                </p>
                                <p style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: TUM_COLORS.gray80,
                                    fontFamily: 'monospace'
                                }}>
                                    {submissionId}
                                </p>
                            </div>
                        )}

                        <EvaluationProcess />

                        <div style={{ 
                            display: 'flex', 
                            gap: 12, 
                            justifyContent: 'center',
                            marginTop: 32,
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={handleSubmitAnother}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 24px',
                                    backgroundColor: TUM_COLORS.blue,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TUM_COLORS.blue}
                            >
                                Submit Another Application
                            </button>
                            <button
                                onClick={handleBackToHome}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: TUM_COLORS.gray80,
                                    border: `1px solid ${TUM_COLORS.gray50}`,
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <Home size={20} />
                                Back to Homepage
                            </button>
                        </div>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: '#fee2e2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <XCircle size={48} color="#ef4444" />
                            </div>
                        </div>
                        <h1 style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: TUM_COLORS.gray80,
                            marginBottom: 16
                        }}>
                            Submission Failed
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.6,
                            marginBottom: 24
                        }}>
                            We encountered an error while processing your application.
                        </p>
                        {errorMessage && (
                            <div style={{
                                backgroundColor: '#fee2e2',
                                padding: 16,
                                borderRadius: 8,
                                marginBottom: 24,
                                textAlign: 'left'
                            }}>
                                <p style={{
                                    fontSize: 14,
                                    color: '#991b1b',
                                    lineHeight: 1.6
                                }}>
                                    {errorMessage}
                                </p>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate('/student/review')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: TUM_COLORS.blue,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TUM_COLORS.blue}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={handleBackToHome}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: TUM_COLORS.gray80,
                                    border: `1px solid ${TUM_COLORS.gray50}`,
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <Home size={20} />
                                Back to Homepage
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
