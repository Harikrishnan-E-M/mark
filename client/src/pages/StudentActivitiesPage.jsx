import { useEffect, useState } from 'react';
import { extractError, studentActivitiesApi } from '../services/api';

const initialForm = { stid: '', actid: '', mark: '' };

export default function StudentActivitiesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await studentActivitiesApi.list();
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
      await studentActivitiesApi.create({
        stid: form.stid,
        actid: Number(form.actid),
        mark: Number(form.mark),
      });
      setMessage('Student activity mark added');
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onQuickUpdate = async (stid, actid, currentMark) => {
    const value = window.prompt('Enter new mark', String(currentMark));
    if (value === null) return;
    setError('');
    setMessage('');
    try {
      await studentActivitiesApi.update(stid, actid, { mark: Number(value) });
      setMessage('Student activity mark updated');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onDelete = async (stid, actid) => {
    if (!window.confirm('Delete this student activity entry?')) return;
    setError('');
    setMessage('');
    try {
      await studentActivitiesApi.remove(stid, actid);
      setMessage('Student activity entry deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page">
      <h2>Student Activity Marks</h2>
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
          placeholder="Activity ID"
          value={form.actid}
          onChange={(e) => setForm((p) => ({ ...p, actid: e.target.value }))}
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Mark"
          value={form.mark}
          onChange={(e) => setForm((p) => ({ ...p, mark: e.target.value }))}
          required
        />
        <button type="submit">Add Student Activity Mark</button>
      </form>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Activity</th>
            <th>Max</th>
            <th>Mark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.stid}-${row.actid}`}>
              <td>{row.stid} - {row.student_name}</td>
              <td>{row.actid} - {row.activity_name}</td>
              <td>{row.max_mark}</td>
              <td>{row.mark}</td>
              <td className="actions">
                <button onClick={() => onQuickUpdate(row.stid, row.actid, row.mark)}>Update Mark</button>
                <button className="danger-btn" onClick={() => onDelete(row.stid, row.actid)}>Delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="5">No student activity entries found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
