import { useState } from 'react';
import { ArrowRight, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { currencySymbol, formatMoney, makeId } from '../utils/finance.js';
import { ConfirmAction, EmptyState, Modal, PageTitle } from '../components/UI.jsx';

function GoalDialog({ goal, onClose }) {
  const { goals, currency, update, notify } = useFinance();
  const [form, setForm] = useState(goal || { name: '', target: '', saved: '', monthlySavings: '', dueDate: '' });
  const [error, setError] = useState('');
  const set = (key, value) => setForm((row) => ({ ...row, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const target = Number(form.target);
    const saved = Number(form.saved);
    const monthlySavings = Number(form.monthlySavings);
    if (!form.name.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0 || saved > target || !Number.isFinite(monthlySavings) || monthlySavings < 0) {
      setError('Add a name, a target above zero, and valid saved and monthly amounts.');
      return;
    }
    const row = { ...form, name: form.name.trim(), target, saved, monthlySavings, id: goal?.id || makeId() };
    update('goals', (rows) => goal ? rows.map((item) => item.id === goal.id ? row : item) : [...rows, row]);
    notify(goal ? 'Savings goal updated.' : 'Savings goal created.');
    onClose();
  };
  return <Modal title={goal ? 'Update your goal' : 'Set a savings goal'} onClose={onClose}>
    <form onSubmit={submit}><div className="mb-3"><label className="form-label">What are you saving for?</label><input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="A trip, a cushion, a fresh start..." maxLength="70" required /></div>
      <div className="row g-3"><div className="col-6"><label className="form-label">Target amount</label><input className="form-control" type="number" min="1" step="0.01" value={form.target} onChange={(e) => set('target', e.target.value)} required /></div><div className="col-6"><label className="form-label">Already saved</label><input className="form-control" type="number" min="0" step="0.01" value={form.saved} onChange={(e) => set('saved', e.target.value)} required /></div></div>
      <div className="row g-3 mt-0"><div className="col-6"><label className="form-label">Monthly contribution</label><input className="form-control" type="number" min="0" step="0.01" value={form.monthlySavings} onChange={(e) => set('monthlySavings', e.target.value)} /></div><div className="col-6"><label className="form-label">Target date <span className="optional-label">Optional</span></label><input className="form-control" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></div></div>
      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">{goal ? 'Save changes' : 'Create goal'}</button></div>
    </form>
  </Modal>;
}

export default function Goals() {
  const { goals, currency, update, notify } = useFinance();
  const [dialog, setDialog] = useState(null);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contribution, setContribution] = useState('');
  const totalSaved = goals.reduce((sum, item) => sum + Number(item.saved), 0);
  const totalTarget = goals.reduce((sum, item) => sum + Number(item.target), 0);
  const remove = (id) => { update('goals', (rows) => rows.filter((item) => item.id !== id)); notify('Savings goal removed.'); };
  const addContribution = (event) => {
    event.preventDefault();
    const amount = Number(contribution);
    if (!Number.isFinite(amount) || amount <= 0) return;
    update('goals', (rows) => rows.map((item) => item.id === contributionGoal.id ? { ...item, saved: Math.min(item.target, Number(item.saved) + amount) } : item));
    notify('Progress added to your goal.');
    setContributionGoal(null);
    setContribution('');
  };
  return <div>
    <PageTitle eyebrow="SAVE FOR YOUR KIND OF TOMORROW" title="Savings goals" description="Small, steady steps toward the things that matter to you." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={17} /> New goal</button>} />
    {goals.length > 0 && <div className="goals-summary panel-card"><div className="goals-summary-mark"><Sparkles size={20} /></div><div><span>YOU'VE PUT ASIDE</span><strong>{formatMoney(totalSaved, currency)} <small>of {formatMoney(totalTarget, currency)}</small></strong></div><div className="goals-summary-progress"><div className="progress"><div className="progress-bar" style={{ width: `${totalTarget ? Math.min(100, totalSaved / totalTarget * 100) : 0}%` }} /></div><small>{totalTarget ? Math.round(totalSaved / totalTarget * 100) : 0}% across your goals</small></div></div>}
    {goals.length ? <div className="row g-3 mt-1">{goals.map((goal) => {
      const progress = Math.min(100, Number(goal.saved) / Number(goal.target) * 100);
      const remaining = Math.max(0, Number(goal.target) - Number(goal.saved));
      const months = Number(goal.monthlySavings) > 0 ? Math.ceil(remaining / Number(goal.monthlySavings)) : null;
      return <div className="col-md-6 col-xl-4" key={goal.id}><article className="goal-card panel-card"><div className="goal-card-top"><div className="goal-mark"><Target size={19} /></div><div className="budget-actions"><button className="icon-button" aria-label="Edit goal" onClick={() => setDialog(goal)}><span className="edit-glyph">✎</span></button><ConfirmAction className="icon-button danger-hover" message={`Remove “${goal.name}”?`} onConfirm={() => remove(goal.id)}><Trash2 size={16} /></ConfirmAction></div></div><h2>{goal.name}</h2><div className="goal-values"><strong>{formatMoney(goal.saved, currency)}</strong><span>of {formatMoney(goal.target, currency)}</span></div><div className="progress"><div className="progress-bar" style={{ width: `${progress}%` }} /></div><div className="goal-card-foot"><span>{Math.round(progress)}% there</span><strong>{formatMoney(remaining, currency)} to go</strong></div><div className="goal-estimate">{months !== null ? <>{months ? `About ${months} month${months === 1 ? '' : 's'} at your current pace` : 'You did it — this goal is complete!'}</> : 'Add a monthly amount to estimate your timeline.'}</div><button className="btn btn-outline-secondary btn-sm goal-contribute" onClick={() => { setContributionGoal(goal); setContribution(''); }}>Add to this goal <ArrowRight size={15} /></button></article></div>;
    })}</div> : <section className="panel-card mt-4"><EmptyState title="Give a future plan a name" description="Create your first savings goal and watch the progress add up." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={16} /> Create a goal</button>} /></section>}
    {dialog && <GoalDialog goal={dialog.id ? dialog : undefined} onClose={() => setDialog(null)} />}
    {contributionGoal && <Modal title="Add to your goal" onClose={() => setContributionGoal(null)}><form onSubmit={addContribution}><p className="modal-description">Adding progress to <strong>{contributionGoal.name}</strong>.</p><div className="mb-3"><label className="form-label">Contribution</label><div className="input-group"><span className="input-group-text">{currencySymbol(currency)}</span><input className="form-control" type="number" min="0.01" step="0.01" value={contribution} onChange={(e) => setContribution(e.target.value)} required autoFocus /></div><small className="form-text">Progress is capped at the goal target.</small></div><div className="modal-actions"><button type="button" className="btn btn-outline-secondary" onClick={() => setContributionGoal(null)}>Cancel</button><button className="btn btn-primary">Add progress</button></div></form></Modal>}
  </div>;
}
