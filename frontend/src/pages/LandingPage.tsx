import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, ArrowRight } from 'lucide-react';
import { TUM_COLORS } from '../styles/tumStyles';

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    accentColor: string;
    bgGradient: string;
}

function RoleCard({ title, description, icon, onClick, accentColor, bgGradient }: RoleCardProps) {
    return (
        <button
            onClick={onClick}
            className="role-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 16,
                padding: 28,
                border: 'none',
                borderRadius: 16,
                backgroundColor: TUM_COLORS.white,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 180,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                background: bgGradient,
                borderRadius: '0 16px 0 100%',
                opacity: 0.1,
            }} />
            <div style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                backgroundColor: TUM_COLORS.white,
                border: `2px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: TUM_COLORS.gray80,
                    marginBottom: 8,
                }}>
                    {title}
                </div>
                <div style={{ 
                    fontSize: 14, 
                    color: TUM_COLORS.gray50,
                    lineHeight: 1.5,
                }}>
                    {description}
                </div>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: accentColor,
                fontSize: 14,
                fontWeight: 600,
            }}>
                Continue <ArrowRight size={16} />
            </div>
        </button>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: TUM_COLORS.grayBg,
            fontFamily: "'Inter', Arial, sans-serif",
        }}>
            {/* Hero Section */}
            <div style={{
                background: `linear-gradient(135deg, ${TUM_COLORS.blue} 0%, ${TUM_COLORS.blueDark} 50%, ${TUM_COLORS.blueDarker} 100%)`,
                padding: '80px 32px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
                    pointerEvents: 'none',
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        padding: '8px 16px',
                        borderRadius: 100,
                        marginBottom: 24,
                    }}>
                        <BookOpen size={16} color={TUM_COLORS.white} />
                        <span style={{ 
                            color: TUM_COLORS.white, 
                            fontSize: 13, 
                            fontWeight: 500,
                            letterSpacing: 0.5,
                        }}>
                            Technical University of Munich
                        </span>
                    </div>
                    
                    <h1 style={{ 
                        fontSize: 48, 
                        fontWeight: 800, 
                        color: TUM_COLORS.white, 
                        marginBottom: 16,
                        lineHeight: 1.2,
                        letterSpacing: -1,
                    }}>
                        ARIP
                    </h1>
                    <h2 style={{ 
                        fontSize: 22, 
                        fontWeight: 400, 
                        color: 'rgba(255,255,255,0.9)', 
                        marginBottom: 16,
                        maxWidth: 600,
                        margin: '0 auto 16px',
                    }}>
                        Academic Recognition Intelligence Platform
                    </h2>
                    <p style={{ 
                        fontSize: 16, 
                        color: 'rgba(255,255,255,0.7)', 
                        maxWidth: 500,
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        Streamline your course recognition process with AI-powered analysis and intelligent recommendations
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 32px',
            }}>
                <div style={{
                    maxWidth: 900,
                    width: '100%',
                }}>
                    <div style={{ 
                        textAlign: 'center', 
                        marginBottom: 40,
                    }}>
                        <h3 style={{ 
                            fontSize: 24, 
                            fontWeight: 700, 
                            color: TUM_COLORS.gray80,
                            marginBottom: 8,
                        }}>
                            Select Your Portal
                        </h3>
                        <p style={{ 
                            fontSize: 15, 
                            color: TUM_COLORS.gray50,
                        }}>
                            Choose your role to access the appropriate dashboard
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: 24,
                    }}>
                        <RoleCard
                            title="Student Portal"
                            description="Submit your course recognition application and track its progress"
                            icon={<GraduationCap size={26} />}
                            onClick={() => navigate('/student')}
                            accentColor={TUM_COLORS.blue}
                            bgGradient={`linear-gradient(135deg, ${TUM_COLORS.blue} 0%, ${TUM_COLORS.blueDark} 100%)`}
                        />
                        <RoleCard
                            title="Staff Portal"
                            description="Review and manage student recognition applications"
                            icon={<Users size={26} />}
                            onClick={() => navigate('/staff/dashboard')}
                            accentColor={TUM_COLORS.orange}
                            bgGradient={`linear-gradient(135deg, ${TUM_COLORS.orange} 0%, #c45d1a 100%)`}
                        />
                        <RoleCard
                            title="Professor Portal"
                            description="Evaluate course equivalencies and make recognition decisions"
                            icon={<BookOpen size={26} />}
                            onClick={() => navigate('/staff/dashboard')}
                            accentColor={TUM_COLORS.green}
                            bgGradient={`linear-gradient(135deg, ${TUM_COLORS.green} 0%, #7a8200 100%)`}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                backgroundColor: TUM_COLORS.blueDarker,
                padding: '24px 32px',
                textAlign: 'center',
            }}>
                <p style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: 13,
                    margin: 0,
                }}>
                    © {new Date().getFullYear()} Technical University of Munich — School of Computation, Information and Technology
                </p>
            </footer>
        </div>
    );
}
