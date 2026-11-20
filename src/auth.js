// Autentificare simulată pentru MVP (backend-ul nu are încă login).
// Utilizatorul se păstrează în browser: în localStorage dacă a bifat
// „Ține-mă minte”, altfel în sessionStorage (se pierde la închiderea
// browserului).

const KEY = 'rrm-user';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// „ana.popescu@universitate.ro” → „Ana Popescu”
function nameFrom(identifier) {
  const local = identifier.split('@')[0];
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

export function login(identifier, remember) {
  const name = nameFrom(identifier.trim());
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const user = {name, initials, email: identifier.trim()};
  const storage = remember ? localStorage : sessionStorage;
  try {
    storage.setItem(KEY, JSON.stringify(user));
  } catch {
    // browserul nu permite stocarea: utilizatorul rămâne doar până la refresh
  }
  return user;
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // nimic de șters
  }
  window.location.hash = '';
  window.location.reload();
}
