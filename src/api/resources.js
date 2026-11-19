// Toate apelurile către backend sunt aici.
// Dacă VITE_USE_MOCK=true, se folosesc date de test (fără backend).
import {mockResources} from './mockData.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ---------- Adaptare între backend-ul Express și interfață ----------
// Backend-ul are alte nume de categorii și câmpuri în snake_case.
// Locația e o referință (location_id) la tabelul locations; backend-ul
// întoarce și building/room/floor ale ei. Motivul și data de
// indisponibilitate nu au încă coloane proprii, deci stau în attributes.
const CATEGORY_FROM_API = {
  ROBOT: 'ROBOT',
  MEASURING_DEVICE: 'MEASUREMENT',
  COMPUTE_CLUSTER: 'COMPUTE',
  LAB_ROOM: 'ROOM',
};
const CATEGORY_TO_API = Object.fromEntries(
  Object.entries(CATEGORY_FROM_API).map(([api, ui]) => [ui, api]),
);
const ATTRIBUTE_FIELDS = ['statusNote', 'unavailableUntil'];

function fromBackend(r) {
  const a = r.attributes || {};
  return {
    ...r, // restul câmpurilor rămân, pentru că PUT înlocuiește toată resursa
    id: r.resource_id,
    category: CATEGORY_FROM_API[r.type] || r.type,
    description: r.description ?? '',
    building: r.building ?? '',
    room: r.room ?? '',
    floor: r.floor ?? null,
    status: r.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE',
    requiresApproval: Boolean(r.requires_approval),
    statusNote: a.statusNote ?? null,
    unavailableUntil: a.unavailableUntil ?? null,
  };
}

// `data` = resursa originală peste care s-au pus valorile din formular.
function toBackend(data) {
  const attributes = {...(data.attributes || {})};
  ATTRIBUTE_FIELDS.forEach((f) => {
    if (data[f]) attributes[f] = data[f];
    else delete attributes[f];
  });
  return {
    name: data.name,
    description: data.description || null,
    type: CATEGORY_TO_API[data.category] || data.category,
    status: data.status,
    location_id: data.location_id ?? null,
    responsible_admin_id: data.responsible_admin_id ?? null,
    requires_approval: Boolean(data.requiresApproval),
    max_consecutive_hours: data.max_consecutive_hours ?? null,
    max_advance_days: data.max_advance_days ?? null,
    min_cancel_notice_hours: data.min_cancel_notice_hours ?? null,
    attributes,
  };
}

// Backend-ul răspunde cu {error: '...'} sau {errors: ['...', ...]}.
function errorMessage(body, status) {
  if (Array.isArray(body.errors) && body.errors.length) {
    return body.errors.join('; ');
  }
  return body.error || body.message || `Eroare ${status} de la server`;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {'Content-Type': 'application/json'},
    ...options,
  });
  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {
      // răspuns fără JSON
    }
    const err = new Error(errorMessage(body, res.status));
    err.fieldErrors = Array.isArray(body.errors) ? {} : body.errors || {};
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const realApi = {
  getAll: async () => (await request('/resources')).map(fromBackend),
  getLocations: () => request('/locations'),
  create: async (data) =>
    fromBackend(
      await request('/resources', {
        method: 'POST',
        body: JSON.stringify(toBackend(data)),
      }),
    ),
  update: async (id, data) =>
    fromBackend(
      await request(`/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(toBackend(data)),
      }),
    ),
  remove: (id) => request(`/resources/${id}`, {method: 'DELETE'}),
};

// ---------- Date de test (mock) ----------
// Locațiile de test sunt perechile distincte clădire + sală din mockData.
const mockLocations = [
  ...new Map(mockResources.map((r) => [`${r.building}|${r.room}`, r])).values(),
].map((r, i) => ({
  location_id: `loc-${i + 1}`,
  building: r.building,
  room: r.room,
  floor: null,
}));
const locationIdOf = (r) =>
  mockLocations.find((l) => l.building === r.building && l.room === r.room)
    ?.location_id;
// Clădirea și sala afișate vin din locația aleasă, ca la backend-ul real.
const withLocation = (r) => {
  const l = mockLocations.find((x) => x.location_id === r.location_id);
  return l ? {...r, building: l.building, room: l.room, floor: l.floor} : r;
};

let data = mockResources.map((r) => ({...r, location_id: locationIdOf(r)}));
let nextId = data.length + 1;
const wait = (v) => new Promise((resolve) => setTimeout(() => resolve(v), 250));

const mockApi = {
  getAll: () => wait(data.map((r) => ({...r}))),
  getLocations: () => wait(mockLocations.map((l) => ({...l}))),
  create: (input) => {
    const item = withLocation({...input, id: nextId++});
    data.push(item);
    return wait(item);
  },
  update: (id, input) => {
    data = data.map((r) =>
      r.id === id ? withLocation({...r, ...input, id}) : r,
    );
    return wait(data.find((r) => r.id === id));
  },
  remove: (id) => {
    data = data.filter((r) => r.id !== id);
    return wait(null);
  },
};

export const api = USE_MOCK ? mockApi : realApi;
export const isMock = USE_MOCK;
