import { Execution } from '../models/Execution.js';
import { Workflow } from '../models/Workflow.js';
import { RuntimeManager } from '../runtime/RuntimeManager.js';
import mongoose from 'mongoose';

export class WebhookReplay {
  /**
   * Replay a previous workflow execution using stored trigger logs
   * @param {string} executionId
   */
  static async replay(executionId) {
    if (!executionId) {
      throw new Error('executionId parameter is required for replay');
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
      const err = new Error(`Execution record "${executionId}" not found for replay`);
      err.statusCode = 404;
      throw err;
    }

    if (!workflowRecord) {
      const err = new Error(`Workflow record for execution "${executionId}" not found`);
      err.statusCode = 404;
      throw err;
    }

    // Extract original trigger payload from execution logs or input
    const originalInput = executionRecord.inputData || {};

    const replayedResult = await RuntimeManager.triggerExecution(
      'replay',
      workflowRecord,
      originalInput
    );

    return {
      success: true,
      message: 'Replay request accepted and queued',
      originalExecutionId: executionId,
      replayedExecutionId: replayedResult.executionId,
      workflowId: workflowRecord._id,
      queued: true,
    };
  }
}
