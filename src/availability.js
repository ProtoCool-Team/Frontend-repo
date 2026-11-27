import {
  DAY_START,
  SLOT,
  SLOTS,
  STATUS,
  unavailabilityLabel,
} from './constants.js';

// Indexul orei curente în bara 08–20 (poate fi <0 sau >=SLOTS)
export function currentSlot() {
  return new Date().getHours() - DAY_START;
}

// Starea curentă a unei resurse: FREE, BUSY sau UNAVAILABLE
export function resourceState(r) {
  if (r.status === STATUS.UNAVAILABLE || r.unavailability?.active) {
    return 'UNAVAILABLE';
  }
  const i = currentSlot();
  if (i >= 0 && i < SLOTS && r.availability?.[i] === SLOT.BUSY) {
    return 'BUSY';
  }
  return 'FREE';
}

const hour = (i) => `${String(DAY_START + i).padStart(2, '0')}:00`;

export function formatDate(iso) {
  if (!iso) return '';
  // 'YYYY-MM-DD' se citește ca zi locală (new Date ar lua miezul nopții UTC).
  const d =
    typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso)
      ? new Date(`${iso}T00:00`)
      : new Date(iso);
  return d.toLocaleDateString('ro-RO', {day: 'numeric', month: 'short'});
}

// Intervalul unei perioade de indisponibilitate, ex. „1 dec. – 5 dec.”
export function periodRangeText(p) {
  return `${formatDate(p.start_date)} – ${formatDate(p.end_date)}`;
}

// Textul din subsolul cardului (ex. „Liber până la 14:00”)
export function nextChangeText(r) {
  if (r.status === STATUS.UNAVAILABLE) return 'Scos din uz';
  if (r.unavailability?.active) {
    const label = unavailabilityLabel(r.unavailability.type);
    return `${label} până la ${formatDate(r.unavailability.end_date)}`;
  }
  const slots = r.availability;
  if (!slots) return 'Liber acum';
  const now = currentSlot();
  if (now >= SLOTS) return 'Programul de azi s-a încheiat';
  const from = Math.max(now, 0);
  if (slots[from] === SLOT.BUSY) {
    const j = slots.findIndex((s, k) => k > from && s !== SLOT.BUSY);
    return j === -1 ? 'Ocupat până la 20:00' : `Liber de la ${hour(j)}`;
  }
  const j = slots.findIndex((s, k) => k > from && s === SLOT.BUSY);
  if (j === -1) return now <= 0 ? 'Liber toată ziua' : 'Liber până la 20:00';
  return `Liber până la ${hour(j)}`;
}
