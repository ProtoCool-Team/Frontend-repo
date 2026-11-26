// Sesiunea utilizatorului logat: token-ul de la backend și datele contului.
// Se păstrează în localStorage dacă a bifat „Ține-mă minte”, altfel în
// sessionStorage (se pierde la închiderea browserului).

const KEY = 'rrm-user';

/**
 * Sesiunea curentă sau null dacă nu e nimeni logat.
 * @return {?{token: string, name: string, initials: string, email: string,
 *     role: string, id: string}}
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
