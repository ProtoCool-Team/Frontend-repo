import {useCallback, useEffect, useRef, useState} from 'react';
import {
  TYPE_LABELS,
  UNAVAILABILITY_TYPES,
  unavailabilityApi,
} from '../api/unavailability.js';
import {formatDate} from '../availability.js';
import Field from './Field.jsx';
import Modal from './Modal.jsx';

function localToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// KAN-8: fereastră pentru perioadele de indisponibilitate temporară.
export default function UnavailabilityModal({
  resource,
  onClose,
  onChanged,
  notify,
  onRoleDenied,
}) {
  const today = localToday();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [type, setType] = useState(UNAVAILABILITY_TYPES.IN_REVIEW);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [affectedCount, setAffectedCount] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadPeriods = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await unavailabilityApi.list(resource.id);
      if (mounted.current) setPeriods(rows);
    } catch (e) {
      if (!mounted.current) return;
      setLoadError(`Nu am putut încărca perioadele (${e.message}).`);
      if (e.status === 403) onRoleDenied?.();
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [resource.id, onRoleDenied]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  const busy = saving || removingId !== null;
  const handleClose = () => {
    if (!busy) onClose();
  };

  function handleStartChange(value) {
    setStartDate(value);
    if (value && endDate && endDate < value) {
      setEndDate(value);
    }
  }

  function validate() {
    const e = {};
    if (!startDate) e.startDate = 'Alege data de început.';
    if (!endDate) e.endDate = 'Alege data de sfârșit.';
    if (startDate && endDate && endDate < startDate) {
      e.endDate = 'Data de sfârșit trebuie să fie după data de început.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setAffectedCount(0);
    try {
      const res = await unavailabilityApi.create(resource.id, {
        type,
        start_date: startDate,
        end_date: endDate,
        details: details.trim() || null,
      });
      if (!mounted.current) return;
      setAffectedCount(res?.affected_reservations?.length || 0);
      setDetails('');
      setErrors({});
      notify('Resursa a fost marcată indisponibilă.');
      await loadPeriods();
      onChanged();
    } catch (err) {
      if (!mounted.current) return;
      notify(err.message, 'error');
      if (err.status === 403) onRoleDenied?.();
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  async function handleRemove(period) {
    const started = period.start_date <= today;
    setRemovingId(period.period_id);
    try {
      await unavailabilityApi.remove(resource.id, period.period_id);
      if (!mounted.current) return;
      notify(
        started ? 'Perioada a fost încheiată.' : 'Perioada a fost anulată.',
      );
      await loadPeriods();
      onChanged();
    } catch (err) {
      if (!mounted.current) return;
      notify(err.message, 'error');
      if (err.status === 403) onRoleDenied?.();
    } finally {
      if (mounted.current) setRemovingId(null);
    }
  }

  return (
    <Modal title={`Indisponibilitate – ${resource.name}`} onClose={handleClose}>
      <div className="unav-section">
        <h3 className="unav-heading">Perioade active și viitoare</h3>
        {loadError && (
          <p className="banner banner-error" role="alert">
            {loadError}{' '}
            <button type="button" className="link" onClick={loadPeriods}>
              Încearcă din nou
            </button>
          </p>
        )}
        {loading ? (
          <p className="muted">Se încarcă…</p>
        ) : !loadError && periods.length === 0 ? (
          <p className="muted">Nicio perioadă programată.</p>
        ) : (
          !loadError && (
            <ul className="unav-list">
              {periods.map((p) => {
                const started = p.start_date <= today;
                return (
                  <li key={p.period_id} className="unav-item">
                    <div>
                      <strong>
                        {TYPE_LABELS[p.type] || p.type} ·{' '}
                        {formatDate(p.start_date)} – {formatDate(p.end_date)}
                      </strong>
                      {p.details && (
                        <small className="muted">{p.details}</small>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => handleRemove(p)}
                    >
                      {removingId === p.period_id
                        ? 'Se procesează…'
                        : started
                          ? 'Încheie acum'
                          : 'Anulează'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {affectedCount > 0 && (
          <p className="banner banner-warn" role="status">
            {affectedCount} rezervări se suprapun cu această perioadă.
            Utilizatorii nu sunt încă anunțați automat.
          </p>
        )}
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <h3 className="unav-heading">Adaugă o perioadă</h3>

        <Field label="Tip">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={busy}
          >
            {Object.entries(TYPE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <div className="form-row">
          <Field label="De la" error={errors.startDate}>
            <input
              type="date"
              value={startDate}
              min={today}
              disabled={busy}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </Field>
          <Field label="Până la" error={errors.endDate}>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              disabled={busy}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Detalii">
          <input
            value={details}
            maxLength={200}
            disabled={busy}
            placeholder="ex. ecran spart, calibrare anuală"
            onChange={(e) => setDetails(e.target.value)}
          />
        </Field>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={handleClose}
          >
            Închide
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {saving ? 'Se salvează…' : 'Marchează indisponibil'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
