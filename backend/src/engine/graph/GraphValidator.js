import { TriggerRegistry } from '../../runtime/registry/TriggerRegistry.js';

export class GraphValidator {
  /**
   * Helper to determine if a node is a Trigger node based on node category metadata or TriggerRegistry.
   */
  static isTriggerNode(node) {
    if (!node) return false;
    const category = (node.category || node.data?.category || '').toLowerCase();
    if (category === 'trigger') return true;

    const type = (node.type || '').toLowerCase();
    if (type === 'start' || type === 'trigger') return true;

    return TriggerRegistry.isTrigger(type);
  }

  static validate(parsedWorkflow) {
    const { nodes, edges, nodeMap } = parsedWorkflow;
    const errors = [];

    if (!nodes || nodes.length === 0) {
      return { isValid: false, errors: ['Workflow graph is empty and contains no nodes'] };
    }

    // 1. Locate Trigger Nodes (Start Trigger, Webhook Trigger, Cron Trigger, etc.)
    const triggerNodes = nodes.filter((n) => this.isTriggerNode(n));
    if (triggerNodes.length === 0) {
      errors.push('Workflow must contain at least one Trigger node.');
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
      startNode: triggerNodes[0] ? nodeMap.get(triggerNodes[0].id) : null,
      triggerNodes: triggerNodes.map((n) => nodeMap.get(n.id)),
    };
  }
}
