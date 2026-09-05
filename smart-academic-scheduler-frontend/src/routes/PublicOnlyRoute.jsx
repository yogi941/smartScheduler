import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FullPageSpinner from '../components/common/FullPageSpinner';

function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullPageSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
