import {HOURS, pad, slotState} from '../reserveRules.js';
import {Icon} from './Icons.jsx';

const LABELS = {
  busy: 'Ocupat',
  mine: 'Rezervarea ta',
  unavailable: 'Indisponibil',
  selected: 'Selecția ta',
};
const LEGEND = [
  ['free', 'Liber'],
  ['busy', 'Ocupat'],
  ['unavailable', 'Indisponibil'],
  ['mine', 'Rezervarea mea'],
  ['selected', 'Selecția ta'],
  ['past', 'Trecut'],
];

// Calendarul pe 5 zile lucrătoare: un rând pentru fiecare oră 08–20.
export default function WeekCalendar({
  days,
  blocks,
  sel,
  resource,
  rules,
  loading,
  canGoBack,
  onPrev,
  onNext,
  onToday,
  onPick,
}) {
  const now = new Date();
  const first = days[0];
  const last = days[days.length - 1];
  const range =
    `${first.getDate()} ` +
    `${first.getMonth() === last.getMonth() ? '' : month(first) + ' '}` +
    `– ${last.getDate()} ${month(last)} ${last.getFullYear()}`;

  return (
    <section className="week panel" aria-label="Calendarul resursei">
      <div className="week-nav">
        <button className="btn btn-outline btn-sm" onClick={onToday}>
          Azi
        </button>
        <button
          className="btn btn-outline btn-sm"
          aria-label="Săptămâna anterioară"
          disabled={!canGoBack}
          onClick={onPrev}
        >
          <Icon name="left" size={16} />
        </button>
        <button
          className="btn btn-outline btn-sm"
          aria-label="Săptămâna următoare"
          onClick={onNext}
        >
          <Icon name="right" size={16} />
        </button>
        <h2>{range}</h2>
        {loading && <span className="muted">Se încarcă…</span>}
      </div>

      <div className="week-legend">
        {LEGEND.map(([kind, label]) => (
          <span key={kind}>
            <i className={`cell-${kind}`} /> {label}
          </span>
        ))}
      </div>

      <div className="week-scroll">
        <div className="week-grid">
          <span />
          {days.map((d) => (
            <div key={+d} className="week-day">
              <small>{d.toLocaleDateString('ro-RO', {weekday: 'short'})}</small>
              <strong className={isToday(d, now) ? 'today' : ''}>
                {d.getDate()}
              </strong>
            </div>
          ))}
          {HOURS.map((h) => (
            <Row key={h} hour={h}>
              {days.map((d) => {
                const s = slotState({
                  day: d,
                  hour: h,
                  blocks,
                  sel,
                  resource,
                  rules,
                  now,
                });
                return (
                  <button
                    key={+d}
                    className={`cell cell-${s.kind}`}
                    disabled={s.kind !== 'free' && s.kind !== 'selected'}
                    aria-label={`${d.toLocaleDateString('ro-RO')} ${pad(h)}`}
                    onClick={() => onPick(d, h)}
                  >
                    {s.first && LABELS[s.kind]}
                  </button>
                );
              })}
            </Row>
          ))}
        </div>
      </div>
      <p className="muted week-hint">
        Apasă pe un interval verde pentru a-l selecta. Sâmbătă–duminică:
        laborator închis.
      </p>
    </section>
  );
}

function Row({hour, children}) {
  return (
    <>
      <span className="week-hour">{pad(hour)}</span>
      {children}
    </>
  );
}

const month = (d) => d.toLocaleDateString('ro-RO', {month: 'long'});
const isToday = (d, now) => d.toDateString() === now.toDateString();
