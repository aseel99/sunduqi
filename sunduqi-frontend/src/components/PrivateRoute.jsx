import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user } = useAuth();
  console.log('PrivateRoute: user =', user);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; 
}
