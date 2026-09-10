import { useEffect, useState } from 'react';
import api from '../../api/client';

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading analytics & monitoring engine...</div>;
  }

  const { facultyWorkload = [], classroomUtilization, laboratoryUtilization, schedulingConflicts } = data || {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Workload Monitoring</h1>
          <p className="text-sm text-slate-500">
            Real-time faculty workload balancing, classroom utilization, and conflict telemetry
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Classroom Utilization</span>
            <span className="text-xl">🏫</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {classroomUtilization?.utilizationPercentage || 0}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {classroomUtilization?.totalBookings || 0} slots occupied across {classroomUtilization?.totalRooms || 0} rooms
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-500 transition-all duration-500"
              style={{ width: `${classroomUtilization?.utilizationPercentage || 0}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Laboratory Utilization</span>
            <span className="text-xl">🧪</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-900">
            {laboratoryUtilization?.utilizationPercentage || 0}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {laboratoryUtilization?.totalBookings || 0} lab sessions across {laboratoryUtilization?.totalLabs || 0} labs
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${laboratoryUtilization?.utilizationPercentage || 0}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Conflicts</span>
            <span className="text-xl">⚠️</span>
          </div>
          <p className={`mt-3 text-3xl font-extrabold ${(schedulingConflicts?.totalConflicts || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {schedulingConflicts?.totalConflicts || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {schedulingConflicts?.activeTimetablesCount || 0} active timetable schedule(s)
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${(schedulingConflicts?.totalConflicts || 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: (schedulingConflicts?.totalConflicts || 0) > 0 ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Faculty Workload Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Faculty Workload Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Faculty Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Slots / Week</th>
                <th className="px-4 py-3">Workload Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facultyWorkload.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">
                    No faculty workload records available.
                  </td>
                </tr>
              ) : (
                facultyWorkload.map((fw) => {
                  const maxSlots = 20;
                  const pct = Math.min(100, Math.round((fw.assignedSlots / maxSlots) * 100));
                  return (
                    <tr key={fw.teacherId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{fw.name}</td>
                      <td className="px-4 py-3 text-slate-500">{fw.department}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{fw.assignedSlots} slots</td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-brand-600 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
