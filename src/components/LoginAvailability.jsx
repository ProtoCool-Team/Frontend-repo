import {Icon} from './Icons.jsx';

// Cardul „Disponibilitate azi” de pe pagina de Login.
// Este ilustrativ (ca în prototipul Figma): arată cum funcționează
// aplicația, nu date reale.
const START = 8;
const END = 18;
const TICKS = [8, 10, 12, 14, 16, 18];

const ROWS = [
  {
    name: 'Robot UR10e',
    place: 'Lab Robotică',
    icon: 'ROBOT',
    tone: 'blue',
    bars: [
      [9, 13, 'blue'],
      [15, 17, 'purple'],
    ],
  },
  {
    name: 'Cluster GPU „Atlas”',
    place: 'Centrul HPC',
    icon: 'COMPUTE',
    tone: 'purple',
    bars: [
      [8, 12, 'purple'],
      [14, 18, 'purple'],
    ],
  },
  {
    name: 'Microscop SEM',
    place: 'Lab Nanomateriale',
    icon: 'MEASUREMENT',
    tone: 'orange',
    bars: [[10, 12, 'orange']],
  },
  {
    name: 'Sala de conferințe B12',
    place: 'Corp B · 24 locuri',
    icon: 'ROOM',
    tone: 'teal',
    bars: [
      [11, 13, 'teal'],
      [15, 16, 'teal'],
    ],
  },
];

const pct = (h) => `${((h - START) / (END - START)) * 100}%`;

export default function LoginAvailability() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const showNow = hour >= START && hour <= END;
  const nowLabel = now.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const today = now.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="login-avail" aria-label="Exemplu de disponibilitate">
      <div className="login-avail-head">
        <div>
          <h2>Disponibilitate azi</h2>
          <p>{today[0].toUpperCase() + today.slice(1)}</p>
        </div>
        <span className="live">
          <span className="live-dot" />
          LIVE
        </span>
      </div>

      <div className="login-avail-grid">
        <div />
        <div className="ticks" aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} style={{left: pct(t)}}>
              {String(t).padStart(2, '0')}
            </span>
          ))}
        </div>

        {ROWS.map((r) => (
          <div className="login-avail-row" key={r.name}>
            <div className="login-res">
              <span className={`login-res-icon tone-${r.tone}`}>
                <Icon name={r.icon} size={16} />
              </span>
              <span>
                <strong>{r.name}</strong>
                <small>{r.place}</small>
              </span>
            </div>
            <div className="track" aria-hidden="true">
              {r.bars.map(([from, to, color]) => (
                <span
                  key={from}
                  className={`bar tone-${color}`}
                  style={{left: pct(from), width: pct(START + to - from)}}
                />
              ))}
            </div>
          </div>
        ))}

        {showNow && (
          <div className="now-layer" aria-hidden="true">
            <div className="now-line" style={{left: pct(hour)}}>
              <span>{nowLabel}</span>
            </div>
          </div>
        )}
      </div>

      <p className="login-warning">
        <Icon name="alert" size={16} />
        Suprapunere evitată: Cluster „Atlas” este deja rezervat 14:00 – 18:00
      </p>
    </section>
  );
}
