import cron from 'node-cron';
import cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
import { Workflow } from '../../models/Workflow.js';
import { Execution } from '../../models/Execution.js';
import { RuntimeManager } from '../RuntimeManager.js';
import mongoose from 'mongoose';

/**
 * CronScheduler — Production-Grade Background Scheduler Engine.
 *
 * Automatically manages scheduled cron jobs for all published workflows.
 * Features:
 * - Automatic startup & DB Published Workflow reload on boot
 * - Dynamic register/unregister/update on publish/unpublish/delete
 * - Overlap protection (skips execution if workflow is already running)
 * - Timezone support (e.g. Asia/Kolkata, America/New_York, UTC)
 * - Health metrics & status reporting
 */
export class CronScheduler {
  static isRunning = false;
  static startedAt = null;

  // Active Cron Task Map: workflowId -> { task, workflowId, workflowName, cronExpression, timezone, nextRun, lastRun, runCount, totalFailures }
  static activeJobs = new Map();

  /**
   * Initialize and start the background Cron Scheduler.
   */
  static async start() {
    if (this.isRunning) {
      console.log('⏰ [CronScheduler]: Already running.');
      return;
    }

    this.isRunning = true;
    this.startedAt = new Date();
    console.log('⏰ [CronScheduler]: Enterprise Cron Scheduler Service started.');

    // Reload all published workflows with cron triggers from DB
    await this.reloadPublishedWorkflows();
  }

  /**
   * Stop all active cron schedules.
   */
  static stop() {
    for (const [workflowId, job] of this.activeJobs.entries()) {
      if (job.task) {
        job.task.stop();
      }
    }
    this.activeJobs.clear();
    this.isRunning = false;
    console.log('⏰ [CronScheduler]: Scheduler stopped. All active cron tasks destroyed.');
  }

  /**
   * Query database for published workflows containing cron triggers and register them.
   */
  static async reloadPublishedWorkflows() {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⏰ [CronScheduler]: DB not connected yet, skipping initial workflow reload.');
      return;
    }

