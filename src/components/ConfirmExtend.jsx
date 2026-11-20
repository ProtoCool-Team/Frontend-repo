import {useState} from 'react';
import Modal from './Modal.jsx';
import {formatTime} from '../reservationStatus.js';

// Confirmarea pentru „Prelungește”: rezervarea activă se prelungește
// cu o oră, dacă intervalul următor e liber și nu trece de ora 20:00.
export default function ConfirmExtend({reservation: r, onConfirm, onClose}) {
  const [busy, setBusy] = useState(false);
  const newEnd = new Date(r.end.getTime() + 3600000);
  const tooLate =
    newEnd.getHours() > 20 || newEnd.getDate() !== r.end.getDate();

  return (
    <Modal title="Prelungești rezervarea?" onClose={onClose} size="sm">
      <p className="modal-text">
        {tooLate ? (
          <>
            <strong>{r.resourceName}</strong> nu poate fi prelungită: programul
            laboratorului se încheie la 20:00.
          </>
        ) : (
          <>
            <strong>{r.resourceName}</strong> va fi rezervată până la{' '}
            <strong>{formatTime(newEnd)}</strong> (cu o oră în plus), dacă
            intervalul e liber.
          </>
        )}
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>
          Renunță
        </button>
        {!tooLate && (
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm(newEnd);
              setBusy(false);
            }}
          >
            {busy ? 'Se prelungește…' : 'Prelungește cu o oră'}
          </button>
        )}
      </div>
    </Modal>
  );
}
