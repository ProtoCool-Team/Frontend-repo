// Statusurile unei rezervări și cum le afișăm pe pagina „Rezervările mele”.
export const RESERVATION_STATUS = {
  DRAFT: 'Ciornă',
  PENDING: 'În așteptare',
  APPROVED: 'Aprobată',
  REJECTED: 'Respinsă',
  CANCELLED: 'Anulată',
  ACTIVE: 'În desfășurare',
  COMPLETED: 'Finalizată',
  EXPIRED: 'Expirată',
};

// Statusurile din panoul de filtre (eticheta de acolo e la feminin singular)
export const FILTER_STATUSES = {
  ACTIVE: 'Activă',
  PENDING: 'În așteptare',
  APPROVED: 'Aprobată',
  REJECTED: 'Respinsă',
  COMPLETED: 'Finalizată',
};

// Statusul afișat, după ora curentă: o rezervare aprobată în curs e
// „În desfășurare”, una aprobată deja încheiată e „Finalizată”, iar o
// cerere rămasă în așteptare după încheiere e „Expirată”.
// TODO (backend): job care actualizează aceste statusuri în baza de date.
export function displayStatus(r, now = new Date()) {
  const started = r.start <= now;
  const ended = r.end <= now;
  if (['APPROVED', 'ACTIVE'].includes(r.status)) {
    if (ended) return 'COMPLETED';
    if (started) return 'ACTIVE';
  }
  if (['PENDING', 'DRAFT'].includes(r.status) && ended) return 'EXPIRED';
  return r.status;
}

const TIME_ZONE = 'Europe/Bucharest';
const format = (options) =>
  new Intl.DateTimeFormat('ro-RO', {timeZone: TIME_ZONE, ...options});
const dayFormat = format({weekday: 'short', day: 'numeric', month: 'short'});
const dateFormat = format({day: 'numeric', month: 'short', year: 'numeric'});
const timeFormat = format({hour: '2-digit', minute: '2-digit'});

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// „Lun, 26 oct.”
export function formatDay(date) {
  return capitalize(dayFormat.format(date).replace('.,', ','));
}

// „15 oct. 2026”
export function formatDate(date) {
  return dateFormat.format(date);
}

// „15:00”
export function formatTime(date) {
  return timeFormat.format(date);
}

// „09:00 – 17:00”
export function formatInterval(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

// „1 h 42 min”, „35 min”
export function formatDuration(ms) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

// „1 rezervare”, „3 rezervări”, „20 de rezervări”
export function reservationsLabel(n) {
  if (n === 1) return '1 rezervare';
  const mod = n % 100;
  return n >= 20 && (mod === 0 || mod >= 20)
    ? `${n} de rezervări`
    : `${n} rezervări`;
}
