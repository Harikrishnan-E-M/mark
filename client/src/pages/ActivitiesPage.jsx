import { useEffect, useState } from 'react';
import { activitiesApi, extractError } from '../services/api';

const initialForm = { name: '', date: '', max_mark: '' };

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await activitiesApi.list();
    setActivities(data);
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = { ...form, max_mark: Number(form.max_mark) };
      if (editingId) {
        await activitiesApi.update(editingId, payload);
        setMessage('Activity updated');
      } else {
        await activitiesApi.create(payload);
        setMessage('Activity created');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      date: row.date.slice(0, 10),
      max_mark: String(row.max_mark),
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete activity?')) return;
    setError('');
    setMessage('');
    try {
      await activitiesApi.remove(id);
      setMessage('Activity deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page">
      <h2>Activities</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Activity Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Max Mark"
          value={form.max_mark}
          onChange={(e) => setForm((p) => ({ ...p, max_mark: e.target.value }))}
          required
        />
        <button type="submit">{editingId ? 'Update Activity' : 'Add Activity'}</button>
        {editingId && (
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Max Mark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>{row.max_mark}</td>
              <td className="actions">
                <button onClick={() => onEdit(row)}>Edit</button>
                <button className="danger-btn" onClick={() => onDelete(row.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!activities.length && (
            <tr>
              <td colSpan="5">No activities found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
