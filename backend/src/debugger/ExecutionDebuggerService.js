import { Execution } from '../models/Execution.js';
import { Workflow } from '../models/Workflow.js';
import { ExecutionSnapshot } from './ExecutionSnapshot.js';
import mongoose from 'mongoose';

export class ExecutionDebuggerService {
  /**
   * Get Debug Snapshot by Execution ID
   */
  static async getDebugSnapshot(executionId) {
    let executionRecord = null;
    let workflowRecord = null;

    if (mongoose.connection.readyState === 1) {
      executionRecord = await Execution.findById(executionId).populate('workflow', 'name version');
      if (executionRecord && executionRecord.workflow) {
        workflowRecord = executionRecord.workflow;
      }
    }

    if (!executionRecord) {
      // Mock snapshot for development testing
      executionRecord = {
        _id: executionId,
        workflow: 'wf_demo_101',
        status: 'success',
        duration: 1250,
        nodesExecuted: 4,
        startedAt: new Date(Date.now() - 2000),
        finishedAt: new Date(),
        logs: [
          {
            nodeId: 'n_webhook_1',
            nodeName: 'Webhook Trigger',
            nodeType: 'webhook',
            status: 'success',
            duration: 15,
            input: { trigger: { body: { name: 'Divyansh', email: 'divyansh@gmail.com' }, method: 'POST', ip: '127.0.0.1' } },
            output: { trigger: { body: { name: 'Divyansh', email: 'divyansh@gmail.com' }, method: 'POST', ip: '127.0.0.1' } },
            timestamp: new Date(Date.now() - 1900),
          },
          {
            nodeId: 'n_http_1',
            nodeName: 'HTTP Request',
            nodeType: 'http',
            status: 'success',
            duration: 450,
            input: { url: 'https://api.example.com/users', method: 'GET' },
            output: { statusCode: 200, statusText: 'OK', data: { id: 101, name: 'Divyansh' } },
            timestamp: new Date(Date.now() - 1400),
          },
          {
            nodeId: 'n_cond_1',
            nodeName: 'IF Status Equals 200',
            nodeType: 'condition',
            status: 'success',
            duration: 10,
            input: { left: '{{http.statusCode}}', operator: 'equals', right: '200' },
            output: { result: true, selectedBranch: 'true', leftRaw: '{{http.statusCode}}', leftResolved: 200, operator: 'equals', rightRaw: '200', rightResolved: 200 },
            timestamp: new Date(Date.now() - 900),
          },
          {
            nodeId: 'n_gmail_1',
            nodeName: 'Gmail Send Email',
            nodeType: 'gmail',
            status: 'success',
            duration: 750,
            input: { to: 'divyansh@gmail.com', subject: 'Welcome {{http.data.name}}', body: 'Order #{{http.data.id}} confirmed' },
            output: { provider: 'gmail', status: 'SENT', messageId: '18ab4d8d90ef', threadId: '18ab4d8d90ef', recipient: 'divyansh@gmail.com', subject: 'Welcome Divyansh' },
            timestamp: new Date(Date.now() - 100),
          },
        ],
      };
      workflowRecord = { _id: 'wf_demo_101', name: 'User Signup Automation', version: 1 };
    }

    return ExecutionSnapshot.createSnapshot(executionRecord, workflowRecord);
  }

  /**
   * Search and filter execution history
   */
  static async searchExecutions(userId, query = {}) {
    const { status, workflowId, search, limit = 50 } = query;

    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    const filter = { owner: userId };
    if (status) filter.status = status;
    if (workflowId) filter.workflow = workflowId;

    const executions = await Execution.find(filter)
      .populate('workflow', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    if (search) {
      const term = search.toLowerCase();
      return executions.filter(
        (exec) =>
          exec._id.toString().includes(term) ||
          (exec.workflow?.name && exec.workflow.name.toLowerCase().includes(term)) ||
          exec.status.toLowerCase().includes(term)
      );
    }

    return executions;
  }

  /**
   * Delete execution record
   */
  static async deleteExecution(userId, executionId) {
    if (mongoose.connection.readyState === 1) {
      await Execution.deleteOne({ _id: executionId, owner: userId });
    }
    return { success: true, message: 'Execution history deleted' };
  }
}
