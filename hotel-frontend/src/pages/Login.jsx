import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdLock, MdPerson } from 'react-icons/md';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) return toast.error('Please enter credentials');
        setLoading(true);
        try {
            await login(form.username, form.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🏨</div>
                    <h1>LuxeStay</h1>
                    <p>Hotel Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <MdPerson style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 36 }}
                                type="text"
                                placeholder="Enter username"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 36 }}
                                type="password"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Signing in...</> : '🔑 Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Default credentials</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Username: <strong style={{ color: 'var(--accent)' }}>admin</strong> &nbsp;|&nbsp;
                        Password: <strong style={{ color: 'var(--accent)' }}>admin123</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
