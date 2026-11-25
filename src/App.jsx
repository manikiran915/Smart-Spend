import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAdmin, RequireUser } from './components/RouteGuards.jsx';
import { useFinance } from './context/FinanceContext.jsx';
import { getTheme, getThemeId } from './theme.js';
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Transactions = lazy(() => import('./pages/Transactions.jsx'));
const Budgets = lazy(() => import('./pages/Budgets.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

export default function App() {
  const { theme } = useFinance();
  useEffect(() => {
    const root = document.documentElement;
    const themeId = getThemeId(theme);
    const palette = getTheme(themeId);
    root.dataset.theme = themeId;
    root.style.colorScheme = palette.colorScheme;
    Object.entries(palette.variables).forEach(([name, value]) => root.style.setProperty(name, value));
  }, [theme]);
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
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
