// KAN-20: conturile și rolurile (doar pentru administratori).
// Dacă VITE_USE_MOCK=true, se folosesc câțiva utilizatori de test.
import {getSession} from '../session.js';
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

/**
 * Caută un utilizator din lista mock după email (fără diferență majuscule).
 * @param {string} email Adresa de email.
 * @return {?Object} Utilizatorul găsit sau null.
 */
export function findMockUserByEmail(email) {
  const target = (email || '').trim().toLowerCase();
  const found = mockUsers.find((u) => u.email.toLowerCase() === target);
  return found ? {...found} : null;
}

const mockApi = {
  getAll: () => wait(mockUsers.map((u) => ({...u}))),
  setRole: async (id, role) => {
    const me = getSession();
    if (me && me.id === id) {
      const err = new Error('Nu îți poți schimba propriul rol.');
      err.status = 409;
      throw err;
    }
    const target = mockUsers.find((u) => u.id === id);
    if (target?.role === 'ADMINISTRATOR' && role !== 'ADMINISTRATOR') {
      const admins = mockUsers.filter((u) => u.role === 'ADMINISTRATOR').length;
      if (admins <= 1) {
        const err = new Error(
          'Platforma trebuie să aibă cel puțin un administrator.',
        );
        err.status = 409;
        throw err;
      }
    }
    mockUsers = mockUsers.map((u) => (u.id === id ? {...u, role} : u));
    return wait({...mockUsers.find((u) => u.id === id)});
  },
};

export const usersApi = USE_MOCK ? mockApi : realApi;
