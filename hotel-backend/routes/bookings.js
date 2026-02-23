const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/bookings
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guests ( first_name, last_name, email, phone ),
      rooms ( room_number, type, price_per_night )
    `)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Flatten nested joins for frontend compatibility
  const flat = data.map(b => ({
    ...b,
    guest_name: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : '',
    guest_email: b.guests?.email || '',
    guest_phone: b.guests?.phone || '',
    room_number: b.rooms?.room_number || '',
    room_type: b.rooms?.type || '',
    price_per_night: b.rooms?.price_per_night || 0,
    guests: undefined,
    rooms: undefined,
  }));

  res.json(flat);
});

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, guests ( first_name, last_name, email ), rooms ( room_number, type, price_per_night )`)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Booking not found' });

  const flat = {
    ...data,
    guest_name: data.guests ? `${data.guests.first_name} ${data.guests.last_name}` : '',
    guest_email: data.guests?.email || '',
    room_number: data.rooms?.room_number || '',
    room_type: data.rooms?.type || '',
    price_per_night: data.rooms?.price_per_night || 0,
    guests: undefined, rooms: undefined,
  };
  res.json(flat);
});

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  const { guest_id, room_id, check_in, check_out, adults, children, total_amount, status, payment_status, special_requests } = req.body;
  if (!guest_id || !room_id || !check_in || !check_out || !total_amount)
    return res.status(400).json({ error: 'guest_id, room_id, check_in, check_out, total_amount are required' });

  // Check availability: find overlapping bookings for this room
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room_id)
    .not('status', 'in', '("Cancelled","Checked Out")')
    .lt('check_in', check_out)
    .gt('check_out', check_in);

  if (conflicts && conflicts.length > 0)
    return res.status(409).json({ error: 'Room is not available for selected dates' });

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      guest_id, room_id, check_in, check_out,
      adults: adults || 1,
      children: children || 0,
      total_amount,
      status: status || 'Confirmed',
      payment_status: payment_status || 'Pending',
      special_requests: special_requests || '',
    })
    .select(`*, guests ( first_name, last_name ), rooms ( room_number, type )`)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Mark room as Occupied
  await supabase.from('rooms').update({ status: 'Occupied' }).eq('id', room_id);

  const flat = {
    ...data,
    guest_name: data.guests ? `${data.guests.first_name} ${data.guests.last_name}` : '',
    room_number: data.rooms?.room_number || '',
    room_type: data.rooms?.type || '',
    guests: undefined, rooms: undefined,
  };
  res.status(201).json(flat);
});

// PUT /api/bookings/:id
router.put('/:id', auth, async (req, res) => {
  const { data: existing, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  if (fetchErr) return res.status(404).json({ error: 'Booking not found' });

  const newStatus = req.body.status || existing.status;
  const updates = {
    guest_id: req.body.guest_id || existing.guest_id,
    room_id: req.body.room_id || existing.room_id,
    check_in: req.body.check_in || existing.check_in,
    check_out: req.body.check_out || existing.check_out,
    adults: req.body.adults ?? existing.adults,
    children: req.body.children ?? existing.children,
    total_amount: req.body.total_amount ?? existing.total_amount,
    status: newStatus,
    payment_status: req.body.payment_status || existing.payment_status,
    special_requests: req.body.special_requests ?? existing.special_requests,
  };

  const { data, error } = await supabase.from('bookings').update(updates).eq('id', req.params.id)
    .select(`*, guests ( first_name, last_name ), rooms ( room_number, type, price_per_night )`)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Sync room status
  const rid = updates.room_id;
  if (newStatus === 'Checked Out' || newStatus === 'Cancelled') {
    await supabase.from('rooms').update({ status: 'Available' }).eq('id', rid);
  } else if (newStatus === 'Confirmed') {
    await supabase.from('rooms').update({ status: 'Occupied' }).eq('id', rid);
  }

  const flat = {
    ...data,
    guest_name: data.guests ? `${data.guests.first_name} ${data.guests.last_name}` : '',
    room_number: data.rooms?.room_number || '',
    room_type: data.rooms?.type || '',
    price_per_night: data.rooms?.price_per_night || 0,
    guests: undefined, rooms: undefined,
  };
  res.json(flat);
});

// DELETE /api/bookings/:id
router.delete('/:id', auth, async (req, res) => {
  const { data: existing, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  if (fetchErr) return res.status(404).json({ error: 'Booking not found' });

  await supabase.from('rooms').update({ status: 'Available' }).eq('id', existing.room_id);
  const { error } = await supabase.from('bookings').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Booking deleted successfully' });
});

module.exports = router;
