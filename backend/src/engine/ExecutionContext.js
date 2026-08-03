import { getValueByPath } from './expression/helpers.js';

export class ExecutionContext {
  constructor(initialPayload = {}, executionId = null) {
    // Handle parameter ordering flexibility
    if (typeof initialPayload === 'string' && !executionId) {
      executionId = initialPayload;
      initialPayload = {};
    }

    this.executionId = executionId;
    this.initialPayload = initialPayload || {};
    this.nodeOutputs = new Map();
    this.lastNodeId = null;

    // Normalize trigger event payload: handle both raw req payload and formattedEvent ({ data: { body: ... } })
    const payloadData = (this.initialPayload && typeof this.initialPayload === 'object' && this.initialPayload.data)
      ? { ...this.initialPayload.data, ...this.initialPayload }
      : (typeof this.initialPayload === 'object' ? { ...this.initialPayload } : {});

    this.currentData = payloadData;
    if (!this.currentData.trigger) {
      this.currentData.trigger = payloadData.body ? payloadData : { body: payloadData };
    }
    this.variables = {};
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

    // Check currentData (trigger payload, body, headers, query)
    if (this.currentData) {
      const res = getValueByPath(this.currentData, pathStr);
      if (res !== undefined) return res;
    }

    // Try resolving directly against last output
    return this.resolvePath(this.getLastStepOutput(), pathStr);
  }

  resolvePath(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }
}
