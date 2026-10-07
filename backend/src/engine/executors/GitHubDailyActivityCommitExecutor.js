import { GitHubDailyActivityService } from '../github/GitHubDailyActivityService.js';

export class GitHubDailyActivityCommitExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const userId = context.userId || context.user || context.ownerId || null;
    const executionId = context.executionId || context.execution?.id || 'exec_manual';
    const workflowId = context.workflow?.id || context.workflowId || 'wf_manual';

    console.log(`[GitHubDailyActivityCommitExecutor] 🚀 Executing Daily Activity Commit for node: ${node.id}`);

    // Loop protection: skip if triggered by an AutomateX sync or activity commit
    const triggerData = context.initialPayload?.data || context.initialPayload || {};
    const commitMessage = triggerData.head_commit?.message || triggerData.message || '';
    const sender = triggerData.sender?.login || triggerData.pusher?.name || '';
    if (commitMessage.includes('[automatex-sync]') || sender === 'AutomateX Bot') {
      console.log(`[GitHubDailyActivityCommitExecutor] 🛑 Loop protection triggered: Skipping activity commit triggered by previous AutomateX commit.`);
      return {
        success: true,
        changed: false,
        committed: false,
        skipped: true,
        reason: 'Loop protection: Triggered by previous AutomateX commit',
      };
    }

    // Timezone inheritance: inherit from workflow trigger if not explicitly set
    const effectiveTimezone = config.timezone || triggerData.timezone || context.initialPayload?.timezone || 'UTC';
    const executionConfig = {
      ...config,
      timezone: effectiveTimezone,
      executionId,
      workflowId,
      nodeId: node.id,
    };

    try {
      const result = await GitHubDailyActivityService.executeActivityCommit(executionConfig, userId);
      console.log(`[GitHubDailyActivityCommitExecutor] ✅ Completed successfully. Committed: ${result.committed}`);
      return result;
    } catch (err) {
      console.error(`[GitHubDailyActivityCommitExecutor] ❌ Execution failed for node ${node.id}:`, err.message);

      const errorCode = err.errorCode || err.code || 'GITHUB_ACTIVITY_ERROR';
      const statusCode = err.statusCode || err.status || 500;

      const formattedError = new Error(`GitHub Daily Activity Commit failed [${errorCode}]: ${err.message}`);
      formattedError.code = errorCode;
      formattedError.errorCode = errorCode;
      formattedError.statusCode = statusCode;
      formattedError.details = {
        success: false,
        changed: false,
        committed: false,
        errorCode,
        message: err.message,
      };

      throw formattedError;
    }
  }
}

