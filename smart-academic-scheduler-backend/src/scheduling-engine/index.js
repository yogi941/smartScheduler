const { generateTimetables } = require('./SchedulingEngine');
const { ConflictGraph, buildConflictGraph } = require('./graph/ConflictGraph');
const MaxHeap = require('./dataStructures/MaxHeap');
const ScheduleRegistry = require('./dataStructures/ScheduleRegistry');
const { greedyColorGraph, isColorValidForVertex } = require('./algorithms/greedyColoring');
const { backtrackAssign } = require('./algorithms/backtracking');
const { buildVertices, assignTeacherForSubject } = require('./builders/vertexBuilder');
const { buildColorPalette } = require('./builders/colorBuilder');
const { buildConstraintIndex } = require('./builders/constraintIndexBuilder');

module.exports = {
  generateTimetables,
  ConflictGraph,
  buildConflictGraph,
  MaxHeap,
  ScheduleRegistry,
  greedyColorGraph,
  isColorValidForVertex,
  backtrackAssign,
  buildVertices,
  assignTeacherForSubject,
  buildColorPalette,
  buildConstraintIndex,
};
