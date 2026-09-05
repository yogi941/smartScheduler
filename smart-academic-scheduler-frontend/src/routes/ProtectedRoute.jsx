import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FullPageSpinner from '../components/common/FullPageSpinner';

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
