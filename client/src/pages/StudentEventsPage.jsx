import { useEffect, useState } from 'react';
import { extractError, studentEventsApi } from '../services/api';

const initialForm = { stid: '', evid: '', prize: 'Participation' };
const prizes = ['1st', '2nd', '3rd', 'Participation'];

export default function StudentEventsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await studentEventsApi.list();
    setRows(data);
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await studentEventsApi.create({
        stid: form.stid,
        evid: Number(form.evid),
        prize: form.prize,
      });
      setMessage('Student event participation added');
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onQuickUpdate = async (stid, evid, currentPrize) => {
    const value = window.prompt('Enter prize (1st / 2nd / 3rd / Participation)', currentPrize);
    if (value === null) return;
    setError('');
    setMessage('');
    try {
      await studentEventsApi.update(stid, evid, { prize: value });
      setMessage('Student event participation updated');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onDelete = async (stid, evid) => {
    if (!window.confirm('Delete this student event entry?')) return;
    setError('');
    setMessage('');
    try {
      await studentEventsApi.remove(stid, evid);
      setMessage('Student event entry deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page">
      <h2>Student Event Participation</h2>
      <form className="form-grid" onSubmit={onCreate}>
        <input
          placeholder="Student Roll"
          value={form.stid}
          onChange={(e) => setForm((p) => ({ ...p, stid: e.target.value }))}
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Event ID"
          value={form.evid}
          onChange={(e) => setForm((p) => ({ ...p, evid: e.target.value }))}
          required
        />
        <select
          value={form.prize}
          onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))}
        >
          {prizes.map((prize) => (
            <option key={prize} value={prize}>{prize}</option>
          ))}
        </select>
        <button type="submit">Add Student Event Entry</button>
      </form>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Event</th>
            <th>Level</th>
            <th>Prize</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.stid}-${row.evid}`}>
              <td>{row.stid} - {row.student_name}</td>
              <td>{row.evid} - {row.event_name}</td>
              <td>{row.level}</td>
              <td>{row.prize}</td>
              <td className="actions">
                <button onClick={() => onQuickUpdate(row.stid, row.evid, row.prize)}>Update Prize</button>
                <button className="danger-btn" onClick={() => onDelete(row.stid, row.evid)}>Delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="5">No student event entries found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
