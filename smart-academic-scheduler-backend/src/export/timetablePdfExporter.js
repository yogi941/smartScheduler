const PDFDocument = require('pdfkit');

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Renders a single Timetable document (populated with batch, semester,
 * and entries.subject/teacher/room/laboratory/timeSlot) into a PDF
 * buffer. Streams into memory rather than to disk, since the controller
 * pipes the result straight back as an HTTP response.
 *
 * @param {object} timetable - a populated Timetable Mongoose document (or plain object)
 * @returns {Promise<Buffer>}
 */
function generateTimetablePdf(timetable) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const batchName = timetable.batch?.batchName || 'Unknown Batch';
    const section = timetable.batch?.section ? ` - Section ${timetable.batch.section}` : '';

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`Timetable: ${batchName}${section}`, { align: 'center' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Academic Year: ${timetable.academicYear}   |   Version: ${timetable.version}   |   Status: ${timetable.status}   |   Conflicts: ${timetable.conflictCount}`,
        { align: 'center' }
      );

    doc.moveDown(1);

    const entriesByDay = WEEK_DAYS.reduce((acc, day) => {
      acc[day] = (timetable.entries || [])
        .filter((entry) => entry.day === day)
        .sort((a, b) => (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || ''));
      return acc;
    }, {});

    WEEK_DAYS.forEach((day) => {
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold').text(day);
      doc.moveDown(0.2);

      const dayEntries = entriesByDay[day];

      if (dayEntries.length === 0) {
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('gray').text('No classes scheduled');
        doc.fillColor('black');
        return;
      }

      dayEntries.forEach((entry) => {
        const time = entry.timeSlot ? `${entry.timeSlot.startTime}-${entry.timeSlot.endTime}` : '';
        const subject = entry.subject?.name || entry.subject?.code || 'Subject';
        const teacher = entry.teacher?.employeeId || 'Teacher';
        const venue = entry.room?.roomNumber || entry.laboratory?.labCode || '—';

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(`${time}   ${subject}   |   ${teacher}   |   ${entry.slotType}   |   ${venue}`);
      });
    });

    doc.end();
  });
}

module.exports = { generateTimetablePdf };
