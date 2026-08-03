import { GraphParser } from './GraphParser.js';
import { ExecutionContext } from './ExecutionContext.js';
import { executorRegistry } from './ExecutorRegistry.js';
import { ExecutionLog } from '../models/ExecutionLog.js';
import { EXECUTION_STATUS } from '../constants/status.js';
import mongoose from 'mongoose';

export class ExecutionEngine {
  /**
   * Executes a workflow end-to-end
   * @param {Object} workflow - Workflow schema object or plain JS workflow graph ({ _id, nodes, edges })
   * @param {Object} initialPayload - Optional payload passed from trigger/webhook
   * @param {String} triggerType - MANUAL, WEBHOOK, SCHEDULE
   * @param {String} userId - User ID triggering execution
   * @returns {Promise<Object>} Execution summary log
   */
  static async executeWorkflow(workflow, initialPayload = {}, triggerType = 'MANUAL', userId = null) {
    const startTime = new Date();
    let executionLog = null;

    // 1. Create initial log record in DB if connected
    if (mongoose.connection.readyState === 1) {
      executionLog = await ExecutionLog.create({
        workflow: workflow._id,
        user: userId || workflow.user,
        status: EXECUTION_STATUS.RUNNING,
        triggerType,
        startTime,
        stepResults: [],
      });
    } else {
      // In-memory fallback log object
      executionLog = {
        _id: 'log_' + Date.now(),
        workflow: workflow._id || 'demo_wf',
        status: EXECUTION_STATUS.RUNNING,
        triggerType,
        startTime,
        stepResults: [],
      };
    }

    const context = new ExecutionContext(initialPayload);
    const stepResults = [];

    try {
      // 2. Parse DAG and determine execution topological sequence
      const { sortedNodes } = GraphParser.parse(workflow.nodes, workflow.edges);

      // 3. Execute nodes sequentially
      for (const node of sortedNodes) {
        const stepStartTime = Date.now();
        const nodeType = node.type;
        const label = node.data?.label || node.id;

        let outputData = null;
        let stepError = null;
        let stepStatus = EXECUTION_STATUS.RUNNING;

        try {
          const executor = executorRegistry.getExecutor(nodeType);
          outputData = await executor.execute(node, context);
          stepStatus = EXECUTION_STATUS.SUCCESS;
          context.setNodeOutput(node.id, outputData);
        } catch (err) {
          stepStatus = EXECUTION_STATUS.FAILED;
          stepError = err.message || 'Execution error';
          console.error(`[ExecutionEngine] Node [${node.id}] ${nodeType} failed:`, err);
        }

        const stepDurationMs = Date.now() - stepStartTime;

        const stepRecord = {
          nodeId: node.id,
          nodeType,
          label,
          status: stepStatus,
          inputData: context.getLastStepOutput(),
          outputData: outputData || {},
          error: stepError,
          durationMs: stepDurationMs,
          executedAt: new Date(),
        };

        stepResults.push(stepRecord);

        // Update DB log step incrementally if DB is online
        if (mongoose.connection.readyState === 1 && executionLog.save) {
          executionLog.stepResults.push(stepRecord);
          await executionLog.save();
        }

        // If step failed, halt downstream execution
        if (stepStatus === EXECUTION_STATUS.FAILED) {
          throw new Error(`Node execution failed at '${label}' (${node.id}): ${stepError}`);
        }
      }

      // 4. Mark workflow as SUCCESS
      const endTime = new Date();
      const totalDurationMs = endTime.getTime() - startTime.getTime();

      if (mongoose.connection.readyState === 1 && executionLog.save) {
        executionLog.status = EXECUTION_STATUS.SUCCESS;
        executionLog.endTime = endTime;
        executionLog.durationMs = totalDurationMs;
        await executionLog.save();
      } else {
        executionLog.status = EXECUTION_STATUS.SUCCESS;
        executionLog.endTime = endTime;
        executionLog.durationMs = totalDurationMs;
        executionLog.stepResults = stepResults;
      }

      return executionLog;

    } catch (globalError) {
      const endTime = new Date();
      const totalDurationMs = endTime.getTime() - startTime.getTime();

      if (mongoose.connection.readyState === 1 && executionLog.save) {
        executionLog.status = EXECUTION_STATUS.FAILED;
        executionLog.endTime = endTime;
        executionLog.durationMs = totalDurationMs;
        executionLog.errorDetails = globalError.message;
        await executionLog.save();
      } else {
        executionLog.status = EXECUTION_STATUS.FAILED;
        executionLog.endTime = endTime;
        executionLog.durationMs = totalDurationMs;
        executionLog.errorDetails = globalError.message;
        executionLog.stepResults = stepResults;
      }

      return executionLog;
    }
  }
}
