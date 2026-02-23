const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  // Run all count queries in parallel
  const [
    { count: totalRooms },
    { count: availableRooms },
    { count: occupiedRooms },
    { count: maintenanceRooms },
    { count: totalGuests },
    { count: totalStaff },
    { count: totalBookings },
    { count: activeBookings },
    { data: allBookings },
    { data: roomTypes },
    { data: recentRaw },
  ] = await Promise.all([
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Occupied'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('status', 'Maintenance'),
    supabase.from('guests').select('*', { count: 'exact', head: true }),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Confirmed'),
    supabase.from('bookings').select('total_amount, payment_status, created_at'),
    supabase.from('rooms').select('type'),
    supabase.from('bookings')
      .select('id, check_in, check_out, status, payment_status, total_amount, guest_id, room_id, guests ( first_name, last_name ), rooms ( room_number, type )')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Revenue calculations
  const paidBookings = (allBookings || []).filter(b => b.payment_status === 'Paid');
  const totalRevenue = paidBookings.reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);

  const now = new Date();
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRevenue = paidBookings
    .filter(b => (b.created_at || '').startsWith(thisMonthStr))
    .reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);

  const todayBookings = (allBookings || []).filter(b =>
    (b.created_at || '').startsWith(new Date().toISOString().split('T')[0])
  ).length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Monthly stats for chart (last 6 months)
  const monthlyMap = {};
  (allBookings || []).forEach(b => {
    const month = (b.created_at || '').slice(0, 7);
    if (!month) return;
    if (!monthlyMap[month]) monthlyMap[month] = { bookings: 0, revenue: 0 };
    monthlyMap[month].bookings++;
    if (b.payment_status === 'Paid') monthlyMap[month].revenue += parseFloat(b.total_amount || 0);
  });
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyStats = Object.entries(monthlyMap)
    .filter(([m]) => m >= sixMonthsAgo.toISOString().slice(0, 7))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, bookings: v.bookings, revenue: Math.round(v.revenue) }));

  // Room type distribution
  const typeCount = {};
  (roomTypes || []).forEach(r => { typeCount[r.type] = (typeCount[r.type] || 0) + 1; });
  const roomTypeStats = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

  // Flatten recent bookings
  const recentBookings = (recentRaw || []).map(b => ({
    id: b.id, check_in: b.check_in, check_out: b.check_out,
    status: b.status, payment_status: b.payment_status, total_amount: b.total_amount,
    guest_name: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : '',
    room_number: b.rooms?.room_number || '',
    room_type: b.rooms?.type || '',
  }));

  res.json({
    totalRooms, availableRooms, occupiedRooms, maintenanceRooms,
    totalGuests, totalStaff, totalBookings, activeBookings,
    todayBookings, totalRevenue, monthlyRevenue, occupancyRate,
    recentBookings, monthlyStats, roomTypeStats,
  });
});

module.exports = router;
