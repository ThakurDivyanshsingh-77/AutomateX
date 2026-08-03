import { Workflow } from '../models/Workflow.js';
import { Execution } from '../models/Execution.js';
import { WorkflowEngine } from '../engine/WorkflowEngine.js';
import mongoose from 'mongoose';

// Fallback in-memory execution store for DB offline mode
const inMemoryExecutions = [];

export const executionService = {
  runWorkflow: async (ownerId, workflowId) => {
    let workflow = null;
    let executionRecord = null;

    if (mongoose.connection.readyState === 1) {
      workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
      if (!workflow) throw new Error('Workflow not found or access denied');

      executionRecord = await Execution.create({
        workflow: workflow._id,
        owner: ownerId,
        status: 'running',
        startedAt: new Date(),
      });
    } else {
      workflow = {
        _id: workflowId,
        owner: ownerId,
        name: 'Demo Workflow',
        definition: {
          nodes: [
            { id: 'n1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' } },
            { id: 'n2', type: 'http', position: { x: 350, y: 100 }, data: { label: 'HTTP Request', config: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1' } } },
            { id: 'n3', type: 'delay', position: { x: 600, y: 100 }, data: { label: 'Delay 1s', config: { seconds: 1 } } },
            { id: 'n4', type: 'log', position: { x: 850, y: 100 }, data: { label: 'Log Output', config: { message: 'Workflow finished successfully' } } },
            { id: 'n5', type: 'end', position: { x: 1100, y: 100 }, data: { label: 'End Completion' } },
          ],
          edges: [
            { id: 'e1', source: 'n1', target: 'n2' },
            { id: 'e2', source: 'n2', target: 'n3' },
            { id: 'e3', source: 'n3', target: 'n4' },
            { id: 'e4', source: 'n4', target: 'n5' },
          ],
        },
      };

      executionRecord = {
        _id: 'exec_' + Date.now(),
        workflow: workflowId,
        owner: ownerId,
        status: 'running',
        startedAt: new Date(),
        logs: [],
      };
      inMemoryExecutions.unshift(executionRecord);
    }

    try {
      // Invoke Standalone Execution Engine
      const engineResult = await WorkflowEngine.run(
        workflow.definition,
        executionRecord._id.toString()
      );

      const finishedAt = new Date();

      if (mongoose.connection.readyState === 1) {
        executionRecord.status = engineResult.status;
        executionRecord.duration = engineResult.duration;
        executionRecord.nodesExecuted = engineResult.nodesExecuted;
        executionRecord.logs = engineResult.logs;
        executionRecord.output = engineResult.output;
        executionRecord.error = engineResult.error;
        executionRecord.finishedAt = finishedAt;

        await executionRecord.save();
        return executionRecord;
      } else {
        executionRecord.status = engineResult.status;
        executionRecord.duration = engineResult.duration;
        executionRecord.nodesExecuted = engineResult.nodesExecuted;
        executionRecord.logs = engineResult.logs;
        executionRecord.output = engineResult.output;
        executionRecord.error = engineResult.error;
        executionRecord.finishedAt = finishedAt;
        return executionRecord;
      }
    } catch (err) {
      if (mongoose.connection.readyState === 1 && executionRecord) {
        executionRecord.status = 'failed';
        executionRecord.error = { message: err.message, stack: err.stack };
        executionRecord.finishedAt = new Date();
        await executionRecord.save();
      }
      throw err;
    }
  },

  getUserExecutions: async (ownerId) => {
    if (mongoose.connection.readyState === 1) {
      return await Execution.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .populate('workflow', 'name status');
    }
    return inMemoryExecutions;
  },

  getExecutionById: async (ownerId, executionId) => {
    if (mongoose.connection.readyState === 1) {
      return await Execution.findOne({ _id: executionId, owner: ownerId }).populate('workflow', 'name status');
    }
    return inMemoryExecutions.find((e) => e._id === executionId) || null;
  },

  getWorkflowExecutions: async (ownerId, workflowId) => {
    if (mongoose.connection.readyState === 1) {
      return await Execution.find({ workflow: workflowId, owner: ownerId })
        .sort({ createdAt: -1 })
        .limit(20);
    }
    return inMemoryExecutions.filter((e) => e.workflow === workflowId);
  },
};
