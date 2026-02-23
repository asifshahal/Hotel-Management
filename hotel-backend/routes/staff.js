const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/staff
router.get('/', auth, async (req, res) => {
    const { data, error } = await supabase.from('staff').select('*').order('last_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /api/staff/:id
router.get('/:id', auth, async (req, res) => {
    const { data, error } = await supabase.from('staff').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Staff member not found' });
    res.json(data);
});

// POST /api/staff
router.post('/', auth, async (req, res) => {
    const { first_name, last_name, email, phone, role, department, salary, status, join_date } = req.body;
    if (!first_name || !last_name || !email || !role || !department)
        return res.status(400).json({ error: 'first_name, last_name, email, role, department are required' });

    const { data, error } = await supabase
        .from('staff')
        .insert({
            first_name, last_name, email,
            phone: phone || '',
            role, department,
            salary: salary || 0,
            status: status || 'Active',
            join_date: join_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Staff with this email already exists' });
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
});

// PUT /api/staff/:id
router.put('/:id', auth, async (req, res) => {
    const { data: existing, error: fetchErr } = await supabase.from('staff').select('*').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Staff member not found' });

    const updates = {
        first_name: req.body.first_name || existing.first_name,
        last_name: req.body.last_name || existing.last_name,
        email: req.body.email || existing.email,
        phone: req.body.phone ?? existing.phone,
        role: req.body.role || existing.role,
        department: req.body.department || existing.department,
        salary: req.body.salary ?? existing.salary,
        status: req.body.status || existing.status,
        join_date: req.body.join_date || existing.join_date,
    };

    const { data, error } = await supabase.from('staff').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE /api/staff/:id
router.delete('/:id', auth, async (req, res) => {
    const { error: fetchErr } = await supabase.from('staff').select('id').eq('id', req.params.id).single();
    if (fetchErr) return res.status(404).json({ error: 'Staff member not found' });

    const { error } = await supabase.from('staff').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Staff member deleted successfully' });
});

module.exports = router;
