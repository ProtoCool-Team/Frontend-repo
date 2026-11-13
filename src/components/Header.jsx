import {Icon} from './Icons.jsx';

const NAV = [
  ['catalog', 'Catalog'],
  ['calendar', 'Calendar'],
  ['reservations', 'Rezervările mele'],
  ['teams', 'Echipe'],
  ['admin', 'Administrare'],
];

export default function Header({page, onNavigate, search, onSearch}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => onNavigate('catalog')}>
          <span className="brand-mark">
            <Icon name="logo" size={20} />
          </span>
          <span className="brand-text">
            <strong>RRM</strong>
            <small>Research Resource Manager</small>
          </span>
        </button>

        <nav className="nav" aria-label="Navigare principală">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              className={page === key ? 'nav-link active' : 'nav-link'}
              aria-current={page === key ? 'page' : undefined}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="topbar-tools">
          <label className="top-search">
            <Icon name="search" size={15} />
            <input
              type="search"
              placeholder="Caută resurse…"
              aria-label="Caută resurse"
              value={search}
              onChange={(e) => {
                onSearch(e.target.value);
                if (page !== 'catalog') onNavigate('catalog');
              }}
            />
          </label>
          <button className="icon-btn" aria-label="Notificări">
            <Icon name="bell" size={17} />
          </button>
          <span className="avatar" aria-label="Contul meu">
            AM
          </span>
        </div>
      </div>
    </header>
  );
}
