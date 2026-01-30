import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react';
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

    useEffect(() => {
        const locationState = location.state as LocationState;
        
        if (!locationState?.submissionData) {
            // No submission data, redirect back
            navigate('/student');
            return;
        }

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
                maxWidth: 600,
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
                        <p style={{
                            fontSize: 14,
                            color: TUM_COLORS.gray50,
                            lineHeight: 1.6,
                            marginBottom: 32
                        }}>
                            A professor will review your submission and you'll be notified of the decision.
                        </p>
                        <button
                            onClick={handleBackToHome}
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
                            <Home size={20} />
                            Back to Homepage
                        </button>
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
