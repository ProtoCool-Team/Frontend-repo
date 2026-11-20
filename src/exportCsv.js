// „Exportă CSV” din Istoric: descarcă rezervările într-un fișier .csv
// care se deschide direct în Excel (separator „;”, diacritice păstrate).
import {categoryLabel} from './constants.js';
import {
  RESERVATION_STATUS,
  formatDate,
  formatInterval,
} from './reservationStatus.js';

const HEADER = [
  'Resursă',
  'Categorie',
  'Locație',
  'Data',
  'Interval',
  'Status',
  'Scop',
  'Observații',
];

// Valoarea între ghilimele, cu ghilimelele din interior dublate.
const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;

export function toCsv(items) {
  const rows = items.map((r) => [
    r.resourceName,
    categoryLabel(r.category),
    [r.room, r.building].filter(Boolean).join(' · '),
    formatDate(r.start),
    formatInterval(r.start, r.end),
    RESERVATION_STATUS[r.shownStatus] || r.status,
    r.purpose,
    r.decisionReason,
  ]);
  return [HEADER, ...rows].map((row) => row.map(cell).join(';')).join('\r\n');
}

export function downloadCsv(items, fileName = 'istoric-rezervari.csv') {
  // \uFEFF la început: Excel recunoaște astfel diacriticele (UTF-8).
  const blob = new Blob(['\uFEFF' + toCsv(items)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
