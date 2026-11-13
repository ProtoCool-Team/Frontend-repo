import {CATEGORIES, resourcesLabel} from '../constants.js';
import {resourceState} from '../availability.js';
import {Icon} from '../components/Icons.jsx';
import StatusPill from '../components/StatusPill.jsx';

export default function ManageResourcesPage({
  resources,
  loading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const sorted = [...resources].sort((a, b) =>
    a.name.localeCompare(b.name, 'ro'),
  );

  return (
    <main className="page">
      <p className="crumbs">
        Acasă / Administrare / <strong>Resurse</strong>
      </p>
      <div className="page-head">
        <div>
          <h1>Gestionare resurse</h1>
          <p className="subtitle">
            {resourcesLabel(resources.length)} în catalog · adaugă, modifică sau
            șterge echipamente și săli
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onAdd}>
          <Icon name="plus" size={16} />
          Adaugă resursă
        </button>
      </div>

      <div className="panel table-wrap">
        {loading ? (
          <p className="empty">Se încarcă resursele…</p>
        ) : sorted.length === 0 ? (
          <div className="empty">
            <p>Catalogul e gol. Adaugă prima resursă.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Resursă</th>
                <th>Categorie</th>
                <th>Locație</th>
                <th>Stare acum</th>
                <th>Aprobare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-res">
                      <span className={`res-icon cover-${r.category}`}>
                        <Icon name={r.category} size={18} />
                      </span>
                      <div>
                        <strong>{r.name}</strong>
                        {r.description && (
                          <small className="muted">{r.description}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{CATEGORIES[r.category]?.single || r.category}</td>
                  <td>
                    <strong className="cell-strong">{r.room}</strong>
                    <small className="muted">{r.building}</small>
                  </td>
                  <td>
                    <StatusPill state={resourceState(r)} />
                  </td>
                  <td>
                    {r.requiresApproval ? (
                      <span className="badge-approval">
                        <Icon name="lock" size={11} />
                        Necesară
                      </span>
                    ) : (
                      <span className="muted">Nu</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onEdit(r)}
                      >
                        Editează
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onDelete(r)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
