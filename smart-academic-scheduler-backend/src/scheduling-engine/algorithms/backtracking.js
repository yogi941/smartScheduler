const { isColorValidForVertex } = require('./greedyColoring');

const DEFAULT_MAX_DEPTH = 3;

function getConflictingNeighborIds(vertex, color, graph, assignment) {
  const conflicting = [];
  for (const neighborId of graph.neighbors(vertex.id)) {
    const neighborColor = assignment.get(neighborId);
    if (neighborColor && neighborColor.colorKey === color.colorKey) {
      conflicting.push(neighborId);
    }
  }
  return conflicting;
}

function commitColor(vertex, color, assignment, registry) {
  assignment.set(vertex.id, color);
  registry.bookTeacher(vertex.teacherId, color.colorKey);
  registry.bookBatch(vertex.batchId, color.colorKey);
}

function releaseColor(vertex, color, assignment, registry) {
  assignment.delete(vertex.id);
  registry.releaseTeacher(vertex.teacherId, color.colorKey);
  registry.releaseBatch(vertex.batchId, color.colorKey);
}

function backtrackAssign({
  vertex,
  vertexMap,
  graph,
  assignment,
  colorsByType,
  forbidden,
  registry,
  depth = 0,
  maxDepth = DEFAULT_MAX_DEPTH,
  reserved = new Set(),
}) {
  const fullPalette = colorsByType[vertex.slotType] || [];
  const palette = fullPalette.filter((color) => !reserved.has(color.colorKey));

  for (const color of palette) {
    if (isColorValidForVertex(vertex, color, graph, assignment, forbidden, registry)) {
      commitColor(vertex, color, assignment, registry);
      return true;
    }
  }

  if (depth >= maxDepth) {
    return false;
  }

  for (const color of palette) {
    const teacherForbidden = forbidden.teacher.get(vertex.teacherId);
    const batchForbidden = forbidden.batch.get(vertex.batchId);
    const isHardBlocked =
      (teacherForbidden && teacherForbidden.has(color.colorKey)) ||
      (batchForbidden && batchForbidden.has(color.colorKey));

    if (isHardBlocked) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const conflictingIds = getConflictingNeighborIds(vertex, color, graph, assignment);
    if (conflictingIds.length === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const conflictingVertices = conflictingIds.map((id) => vertexMap.get(id));
    const savedColors = conflictingVertices.map((v) => assignment.get(v.id));

    conflictingVertices.forEach((v, idx) => releaseColor(v, savedColors[idx], assignment, registry));

    const nextReserved = new Set(reserved);
    nextReserved.add(color.colorKey);

    const relocated = conflictingVertices.every((v) =>
      backtrackAssign({
        vertex: v,
        vertexMap,
        graph,
        assignment,
        colorsByType,
        forbidden,
        registry,
        depth: depth + 1,
        maxDepth,
        reserved: nextReserved,
      })
    );

    if (relocated) {
      commitColor(vertex, color, assignment, registry);
      return true;
    }

    conflictingVertices.forEach((v, idx) => commitColor(v, savedColors[idx], assignment, registry));
  }

  return false;
}

module.exports = { backtrackAssign, getConflictingNeighborIds, commitColor, releaseColor };
