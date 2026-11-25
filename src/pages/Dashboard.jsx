import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Plus, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinance } from '../context/FinanceContext.jsx';
import { categoryTotals, currentMonth, formatMoney, getTotals, monthLabel, monthlyChartData } from '../utils/finance.js';
import { PageTitle, EmptyState } from '../components/UI.jsx';
import { TransactionDialog } from '../components/TransactionDialog.jsx';

const categoryColors = Array.from({ length: 8 }, (_, index) => `var(--chart-${index + 1})`);

function StatCard({ label, value, icon: Icon, tone, helper, change }) {
  return <article className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className="stat-change">{change}</span><span>{helper}</span></div></article>;
}

export default function Dashboard() {
  const { transactions, budgets, currency } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const totals = getTotals(transactions);
  const monthTransactions = transactions.filter((item) => item.date.startsWith(currentMonth()));
  const spending = categoryTotals(monthTransactions);
  const monthlyData = monthlyChartData(transactions);
  const budgetRows = budgets.map((budget) => ({
    ...budget,
    spent: monthTransactions.filter((item) => item.type === 'expense' && item.category === budget.category).reduce((sum, item) => sum + Number(item.amount), 0),
  })).sort((a, b) => b.spent / b.limit - a.spent / a.limit).slice(0, 4);
  const calendar = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const grouped = monthTransactions.reduce((acc, item) => {
      const day = Number(item.date.slice(-2));
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    return { cells: [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)], grouped, label: monthLabel(now) };
  }, [monthTransactions]);

  return (
    <div>
      <PageTitle eyebrow={new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()} title="Good things are adding up." description="Here's your money, at a glance." action={<button className="btn btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-2"><CalendarDays size={16} /> This month</button>} />
      <div className="row g-3 stat-grid">
        <div className="col-6 col-xl-3"><StatCard label="Total balance" value={formatMoney(totals.balance, currency)} icon={Wallet} tone="balance-tone" change="Across all time" helper="your net cash flow" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Income" value={formatMoney(totals.income, currency)} icon={ArrowDownLeft} tone="income-tone" change="This month" helper="money coming in" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Expenses" value={formatMoney(totals.expenses, currency)} icon={ArrowUpRight} tone="expense-tone" change="This month" helper="money going out" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Monthly savings" value={formatMoney(totals.savings, currency)} icon={ArrowRight} tone="savings-tone" change={totals.savings >= 0 ? 'You’re on track' : 'A little over income'} helper="income minus expenses" /></div>
      </div>
      <div className="row g-4 mt-1">
        <div className="col-xl-8"><section className="panel-card chart-panel"><div className="panel-heading"><div><h2>Income & spending</h2><p>Your last six months</p></div><div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sage)" stopOpacity={0.24} /><stop offset="95%" stopColor="var(--sage)" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--expense)" stopOpacity={0.16} /><stop offset="95%" stopColor="var(--expense)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={54} /><Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--charcoal)' }} /><Area type="monotone" dataKey="Income" stroke="var(--sage)" strokeWidth={2.5} fill="url(#incomeFill)" /><Area type="monotone" dataKey="Expenses" stroke="var(--expense)" strokeWidth={2.5} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div>
        </section></div>
        <div className="col-xl-4"><section className="panel-card category-panel"><div className="panel-heading"><div><h2>Where it went</h2><p>This month's expenses</p></div><Link to="/app/analytics" className="text-icon-link" aria-label="View analytics"><ArrowRight size={17} /></Link></div>
          {spending.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={spending} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={4} stroke="none">{spending.map((item, index) => <Cell key={item.name} fill={categoryColors[index % categoryColors.length]} />)}</Pie><Tooltip formatter={(value) => formatMoney(value, currency)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatMoney(totals.expenses, currency, true)}</strong><span>total spent</span></div></div><div className="category-list">{spending.slice(0, 4).map((item, index) => <div className="category-row" key={item.name}><span className="category-dot" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} /><span className="category-name">{item.name}</span><strong>{formatMoney(item.value, currency)}</strong></div>)}</div></> : <EmptyState title="Nothing spent yet" description="Add an expense to see your breakdown." action={<button className="btn btn-sm btn-outline-secondary" onClick={() => setDialogOpen(true)}>Add expense</button>} />}
        </section></div>
      </div>
      <div className="row g-4 mt-1">
        <div className="col-xl-7"><section className="panel-card"><div className="panel-heading"><div><h2>Recent transactions</h2><p>A few of your latest money moments</p></div><Link to="/app/transactions" className="text-link">View all <ArrowRight size={15} /></Link></div>
          {transactions.length ? <div className="recent-list">{[...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((item) => <div className="recent-item" key={item.id}><div className={`transaction-avatar ${item.type}`}>{item.category.slice(0, 1)}</div><div className="recent-copy"><strong>{item.description}</strong><span>{item.category} <i /> {new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div><strong className={`recent-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatMoney(item.amount, currency)}</strong></div>)}</div> : <EmptyState title="Your story starts here" description="Add your first income or expense." action={<button className="btn btn-primary" onClick={() => setDialogOpen(true)}><Plus size={16} /> Add transaction</button>} />}
        </section></div>
        <div className="col-xl-5"><section className="panel-card"><div className="panel-heading"><div><h2>Budget check-in</h2><p>A gentle look at your limits</p></div><Link to="/app/budgets" className="text-icon-link" aria-label="Manage budgets"><ArrowRight size={17} /></Link></div>
          {budgetRows.length ? <div className="budget-check-list">{budgetRows.map((budget) => { const pct = Math.round(budget.spent / budget.limit * 100); return <div key={budget.id} className="budget-check"><div className="d-flex justify-content-between gap-2"><strong>{budget.category}</strong><span>{formatMoney(budget.spent, currency)} <span className="text-muted">/ {formatMoney(budget.limit, currency)}</span></span></div><div className="progress"><div className={`progress-bar ${pct >= 100 ? 'over' : pct >= 80 ? 'near' : ''}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>{pct >= 80 && <small className={pct >= 100 ? 'budget-alert over-text' : 'budget-alert'}>{pct >= 100 ? 'Budget reached — take a look.' : 'Getting close to your limit.'}</small>}</div>; })}</div> : <EmptyState title="No budgets yet" description="Set a limit for a category and keep an eye on it." action={<Link className="btn btn-sm btn-outline-secondary" to="/app/budgets">Create a budget</Link>} />}
        </section></div>
      </div>
      <div className="row g-4 mt-1 mb-4">
        <div className="col-xl-7"><section className="panel-card calendar-panel"><div className="panel-heading"><div><h2>Your spending calendar</h2><p>Little moments through {calendar.label}</p></div></div><div className="mini-calendar"><div className="calendar-weekdays">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div><div className="calendar-days">{calendar.cells.map((day, index) => <span key={index} className={`calendar-day ${day && calendar.grouped[day] ? 'has-activity' : ''} ${day === new Date().getDate() ? 'today' : ''}`} title={day && calendar.grouped[day] ? `${calendar.grouped[day]} transactions` : undefined}>{day || ''}{day && calendar.grouped[day] && <i />}</span>)}</div></div></section></div>
      </div>
      {dialogOpen && <TransactionDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
