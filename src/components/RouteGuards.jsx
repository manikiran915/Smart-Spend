import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireUser({ children }) {
  const { role, currentUser } = useAuth();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { role, currentUser } = useAuth();
  if (role === 'user' && currentUser) return <Navigate to="/app" replace />;
  if (role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}
