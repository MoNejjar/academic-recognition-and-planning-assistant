
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    LayoutDashboard,
    FlaskConical,
    Archive,
    LogOut
} from 'lucide-react';



const SidebarItem = ({ icon: Icon, label, isActive, onClick }: any) => {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isActive ? '#3069d6' : 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                color: isActive ? 'white' : '#E2E8F0',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: 14,
                opacity: !isActive ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#E2E8F0';
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );
};

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active path for highlighting
    const currentPath = location.pathname;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/staff/kanban' },
        { icon: CheckSquare, label: 'Tasks', path: '/staff/tasks' },
        { icon: Archive, label: 'Archive', path: '/staff/archive' },
        { icon: FlaskConical, label: 'Testing', path: '/staff/testing' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            {/* Sidebar */}
            <div style={{
                width: 260,
                backgroundColor: '#1E293B', // Slate 800
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50,
                color: 'white'
            }}>
                {/* Logo Area */}
                <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid #334155' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#3B82F6' }}>TUM</span> ARIP
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Academic Recognition Intelligence Portal</div>
                </div>

                {/* Navigation */}
                <div style={{ padding: 16, flex: 1 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12, paddingLeft: 12 }}>
                        Main Menu
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                icon={item.icon}
                                label={item.label}
                                path={item.path}
                                isActive={currentPath.includes(item.path)}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </div>
                </div>

                {/* User Profile */}
                <div style={{ padding: 16, borderTop: '1px solid #334155' }}>
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
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                    >
                        <div style={{
                            width: 24,
                            height: 24,
                            backgroundColor: '#334155',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#E2E8F0',
                            fontSize: 10
                        }}>
                            PS
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Prof. Smith</div>
                        </div>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: 260, minWidth: 0 }}>
                <Outlet />
            </div>
        </div>
    );
}
