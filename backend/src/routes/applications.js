const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC';
    const params = [req.user.id];

    if (status) {
      query = 'SELECT * FROM job_applications WHERE user_id = ? AND status = ? ORDER BY created_at DESC';
      params.push(status);
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/applications
router.post('/', async (req, res) => {
  try {
    const { company, role, status = 'applied', date_applied } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'company and role are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO job_applications (company, role, status, date_applied, user_id) VALUES (?, ?, ?, ?, ?)',
      [company, role, status, date_applied || null, req.user.id]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM job_applications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/applications/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role, status, date_applied } = req.body;

    const [existing] = await pool.execute(
      'SELECT * FROM job_applications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = {
      company: company ?? existing[0].company,
      role: role ?? existing[0].role,
      status: status ?? existing[0].status,
      date_applied: date_applied !== undefined ? date_applied : existing[0].date_applied,
    };

    await pool.execute(
      'UPDATE job_applications SET company = ?, role = ?, status = ?, date_applied = ? WHERE id = ? AND user_id = ?',
      [updated.company, updated.role, updated.status, updated.date_applied, id, req.user.id]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM job_applications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM job_applications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
