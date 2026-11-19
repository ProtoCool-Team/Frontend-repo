import {Icon} from './Icons.jsx';
import {SORTS, TABS} from '../reservationFilters.js';

// Căutarea, sortarea și filele (Toate, Active, ...) de deasupra listei.
export default function ReservationToolbar({
  search,
  onSearch,
  sort,
  onSort,
  tab,
  onTab,
  tabCounts,
  updatedLabel,
}) {
  return (
    <>
      <div className="toolbar">
        <label className="big-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Caută după resursă sau scop (ex: NAO, cluster, C204)…"
            aria-label="Caută în rezervări"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        <div className="select-wrap sort">
          <select
            aria-label="Sortare"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
          >
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </div>
      </div>

      <div className="rs-tabs">
        <div className="chips" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? 'chip active' : 'chip'}
              onClick={() => onTab(t.key)}
            >
              {t.label} ({tabCounts[t.key] || 0})
            </button>
          ))}
        </div>
        <span className="muted">{updatedLabel}</span>
      </div>
    </>
  );
}
