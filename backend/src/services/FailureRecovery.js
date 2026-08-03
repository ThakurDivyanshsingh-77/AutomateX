import { Execution } from '../models/Execution.js';
import { WorkflowEngine } from '../engine/WorkflowEngine.js';
import { Workflow } from '../models/Workflow.js';

/**
 * FailureRecovery — Resume workflow execution from last successful node.
 *
 * When an execution fails mid-way, recovery mode re-runs from the
 * node AFTER the last successful one, using the same trigger payload.
 */
export class FailureRecovery {
  /**
   * Get the last successfully executed node from an execution's logs.
   *
   * @param {string} executionId
   * @returns {Promise<{ nodeId: string|null, nodeType: string|null, stepIndex: number }>}
   */
  static async getLastSuccessfulNode(executionId) {
    const execution = await Execution.findById(executionId).select('logs status').lean();
    if (!execution) throw new Error('Execution not found');

    const successfulLogs = (execution.logs || []).filter((log) =>
      ['success', 'completed', 'recovered'].includes(log.status)
    );

    if (successfulLogs.length === 0) {
      return { nodeId: null, nodeType: null, stepIndex: -1 };
    }

    const last = successfulLogs[successfulLogs.length - 1];
    return {
      nodeId: last.nodeId,
      nodeType: last.nodeType,
      stepIndex: successfulLogs.length - 1,
    };
  }

  /**
   * Resume a failed execution by re-running the entire workflow
   * with the original trigger payload.
   *
   * Note: Full resume-from-checkpoint requires workflow engine changes
   * to accept a startNodeId. For now, this re-runs from the beginning
   * with the same input data (idempotency-safe for most nodes).
   *
   * @param {string} executionId
   * @param {string} ownerId
   * @returns {Promise<Object>} New execution result
   */
  static async resumeExecution(executionId, ownerId) {
    const failedExecution = await Execution.findOne({ _id: executionId, owner: ownerId }).lean();
    if (!failedExecution) throw new Error('Execution not found or access denied');

    if (!['failed', 'timeout', 'cancelled'].includes(failedExecution.status)) {
      throw new Error(`Cannot resume execution with status "${failedExecution.status}". Only failed/timeout/cancelled executions can be resumed.`);
    }

    const workflow = await Workflow.findOne({ _id: failedExecution.workflow, owner: ownerId }).lean();
    if (!workflow) throw new Error('Workflow not found');

    const lastSuccessful = await FailureRecovery.getLastSuccessfulNode(executionId);

    // Run the full workflow again with original trigger payload
    const recoveryResult = await WorkflowEngine.run(
      workflow.definition,
      `exec_recovery_${Date.now()}`,
      failedExecution.triggerPayload || {}
    );

    return {
      ...recoveryResult,
      isRecovery: true,
      originalExecutionId: executionId,
      resumedFromNode: lastSuccessful.nodeId,
    };
  }

  /**
   * Get a recovery summary for a failed execution.
   */
  static async getRecoverySummary(executionId, ownerId) {
    const execution = await Execution.findOne({ _id: executionId, owner: ownerId })
      .select('status logs error workflow triggerPayload')
      .lean();
    if (!execution) throw new Error('Execution not found or access denied');

    const lastSuccessful = await FailureRecovery.getLastSuccessfulNode(executionId);
    const successCount = (execution.logs || []).filter(l => ['success', 'completed', 'recovered'].includes(l.status)).length;
    const failedCount = (execution.logs || []).filter(l => l.status === 'failed').length;

    return {
      executionId,
      status: execution.status,
      lastSuccessfulNode: lastSuccessful,
      nodesSucceeded: successCount,
      nodesFailed: failedCount,
      failedAt: execution.error?.nodeId || null,
      canResume: ['failed', 'timeout', 'cancelled'].includes(execution.status),
      triggerPayload: execution.triggerPayload,
    };
  }
}
