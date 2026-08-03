export class GraphValidator {
  static validate(parsedWorkflow) {
    const { nodes, edges, nodeMap } = parsedWorkflow;
    const errors = [];

    if (!nodes || nodes.length === 0) {
      return { isValid: false, errors: ['Workflow graph is empty and contains no nodes'] };
    }

    // 1. Locate Start Node
    const startNodes = nodes.filter((n) => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Workflow must contain at least one Start Trigger node');
    }

    // 2. Validate Edge Target & Source Integrity
    edges.forEach((edge) => {
      if (!nodeMap.has(edge.source)) {
        errors.push(`Edge references missing source node: ${edge.source}`);
      }
      if (!nodeMap.has(edge.target)) {
        errors.push(`Edge references missing target node: ${edge.target}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      startNode: startNodes[0] ? nodeMap.get(startNodes[0].id) : null,
    };
  }
}
