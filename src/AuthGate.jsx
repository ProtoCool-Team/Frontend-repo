import {useCallback, useEffect, useState} from 'react';
import {getCurrentUser, refreshUser} from './auth.js';
import {clearSession} from './session.js';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Arată pagina de Login până când utilizatorul se autentifică,
// apoi aplicația propriu-zisă.
export default function AuthGate() {
  const [user, setUser] = useState(getCurrentUser);
  const loggedIn = Boolean(user);

  // KAN-20: recitim contul de la backend, ca rolul (și deci meniul
  // Administrare) să fie cel actual.
  const refresh = useCallback(() => {
    refreshUser()
      .then((fresh) => setUser(fresh))
      .catch((err) => {
        // Token expirat sau cont șters: înapoi la Login. (request() nu face
        // asta singur pentru adresele /auth/...)
        if (err.status === 401) {
          clearSession();
          setUser(null);
        }
        // Altfel (ex. backend oprit) păstrăm datele salvate.
      });
  }, []);

  // La pornire și de fiecare dată când utilizatorul revine în fereastră
  // (ex. un administrator i-a schimbat rolul între timp).
  useEffect(() => {
    if (!loggedIn) return undefined;
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [loggedIn, refresh]);

  // Sincronizare între tab-uri când sesiunea se schimbă sau se șterge.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'rrm-user' && e.key !== null) return;
      // Un tab logat fără „Ține-mă minte” are sesiunea lui (sessionStorage)
      // și nu urmează login-urile din alte tab-uri.
      if (
        e.storageArea === localStorage &&
        sessionStorage.getItem('rrm-user')
      ) {
        return;
      }
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return user ? (
    <App key={user.id || user.email} user={user} onRoleDenied={refresh} />
  ) : (
    <LoginPage onLogin={setUser} />
  );
}
