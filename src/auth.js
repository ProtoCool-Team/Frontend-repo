// Autentificarea (KAN-28), legată de backend-ul din KAN-19:
// POST /auth/login și POST /auth/register întorc {token, user}.
// Cu VITE_USE_MOCK=true (fără backend), login-ul rămâne simulat.
import {request} from './api/resources.js';
import {clearSession, getSession, saveSession} from './session.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// „Ana Popescu” → „AP”
function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// „ana.popescu@universitate.ro” → „Ana Popescu” (doar în modul mock)
function nameFromEmail(email) {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

// Răspunsul backend-ului → ce păstrăm în browser.
function toSession({token, user}) {
  return {
    token,
    id: user.user_id,
    name: user.full_name,
    initials: initialsOf(user.full_name),
    email: user.email,
    role: user.role,
  };
}

export function getCurrentUser() {
  return getSession();
}

/**
 * Autentificare cu email și parolă.
 * @return {Promise<Object>} Utilizatorul logat.
 * @throws {Error} Cu mesajul de la server (ex. „Email sau parolă greșită.”).
 */
export async function login(email, password, remember) {
  let session;
  if (USE_MOCK) {
    const name = nameFromEmail(email);
    session = {token: null, name, initials: initialsOf(name), email};
  } else {
    session = toSession(
      await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
      }),
    );
  }
  saveSession(session, remember);
  return session;
}

/**
 * Creează un cont nou de cercetător și îl loghează direct.
 * @param {{full_name: string, email: string, password: string,
 *     department: string}} data Datele din formular.
 * @return {Promise<Object>} Utilizatorul logat.
 */
export async function register(data) {
  if (USE_MOCK) return login(data.email, data.password, false);
  const session = toSession(
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  );
  saveSession(session, false);
  return session;
}

export function logout() {
  clearSession();
  window.location.hash = '';
  window.location.reload();
}
