const ExcelJS = require('exceljs');

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Renders a single Timetable document into an .xlsx workbook buffer.
 * One sheet, rows grouped by day with a bold day-header row, mirroring
 * the same layout as the PDF export for consistency between formats.
 *
 * @param {object} timetable - a populated Timetable Mongoose document (or plain object)
 * @returns {Promise<Buffer>}
 */
async function generateTimetableExcel(timetable) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart Academic Scheduler';
  workbook.created = new Date();

  const batchName = timetable.batch?.batchName || 'Timetable';
  const sheet = workbook.addWorksheet(batchName.substring(0, 31)); // Excel sheet name limit

  sheet.columns = [
    { header: 'Day', key: 'day', width: 12 },
    { header: 'Time', key: 'time', width: 16 },
    { header: 'Subject', key: 'subject', width: 28 },
    { header: 'Teacher', key: 'teacher', width: 18 },
    { header: 'Type', key: 'slotType', width: 12 },
    { header: 'Venue', key: 'venue', width: 14 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E9FF' },
  };

  const titleRow = sheet.insertRow(1, [
    `${batchName} — ${timetable.academicYear} — v${timetable.version} — ${timetable.status}`,
  ]);
  titleRow.font = { bold: true, size: 13 };
  sheet.mergeCells(1, 1, 1, 6);
  sheet.getRow(2).font = { bold: true };

  WEEK_DAYS.forEach((day) => {
    const dayEntries = (timetable.entries || [])
      .filter((entry) => entry.day === day)
      .sort((a, b) => (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || ''));

    if (dayEntries.length === 0) {
      sheet.addRow({
        day,
        time: '',
        subject: 'No classes scheduled',
        teacher: '',
        slotType: '',
        venue: '',
      });
      return;
    }

    dayEntries.forEach((entry, index) => {
      sheet.addRow({
        day: index === 0 ? day : '',
        time: entry.timeSlot ? `${entry.timeSlot.startTime}-${entry.timeSlot.endTime}` : '',
        subject: entry.subject?.name || entry.subject?.code || 'Subject',
        teacher: entry.teacher?.employeeId || 'Teacher',
        slotType: entry.slotType,
        venue: entry.room?.roomNumber || entry.laboratory?.labCode || '—',
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateTimetableExcel };
