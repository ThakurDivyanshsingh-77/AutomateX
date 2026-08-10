import { DiscordGatewayManager } from '../client/DiscordGatewayManager.js';
import { credentialService } from '../../credentials/credentialService.js';

export class DiscordMessageReceivedService {
  /**
   * Subscribe active workflow to Discord Gateway.
   */
  static async activateTrigger(ownerId, credentialId, workflowId, config = {}) {
    if (!ownerId || !credentialId || !workflowId) {
      throw new Error('[DiscordMessageReceivedService] Missing ownerId, credentialId, or workflowId');
    }

    await DiscordGatewayManager.subscribeWorkflow({
      workflowId: String(workflowId),
      credentialId: String(credentialId),
      config,
      ownerId: String(ownerId),
    });

    return {
      success: true,
      message: 'Discord Gateway trigger activated successfully',
    };
  }

  /**
   * Deactivate workflow subscription from Discord Gateway.
   */
  static deactivateTrigger(workflowId) {
    if (workflowId) {
      DiscordGatewayManager.unsubscribeWorkflow(String(workflowId));
    }
    return { success: true };
  }

  /**
   * Handle "Test Trigger" call from UI.
   */
  static async testTrigger(ownerId, credentialId, config = {}) {
    if (!ownerId || !credentialId) {
      throw new Error('Discord credential ID and user context are required for testing trigger.');
    }

    // Verify credential access securely
    const credInfo = await credentialService.getCredentialForExecution(credentialId, ownerId);
    if (!credInfo || !credInfo.secret) {
      throw new Error('Discord credential authentication failed.');
    }

    // Ensure Gateway connection is initiated
    await DiscordGatewayManager.ensureConnection(credentialId, ownerId);

    // Return sample mock payload for testing in builder
    return {
      success: true,
      message: 'Discord Gateway trigger connection verified.',
      sampleOutput: {
        message: {
          id: '123456789012345678',
          content: config.prompt || 'hello AutomateX',
          channelId: config.channelId || '987654321098765432',
          guildId: config.guildId || '112233445566778899',
          author: {
            id: '554433221122334455',
            username: 'discord_user',
            bot: false,
          },
        },
        content: config.prompt || 'hello AutomateX',
        channelId: config.channelId || '987654321098765432',
        guildId: config.guildId || '112233445566778899',
        author: {
          id: '554433221122334455',
          username: 'discord_user',
          bot: false,
        },
        id: '123456789012345678',
      },
    };
  }
}
