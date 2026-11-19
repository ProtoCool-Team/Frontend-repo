import {Icon} from './Icons.jsx';

// Coloana din dreapta a paginii „Rezervările mele”.
//
// TODO (coleg): MiniCalendar – luna curentă, cu puncte colorate în zilele
// cu rezervări (verde = activă, albastru = aprobată, portocaliu = în
// așteptare). Primește `items` (rezervările, cu shownStatus).
//
// TODO (coleg): NotificationsPanel – ultimele notificări ale utilizatorului.
// Are nevoie de o rută nouă în backend: GET /api/v1/me/notifications
// (tabelul notifications), plus „Vezi toate”.
function Placeholder({title}) {
  return (
    <div className="panel rs-side-panel">
      <h3>{title}</h3>
      <p className="muted">În lucru – vezi TODO în ReservationSidebar.jsx.</p>
    </div>
  );
}

export default function ReservationSidebar() {
  return (
    <aside className="rs-side">
      <Placeholder title="Calendar" />
      <Placeholder title="Notificări" />
      {/* Baza de date nu permite rezervări suprapuse pe aceeași resursă
          (constrângerea no_overlapping_reservations). */}
      <div className="rs-no-overlap">
        <Icon name="check" size={16} />
        <div>
          <strong>Nicio suprapunere</strong>
          <p>Sistemul verifică automat disponibilitatea resurselor.</p>
        </div>
      </div>
    </aside>
  );
}
