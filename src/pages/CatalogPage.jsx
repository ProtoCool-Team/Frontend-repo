import {useEffect, useMemo, useState} from 'react';
import {CATEGORIES, PAGE_SIZE, resourcesLabel} from '../constants.js';
import {resourceState} from '../availability.js';
import {Icon} from '../components/Icons.jsx';
import FiltersPanel from '../components/FiltersPanel.jsx';
import ResourceCard from '../components/ResourceCard.jsx';
import Pagination from '../components/Pagination.jsx';

const EMPTY_FILTERS = {
  categories: [],
  states: [],
  building: '',
  noApproval: false,
};
const STATE_ORDER = {FREE: 0, BUSY: 1, UNAVAILABLE: 2};

export default function CatalogPage({
  resources,
  loading,
  search,
  onSearch,
  onReserve,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('availability');
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [filters, sort, search]);

  const counts = useMemo(() => {
    const category = {};
    resources.forEach((r) => {
      category[r.category] = (category[r.category] || 0) + 1;
    });
    return {category};
  }, [resources]);

  const buildings = useMemo(
    () => [...new Set(resources.map((r) => r.building).filter(Boolean))].sort(),
    [resources],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = resources.filter((r) => {
      const state = resourceState(r);
      if (
        filters.categories.length &&
        !filters.categories.includes(r.category)
      ) {
        return false;
      }
      if (filters.states.length && !filters.states.includes(state)) {
        return false;
      }
      if (filters.building && r.building !== filters.building) return false;
      if (filters.noApproval && r.requiresApproval) return false;
      if (!q) return true;
      return [r.name, r.description, r.room, r.building]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q));
    });
    return list.sort((a, b) => {
      if (sort === 'availability') {
        const d = STATE_ORDER[resourceState(a)] - STATE_ORDER[resourceState(b)];
        if (d !== 0) return d;
      }
      return a.name.localeCompare(b.name, 'ro');
    });
  }, [resources, filters, sort, search]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );
  const activeChip =
    filters.categories.length === 1 ? filters.categories[0] : 'ALL';

  return (
    <main className="page">
      <p className="crumbs">Acasă / Catalog</p>
      <div className="page-head">
        <div>
          <h1>Catalog resurse</h1>
          <p className="subtitle">
            {resourcesLabel(resources.length)} · disponibilitate pentru ziua de
            azi
          </p>
        </div>
      </div>

      <div className="catalog">
        <FiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          counts={counts}
          buildings={buildings}
        />

        <section className="catalog-main" aria-label="Resurse">
          <div className="toolbar">
            <label className="big-search">
              <Icon name="search" size={18} />
              <input
                type="search"
                placeholder="Caută după denumire (ex. NAO, osciloscop, C204)…"
                aria-label="Caută după denumire"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
            </label>
            <div className="select-wrap sort">
              <select
                aria-label="Sortare"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="availability">Sortare: disponibilitate</option>
                <option value="name">Sortare: denumire (A–Z)</option>
              </select>
              <Icon name="chevron" size={16} />
            </div>
          </div>

          <div className="chips" role="group" aria-label="Categorie">
            <button
              className={activeChip === 'ALL' ? 'chip active' : 'chip'}
              onClick={() => setFilters({...filters, categories: []})}
            >
              Toate ({resources.length})
            </button>
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <button
                key={key}
                className={activeChip === key ? 'chip active' : 'chip'}
                onClick={() => setFilters({...filters, categories: [key]})}
              >
                {c.single} ({counts.category[key] || 0})
              </button>
            ))}
          </div>

          <div className="legend">
            <span>Disponibilitate azi, 08–20:</span>
            <span className="legend-item">
              <i className="slot slot-free" /> Liber
            </span>
            <span className="legend-item">
              <i className="slot slot-busy" /> Ocupat
            </span>
            <span className="legend-item">
              <i className="slot slot-unavailable" /> Indisponibil
            </span>
            <span className="legend-item">
              <i className="slot slot-past" /> Trecut
            </span>
          </div>

          {loading ? (
            <p className="empty">Se încarcă resursele…</p>
          ) : pageItems.length === 0 ? (
            <div className="empty">
              <p>Nicio resursă nu corespunde filtrelor alese.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  onSearch('');
                }}
              >
                Șterge filtrele
              </button>
            </div>
          ) : (
            <div className="grid">
              {pageItems.map((r) => (
                <ResourceCard key={r.id} resource={r} onReserve={onReserve} />
              ))}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="list-foot">
              <span>
                Afișare {(current - 1) * PAGE_SIZE + 1}–
                {(current - 1) * PAGE_SIZE + pageItems.length} din{' '}
                {resourcesLabel(visible.length)}
              </span>
              <Pagination page={current} total={totalPages} onPage={setPage} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
