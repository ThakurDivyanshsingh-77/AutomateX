export class ExecutionContext {
  constructor(initialPayload = {}) {
    this.initialPayload = initialPayload;
    this.nodeOutputs = new Map();
    this.lastNodeId = null;
  }

  setNodeOutput(nodeId, data) {
    this.nodeOutputs.set(nodeId, data);
    this.lastNodeId = nodeId;
  }

  getNodeOutput(nodeId) {
    return this.nodeOutputs.get(nodeId);
  }

  getLastStepOutput() {
    return this.lastNodeId ? this.nodeOutputs.get(this.lastNodeId) : this.initialPayload;
  }

  getAllOutputs() {
    const obj = {
      $initial: this.initialPayload,
    };
    for (const [nodeId, output] of this.nodeOutputs.entries()) {
      obj[nodeId] = output;
    }
    return obj;
  }

  getValueByPath(pathStr) {
    if (!pathStr) return undefined;

    // Handle initial payload shortcut
    if (pathStr.startsWith('$initial.')) {
      return this.resolvePath(this.initialPayload, pathStr.replace('$initial.', ''));
    }

    // Handle last step shortcut
    if (pathStr.startsWith('$prev.')) {
      return this.resolvePath(this.getLastStepOutput(), pathStr.replace('$prev.', ''));
    }

    // Handle nodeId dot path (e.g. node_123.data.id)
    const parts = pathStr.split('.');
    const nodeId = parts[0];
    const restPath = parts.slice(1).join('.');

    if (this.nodeOutputs.has(nodeId)) {
      const output = this.nodeOutputs.get(nodeId);
      return restPath ? this.resolvePath(output, restPath) : output;
    }

    // Try resolving directly against last output
    return this.resolvePath(this.getLastStepOutput(), pathStr);
  }

  resolvePath(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }
}
