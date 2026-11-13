export const CATEGORIES = {
  ROBOT: {label: 'Roboți', single: 'Roboți'},
  MEASUREMENT: {label: 'Aparate de măsură', single: 'Aparate de măsură'},
  COMPUTE: {label: 'Calcul (cluster, stații)', single: 'Calcul'},
  ROOM: {label: 'Săli de laborator', single: 'Săli'},
};

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
