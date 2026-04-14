import { useEffect, useState } from 'react';
import { extractError, reportsApi } from '../services/api';

export default function ReportsPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [activityRows, setActivityRows] = useState([]);
  const [eventRows, setEventRows] = useState([]);
  const [filters, setFilters] = useState({ dept: '', section: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [leader, activityPart, eventPart] = await Promise.all([
      reportsApi.leaderboard(filters.dept || filters.section ? filters : undefined),
      reportsApi.activityParticipation(),
      reportsApi.eventParticipation(),
    ]);
    setLeaderboard(leader);
    setActivityRows(activityPart);
    setEventRows(eventPart);
  };

  const safeLoad = async () => {
    try {
      setError('');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  useEffect(() => {
    safeLoad();
  }, []);

  return (
    <div className="page">
      <h2>Reports</h2>
      <div className="toolbar">
        <input
          placeholder="Filter Department"
          value={filters.dept}
          onChange={(e) => setFilters((p) => ({ ...p, dept: e.target.value }))}
        />
        <input
          placeholder="Filter Section"
          value={filters.section}
          onChange={(e) => setFilters((p) => ({ ...p, section: e.target.value }))}
        />
        <button className="secondary-btn" onClick={safeLoad}>Apply Filters</button>
      </div>
      {error && <p className="error-msg">{error}</p>}

      <h3>Student Leaderboard</h3>
      <table>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Section</th>
            <th>Avg Mark</th>
            <th>Activities</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr key={row.roll}>
              <td>{row.roll}</td>
              <td>{row.name}</td>
              <td>{row.dept}</td>
              <td>{row.section}</td>
              <td>{row.avg_mark ?? 0}</td>
              <td>{row.activity_count}</td>
              <td>{row.event_count}</td>
            </tr>
          ))}
          {!leaderboard.length && (
            <tr>
              <td colSpan="7">No leaderboard records</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Activity Participation</h3>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Max Mark</th>
            <th>Participants</th>
            <th>Average Scored</th>
          </tr>
        </thead>
        <tbody>
          {activityRows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.max_mark}</td>
              <td>{row.participant_count}</td>
              <td>{row.avg_scored ?? 0}</td>
            </tr>
          ))}
          {!activityRows.length && (
            <tr>
              <td colSpan="4">No activity report records</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Event Participation</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Level</th>
            <th>Participants</th>
            <th>1st</th>
            <th>2nd</th>
            <th>3rd</th>
            <th>Participation</th>
          </tr>
        </thead>
        <tbody>
          {eventRows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.level}</td>
              <td>{row.participant_count}</td>
              <td>{row.first_prize}</td>
              <td>{row.second_prize}</td>
              <td>{row.third_prize}</td>
              <td>{row.participation}</td>
            </tr>
          ))}
          {!eventRows.length && (
            <tr>
              <td colSpan="7">No event report records</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
