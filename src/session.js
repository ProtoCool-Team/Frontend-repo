// Sesiunea utilizatorului logat: token-ul de la backend și datele contului.
// Se păstrează în localStorage dacă a bifat „Ține-mă minte”, altfel în
// sessionStorage (se pierde la închiderea browserului).

const KEY = 'rrm-user';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function read() {
  try {
    // Sesiunea doar a acestui tab (sessionStorage) are prioritate: un login
    // „Ține-mă minte” din alt tab nu schimbă contul de aici.
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Sesiunea curentă sau null dacă nu e nimeni logat.
 * @return {?{token: string, name: string, initials: string, email: string,
 *     role: string, id: string}}
 */
export function getSession() {
  const session = read();
  // KAN-20: o sesiune fără token (de la vechiul login simulat) nu mai e
  // valabilă cu backend-ul real: o ștergem, ca să apară pagina de Login.
  if (session && !USE_MOCK && !session.token) {
    clearSession();
    return null;
  }
  return session;
}

/**
 * Salvează sesiunea după login sau creare cont.
 * @param {Object} session Datele de salvat (token + utilizator).
 * @param {boolean} remember true = rămâne și după închiderea browserului.
 */
export function saveSession(session, remember) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  try {
    storage.setItem(KEY, JSON.stringify(session));
  } catch {
    // browserul nu permite stocarea: utilizatorul rămâne doar până la refresh
  }
}

/**
 * Actualizează datele sesiunii curente (ex. rolul), în același loc
 * (localStorage sau sessionStorage) unde a fost salvată.
 * @param {Object} changes Câmpurile noi.
 */
export function updateSession(changes) {
  const session = read();
  if (!session) return;
  // Scriem direct peste valoarea veche, fără s-o ștergem întâi: altfel
  // celelalte tab-uri ar primi un eveniment „sesiune ștearsă” (AuthGate).
  try {
    const storage =
      sessionStorage.getItem(KEY) !== null ? sessionStorage : localStorage;
    storage.setItem(KEY, JSON.stringify({...session, ...changes}));
  } catch {
    // browserul nu permite stocarea
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // nimic de șters
  }
}

/** Token-ul pentru antetul Authorization sau null. */
export function getToken() {
  return getSession()?.token || null;
}
