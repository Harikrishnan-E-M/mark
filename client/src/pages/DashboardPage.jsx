import { useEffect, useState } from 'react';
import { reportsApi, extractError } from '../services/api';

export default function DashboardPage() {
  const [data, setData] = useState({
    total_students: 0,
    total_activities: 0,
    total_events: 0,
    total_activity_participations: 0,
    total_event_participations: 0,
  });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const response = await reportsApi.dashboard();
      setData(response);
    } catch (err) {
      setError(extractError(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <h2>Dashboard</h2>
      {error && <p className="error-msg">{error}</p>}
      <div className="stats-grid">
        <article className="stat-box">
          <h3>Total Students</h3>
          <p>{data.total_students}</p>
        </article>
        <article className="stat-box">
          <h3>Total Activities</h3>
          <p>{data.total_activities}</p>
        </article>
        <article className="stat-box">
          <h3>Total Events</h3>
          <p>{data.total_events}</p>
        </article>
        <article className="stat-box">
          <h3>Total Activity Participations</h3>
          <p>{data.total_activity_participations}</p>
        </article>
        <article className="stat-box">
          <h3>Total Event Participations</h3>
          <p>{data.total_event_participations}</p>
        </article>
      </div>
      <button className="secondary-btn" onClick={load}>Refresh Dashboard</button>
    </div>
  );
}
