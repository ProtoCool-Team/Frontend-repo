import {useEffect, useState} from 'react';
import {getCurrentUser, refreshUser} from './auth.js';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Arată pagina de Login până când utilizatorul se autentifică,
// apoi aplicația propriu-zisă.
export default function AuthGate() {
  const [user, setUser] = useState(getCurrentUser);
  const loggedIn = Boolean(user);

  // KAN-20: la pornire recitim contul de la backend, ca rolul (și deci
  // meniul Administrare) să fie cel actual. La token expirat, request()
  // ne trimite înapoi la Login.
  useEffect(() => {
    if (!loggedIn) return;
    refreshUser()
      .then((fresh) => fresh && setUser(fresh))
      .catch(() => {
        // backend oprit: păstrăm datele salvate; paginile arată eroarea
      });
  }, [loggedIn]);

  return user ? <App user={user} /> : <LoginPage onLogin={setUser} />;
}
