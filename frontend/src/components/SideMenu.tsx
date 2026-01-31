import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Upload, BookOpen, CheckCircle2, LogOut, HelpCircle, X, MessageCircle, Mail, Video } from 'lucide-react';
import tumLogo from '../assets/tum-logo.svg';


interface SideMenuProps {
  progress: {
    personalData: boolean;
    mapping: boolean;
    catalogue: boolean;
    review: boolean;
  };
}

export default function SideMenu({ progress }: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  // Helper to check if a step is accessible (previous step must be done)
  const isAccessible = (step: string) => {
    switch (step) {
      case '': // Personal Data is always accessible
        return true;
      case 'mapping':
        return progress.mapping; // Unlocked when personal data is filled
      case 'catalogue':
        return progress.catalogue; // Unlocked when mapping is done
      case 'review':
        return progress.review; // Unlocked when catalogue has content
      default:
        return false;
    }
  };

  // Helper to determine active state
  const isActive = (path: string) => {
    // Handle root path specially
    if (path === '' && location.pathname === '/student') return true;

    // Handle sub-paths
    return location.pathname.startsWith(`/student/${path}`) && path !== '';
  };

  const menuItems = [
    { id: '', label: 'Personal Data', icon: User },
    { id: 'mapping', label: 'Mapping Upload', icon: Upload },
    { id: 'catalogue', label: 'Catalogue Upload', icon: BookOpen },
    { id: 'review', label: 'Final Review', icon: CheckCircle2 },
  ];

  return (
    <div style={{
      width: 260,
      backgroundColor: '#1E293B', // Dark slate - matching staff view
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <img 
            src={tumLogo} 
            alt="TUM Logo" 
            style={{ height: 28, filter: 'brightness(0) invert(1)' }} 
          />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
          Academic Recognition<br />Intelligence Platform
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12, paddingLeft: 12 }}>
          Application Steps
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item, index) => {
            const accessible = isAccessible(item.id);
            const active = isActive(item.id);
            const Icon = item.icon;

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => accessible && navigate(item.id ? `/student/${item.id}` : '/student')}
                  disabled={!accessible}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    cursor: accessible ? 'pointer' : 'not-allowed',
                    backgroundColor: active ? '#3069d6' : 'transparent',
                    color: active ? 'white' : accessible ? '#E2E8F0' : '#64748B',
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                    fontSize: 14,
                    opacity: accessible ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (accessible && !active) {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessible && !active) {
                      e.currentTarget.style.color = '#E2E8F0';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {!accessible && (
                    <div style={{ 
                      fontSize: 16,
                      color: '#64748B',
                      lineHeight: 1
                    }}>🔒</div>
                  )}
                </button>
                {index < menuItems.length - 1 && accessible && (
                  <div style={{
                    position: 'absolute',
                    left: 24,
                    bottom: -4,
                    width: 2,
                    height: 8,
                    backgroundColor: '#334155',
                    borderRadius: 1
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: '1px solid #334155' }}>
        <button
          onClick={() => setShowContactModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 8,
            width: '100%',
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            color: '#94A3B8',
            backgroundColor: 'transparent',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s',
            marginBottom: 4
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
        >
          <HelpCircle size={18} />
          <span>Contact Us</span>
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 8,
            width: '100%',
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            color: '#94A3B8',
            backgroundColor: 'transparent',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
        >
          <LogOut size={18} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Contact Us Modal */}
      {showContactModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              width: '90%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={22} color="#3B82F6" />
                Need Help?
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#64748B'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20 }}>
              {/* Try Chatbot First */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <MessageCircle size={24} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: 6 }}>Try our AI Assistant first!</div>
                    <p style={{ margin: 0, fontSize: 14, color: '#3B82F6', lineHeight: 1.5 }}>
                      Our chatbot can answer most questions about the application process, module recognition, and required documents instantly.
                    </p>
                    <button
                      onClick={() => {
                        setShowContactModal(false);
                        // Trigger chatbot open by dispatching custom event
                        window.dispatchEvent(new CustomEvent('openChatbot'));
                      }}
                      style={{
                        marginTop: 12,
                        padding: '10px 16px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14
                      }}
                    >
                      <MessageCircle size={16} />
                      Open Chatbot
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>OR CONTACT US DIRECTLY</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              </div>

              {/* Email Contact */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Mail size={20} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Email</div>
                    <a
                      href="mailto:credit_recognition.soh@xcit.tum.de"
                      style={{ color: '#3B82F6', textDecoration: 'none', fontSize: 14 }}
                    >
                      credit_recognition.soh@xcit.tum.de
                    </a>
                  </div>
                </div>
              </div>

              {/* Consultation Hours */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Video size={20} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: 8 }}>Virtual Consultation Hours</div>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                      <strong>Schedule:</strong> 1st and 3rd Friday of each month<br />
                      <strong>Time:</strong> 10:00 – 11:00 a.m.<br />
                      <strong>Zoom Meeting-ID:</strong> 622 1548 6938<br />
                      <strong>Code:</strong> 598361
                    </p>
                    <a
                      href="https://tum-conf.zoom-x.de/j/62215486938?pwd=YlRKdDIzSWw0OFkralE4bEFnU0p1UT09"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 12,
                        padding: '8px 12px',
                        backgroundColor: '#E2E8F0',
                        color: '#334155',
                        borderRadius: 6,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      <Video size={14} />
                      Join Zoom Meeting
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
