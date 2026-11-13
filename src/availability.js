import {DAY_START, SLOTS} from './constants.js';

// Indexul orei curente în bara 08–20 (poate fi <0 sau >=SLOTS)
export function currentSlot() {
  return new Date().getHours() - DAY_START;
}

// Starea curentă a unei resurse: FREE, BUSY sau UNAVAILABLE
export function resourceState(r) {
  if (r.status === 'UNAVAILABLE') return 'UNAVAILABLE';
  const i = currentSlot();
  if (r.availability && i >= 0 && i < SLOTS && r.availability[i] === 'busy') {
    return 'BUSY';
  }
  return 'FREE';
}

const hour = (i) => `${String(DAY_START + i).padStart(2, '0')}:00`;

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ro-RO', {day: 'numeric', month: 'short'});
}

// Textul din subsolul cardului (ex. „Liber până la 14:00”)
export function nextChangeText(r) {
  if (r.status === 'UNAVAILABLE') {
    return r.unavailableUntil
      ? `Indisponibil până la ${formatDate(r.unavailableUntil)}`
      : 'Indisponibil';
  }
  const slots = r.availability;
  if (!slots) return 'Liber acum';
  const now = currentSlot();
  if (now >= SLOTS) return 'Programul de azi s-a încheiat';
  const from = Math.max(now, 0);
  if (slots[from] === 'busy') {
    const j = slots.findIndex((s, k) => k > from && s !== 'busy');
    return j === -1 ? 'Ocupat până la 20:00' : `Liber de la ${hour(j)}`;
  }
  const j = slots.findIndex((s, k) => k > from && s === 'busy');
  if (j === -1) return now <= 0 ? 'Liber toată ziua' : 'Liber până la 20:00';
  return `Liber până la ${hour(j)}`;
}

export {formatDate};
