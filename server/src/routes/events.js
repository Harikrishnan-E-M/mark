const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { level, q } = req.query;
  const where = [];
  const params = [];

  if (level) {
    where.push('level = ?');
    params.push(level);
  }

  if (q) {
    where.push('name LIKE ?');
    params.push(`%${q}%`);
  }

  const sql = `
    SELECT id, name, date, level
    FROM Event
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY date DESC, id DESC
  `;

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, date, level } = req.body;
  if (!name || !date || !level) {
    return res.status(400).json({ message: 'name, date and level are required' });
  }

  const [result] = await pool.query(
    'INSERT INTO Event (name, date, level) VALUES (?, ?, ?)',
    [name, date, level]
  );

  res.status(201).json({ id: result.insertId, message: 'Event created' });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, level } = req.body;
  if (!name || !date || !level) {
    return res.status(400).json({ message: 'name, date and level are required' });
  }

  const [result] = await pool.query(
    'UPDATE Event SET name = ?, date = ?, level = ? WHERE id = ?',
    [name, date, level, id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ message: 'Event updated' });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM Event WHERE id = ?', [id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json({ message: 'Event deleted' });
});

module.exports = router;
