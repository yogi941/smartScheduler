const createCrudService = require('./base.service');
const timetableRepository = require('../repositories/timetable.repository');
const { generateTimetables } = require('../scheduling-engine/SchedulingEngine');
const ApiError = require('../utils/ApiError');
const { Timetable } = require('../models');
const { TIMETABLE_STATUS } = require('../models/Timetable.model');
const { notifyTimetableEvent } = require('./socket.service');
const { logAction } = require('./auditLog.service');
const CacheService = require('./cache.service');

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
  const result = await generateTimetables({ batchIds, academicYear, createdBy });
  await CacheService.flush();
  notifyTimetableEvent('TIMETABLE_GENERATED', { count: result.timetables.length });
  await logAction({
    user: createdBy,
    action: 'TIMETABLE_GENERATE',
    resource: 'Timetable',
    details: { batchIds, conflictCount: result.conflictCount },
  });
  return result;
}

async function publish(id, user) {
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

  await CacheService.del(`timetable_${id}`);
  notifyTimetableEvent('TIMETABLE_PUBLISHED', { timetableId: id });
  await logAction({
    user: user?._id || user,
    action: 'TIMETABLE_PUBLISH',
    resource: 'Timetable',
    details: { timetableId: id },
  });

  return timetable;
}

async function archive(id, user) {
  const timetable = await Timetable.findById(id);
  if (!timetable) {
    throw ApiError.notFound('Timetable not found');
  }

  timetable.status = TIMETABLE_STATUS.ARCHIVED;
  await timetable.save();

  await CacheService.del(`timetable_${id}`);
  notifyTimetableEvent('TIMETABLE_ARCHIVED', { timetableId: id });
  await logAction({
    user: user?._id || user,
    action: 'TIMETABLE_ARCHIVE',
    resource: 'Timetable',
    details: { timetableId: id },
  });

  return timetable;
}

async function moveEntry(
  id,
  { entryIndex, newDay, newTimeSlotId, newRoomId, newLaboratoryId },
  user
) {
  const timetable = await Timetable.findById(id);
  if (!timetable) {
    throw ApiError.notFound('Timetable not found');
  }

  if (entryIndex < 0 || entryIndex >= timetable.entries.length) {
    throw ApiError.badRequest('Invalid entry index');
  }

  const entry = timetable.entries[entryIndex];
  if (newDay) entry.day = newDay;
  if (newTimeSlotId) entry.timeSlot = newTimeSlotId;
  if (newRoomId !== undefined) entry.room = newRoomId || null;
  if (newLaboratoryId !== undefined) entry.laboratory = newLaboratoryId || null;

  // Real-time conflict validation check across published/draft timetables
  const teacherId = entry.teacher ? entry.teacher.toString() : null;
  let hasTeacherConflict = false;

  if (teacherId && newDay && newTimeSlotId) {
    const conflictingOther = await Timetable.findOne({
      _id: { $ne: timetable._id },
      status: { $ne: TIMETABLE_STATUS.ARCHIVED },
      entries: {
        $elemMatch: {
          teacher: teacherId,
          day: newDay,
          timeSlot: newTimeSlotId,
        },
      },
    });
    if (conflictingOther) {
      hasTeacherConflict = true;
    }
  }

  // Recalculate conflict status
  let totalConflicts = 0;
  if (hasTeacherConflict) totalConflicts += 1;

  // Check intra-timetable collisions
  const seenSlots = new Set();
  timetable.entries.forEach((e) => {
    const key = `${e.day}_${e.timeSlot ? e.timeSlot.toString() : ''}`;
    if (seenSlots.has(key)) {
      totalConflicts += 1;
    } else {
      seenSlots.add(key);
    }
  });

  timetable.conflictCount = totalConflicts;
  await timetable.save();

  await CacheService.del(`timetable_${id}`);
  notifyTimetableEvent('TIMETABLE_UPDATED', { timetableId: id, entryIndex, hasTeacherConflict });

  await logAction({
    user: user?._id || user,
    action: 'TIMETABLE_MOVE_ENTRY',
    resource: 'Timetable',
    details: { timetableId: id, entryIndex, newDay, newTimeSlotId, hasTeacherConflict },
  });

  return Timetable.findById(id).populate([
    'batch',
    'semester',
    'entries.timeSlot',
    'entries.subject',
    'entries.teacher',
    'entries.room',
    'entries.laboratory',
  ]);
}

async function rollback(id, { targetVersion }, user) {
  const current = await Timetable.findById(id);
  if (!current) {
    throw ApiError.notFound('Timetable not found');
  }

  const target = await Timetable.findOne({
    batch: current.batch,
    semester: current.semester,
    academicYear: current.academicYear,
    version: targetVersion,
  });

  if (!target) {
    throw ApiError.notFound(
      `Target version ${targetVersion} not found for this timetable schedule`
    );
  }

  const latestVersionDoc = await Timetable.findOne({
    batch: current.batch,
    semester: current.semester,
    academicYear: current.academicYear,
  }).sort('-version');

  const nextVersion = (latestVersionDoc ? latestVersionDoc.version : current.version) + 1;

  const restored = await Timetable.create({
    batch: current.batch,
    semester: current.semester,
    academicYear: current.academicYear,
    status: TIMETABLE_STATUS.DRAFT,
    version: nextVersion,
    entries: target.entries,
    conflictCount: target.conflictCount,
    generatedAt: new Date(),
    createdBy: user?._id || user,
  });

  await CacheService.flush();
  notifyTimetableEvent('TIMETABLE_ROLLED_BACK', {
    timetableId: restored._id,
    targetVersion,
    newVersion: nextVersion,
  });

  await logAction({
    user: user?._id || user,
    action: 'TIMETABLE_ROLLBACK',
    resource: 'Timetable',
    details: { timetableId: id, restoredVersion: targetVersion, newVersion: nextVersion },
  });

  return Timetable.findById(restored._id).populate([
    'batch',
    'semester',
    'entries.timeSlot',
    'entries.subject',
    'entries.teacher',
    'entries.room',
    'entries.laboratory',
  ]);
}

async function getVersionHistory(id) {
  const current = await Timetable.findById(id);
  if (!current) {
    throw ApiError.notFound('Timetable not found');
  }

  const history = await Timetable.find({
    batch: current.batch,
    semester: current.semester,
    academicYear: current.academicYear,
  })
    .sort({ version: -1 })
    .select('version status conflictCount generatedAt createdAt createdBy');

  return history;
}

module.exports = {
  list: readOnlyService.list,
  getById: readOnlyService.getById,
  generate,
  publish,
  archive,
  moveEntry,
  rollback,
  getVersionHistory,
};
