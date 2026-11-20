import {Icon} from '../components/Icons.jsx';
import LoginAvailability from '../components/LoginAvailability.jsx';
import LoginForm from '../components/LoginForm.jsx';
import '../login.css';

const BENEFITS = [
  'Disponibilitate actualizată în timp real',
  'Aprobare de către responsabilul de laborator',
  'Istoric și notificări pentru rezervările tale',
];

const STATS = [
  ['120+', 'resurse de cercetare'],
  ['45', 'echipe active'],
  ['0', 'suprapuneri între echipe'],
];

// Pagina de Login, după ecranul „rrm_login” din Figma.
export default function LoginPage({onLogin}) {
  return (
    <div className="login-page">
      <header className="login-top">
        <div className="login-top-inner">
          <span className="brand">
            <Icon name="logo" size={34} />
            <span className="brand-text">
              <strong>RRM</strong>
              <small>Research Resource Manager</small>
            </span>
          </span>
          <nav className="login-top-links">
            <a href="mailto:helpdesk@universitate.ro">Ajutor</a>
            <span>RO</span>
          </nav>
        </div>
      </header>

      <main className="login-main">
        <section className="login-hero">
          <span className="login-tag">
            <span className="live-dot" />
            Platformă pentru cercetare universitară
          </span>
          <h1>Research Resource Manager</h1>
          <p className="login-lead">
            Rezervă roboți, aparate de măsură, clustere de calcul și săli de
            laborator din universitate.
          </p>
          <ul className="login-benefits">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="tick">
                  <Icon name="check" size={13} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <LoginAvailability />
          <dl className="login-stats">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <LoginForm onLogin={onLogin} />
      </main>

      <footer className="site-foot">
        © 2026 Universitatea · Suport: helpdesk@universitate.ro
      </footer>
    </div>
  );
}
