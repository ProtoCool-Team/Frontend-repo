import {useState} from 'react';
import {TYPES, STATUSES} from '../labels.js';

const EMPTY = {
  name: '',
  type: 'EQUIPMENT',
  location: '',
  capacity: '',
  status: 'AVAILABLE',
  description: '',
};

export default function ResourceForm({
  initial,
  onSave,
  onCancel,
  serverErrors = {},
}) {
  const [form, setForm] = useState(
    initial ? {...EMPTY, ...initial, capacity: initial.capacity ?? ''} : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Completează numele resursei.';
    if (form.type === 'ROOM' && (!form.capacity || Number(form.capacity) < 1))
      e.capacity = 'O sală trebuie să aibă capacitatea de cel puțin 1 loc.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = {
      ...form,
      name: form.name.trim(),
      capacity: form.type === 'ROOM' ? Number(form.capacity) : null,
    };
    delete data.id;
    await onSave(data);
    setSaving(false);
  }

  const err = (f) => errors[f] || serverErrors[f];

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Editează resursa' : 'Resursă nouă'}</h2>

      <label>
        Nume
        <input
          value={form.name}
          onChange={set('name')}
          placeholder="ex. Robot NAO"
        />
        {err('name') && <span className="field-error">{err('name')}</span>}
      </label>

      <div className="row">
        <label>
          Tip
          <select value={form.type} onChange={set('type')}>
            {Object.entries(TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={set('status')}>
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          Locație
          <input
            value={form.location}
            onChange={set('location')}
            placeholder="ex. Corp C, sala C201"
          />
        </label>
        {form.type === 'ROOM' && (
          <label>
            Capacitate (locuri)
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={set('capacity')}
            />
            {err('capacity') && (
              <span className="field-error">{err('capacity')}</span>
            )}
          </label>
        )}
      </div>

      <label>
        Descriere
        <textarea
          rows="3"
          value={form.description}
          onChange={set('description')}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Renunță
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving
            ? 'Se salvează…'
            : initial
              ? 'Salvează modificările'
              : 'Adaugă resursa'}
        </button>
      </div>
    </form>
  );
}
