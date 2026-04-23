const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const sql = `
    SELECT
      sa.stid,
      s.name AS student_name,
      sa.actid,
      a.name AS activity_name,
      a.max_mark,
      sa.mark
    FROM Student_Activity sa
    JOIN Student s ON s.roll = sa.stid
    JOIN Activity a ON a.id = sa.actid
    ORDER BY sa.stid, sa.actid
  `;
  const [rows] = await pool.query(sql);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { stid, actid, mark } = req.body;
  if (!stid || !actid || mark === undefined) {
    return res.status(400).json({ message: 'stid, actid and mark are required' });
  }

  await pool.query(
    'INSERT INTO Student_Activity (stid, actid, mark) VALUES (?, ?, ?)',
    [stid, actid, mark]
  );

  res.status(201).json({ message: 'Student activity mark added' });
});

router.put('/:stid/:actid', async (req, res) => {
  const { stid, actid } = req.params;
  const { mark } = req.body;

  if (mark === undefined) {
    return res.status(400).json({ message: 'mark is required' });
  }

  const [result] = await pool.query(
    'UPDATE Student_Activity SET mark = ? WHERE stid = ? AND actid = ?',
    [mark, stid, actid]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student activity entry not found' });
  }

  res.json({ message: 'Student activity mark updated' });
});

router.delete('/:stid/:actid', async (req, res) => {
  const { stid, actid } = req.params;
  const [result] = await pool.query('DELETE FROM Student_Activity WHERE stid = ? AND actid = ?', [stid, actid]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student activity entry not found' });
  }
  res.json({ message: 'Student activity entry deleted' });
});

module.exports = router;
