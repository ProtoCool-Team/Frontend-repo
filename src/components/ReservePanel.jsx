import {
  DAY_END,
  DAY_START,
  addDays,
  atHour,
  formatDay,
  pad,
} from '../reserveRules.js';
import {Icon} from './Icons.jsx';

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-` +
  String(d.getDate()).padStart(2, '0');
const range = (a, b) => Array.from({length: b - a}, (_, i) => a + i);

// Panoul „Rezervare nouă” din dreapta: interval, scop, confirmare.
export default function ReservePanel({
  resource,
  rules,
  sel,
  onChange,
  purpose,
  onPurpose,
  error,
  submitting,
  onConfirm,
  onCancel,
}) {
  const fromH = sel ? sel.start.getHours() : null;
  const toH = sel ? sel.end.getHours() || DAY_END : null;
  const today = new Date();

  function setTimes(dateStr, from, to) {
    const day = new Date(`${dateStr}T00:00`);
    const end = Math.min(to, from + rules.maxHours, DAY_END);
    onChange({
      start: atHour(day, from),
      end: atHour(day, Math.max(end, from + 1)),
    });
  }
  function pickDate(value) {
    if (!value) return onChange(null);
    const next = Math.max(DAY_START, today.getHours() + 1);
    const from = fromH ?? Math.min(next, DAY_END - 1);
    setTimes(value, from, toH ?? from + 1);
  }

  const hours = sel ? (sel.end - sel.start) / 3600000 : 0;
  const steps = [
    ['Interval', Boolean(sel) && !error],
    ['Scop', Boolean(purpose.trim())],
    ['Confirmare', false],
  ];

  return (
    <aside className="reserve-panel panel" aria-label="Rezervare nouă">
      <div className="rp-head">
        <h2>Rezervare nouă</h2>
        <button
          className="icon-btn ghost"
          aria-label="Renunță"
          onClick={onCancel}
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <ol className="rp-steps">
        {steps.map(([label, done], i) => (
          <li key={label} className={done ? 'done' : ''}>
            <span>{done ? <Icon name="check" size={12} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <section className="rp-section">
        <h3>Interval</h3>
        <label className="field">
          <span>Data</span>
          <input
            type="date"
            value={sel ? iso(sel.start) : ''}
            min={iso(today)}
            max={iso(addDays(today, rules.maxDays))}
            onChange={(e) => pickDate(e.target.value)}
          />
        </label>
        <div className="form-row">
          <label className="field">
            <span>De la</span>
            <select
              value={fromH ?? ''}
              disabled={!sel}
              onChange={(e) => {
                const f = Number(e.target.value);
                setTimes(iso(sel.start), f, f + (toH - fromH));
              }}
            >
              {range(DAY_START, DAY_END).map((h) => (
                <option key={h} value={h}>
                  {pad(h)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Până la</span>
            <select
              value={toH ?? ''}
              disabled={!sel}
              onChange={(e) =>
                setTimes(iso(sel.start), fromH, Number(e.target.value))
              }
            >
              {sel &&
                range(
                  fromH + 1,
                  Math.min(fromH + rules.maxHours, DAY_END) + 1,
                ).map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {sel && (
          <p className="muted">
            Durată: {hours} {hours === 1 ? 'oră' : 'ore'} (maximum{' '}
            {rules.maxHours} pe zi)
          </p>
        )}
        <p className={error ? 'rp-status rp-bad' : 'rp-status rp-ok'}>
          <Icon name={error ? 'alert' : 'check'} size={14} />
          {error || 'Interval liber'}
        </p>
      </section>

      <section className="rp-section">
        <h3>
          Scop <small className="muted">(opțional)</small>
        </h3>
        <label className="field">
          <span>Titlul lucrării / proiectului</span>
          <input
            value={purpose}
            maxLength={120}
            placeholder="ex. Licență – navigare autonomă"
            onChange={(e) => onPurpose(e.target.value)}
          />
        </label>
      </section>

      <section className="rp-section">
        <h3>Confirmare</h3>
        <dl className="rp-summary">
          <dt>Resursă</dt>
          <dd>{resource.name}</dd>
          <dt>Locație</dt>
          <dd>
            {[resource.room, resource.building].filter(Boolean).join(' · ')}
          </dd>
          <dt>Interval</dt>
          <dd>
            {sel
              ? `${formatDay(sel.start, {month: 'short'})}, ${pad(fromH)} – ${pad(toH)}`
              : '—'}
          </dd>
          <dt>Scop</dt>
          <dd>{purpose.trim() || '—'}</dd>
        </dl>
        {resource.requiresApproval && (
          <p className="rp-approval">
            <Icon name="alert" size={16} />
            <span>
              <strong>Necesită aprobare.</strong> Rezervarea va apărea „În
              așteptare” până la confirmarea responsabilului de laborator.
            </span>
          </p>
        )}
      </section>

      <div className="rp-actions">
        <button
          className="btn btn-primary btn-lg"
          disabled={Boolean(error) || submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Se trimite…' : 'Confirmă rezervarea'}
        </button>
        <button className="link" onClick={onCancel}>
          Renunță
        </button>
        {sel && !error && (
          <p className="muted">
            Poți anula până la{' '}
            {formatDay(new Date(sel.start - rules.cancelHours * 3600000), {
              month: 'short',
            })}
            , ora {pad(fromH - rules.cancelHours)}.
          </p>
        )}
      </div>
    </aside>
  );
}
