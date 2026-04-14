const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const sql = `
    SELECT
      se.stid,
      s.name AS student_name,
      se.evid,
      e.name AS event_name,
      e.level,
      se.prize
    FROM Student_Event se
    JOIN Student s ON s.roll = se.stid
    JOIN Event e ON e.id = se.evid
    ORDER BY se.stid, se.evid
  `;
  const [rows] = await pool.query(sql);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { stid, evid, prize } = req.body;
  if (!stid || !evid || !prize) {
    return res.status(400).json({ message: 'stid, evid and prize are required' });
  }

  await pool.query(
    'INSERT INTO Student_Event (stid, evid, prize) VALUES (?, ?, ?)',
    [stid, evid, prize]
  );

  res.status(201).json({ message: 'Student event participation added' });
});

router.put('/:stid/:evid', async (req, res) => {
  const { stid, evid } = req.params;
  const { prize } = req.body;

  if (!prize) {
    return res.status(400).json({ message: 'prize is required' });
  }

  const [result] = await pool.query(
    'UPDATE Student_Event SET prize = ? WHERE stid = ? AND evid = ?',
    [prize, stid, evid]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student event entry not found' });
  }

  res.json({ message: 'Student event participation updated' });
});

router.delete('/:stid/:evid', async (req, res) => {
  const { stid, evid } = req.params;
  const [result] = await pool.query('DELETE FROM Student_Event WHERE stid = ? AND evid = ?', [stid, evid]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Student event entry not found' });
  }
  res.json({ message: 'Student event entry deleted' });
});

module.exports = router;
