// KAN-8: perioade de indisponibilitate temporară (revizie / defect).
// Dacă VITE_USE_MOCK=true, perioadele sunt ținute în memorie.
import {addDays, isoDay} from '../reserveRules.js';
import {mockResources} from './mockData.js';
import {request} from './resources.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const realApi = {
  list: (resourceId) => request(`/resources/${resourceId}/unavailability`),
  create: (resourceId, data) =>
    request(`/resources/${resourceId}/unavailability`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (resourceId, periodId) =>
    request(`/resources/${resourceId}/unavailability/${periodId}`, {
      method: 'DELETE',
    }),
};

// ---------- Date de test (mock) ----------
// Perioadele inițiale vin din mockData (câmpul `unavailability`).
const mockPeriods = mockResources
  .filter((r) => r.unavailability)
  .map((r) => ({...r.unavailability, resource_id: r.id}));
let nextMockId = mockPeriods.length + 1;

const wait = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), 250));

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const sameId = (a, b) => String(a) === String(b);

// Perioadele curente și viitoare ale unei resurse, ordonate după început.
function upcoming(resourceId) {
  const today = isoDay(new Date());
  return mockPeriods
    .filter((p) => sameId(p.resource_id, resourceId) && p.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
}

const mockApi = {
  list: (resourceId) => wait(upcoming(resourceId).map((p) => ({...p}))),
  create: async (resourceId, data) => {
    if (!data.start_date || !data.end_date || data.end_date < data.start_date) {
      throw httpError('Interval de date invalid.', 400);
    }
    if (data.start_date < isoDay(new Date())) {
      throw httpError('Perioada nu poate începe în trecut', 400);
    }
    const overlap = mockPeriods.some(
      (p) =>
        sameId(p.resource_id, resourceId) &&
        p.start_date <= data.end_date &&
        data.start_date <= p.end_date,
    );
    if (overlap) {
      throw httpError(
        'Perioada se suprapune cu o indisponibilitate existentă.',
        409,
      );
    }
    const period = {
      period_id: `unav-${nextMockId++}`,
      resource_id: resourceId,
      type: data.type,
      details: data.details || null,
      start_date: data.start_date,
      end_date: data.end_date,
    };
    mockPeriods.push(period);
    return wait({period: {...period}, affected_reservations: []});
  },
  remove: async (resourceId, periodId) => {
    const today = isoDay(new Date());
    const idx = mockPeriods.findIndex(
      (p) => sameId(p.resource_id, resourceId) && sameId(p.period_id, periodId),
    );
    if (idx === -1) throw httpError('Perioada nu a fost găsită.', 404);
    const period = mockPeriods[idx];
    if (period.end_date < today) {
      throw httpError('Perioada s-a încheiat deja.', 409);
    }
    // Ca backend-ul: o perioadă care începe azi sau mai târziu se șterge.
    if (period.start_date >= today) {
      mockPeriods.splice(idx, 1);
      return wait(null);
    }
    const updated = {...period, end_date: isoDay(addDays(new Date(), -1))};
    mockPeriods[idx] = updated;
    return wait({...updated});
  },
};

// Pentru catalogul mock: perioada curentă sau următoare a resursei,
// cu aceeași formă ca `unavailability` din GET /resources.
export function mockUnavailabilityFor(resourceId) {
  const period = upcoming(resourceId)[0];
  return period
    ? {...period, active: period.start_date <= isoDay(new Date())}
    : null;
}

export const unavailabilityApi = USE_MOCK ? mockApi : realApi;
