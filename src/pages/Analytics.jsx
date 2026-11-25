import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Calculator, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinance } from '../context/FinanceContext.jsx';
import { categoryTotals, currentMonth, dailyChartData, formatMoney, getTotals, monthlyChartData } from '../utils/finance.js';
import { EmptyState, PageTitle } from '../components/UI.jsx';

const colors = Array.from({ length: 8 }, (_, index) => `var(--chart-${index + 1})`);

export default function Analytics() {
  const { transactions, currency } = useFinance();
  const [monthly, setMonthly] = useState('300');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const totals = getTotals(transactions);
  const monthRows = transactions.filter((item) => item.date.startsWith(currentMonth()));
  const categories = categoryTotals(monthRows);
  const chartData = monthlyChartData(transactions);
  const currentMonthKey = currentMonth();
  const selectedMonthRows = useMemo(() => transactions.filter((item) => (
    item.date.startsWith(`${selectedMonth}-`) && ['income', 'expense'].includes(item.type)
  )), [transactions, selectedMonth]);
  const dailyData = useMemo(() => dailyChartData(selectedMonthRows, selectedMonth), [selectedMonthRows, selectedMonth]);
  const annualProjection = Number(monthly) > 0 ? [3, 6, 12].map((months) => ({ months, value: Number(monthly) * months })) : [];
  const trend = useMemo(() => chartData.map((item, index) => ({ ...item, average: chartData.slice(Math.max(0, index - 2), index + 1).reduce((sum, row) => sum + row.Expenses, 0) / chartData.slice(Math.max(0, index - 2), index + 1).length })), [chartData]);
  const highest = categories[0];
  const previousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };
  return <div>
    <PageTitle eyebrow="THE BIGGER PICTURE" title="Analytics" description="Patterns, progress, and a few helpful perspectives." />
    <div className="row g-3 analytics-summary">
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon income-stat"><ArrowDownRight size={18} /></span><div><small>INCOME THIS MONTH</small><strong>{formatMoney(totals.income, currency)}</strong></div></div></div>
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon expense-stat"><ArrowUpRight size={18} /></span><div><small>EXPENSES THIS MONTH</small><strong>{formatMoney(totals.expenses, currency)}</strong></div></div></div>
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon savings-stat"><TrendingUp size={18} /></span><div><small>NET SAVINGS THIS MONTH</small><strong>{formatMoney(totals.savings, currency)}</strong></div></div></div>
    </div>
    <div className="row g-4 mt-1">
      <div className="col-xl-8"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Income versus expenses</h2><p>A monthly comparison over the last six months</p></div></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} barGap={7} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={56} /><Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--charcoal)' }} /><Legend iconType="circle" /><Bar dataKey="Income" fill="var(--sage)" radius={[5, 5, 0, 0]} maxBarSize={28} /><Bar dataKey="Expenses" fill="var(--expense)" radius={[5, 5, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div></section></div>
      <div className="col-xl-4"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Expense mix</h2><p>Where your money went this month</p></div></div>
        {categories.length ? <><div className="analytics-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="84%" paddingAngle={4} stroke="none">{categories.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatMoney(value, currency)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatMoney(totals.expenses, currency, true)}</strong><span>this month</span></div></div><div className="category-list analytics-category-list">{categories.slice(0, 5).map((item, index) => <div className="category-row" key={item.name}><span className="category-dot" style={{ backgroundColor: colors[index % colors.length] }} /><span className="category-name">{item.name}</span><strong>{formatMoney(item.value, currency)}</strong></div>)}</div></> : <EmptyState title="Your breakdown will appear here" description="Add an expense to start seeing category patterns." />}
      </section></div>
    </div>
    <div className="row g-4 mt-1">
      <div className="col-12"><section className="panel-card analytics-chart-panel monthly-chart-panel">
        <div className="panel-heading"><div><h2>Monthly Income vs Expenses</h2><p>Daily comparison of your income and spending.</p></div></div>
        <div className="monthly-chart-controls">
          <button type="button" className="btn btn-outline-secondary btn-sm" aria-label="Previous month" onClick={previousMonth}><ChevronLeft size={15} /> Previous</button>
          <label className="visually-hidden" htmlFor="analytics-month">Month and year</label>
          <input id="analytics-month" className="form-control monthly-month-picker" type="month" value={selectedMonth} onChange={(event) => event.target.value && setSelectedMonth(event.target.value)} />
          <button type="button" className="btn btn-outline-secondary btn-sm" aria-label="Next month" onClick={nextMonth}>Next <ChevronRight size={15} /></button>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={selectedMonth === currentMonthKey} onClick={() => setSelectedMonth(currentMonthKey)}>Current month</button>
        </div>
        {selectedMonthRows.length ? <div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><LineChart data={dailyData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={(date) => String(Number(date.slice(-2)))} interval={0} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={56} />
          <Tooltip formatter={(value) => formatMoney(value, currency)} labelFormatter={(date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--charcoal)' }} />
          <Legend iconType="circle" />
          <Line type="linear" dataKey="Income" name="Income" stroke="var(--sage)" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
          <Line type="linear" dataKey="Expenses" name="Expenses" stroke="var(--expense)" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
        </LineChart></ResponsiveContainer></div> : <EmptyState title="No transactions this month" description="Income and expenses will appear here once you add transactions for this month." />}
      </section></div>
    </div>
    <div className="row g-4 mt-1">
      <div className="col-xl-7"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Spending rhythm</h2><p>A rolling view of your monthly expenses</p></div><span className="average-label">3-month average</span></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={trend} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={56} /><Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--charcoal)' }} /><Area dataKey="Expenses" fill="var(--expense)" fillOpacity={0.12} stroke="var(--expense)" strokeWidth={2} /><Line dataKey="average" name="3-month average" stroke="var(--olive)" strokeDasharray="5 5" dot={false} strokeWidth={2} /></ComposedChart></ResponsiveContainer></div></section></div>
      <div className="col-xl-5"><section className="panel-card calculator-panel"><div className="calculator-icon"><Calculator size={19} /></div><div className="panel-heading"><div><h2>Savings calculator</h2><p>Picture what small steps could become.</p></div></div><label className="form-label" htmlFor="monthly-savings">If you set aside each month</label><div className="input-group savings-input"><span className="input-group-text">{new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(0).find((part) => part.type === 'currency')?.value || currency}</span><input id="monthly-savings" className="form-control" type="number" min="0" step="10" value={monthly} onChange={(e) => setMonthly(e.target.value)} /></div><div className="projection-list">{annualProjection.map(({ months, value }) => <div className="projection-row" key={months}><span>{months} months</span><strong>{formatMoney(value, currency)}</strong></div>)}</div><small className="calculator-note">An estimate only, before interest or unexpected expenses.</small></section></div>
    </div>
    <section className="insight-strip panel-card mt-4"><div className="insight-stamp"><TrendingUp size={19} /></div><div><span>YOUR MONTHLY NOTE</span><p>{highest ? <><strong>{highest.name}</strong> is your largest spending category so far at <strong>{formatMoney(highest.value, currency)}</strong>. Your total savings this month are <strong>{formatMoney(totals.savings, currency)}</strong>.</> : <>Add your first transactions and your monthly summary will begin to take shape.</>}</p></div></section>
  </div>;
}
