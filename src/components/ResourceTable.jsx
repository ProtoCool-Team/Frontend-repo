import {TYPES, STATUSES} from '../labels.js';

export default function ResourceTable({resources, onEdit, onDelete}) {
  if (resources.length === 0) {
    return (
      <p className="empty">
        Nu există resurse. Adaugă prima resursă cu butonul de mai sus.
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Tip</th>
            <th>Locație</th>
            <th>Capacitate</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Acțiuni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.name}</strong>
                {r.description && <div className="muted">{r.description}</div>}
              </td>
              <td>{TYPES[r.type] || r.type}</td>
              <td>{r.location || '—'}</td>
              <td>
                {r.type === 'ROOM' && r.capacity ? `${r.capacity} locuri` : '—'}
              </td>
              <td>
                <span className={`status status-${r.status}`}>
                  {STATUSES[r.status] || r.status}
                </span>
              </td>
              <td className="actions">
                <button className="btn-ghost" onClick={() => onEdit(r)}>
                  Editează
                </button>
                <button className="btn-danger" onClick={() => onDelete(r)}>
                  Șterge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
