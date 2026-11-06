// Toate apelurile către backend sunt aici.
// Dacă VITE_USE_MOCK=true, se folosesc date de test din memorie (fără backend).

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ---------- Apeluri reale către backend ----------
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
      /* răspuns fără JSON */
    }
    const err = new Error(body.message || `Eroare ${res.status} de la server`);
    err.fieldErrors = body.errors || {};
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const realApi = {
  getAll: () => request('/resources'),
  create: (data) =>
    request('/resources', {method: 'POST', body: JSON.stringify(data)}),
  update: (id, data) =>
    request(`/resources/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
  remove: (id) => request(`/resources/${id}`, {method: 'DELETE'}),
};

// ---------- Date de test (mock) ----------
let mockData = [
  {
    id: 1,
    name: 'Cluster USV',
    type: 'EQUIPMENT',
    location: 'Corp C, sala C008',
    capacity: null,
    status: 'AVAILABLE',
    description: 'Cluster de calcul pentru simulări',
  },
  {
    id: 2,
    name: 'Robot NAO',
    type: 'EQUIPMENT',
    location: 'Laborator robotică C201',
    capacity: null,
    status: 'MAINTENANCE',
    description: 'Robot umanoid pentru interacțiune om–robot',
  },
  {
    id: 3,
    name: 'Sala C204',
    type: 'ROOM',
    location: 'Corp C, etaj 2',
    capacity: 30,
    status: 'AVAILABLE',
    description: 'Laborator cu 30 de calculatoare',
  },
];
let nextId = 4;
const delay = (v) => new Promise((r) => setTimeout(() => r(v), 200));

const mockApi = {
  getAll: () => delay([...mockData]),
  create: (data) => {
    const item = {...data, id: nextId++};
    mockData.push(item);
    return delay(item);
  },
  update: (id, data) => {
    mockData = mockData.map((r) => (r.id === id ? {...data, id} : r));
    return delay({...data, id});
  },
  remove: (id) => {
    mockData = mockData.filter((r) => r.id !== id);
    return delay(null);
  },
};

export const api = USE_MOCK ? mockApi : realApi;
export const isMock = USE_MOCK;
