import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Calculator, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinance } from '../context/FinanceContext.jsx';
import { categoryTotals, currentMonth, formatMoney, getTotals, monthlyChartData } from '../utils/finance.js';
import { EmptyState, PageTitle } from '../components/UI.jsx';

const colors = ['#89968A', '#A66F52', '#B96F65', '#687B6D', '#C6A68D', '#9A9C88', '#D6BCA7', '#B2B7AA'];

export default function Analytics() {
  const { transactions, currency } = useFinance();
  const [monthly, setMonthly] = useState('300');
  const totals = getTotals(transactions);
  const monthRows = transactions.filter((item) => item.date.startsWith(currentMonth()));
  const categories = categoryTotals(monthRows);
  const chartData = monthlyChartData(transactions);
  const annualProjection = Number(monthly) > 0 ? [3, 6, 12].map((months) => ({ months, value: Number(monthly) * months })) : [];
  const trend = useMemo(() => chartData.map((item, index) => ({ ...item, average: chartData.slice(Math.max(0, index - 2), index + 1).reduce((sum, row) => sum + row.Expenses, 0) / chartData.slice(Math.max(0, index - 2), index + 1).length })), [chartData]);
  const highest = categories[0];
  return <div>
    <PageTitle eyebrow="THE BIGGER PICTURE" title="Analytics" description="Patterns, progress, and a few helpful perspectives." />
    <div className="row g-3 analytics-summary">
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon income-stat"><ArrowDownRight size={18} /></span><div><small>INCOME THIS MONTH</small><strong>{formatMoney(totals.income, currency)}</strong></div></div></div>
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon expense-stat"><ArrowUpRight size={18} /></span><div><small>EXPENSES THIS MONTH</small><strong>{formatMoney(totals.expenses, currency)}</strong></div></div></div>
      <div className="col-md-4"><div className="analytics-stat panel-card"><span className="analytics-stat-icon savings-stat"><TrendingUp size={18} /></span><div><small>NET SAVINGS THIS MONTH</small><strong>{formatMoney(totals.savings, currency)}</strong></div></div></div>
    </div>
    <div className="row g-4 mt-1">
      <div className="col-xl-8"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Income versus expenses</h2><p>A monthly comparison over the last six months</p></div></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} barGap={7} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}><CartesianGrid stroke="#E8E4DA" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8B8E88', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B8E88', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={56} /><Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ borderRadius: 12, border: '1px solid #E8E4DA' }} /><Legend iconType="circle" /><Bar dataKey="Income" fill="#89968A" radius={[5, 5, 0, 0]} maxBarSize={28} /><Bar dataKey="Expenses" fill="#B96F65" radius={[5, 5, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div></section></div>
      <div className="col-xl-4"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Expense mix</h2><p>Where your money went this month</p></div></div>
        {categories.length ? <><div className="analytics-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="84%" paddingAngle={4} stroke="none">{categories.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatMoney(value, currency)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatMoney(totals.expenses, currency, true)}</strong><span>this month</span></div></div><div className="category-list analytics-category-list">{categories.slice(0, 5).map((item, index) => <div className="category-row" key={item.name}><span className="category-dot" style={{ backgroundColor: colors[index % colors.length] }} /><span className="category-name">{item.name}</span><strong>{formatMoney(item.value, currency)}</strong></div>)}</div></> : <EmptyState title="Your breakdown will appear here" description="Add an expense to start seeing category patterns." />}
      </section></div>
    </div>
    <div className="row g-4 mt-1">
      <div className="col-xl-7"><section className="panel-card analytics-chart-panel"><div className="panel-heading"><div><h2>Spending rhythm</h2><p>A rolling view of your monthly expenses</p></div><span className="average-label">3-month average</span></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={trend} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}><CartesianGrid stroke="#E8E4DA" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8B8E88', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B8E88', fontSize: 11 }} tickFormatter={(value) => formatMoney(value, currency, true)} width={56} /><Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ borderRadius: 12, border: '1px solid #E8E4DA' }} /><Area dataKey="Expenses" fill="#B96F651A" stroke="#B96F65" strokeWidth={2} /><Line dataKey="average" name="3-month average" stroke="#34483D" strokeDasharray="5 5" dot={false} strokeWidth={2} /></ComposedChart></ResponsiveContainer></div></section></div>
      <div className="col-xl-5"><section className="panel-card calculator-panel"><div className="calculator-icon"><Calculator size={19} /></div><div className="panel-heading"><div><h2>Savings calculator</h2><p>Picture what small steps could become.</p></div></div><label className="form-label" htmlFor="monthly-savings">If you set aside each month</label><div className="input-group savings-input"><span className="input-group-text">{new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(0).find((part) => part.type === 'currency')?.value || currency}</span><input id="monthly-savings" className="form-control" type="number" min="0" step="10" value={monthly} onChange={(e) => setMonthly(e.target.value)} /></div><div className="projection-list">{annualProjection.map(({ months, value }) => <div className="projection-row" key={months}><span>{months} months</span><strong>{formatMoney(value, currency)}</strong></div>)}</div><small className="calculator-note">An estimate only, before interest or unexpected expenses.</small></section></div>
    </div>
    <section className="insight-strip panel-card mt-4"><div className="insight-stamp"><TrendingUp size={19} /></div><div><span>YOUR MONTHLY NOTE</span><p>{highest ? <><strong>{highest.name}</strong> is your largest spending category so far at <strong>{formatMoney(highest.value, currency)}</strong>. Your total savings this month are <strong>{formatMoney(totals.savings, currency)}</strong>.</> : <>Add your first transactions and your monthly summary will begin to take shape.</>}</p></div></section>
  </div>;
}
