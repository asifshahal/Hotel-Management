const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/guests
router.get('/', auth, async (req, res) => {
    const { data, error } = await supabase.from('guests').select('*').order('last_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /api/guests/:id
router.get('/:id', auth, async (req, res) => {
    const { data, error } = await supabase.from('guests').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Guest not found' });
    res.json(data);
});

// POST /api/guests
router.post('/', auth, async (req, res) => {
    const { first_name, last_name, email, phone, id_type, id_number, nationality, address } = req.body;
    if (!first_name || !last_name || !email)
        return res.status(400).json({ error: 'first_name, last_name, and email are required' });

    const { data, error } = await supabase
        .from('guests')
        .insert({ first_name, last_name, email, phone: phone || '', id_type: id_type || '', id_number: id_number || '', nationality: nationality || '', address: address || '' })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Guest with this email already exists' });
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
});

// PUT /api/guests/:id
router.put('/:id', auth, async (req, res) => {
    const { data: existing, error: fetchErr } = await supabase.from('guests').select('*').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Guest not found' });

    const updates = {
        first_name: req.body.first_name || existing.first_name,
        last_name: req.body.last_name || existing.last_name,
        email: req.body.email || existing.email,
        phone: req.body.phone ?? existing.phone,
        id_type: req.body.id_type ?? existing.id_type,
        id_number: req.body.id_number ?? existing.id_number,
        nationality: req.body.nationality ?? existing.nationality,
        address: req.body.address ?? existing.address,
    };

    const { data, error } = await supabase.from('guests').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE /api/guests/:id
router.delete('/:id', auth, async (req, res) => {
    const { error: fetchErr } = await supabase.from('guests').select('id').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Guest not found' });

    const { error } = await supabase.from('guests').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Guest deleted successfully' });
});

module.exports = router;
