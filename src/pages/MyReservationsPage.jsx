import {useCallback, useEffect, useMemo, useState} from 'react';
import {reservationsApi} from '../api/reservations.js';
import {Icon} from '../components/Icons.jsx';
import ConfirmCancel from '../components/ConfirmCancel.jsx';
import ConfirmExtend from '../components/ConfirmExtend.jsx';
import ReservationDetails from '../components/ReservationDetails.jsx';
import {downloadCsv} from '../exportCsv.js';
import ReservationFilters from '../components/ReservationFilters.jsx';
import ReservationHistory from '../components/ReservationHistory.jsx';
import ReservationSidebar from '../components/ReservationSidebar.jsx';
import ReservationSummary from '../components/ReservationSummary.jsx';
import ReservationToolbar from '../components/ReservationToolbar.jsx';
import UpcomingReservationCard from '../components/UpcomingReservationCard.jsx';
import {
  EMPTY_FILTERS,
  applyFilters,
  countBy,
  isHistory,
  summarize,
  withShownStatus,
} from '../reservationFilters.js';
import {formatTime, reservationsLabel} from '../reservationStatus.js';
import '../reservations.css';
import '../reservation-card.css';

// Pagina „Rezervările mele” (KAN-32), după prototipul din Figma.
export default function MyReservationsPage({onNavigate, onRebook, notify}) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [tab, setTab] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [cancelling, setCancelling] = useState(null);
  const [details, setDetails] = useState(null);
  const [extending, setExtending] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRaw(await reservationsApi.getMine());
      setUpdatedAt(new Date());
      setNow(new Date());
    } catch (e) {
      setError(`Nu am putut încărca rezervările (${e.message}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Ora curentă se reîmprospătează la un minut (progresul rezervării active).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const items = useMemo(() => withShownStatus(raw, now), [raw, now]);
  const counts = useMemo(() => countBy(items), [items]);
  const visible = applyFilters(items, {tab, filters, search, sort});
  const upcoming = visible.filter((r) => !isHistory(r));
  // În istoric, cele mai recente primele (când se sortează după dată).
  const history = visible.filter(isHistory);
  if (sort === 'date') history.reverse();

  async function handleExtend(newEnd) {
    const r = extending;
    try {
      await reservationsApi.extend(r, newEnd);
      notify(`Rezervarea pentru „${r.resourceName}” a fost prelungită.`);
      load();
    } catch (e) {
      notify(`Nu am putut prelungi rezervarea: ${e.message}`, 'error');
    }
    setExtending(null);
  }

  async function handleCancel() {
    const r = cancelling;
    try {
      await reservationsApi.cancel(r.id);
      notify(`Rezervarea pentru „${r.resourceName}” a fost anulată.`);
      load();
    } catch (e) {
      notify(`Nu am putut anula rezervarea: ${e.message}`, 'error');
    }
    setCancelling(null);
  }

  return (
    <main className="page">
      <p className="crumbs">
        Acasă / <strong>Rezervările mele</strong>
      </p>
      <div className="page-head">
        <div>
          <h1>Rezervările mele</h1>
          <p className="subtitle">
            {reservationsLabel(items.length)} · istoric și status curent
          </p>
        </div>
        <div className="rs-head-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('reserve')}
          >
            <Icon name="plus" size={16} />
            Rezervare nouă
          </button>
          <div className="rs-view-toggle" role="group" aria-label="Vizualizare">
            <button className="active" aria-pressed="true">
              Listă
            </button>
            {/* TODO (coleg, KAN-34): vederea Calendar a rezervărilor mele. */}
            <button onClick={() => onNavigate('calendar')}>Calendar</button>
          </div>
        </div>
      </div>

      {error && (
        <p className="banner banner-error" role="alert">
          {error}{' '}
          <button className="link" onClick={load}>
            Încearcă din nou
          </button>
        </p>
      )}

      <ReservationSummary summary={summarize(items, now)} />

      <div className="rs-layout">
        <ReservationFilters
          filters={filters}
          counts={counts}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="rs-main">
          <ReservationToolbar
            search={search}
            onSearch={setSearch}
            sort={sort}
            onSort={setSort}
            tab={tab}
            onTab={setTab}
            tabCounts={counts.tab}
            updatedLabel={
              updatedAt ? `Actualizat la ${formatTime(updatedAt)}` : ''
            }
          />

          {loading ? (
            <p className="panel empty">Se încarcă rezervările…</p>
          ) : (
            <>
              <section className="rs-section">
                <div className="rs-section-head">
                  <h2>Active și viitoare</h2>
                  <span className="muted">
                    {reservationsLabel(upcoming.length)}
                  </span>
                </div>
                {upcoming.length === 0 ? (
                  <p className="panel empty">Nicio rezervare activă.</p>
                ) : (
                  upcoming.map((r) => (
                    <UpcomingReservationCard
                      key={r.id}
                      reservation={r}
                      now={now}
                      onCancel={setCancelling}
                      onDetails={setDetails}
                      onExtend={setExtending}
                    />
                  ))
                )}
              </section>
              <ReservationHistory
                items={history}
                onDetails={setDetails}
                onRebook={onRebook}
                onExport={(list) => downloadCsv(list)}
              />
            </>
          )}
        </div>

        <ReservationSidebar />
      </div>

      {details && (
        <ReservationDetails
          reservation={details}
          onClose={() => setDetails(null)}
        />
      )}
      {extending && (
        <ConfirmExtend
          reservation={extending}
          onConfirm={handleExtend}
          onClose={() => setExtending(null)}
        />
      )}
      {cancelling && (
        <ConfirmCancel
          reservation={cancelling}
          onConfirm={handleCancel}
          onClose={() => setCancelling(null)}
        />
      )}
    </main>
  );
}
