import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { MdLock, MdSave } from 'react-icons/md';

export default function Settings() {
    const { user } = useAuth();
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields are required');
        if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('New passwords do not match');
        if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
        setSaving(true);
        try {
            await authAPI.changePassword({ username: user.username, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error changing password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div><h2>Settings</h2><p>Manage your account settings</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
                {/* Account Info */}
                <div className="table-section">
                    <div className="table-header"><h3>👤 Account Information</h3></div>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <InfoRow label="Username" value={user?.username} />
                        <InfoRow label="Role" value={user?.role} />
                        <InfoRow label="System" value="LuxeStay Hotel Manager" />
                        <InfoRow label="Version" value="1.0.0" />
                    </div>
                </div>

                {/* Change Password */}
                <div className="table-section">
                    <div className="table-header"><h3>🔒 Change Password</h3></div>
                    <form onSubmit={handleChangePassword} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                className="form-input" type="password"
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                className="form-input" type="password"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                className="form-input" type="password"
                                value={pwForm.confirmPassword}
                                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={saving}>
                            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><MdSave size={16} /> Change Password</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* System Info */}
            <div className="table-section" style={{ marginTop: 20, maxWidth: 900 }}>
                <div className="table-header"><h3>🏨 System Information</h3></div>
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InfoRow label="Hotel Name" value="LuxeStay Hotel" />
                    <InfoRow label="Backend" value="Node.js + Express" />
                    <InfoRow label="Database" value="SQLite (better-sqlite3)" />
                    <InfoRow label="Frontend" value="React + Vite" />
                    <InfoRow label="Authentication" value="JWT (24h expiry)" />
                    <InfoRow label="API Port" value="5000" />
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}
