// KAN-20: secțiunile paginii Administrare (resurse și utilizatori).
const TABS = [
  ['admin', 'Resurse'],
  ['users', 'Utilizatori și roluri'],
];

export default function AdminTabs({page, onNavigate}) {
  return (
    <div className="chips" role="tablist" aria-label="Secțiuni administrare">
      {TABS.map(([key, label]) => (
        <button
          key={key}
          role="tab"
          aria-selected={page === key}
          className={page === key ? 'chip active' : 'chip'}
          onClick={() => onNavigate(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
