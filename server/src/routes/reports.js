const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/dashboard', async (_req, res) => {
  try {
    // Cursor-based procedure refreshes summary rows used in dashboard metrics.
    await pool.query('CALL sp_refresh_student_summary()');
  } catch (error) {
    console.warn('sp_refresh_student_summary failed, using direct dashboard counts:', error.message);
  }

  const [[studentCount]] = await pool.query('SELECT COUNT(*) AS total_students FROM Student');
  const [[activityCount]] = await pool.query('SELECT COUNT(*) AS total_activities FROM Activity');
  const [[eventCount]] = await pool.query('SELECT COUNT(*) AS total_events FROM Event');
  const [[activityParticipationCount]] = await pool.query('SELECT COUNT(*) AS total_activity_participations FROM Student_Activity');
  const [[eventParticipationCount]] = await pool.query('SELECT COUNT(*) AS total_event_participations FROM Student_Event');
  let summaryAverage;
  try {
    [[summaryAverage]] = await pool.query('SELECT ROUND(AVG(avg_mark), 2) AS summary_avg_mark FROM Student_Summary');
  } catch (error) {
    console.warn('Student_Summary unavailable, using direct avg fallback:', error.message);
    [[summaryAverage]] = await pool.query('SELECT ROUND(AVG(mark), 2) AS summary_avg_mark FROM Student_Activity');
  }

  res.json({
    total_students: studentCount.total_students,
    total_activities: activityCount.total_activities,
    total_events: eventCount.total_events,
    total_activity_participations: activityParticipationCount.total_activity_participations,
    total_event_participations: eventParticipationCount.total_event_participations,
    summary_avg_mark: Number(summaryAverage.summary_avg_mark || 0),
  });
});

router.get('/leaderboard', async (req, res) => {
  const { dept, section } = req.query;
  const deptParam = dept || null;
  const sectionParam = section || null;

  let rows;
  try {
    const [resultSets] = await pool.query('CALL sp_get_leaderboard(?, ?)', [deptParam, sectionParam]);
    rows = Array.isArray(resultSets) ? resultSets[0] : resultSets;
  } catch (error) {
    console.warn('sp_get_leaderboard failed, using inline leaderboard query:', error.message);
    const where = [];
    const params = [];

    if (deptParam) {
      where.push('s.dept = ?');
      params.push(deptParam);
    }

    if (sectionParam) {
      where.push('s.section = ?');
      params.push(sectionParam);
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

    const [fallbackRows] = await pool.query(sql, params);
    rows = fallbackRows;
  }

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
