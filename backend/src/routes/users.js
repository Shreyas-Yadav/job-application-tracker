const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/upsert', async (req, res) => {
  try {
    const { email, name, avatar_url, provider, provider_account_id } = req.body;
    if (!email || !provider || !provider_account_id) {
      return res.status(400).json({ error: 'email, provider, and provider_account_id are required' });
    }

    await pool.execute(
      `INSERT INTO users (email, name, avatar_url, provider, provider_account_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), avatar_url = VALUES(avatar_url)`,
      [email, name || null, avatar_url || null, provider, provider_account_id]
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    res.json(rows[0]);
  } catch (err) {
    console.error('User upsert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
