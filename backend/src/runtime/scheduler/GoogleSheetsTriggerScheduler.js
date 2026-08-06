import { Workflow } from '../../models/Workflow.js';
import { RuntimeManager } from '../RuntimeManager.js';
import { GoogleSheetsTriggerExecutor } from '../../engine/googleSheets/GoogleSheetsTriggerExecutor.js';
import mongoose from 'mongoose';

/**
 * GoogleSheetsTriggerScheduler — Production-Grade Background Polling Scheduler Engine.
 * 
 * Automatically manages active polling timers for all published workflows containing Google Sheets trigger nodes.
 */
export class GoogleSheetsTriggerScheduler {
  static isRunning = false;
  static startedAt = null;

  // Active Polling Task Map: key = `${workflowId}_${nodeId}` -> { timer, workflowId, nodeId, intervalMs, isPolling, lastPolledAt, runCount }
  static activeJobs = new Map();

  /**
   * Helper to parse polling interval string or number to milliseconds
   */
  static parseIntervalMs(interval) {
    if (!interval) return 30000; // Default 30s
    if (typeof interval === 'number') return Math.max(5000, interval);

    const str = String(interval).trim().toLowerCase();
    if (str === '30s' || str === '30 seconds' || str === '30s') return 30000;
    if (str === '1m' || str === '1 minute') return 60000;
    if (str === '5m' || str === '5 minutes') return 300000;
    if (str === '15m' || str === '15 minutes') return 900000;
    if (str === '30m' || str === '30 minutes') return 1800000;
    if (str === '1h' || str === '1 hour') return 3600000;

    const num = parseInt(str, 10);
    return isNaN(num) ? 30000 : Math.max(5000, num * 1000);
  }

  /**
   * Initialize background Google Sheets Trigger polling service
   */
  static async start() {
    if (this.isRunning) {
      console.log('🟢 [GoogleSheetsTriggerScheduler]: Service already running.');
      return;
    }

    this.isRunning = true;
    this.startedAt = new Date();
    console.log('🟢 [GoogleSheetsTriggerScheduler]: Polling Scheduler Service started.');

    await this.reloadPublishedWorkflows();
  }

  /**
   * Stop all running polling timers
   */
  static stop() {
    for (const [key, job] of this.activeJobs.entries()) {
      if (job.timer) clearInterval(job.timer);
    }
    this.activeJobs.clear();
    this.isRunning = false;
    console.log('🟢 [GoogleSheetsTriggerScheduler]: Stopped all polling jobs.');
  }

  /**
   * Scan DB for published workflows containing Google Sheets trigger nodes
   */
  static async reloadPublishedWorkflows() {
    if (mongoose.connection.readyState !== 1) {
      console.warn('🟢 [GoogleSheetsTriggerScheduler]: DB not connected, skipping reload.');
      return;
    }

    try {
      const publishedWorkflows = await Workflow.find({ status: 'published' }).lean();
      console.log(`🟢 [GoogleSheetsTriggerScheduler]: Scanning ${publishedWorkflows.length} published workflow(s) for Google Sheets triggers...`);

      let registeredCount = 0;
      for (const workflow of publishedWorkflows) {
        const triggerNodes = (workflow.definition?.nodes || []).filter(
          (n) => n.type === 'googleSheetsTrigger' || n.type === 'googleSheetsTriggerWatchRows'
        );
        if (triggerNodes.length > 0) {
          const count = this.registerWorkflow(workflow);
          registeredCount += count;
        }
      }

      console.log(`🟢 [GoogleSheetsTriggerScheduler]: Successfully registered ${registeredCount} Google Sheets polling trigger(s).`);
    } catch (err) {
      console.error('🟢 [GoogleSheetsTriggerScheduler]: Error reloading workflows:', err.message);
    }
  }

