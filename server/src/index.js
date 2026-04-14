require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

const studentsRouter = require('./routes/students');
const activitiesRouter = require('./routes/activities');
const eventsRouter = require('./routes/events');
const studentActivitiesRouter = require('./routes/studentActivities');
const studentEventsRouter = require('./routes/studentEvents');
const reportsRouter = require('./routes/reports');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS server_time');
    res.json({ ok: true, server_time: rows[0].server_time });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/students', studentsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/student-activities', studentActivitiesRouter);
app.use('/api/student-events', studentEventsRouter);
app.use('/api/reports', reportsRouter);

app.use((error, _req, res, _next) => {
  if (error && error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate entry already exists' });
  }

  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Invalid student, activity, or event reference' });
  }

  if (error && error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ message: 'Invalid value for constrained field' });
  }

  if (error && error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'Cannot delete because it is referenced by other rows' });
  }

  console.error('Error:', error);
  return res.status(500).json({ message: 'Internal server error', error: error.message });
});

async function startServer() {
  try {
    await pool.query('SELECT 1 AS ok');
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Database connection failed at startup:', err.message);
    process.exit(1);
  }
}

startServer();
