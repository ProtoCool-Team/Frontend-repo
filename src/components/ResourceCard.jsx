import {TYPE_LABELS} from '../api/unavailability.js';
import {STATUS, categoryLabel} from '../constants.js';
import {formatDate, nextChangeText, resourceState} from '../availability.js';
import {Icon} from './Icons.jsx';
import StatusPill from './StatusPill.jsx';
import AvailabilityBar from './AvailabilityBar.jsx';

export default function ResourceCard({resource, onReserve}) {
  const state = resourceState(resource);
  const unavailable = state === 'UNAVAILABLE';
  const unav = resource.unavailability;
  const unavLabel = unav ? TYPE_LABELS[unav.type] || 'Indisponibil' : '';
  const cover = unavailable
    ? 'cover-UNAVAILABLE'
    : `cover-${resource.category}`;

  return (
    <article className="card">
      <div className={`card-cover ${cover}`}>
        <Icon name={resource.category} size={48} />
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="eyebrow">{categoryLabel(resource.category)}</span>
          <StatusPill state={state} />
        </div>
        <h3 className="card-title">{resource.name}</h3>
        {resource.description && (
          <p className="card-desc">{resource.description}</p>
        )}
        <p className="card-loc">
          <Icon name="pin" size={13} />
          {[resource.room, resource.building].filter(Boolean).join(' · ')}
        </p>
        {resource.requiresApproval && (
          <span className="badge-approval">
            <Icon name="lock" size={11} />
            Necesită aprobare
          </span>
        )}
        {unav?.active && (
          <p className="card-note">
            {unavLabel}
            {unav.details ? `: ${unav.details}` : ''}
          </p>
        )}
        {!unavailable && unav && !unav.active && (
          <small className="muted">
            Indisponibil {formatDate(unav.start_date)} –{' '}
            {formatDate(unav.end_date)} ({unavLabel})
          </small>
        )}
        <AvailabilityBar resource={resource} />
      </div>

      <footer className="card-foot">
        <span className="card-next">
          <Icon name="clock" size={13} />
          {nextChangeText(resource)}
        </span>
        {/* La o indisponibilitate temporară se poate rezerva după ea. */}
        <button
          className="btn btn-primary"
          disabled={resource.status === STATUS.UNAVAILABLE}
          onClick={() => onReserve(resource)}
        >
          Rezervă
        </button>
      </footer>
    </article>
  );
}
