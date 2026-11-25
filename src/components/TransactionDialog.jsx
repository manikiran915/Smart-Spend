import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { currencySymbol, makeId } from '../utils/finance.js';
import { Modal } from './UI.jsx';

const emptyTransaction = { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), notes: '', receipt: '' };

export function TransactionDialog({ onClose, transaction }) {
  const { update, categories, currency, notify } = useFinance();
  const [form, setForm] = useState(transaction ? { ...emptyTransaction, ...transaction } : { ...emptyTransaction, category: categories[0] || 'Other' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const handleReceipt = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for your receipt.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Receipt images must be 2 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setField('receipt', String(reader.result));
    reader.onerror = () => setError('This receipt image could not be read.');
    reader.readAsDataURL(file);
  };

  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !form.date || !form.category || !Number.isFinite(amount) || amount <= 0) {
      setError('Add a description, category, valid date, and amount greater than zero.');
      return;
    }
    setSaving(true);
    const updated = { ...form, amount, description: form.description.trim(), id: transaction?.id || makeId() };
    update('transactions', (rows) => transaction ? rows.map((row) => row.id === transaction.id ? updated : row) : [updated, ...rows]);
    notify(transaction ? 'Transaction updated.' : 'Transaction added.');
    onClose();
  };

  return (
    <Modal title={transaction ? 'Edit transaction' : 'Add a transaction'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="type-toggle mb-3">
          {['expense', 'income'].map((type) => <button key={type} type="button" className={`type-option ${form.type === type ? `selected ${type}` : ''}`} onClick={() => setField('type', type)}>{type === 'expense' ? 'Expense' : 'Income'}</button>)}
        </div>
        <div className="mb-3"><label className="form-label">Amount</label><div className="input-group"><span className="input-group-text">{currencySymbol(currency)}</span><input className="form-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0.00" required /></div></div>
        <div className="row g-3">
          <div className="col-sm-6"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)} required>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="col-sm-6"><label className="form-label">Date</label><input className="form-control" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} required /></div>
        </div>
        <div className="mt-3"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="What was it for?" maxLength="90" required /></div>
        <div className="mt-3"><label className="form-label">Notes <span className="optional-label">Optional</span></label><textarea className="form-control" rows="2" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Add a note..." maxLength="240" /></div>
        <div className="mt-3"><label className="form-label">Receipt <span className="optional-label">Optional · image up to 2 MB</span></label><label className="receipt-picker"><Paperclip size={16} /> {form.receipt ? 'Receipt attached — choose another' : 'Attach an image'}<input type="file" accept="image/*" onChange={handleReceipt} /></label>{form.receipt && <img className="receipt-preview" src={form.receipt} alt="Receipt preview" />}</div>
        {error && <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>}
        <div className="modal-actions"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}</button></div>
      </form>
    </Modal>
  );
}
