import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import Badge from '../components/Badge';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MdHotel, MdEventNote, MdPeople, MdAttachMoney, MdBadge, MdTrendingUp } from 'react-icons/md';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

function StatCard({ label, value, icon, color, sub, cardBg }) {
    return (
        <div className="stat-card" style={{ '--card-color': color, '--card-bg': cardBg }}>
            <div className="stat-card-header">
                <div>
                    <div className="stat-card-label">{label}</div>
                    <div className="stat-card-value">{value}</div>
                    {sub && <div className="stat-card-sub">{sub}</div>}
                </div>
                <div className="stat-card-icon">{icon}</div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.getStats()
            .then(r => { setStats(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading-spinner">
            <div className="spinner" /> Loading dashboard...
        </div>
    );

    if (!stats) return <div className="empty-state"><p>Failed to load stats</p></div>;

    const monthLabels = stats.monthlyStats.map(m => {
        const [yr, mo] = m.month.split('-');
        return new Date(yr, parseInt(mo) - 1).toLocaleString('default', { month: 'short' });
    });
    const chartData = stats.monthlyStats.map((m, i) => ({
        month: monthLabels[i],
        bookings: m.bookings,
        revenue: Math.round(m.revenue),
    }));

    return (
        <div>
            <div className="stats-grid">
                <StatCard label="Total Rooms" value={stats.totalRooms} icon={<MdHotel />} color="#3b82f6" cardBg="rgba(59,130,246,0.1)" sub={`${stats.occupancyRate}% occupied`} />
                <StatCard label="Available Rooms" value={stats.availableRooms} icon={<MdHotel />} color="#10b981" cardBg="rgba(16,185,129,0.1)" sub="Ready for booking" />
                <StatCard label="Active Bookings" value={stats.activeBookings} icon={<MdEventNote />} color="#f59e0b" cardBg="rgba(245,158,11,0.1)" sub={`${stats.todayBookings} new today`} />
                <StatCard label="Total Guests" value={stats.totalGuests} icon={<MdPeople />} color="#8b5cf6" cardBg="rgba(139,92,246,0.1)" sub="Registered profiles" />
                <StatCard label="Total Revenue" value={`$${stats.totalRevenue?.toLocaleString()}`} icon={<MdAttachMoney />} color="#10b981" cardBg="rgba(16,185,129,0.1)" sub={`$${stats.monthlyRevenue?.toLocaleString()} this month`} />
                <StatCard label="Staff Members" value={stats.totalStaff} icon={<MdBadge />} color="#f59e0b" cardBg="rgba(245,158,11,0.1)" sub="Active employees" />
            </div>

            <div className="content-grid-2" style={{ marginBottom: 20 }}>
                <div className="chart-section">
                    <h3>📈 Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }}
                                formatter={(v) => [`$${v}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#revGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-section">
                    <h3>🏠 Room Types</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={stats.roomTypeStats} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ type, count }) => `${type}: ${count}`} labelLine={false}>
                                {stats.roomTypeStats.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="table-section">
                <div className="table-header">
                    <h3>🗓️ Recent Bookings</h3>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Room</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentBookings.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bookings yet</td></tr>
                            ) : stats.recentBookings.map(b => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.guest_name}</td>
                                    <td>{b.room_number} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({b.room_type})</span></td>
                                    <td>{b.check_in}</td>
                                    <td>{b.check_out}</td>
                                    <td className="revenue-amount">${b.total_amount?.toLocaleString()}</td>
                                    <td><Badge status={b.status} /></td>
                                    <td><Badge status={b.payment_status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
