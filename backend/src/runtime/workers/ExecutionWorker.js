import { Execution } from '../../models/Execution.js';
import { Workflow } from '../../models/Workflow.js';
import { WorkflowEngine } from '../../engine/WorkflowEngine.js';
import { TimeoutManager } from '../timeout/TimeoutManager.js';
import { RetryManager } from '../retry/RetryManager.js';
import mongoose from 'mongoose';

export class ExecutionWorker {
  static async processJob(jobData) {
    const { executionId, workflowId, ownerId, triggerEvent } = jobData;
    console.log(`[ExecutionWorker]: Processing job for execution ${executionId}...`);

    let execution = null;
    let workflow = null;

    if (mongoose.connection.readyState === 1) {
      execution = await Execution.findById(executionId);
      workflow = await Workflow.findById(workflowId);
    }

    if (!execution && mongoose.connection.readyState === 1) {
      throw new Error(`Execution record ${executionId} not found`);
    }

    if (!workflow && mongoose.connection.readyState === 1) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const definition = workflow?.definition || jobData.definition;
    if (!definition) {
      throw new Error(`Workflow definition missing for execution ${executionId}`);
    }

    const initialPayload = triggerEvent || jobData.triggerPayload || {};
    const startTime = Date.now();

    try {
      // Execute engine with 30s Timeout Cap and 3 Max Retries
      const engineResult = await TimeoutManager.runWithTimeout(
        RetryManager.executeWithRetry(async (attempt) => {
          return await WorkflowEngine.run(definition, executionId, initialPayload);
        })
      );

      const durationMs = Date.now() - startTime;

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(executionId)) {
        await Execution.findByIdAndUpdate(executionId, {
          $set: {
            status: engineResult.status,
            duration: durationMs,
            nodesExecuted: engineResult.nodesExecuted,
            logs: engineResult.logs,
            output: engineResult.output,
            error: engineResult.error,
            finishedAt: new Date(),
          },
        });
      }

      console.log(`[ExecutionWorker]: Completed job ${executionId} in ${durationMs}ms - Status: ${engineResult.status}`);
      return engineResult;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      console.error(`[ExecutionWorker]: Job ${executionId} failed: ${err.message}`);

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(executionId)) {
        await Execution.findByIdAndUpdate(executionId, {
          $set: {
            status: 'failed',
            duration: durationMs,
            error: { message: err.message, stack: err.stack },
            finishedAt: new Date(),
          },
        });
      }

      throw err;
    }
  }
}
