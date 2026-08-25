import { GitHubSyncReadmeService } from '../github/GitHubSyncReadmeService.js';

export class GitHubSyncReadmeExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const userId = context.userId || context.user || context.ownerId || null;

    console.log(`[GitHubSyncReadmeExecutor] 🚀 Executing GitHub Profile README Sync for node: ${node.id}`);

    // Loop protection check: if the event triggering this execution was an AutomateX commit, skip execution gracefully
    const triggerData = context.initialPayload?.data || context.initialPayload || {};
    const commitMessage = triggerData.head_commit?.message || triggerData.message || '';
    const sender = triggerData.sender?.login || triggerData.pusher?.name || '';
    if (commitMessage.includes('[automatex-sync]') || sender === 'AutomateX Bot') {
      console.log(`[GitHubSyncReadmeExecutor] 🛑 Loop protection triggered: Skipping README sync triggered by previous AutomateX commit.`);
      return {
        success: true,
        changed: false,
        committed: false,
        skipped: true,
        reason: 'Loop protection: Triggered by previous AutomateX sync commit',
      };
    }

    try {
      const result = await GitHubSyncReadmeService.executeSync(config, userId);
      console.log(`[GitHubSyncReadmeExecutor] ✅ Execution completed successfully. Changed: ${result.changed}, Committed: ${result.committed}`);
      return result;
    } catch (err) {
      console.error(`[GitHubSyncReadmeExecutor] ❌ Execution failed for node ${node.id}:`, err.message);
      
      // Return clean structured error object or rethrow with clear error message
      const errorObj = {
        code: err.code || 'GITHUB_SYNC_ERROR',
        message: err.message,
        status: err.statusCode || err.status || 500,
      };

      throw new Error(`GitHub Sync Profile README failed [${errorObj.code}]: ${errorObj.message}`);
    }
  }
}
