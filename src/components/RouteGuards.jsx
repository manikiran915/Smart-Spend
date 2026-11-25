import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireUser({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}
