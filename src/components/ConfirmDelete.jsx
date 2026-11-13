import {useState} from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDelete({resource, onConfirm, onClose}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Ștergi resursa?" onClose={onClose} size="sm">
      <p className="modal-text">
        <strong>{resource.name}</strong> va dispărea din catalog. Acțiunea nu
        poate fi anulată.
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>
          Renunță
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
          {busy ? 'Se șterge…' : 'Șterge resursa'}
        </button>
      </div>
    </Modal>
  );
}
