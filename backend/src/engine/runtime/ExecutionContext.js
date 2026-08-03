import { getValueByPath } from '../expression/helpers.js';

export class ExecutionContext {
  constructor(executionId, initialVariables = {}) {
    // Parameter ordering flexibility: handle (executionId, initialVariables) or (initialPayload, executionId)
    if (typeof executionId === 'object' && typeof initialVariables === 'string') {
      const temp = executionId;
      executionId = initialVariables;
      initialVariables = temp;
    }

    this.executionId = executionId || `exec_${Date.now()}`;
    this.initialPayload = (initialVariables && typeof initialVariables === 'object') ? initialVariables : {};
    this.nodeOutputs = new Map();
    this.logs = [];
    this.startedAt = new Date();

    // RAM State for ExpressionEngine resolution
    const payloadData = (this.initialPayload && typeof this.initialPayload === 'object' && this.initialPayload.data)
      ? { ...this.initialPayload.data, ...this.initialPayload }
      : (typeof this.initialPayload === 'object' ? { ...this.initialPayload } : {});

    this.currentData = { ...payloadData };
    if (!this.currentData.trigger) {
      const { trigger, ...cleanPayload } = payloadData;
      this.currentData.trigger = cleanPayload.body ? cleanPayload : { body: cleanPayload };
    }
    this.variables = typeof initialVariables === 'object' ? { ...initialVariables } : {};
  }

  setNodeOutput(nodeId, outputData) {
    this.nodeOutputs.set(nodeId, outputData);
    this.currentData = outputData;
  }

  getNodeOutput(nodeId) {
    return this.nodeOutputs.get(nodeId);
  }

  addLogStep(stepLog) {
    this.logs.push(stepLog);
  }

  getLogs() {
    return this.logs;
  }

  getLastStepOutput() {
    return this.nodeOutputs.size > 0
      ? Array.from(this.nodeOutputs.values()).pop()
      : this.initialPayload;
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

    if (pathStr.startsWith('$initial.')) {
      return this.resolvePath(this.initialPayload, pathStr.replace('$initial.', ''));
    }

    if (pathStr.startsWith('$prev.')) {
      return this.resolvePath(this.getLastStepOutput(), pathStr.replace('$prev.', ''));
    }

    const parts = pathStr.split('.');
    const nodeId = parts[0];
    const restPath = parts.slice(1).join('.');

    if (this.nodeOutputs.has(nodeId)) {
      const output = this.nodeOutputs.get(nodeId);
      return restPath ? this.resolvePath(output, restPath) : output;
    }

    if (this.currentData) {
      const res = getValueByPath(this.currentData, pathStr);
      if (res !== undefined) return res;
    }

    return this.resolvePath(this.getLastStepOutput(), pathStr);
  }

  resolvePath(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }
}
