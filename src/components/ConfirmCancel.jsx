import {useState} from 'react';
import Modal from './Modal.jsx';
import {formatDay, formatInterval} from '../reservationStatus.js';

// Confirmarea anulării unei rezervări (KAN-35).
export default function ConfirmCancel({reservation: r, onConfirm, onClose}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Anulezi rezervarea?" onClose={onClose} size="sm">
      <p className="modal-text">
        Rezervarea pentru <strong>{r.resourceName}</strong> din{' '}
        {formatDay(r.start)}, {formatInterval(r.start, r.end)}, va fi anulată,
        iar intervalul devine liber pentru alți cercetători.
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>
          Păstrează rezervarea
        </button>
        <button
          className="btn btn-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
        >
          {busy ? 'Se anulează…' : 'Anulează rezervarea'}
        </button>
      </div>
    </Modal>
  );
}
