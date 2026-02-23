import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
    '/': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening today.' },
    '/rooms': { title: 'Room Management', subtitle: 'Manage your hotel rooms and availability.' },
    '/bookings': { title: 'Bookings', subtitle: 'Manage reservations and check-ins.' },
    '/guests': { title: 'Guests', subtitle: 'View and manage guest profiles.' },
    '/staff': { title: 'Staff Management', subtitle: 'Manage your hotel staff and roles.' },
    '/reports': { title: 'Reports & Analytics', subtitle: 'View hotel performance metrics.' },
    '/settings': { title: 'Settings', subtitle: 'Configure hotel preferences.' },
};

export default function Header() {
    const { user } = useAuth();
    const location = useLocation();
    const page = pageTitles[location.pathname] || { title: 'Hotel Manager', subtitle: '' };

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="header">
            <div className="header-left">
                <h1>{page.title}</h1>
                <p>{page.subtitle}</p>
            </div>
            <div className="header-right">
                <div className="header-date">{dateStr}</div>
                <div className="user-badge">
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user?.username}</span>
                </div>
            </div>
        </header>
    );
}
