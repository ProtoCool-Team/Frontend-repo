// KAN-8: perioade de indisponibilitate temporară (revizie / defect).
// Dacă VITE_USE_MOCK=true, perioadele sunt ținute în memorie.
import {mockResources} from './mockData.js';
import {request} from './resources.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const UNAVAILABILITY_TYPES = {
  IN_REVIEW: 'IN_REVIEW',
  DEFECT: 'DEFECT',
};

export const TYPE_LABELS = {
  IN_REVIEW: 'În revizie',
  DEFECT: 'Defect',
};

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
function localIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localIsoDate(d);
}

const mockPeriods = mockResources
  .filter((r) => r.unavailability)
  .map((r) => ({
    period_id: r.unavailability.period_id,
    resource_id: r.id,
    type: r.unavailability.type,
    details: r.unavailability.details ?? null,
    start_date: r.unavailability.start_date,
    end_date: r.unavailability.end_date,
  }));
let nextMockId = mockPeriods.length + 1;

const wait = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), 250));

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const mockApi = {
  list: (resourceId) => {
    const today = localIsoDate();
    const rows = mockPeriods
      .filter(
        (p) =>
          String(p.resource_id) === String(resourceId) && p.end_date >= today,
      )
      .sort((a, b) => a.start_date.localeCompare(b.start_date))
      .map((p) => ({...p}));
    return wait(rows);
  },
  create: async (resourceId, data) => {
    if (!data.start_date || !data.end_date || data.end_date < data.start_date) {
      throw httpError('Interval de date invalid.', 400);
    }
    const overlap = mockPeriods.some(
      (p) =>
        String(p.resource_id) === String(resourceId) &&
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
    const today = localIsoDate();
    const idx = mockPeriods.findIndex(
      (p) =>
        String(p.resource_id) === String(resourceId) &&
        String(p.period_id) === String(periodId),
    );
    if (idx === -1) throw httpError('Perioada nu a fost găsită.', 404);
    const period = mockPeriods[idx];
    if (period.end_date < today) {
      throw httpError('Perioada s-a încheiat deja.', 409);
    }
    if (period.start_date > today) {
      mockPeriods.splice(idx, 1);
      return wait(null);
    }
    const updated = {...period, end_date: yesterdayIso()};
    mockPeriods[idx] = updated;
    return wait({...updated});
  },
};

export const unavailabilityApi = USE_MOCK ? mockApi : realApi;
