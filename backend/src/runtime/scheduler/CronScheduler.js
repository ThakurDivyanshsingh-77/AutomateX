export class CronScheduler {
  static activeSchedules = new Map();

  static initializeScheduler() {
    console.log('⏰ [CronScheduler]: Background Cron Scheduler initialized.');
  }

  static scheduleWorkflow(workflowId, cronExpression, triggerCallback) {
    console.log(`⏰ [CronScheduler]: Registered cron schedule "${cronExpression}" for workflow ${workflowId}`);
    this.activeSchedules.set(workflowId, { cronExpression, triggerCallback });
  }

  static stopWorkflowSchedule(workflowId) {
    if (this.activeSchedules.has(workflowId)) {
      this.activeSchedules.delete(workflowId);
      console.log(`⏰ [CronScheduler]: Stopped cron schedule for workflow ${workflowId}`);
    }
  }
}
