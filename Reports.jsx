import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MdDashboard, MdHotel, MdEventNote, MdPeople,
    MdBadge, MdBarChart, MdSettings, MdLogout
} from 'react-icons/md';

const navItems = [
    { path: '/', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/rooms', icon: <MdHotel />, label: 'Rooms' },
    { path: '/bookings', icon: <MdEventNote />, label: 'Bookings' },
    { path: '/guests', icon: <MdPeople />, label: 'Guests' },
    { path: '/staff', icon: <MdBadge />, label: 'Staff' },
    { path: '/reports', icon: <MdBarChart />, label: 'Reports' },
    { path: '/settings', icon: <MdSettings />, label: 'Settings' },
];

export default function Sidebar() {
    const { logout, user } = useAuth();
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🏨</div>
                <div className="sidebar-logo-text">
                    <h2>LuxeStay</h2>
                    <span>Hotel Manager</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="sidebar-section-label">Main Menu</span>
                {navItems.map(({ path, icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Logged in as</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
                <button className="nav-link" onClick={logout} style={{ color: 'var(--red)' }}>
                    <span className="nav-icon"><MdLogout /></span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
