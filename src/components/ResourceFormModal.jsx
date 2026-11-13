import {useState} from 'react';
import {CATEGORIES} from '../constants.js';
import Modal from './Modal.jsx';

const EMPTY = {
  name: '',
  category: 'ROBOT',
  description: '',
  building: '',
  room: '',
  status: 'AVAILABLE',
  statusNote: '',
  unavailableUntil: '',
  requiresApproval: false,
};

export default function ResourceFormModal({
  initial,
  serverErrors = {},
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...EMPTY,
          ...initial,
          statusNote: initial.statusNote || '',
          unavailableUntil: initial.unavailableUntil || '',
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Completează denumirea resursei.';
    if (!form.building.trim()) e.building = 'Completează clădirea.';
    if (!form.room.trim()) e.room = 'Completează sala sau locul.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const unavailable = form.status === 'UNAVAILABLE';
    const data = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      building: form.building.trim(),
      room: form.room.trim(),
      status: form.status,
      requiresApproval: form.requiresApproval,
      statusNote: unavailable ? form.statusNote.trim() || null : null,
      unavailableUntil: unavailable ? form.unavailableUntil || null : null,
    };
    if (initial?.availability) data.availability = initial.availability;
    await onSave(data);
    setSaving(false);
  }

  const err = (f) => errors[f] || serverErrors[f];

  return (
    <Modal
      title={initial ? 'Editează resursa' : 'Resursă nouă'}
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Denumire</span>
          <input
            value={form.name}
            onChange={set('name')}
            placeholder="ex. Robot humanoid NAO v6"
          />
          {err('name') && <small className="field-error">{err('name')}</small>}
        </label>

        <label className="field">
          <span>Categorie</span>
          <select value={form.category} onChange={set('category')}>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <option key={k} value={k}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Descriere</span>
          <textarea
            rows="2"
            value={form.description}
            onChange={set('description')}
            placeholder="Pe scurt: ce face și pentru ce se folosește"
          />
        </label>

        <div className="form-row">
          <label className="field">
            <span>Clădire</span>
            <input
              value={form.building}
              onChange={set('building')}
              placeholder="ex. Corp C"
            />
            {err('building') && (
              <small className="field-error">{err('building')}</small>
            )}
          </label>
          <label className="field">
            <span>Sală / loc</span>
            <input
              value={form.room}
              onChange={set('room')}
              placeholder="ex. Sala C204"
            />
            {err('room') && (
              <small className="field-error">{err('room')}</small>
            )}
          </label>
        </div>

        <label className="field">
          <span>Stare</span>
          <select value={form.status} onChange={set('status')}>
            <option value="AVAILABLE">Disponibil pentru rezervări</option>
            <option value="UNAVAILABLE">Indisponibil (defect / revizie)</option>
          </select>
        </label>

        {form.status === 'UNAVAILABLE' && (
          <div className="form-row">
            <label className="field">
              <span>Motiv</span>
              <input
                value={form.statusNote}
                onChange={set('statusNote')}
                placeholder="ex. Calibrare anuală"
              />
            </label>
            <label className="field">
              <span>Indisponibil până la</span>
              <input
                type="date"
                value={form.unavailableUntil}
                onChange={set('unavailableUntil')}
              />
            </label>
          </div>
        )}

        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={form.requiresApproval}
            onChange={set('requiresApproval')}
          />
          <span className="switch-track" aria-hidden="true" />
          <span>Rezervările necesită aprobare</span>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Renunță
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? 'Se salvează…'
              : initial
                ? 'Salvează modificările'
                : 'Adaugă resursa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
