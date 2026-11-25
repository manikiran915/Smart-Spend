import { useState } from 'react';
import { AlertCircle, Plus, Target, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { currencySymbol, currentMonth, formatMoney, makeId } from '../utils/finance.js';
import { ConfirmAction, EmptyState, Modal, PageTitle } from '../components/UI.jsx';

function BudgetDialog({ onClose, budget, categories }) {
  const { budgets, update, currency, notify } = useFinance();
  const available = categories.filter((category) => category === budget?.category || !budgets.some((item) => item.category === category));
  const [category, setCategory] = useState(budget?.category || available[0] || '');
  const [limit, setLimit] = useState(budget?.limit || '');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const numericLimit = Number(limit);
    if (!category || !Number.isFinite(numericLimit) || numericLimit <= 0) {
      setError('Choose a category and set a limit greater than zero.');
      return;
    }
    update('budgets', (rows) => budget
      ? rows.map((row) => row.id === budget.id ? { ...row, category, limit: numericLimit } : row)
      : [...rows, { id: makeId(), category, limit: numericLimit }]);
    notify(budget ? 'Budget updated.' : 'Budget created.');
    onClose();
  };
  return <Modal title={budget ? 'Adjust your budget' : 'Set a monthly budget'} onClose={onClose}>
    <form onSubmit={submit}><p className="modal-description">A gentle limit can make it easier to spend with intention.</p>
      <div className="mb-3"><label className="form-label">Category</label><select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>{available.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label className="form-label">Monthly limit</label><div className="input-group"><span className="input-group-text">{currencySymbol(currency)}</span><input className="form-control" type="number" step="0.01" min="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} required /></div></div>
      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}
      <div className="modal-actions"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">{budget ? 'Save budget' : 'Create budget'}</button></div>
    </form>
  </Modal>;
}

export default function Budgets() {
  const { budgets, transactions, categories, currency, update, notify } = useFinance();
  const [dialog, setDialog] = useState(null);
  const monthlyExpenses = transactions.filter((item) => item.type === 'expense' && item.date.startsWith(currentMonth()));
  const totalLimit = budgets.reduce((sum, item) => sum + Number(item.limit), 0);
  const totalSpent = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remove = (id) => { update('budgets', (rows) => rows.filter((item) => item.id !== id)); notify('Budget removed.'); };

  return <div>
    <PageTitle eyebrow="A LITTLE PLAN GOES A LONG WAY" title="Budgets" description="Set a few thoughtful limits, then check in as you go." action={<button className="btn btn-primary" onClick={() => setDialog({})} disabled={budgets.length >= categories.length}><Plus size={17} /> New budget</button>} />
    <div className="budget-overview panel-card"><div className="budget-overview-icon"><Target size={20} /></div><div className="budget-overview-copy"><span>MONTHLY PLAN</span><strong>{formatMoney(totalSpent, currency)} <small>of {formatMoney(totalLimit, currency)} used</small></strong></div><div className="budget-overview-aside"><span>{totalLimit ? Math.round(totalSpent / totalLimit * 100) : 0}%</span><small>of your total budget</small></div><div className="progress budget-overview-progress"><div className={`progress-bar ${totalSpent > totalLimit ? 'over' : ''}`} style={{ width: `${totalLimit ? Math.min(100, totalSpent / totalLimit * 100) : 0}%` }} /></div></div>
    {budgets.length ? <div className="row g-3 mt-1">{budgets.map((budget) => {
      const spent = monthlyExpenses.filter((item) => item.category === budget.category).reduce((sum, item) => sum + Number(item.amount), 0);
      const ratio = spent / budget.limit;
      const percent = Math.round(ratio * 100);
      return <div className="col-md-6 col-xl-4" key={budget.id}><article className="budget-card panel-card"><div className="budget-card-top"><div className="budget-card-symbol">{budget.category.slice(0, 1)}</div><div className="budget-actions"><button className="icon-button" aria-label={`Edit ${budget.category} budget`} onClick={() => setDialog(budget)}><span className="edit-glyph">✎</span></button><ConfirmAction className="icon-button danger-hover" message={`Remove your ${budget.category} budget?`} onConfirm={() => remove(budget.id)}><Trash2 size={16} /></ConfirmAction></div></div>      <h2>{budget.category}</h2><p className="budget-spent">{formatMoney(spent, currency)} <span>spent this month</span></p><div className="progress"><div className={`progress-bar ${ratio >= 1 ? 'over' : ratio >= .8 ? 'near' : ''}`} style={{ width: `${Math.min(100, percent)}%` }} /></div><div className="budget-card-foot"><span>{formatMoney(Math.max(0, budget.limit - spent), currency)} left</span><strong>{percent}%</strong></div>{ratio >= .8 && <div className={`budget-status ${ratio >= 1 ? 'over-text' : ''}`}><AlertCircle size={14} />{ratio >= 1 ? 'You’ve reached this limit.' : 'You’re getting close to this limit.'}</div>}</article></div>;
    })}</div> : <section className="panel-card mt-4"><EmptyState title="Give your spending a little shape" description="Start with the categories that matter most to you. You can change your limits anytime." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={16} /> Create a budget</button>} /></section>}
    {dialog && <BudgetDialog budget={dialog.id ? dialog : undefined} categories={categories} onClose={() => setDialog(null)} />}
  </div>;
}
