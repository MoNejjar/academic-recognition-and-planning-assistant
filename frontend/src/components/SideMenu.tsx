
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Upload, BookOpen, CheckCircle2, LogOut } from 'lucide-react';


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

  // Helper to check if a step is accessible (previous step must be done)
  const isAccessible = (step: string) => {
    switch (step) {
      case '': // Personal Data is always accessible
        return true;
      case 'mapping':
        return progress.personalData;
      case 'catalogue':
        return progress.mapping;
      case 'review':
        return progress.catalogue;
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
      backgroundColor: '#f8fafc', // Light background
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      color: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      borderRight: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#0065BD' }}>TUM</span> Assistant
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Student Portal</div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12, paddingLeft: 12 }}>
          Application Steps
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const accessible = isAccessible(item.id);
            const active = isActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
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
                  backgroundColor: active ? '#0065BD' : 'transparent', // TUM Blue for active
                  color: active ? 'white' : accessible ? '#1e293b' : '#94a3b8',
                  transition: 'all 0.2s',
                  opacity: accessible ? 1 : 0.5
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                {!accessible && (
                  <div style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>🔒</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: '1px solid #e2e8f0' }}>
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
            color: '#64748b',
            backgroundColor: 'transparent',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          <LogOut size={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </div>
  );
}
