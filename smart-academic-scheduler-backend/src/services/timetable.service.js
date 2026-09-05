const createCrudService = require('./base.service');
const timetableRepository = require('../repositories/timetable.repository');
const { generateTimetables } = require('../scheduling-engine/SchedulingEngine');
const ApiError = require('../utils/ApiError');
const { Timetable } = require('../models');
const { TIMETABLE_STATUS } = require('../models/Timetable.model');

const readOnlyService = createCrudService({
  repository: timetableRepository,
  entityName: 'Timetable',
  populate: [
    'batch',
    'semester',
    'entries.timeSlot',
    'entries.subject',
    'entries.teacher',
    'entries.room',
    'entries.laboratory',
  ],
});

async function generate({ batchIds, academicYear, createdBy }) {
  return generateTimetables({ batchIds, academicYear, createdBy });
}

async function publish(id) {
  const timetable = await Timetable.findById(id);
  if (!timetable) {
    throw ApiError.notFound('Timetable not found');
  }

  if (timetable.conflictCount > 0) {
    throw ApiError.badRequest(
      `Cannot publish a timetable with ${timetable.conflictCount} unresolved conflict(s). Resolve them and regenerate first.`
    );
  }

  timetable.status = TIMETABLE_STATUS.PUBLISHED;
  timetable.publishedAt = new Date();
  await timetable.save();

  return timetable;
}

async function archive(id) {
  const timetable = await Timetable.findById(id);
  if (!timetable) {
    throw ApiError.notFound('Timetable not found');
  }

  timetable.status = TIMETABLE_STATUS.ARCHIVED;
  await timetable.save();

  return timetable;
}

module.exports = {
  list: readOnlyService.list,
  getById: readOnlyService.getById,
  generate,
  publish,
  archive,
};
