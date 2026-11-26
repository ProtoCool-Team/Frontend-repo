import {useState} from 'react';
import {register} from '../auth.js';
import {Icon} from './Icons.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const EMPTY = {
  fullName: '',
  email: '',
  department: '',
  password: '',
  confirm: '',
};

// Aceleași reguli ca în backend (POST /auth/register), ca utilizatorul să
// vadă greșelile înainte de trimitere.
function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 3) e.fullName = 'Completează numele complet.';
  if (!EMAIL.test(f.email.trim())) e.email = 'Adresa de email nu este validă.';
  if (
    f.password.length < MIN_PASSWORD ||
    !/[A-Za-z]/.test(f.password) ||
    !/[0-9]/.test(f.password)
  ) {
    e.password = `Minimum ${MIN_PASSWORD} caractere, cu litere și cifre.`;
  }
  if (f.confirm !== f.password) e.confirm = 'Parolele nu coincid.';
  return e;
}

// Erorile de câmp de la backend au nume în snake_case.
const FIELD_FROM_API = {
  full_name: 'fullName',
  email: 'email',
  password: 'password',
};

function Field({label, error, icon, children}) {
  return (
    <label className="login-field">
      <span>{label}</span>
      <span className="login-input">
        <Icon name={icon} size={18} />
        {children}
      </span>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

// Cardul „Creează cont” (KAN-28), în locul cardului de autentificare.
export default function RegisterForm({onLogin, onBack}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const bind = (name) => ({
    value: form[name],
    onChange: (e) => setForm({...form, [name]: e.target.value}),
    'aria-invalid': Boolean(errors[name]),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      onLogin(
        await register({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          department: form.department.trim(),
        }),
      );
    } catch (err) {
      const fields = Object.fromEntries(
        Object.entries(err.fieldErrors || {}).map(([k, v]) => [
          FIELD_FROM_API[k] || k,
          v,
        ]),
      );
      setErrors({...fields, form: err.message});
      setBusy(false);
    }
  }

  return (
    <section className="login-card" aria-labelledby="register-title">
      <div className="login-card-head">
        <span className="login-lock">
          <Icon name="institution" size={22} />
        </span>
        <div>
          <h2 id="register-title">Creează cont</h2>
          <p>Cont nou de cercetător, cu emailul universitar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="register-form">
        <Field label="Nume complet" icon="institution" error={errors.fullName}>
          <input {...bind('fullName')} autoComplete="name" />
        </Field>
        <Field label="Email universitar" icon="mail" error={errors.email}>
          <input
            {...bind('email')}
            type="email"
            autoComplete="email"
            placeholder="nume.prenume@universitate.ro"
          />
        </Field>
        <Field label="Departament (opțional)" icon="pin">
          <input {...bind('department')} placeholder="ex. Calculatoare" />
        </Field>
        <Field label="Parolă" icon="lock" error={errors.password}>
          <input
            {...bind('password')}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmă parola" icon="lock" error={errors.confirm}>
          <input
            {...bind('confirm')}
            type="password"
            autoComplete="new-password"
          />
        </Field>

        {errors.form && (
          <p className="login-error" role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className="login-submit" disabled={busy}>
          {busy ? 'Se creează contul…' : 'Creează cont'}
          {!busy && <Icon name="arrowRight" size={18} />}
        </button>
      </form>

      <p className="login-signup">
        Ai deja cont?{' '}
        <button type="button" className="link" onClick={onBack}>
          Autentifică-te
        </button>
      </p>
    </section>
  );
}
