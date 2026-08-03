export class WorkflowParser {
  static parse(workflowDefinition) {
    if (!workflowDefinition) {
      throw new Error('Workflow definition is missing or null');
    }

    const nodes = workflowDefinition.nodes || [];
    const edges = workflowDefinition.edges || [];
    const viewport = workflowDefinition.viewport || { x: 0, y: 0, zoom: 1 };

    // Build fast lookup map by node ID
    const nodeMap = new Map();
    nodes.forEach((node) => {
      nodeMap.set(node.id, {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        config: node.config || node.data?.config || {},
        position: node.position || { x: 0, y: 0 },
      });
    });

    return {
      nodes,
      edges,
      viewport,
      nodeMap,
    };
  }
}
