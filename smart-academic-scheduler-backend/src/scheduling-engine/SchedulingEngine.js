const { StudentBatch, TimeSlot, Room, Laboratory, Constraint, Timetable } = require('../models');
const { buildConflictGraph } = require('./graph/ConflictGraph');
const { buildVertices } = require('./builders/vertexBuilder');
const { buildColorPalette } = require('./builders/colorBuilder');
const { buildConstraintIndex } = require('./builders/constraintIndexBuilder');
const { greedyColorGraph } = require('./algorithms/greedyColoring');
const { backtrackAssign } = require('./algorithms/backtracking');
const ScheduleRegistry = require('./dataStructures/ScheduleRegistry');
const ApiError = require('../utils/ApiError');

function assignPhysicalResources({ vertices, assignment, rooms, laboratories, registry, batchMap }) {
  const failures = [];

  vertices.forEach((vertex) => {
    const color = assignment.get(vertex.id);
    if (!color) {
      return;
    }

    const batch = batchMap.get(vertex.batchId);
    const pool = vertex.slotType === 'LAB' ? laboratories : rooms;
    const resource = pool.find(
      (candidate) =>
        candidate.capacity >= batch.strength && registry.isRoomFree(candidate._id.toString(), color.colorKey)
    );

    if (!resource) {
      failures.push(vertex.id);
      assignment.delete(vertex.id);
      registry.releaseTeacher(vertex.teacherId, color.colorKey);
      registry.releaseBatch(vertex.batchId, color.colorKey);
      return;
    }

    registry.bookRoom(resource._id.toString(), color.colorKey);
    if (vertex.slotType === 'LAB') {
      vertex.laboratoryId = resource._id.toString();
    } else {
      vertex.roomId = resource._id.toString();
    }
  });

  return failures;
}

function groupEntriesByBatch(vertices, assignment) {
  const byBatch = new Map();

  vertices.forEach((vertex) => {
    const color = assignment.get(vertex.id);
    if (!color) {
      return;
    }

    if (!byBatch.has(vertex.batchId)) {
      byBatch.set(vertex.batchId, []);
    }

    byBatch.get(vertex.batchId).push({
      day: color.day,
      timeSlot: color.timeSlotId,
      subject: vertex.subjectId,
      teacher: vertex.teacherId,
      room: vertex.roomId || null,
      laboratory: vertex.laboratoryId || null,
      slotType: vertex.slotType,
    });
  });

  return byBatch;
}

async function generateTimetables({ batchIds, academicYear, createdBy }) {
  const batches = await StudentBatch.find({ _id: { $in: batchIds }, isActive: true }).populate(
    'semester'
  );

  if (batches.length === 0) {
    throw ApiError.badRequest('No active student batches found for the given batchIds');
  }

  const [timeSlots, rooms, laboratories, constraints] = await Promise.all([
    TimeSlot.find({ isActive: true }),
    Room.find({ isActive: true }),
    Laboratory.find({ isActive: true }),
    Constraint.find({ isActive: true }).populate('timeSlot'),
  ]);

  const colorsByType = buildColorPalette(timeSlots);
  const forbidden = buildConstraintIndex(constraints);

  const { vertices, unassignedSubjects } = await buildVertices(batches);

  if (vertices.length === 0) {
    throw ApiError.badRequest(
      'No schedulable subjects were found for the given batches. Check that Subjects exist for their semesters.'
    );
  }

  const vertexMap = new Map(vertices.map((vertex) => [vertex.id, vertex]));
  const batchMap = new Map(batches.map((batch) => [batch._id.toString(), batch]));

  const graph = buildConflictGraph(vertices);
  const registry = new ScheduleRegistry();

  const { assignment, unresolved } = greedyColorGraph({
    vertices,
    graph,
    colorsByType,
    forbidden,
    registry,
  });

  const stillUnresolved = [];
  unresolved.forEach((vertex) => {
    const seated = backtrackAssign({
      vertex,
      vertexMap,
      graph,
      assignment,
      colorsByType,
      forbidden,
      registry,
    });
    if (!seated) {
      stillUnresolved.push(vertex.id);
    }
  });

  const roomFailures = assignPhysicalResources({
    vertices,
    assignment,
    rooms,
    laboratories,
    registry,
    batchMap,
  });

  const totalConflicts = stillUnresolved.length + roomFailures.length + unassignedSubjects.length;
  const entriesByBatch = groupEntriesByBatch(vertices, assignment);

  const timetables = [];
  for (const batch of batches) {
    const batchId = batch._id.toString();
    const entries = entriesByBatch.get(batchId) || [];

    // eslint-disable-next-line no-await-in-loop
    const latest = await Timetable.findOne({
      batch: batch._id,
      semester: batch.semester._id,
      academicYear,
    }).sort('-version');

    const nextVersion = latest ? latest.version + 1 : 1;

    // eslint-disable-next-line no-await-in-loop
    const timetable = await Timetable.create({
      batch: batch._id,
      semester: batch.semester._id,
      academicYear,
      status: 'DRAFT',
      version: nextVersion,
      entries,
      conflictCount: totalConflicts,
      generatedAt: new Date(),
      createdBy,
    });

    timetables.push(timetable);
  }

  return {
    timetables,
    conflictCount: totalConflicts,
    unassignedSubjects,
    unresolvedVertexIds: stillUnresolved,
    roomAllocationFailures: roomFailures,
  };
}

module.exports = { generateTimetables };
