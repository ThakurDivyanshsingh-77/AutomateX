import { ExecutionMetrics } from './ExecutionMetrics.js';
import { ExecutionInspector } from './ExecutionInspector.js';

export class ExecutionSnapshot {
  /**
   * Create a full debug snapshot object from an Execution database record or run object
   */
  static createSnapshot(execution = {}, workflow = {}) {
    const logs = execution.logs || [];

    const timeline = logs.map((log, index) => {
      const inspectedNode = ExecutionInspector.inspectNode(log);
      return {
        stepIndex: index + 1,
        ...inspectedNode,
      };
    });

    const metrics = ExecutionMetrics.calculateMetrics(logs, execution.duration || 0);

    return {
      metadata: {
        executionId: execution._id || execution.executionId,
        workflowId: execution.workflow?._id || execution.workflow || workflow._id,
        workflowName: workflow.name || 'Workflow Execution',
        version: workflow.version || 1,
        startedAt: execution.startedAt || execution.createdAt,
        finishedAt: execution.finishedAt,
        durationMs: execution.duration || 0,
        status: execution.status || 'success',
        nodesExecutedCount: execution.nodesExecuted || logs.length,
        triggeredBy: execution.triggeredBy || 'manual',
      },
      timeline,
      metrics,
      globalOutput: execution.output || {},
      error: execution.error || null,
    };
  }
}
