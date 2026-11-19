import {SLOT, SLOTS} from '../constants.js';
import {currentSlot, resourceState} from '../availability.js';

// Bara 08–20 de pe fiecare card: verde = liber, roșu = ocupat,
// gri = indisponibil, alb = interval trecut.
// Valorile de mai jos sunt sufixe de clase CSS (slot-free, slot-past …).
export default function AvailabilityBar({resource}) {
  const now = currentSlot();
  const unavailable = resourceState(resource) === 'UNAVAILABLE';
  const slots = Array.from({length: SLOTS}, (_, i) => {
    if (unavailable) return 'unavailable';
    if (i < now) return 'past';
    return resource.availability?.[i] === SLOT.BUSY ? SLOT.BUSY : SLOT.FREE;
  });

  return (
    <div className="avail">
      <div className="avail-bar" aria-hidden="true">
        {slots.map((s, i) => (
          <span key={i} className={`slot slot-${s}`} />
        ))}
      </div>
      <div className="avail-scale" aria-hidden="true">
        <span>08</span>
        <span>14</span>
        <span>20</span>
      </div>
    </div>
  );
}
