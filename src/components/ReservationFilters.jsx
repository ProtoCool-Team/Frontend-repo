import {CATEGORIES} from '../constants.js';
import {FILTER_STATUSES} from '../reservationStatus.js';

function toggle(list, value) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

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
      {/* TODO (coleg): secțiunea „Perioadă” din Figma – „Alege data”,
          „De la” / „Până la”. Adăugați from/to în EMPTY_FILTERS
          (reservationFilters.js) și verificarea lor în applyFilters. */}
    </aside>
  );
}
