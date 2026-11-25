import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { Activity, ArrowLeftRight, BarChart3, LayoutDashboard, LogOut, Menu, Plus, Settings, Sparkles, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatMoney, getTotals } from '../utils/finance.js';
import { Notice } from './UI.jsx';
import { TransactionDialog } from './TransactionDialog.jsx';

const navigation = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/app/budgets', label: 'Budgets', icon: Wallet },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { profile, currency, transactions, notify } = useFinance();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = profile.name.trim().split(/\s+/)[0] || 'Friend';
  const totals = getTotals(transactions);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link className="brand-lockup" to="/app" onClick={() => setMenuOpen(false)}>
          <span className="brand-symbol"><Activity size={20} strokeWidth={2.5} /></span>
          <span>smart<span>spend</span></span>
        </Link>
        <div className="sidebar-label">YOUR MONEY</div>
        <nav className="sidebar-nav">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon className="sidebar-nav-icon" size={23} strokeWidth={2} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-budget">
          <div className="budget-badge"><Sparkles size={16} /></div>
          <div className="sidebar-budget-title">A little progress adds up.</div>
          <p>You've saved {formatMoney(totals.savings, currency)} this month. Keep it going.</p>
          <div className="progress sidebar-progress"><div className="progress-bar" style={{ width: `${Math.min(100, Math.max(6, totals.income ? totals.savings / totals.income * 100 : 6))}%` }} /></div>
        </div>
        <div className="sidebar-bottom">
          <NavLink to="/app/settings" onClick={() => setMenuOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings className="sidebar-nav-icon" size={23} strokeWidth={2} /><span>Settings</span>
          </NavLink>
          <div className="profile-chip">
            <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><strong>{profile.name || 'Your profile'}</strong><span>Personal account</span></div>
            <button type="button" className="icon-button profile-logout" aria-label="Sign out" title="Sign out" onClick={() => { if (logout()) navigate('/', { replace: true }); else notify('Your browser could not clear the saved sign-in session.', 'error'); }}><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{location.pathname === '/app' ? 'Overview' : navigation.find((item) => item.to === location.pathname)?.label || (location.pathname.includes('settings') ? 'Settings' : 'SmartSpend')}</strong></div>
          <div className="topbar-actions"><span className="date-stamp">{new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><button className="btn btn-primary btn-sm add-transaction" onClick={() => setAddOpen(true)}><Plus size={16} /> Add transaction</button></div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
      {addOpen && <TransactionDialog onClose={() => setAddOpen(false)} />}
      <Notice />
    </div>
  );
}
