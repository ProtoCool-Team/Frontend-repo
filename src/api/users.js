// KAN-20: conturile și rolurile (doar pentru administratori).
// Dacă VITE_USE_MOCK=true, se folosesc câțiva utilizatori de test.
import {request} from './resources.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function fromBackend(u) {
  return {
    id: u.user_id,
    name: u.full_name,
    email: u.email,
    role: u.role,
    department: u.department || u.laboratory || '',
  };
}

const realApi = {
  getAll: async () => (await request('/users')).map(fromBackend),
  setRole: async (id, role) =>
    fromBackend(
      await request(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({role}),
      }),
    ),
};

// ---------- Date de test (mock) ----------
let mockUsers = [
  ['Mihai Ionescu', 'mihai.ionescu@usv.ro', 'ADMINISTRATOR', 'Automatică'],
  ['Ana Popescu', 'ana.popescu@student.usv.ro', 'RESEARCHER', 'Calculatoare'],
  ['Dan Georgescu', 'dan.georgescu@student.usv.ro', 'RESEARCHER', ''],
].map(([name, email, role, department], i) => ({
  id: `u-${i + 1}`,
  name,
  email,
  role,
  department,
}));

const wait = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), 250));

const mockApi = {
  getAll: () => wait(mockUsers.map((u) => ({...u}))),
  setRole: (id, role) => {
    mockUsers = mockUsers.map((u) => (u.id === id ? {...u, role} : u));
    return wait({...mockUsers.find((u) => u.id === id)});
  },
};

export const usersApi = USE_MOCK ? mockApi : realApi;
