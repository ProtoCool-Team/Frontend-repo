export const CATEGORIES = {
  ROBOT: {label: 'Roboți', single: 'Roboți'},
  MEASUREMENT: {label: 'Aparate de măsură', single: 'Aparate de măsură'},
  COMPUTE: {label: 'Calcul (cluster, stații)', single: 'Calcul'},
  ROOM: {label: 'Săli de laborator', single: 'Săli'},
};

// Eticheta scurtă a unei categorii (sau cheia, dacă e necunoscută)
export function categoryLabel(key) {
  return CATEGORIES[key]?.single || key;
}

// Eticheta unei locații, ex. „Corp C · C102 (etaj 1)”
export function locationLabel(l) {
  const floor =
    l.floor === null || l.floor === undefined ? '' : ` (etaj ${l.floor})`;
  return `${l.building} · ${l.room}${floor}`;
}

// Valorile câmpului `status` al unei resurse
export const STATUS = {AVAILABLE: 'AVAILABLE', UNAVAILABLE: 'UNAVAILABLE'};

// Valorile unui interval de o oră din `availability`
export const SLOT = {FREE: 'free', BUSY: 'busy'};

export const STATES = {
  FREE: {label: 'Liber', filter: 'Liber acum'},
  BUSY: {label: 'Ocupat', filter: 'Ocupat'},
  UNAVAILABLE: {
    label: 'Indisponibil',
    filter: 'Indisponibil (defect / revizie)',
  },
};

// Intervalul zilnic afișat în bara de disponibilitate: 08:00–20:00
export const DAY_START = 8;
export const SLOTS = 12;

export const PAGE_SIZE = 9;

// „1 resursă”, „12 resurse”, „24 de resurse”
export function resourcesLabel(n) {
  if (n === 1) return '1 resursă';
  const mod = n % 100;
  return n >= 20 && (mod === 0 || mod >= 20)
    ? `${n} de resurse`
    : `${n} resurse`;
}
