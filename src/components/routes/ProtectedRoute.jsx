import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { PageLoader } from '../ui/Feedback';

/**
 * Client-side gate. It shapes navigation only — every protected resource is
 * independently authorised on the server, so a forged role here buys nothing.
 */
export const ProtectedRoute = ({ roles }) => {
  const { ready, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
