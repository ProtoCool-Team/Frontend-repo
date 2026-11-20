import {Icon} from './Icons.jsx';
import {formatDay, formatTime} from '../reservationStatus.js';

function SummaryCard({label, value, note, icon, tone}) {
  return (
    <div className="rs-stat">
      <div>
        <p className="eyebrow">{label}</p>
        <p className="rs-stat-value">{value}</p>
        <p className="muted">{note}</p>
      </div>
      <span className={`rs-stat-icon rs-tone-${tone}`}>
        <Icon name={icon} size={16} />
      </span>
    </div>
  );
}

// Cele patru carduri de sus: activă acum, următoarea, în așteptare,
// finalizate. `summary` vine din summarize() (reservationFilters.js).
export default function ReservationSummary({summary}) {
  const {active, next, pending, completed, rejected} = summary;
  const current = active[0];
  return (
    <section className="rs-stats" aria-label="Sumar rezervări">
      <SummaryCard
        label="Activă acum"
        value={active.length}
        note={
          current
            ? `${current.resourceName} · până la ${formatTime(current.end)}`
            : 'Nicio rezervare în desfășurare'
        }
        icon="play"
        tone="green"
      />
      <SummaryCard
        label="Următoarea rezervare"
        value={
          next ? `${formatDay(next.start)} · ${formatTime(next.start)}` : '—'
        }
        note={
          next ? `${next.resourceName} · Sala ${next.room}` : 'Nicio rezervare'
        }
        icon="calendar"
        tone="blue"
      />
      <SummaryCard
        label="În așteptare"
        value={pending}
        note="Necesită aprobare"
        icon="clock"
        tone="amber"
      />
      <SummaryCard
        label="Finalizate"
        value={completed}
        note={`Respinse: ${rejected}`}
        icon="check"
        tone="slate"
      />
    </section>
  );
}