  /**
   * Register polling jobs for a workflow's Google Sheets trigger nodes
   */
  static registerWorkflow(workflow) {
    if (!workflow || !workflow._id) return 0;
    const workflowId = workflow._id.toString();

    // First unregister existing jobs for this workflow
    this.unregisterWorkflow(workflowId);

    const triggerNodes = (workflow.definition?.nodes || []).filter(
      (n) => n.type === 'googleSheetsTrigger' || n.type === 'googleSheetsTriggerWatchRows'
    );

    if (triggerNodes.length === 0) return 0;

    let registered = 0;

    for (const node of triggerNodes) {
      const nodeId = node.id;
      const config = node.config || node.data?.config || {};
      const intervalMs = this.parseIntervalMs(config.pollingInterval || config.interval || '30s');
      const jobKey = `${workflowId}_${nodeId}`;

      const jobState = {
        workflowId,
        nodeId,
        workflowName: workflow.name || 'Untitled Workflow',
        config,
        intervalMs,
        isPolling: false,
        lastPolledAt: null,
        runCount: 0,
        timer: null,
      };

      // Set background interval
      jobState.timer = setInterval(async () => {
        await this.executePollTick(jobState, workflow);
      }, intervalMs);

      this.activeJobs.set(jobKey, jobState);
      registered++;

      console.log(`🟢 [GoogleSheetsTriggerScheduler]: Registered Trigger | Workflow: "${workflow.name}" (${workflowId}) | Node: ${nodeId} | Interval: ${intervalMs / 1000}s`);

      // Run initial poll tick asynchronously after small delay (1s)
      setTimeout(() => {
        this.executePollTick(jobState, workflow).catch((err) => {
          console.error(`🟢 [GoogleSheetsTriggerScheduler]: Error during initial poll tick: ${err.message}`);
        });
      }, 1000);
    }

    return registered;
  }

  /**
   * Unregister polling jobs for a given workflow
   */
  static unregisterWorkflow(workflowId) {
    if (!workflowId) return;
    const prefix = `${workflowId.toString()}_`;

    for (const [key, job] of this.activeJobs.entries()) {
      if (key.startsWith(prefix)) {
        if (job.timer) clearInterval(job.timer);
        this.activeJobs.delete(key);
        console.log(`🟢 [GoogleSheetsTriggerScheduler]: Unregistered Google Sheets Trigger job: ${key}`);
      }
    }
  }

  /**
   * Execute single poll tick with overlap protection
   */
  static async executePollTick(jobState, workflowData = null) {
    if (jobState.isPolling) {
      console.warn(`🟢 [GoogleSheetsTriggerScheduler]: [Overlap Protection] Skip poll for ${jobState.workflowId}_${jobState.nodeId}. Previous tick still running.`);
      return;
    }

    jobState.isPolling = true;
    try {
      // Refresh workflow data from DB if available
      let workflow = workflowData;
      if (mongoose.connection.readyState === 1) {
        workflow = await Workflow.findById(jobState.workflowId).lean();
      }

      if (!workflow || workflow.status !== 'published') {
        console.warn(`🟢 [GoogleSheetsTriggerScheduler]: Workflow ${jobState.workflowId} is no longer published. Unregistering job.`);
        this.unregisterWorkflow(jobState.workflowId);
        return;
      }

      const userId = workflow.owner ? workflow.owner.toString() : null;

      // Perform Google Sheets polling tick & change detection
      const pollResult = await GoogleSheetsTriggerExecutor.pollTrigger({
        workflowId: jobState.workflowId,
        nodeId: jobState.nodeId,
        config: jobState.config,
        userId,
      });

      jobState.lastPolledAt = new Date();
      jobState.runCount += 1;

      // If changes were detected, fire workflow execution for each change item
      if (pollResult.success && pollResult.changesDetected > 0) {
        console.log(`🚀 [GoogleSheetsTriggerScheduler]: Firing ${pollResult.changesDetected} workflow execution(s) for Workflow ${jobState.workflowId}`);

        for (const changePayload of pollResult.changes) {
          await RuntimeManager.triggerExecution('googleSheetsTrigger', workflow, changePayload);
        }
      }
    } catch (err) {
      console.error(`🟢 [GoogleSheetsTriggerScheduler]: Polling failed for ${jobState.workflowId}_${jobState.nodeId}: ${err.message}`);
    } finally {
      jobState.isPolling = false;
    }
  }

  /**
   * Status overview
   */
  static getStatus() {
    return {
      running: this.isRunning,
      startedAt: this.startedAt,
      activeJobsCount: this.activeJobs.size,
      jobs: Array.from(this.activeJobs.values()).map((j) => ({
        workflowId: j.workflowId,
        nodeId: j.nodeId,
        workflowName: j.workflowName,
        intervalSeconds: j.intervalMs / 1000,
        lastPolledAt: j.lastPolledAt,
        runCount: j.runCount,
      })),
    };
  }
}
