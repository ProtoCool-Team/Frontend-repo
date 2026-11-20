import {Icon} from './Icons.jsx';
import {categoryLabel} from '../constants.js';
import {
  RESERVATION_STATUS,
  formatDay,
  formatDuration,
  formatInterval,
} from '../reservationStatus.js';

// Textul de sub status: cât mai durează / până când se poate anula.
function StatusNote({r, now}) {
  if (r.shownStatus === 'ACTIVE') {
    const total = r.end - r.start;
    const percent = Math.round(((now - r.start) / total) * 100);
    return (
      <>
        <small className="muted">
          Se încheie în {formatDuration(r.end - now)}
        </small>
        <div className="rs-progress" aria-label={`${percent}% din interval`}>
          <span style={{width: `${percent}%`}} />
        </div>
      </>
    );
  }
  if (r.shownStatus === 'PENDING') {
    return (
      <small className="rs-approval">
        Necesită aprobare
        {r.responsibleName && <> · Resp: {r.responsibleName}</>}
      </small>
    );
  }
  if (r.canCancel) {
    return <small className="muted">Poți anula până la începere</small>;
  }
  return null;
}

// Un card din secțiunea „Active și viitoare”.
export default function UpcomingReservationCard({
  reservation: r,
  now,
  onCancel,
  onDetails,
  onExtend,
}) {
  return (
    <article className={`rs-card rs-border-${r.shownStatus}`}>
      <span className={`rs-cover cover-${r.category}`}>
        <Icon name={r.category} size={30} />
      </span>
      <div className="rs-card-main">
        <p className="eyebrow">{categoryLabel(r.category)}</p>
        <h3 className="card-title">{r.resourceName}</h3>
        <p className="card-loc">
          <Icon name="pin" size={13} />
          Sala {r.room} · {r.building}
        </p>
        <p className="card-loc">
          <Icon name="calendar" size={13} />
          {formatDay(r.start)} · {formatInterval(r.start, r.end)}
        </p>
      </div>
      <div className="rs-card-status">
        <span className={`rs-pill rs-${r.shownStatus}`}>
          <span className="pill-dot" />
          {RESERVATION_STATUS[r.shownStatus]}
        </span>
        <StatusNote r={r} now={now} />
      </div>
      <div className="row-actions">
        <button className="btn btn-outline btn-sm" onClick={() => onDetails(r)}>
          Detalii
        </button>
        {r.shownStatus === 'ACTIVE' ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExtend(r)}
          >
            Prelungește
          </button>
        ) : (
          r.canCancel && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onCancel(r)}
            >
              Anulează
            </button>
          )
        )}
      </div>
    </article>
  );
}
