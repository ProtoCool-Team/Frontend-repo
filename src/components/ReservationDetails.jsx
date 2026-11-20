import Modal from './Modal.jsx';
import {categoryLabel} from '../constants.js';
import {
  RESERVATION_STATUS,
  formatDay,
  formatInterval,
} from '../reservationStatus.js';

// Fereastra „Detalii” cu toate datele unei rezervări.
export default function ReservationDetails({reservation: r, onClose}) {
  const rows = [
    ['Resursă', r.resourceName],
    ['Categorie', categoryLabel(r.category)],
    ['Locație', [r.room && `Sala ${r.room}`, r.building].filter(Boolean)],
    ['Data', formatDay(r.start)],
    ['Interval', formatInterval(r.start, r.end)],
    ['Status', RESERVATION_STATUS[r.shownStatus] || r.status],
    ['Scop', r.purpose],
    ['Responsabil', r.responsibleName],
    ['Motivul deciziei', r.decisionReason],
  ];
  return (
    <Modal title="Detalii rezervare" onClose={onClose}>
      <dl className="rs-details">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{(Array.isArray(value) ? value.join(' · ') : value) || '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Închide
        </button>
      </div>
    </Modal>
  );
}
