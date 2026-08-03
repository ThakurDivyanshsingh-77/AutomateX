import { Workflow } from '../models/Workflow.js';
import { Execution } from '../models/Execution.js';
import { ExecutionStep } from '../models/ExecutionStep.js';
import { WorkflowEngine } from '../engine/WorkflowEngine.js';
import { DeadLetterQueue } from './DeadLetterQueue.js';
import { NotificationManager } from './NotificationManager.js';
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
        workflowName: workflow.name || 'Untitled Workflow',
        owner: ownerId,
        triggerType: 'manual',
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
        workflowName: workflow.name,
        owner: ownerId,
        triggerType: 'manual',
        status: 'running',
        startedAt: new Date(),
        logs: [],
      };
      inMemoryExecutions.unshift(executionRecord);
    }

    try {
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

        // Phase 11: Enqueue to DLQ + notify if execution permanently failed
        if (engineResult.status === 'failed' && engineResult.error) {
          const failedNodeId = engineResult.error?.nodeId || null;
          const failedLog = (engineResult.logs || []).find(l => l.nodeId === failedNodeId);
          const totalRetries = (failedLog?.retryAttempts || []).length;

          await DeadLetterQueue.enqueue(executionRecord, {
            failedNodeId,
            failedNodeType: failedLog?.nodeType || null,
            error: new Error(engineResult.error.message || 'Workflow execution failed'),
            retryCount: totalRetries,
          }).catch(e => console.error('[DLQ]: enqueue error:', e.message));

          await NotificationManager.notifyFailure(executionRecord, {
            error: new Error(engineResult.error.message || 'Workflow execution failed'),
            failedNodeId,
            failedNodeType: failedLog?.nodeType || null,
            retriesAttempted: totalRetries,
          }).catch(e => console.error('[NotificationManager]: notify error:', e.message));
        }

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

        // Phase 11: DLQ + notification for hard crash
        await DeadLetterQueue.enqueue(executionRecord, { error: err }).catch(() => {});
        await NotificationManager.notifyFailure(executionRecord, { error: err }).catch(() => {});
      }
      throw err;
    }
  },

  getUserExecutions: async (ownerId, query = {}) => {
    if (mongoose.connection.readyState === 1) {
      const page = parseInt(query.page || 1, 10);
      const limit = parseInt(query.limit || 20, 10);
      const skip = (page - 1) * limit;

      const filter = { owner: ownerId };

      if (query.status && query.status !== 'all') {
        filter.status = query.status;
      }
      if (query.triggerType && query.triggerType !== 'all') {
        filter.triggerType = query.triggerType;
      }
      if (query.workflowId) {
        filter.workflow = query.workflowId;
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
          { workflowName: regex },
          { triggerType: regex },
          { status: regex },
        ];
      }

      // Date Range Filters
      if (query.dateFilter) {
        const now = new Date();
        if (query.dateFilter === 'today') {
          const startOfToday = new Date(now.setHours(0, 0, 0, 0));
          filter.createdAt = { $gte: startOfToday };
        } else if (query.dateFilter === 'yesterday') {
          const startOfYesterday = new Date(now.setDate(now.getDate() - 1));
          startOfYesterday.setHours(0, 0, 0, 0);
          const endOfYesterday = new Date(startOfYesterday);
          endOfYesterday.setHours(23, 59, 59, 999);
          filter.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday };
        } else if (query.dateFilter === '7d') {
          const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
          filter.createdAt = { $gte: sevenDaysAgo };
        }
      }

      const total = await Execution.countDocuments(filter);
      const executions = await Execution.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('workflow', 'name status');

      return {
        executions,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      };
    }

    return {
      executions: inMemoryExecutions,
      total: inMemoryExecutions.length,
      page: 1,
      pages: 1,
    };
  },

  getExecutionById: async (ownerId, executionId) => {
    if (mongoose.connection.readyState === 1) {
      const execution = await Execution.findOne({ _id: executionId, owner: ownerId })
        .populate('workflow', 'name status definition')
        .populate('steps');

      if (!execution) return null;

      // If execution has no populated steps in DB, query ExecutionStep directly
      const steps = await ExecutionStep.find({ executionId }).sort({ startedAt: 1 });

      return {
        ...execution.toObject(),
        stepDetails: steps.length > 0 ? steps : (execution.logs || []),
      };
    }
    return inMemoryExecutions.find((e) => e._id === executionId) || null;
  },

  getExecutionStats: async (ownerId) => {
    if (mongoose.connection.readyState === 1) {
      const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

      const stats = await Execution.aggregate([
        { $match: { owner: ownerObjectId } },
        {
          $group: {
            _id: null,
            totalExecutions: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $in: ['$status', ['success', 'completed']] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
            },
            running: {
              $sum: { $cond: [{ $in: ['$status', ['running', 'pending', 'queued']] }, 1, 0] },
            },
            totalDuration: { $sum: '$duration' },
          },
        },
      ]);

      if (!stats || stats.length === 0) {
        return {
          totalExecutions: 0,
          successful: 0,
          failed: 0,
          running: 0,
          averageDuration: 0,
          successRate: 0,
        };
      }

      const res = stats[0];
      const total = res.totalExecutions || 0;
      const successful = res.successful || 0;
      const failed = res.failed || 0;
      const running = res.running || 0;
      const avgDuration = total > 0 ? Math.round(res.totalDuration / total) : 0;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      return {
        totalExecutions: total,
        successful,
        failed,
        running,
        averageDuration: avgDuration,
        successRate,
      };
    }

    return {
      totalExecutions: inMemoryExecutions.length,
      successful: inMemoryExecutions.filter((e) => e.status === 'success').length,
      failed: inMemoryExecutions.filter((e) => e.status === 'failed').length,
      running: inMemoryExecutions.filter((e) => e.status === 'running').length,
      averageDuration: 500,
      successRate: 100,
    };
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
