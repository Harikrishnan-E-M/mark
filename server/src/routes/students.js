const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { dept, section, q } = req.query;
  const where = [];
  const params = [];

  if (dept) {
    where.push('dept = ?');
    params.push(dept);
  }
  if (section) {
    where.push('section = ?');
    params.push(section);
  }
  if (q) {
    where.push('(name LIKE ? OR roll LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const sql = `
    SELECT roll, name, dept, section
    FROM Student
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY roll
  `;

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:roll', async (req, res) => {
  const { roll } = req.params;
  const [rows] = await pool.query('SELECT roll, name, dept, section FROM Student WHERE roll = ?', [roll]);
  if (!rows.length) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { roll, name, dept, section } = req.body;
  if (!roll || !name || !dept || !section) {
    return res.status(400).json({ message: 'roll, name, dept and section are required' });
  }

  await pool.query(
    'INSERT INTO Student (roll, name, dept, section) VALUES (?, ?, ?, ?)',
    [roll, name, dept, section]
  );
  res.status(201).json({ message: 'Student created' });
});

router.put('/:roll', async (req, res) => {
  const { roll } = req.params;
  const { name, dept, section } = req.body;
  if (!name || !dept || !section) {
    return res.status(400).json({ message: 'name, dept and section are required' });
  }

  const [result] = await pool.query(
    'UPDATE Student SET name = ?, dept = ?, section = ? WHERE roll = ?',
    [name, dept, section, roll]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({ message: 'Student updated' });
});

router.delete('/:roll', async (req, res) => {
  const { roll } = req.params;
  const [result] = await pool.query('DELETE FROM Student WHERE roll = ?', [roll]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json({ message: 'Student deleted' });
});

module.exports = router;
