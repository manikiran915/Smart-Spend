import { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title d-flex align-items-end justify-content-between gap-3 mb-4">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="mb-0">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`app-modal ${wide ? 'app-modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Notice() {
  const { notice, dismissNotice } = useFinance();
  if (!notice) return null;
  return <div className={`toast-notice ${notice.kind}`} role="status">{notice.message}<button className="icon-button" aria-label="Dismiss" onClick={dismissNotice}><X size={16} /></button></div>;
}

export function ConfirmAction({ message, onConfirm, children, className = '', disabled = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} disabled={disabled}>{children}</button>
      {open && <Modal title="Are you sure?" onClose={() => setOpen(false)}>
        <p className="text-secondary">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); setOpen(false); }}>Delete</button>
        </div>
      </Modal>}
    </>
  );
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><div className="empty-state-mark">✳</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
