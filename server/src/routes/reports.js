const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/dashboard', async (_req, res) => {
  const [[studentCount]] = await pool.query('SELECT COUNT(*) AS total_students FROM Student');
  const [[activityCount]] = await pool.query('SELECT COUNT(*) AS total_activities FROM Activity');
  const [[eventCount]] = await pool.query('SELECT COUNT(*) AS total_events FROM Event');
  const [[activityParticipationCount]] = await pool.query('SELECT COUNT(*) AS total_activity_participations FROM Student_Activity');
  const [[eventParticipationCount]] = await pool.query('SELECT COUNT(*) AS total_event_participations FROM Student_Event');

  res.json({
    total_students: studentCount.total_students,
    total_activities: activityCount.total_activities,
    total_events: eventCount.total_events,
    total_activity_participations: activityParticipationCount.total_activity_participations,
    total_event_participations: eventParticipationCount.total_event_participations,
  });
});

router.get('/leaderboard', async (req, res) => {
  const { dept, section } = req.query;
  const where = [];
  const params = [];

  if (dept) {
    where.push('s.dept = ?');
    params.push(dept);
  }

  if (section) {
    where.push('s.section = ?');
    params.push(section);
  }

  const sql = `
    SELECT
      s.roll,
      s.name,
      s.dept,
      s.section,
      ROUND(AVG(sa.mark), 2) AS avg_mark,
      COUNT(DISTINCT sa.actid) AS activity_count,
      COUNT(DISTINCT se.evid) AS event_count
    FROM Student s
    LEFT JOIN Student_Activity sa ON sa.stid = s.roll
    LEFT JOIN Student_Event se ON se.stid = s.roll
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY s.roll, s.name, s.dept, s.section
    ORDER BY avg_mark DESC, activity_count DESC, event_count DESC
  `;

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.get('/activity-participation', async (_req, res) => {
  const sql = `
    SELECT
      a.id,
      a.name,
      a.max_mark,
      COUNT(sa.stid) AS participant_count,
      ROUND(AVG(sa.mark), 2) AS avg_scored
    FROM Activity a
    LEFT JOIN Student_Activity sa ON sa.actid = a.id
    GROUP BY a.id, a.name, a.max_mark
    ORDER BY participant_count DESC, a.name
  `;

  const [rows] = await pool.query(sql);
  res.json(rows);
});

router.get('/event-participation', async (_req, res) => {
  const sql = `
    SELECT
      e.id,
      e.name,
      e.level,
      COUNT(se.stid) AS participant_count,
      SUM(CASE WHEN se.prize = '1st' THEN 1 ELSE 0 END) AS first_prize,
      SUM(CASE WHEN se.prize = '2nd' THEN 1 ELSE 0 END) AS second_prize,
      SUM(CASE WHEN se.prize = '3rd' THEN 1 ELSE 0 END) AS third_prize,
      SUM(CASE WHEN se.prize = 'Participation' THEN 1 ELSE 0 END) AS participation
    FROM Event e
    LEFT JOIN Student_Event se ON se.evid = e.id
    GROUP BY e.id, e.name, e.level
    ORDER BY participant_count DESC, e.name
  `;

  const [rows] = await pool.query(sql);
  res.json(rows);
});

module.exports = router;
