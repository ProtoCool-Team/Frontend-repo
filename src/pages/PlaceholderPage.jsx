const TITLES = {
  calendar: 'Calendar',
  reservations: 'Rezervările mele',
  teams: 'Echipe',
};

export default function PlaceholderPage({page, onNavigate}) {
  return (
    <main className="page">
      <p className="crumbs">Acasă / {TITLES[page]}</p>
      <h1>{TITLES[page]}</h1>
      <div className="panel empty">
        <p>Pagina aceasta va fi implementată în laboratoarele următoare.</p>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('catalog')}
        >
          Înapoi la catalog
        </button>
      </div>
    </main>
  );
}
