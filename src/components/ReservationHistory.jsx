import {useState} from 'react';
import {Icon} from './Icons.jsx';
import Pagination from './Pagination.jsx';
import {
  RESERVATION_STATUS,
  formatDate,
  formatInterval,
} from '../reservationStatus.js';

const PAGE_SIZE = 4;

// Secțiunea „Istoric”: rezervările finalizate, respinse sau anulate.
export default function ReservationHistory({
  items,
  onDetails,
  onRebook,
  onExport,
}) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const first = (current - 1) * PAGE_SIZE;
  const shown = items.slice(first, first + PAGE_SIZE);

  return (
    <section className="rs-section">
      <div className="rs-section-head">
        <h2>
          Istoric{' '}
          <small className="muted">rezervări finalizate sau respinse</small>
        </h2>
        <button
          className="link"
          disabled={items.length === 0}
          onClick={() => onExport(items)}
        >
          Exportă CSV
        </button>
      </div>

      <div className="panel table-wrap">
        {items.length === 0 ? (
          <p className="empty">Nicio rezervare în istoric.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Resursă</th>
                <th>Data</th>
                <th>Interval</th>
                <th>Status</th>
                <th>Observații</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-res">
                      <span className={`rs-mini-icon cover-${r.category}`}>
                        <Icon name={r.category} size={14} />
                      </span>
                      <strong>{r.resourceName}</strong>
                    </div>
                  </td>
                  <td>{formatDate(r.start)}</td>
                  <td>{formatInterval(r.start, r.end)}</td>
                  <td>
                    <span className={`rs-pill rs-${r.shownStatus}`}>
                      {RESERVATION_STATUS[r.shownStatus]}
                    </span>
                  </td>
                  <td className="muted">{r.decisionReason || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="link" onClick={() => onDetails(r)}>
                        Detalii
                      </button>
                      <button className="link" onClick={() => onRebook(r)}>
                        Rezervă din nou
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {items.length > 0 && (
        <div className="list-foot">
          <span>
            Afișare {first + 1}–{first + shown.length} din {items.length}{' '}
            rezervări din istoric
          </span>
          <Pagination page={current} total={pages} onPage={setPage} />
        </div>
      )}
    </section>
  );
}
