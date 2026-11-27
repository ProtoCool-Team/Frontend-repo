import {useCallback, useEffect, useState} from 'react';
import {usersApi} from '../api/users.js';
import {ROLES, ROLE_LABELS} from '../auth.js';
import AdminTabs from '../components/AdminTabs.jsx';
import Modal from '../components/Modal.jsx';

// KAN-20: administratorul vede conturile și schimbă rolul lor
// (student / cercetător ↔ cadru didactic / administrator).
export default function ManageUsersPage({
  currentUserId,
  onNavigate,
  notify,
  onRoleDenied,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState(null); // {user, role}
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await usersApi.getAll());
    } catch (e) {
      setError(`Nu am putut încărca utilizatorii (${e.message}).`);
      if (e.status === 403) onRoleDenied?.();
    } finally {
      setLoading(false);
    }
  }, [onRoleDenied]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmChange() {
    const {user, role} = changing;
    setSaving(true);
    try {
      const updated = await usersApi.setRole(user.id, role);
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      notify(`${user.name} are acum rolul „${ROLE_LABELS[role]}”.`);
      setChanging(null);
    } catch (e) {
      notify(e.message, 'error');
      if (e.status === 403) onRoleDenied?.();
    } finally {
      setSaving(false);
    }
  }

  const admins = users.filter((u) => u.role === ROLES.ADMINISTRATOR).length;

  return (
    <main className="page">
      <p className="crumbs">
        Acasă / Administrare / <strong>Utilizatori</strong>
      </p>
      <AdminTabs page="users" onNavigate={onNavigate} />
      <div className="page-head">
        <div>
          <h1>Utilizatori și roluri</h1>
          <p className="subtitle">
            {users.length} conturi · {admins} administratori · cadrele didactice
            primesc rolul de administrator
          </p>
        </div>
      </div>

      {error && (
        <p className="banner banner-error" role="alert">
          {error}{' '}
          <button className="link" onClick={load}>
            Încearcă din nou
          </button>
        </p>
      )}

      <div className="panel table-wrap">
        {loading ? (
          <p className="empty">Se încarcă utilizatorii…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === currentUserId;
                const next =
                  u.role === ROLES.ADMINISTRATOR
                    ? ROLES.RESEARCHER
                    : ROLES.ADMINISTRATOR;
                return (
                  <tr key={u.id}>
                    <td>
                      <strong className="cell-strong">{u.name}</strong>
                      {u.department && (
                        <small className="muted">{u.department}</small>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u.role === ROLES.ADMINISTRATOR ? (
                        <span className="badge-approval">
                          {ROLE_LABELS[u.role]}
                        </span>
                      ) : (
                        <span className="muted">{ROLE_LABELS[u.role]}</span>
                      )}
                    </td>
                    <td>
                      {isMe ? (
                        <span className="muted">Contul tău</span>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setChanging({user: u, role: next})}
                        >
                          {next === ROLES.ADMINISTRATOR
                            ? 'Fă administrator'
                            : 'Fă student / cercetător'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {changing && (
        <Modal
          title="Schimbă rolul"
          onClose={() => !saving && setChanging(null)}
        >
          <p>
            {changing.user.name} va avea rolul{' '}
            <strong>{ROLE_LABELS[changing.role]}</strong>.
          </p>
          <p className="muted">
            {changing.role === ROLES.ADMINISTRATOR
              ? 'Va putea gestiona resursele și conturile din Administrare.'
              : 'Nu va mai avea acces la Administrare.'}
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-outline"
              onClick={() => setChanging(null)}
              disabled={saving}
            >
              Renunță
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmChange}
              disabled={saving}
            >
              {saving ? 'Se salvează…' : 'Schimbă rolul'}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
