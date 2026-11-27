import {useCallback, useEffect, useRef, useState} from 'react';
import {unavailabilityApi} from '../api/unavailability.js';
import {periodRangeText} from '../availability.js';
import {UNAVAILABILITY_LABELS, unavailabilityLabel} from '../constants.js';
import {isoDay} from '../reserveRules.js';
import Field from './Field.jsx';
import Modal from './Modal.jsx';

const SAVING = 'saving';

// KAN-8: fereastră pentru perioadele de indisponibilitate temporară.
export default function UnavailabilityModal({
  resource,
  onClose,
  onChanged,
  notify,
  onRoleDenied,
}) {
  const today = isoDay(new Date());
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [type, setType] = useState('IN_REVIEW');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState({});
  // null, SAVING sau id-ul perioadei care se încheie / anulează.
  const [pending, setPending] = useState(null);
  const [affectedCount, setAffectedCount] = useState(0);

  // Fereastra se poate închide din afară (ex. rolul de admin s-a pierdut);
  // după asta nu mai afișăm mesaje și nu mai reîncărcăm nimic.
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

  const busy = pending !== null;
  const saving = pending === SAVING;
  const handleClose = () => {
    if (!busy) onClose();
  };

  // Rulează o modificare (adăugare / încheiere) și reîncarcă lista și
  // catalogul. `apply` primește răspunsul și întoarce mesajul de succes.
  async function mutate(request, apply, what) {
    setPending(what);
    try {
      const res = await request();
      if (!mounted.current) return;
      notify(apply(res));
      await Promise.all([loadPeriods(), onChanged()]);
    } catch (err) {
      if (!mounted.current) return;
      notify(err.message, 'error');
      if (err.status === 403) onRoleDenied?.();
    } finally {
      if (mounted.current) setPending(null);
    }
  }

  function handleStartChange(value) {
    setStartDate(value);
    if (value && endDate && endDate < value) setEndDate(value);
  }

  function validate() {
    const e = {};
    if (!startDate) e.startDate = 'Alege data de început.';
    else if (startDate < today) {
      e.startDate = 'Perioada nu poate începe în trecut.';
    }
    if (!endDate) e.endDate = 'Alege data de sfârșit.';
    else if (startDate && endDate < startDate) {
      e.endDate = 'Data de sfârșit trebuie să fie după data de început.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setAffectedCount(0);
    mutate(
      () =>
        unavailabilityApi.create(resource.id, {
          type,
          start_date: startDate,
          end_date: endDate,
          details: details.trim() || null,
        }),
      (res) => {
        setAffectedCount(res?.affected_reservations?.length || 0);
        setDetails('');
        setErrors({});
        return 'Resursa a fost marcată indisponibilă.';
      },
      SAVING,
    );
  }

  function handleRemove(period) {
    const started = period.start_date <= today;
    mutate(
      () => unavailabilityApi.remove(resource.id, period.period_id),
      () => {
        setAffectedCount(0);
        return started
          ? 'Perioada a fost încheiată.'
          : 'Perioada a fost anulată.';
      },
      period.period_id,
    );
  }

  function removeLabel(p) {
    if (pending === p.period_id) return 'Se procesează…';
    return p.start_date <= today ? 'Încheie acum' : 'Anulează';
  }

  let list;
  if (loadError) {
    list = (
      <p className="banner banner-error" role="alert">
        {loadError}{' '}
        <button type="button" className="link" onClick={loadPeriods}>
          Încearcă din nou
        </button>
      </p>
    );
  } else if (loading) {
    list = <p className="muted">Se încarcă…</p>;
  } else if (periods.length === 0) {
    list = <p className="muted">Nicio perioadă programată.</p>;
  } else {
    list = (
      <ul className="unav-list">
        {periods.map((p) => (
          <li key={p.period_id} className="unav-item">
            <div>
              <strong>
                {unavailabilityLabel(p.type)} · {periodRangeText(p)}
              </strong>
              {p.details && <small className="muted">{p.details}</small>}
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={() => handleRemove(p)}
            >
              {removeLabel(p)}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Modal title={`Indisponibilitate – ${resource.name}`} onClose={handleClose}>
      <div className="unav-section">
        <h3 className="unav-heading">Perioade active și viitoare</h3>
        {list}
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
            {Object.entries(UNAVAILABILITY_LABELS).map(([k, label]) => (
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
