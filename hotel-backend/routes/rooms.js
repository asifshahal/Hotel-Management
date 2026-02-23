const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/rooms
router.get('/', auth, async (req, res) => {
    const { data, error } = await supabase.from('rooms').select('*').order('room_number');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /api/rooms/:id
router.get('/:id', auth, async (req, res) => {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Room not found' });
    res.json(data);
});

// POST /api/rooms
router.post('/', auth, async (req, res) => {
    const { room_number, type, floor, capacity, price_per_night, status, amenities, description } = req.body;
    if (!room_number || !type || !price_per_night)
        return res.status(400).json({ error: 'room_number, type, and price_per_night are required' });

    const { data, error } = await supabase
        .from('rooms')
        .insert({ room_number, type, floor: floor || 1, capacity: capacity || 2, price_per_night, status: status || 'Available', amenities: amenities || '', description: description || '' })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Room number already exists' });
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
});

// PUT /api/rooms/:id
router.put('/:id', auth, async (req, res) => {
    const { data: existing, error: fetchErr } = await supabase.from('rooms').select('*').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Room not found' });

    const updates = {
        room_number: req.body.room_number || existing.room_number,
        type: req.body.type || existing.type,
        floor: req.body.floor ?? existing.floor,
        capacity: req.body.capacity ?? existing.capacity,
        price_per_night: req.body.price_per_night ?? existing.price_per_night,
        status: req.body.status || existing.status,
        amenities: req.body.amenities ?? existing.amenities,
        description: req.body.description ?? existing.description,
    };

    const { data, error } = await supabase.from('rooms').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE /api/rooms/:id
router.delete('/:id', auth, async (req, res) => {
    const { error: fetchErr } = await supabase.from('rooms').select('id').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Room not found' });

    const { error } = await supabase.from('rooms').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Room deleted successfully' });
});

module.exports = router;
