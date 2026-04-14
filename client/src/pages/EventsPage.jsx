import { useEffect, useState } from 'react';
import { eventsApi, extractError } from '../services/api';

const initialForm = { name: '', date: '', level: 'College' };
const levels = ['College', 'Intercollege', 'State', 'National'];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await eventsApi.list();
    setEvents(data);
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) {
        await eventsApi.update(editingId, form);
        setMessage('Event updated');
      } else {
        await eventsApi.create(form);
        setMessage('Event created');
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
    setForm({ name: row.name, date: row.date.slice(0, 10), level: row.level });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete event?')) return;
    setError('');
    setMessage('');
    try {
      await eventsApi.remove(id);
      setMessage('Event deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page">
      <h2>Events</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Event Name"
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
        <select
          value={form.level}
          onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
        >
          {levels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update Event' : 'Add Event'}</button>
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
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>{row.level}</td>
              <td className="actions">
                <button onClick={() => onEdit(row)}>Edit</button>
                <button className="danger-btn" onClick={() => onDelete(row.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!events.length && (
            <tr>
              <td colSpan="5">No events found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
