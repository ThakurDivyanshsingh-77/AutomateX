import { Execution } from '../models/Execution.js';
import { Workflow } from '../models/Workflow.js';
import { RuntimeManager } from '../runtime/RuntimeManager.js';
import mongoose from 'mongoose';

export class ExecutionReplay {
  /**
   * Replay an execution by ID
   */
  static async replay(executionId) {
    if (!executionId) {
      throw new Error('executionId is required for replay');
    }

    let executionRecord = null;
    let workflowRecord = null;

    if (mongoose.connection.readyState === 1) {
      executionRecord = await Execution.findById(executionId);
      if (executionRecord) {
        workflowRecord = await Workflow.findById(executionRecord.workflow);
      }
    }

    if (!executionRecord) {
      const err = new Error(`Execution record "${executionId}" not found`);
      err.statusCode = 404;
      throw err;
    }

    const payloadToReplay = executionRecord.inputData || executionRecord.output || {};

    const result = await RuntimeManager.triggerExecution(
      'replay',
      workflowRecord || { _id: executionRecord.workflow },
      payloadToReplay
    );

    return {
      success: true,
      message: 'Workflow execution replayed successfully',
      originalExecutionId: executionId,
      replayedExecutionId: result.executionId,
      queued: true,
    };
  }
}
