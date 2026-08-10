import { Workflow } from '../../models/Workflow.js';
import { DiscordGatewayManager } from '../../discord/client/DiscordGatewayManager.js';
import mongoose from 'mongoose';

/**
 * DiscordTriggerScheduler — Background Real-time Gateway Subscription Scheduler.
 * 
 * Automatically manages active WebSocket Gateway subscriptions for all published
 * workflows containing Discord Message Received trigger nodes.
 */
export class DiscordTriggerScheduler {
  static isRunning = false;

  /**
   * Check if a workflow node is a Discord Message Received trigger node.
   */
  static isDiscordTriggerNode(node) {
    if (!node) return false;
    const type = String(node.type || node.data?.type || '').toLowerCase();
    return (
      type === 'discordmessagereceived' ||
      type === 'discordmessagereceivedtrigger' ||
      type === 'discord_message_received'
    );
  }

  /**
   * Start the Discord Trigger Scheduler service.
   */
  static async start() {
    if (this.isRunning) {
      console.log('[Discord Trigger] Gateway connected and scheduler service already running.');
      return;
    }

    this.isRunning = true;
    console.log('[Discord Trigger] Gateway connected and scheduler service started.');
    await this.reloadPublishedWorkflows();
  }

  /**
   * Scan MongoDB database for active published workflows containing Discord trigger nodes.
   */
  static async reloadPublishedWorkflows() {
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Discord Trigger] DB not connected, skipping workflow reload.');
      return;
    }

    try {
      const publishedWorkflows = await Workflow.find({
        status: { $in: ['published', 'active'] },
      }).lean();

      console.log(`[Discord Trigger] Scanning ${publishedWorkflows.length} active workflow(s) for Discord triggers...`);

      let registeredCount = 0;
      for (const workflow of publishedWorkflows) {
        const nodes = workflow.definition?.nodes || [];
        const triggerNode = nodes.find((n) => this.isDiscordTriggerNode(n));
        if (triggerNode) {
          const success = this.registerWorkflow(workflow);
          if (success) registeredCount++;
        }
      }

      console.log(`[Discord Trigger] Successfully registered ${registeredCount} active Discord Gateway trigger(s).`);
    } catch (err) {
      console.error('[Discord Trigger] Error reloading published workflows:', err.message);
    }
  }

  /**
   * Register a single workflow with DiscordGatewayManager.
   */
  static registerWorkflow(workflow) {
    if (!workflow || !workflow._id) return false;

    const nodes = workflow.definition?.nodes || [];
    const triggerNode = nodes.find((n) => this.isDiscordTriggerNode(n));

    if (!triggerNode) return false;

    const config = triggerNode.data?.config || triggerNode.config || {};
    const credentialId = config.credentialId;
    const ownerId = String(workflow.owner || workflow.ownerId || '');

    if (!credentialId) {
      console.warn(`[Discord Trigger] Workflow "${workflow.name}" (${workflow._id}) has Discord trigger but missing credentialId.`);
      return false;
    }

    DiscordGatewayManager.subscribeWorkflow({
      workflowId: String(workflow._id),
      credentialId: String(credentialId),
      config,
      ownerId,
    });

    return true;
  }

  /**
   * Unregister a workflow from DiscordGatewayManager.
   */
  static unregisterWorkflow(workflowId) {
    if (workflowId) {
      DiscordGatewayManager.unsubscribeWorkflow(String(workflowId));
    }
  }
}
