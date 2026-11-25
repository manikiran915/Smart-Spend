import { useState } from 'react';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { formatMoney, makeId } from '../utils/finance.js';
import { ConfirmAction, EmptyState, Modal, PageTitle } from '../components/UI.jsx';

function RecurringDialog({ item, categories, onClose }) {
  const { recurring, update, notify } = useFinance();
  const [form, setForm] = useState(item || { name: '', amount: '', category: categories[0] || 'Other', frequency: 'Monthly', nextDate: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');
  const set = (key, value) => setForm((row) => ({ ...row, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.name.trim() || !Number.isFinite(amount) || amount <= 0 || !form.nextDate) {
      setError('Add a name, valid amount, and next payment date.');
      return;
    }
    const value = { ...form, name: form.name.trim(), amount, id: item?.id || makeId() };
    update('recurring', (rows) => item ? rows.map((row) => row.id === item.id ? value : row) : [...rows, value]);
    notify(item ? 'Recurring payment updated.' : 'Recurring payment added.');
    onClose();
  };
  return <Modal title={item ? 'Edit recurring payment' : 'Add a recurring payment'} onClose={onClose}>
    <form onSubmit={submit}><p className="modal-description">Keep the regular things on your radar.</p><div className="mb-3"><label className="form-label">Payment name</label><input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Rent, internet, membership..." maxLength="70" required /></div>
      <div className="row g-3"><div className="col-6"><label className="form-label">Amount</label><input className="form-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} required /></div><div className="col-6"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div></div>
      <div className="row g-3 mt-0"><div className="col-6"><label className="form-label">Frequency</label><select className="form-select" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></div><div className="col-6"><label className="form-label">Next payment</label><input className="form-control" type="date" value={form.nextDate} onChange={(e) => set('nextDate', e.target.value)} required /></div></div>
      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">{item ? 'Save changes' : 'Add payment'}</button></div>
    </form>
  </Modal>;
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

export default function Recurring() {
  const { recurring, categories, currency, update, notify } = useFinance();
  const [dialog, setDialog] = useState(null);
  const sorted = [...recurring].sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const upcoming = sorted.filter((item) => daysUntil(item.nextDate) >= 0 && daysUntil(item.nextDate) <= 7);
  const remove = (id) => { update('recurring', (rows) => rows.filter((item) => item.id !== id)); notify('Recurring payment removed.'); };
  return <div>
    <PageTitle eyebrow="THE REGULAR THINGS" title="Recurring payments" description="Keep upcoming bills and subscriptions from sneaking up on you." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={17} /> Add payment</button>} />
    {upcoming.length > 0 && <div className="recurring-reminder"><div className="reminder-icon"><CalendarClock size={19} /></div><div><strong>{upcoming.length === 1 ? 'One payment is coming up' : `${upcoming.length} payments are coming up`}</strong><p>{upcoming.map((item) => item.name).join(' · ')}{upcoming.some((item) => daysUntil(item.nextDate) === 0) ? ' — including today.' : ' — within the next week.'}</p></div></div>}
    {sorted.length ? <section className="panel-card recurring-table-card"><div className="panel-heading"><div><h2>Your schedule</h2><p>{sorted.length} recurring {sorted.length === 1 ? 'payment' : 'payments'}</p></div></div><div className="recurring-list">{sorted.map((item) => {
      const days = daysUntil(item.nextDate);
      return <div className="recurring-row" key={item.id} onClick={() => setDialog(item)}><div className="recurring-mark">{item.category.slice(0, 1)}</div><div className="recurring-name"><strong>{item.name}</strong><span>{item.category} <i /> {item.frequency}</span></div><div className="recurring-next"><span>NEXT PAYMENT</span><strong>{new Date(`${item.nextDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><small className={days >= 0 && days <= 7 ? 'due-soon' : ''}>{days < 0 ? 'Past due' : days === 0 ? 'Due today' : `In ${days} day${days === 1 ? '' : 's'}`}</small></div><strong className="recurring-amount">{formatMoney(item.amount, currency)}</strong><div className="d-flex gap-1" onClick={(event) => event.stopPropagation()}><button className="icon-button" aria-label="Edit recurring payment" onClick={() => setDialog(item)}><span className="edit-glyph">✎</span></button><ConfirmAction className="icon-button danger-hover" message={`Remove “${item.name}” from recurring payments?`} onConfirm={() => remove(item.id)}><Trash2 size={16} /></ConfirmAction></div></div>;
    })}</div></section> : <section className="panel-card mt-4"><EmptyState title="A little less to remember" description="Add regular payments to keep upcoming due dates in one convenient place." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={16} /> Add a payment</button>} /></section>}
    {dialog && <RecurringDialog item={dialog.id ? dialog : undefined} categories={categories} onClose={() => setDialog(null)} />}
  </div>;
}
