import {CATEGORIES} from '../constants.js';
import {FILTER_STATUSES} from '../reservationStatus.js';
import {toggle} from '../utils.js';

function CheckGroup({legend, options, selected, counts, onToggle}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {Object.entries(options).map(([key, label]) => (
        <label key={key} className="check">
          <input
            type="checkbox"
            checked={selected.includes(key)}
            onChange={() => onToggle(key)}
          />
          <span>{label}</span>
          <span className="count">{counts[key] || 0}</span>
        </label>
      ))}
    </fieldset>
  );
}

// Panoul „Filtre” din stânga: status și categorie.
export default function ReservationFilters({
  filters,
  counts,
  onChange,
  onReset,
}) {
  const categoryLabels = Object.fromEntries(
    Object.entries(CATEGORIES).map(([key, c]) => [key, c.label]),
  );
  return (
    <aside className="filters" aria-label="Filtre">
      <div className="filters-head">
        <h2>Filtre</h2>
        <button className="link" onClick={onReset}>
          Resetează
        </button>
      </div>
      <CheckGroup
        legend="Status"
        options={FILTER_STATUSES}
        selected={filters.statuses}
        counts={counts.status}
        onToggle={(key) =>
          onChange({...filters, statuses: toggle(filters.statuses, key)})
        }
      />
      <CheckGroup
        legend="Categorie"
        options={categoryLabels}
        selected={filters.categories}
        counts={counts.category}
        onToggle={(key) =>
          onChange({...filters, categories: toggle(filters.categories, key)})
        }
      />

      <fieldset>
        <legend>Perioadă</legend>
        <div className="period">
          <label>
            <span>De la</span>
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onChange({...filters, from: e.target.value})}
            />
          </label>
          <label>
            <span>Până la</span>
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onChange({...filters, to: e.target.value})}
            />
          </label>
        </div>
      </fieldset>
    </aside>
  );
}
