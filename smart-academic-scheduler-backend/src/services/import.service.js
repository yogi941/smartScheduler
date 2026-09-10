const csvParser = require('csv-parser');
const ExcelJS = require('exceljs');
const stream = require('stream');
const { Teacher, Room, Laboratory, Subject, Department } = require('../models');
const ApiError = require('../utils/ApiError');

async function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function parseExcelBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  const results = [];

  if (!worksheet) return results;

  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value ? String(cell.value).trim() : `col${colNumber}`;
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const rowObj = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        rowObj[header] = cell.value ? String(cell.value).trim() : '';
      }
    });
    if (Object.keys(rowObj).length > 0) {
      results.push(rowObj);
    }
  });

  return results;
}

async function importBatchData({ entityType, fileBuffer, fileMimetype, fileName }) {
  let rows = [];
  if (fileName.endsWith('.csv') || fileMimetype === 'text/csv') {
    rows = await parseCsvBuffer(fileBuffer);
  } else if (
    fileName.endsWith('.xlsx') ||
    fileMimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    rows = await parseExcelBuffer(fileBuffer);
  } else {
    throw ApiError.badRequest('Unsupported file format. Please upload a .csv or .xlsx file.');
  }

  let importedCount = 0;

  if (entityType === 'TEACHERS') {
    const defaultDept = await Department.findOne({ isActive: true });
    for (const row of rows) {
      const name = row.name || row.Name || row.teacherName;
      const email = row.email || row.Email;
      if (name && email) {
        // eslint-disable-next-line no-await-in-loop
        await Teacher.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              name,
              email: email.toLowerCase(),
              department: defaultDept ? defaultDept._id : null,
              isActive: true,
            },
          },
          { upsert: true }
        );
        importedCount += 1;
      }
    }
  } else if (entityType === 'ROOMS') {
    for (const row of rows) {
      const roomNumber = row.roomNumber || row.RoomNumber || row.room;
      const capacity = Number(row.capacity || row.Capacity || 40);
      if (roomNumber) {
        // eslint-disable-next-line no-await-in-loop
        await Room.updateOne(
          { roomNumber },
          { $set: { roomNumber, capacity, isActive: true } },
          { upsert: true }
        );
        importedCount += 1;
      }
    }
  } else if (entityType === 'LABS') {
    for (const row of rows) {
      const labName = row.labName || row.LabName || row.name;
      const capacity = Number(row.capacity || row.Capacity || 30);
      if (labName) {
        // eslint-disable-next-line no-await-in-loop
        await Laboratory.updateOne(
          { labName },
          { $set: { labName, capacity, isActive: true } },
          { upsert: true }
        );
        importedCount += 1;
      }
    }
  } else if (entityType === 'SUBJECTS') {
    for (const row of rows) {
      const code = row.code || row.Code || row.subjectCode;
      const name = row.name || row.Name || row.subjectName;
      const type = row.type || row.Type || 'LECTURE';
      if (code && name) {
        // eslint-disable-next-line no-await-in-loop
        await Subject.updateOne(
          { code: code.toUpperCase() },
          {
            $set: {
              code: code.toUpperCase(),
              name,
              type: type.toUpperCase() === 'LAB' ? 'LAB' : 'LECTURE',
              isActive: true,
            },
          },
          { upsert: true }
        );
        importedCount += 1;
      }
    }
  } else {
    throw ApiError.badRequest(`Invalid entity type: ${entityType}`);
  }

  return { importedCount, totalRows: rows.length };
}

module.exports = { importBatchData };
