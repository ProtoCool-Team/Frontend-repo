import {useState} from 'react';
import {login} from '../auth.js';
import {Icon} from './Icons.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cardul „Autentificare” din dreapta paginii de Login.
export default function LoginForm({onLogin}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  function validate() {
    const e = {};
    const id = identifier.trim();
    if (!id) e.identifier = 'Completează emailul sau numele de utilizator.';
    else if (id.includes('@') && !EMAIL.test(id)) {
      e.identifier = 'Adresa de email nu este validă.';
    }
    if (!password) e.password = 'Completează parola.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    // Simulăm un răspuns de la server, până există login în backend.
    setTimeout(() => onLogin(login(identifier, remember)), 400);
  }

  const soon = (what) => setInfo(`${what} va fi disponibil în curând.`);

  return (
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-card-head">
        <span className="login-lock">
          <Icon name="lock" size={22} />
        </span>
        <div>
          <h2 id="login-title">Autentificare</h2>
          <p>Accesează sistemul cu contul tău universitar</p>
        </div>
      </div>

      <button
        type="button"
        className="sso-btn"
        onClick={() => soon('Autentificarea prin SSO')}
      >
        <Icon name="institution" size={20} />
        Continuă cu contul universității (SSO)
      </button>

      <div className="login-or">
        <span>sau</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="login-field">
          <span>Email universitar sau nume utilizator</span>
          <span className="login-input">
            <Icon name="mail" size={18} />
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="nume.prenume@universitate.ro"
              autoComplete="username"
              aria-invalid={Boolean(errors.identifier)}
            />
          </span>
          {errors.identifier && (
            <small className="field-error">{errors.identifier}</small>
          )}
        </label>

        <label className="login-field">
          <span>Parolă</span>
          <span className="login-input">
            <Icon name="lock" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="link"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ascunde' : 'Arată'}
            </button>
          </span>
          {errors.password && (
            <small className="field-error">{errors.password}</small>
          )}
        </label>

        <div className="login-row">
          <label className="check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Ține-mă minte</span>
          </label>
          <button
            type="button"
            className="link"
            onClick={() => soon('Resetarea parolei')}
          >
            Ai uitat parola?
          </button>
        </div>

        <button type="submit" className="login-submit" disabled={busy}>
          {busy ? 'Se verifică…' : 'Autentificare'}
          {!busy && <Icon name="arrowRight" size={18} />}
        </button>
      </form>

      {info && (
        <p className="login-info" role="status">
          {info}
        </p>
      )}

      <p className="login-signup">
        Nu ai cont încă?{' '}
        <button
          type="button"
          className="link"
          onClick={() => soon('Crearea contului')}
        >
          Creează cont
        </button>
      </p>

      <div className="login-badges">
        <span>
          <Icon name="lock" size={12} />
          Conexiune securizată
        </span>
        <span>SSO universitar</span>
        <span>GDPR</span>
      </div>
      <p className="login-terms">
        Prin autentificare accepți regulamentul de utilizare a resurselor
      </p>
    </section>
  );
}
