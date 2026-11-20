import {useState} from 'react';
import {getCurrentUser} from './auth.js';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Arată pagina de Login până când utilizatorul se autentifică,
// apoi aplicația propriu-zisă.
export default function AuthGate() {
  const [user, setUser] = useState(getCurrentUser);
  return user ? <App /> : <LoginPage onLogin={setUser} />;
}
