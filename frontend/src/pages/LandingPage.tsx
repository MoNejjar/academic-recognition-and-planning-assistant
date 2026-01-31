
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School } from 'lucide-react';

const TUM_COLORS = {
    blue: '#0065BD',
    white: '#FFFFFF',
    gray80: '#333333',
};

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F4F6',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: 48,
                borderRadius: 16,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                maxWidth: 600,
                width: '100%',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    backgroundColor: TUM_COLORS.blue,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    borderRadius: 12,
                    margin: '0 auto 24px'
                }}>
                    T
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 8 }}>
                    TUM ARIP
                </h1>
                <p style={{ color: '#6B7280', marginBottom: 48 }}>
                    Please select your role to continue
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <button
                        onClick={() => navigate('/student')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                            padding: 32,
                            border: '2px solid #E5E7EB',
                            borderRadius: 12,
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = TUM_COLORS.blue;
                            e.currentTarget.style.backgroundColor = '#F0F9FF';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            backgroundColor: '#DBEAFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: TUM_COLORS.blue
                        }}>
                            <GraduationCap size={28} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80 }}>Student Access</div>
                    </button>

                    <button
                        onClick={() => navigate('/staff/dashboard')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                            padding: 32,
                            border: '2px solid #E5E7EB',
                            borderRadius: 12,
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = TUM_COLORS.blue;
                            e.currentTarget.style.backgroundColor = '#F0F9FF';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            backgroundColor: '#FEF3C7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#D97706'
                        }}>
                            <School size={28} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80 }}>Professor & Staff</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
