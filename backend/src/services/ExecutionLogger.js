import { Execution } from '../models/Execution.js';
import { ExecutionStep } from '../models/ExecutionStep.js';
import { Workflow } from '../models/Workflow.js';

export class ExecutionLogger {
  /**
   * Initialize a new execution record
   */
  static async startExecution({ workflowId, ownerId, triggerType = 'manual', triggerPayload = {} }) {
    let workflowName = 'Untitled Workflow';
    try {
      const wf = await Workflow.findById(workflowId).select('name');
      if (wf && wf.name) workflowName = wf.name;
    } catch {
      // Ignore if workflow lookup fails
    }

    const execution = await Execution.create({
      workflow: workflowId,
      workflowName,
      owner: ownerId,
      triggerType,
      triggerPayload,
      status: 'running',
      startedAt: new Date(),
    });

    return execution;
  }

  /**
   * Helper to format raw step log object prior to DB write
   */
  static createStepLog(currentNode, status, duration, input, output = null, error = null) {
    return {
      nodeId: currentNode.id,
      nodeName: currentNode.data?.label || currentNode.name || currentNode.id,
      nodeType: currentNode.type,
      status,
      duration,
      input,
      output: output || {},
      error: error ? { message: error.message || String(error), stack: error.stack } : null,
      retryAttempts: [],
    };
  }

  /**
   * Record a single step execution
   */
  static async logStep(executionId, stepData) {
    const {
      nodeId,
      nodeName = '',
      nodeType,
      status,
      duration = 0,
      input = {},
      output = {},
      error = null,
      retryAttempts = [],
      logs = [],
    } = stepData;

    try {
      const finishedAt = new Date();
      const startedAt = new Date(finishedAt.getTime() - duration);

      const retrySummary = {
        totalAttempts: retryAttempts.length || 1,
        recovered: status === 'recovered',
        finalError: error ? (error.message || String(error)) : null,
      };

      const stepRecord = await ExecutionStep.create({
        executionId,
        nodeId,
        nodeName,
        nodeType,
        status,
        startedAt,
        finishedAt,
        duration,
        input,
        output,
        error,
        retryAttempts,
        retrySummary,
        logs,
      });

      // Atomically push step ID and summary log to main Execution document
      await Execution.findByIdAndUpdate(executionId, {
        $push: {
          steps: stepRecord._id,
          logs: {
            nodeId,
            nodeName,
            nodeType,
            status,
            duration,
            input,
            output,
            error,
            retryAttempts,
            timestamp: finishedAt,
          },
        },
        $inc: { nodesExecuted: 1 },
      });

      return stepRecord;
    } catch (err) {
      console.error(`[ExecutionLogger]: Error logging step ${nodeId} for execution ${executionId}:`, err);
    }
  }

  /**
   * Finalize execution run record with final status, output, and duration
   */
  static async finishExecution(executionId, { status = 'success', output = {}, error = null }) {
    try {
      const execution = await Execution.findById(executionId);
      if (!execution) return null;

      const finishedAt = new Date();
      const startedAt = execution.startedAt || finishedAt;
      const duration = Math.max(0, finishedAt.getTime() - startedAt.getTime());

      const updateFields = {
        status,
        finishedAt,
        duration,
        output,
      };

      if (error) {
        updateFields.error = {
          message: error.message || String(error),
          stack: error.stack || '',
          nodeId: error.nodeId || null,
        };
      }

      const updated = await Execution.findByIdAndUpdate(executionId, { $set: updateFields }, { new: true });
      return updated;
    } catch (err) {
      console.error(`[ExecutionLogger]: Error finishing execution ${executionId}:`, err);
    }
  }
}
