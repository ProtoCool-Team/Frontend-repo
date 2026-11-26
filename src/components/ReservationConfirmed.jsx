import Modal from './Modal.jsx';
import {Icon} from './Icons.jsx';
import {
  RESERVATION_STATUS,
  formatDay,
  formatInterval,
} from '../reservationStatus.js';
import '../reservation-card.css';

// KAN-11: confirmarea vizuală afișată imediat după ce rezervarea
// a fost salvată cu succes.
export default function ReservationConfirmed({
  reservation: r,
  resource,
  onViewMine,
  onNewReservation,
}) {
  const pending = r.status === 'PENDING';
  const rows = [
    ['Resursă', resource.name],
    ['Locație', [resource.room, resource.building].filter(Boolean)],
    ['Data', formatDay(r.start)],
    ['Interval', formatInterval(r.start, r.end)],
    ['Scop', r.purpose],
  ];

  return (
    <Modal
      title={pending ? 'Cerere trimisă' : 'Rezervare confirmată'}
      onClose={onViewMine}
    >
      <div className="confirmed" role="status">
        <span className={pending ? 'confirmed-icon pending' : 'confirmed-icon'}>
          <Icon name={pending ? 'clock' : 'check'} size={30} />
        </span>
        <p className="confirmed-title">
          {pending
            ? 'Cererea ta a fost salvată și așteaptă aprobarea.'
            : 'Rezervarea ta a fost salvată cu succes.'}
        </p>
        <span className={`rs-pill rs-${r.status}`}>
          <span className="pill-dot" />
          {RESERVATION_STATUS[r.status] || r.status}
        </span>
        {pending && (
          <p className="muted confirmed-note">
            Primești o notificare când responsabilul de laborator o aprobă sau o
            respinge.
          </p>
        )}
      </div>

      <dl className="rs-details">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{(Array.isArray(value) ? value.join(' · ') : value) || '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onNewReservation}>
          Fă altă rezervare
        </button>
        <button className="btn btn-primary" onClick={onViewMine}>
          Vezi rezervările mele
        </button>
      </div>
    </Modal>
  );
}
