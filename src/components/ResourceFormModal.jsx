import {useEffect, useState} from 'react';
import {usersApi} from '../api/users.js';
import {ROLES} from '../auth.js';
import {CATEGORIES, STATUS, locationLabel} from '../constants.js';
import Field from './Field.jsx';
import Modal from './Modal.jsx';

const EMPTY = {
  name: '',
  category: 'ROBOT',
  description: '',
  location_id: '',
  responsible_admin_id: '',
  status: STATUS.AVAILABLE,
  statusNote: '',
  unavailableUntil: '',
  requiresApproval: false,
};

export default function ResourceFormModal({
  initial,
  locations = [],
  serverErrors = {},
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...EMPTY,
          ...initial,
          responsible_admin_id: initial.responsible_admin_id || '',
          statusNote: initial.statusNote || '',
          unavailableUntil: initial.unavailableUntil || '',
        }
      : EMPTY,
  );
  const [admins, setAdmins] = useState([]);
  const [adminsError, setAdminsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const unavailable = form.status === STATUS.UNAVAILABLE;

  useEffect(() => {
    let active = true;
    usersApi
      .getAll()
      .then((list) => {
        if (active) {
          setAdmins(list.filter((u) => u.role === ROLES.ADMINISTRATOR));
        }
      })
      .catch(() => {
        if (active) setAdminsError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Handler de onChange care scrie valoarea controlului în form[field]
  const bindField = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });

  const errorFor = (field) => errors[field] || serverErrors[field];

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Completează denumirea resursei.';
    if (!form.location_id) e.location_id = 'Alege locația.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      location_id: form.location_id,
      responsible_admin_id: form.responsible_admin_id || null,
      status: form.status,
      requiresApproval: form.requiresApproval,
      statusNote: unavailable ? form.statusNote.trim() || null : null,
      unavailableUntil: unavailable ? form.unavailableUntil || null : null,
    };
    if (initial?.availability) data.availability = initial.availability;
    await onSave(data);
    setSaving(false);
  }

  return (
    <Modal
      title={initial ? 'Editează resursa' : 'Resursă nouă'}
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Denumire" error={errorFor('name')}>
          <input
            value={form.name}
            onChange={bindField('name')}
            placeholder="ex. Robot humanoid NAO v6"
          />
        </Field>

        <Field label="Categorie">
          <select value={form.category} onChange={bindField('category')}>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <option key={k} value={k}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descriere">
          <textarea
            rows="2"
            value={form.description}
            onChange={bindField('description')}
            placeholder="Pe scurt: ce face și pentru ce se folosește"
          />
        </Field>

        <Field label="Locație" error={errorFor('location_id')}>
          <select value={form.location_id} onChange={bindField('location_id')}>
            <option value="">Alege clădirea și sala…</option>
            {locations.map((l) => (
              <option key={l.location_id} value={l.location_id}>
                {locationLabel(l)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Responsabil" error={errorFor('responsible_admin_id')}>
          <select
            value={form.responsible_admin_id}
            onChange={bindField('responsible_admin_id')}
            disabled={adminsError}
          >
            <option value="">
              {initial ? 'Fără responsabil' : 'Eu (implicit)'}
            </option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.email})
              </option>
            ))}
          </select>
          <small className="muted">
            {adminsError
              ? 'Nu am putut încărca lista de administratori.'
              : 'Responsabilul aprobă rezervările și marchează resursa ' +
                'indisponibilă.'}
          </small>
        </Field>

        <Field label="Stare">
          <select value={form.status} onChange={bindField('status')}>
            <option value={STATUS.AVAILABLE}>
              Disponibil pentru rezervări
            </option>
            <option value={STATUS.UNAVAILABLE}>
              Indisponibil (defect / revizie)
            </option>
          </select>
        </Field>

        {unavailable && (
          <div className="form-row">
            <Field label="Motiv">
              <input
                value={form.statusNote}
                onChange={bindField('statusNote')}
                placeholder="ex. Calibrare anuală"
              />
            </Field>
            <Field label="Indisponibil până la">
              <input
                type="date"
                value={form.unavailableUntil}
                onChange={bindField('unavailableUntil')}
              />
            </Field>
          </div>
        )}

        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={form.requiresApproval}
            onChange={bindField('requiresApproval')}
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