    try {
      const publishedWorkflows = await Workflow.find({ status: 'published' }).lean();
      console.log(`⏰ [CronScheduler]: Scanning ${publishedWorkflows.length} published workflows for cron triggers...`);

      let registeredCount = 0;
      for (const workflow of publishedWorkflows) {
        const cronNode = (workflow.definition?.nodes || []).find((n) => n.type === 'cron');
        if (cronNode) {
          const success = this.registerWorkflow(workflow);
          if (success) registeredCount++;
        }
      }

      console.log(`⏰ [CronScheduler]: Successfully registered ${registeredCount} published cron workflow(s).`);
    } catch (err) {
      console.error('⏰ [CronScheduler]: Error reloading published workflows:', err.message);
    }
  }

  /**
   * Register or update a workflow schedule.
   *
   * @param {Object} workflow - Workflow document (lean or Mongoose model)
   * @returns {boolean} Success status
   */
  static registerWorkflow(workflow) {
    if (!workflow || !workflow._id) return false;
    const workflowId = workflow._id.toString();

    // 1. Unregister existing job if present
    this.unregisterWorkflow(workflowId);

    // 2. Locate Cron Trigger node in workflow definition
    const cronNode = (workflow.definition?.nodes || []).find((n) => n.type === 'cron');
    if (!cronNode) {
      return false; // Not a cron workflow
    }

    const config = cronNode.config || cronNode.data?.config || {};
    const cronExpression = (config.cronExpression || '0 9 * * *').trim();
    const timezone = config.timezone || 'UTC';
    const enabled = config.enabled !== false;

    if (!enabled) {
      console.log(`⏰ [CronScheduler]: Workflow "${workflow.name}" (${workflowId}) cron trigger is disabled. Skipping.`);
      return false;
    }

    // 3. Validate Cron Expression
    if (!this.isValidCron(cronExpression)) {
      console.error(`⏰ [CronScheduler]: Invalid cron expression "${cronExpression}" for workflow "${workflow.name}". Registration aborted.`);
      return false;
    }

    // 4. Calculate next execution time
    let nextRunDate = null;
    try {
      const interval = cronParser.parseExpression(cronExpression, { tz: timezone });
      nextRunDate = interval.next().toDate();
    } catch (e) {
      // Ignore calculation error
    }

    // 5. Schedule background job using node-cron
    const cronOptions = timezone ? { timezone } : {};
    const task = cron.schedule(
      cronExpression,
      async () => {
        await this.executeWorkflow(workflowId, workflow);
      },
      cronOptions
    );

    // 6. Save job metadata to active map
    this.activeJobs.set(workflowId, {
      task,
      workflowId,
      workflowName: workflow.name || 'Untitled Workflow',
      cronExpression,
      timezone,
      humanReadable: this.getHumanReadable(cronExpression),
      registeredAt: new Date(),
      nextRun: nextRunDate,
      lastRun: null,
      runCount: 0,
      totalFailures: 0,
    });

    console.log(
      `⏰ [CronScheduler]: Workflow Registered: "${workflow.name}" (${workflowId}) | Schedule: "${cronExpression}" (${this.getHumanReadable(cronExpression)}) | Timezone: ${timezone} | Next Run: ${nextRunDate ? nextRunDate.toISOString() : 'N/A'}`
    );

    return true;
  }

  /**
   * Unregister / stop a workflow schedule.
   *
   * @param {string} workflowId
   */
  static unregisterWorkflow(workflowId) {
    if (!workflowId) return;
    const idStr = workflowId.toString();

    if (this.activeJobs.has(idStr)) {
      const job = this.activeJobs.get(idStr);
      if (job.task) job.task.stop();
      this.activeJobs.delete(idStr);
      console.log(`⏰ [CronScheduler]: Workflow Unregistered: "${job.workflowName}" (${idStr})`);
    }
  }

  /**
   * Trigger scheduled execution for a workflow with overlap protection.
   */
  static async executeWorkflow(workflowId, preloadedWorkflow = null) {
    const idStr = workflowId.toString();
    const job = this.activeJobs.get(idStr);

    console.log(`⏰ [CronScheduler]: Triggering scheduled execution for workflow ${idStr}...`);

    try {
      // 1. Fetch current workflow from DB
      let workflow = preloadedWorkflow;
      if (mongoose.connection.readyState === 1) {
        workflow = await Workflow.findById(idStr).lean();
      }

      if (!workflow || workflow.status !== 'published') {
        console.warn(`⏰ [CronScheduler]: Workflow ${idStr} is no longer published. Unregistering.`);
        this.unregisterWorkflow(idStr);
        return;
      }

      // 2. Overlap Protection: Check if a previous execution is currently running
      if (mongoose.connection.readyState === 1) {
        const runningCount = await Execution.countDocuments({
          workflow: workflow._id,
          status: { $in: ['running', 'queued', 'pending'] },
        });

        if (runningCount > 0) {
          console.warn(`⏰ [CronScheduler]: [Overlap Protection] Workflow "${workflow.name}" is currently executing (${runningCount} active). Skipping this run.`);
          return;
        }
      }

      // 3. Trigger execution through RuntimeManager (Routes through Queue → Worker → History)
      const triggerPayload = {
        cronEvent: true,
        source: 'scheduler',
        timestamp: new Date().toISOString(),
      };

      const result = await RuntimeManager.triggerExecution('cron', workflow, triggerPayload);

      // 4. Update job metrics
      if (job) {
        job.lastRun = new Date();
        job.runCount = (job.runCount || 0) + 1;

        // Recalculate next run date
        try {
          const interval = cronParser.parseExpression(job.cronExpression, { tz: job.timezone });
          job.nextRun = interval.next().toDate();
        } catch (e) {}
      }

      console.log(`⏰ [CronScheduler]: Scheduled execution enqueued cleanly (Execution ID: ${result.executionId})`);
    } catch (err) {
      console.error(`⏰ [CronScheduler]: Error executing scheduled workflow ${idStr}:`, err.message);
      if (job) job.totalFailures = (job.totalFailures || 0) + 1;
    }
  }

  /**
   * Validate a cron expression.
   */
  static isValidCron(cronExpression) {
    if (!cronExpression || typeof cronExpression !== 'string') return false;
    return cron.validate(cronExpression.trim());
  }

  /**
   * Get human readable schedule string (e.g. "Every 20 minutes").
   */
  static getHumanReadable(cronExpression) {
    try {
      return cronstrue.toString(cronExpression.trim());
    } catch (e) {
      return cronExpression;
    }
  }

  /**
   * Get full status report for health monitoring API.
   */
  static getStatus() {
    const jobsList = Array.from(this.activeJobs.values()).map((job) => ({
      workflowId: job.workflowId,
      workflowName: job.workflowName,
      cronExpression: job.cronExpression,
      timezone: job.timezone,
      humanReadable: job.humanReadable,
      registeredAt: job.registeredAt,
      nextRun: job.nextRun,
      lastRun: job.lastRun,
      runCount: job.runCount,
      totalFailures: job.totalFailures,
    }));

    const uptimeMs = this.startedAt ? Date.now() - this.startedAt.getTime() : 0;

    return {
      running: this.isRunning,
      startedAt: this.startedAt,
      uptimeSeconds: Math.floor(uptimeMs / 1000),
      registeredJobsCount: this.activeJobs.size,
      jobs: jobsList,
    };
  }
}
