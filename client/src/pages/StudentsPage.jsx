import { useEffect, useState } from 'react';
import { extractError, studentsApi } from '../services/api';

const initialForm = { roll: '', name: '', dept: '', section: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingRoll, setEditingRoll] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await studentsApi.list(query ? { q: query } : undefined);
    setStudents(data);
  };

  const safeLoad = async () => {
    try {
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  useEffect(() => {
    safeLoad();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingRoll) {
        await studentsApi.update(editingRoll, {
          name: form.name,
          dept: form.dept,
          section: form.section,
        });
        setMessage('Student updated');
      } else {
        await studentsApi.create(form);
        setMessage('Student created');
      }
      setForm(initialForm);
      setEditingRoll('');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const onEdit = (row) => {
    setEditingRoll(row.roll);
    setForm({
      roll: row.roll,
      name: row.name,
      dept: row.dept,
      section: row.section,
    });
  };

  const onDelete = async (roll) => {
    if (!window.confirm(`Delete student ${roll}?`)) return;
    setError('');
    setMessage('');
    try {
      await studentsApi.remove(roll);
      setMessage('Student deleted');
      await load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page">
      <h2>Students</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          placeholder="Roll"
          value={form.roll}
          onChange={(e) => setForm((p) => ({ ...p, roll: e.target.value }))}
          disabled={Boolean(editingRoll)}
          required
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <input
          placeholder="Department"
          value={form.dept}
          onChange={(e) => setForm((p) => ({ ...p, dept: e.target.value }))}
          required
        />
        <input
          placeholder="Section"
          value={form.section}
          onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
          required
        />
        <button type="submit">{editingRoll ? 'Update Student' : 'Add Student'}</button>
        {editingRoll && (
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setEditingRoll('');
              setForm(initialForm);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="toolbar">
        <input
          placeholder="Search by roll or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="secondary-btn" onClick={safeLoad}>Search</button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Section</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((row) => (
            <tr key={row.roll}>
              <td>{row.roll}</td>
              <td>{row.name}</td>
              <td>{row.dept}</td>
              <td>{row.section}</td>
              <td className="actions">
                <button onClick={() => onEdit(row)}>Edit</button>
                <button className="danger-btn" onClick={() => onDelete(row.roll)}>Delete</button>
              </td>
            </tr>
          ))}
          {!students.length && (
            <tr>
              <td colSpan="5">No students found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
