// Apelurile pentru pagina „Rezervările mele” (KAN-32).
// Dacă VITE_USE_MOCK=true, se folosesc câteva rezervări de test.
import {CATEGORY_FROM_API, request} from './resources.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// TEMPORAR, până avem login: utilizatorul curent. Dacă VITE_USER_ID lipsește,
// backend-ul folosește DEMO_USER_ID din .env-ul lui.
const USER_ID = import.meta.env.VITE_USER_ID;
const HEADERS = {
  'Content-Type': 'application/json',
  ...(USER_ID ? {'X-User-Id': USER_ID} : {}),
};

// Rezervarea de la backend (snake_case) în forma folosită de componente.
function fromBackend(r) {
  return {
    id: r.reservation_id,
    resourceId: r.resource_id,
    resourceName: r.resource_name,
    category: CATEGORY_FROM_API[r.resource_type] || r.resource_type,
    building: r.building ?? '',
    room: r.room ?? '',
    start: new Date(r.start_time),
    end: new Date(r.end_time),
    purpose: r.purpose,
    status: r.status,
    decisionReason: r.decision_reason ?? null,
    canCancel: Boolean(r.can_cancel),
    requiresApproval: Boolean(r.requires_approval),
    responsibleName: r.responsible_name || null,
  };
}

const realApi = {
  // period: 'upcoming' | 'past' | null (toate)
  getMine: async (period = null) => {
    const query = period ? `?period=${period}` : '';
    const rows = await request(`/me/reservations${query}`, {headers: HEADERS});
    return rows.map(fromBackend);
  },
  cancel: async (id) =>
    fromBackend(
      await request(`/me/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: HEADERS,
      }),
    ),
};

// ---------- Date de test (mock) ----------
const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000);
let mockData = [
  {
    id: 'rv-1',
    resourceName: 'Robot KUKA KR 6',
    category: 'ROBOT',
    building: 'Corp C',
    room: 'C102',
    start: hoursFromNow(26),
    end: hoursFromNow(28),
    purpose: 'Teste de calibrare pentru proiectul de manipulare',
    status: 'PENDING',
    decisionReason: null,
    canCancel: true,
    requiresApproval: true,
    responsibleName: 'Conf. dr. Ion Ionescu',
  },
  {
    id: 'rv-2',
    resourceName: 'Cluster GPU USV',
    category: 'COMPUTE',
    building: 'Corp D',
    room: 'D001',
    start: hoursFromNow(-4),
    end: hoursFromNow(2),
    purpose: 'Antrenare model de recunoaștere a obiectelor',
    status: 'APPROVED',
    decisionReason: null,
    canCancel: false,
  },
  {
    id: 'rv-3',
    resourceName: 'Osciloscop Keysight',
    category: 'MEASUREMENT',
    building: 'Corp C',
    room: 'C105',
    start: hoursFromNow(-200),
    end: hoursFromNow(-198),
    purpose: 'Măsurători pe circuit de test',
    status: 'REJECTED',
    decisionReason: 'Resursa este rezervată pentru mentenanță',
    canCancel: false,
  },
  {
    id: 'rv-4',
    resourceName: 'Laborator Robotică',
    category: 'ROOM',
    building: 'Corp C',
    room: 'C105',
    start: hoursFromNow(-100),
    end: hoursFromNow(-98),
    purpose: 'Ședință de echipă',
    status: 'COMPLETED',
    decisionReason: null,
    canCancel: false,
  },
];
const wait = (v) => new Promise((resolve) => setTimeout(() => resolve(v), 250));
const now = () => new Date();

const mockApi = {
  getMine: (period = null) =>
    wait(
      mockData.filter((r) => {
        if (period === 'upcoming') return r.end > now();
        if (period === 'past') return r.end <= now();
        return true;
      }),
    ),
  cancel: (id) => {
    mockData = mockData.map((r) =>
      r.id === id ? {...r, status: 'CANCELLED', canCancel: false} : r,
    );
    return wait(mockData.find((r) => r.id === id));
  },
};

export const reservationsApi = USE_MOCK ? mockApi : realApi;
