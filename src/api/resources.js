// Toate apelurile către backend sunt aici.
// Dacă VITE_USE_MOCK=true, se folosesc date de test (fără backend).
import {mockResources} from './mockData.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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

let data = mockResources.map((r) => ({...r}));
let nextId = data.length + 1;
const wait = (v) => new Promise((resolve) => setTimeout(() => resolve(v), 250));

const mockApi = {
  getAll: () => wait(data.map((r) => ({...r}))),
  create: (input) => {
    const item = {...input, id: nextId++};
    data.push(item);
    return wait(item);
  },
  update: (id, input) => {
    data = data.map((r) => (r.id === id ? {...r, ...input, id} : r));
    return wait({...input, id});
  },
  remove: (id) => {
    data = data.filter((r) => r.id !== id);
    return wait(null);
  },
};

export const api = USE_MOCK ? mockApi : realApi;
export const isMock = USE_MOCK;
