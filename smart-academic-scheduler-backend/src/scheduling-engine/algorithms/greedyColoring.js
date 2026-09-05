const MaxHeap = require('../dataStructures/MaxHeap');

function isColorValidForVertex(vertex, color, graph, assignment, forbidden, registry) {
  if (!registry.isTeacherFree(vertex.teacherId, color.colorKey)) {
    return false;
  }
  if (!registry.isBatchFree(vertex.batchId, color.colorKey)) {
    return false;
  }

  const teacherForbidden = forbidden.teacher.get(vertex.teacherId);
  if (teacherForbidden && teacherForbidden.has(color.colorKey)) {
    return false;
  }

  const batchForbidden = forbidden.batch.get(vertex.batchId);
  if (batchForbidden && batchForbidden.has(color.colorKey)) {
    return false;
  }

  const neighbors = graph.neighbors(vertex.id);
  for (const neighborId of neighbors) {
    const neighborColor = assignment.get(neighborId);
    if (neighborColor && neighborColor.colorKey === color.colorKey) {
      return false;
    }
  }

  return true;
}

function greedyColorGraph({ vertices, graph, colorsByType, forbidden, registry }) {
  const heap = new MaxHeap((a, b) => graph.degree(a.id) - graph.degree(b.id));
  vertices.forEach((vertex) => heap.push(vertex));

  const assignment = new Map();
  const unresolved = [];

  while (!heap.isEmpty()) {
    const vertex = heap.pop();
    const palette = colorsByType[vertex.slotType] || [];

    let chosenColor = null;
    for (const color of palette) {
      if (isColorValidForVertex(vertex, color, graph, assignment, forbidden, registry)) {
        chosenColor = color;
        break;
      }
    }

    if (chosenColor) {
      assignment.set(vertex.id, chosenColor);
      registry.bookTeacher(vertex.teacherId, chosenColor.colorKey);
      registry.bookBatch(vertex.batchId, chosenColor.colorKey);
    } else {
      unresolved.push(vertex);
    }
  }

  return { assignment, unresolved };
}

module.exports = { greedyColorGraph, isColorValidForVertex };
