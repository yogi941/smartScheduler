import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import DepartmentsPage from './pages/dashboard/DepartmentsPage';
import CoursesPage from './pages/dashboard/CoursesPage';
import SemestersPage from './pages/dashboard/SemestersPage';
import SubjectsPage from './pages/dashboard/SubjectsPage';
import TeachersPage from './pages/dashboard/TeachersPage';
import StudentBatchesPage from './pages/dashboard/StudentBatchesPage';
import RoomsPage from './pages/dashboard/RoomsPage';
import LaboratoriesPage from './pages/dashboard/LaboratoriesPage';
import TimeSlotsPage from './pages/dashboard/TimeSlotsPage';
import ConstraintsPage from './pages/dashboard/ConstraintsPage';
import TimetablesPage from './pages/dashboard/TimetablesPage';
import UsersPage from './pages/dashboard/UsersPage';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

/**
 * Route tree layout:
 *   /login, /register           -> PublicOnlyRoute (bounces logged-in users to /dashboard)
 *   /unauthorized                -> plain page, reachable by anyone authenticated
 *   /dashboard/*                 -> ProtectedRoute (requires auth) -> DashboardLayout
 *     /dashboard                 -> role-agnostic home
 *     /dashboard/timetables      -> role-agnostic (Students see published schedules;
 *                                   the generate/publish/archive actions inside the
 *                                   page itself are conditionally rendered for admins)
 *     /dashboard/departments etc -> nested ProtectedRoute with allowedRoles=ADMIN_ROLES
 *
 * NOTE: allowedRoles here is a UX convenience (hides/redirects nav the user
 * can't use); the backend's authorize(...) middleware is the real
 * enforcement boundary and would reject these calls regardless of what
 * the frontend router allows through.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHomePage />} />
              <Route path="timetables" element={<TimetablesPage />} />

              <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="semesters" element={<SemestersPage />} />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="student-batches" element={<StudentBatchesPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="laboratories" element={<LaboratoriesPage />} />
                <Route path="time-slots" element={<TimeSlotsPage />} />
                <Route path="constraints" element={<ConstraintsPage />} />
                <Route path="users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
