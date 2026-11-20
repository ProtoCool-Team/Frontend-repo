// Ocupare de test pentru ecranul „Rezervare” (doar în modul mock).
// Pentru azi folosim bara de disponibilitate a resursei; pentru celelalte
// zile generăm 1–2 rezervări „ale altora”, mereu aceleași pentru aceeași
// resursă și zi, ca ecranul să nu se schimbe la fiecare reîncărcare.
import {SLOT} from '../constants.js';
import {DAY_START, addDays, atHour, startOfDay} from '../reserveRules.js';

function seeded(seed) {
  let s = seed % 2147483647 || 1;
  const next = () => (s = (s * 16807) % 2147483647) / 2147483647;
  next(); // primele valori sunt prea mici, le sărim
  next();
  return next;
}

function todayBlocks(resource, day) {
  const blocks = [];
  (resource.availability || []).forEach((v, i) => {
    if (v !== SLOT.BUSY) return;
    const start = atHour(day, DAY_START + i);
    const last = blocks[blocks.length - 1];
    if (last && +last.end === +start) last.end = atHour(day, DAY_START + i + 1);
    else blocks.push({start, end: atHour(day, DAY_START + i + 1)});
  });
  return blocks;
}

export function mockBusy(resource, from, to) {
  const blocks = [];
  const today = startOfDay(new Date());
  for (let day = startOfDay(from); day < to; day = addDays(day, 1)) {
    if (+day === +today) {
      blocks.push(...todayBlocks(resource, day));
      continue;
    }
    const rand = seeded(
      Number(resource.id) * 7919 + day.getDate() * 104729 + day.getMonth(),
    );
    const count = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const h = DAY_START + Math.floor(rand() * 10);
      const len = 1 + Math.floor(rand() * 2);
      blocks.push({start: atHour(day, h), end: atHour(day, h + len)});
    }
  }
  return blocks.map((b) => ({...b, status: 'APPROVED', mine: false}));
}
