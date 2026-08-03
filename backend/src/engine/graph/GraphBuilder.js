export class GraphBuilder {
  static buildAdjacencyList(nodes, edges) {
    const adjacencyList = new Map();

    // Initialize map for all nodes
    nodes.forEach((node) => {
      adjacencyList.set(node.id, []);
    });

    // Populate outgoing target connections for O(1) step lookup
    edges.forEach((edge) => {
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source).push(edge.target);
      }
    });

    return adjacencyList;
  }
}
