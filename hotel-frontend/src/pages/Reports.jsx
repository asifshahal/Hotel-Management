import { useState, useEffect } from 'react';
import { dashboardAPI, bookingsAPI } from '../api';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([dashboardAPI.getStats(), bookingsAPI.getAll()])
            .then(([s, b]) => { setStats(s.data); setBookings(b.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading reports...</div>;
    if (!stats) return <div className="empty-state"><p>Failed to load reports</p></div>;

    const monthData = stats.monthlyStats.map(m => {
        const [yr, mo] = m.month.split('-');
        return {
            month: new Date(yr, +mo - 1).toLocaleString('default', { month: 'short' }),
            bookings: m.bookings,
            revenue: Math.round(m.revenue),
        };
    });

    const statusData = [
        { name: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length },
        { name: 'Checked Out', value: bookings.filter(b => b.status === 'Checked Out').length },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length },
    ].filter(d => d.value > 0);

    const paymentData = [
        { name: 'Paid', value: bookings.filter(b => b.payment_status === 'Paid').length },
        { name: 'Pending', value: bookings.filter(b => b.payment_status === 'Pending').length },
        { name: 'Refunded', value: bookings.filter(b => b.payment_status === 'Refunded').length },
    ].filter(d => d.value > 0);

    const tooltipStyle = { background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' };

    return (
        <div>
            <div className="page-header">
                <div><h2>Reports & Analytics</h2><p>Hotel performance overview</p></div>
            </div>

            {/* KPI Row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <StatBox label="Occupancy Rate" value={`${stats.occupancyRate}%`} color="var(--blue)" />
                <StatBox label="Total Revenue" value={`$${stats.totalRevenue?.toLocaleString()}`} color="var(--green)" />
                <StatBox label="This Month" value={`$${stats.monthlyRevenue?.toLocaleString()}`} color="var(--accent)" />
                <StatBox label="Total Bookings" value={stats.totalBookings} color="var(--purple)" />
            </div>

            <div className="content-grid-2" style={{ marginBottom: 20 }}>
                <div className="chart-section">
                    <h3>📊 Monthly Bookings</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-section">
                    <h3>💰 Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={monthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Revenue']} />
                            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="content-grid-2">
                <div className="chart-section">
                    <h3>📋 Booking Status</h3>
                    {statusData.length === 0 ? (
                        <div className="empty-state"><p>No booking data</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-section">
                    <h3>💳 Payment Status</h3>
                    {paymentData.length === 0 ? (
                        <div className="empty-state"><p>No payment data</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}
