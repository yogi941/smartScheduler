import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-4">⛔</div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
      <p className="text-slate-500 max-w-md mb-6">
        You do not have administrative permissions to view or perform operations on this page.
      </p>
      <Link to="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
