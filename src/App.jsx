import {useCallback, useEffect, useState} from 'react';
import {api, isMock} from './api/resources.js';
import Header from './components/Header.jsx';
import ResourceFormModal from './components/ResourceFormModal.jsx';
import ConfirmDelete from './components/ConfirmDelete.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ManageResourcesPage from './pages/ManageResourcesPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

const PAGES = ['catalog', 'calendar', 'reservations', 'teams', 'admin'];
const pageFromHash = () => {
  const h = window.location.hash.slice(1);
  return PAGES.includes(h) ? h : 'catalog';
};

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} | resursă
  const [deleting, setDeleting] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setResources(await api.getAll());
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

  async function handleSave(data) {
    setServerErrors({});
    try {
      if (editing.id) {
        await api.update(editing.id, data);
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
    }
  }

  return (
    <>
      <Header
        page={page}
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
          onReserve={(r) =>
            notify(
              `Rezervarea pentru „${r.name}” va fi disponibilă în ` +
                'următoarea etapă a proiectului.',
              'info',
            )
          }
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
        />
      )}
      {['calendar', 'reservations', 'teams'].includes(page) && (
        <PlaceholderPage page={page} onNavigate={navigate} />
      )}

      <footer className="site-foot">
        © 2026 Universitatea · Suport: helpdesk@universitate.ro
      </footer>

      {editing && (
        <ResourceFormModal
          initial={editing.id ? editing : null}
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
