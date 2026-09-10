import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import ImportExportModal from '../components/common/ImportExportModal';

function Header() {
  const { user, logout } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-sm font-medium text-slate-500">Welcome back,</h1>
        <p className="text-base font-bold text-slate-900">{user?.name || user?.email}</p>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5"
          >
            📥 Import Excel/CSV
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Trigger optional refresh or toast
        }}
      />
    </header>
  );
}

export default Header;
