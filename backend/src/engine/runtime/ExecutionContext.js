export class ExecutionContext {
  constructor(executionId, initialVariables = {}) {
    this.executionId = executionId;
    this.variables = { ...initialVariables };
    this.currentData = {};
    this.nodeOutputs = new Map();
    this.logs = [];
    this.startedAt = new Date();
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
}
