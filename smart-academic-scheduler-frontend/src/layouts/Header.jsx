import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-sm font-medium text-slate-500">Welcome back,</h1>
        <p className="text-base font-bold text-slate-900">{user?.name || user?.email}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}

export default Header;
