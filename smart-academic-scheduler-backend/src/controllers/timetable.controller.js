const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const timetableService = require('../services/timetable.service');
const { Timetable } = require('../models');
const { generateTimetablePdf } = require('../export/timetablePdfExporter');
const { generateTimetableExcel } = require('../export/timetableExcelExporter');
const { generateTimetableCsv } = require('../export/timetableCsvExporter');

const EXPORT_POPULATE_PATHS = [
  'batch',
  'semester',
  'entries.timeSlot',
  'entries.subject',
  'entries.teacher',
  'entries.room',
  'entries.laboratory',
];

async function loadPopulatedTimetableForExport(id) {
  let query = Timetable.findById(id);
  EXPORT_POPULATE_PATHS.forEach((path) => {
    query = query.populate(path);
  });
  const timetable = await query;

  if (!timetable) {
    throw ApiError.notFound('Timetable not found');
  }

  return timetable;
}

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.batch) {
    filter.batch = req.query.batch;
  }
  if (req.query.semester) {
    filter.semester = req.query.semester;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.academicYear) {
    filter.academicYear = req.query.academicYear;
  }

  const { page, limit, sort } = req.query;
  const { data, meta } = await timetableService.list({ page, limit, filter, sort });
  return ApiResponse.ok(res, data, 'Timetable list fetched successfully', meta);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await timetableService.getById(req.params.id);
  return ApiResponse.ok(res, doc, 'Timetable fetched successfully');
});

const generate = asyncHandler(async (req, res) => {
  const { batchIds, academicYear } = req.body;

  const result = await timetableService.generate({
    batchIds,
    academicYear,
    createdBy: req.user._id || req.user.id,
  });

  const message =
    result.conflictCount > 0
      ? `Timetable(s) generated with ${result.conflictCount} unresolved conflict(s) requiring review`
      : 'Timetable(s) generated successfully with zero conflicts';

  return ApiResponse.created(res, result, message);
});

const publish = asyncHandler(async (req, res) => {
  const doc = await timetableService.publish(req.params.id, req.user);
  return ApiResponse.ok(res, doc, 'Timetable published successfully');
});

const archive = asyncHandler(async (req, res) => {
  const doc = await timetableService.archive(req.params.id, req.user);
  return ApiResponse.ok(res, doc, 'Timetable archived successfully');
});

const moveEntry = asyncHandler(async (req, res) => {
  const doc = await timetableService.moveEntry(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, doc, 'Timetable entry moved successfully');
});

const rollback = asyncHandler(async (req, res) => {
  const doc = await timetableService.rollback(req.params.id, req.body, req.user);
  return ApiResponse.ok(
    res,
    doc,
    `Timetable successfully rolled back to version ${req.body.targetVersion}`
  );
});

const getVersionHistory = asyncHandler(async (req, res) => {
  const history = await timetableService.getVersionHistory(req.params.id);
  return ApiResponse.ok(res, history, 'Timetable version history fetched');
});

const exportPdf = asyncHandler(async (req, res) => {
  const timetable = await loadPopulatedTimetableForExport(req.params.id);
  const pdfBuffer = await generateTimetablePdf(timetable);

  const fileName =
    `timetable-${timetable.batch?.batchName || timetable.id}-v${timetable.version}.pdf`
      .replace(/\s+/g, '-')
      .toLowerCase();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  return res.send(pdfBuffer);
});

const exportExcel = asyncHandler(async (req, res) => {
  const timetable = await loadPopulatedTimetableForExport(req.params.id);
  const excelBuffer = await generateTimetableExcel(timetable);

  const fileName =
    `timetable-${timetable.batch?.batchName || timetable.id}-v${timetable.version}.xlsx`
      .replace(/\s+/g, '-')
      .toLowerCase();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  return res.send(excelBuffer);
});

const exportCsv = asyncHandler(async (req, res) => {
  const timetable = await loadPopulatedTimetableForExport(req.params.id);
  const csvContent = generateTimetableCsv(timetable);

  const fileName =
    `timetable-${timetable.batch?.batchName || timetable.id}-v${timetable.version}.csv`
      .replace(/\s+/g, '-')
      .toLowerCase();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  return res.send(csvContent);
});

module.exports = {
  list,
  getById,
  generate,
  publish,
  archive,
  moveEntry,
  rollback,
  getVersionHistory,
  exportPdf,
  exportExcel,
  exportCsv,
};
