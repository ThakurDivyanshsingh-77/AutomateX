import { GitHubDailyActivityService } from '../github/GitHubDailyActivityService.js';

export class GitHubDailyActivityCommitExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const userId = context.userId || context.user || context.ownerId || null;

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

    try {
      const result = await GitHubDailyActivityService.executeActivityCommit(config, userId);
      console.log(`[GitHubDailyActivityCommitExecutor] ✅ Completed successfully. Committed: ${result.committed}`);
      return result;
    } catch (err) {
      console.error(`[GitHubDailyActivityCommitExecutor] ❌ Execution failed for node ${node.id}:`, err.message);

      const errorObj = {
        code: err.code || 'GITHUB_ACTIVITY_ERROR',
        message: err.message,
        status: err.statusCode || err.status || 500,
      };

      throw new Error(`GitHub Daily Activity Commit failed [${errorObj.code}]: ${errorObj.message}`);
    }
  }
}
