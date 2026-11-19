import {useEffect, useRef} from 'react';
import {Icon} from './Icons.jsx';

export default function Modal({title, onClose, children, size = 'md'}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Doar la deschidere: altfel, fiecare re-randare a paginii (onClose e o
  // funcție nouă de fiecare dată) muta focusul înapoi pe primul câmp.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    // Primul câmp din formular; butonul × e primul în pagină, deci e ales
    // doar dacă fereastra nu are câmpuri (ex. confirmarea ștergerii).
    const box = ref.current;
    (
      box?.querySelector('input, select, textarea') ||
      box?.querySelector('.modal-actions button') ||
      box?.querySelector('button')
    )?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-btn ghost"
            aria-label="Închide"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
