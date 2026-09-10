function generateTimetableCsv(timetable) {
  const headers = [
    'Day',
    'Time Slot',
    'Slot Type',
    'Subject Code',
    'Subject Name',
    'Teacher Name',
    'Room/Lab',
  ];
  const rows = [headers.join(',')];

  if (timetable && timetable.entries) {
    timetable.entries.forEach((entry) => {
      const day = entry.day || '';
      const timeSlot = entry.timeSlot
        ? `${entry.timeSlot.startTime} - ${entry.timeSlot.endTime}`
        : '';
      const slotType = entry.slotType || 'LECTURE';
      const subjectCode = (entry.subject && entry.subject.code) || '';
      const subjectName =
        entry.subject && entry.subject.name ? `"${entry.subject.name.replace(/"/g, '""')}"` : '';
      const teacherName =
        entry.teacher && entry.teacher.name ? `"${entry.teacher.name.replace(/"/g, '""')}"` : '';

      let roomOrLab = 'N/A';
      if (entry.room) {
        roomOrLab = entry.room.roomNumber;
      } else if (entry.laboratory) {
        roomOrLab = entry.laboratory.labName;
      }

      rows.push(
        [day, timeSlot, slotType, subjectCode, subjectName, teacherName, roomOrLab].join(',')
      );
    });
  }

  return rows.join('\n');
}

module.exports = { generateTimetableCsv };
