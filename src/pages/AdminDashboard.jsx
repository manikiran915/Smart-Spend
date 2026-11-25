import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, LogOut, ShieldCheck, Users, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { readUserFinanceData } from '../data/userFinance.js';
import { formatMoney } from '../utils/finance.js';

export default function AdminDashboard() {
  const { users, updateUserStatus, logout, storageError } = useAuth();
  const navigate = useNavigate();
  const [financeRevision, setFinanceRevision] = useState(0);
  useEffect(() => {
    const refreshUserData = (event) => {
      if (event.key?.startsWith('smartspend-user-data-v1:')) {
        setFinanceRevision((revision) => revision + 1);
      }
    };
    window.addEventListener('storage', refreshUserData);
    return () => window.removeEventListener('storage', refreshUserData);
  }, []);
  const accountRows = useMemo(() => users.map((user) => {
    const data = readUserFinanceData(user);
    const income = data.transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = data.transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { user, currency: data.currency || 'USD', transactions: data.transactions.length, income, expenses };
  }), [users, financeRevision]);
  const metrics = accountRows.reduce((summary, row) => ({
    transactions: summary.transactions + row.transactions,
    income: { ...summary.income, [row.currency]: (summary.income[row.currency] || 0) + row.income },
    expenses: { ...summary.expenses, [row.currency]: (summary.expenses[row.currency] || 0) + row.expenses },
  }), { transactions: 0, income: {}, expenses: {} });

  const signOut = () => {
    if (logout()) navigate('/admin/login', { replace: true });
  };

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link className="brand-lockup" to="/admin/dashboard"><span className="brand-symbol"><Activity size={20} /></span><span>smart<span>spend</span></span></Link>
        <div className="admin-topbar-actions"><span className="admin-role"><ShieldCheck size={15} /> Administrator</span><button className="btn btn-outline-secondary btn-sm" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-welcome">
          <div><div className="eyebrow">SMARTSPEND OVERVIEW</div><h1>Admin dashboard</h1><p>Review registered accounts and the activity saved on this device.</p></div>
          <span className="admin-local-badge"><span /> Local demonstration data</span>
        </div>
        {storageError && <div className="auth-error" role="alert">{storageError}</div>}
        <div className="admin-metrics">
          <Metric icon={Users} label="Registered users" value={users.length.toLocaleString()} />
          <Metric icon={Activity} label="Transactions" value={metrics.transactions.toLocaleString()} />
          <Metric icon={ArrowUpRight} label="Overall income" value={formatTotals(metrics.income)} tone="income" />
          <Metric icon={ArrowDownRight} label="Overall expenses" value={formatTotals(metrics.expenses)} tone="expense" />
        </div>
        <section className="admin-users-card">
          <div className="admin-card-heading"><div><h2>Registered users</h2><p>Account details and saved activity for each local user.</p></div><span className="admin-count">{users.length} accounts</span></div>
          {users.length === 0 ? (
            <div className="admin-empty"><div><Users size={20} /></div><h3>No registered users yet</h3><p>When someone creates a SmartSpend account on this browser, it will appear here.</p><Link className="btn btn-outline-secondary btn-sm" to="/register">Create a user account</Link></div>
          ) : (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>User</th><th>Registered</th><th>Transactions</th><th>Income</th><th>Expenses</th><th>Status</th><th>Account action</th></tr></thead>
              <tbody>{accountRows.map(({ user, currency, transactions, income, expenses }) => <tr key={user.id}>
                <td><div className="admin-user-cell"><span className="avatar">{(user.name || 'U').slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td>
                <td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(user.createdAt))}</td>
                <td>{transactions}</td><td className="admin-income">{formatMoney(income, currency)}</td><td className="admin-expense">{formatMoney(expenses, currency)}</td>
                <td><span className={`account-status ${user.status}`}>{user.status}</span></td>
                <td><button className={`btn btn-sm ${user.status === 'active' ? 'btn-outline-danger' : 'btn-outline-secondary'}`} onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}>{user.status === 'active' ? 'Suspend' : 'Reactivate'}</button></td>
              </tr>)}</tbody>
            </table></div>
          )}
        </section>
        <p className="admin-disclaimer"><Wallet size={14} /> This academic demo stores accounts and financial activity in this browser only. It is not production-grade authentication.</p>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, tone = '' }) {
  return <article className={`admin-metric ${tone}`}><div className="admin-metric-icon"><Icon size={18} /></div><div><span>{label}</span><strong>{value}</strong></div></article>;
}

function formatTotals(totals) {
  const formatted = Object.entries(totals).map(([currency, amount]) => `${formatMoney(amount, currency)} ${currency}`);
  return formatted.length ? formatted.join(' · ') : formatMoney(0, 'USD');
}
