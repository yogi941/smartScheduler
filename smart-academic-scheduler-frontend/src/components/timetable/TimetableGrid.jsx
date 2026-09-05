const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function TimetableGrid({ timetable }) {
  if (!timetable || !timetable.entries) {
    return <p className="text-slate-500">No timetable data selected.</p>;
  }

  const entriesByDay = {};
  DAYS.forEach((d) => {
    entriesByDay[d] = [];
  });

  timetable.entries.forEach((entry) => {
    if (entry.day && entriesByDay[entry.day]) {
      entriesByDay[entry.day].push(entry);
    }
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-6 gap-4 min-w-[700px]">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-3">
            <div className="rounded-lg bg-slate-100 py-2 text-center text-xs font-bold tracking-wider text-slate-600">
              {day}
            </div>
            <div className="flex flex-col gap-2">
              {entriesByDay[day].length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  Free
                </div>
              ) : (
                entriesByDay[day].map((item, idx) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className={`flex flex-col gap-1 rounded-xl border p-3 text-xs shadow-xs transition-shadow hover:shadow-md ${
                      item.slotType === 'LAB'
                        ? 'border-purple-200 bg-purple-50 text-purple-950'
                        : 'border-brand-200 bg-brand-50 text-brand-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{item.subject?.name || item.subject?.code || 'Subject'}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
                          item.slotType === 'LAB'
                            ? 'bg-purple-200 text-purple-800'
                            : 'bg-brand-200 text-brand-800'
                        }`}
                      >
                        {item.slotType}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      👨‍🏫 {item.teacher?.name || 'Teacher assigned'}
                    </p>
                    <p className="text-slate-600">
                      📍 {item.room?.roomNumber || item.laboratory?.labName || 'Room assigned'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimetableGrid;
