import {CATEGORIES} from '../constants.js';
import {resourceState} from '../availability.js';
import {Icon} from './Icons.jsx';
import StatusPill from './StatusPill.jsx';

// Cardul de sus al ecranului „Rezervare”: resursa și regulile ei.
export default function ReserveHeader({resource, rules}) {
  return (
    <section className="reserve-head panel">
      <div className={`reserve-cover cover-${resource.category}`}>
        <Icon name={resource.category} size={40} />
      </div>
      <div className="reserve-info">
        <h1>
          {resource.name} <StatusPill state={resourceState(resource)} />
        </h1>
        <p className="muted">
          <Icon name="pin" size={13} />{' '}
          {[resource.room, resource.building].filter(Boolean).join(' · ')}
          {' · '}
          {CATEGORIES[resource.category]?.single}
        </p>
        {resource.requiresApproval && (
          <span className="badge-approval">
            <Icon name="lock" size={11} />
            Necesită aprobare
          </span>
        )}
      </div>
      <ul className="reserve-rules">
        <li>
          <Icon name="clock" size={14} />
          Maximum <strong>{rules.maxHours} ore consecutive</strong> / zi
        </li>
        <li>
          <Icon name="calendar" size={14} />
          Rezervare cu cel mult <strong>{rules.maxDays} zile</strong> în avans
        </li>
        <li>
          <Icon name="close" size={14} />
          Anulare cu cel puțin <strong>{rules.cancelHours} oră</strong> înainte
        </li>
      </ul>
    </section>
  );
}
