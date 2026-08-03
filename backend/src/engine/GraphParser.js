/**
 * GraphParser parses React Flow nodes & edges to validate DAG structure
 * and calculate node execution dependency ordering (topological sort).
 */
export class GraphParser {
  static parse(nodes, edges) {
    if (!nodes || nodes.length === 0) {
      throw new Error('Workflow contains no nodes');
    }

    const adjacencyList = new Map();
    const inDegree = new Map();

    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source).push(edge.target);
      }
      if (inDegree.has(edge.target)) {
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // Find trigger / start nodes (in-degree === 0)
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    if (queue.length === 0) {
      throw new Error('Invalid Workflow: Cycle detected or missing initial trigger node.');
    }

    // Topological Sort (Kahn's Algorithm)
    const sortedNodeIds = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      sortedNodeIds.push(currentId);

      const neighbors = adjacencyList.get(currentId) || [];
      for (const neighborId of neighbors) {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      }
    }

    if (sortedNodeIds.length !== nodes.length) {
      throw new Error('Invalid Workflow Graph: Circular reference / cycle detected in connections.');
    }

    // Map sorted IDs back to original node objects
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const sortedNodes = sortedNodeIds.map(id => nodeMap.get(id));

    return {
      sortedNodes,
      adjacencyList,
      edges
    };
  }
}
