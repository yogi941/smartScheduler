import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="text-6xl mb-4">4️⃣0️⃣4️⃣</div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-6">
        The route you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
