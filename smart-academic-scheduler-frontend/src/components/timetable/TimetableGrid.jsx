import { useState } from 'react';
import api from '../../api/client';
import VersionHistoryModal from './VersionHistoryModal';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function TimetableGrid({ timetable, onTimetableUpdated }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [moving, setMoving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  if (!timetable || !timetable.entries) {
    return <p className="text-slate-500">No timetable data selected.</p>;
  }

  const entriesByDay = {};
  DAYS.forEach((d) => {
    entriesByDay[d] = [];
  });

  timetable.entries.forEach((entry, originalIdx) => {
    if (entry.day && entriesByDay[entry.day]) {
      entriesByDay[entry.day].push({ ...entry, originalIdx });
    }
  });

  const handleDragStart = (e, originalIdx) => {
    e.dataTransfer.setData('text/plain', String(originalIdx));
    setDraggedIndex(originalIdx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetDay) => {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/plain');
    const entryIdx = Number(idxStr);
    if (isNaN(entryIdx) || moving) return;

    const sourceEntry = timetable.entries[entryIdx];
    if (sourceEntry.day === targetDay) return;

    setMoving(true);
    try {
      await api.put(`/timetables/${timetable._id}/move-entry`, {
        entryIndex: entryIdx,
        newDay: targetDay,
      });
      if (onTimetableUpdated) onTimetableUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to move entry');
    } finally {
      setMoving(false);
      setDraggedIndex(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get(`/timetables/${timetable._id}/export/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timetable-${timetable._id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV export');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action bar for timetable versioning, export, and conflict stats */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
            Version {timetable.version || 1}
          </span>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              timetable.conflictCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {timetable.conflictCount > 0 ? `⚠️ ${timetable.conflictCount} Conflict(s)` : '✅ Zero Conflicts'}
          </span>
          {moving && <span className="text-xs text-brand-600 animate-pulse font-semibold">Updating slot...</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionHistory(true)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📜 Version History & Rollback
          </button>
          <button
            onClick={handleExportCsv}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Grid with Drag and Drop */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-6 gap-4 min-w-[750px]">
          {DAYS.map((day) => (
            <div
              key={day}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className="flex flex-col gap-3 rounded-xl bg-slate-50/50 p-2 min-h-[300px] border border-dashed border-transparent hover:border-brand-300 transition-colors"
            >
              <div className="rounded-lg bg-slate-100 py-2 text-center text-xs font-bold tracking-wider text-slate-700">
                {day}
              </div>
              <div className="flex flex-col gap-2">
                {entriesByDay[day].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">
                    Drag slot here
                  </div>
                ) : (
                  entriesByDay[day].map((item) => (
                    <div
                      key={item.originalIdx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.originalIdx)}
                      className={`cursor-grab active:cursor-grabbing flex flex-col gap-1.5 rounded-xl border p-3 text-xs shadow-xs transition-all hover:shadow-md ${
                        item.slotType === 'LAB'
                          ? 'border-purple-200 bg-purple-50 text-purple-950 hover:border-purple-300'
                          : 'border-brand-200 bg-brand-50 text-brand-950 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{item.subject?.name || item.subject?.code || 'Subject'}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                            item.slotType === 'LAB'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-brand-200 text-brand-800'
                          }`}
                        >
                          {item.slotType}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate">
                        👨‍🏫 {item.teacher?.name || 'Teacher'}
                      </p>
                      <p className="text-slate-600 truncate">
                        📍 {item.room?.roomNumber || item.laboratory?.labName || 'Room/Lab'}
                      </p>
                      {item.timeSlot && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          ⏰ {item.timeSlot.startTime} - {item.timeSlot.endTime}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <VersionHistoryModal
        timetableId={timetable._id}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onRollbackSuccess={onTimetableUpdated}
      />
    </div>
  );
}

export default TimetableGrid;
