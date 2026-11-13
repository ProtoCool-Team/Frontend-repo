import {useEffect, useState} from 'react';
import {api, isMock} from './api/resources.js';
import {TYPES} from './labels.js';
import ResourceTable from './components/ResourceTable.jsx';
import ResourceForm from './components/ResourceForm.jsx';

export default function App() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null); // null = formular închis, {} = resursă nouă, obiect = editare
  const [serverErrors, setServerErrors] = useState({});
  const [filter, setFilter] = useState('ALL');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setResources(await api.getAll());
    } catch (e) {
      setError(
        `Nu am putut încărca resursele: ${e.message}. Verifică dacă backend-ul rulează.`,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function flash(text) {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleSave(data) {
    setServerErrors({});
    try {
      if (editing.id) {
        await api.update(editing.id, data);
        flash(`Resursa „${data.name}” a fost actualizată.`);
      } else {
        await api.create(data);
        flash(`Resursa „${data.name}” a fost adăugată.`);
      }
      setEditing(null);
      load();
    } catch (e) {
      setServerErrors(e.fieldErrors || {});
      setError(e.message);
    }
  }

  async function handleDelete(r) {
    if (
      !window.confirm(
        `Ștergi resursa „${r.name}”? Acțiunea nu poate fi anulată.`,
      )
    )
      return;
    try {
      await api.remove(r.id);
      flash(`Resursa „${r.name}” a fost ștearsă.`);
      load();
    } catch (e) {
      setError(`Nu am putut șterge resursa: ${e.message}`);
    }
  }

  const visible =
    filter === 'ALL' ? resources : resources.filter((r) => r.type === filter);

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>Resurse de cercetare</h1>
          <p className="muted">
            Echipamentele și sălile care pot fi rezervate de echipe.
          </p>
        </div>
        {!editing && (
          <button
            className="btn-primary"
            onClick={() => {
              setServerErrors({});
              setEditing({});
            }}
          >
            Adaugă resursă
          </button>
        )}
      </header>

      {isMock && (
        <p className="notice">
          Mod test: datele sunt locale și se pierd la reîncărcarea paginii.
        </p>
      )}
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {editing && (
        <ResourceForm
          key={editing.id || 'new'}
          initial={editing.id ? editing : null}
          serverErrors={serverErrors}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="filters" role="group" aria-label="Filtrează după tip">
        {[['ALL', 'Toate'], ...Object.entries(TYPES)].map(([k, v]) => (
          <button
            key={k}
            className={filter === k ? 'chip active' : 'chip'}
            onClick={() => setFilter(k)}
          >
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Se încarcă resursele…</p>
      ) : (
        <ResourceTable
          resources={visible}
          onEdit={(r) => {
            setServerErrors({});
            setEditing(r);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
