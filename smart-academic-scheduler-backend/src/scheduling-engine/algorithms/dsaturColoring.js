const { isColorValidForVertex } = require('./greedyColoring');

/**
 * Calculates saturation degree (number of distinct colors assigned to adjacent vertices)
 * and uncolored degree (number of uncolored neighbors) for a vertex.
 */
function getVertexMetrics(vertex, graph, assignment) {
  const neighbors = graph.neighbors(vertex.id);
  const assignedColors = new Set();
  let uncoloredCount = 0;

  for (const neighborId of neighbors) {
    const color = assignment.get(neighborId);
    if (color) {
      assignedColors.add(color.colorKey);
    } else {
      uncoloredCount += 1;
    }
  }

  return {
    saturationDegree: assignedColors.size,
    uncoloredDegree: uncoloredCount,
  };
}

/**
 * Selects the optimal color for a vertex considering hard constraints and
 * faculty workload balancing (distributing faculty load evenly across days).
 */
function selectBestColor(
  vertex,
  palette,
  graph,
  assignment,
  forbidden,
  registry,
  facultyDailyWorkload
) {
  const validColors = [];

  for (const color of palette) {
    if (isColorValidForVertex(vertex, color, graph, assignment, forbidden, registry)) {
      validColors.push(color);
    }
  }

  if (validColors.length === 0) {
    return null;
  }

  // Workload balancing heuristic: pick color on a day where the teacher has minimum load
  let bestColor = validColors[0];
  let minDayLoad = Infinity;

  const { teacherId } = vertex;
  const teacherWorkload = facultyDailyWorkload.get(teacherId) || new Map();

  for (const color of validColors) {
    const { day } = color;
    const currentLoad = teacherWorkload.get(day) || 0;
    if (currentLoad < minDayLoad) {
      minDayLoad = currentLoad;
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * DSATUR (Degree of Saturation) Graph Coloring Algorithm.
 * Dynamically picks the vertex with the maximum saturation degree at each step,
 * breaking ties with uncolored degree and static graph degree.
 */
function dsaturColorGraph({ vertices, graph, colorsByType, forbidden, registry }) {
  const assignment = new Map();
  const unresolved = [];
  const uncoloredSet = new Set(vertices.map((v) => v.id));
  const vertexMap = new Map(vertices.map((v) => [v.id, v]));

  // Track faculty daily workload: Map<teacherId, Map<day, count>>
  const facultyDailyWorkload = new Map();

  while (uncoloredSet.size > 0) {
    let bestVertex = null;
    let maxSat = -1;
    let maxUncoloredDeg = -1;
    let maxStaticDeg = -1;

    for (const vId of uncoloredSet) {
      const v = vertexMap.get(vId);
      const { saturationDegree, uncoloredDegree } = getVertexMetrics(v, graph, assignment);
      const staticDeg = graph.degree(v.id);

      let isBetter = false;
      if (saturationDegree > maxSat) {
        isBetter = true;
      } else if (saturationDegree === maxSat) {
        if (uncoloredDegree > maxUncoloredDeg) {
          isBetter = true;
        } else if (uncoloredDegree === maxUncoloredDeg && staticDeg > maxStaticDeg) {
          isBetter = true;
        }
      }

      if (isBetter) {
        maxSat = saturationDegree;
        maxUncoloredDeg = uncoloredDegree;
        maxStaticDeg = staticDeg;
        bestVertex = v;
      }
    }

    if (!bestVertex) {
      break;
    }

    uncoloredSet.delete(bestVertex.id);

    const palette = colorsByType[bestVertex.slotType] || [];
    const chosenColor = selectBestColor(
      bestVertex,
      palette,
      graph,
      assignment,
      forbidden,
      registry,
      facultyDailyWorkload
    );

    if (chosenColor) {
      assignment.set(bestVertex.id, chosenColor);
      registry.bookTeacher(bestVertex.teacherId, chosenColor.colorKey);
      registry.bookBatch(bestVertex.batchId, chosenColor.colorKey);

      // Record faculty workload
      const { teacherId } = bestVertex;
      if (!facultyDailyWorkload.has(teacherId)) {
        facultyDailyWorkload.set(teacherId, new Map());
      }
      const teacherMap = facultyDailyWorkload.get(teacherId);
      teacherMap.set(chosenColor.day, (teacherMap.get(chosenColor.day) || 0) + 1);
    } else {
      unresolved.push(bestVertex);
    }
  }

  return { assignment, unresolved, facultyDailyWorkload };
}

module.exports = { dsaturColorGraph, getVertexMetrics, selectBestColor };
