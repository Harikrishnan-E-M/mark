const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT id, name, date, max_mark FROM Activity';
  const params = [];

  if (q) {
    sql += ' WHERE name LIKE ?';
    params.push(`%${q}%`);
  }

  sql += ' ORDER BY date DESC, id DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, date, max_mark } = req.body;
  if (!name || !date || max_mark === undefined) {
    return res.status(400).json({ message: 'name, date and max_mark are required' });
  }

  const [result] = await pool.query(
    'INSERT INTO Activity (name, date, max_mark) VALUES (?, ?, ?)',
    [name, date, max_mark]
  );

  res.status(201).json({ id: result.insertId, message: 'Activity created' });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, max_mark } = req.body;
  if (!name || !date || max_mark === undefined) {
    return res.status(400).json({ message: 'name, date and max_mark are required' });
  }

  const [result] = await pool.query(
    'UPDATE Activity SET name = ?, date = ?, max_mark = ? WHERE id = ?',
    [name, date, max_mark, id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  res.json({ message: 'Activity updated' });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM Activity WHERE id = ?', [id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Activity not found' });
  }
  res.json({ message: 'Activity deleted' });
});

module.exports = router;
