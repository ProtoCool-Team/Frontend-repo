// Filtrare, sortare și numărători pentru pagina „Rezervările mele”.
// Toate lucrează pe lista completă primită de la backend.
import {displayStatus} from './reservationStatus.js';

// Filele de deasupra listei: cheia și ce rezervări arată fiecare.
export const TABS = [
  {key: 'all', label: 'Toate'},
  {key: 'ACTIVE', label: 'Active'},
  {key: 'PENDING', label: 'În așteptare'},
  {key: 'APPROVED', label: 'Aprobate'},
  {key: 'REJECTED', label: 'Respinse'},
  {key: 'history', label: 'Istoric'},
];

export const SORTS = {
  date: {label: 'Sortare: dată', compare: (a, b) => a.start - b.start},
  resource: {
    label: 'Sortare: resursă',
    compare: (a, b) => a.resourceName.localeCompare(b.resourceName, 'ro'),
  },
  status: {
    label: 'Sortare: status',
    compare: (a, b) => a.shownStatus.localeCompare(b.shownStatus),
  },
};

export const EMPTY_FILTERS = {statuses: [], categories: [], from: '', to: ''};

// Istoric = rezervările încheiate sau care nu mai au loc.
const CLOSED = ['REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'];
export const isHistory = (r) => CLOSED.includes(r.shownStatus);

// Adaugă fiecărei rezervări statusul afișat (vezi displayStatus).
export function withShownStatus(items, now = new Date()) {
  return items.map((r) => ({...r, shownStatus: displayStatus(r, now)}));
}

function matchesTab(r, tab) {
  if (tab === 'all') return true;
  if (tab === 'history') return isHistory(r);
  return r.shownStatus === tab;
}

function matchesSearch(r, search) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [r.resourceName, r.purpose, r.room, r.building]
    .join(' ')
    .toLowerCase()
    .includes(q);
}
// Perioada aleasă în filtre („De la” / „Până la”, zile întregi).
// O rezervare intră în perioadă dacă se suprapune cu ea, chiar și parțial.
function matchesPeriod(r, from, to) {
  if (from && r.end <= new Date(`${from}T00:00`)) return false;
  if (to && r.start >= new Date(`${to}T23:59:59`)) return false;
  return true;
}
// Lista vizibilă: fila + filtrele din stânga + căutarea, apoi sortarea.
export function applyFilters(items, {tab, filters, search, sort}) {
  return items
    .filter(
      (r) =>
        matchesTab(r, tab) &&
        (!filters.statuses.length ||
          filters.statuses.includes(r.shownStatus)) &&
        (!filters.categories.length ||
          filters.categories.includes(r.category)) &&
        matchesPeriod(r, filters.from, filters.to) &&
        matchesSearch(r, search),
    )
    .sort(SORTS[sort].compare);
}

// Câte rezervări are fiecare status / categorie / filă.
export function countBy(items) {
  const counts = {status: {}, category: {}, tab: {}};
  items.forEach((r) => {
    counts.status[r.shownStatus] = (counts.status[r.shownStatus] || 0) + 1;
    counts.category[r.category] = (counts.category[r.category] || 0) + 1;
  });
  TABS.forEach((t) => {
    counts.tab[t.key] = items.filter((r) => matchesTab(r, t.key)).length;
  });
  return counts;
}

// Datele pentru cele patru carduri de sus.
export function summarize(items, now = new Date()) {
  const active = items.filter((r) => r.shownStatus === 'ACTIVE');
  const next = items
    .filter((r) => ['APPROVED', 'PENDING'].includes(r.shownStatus))
    .filter((r) => r.start > now)
    .sort((a, b) => a.start - b.start)[0];
  const count = (s) => items.filter((r) => r.shownStatus === s).length;
  return {
    active,
    next,
    pending: count('PENDING'),
    completed: count('COMPLETED'),
    rejected: count('REJECTED'),
  };
}
