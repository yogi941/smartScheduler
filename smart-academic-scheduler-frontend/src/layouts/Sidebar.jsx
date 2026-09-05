import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { navItems } from './navConfig';

function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || 'STUDENT';

  const visibleNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md">
            S
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Scheduler</h2>
            <p className="text-xs text-slate-500 font-medium">Academic Engine</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Signed in as</p>
          <p className="truncate text-slate-900 font-medium">{user?.email}</p>
          <span className="mt-1 inline-block rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
            {user?.role}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
