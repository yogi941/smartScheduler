class ConflictGraph {
  constructor() {
    this.adjacency = new Map();
  }

  addVertex(vertexId) {
    if (!this.adjacency.has(vertexId)) {
      this.adjacency.set(vertexId, new Set());
    }
  }

  addEdge(vertexIdA, vertexIdB) {
    if (vertexIdA === vertexIdB) {
      return;
    }
    this.addVertex(vertexIdA);
    this.addVertex(vertexIdB);
    this.adjacency.get(vertexIdA).add(vertexIdB);
    this.adjacency.get(vertexIdB).add(vertexIdA);
  }

  neighbors(vertexId) {
    return this.adjacency.get(vertexId) || new Set();
  }

  degree(vertexId) {
    return this.neighbors(vertexId).size;
  }

  vertexIds() {
    return Array.from(this.adjacency.keys());
  }

  hasEdge(vertexIdA, vertexIdB) {
    return this.adjacency.has(vertexIdA) && this.adjacency.get(vertexIdA).has(vertexIdB);
  }
}

function buildConflictGraph(vertices) {
  const graph = new ConflictGraph();
  vertices.forEach((vertex) => graph.addVertex(vertex.id));

  const byTeacher = new Map();
  const byBatch = new Map();

  vertices.forEach((vertex) => {
    if (!byTeacher.has(vertex.teacherId)) {
      byTeacher.set(vertex.teacherId, []);
    }
    byTeacher.get(vertex.teacherId).push(vertex.id);

    if (!byBatch.has(vertex.batchId)) {
      byBatch.set(vertex.batchId, []);
    }
    byBatch.get(vertex.batchId).push(vertex.id);
  });

  const connectGroup = (group) => {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        graph.addEdge(group[i], group[j]);
      }
    }
  };

  byTeacher.forEach(connectGroup);
  byBatch.forEach(connectGroup);

  return graph;
}

module.exports = { ConflictGraph, buildConflictGraph };
