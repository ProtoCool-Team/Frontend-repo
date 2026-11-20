import {CATEGORIES, STATES} from '../constants.js';
import {Icon} from './Icons.jsx';
import {toggle} from '../utils.js';

export default function FiltersPanel({
  filters,
  onChange,
  onReset,
  counts,
  buildings,
}) {
  const patchFilters = (patch) => onChange({...filters, ...patch});

  return (
    <aside className="filters" aria-label="Filtre">
      <div className="filters-head">
        <h2>Filtre</h2>
        <button className="link" onClick={onReset}>
          Resetează
        </button>
      </div>

      <fieldset>
        <legend>Categorie</legend>
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={filters.categories.includes(key)}
              onChange={() =>
                patchFilters({categories: toggle(filters.categories, key)})
              }
            />
            <span>{c.label}</span>
            <span className="count">{counts.category[key] || 0}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Stare</legend>
        {Object.entries(STATES).map(([key, s]) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={filters.states.includes(key)}
              onChange={() =>
                patchFilters({states: toggle(filters.states, key)})
              }
            />
            <span>{s.filter}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Clădire</legend>
        <div className="select-wrap">
          <select
            aria-label="Clădire"
            value={filters.building}
            onChange={(e) => patchFilters({building: e.target.value})}
          >
            <option value="">Toate clădirile</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Aprobare</legend>
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={filters.noApproval}
            onChange={(e) => patchFilters({noApproval: e.target.checked})}
          />
          <span className="switch-track" aria-hidden="true" />
          <span>Doar fără aprobare manuală</span>
        </label>
      </fieldset>
    </aside>
  );
}
