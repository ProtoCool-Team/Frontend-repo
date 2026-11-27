// Regulile și calculele pentru ecranul „Rezervare”.
export const DAY_START = 8;
export const DAY_END = 20;
export const HOURS = Array.from(
  {length: DAY_END - DAY_START},
  (_, i) => DAY_START + i,
);

// Regulile resursei; backend-ul le trimite (max_consecutive_hours etc.),
// iar dacă lipsesc folosim valorile din prototipul Figma.
export function rulesFor(resource) {
  return {
    maxHours: resource?.max_consecutive_hours || 2,
    maxDays: resource?.max_advance_days || 14,
    cancelHours: resource?.min_cancel_notice_hours || 1,
  };
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function atHour(day, h) {
  const x = new Date(day);
  x.setHours(h, 0, 0, 0);
  return x;
}

export const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

// Ziua (ora locală) ca 'YYYY-MM-DD', ca în perioadele de indisponibilitate.
export function isoDay(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, '0')}`;
}

// KAN-8: ziua cade în perioada de indisponibilitate curentă / următoare.
// (Toate perioadele, pentru calendar, vin în KAN-9.)
function inUnavailability(resource, d) {
  const period = resource?.unavailability;
  if (!period) return false;
  const day = isoDay(d);
  return day >= period.start_date && day <= period.end_date;
}

// Primele `count` zile lucrătoare începând cu `from` (inclusiv).
export function workingDays(from, count) {
  const days = [];
  let d = startOfDay(from);
  while (days.length < count) {
    if (!isWeekend(d)) days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export const overlaps = (a, b) => a.start < b.end && b.start < a.end;

// Rezervările care ocupă resursa (cele anulate sau respinse nu contează).
export const blocking = (blocks) =>
  blocks.filter((b) => !['CANCELLED', 'REJECTED'].includes(b.status));

// Motivul pentru care intervalul ales nu poate fi rezervat, sau null.
export function selectionError(sel, blocks, rules, resource, now = new Date()) {
  if (!sel) return 'Alege un interval liber din calendar.';
  if (resource?.status === 'UNAVAILABLE') {
    return 'Resursa este scoasă din uz.';
  }
  if (sel.end <= sel.start) {
    return 'Ora de sfârșit trebuie să fie după ora de început.';
  }
  if (sel.start < now) return 'Intervalul ales a trecut deja.';
  if (isWeekend(sel.start)) return 'Sâmbăta și duminica laboratorul e închis.';
  if (inUnavailability(resource, sel.start)) {
    return 'Resursa este indisponibilă în ziua aleasă.';
  }
  if (sel.start > addDays(startOfDay(now), rules.maxDays + 1)) {
    return `Poți rezerva cu cel mult ${rules.maxDays} zile în avans.`;
  }
  const hours = (sel.end - sel.start) / 3600000;
  if (hours > rules.maxHours) {
    return `Poți rezerva cel mult ${rules.maxHours} ore consecutive.`;
  }
  if (blocking(blocks).some((b) => overlaps(sel, b))) {
    return 'Intervalul se suprapune cu o rezervare existentă.';
  }
  return null;
}

// Starea unei celule de o oră din calendar.
export function slotState({day, hour, blocks, sel, resource, rules, now}) {
  const slot = {start: atHour(day, hour), end: atHour(day, hour + 1)};
  if (slot.end <= now) return {kind: 'past'};
  if (resource?.status === 'UNAVAILABLE') return {kind: 'unavailable'};
  if (inUnavailability(resource, slot.start)) return {kind: 'unavailable'};
  if (slot.start > addDays(startOfDay(now), rules.maxDays + 1)) {
    return {kind: 'out'};
  }
  const block = blocking(blocks).find((b) => overlaps(slot, b));
  if (block) {
    return {
      kind: block.mine ? 'mine' : 'busy',
      first: hour === firstHour(block),
    };
  }
  if (sel && overlaps(slot, sel)) {
    return {kind: 'selected', first: hour === sel.start.getHours()};
  }
  return {kind: 'free'};
}

const firstHour = (b) => Math.max(b.start.getHours(), DAY_START);

export const pad = (h) => `${String(h).padStart(2, '0')}:00`;

export function formatDay(d, options = {}) {
  return d.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...options,
  });
}
