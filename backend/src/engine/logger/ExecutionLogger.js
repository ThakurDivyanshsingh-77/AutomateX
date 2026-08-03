export class ExecutionLogger {
  static createStepLog(node, status, durationMs, inputData, outputData, error = null) {
    return {
      nodeId: node.id,
      nodeName: node.label || node.type,
      nodeType: node.type,
      status, // 'success' | 'failed' | 'skipped'
      duration: durationMs,
      input: inputData || {},
      output: outputData || {},
      error: error ? { message: error.message || String(error), stack: error.stack } : null,
      timestamp: new Date(),
    };
  }
}
