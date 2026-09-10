import { useEffect, useState } from 'react';
import api from '../../api/client';

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/audit-logs?page=${p}&limit=20`);
      setLogs(res.data.data.logs || []);
      setTotalPages(res.data.data.pages || 1);
      setPage(res.data.data.page || 1);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Trail Logs</h1>
          <p className="text-sm text-slate-500">
            System activity and user operation security log trail
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {log.userRole || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{log.resource}</td>
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-xs text-slate-500">
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : String(log.details || '')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <button
              disabled={page <= 1}
              onClick={() => fetchLogs(page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchLogs(page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogsPage;
