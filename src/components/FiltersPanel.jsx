import {CATEGORIES, STATES} from '../constants.js';
import {Icon} from './Icons.jsx';

function toggle(list, value) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function FiltersPanel({
  filters,
  onChange,
  onReset,
  counts,
  buildings,
}) {
  const set = (patch) => onChange({...filters, ...patch});

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
                set({categories: toggle(filters.categories, key)})
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
              onChange={() => set({states: toggle(filters.states, key)})}
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
            onChange={(e) => set({building: e.target.value})}
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
            onChange={(e) => set({noApproval: e.target.checked})}
          />
          <span className="switch-track" aria-hidden="true" />
          <span>Doar fără aprobare manuală</span>
        </label>
      </fieldset>
    </aside>
  );
}
