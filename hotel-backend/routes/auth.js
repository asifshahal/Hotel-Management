const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_super_secret_key_2024';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password required' });

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password required' });

    const hashed = bcrypt.hashSync(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert({ username, password: hashed, role: role || 'admin' })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Username already exists' });
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ id: data.id, username: data.username, role: data.role });
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const valid = bcrypt.compareSync(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = bcrypt.hashSync(newPassword, 10);
    await supabase.from('users').update({ password: hashed }).eq('username', username);
    res.json({ message: 'Password changed successfully' });
});

module.exports = router;
