import { useEffect, useState } from 'react';
import api from '../../api/client';

function VersionHistoryModal({ timetableId, isOpen, onClose, onRollbackSuccess }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollingBackVersion, setRollingBackVersion] = useState(null);

  useEffect(() => {
    if (isOpen && timetableId) {
      setLoading(true);
      api
        .get(`/timetables/${timetableId}/versions`)
        .then((res) => {
          setHistory(res.data.data || []);
        })
        .catch((err) => {
          console.error('Failed to load version history', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, timetableId]);

  if (!isOpen) return null;

  const handleRollback = async (versionNumber) => {
    setRollingBackVersion(versionNumber);
    try {
      await api.post(`/timetables/${timetableId}/rollback`, { targetVersion: versionNumber });
      if (onRollbackSuccess) onRollbackSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Rollback failed');
    } finally {
      setRollingBackVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Schedule Version History & Rollback</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-center py-6 text-xs text-slate-400">Loading version history...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No version history available.</p>
          ) : (
            history.map((ver) => (
              <div
                key={ver._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-brand-200 hover:bg-brand-50/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Version {ver.version}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        ver.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ver.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generated: {new Date(ver.generatedAt || ver.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    Conflicts: {ver.conflictCount > 0 ? `⚠️ ${ver.conflictCount}` : '✅ 0'}
                  </p>
                </div>

                <button
                  onClick={() => handleRollback(ver.version)}
                  disabled={rollingBackVersion === ver.version}
                  className="rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-600 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {rollingBackVersion === ver.version ? 'Rolling back...' : '↩️ Rollback to v' + ver.version}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VersionHistoryModal;
