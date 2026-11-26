import {useCallback, useEffect, useState} from 'react';
import {api, isMock} from './api/resources.js';
import {isAdmin} from './auth.js';
import Header from './components/Header.jsx';
import ResourceFormModal from './components/ResourceFormModal.jsx';
import ConfirmDelete from './components/ConfirmDelete.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ManageResourcesPage from './pages/ManageResourcesPage.jsx';
import ManageUsersPage from './pages/ManageUsersPage.jsx';
import MyReservationsPage from './pages/MyReservationsPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import ReservePage from './pages/ReservePage.jsx';

const PAGES = [
  'catalog',
  'calendar',
  'reservations',
  'teams',
  'admin',
  'users',
  'reserve',
];
// KAN-20: paginile din Administrare, doar pentru administratori.
const ADMIN_PAGES = ['admin', 'users'];
const pageFromHash = () => {
  const h = window.location.hash.slice(1);
  return PAGES.includes(h) ? h : 'catalog';
};

export default function App({user, onRoleDenied}) {
  const admin = isAdmin(user);
  const [hashPage, setPage] = useState(pageFromHash);
  // Un cercetător care deschide #admin vede catalogul.
  const page = ADMIN_PAGES.includes(hashPage) && !admin ? 'catalog' : hashPage;
  const [resources, setResources] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} | resursă
  const [deleting, setDeleting] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [reserveId, setReserveId] = useState(null); // resursa de rezervat

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [list, locs] = await Promise.all([
        api.getAll(),
        api.getLocations(),
      ]);
      setResources(list);
      setLocations(locs);
    } catch (e) {
      setLoadError(
        `Nu am putut încărca resursele (${e.message}). ` +
          'Verifică dacă backend-ul rulează.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function navigate(p) {
    window.location.hash = p;
    setPage(p);
    window.scrollTo(0, 0);
  }

  function notify(text, kind = 'ok') {
    setToast({text, kind});
    setTimeout(() => setToast(null), 3200);
  }

  // 403 = rolul s-a schimbat între timp: recitim contul, ca meniul să fie
  // cel corect (KAN-20).
  function checkDenied(e) {
    if (e.status === 403) onRoleDenied?.();
  }

  async function handleSave(data) {
    setServerErrors({});
    try {
      if (editing.id) {
        // Pornim de la resursa originală, ca să nu se piardă câmpurile pe
        // care formularul nu le arată (PUT înlocuiește toată resursa).
        await api.update(editing.id, {...editing, ...data});
        notify(`„${data.name}” a fost actualizată.`);
      } else {
        await api.create(data);
        notify(`„${data.name}” a fost adăugată în catalog.`);
      }
      setEditing(null);
      load();
    } catch (e) {
      setServerErrors(e.fieldErrors || {});
      notify(e.message, 'error');
      checkDenied(e);
    }
  }

  async function handleDelete() {
    const r = deleting;
    try {
      await api.remove(r.id);
      notify(`„${r.name}” a fost ștearsă.`);
      setDeleting(null);
      load();
    } catch (e) {
      notify(`Nu am putut șterge resursa: ${e.message}`, 'error');
      checkDenied(e);
    }
  }

  return (
    <>
      <Header
        page={
          page === 'reserve' ? 'catalog' : page === 'users' ? 'admin' : page
        }
        user={user}
        onNavigate={navigate}
        search={search}
        onSearch={setSearch}
      />

      {(isMock || loadError) && (
        <div className="banners">
          {isMock && (
            <p className="banner">
              Mod test: datele sunt locale și revin la valorile inițiale la
              reîncărcarea paginii.
            </p>
          )}
          {loadError && (
            <p className="banner banner-error" role="alert">
              {loadError}{' '}
              <button className="link" onClick={load}>
                Încearcă din nou
              </button>
            </p>
          )}
        </div>
      )}

      {page === 'catalog' && (
        <CatalogPage
          resources={resources}
          loading={loading}
          search={search}
          onSearch={setSearch}
          onReserve={(r) => {
            setReserveId(r.id);
            navigate('reserve');
          }}
        />
      )}
      {page === 'admin' && (
        <ManageResourcesPage
          resources={resources}
          loading={loading}
          onAdd={() => {
            setServerErrors({});
            setEditing({});
          }}
          onEdit={(r) => {
            setServerErrors({});
            setEditing(r);
          }}
          onDelete={setDeleting}
          onNavigate={navigate}
        />
      )}
      {page === 'users' && (
        <ManageUsersPage
          currentUserId={user?.id}
          onNavigate={navigate}
          notify={notify}
          onRoleDenied={onRoleDenied}
        />
      )}
      {page === 'reservations' && (
        <MyReservationsPage
          onNavigate={(p) => {
            if (p === 'reserve') setReserveId(null); // fără resursă aleasă
            navigate(p);
          }}
          onRebook={(r) => {
            // Mock-ul vechi nu are resourceId; atunci căutăm după nume.
            const match = resources.find(
              (x) => x.id === r.resourceId || x.name === r.resourceName,
            );
            setReserveId(match ? match.id : null);
            navigate('reserve');
          }}
          notify={notify}
        />
      )}
      {page === 'reserve' && (
        <ReservePage
          resources={resources}
          resourceId={reserveId}
          onResource={setReserveId}
          onNavigate={navigate}
          notify={notify}
        />
      )}
      {['calendar', 'teams'].includes(page) && (
        <PlaceholderPage page={page} onNavigate={navigate} />
      )}

      <footer className="site-foot">
        © 2026 Universitatea · Suport: helpdesk@universitate.ro
      </footer>

      {editing && (
        <ResourceFormModal
          initial={editing.id ? editing : null}
          locations={locations}
          serverErrors={serverErrors}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDelete
          resource={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.kind}`} role="status">
          {toast.text}
        </div>
      )}
    </>
  );
}
