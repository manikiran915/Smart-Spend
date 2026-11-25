import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAdmin, RequireUser } from './components/RouteGuards.jsx';
import { useFinance } from './context/FinanceContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Transactions = lazy(() => import('./pages/Transactions.jsx'));
const Budgets = lazy(() => import('./pages/Budgets.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Goals = lazy(() => import('./pages/Goals.jsx'));
const Recurring = lazy(() => import('./pages/Recurring.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

export default function App() {
  const { theme } = useFinance();
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return (
    <Suspense fallback={<div className="app-loading">Opening your workspace…</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="user" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/admin/login" element={<AuthPage mode="admin" />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/app" element={<RequireUser><Layout /></RequireUser>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="goals" element={<Goals />} />
          <Route path="recurring" element={<Recurring />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
