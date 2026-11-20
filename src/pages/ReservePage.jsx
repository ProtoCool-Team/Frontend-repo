import {useEffect, useMemo, useState} from 'react';
import {reservationsApi} from '../api/reservations.js';
import ReserveHeader from '../components/ReserveHeader.jsx';
import ReservePanel from '../components/ReservePanel.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import {
  addDays,
  atHour,
  rulesFor,
  selectionError,
  startOfDay,
  workingDays,
} from '../reserveRules.js';
import '../reserve.css';

// Ecranul „Rezervare”, după prototipul Figma („Rezervare – Desktop”).
export default function ReservePage({
  resources,
  resourceId,
  onResource,
  onNavigate,
  notify,
}) {
  const resource =
    resources.find((r) => String(r.id) === String(resourceId)) || null;
  const rules = rulesFor(resource);
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const days = useMemo(() => workingDays(weekStart, 5), [weekStart]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ocuparea resursei pentru zilele afișate.
  useEffect(() => {
    if (!resource) return undefined;
    let current = true;
    setLoading(true);
    reservationsApi
      .getForResource(resource, days[0], addDays(days[days.length - 1], 1))
      .then((list) => current && setBlocks(list))
      .catch((e) => current && notify(e.message, 'error'))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
    // notify lipsește intenționat: e o funcție nouă la fiecare randare.
  }, [resource, days]);

  const error = selectionError(sel, blocks, rules);

  function changeSel(next) {
    setSel(next);
    if (next && !days.some((d) => +d === +startOfDay(next.start))) {
      setWeekStart(startOfDay(next.start));
    }
  }

  async function confirm() {
    setSubmitting(true);
    try {
      const r = await reservationsApi.create({
        resource,
        start: sel.start,
        end: sel.end,
        purpose: purpose.trim(),
      });
      notify(
        r.status === 'PENDING'
          ? 'Cererea a fost trimisă și așteaptă aprobarea.'
          : 'Rezervarea a fost confirmată.',
      );
      onNavigate('reservations');
    } catch (e) {
      notify(`Nu am putut face rezervarea: ${e.message}`, 'error');
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <p className="crumbs">
        Catalog / <strong>{resource ? resource.name : 'Rezervare nouă'}</strong>
      </p>

      <label className="field reserve-pick">
        <span>Resursa</span>
        <select
          value={resourceId ?? ''}
          onChange={(e) => {
            setSel(null);
            onResource(e.target.value || null);
          }}
        >
          <option value="">Alege resursa pe care vrei să o rezervi…</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      {resource && (
        <>
          <ReserveHeader resource={resource} rules={rules} />
          <div className="reserve-layout">
            <WeekCalendar
              days={days}
              blocks={blocks}
              sel={sel}
              resource={resource}
              rules={rules}
              loading={loading}
              canGoBack={days[0] > new Date()}
              onToday={() => setWeekStart(startOfDay(new Date()))}
              onPrev={() => setWeekStart(prevWeek(weekStart))}
              onNext={() => setWeekStart(addDays(days[4], 1))}
              onPick={(d, h) =>
                setSel({start: atHour(d, h), end: atHour(d, h + 1)})
              }
            />
            <ReservePanel
              resource={resource}
              rules={rules}
              sel={sel}
              onChange={changeSel}
              purpose={purpose}
              onPurpose={setPurpose}
              error={error}
              submitting={submitting}
              onConfirm={confirm}
              onCancel={() => onNavigate('catalog')}
            />
          </div>
        </>
      )}
    </main>
  );
}

// Cu 5 zile lucrătoare înapoi, dar nu înainte de azi.
function prevWeek(start) {
  let d = start;
  for (let n = 0; n < 5; ) {
    d = addDays(d, -1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n++;
  }
  const today = startOfDay(new Date());
  return d < today ? today : d;
}
