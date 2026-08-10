import { credentialService } from '../../credentials/credentialService.js';
import { RuntimeManager } from '../../runtime/RuntimeManager.js';
import { Workflow } from '../../models/Workflow.js';

/**
 * DiscordGatewayManager
 *
 * Server-side singleton managing real-time WebSocket connections to Discord Gateway v10
 * (wss://gateway.discord.gg/?v=10&encoding=json).
 *
 * Features:
 * - One managed Gateway connection per Discord bot credential.
 * - Listens for incoming `MESSAGE_CREATE` events.
 * - Performs intent check (Opcode 4014 handling for missing MESSAGE_CONTENT intent).
 * - Deduplicates incoming messages (max 1000 IDs, 10 min TTL).
 * - Ignores bot messages by default (`ignoreBotMessages !== false`) to prevent infinite loops.
 * - Routes events to matching active workflows.
 */
export class DiscordGatewayManager {
  static connections = new Map(); // credentialId -> GatewayConnection
  static subscriptions = new Map(); // workflowId -> { credentialId, config, ownerId }
  static processedMessageIds = new Set();
  static maxProcessedCache = 1000;

  /**
   * Deduplication helper: Returns true if messageId has already been processed.
   */
  static isDuplicate(messageId) {
    if (!messageId) return false;
    if (this.processedMessageIds.has(messageId)) {
      return true;
    }
    this.processedMessageIds.add(messageId);
    if (this.processedMessageIds.size > this.maxProcessedCache) {
      const firstItem = this.processedMessageIds.values().next().value;
      if (firstItem) this.processedMessageIds.delete(firstItem);
    }
    return false;
  }

  /**
   * Subscribe a workflow to the Discord Gateway manager for real-time trigger execution.
   */
  static async subscribeWorkflow({ workflowId, credentialId, config = {}, ownerId }) {
    if (!workflowId || !credentialId) return;

    this.subscriptions.set(String(workflowId), {
      credentialId: String(credentialId),
      config,
      ownerId: String(ownerId || ''),
    });

    console.log(`[DiscordGatewayManager] 📌 Subscribed workflow "${workflowId}" to credential "${credentialId}"`);

    // Ensure Gateway connection is running for this credential
    await this.ensureConnection(credentialId, ownerId);
  }

  /**
   * Unsubscribe a workflow when disabled or deleted.
   */
  static unsubscribeWorkflow(workflowId) {
    const sub = this.subscriptions.get(String(workflowId));
    if (sub) {
      this.subscriptions.delete(String(workflowId));
      console.log(`[DiscordGatewayManager] 🔌 Unsubscribed workflow "${workflowId}"`);

      // Check if any other workflows still use this credential
      const hasOther = Array.from(this.subscriptions.values()).some((s) => s.credentialId === sub.credentialId);
      if (!hasOther) {
        this.closeConnection(sub.credentialId);
      }
    }
  }

  /**
   * Ensure an active Gateway WebSocket connection exists for a Discord credential.
   */
  static async ensureConnection(credentialId, ownerId) {
    const credId = String(credentialId);
    if (this.connections.has(credId)) {
      const conn = this.connections.get(credId);
      if (conn.readyState === WebSocket.OPEN || conn.readyState === WebSocket.CONNECTING) {
        return conn;
      }
    }

    try {
      // Resolve bot token securely from vault
      const credInfo = await credentialService.getCredentialForExecution(credId, ownerId || 'system');
      if (!credInfo || !credInfo.secret) {
        console.warn(`[DiscordGatewayManager] ⚠️ Cannot connect Gateway: Credential "${credId}" not found or secret empty.`);
        return null;
      }

      let secretData = credInfo.secret;
      if (typeof secretData === 'string') {
        secretData = secretData.trim();
        if (secretData.startsWith('{') || secretData.startsWith('"')) {
          try { secretData = JSON.parse(secretData); } catch {}
        }
      }

      let botToken = typeof secretData === 'string' ? secretData : (secretData?.botToken || secretData?.token || secretData?.secret || '');
      botToken = String(botToken || '').trim().replace(/^["']|["']$/g, '');

      if (!botToken) {
        console.warn(`[DiscordGatewayManager] ⚠️ Cannot connect Gateway: No valid bot token in credential "${credId}".`);
        return null;
      }

      const maskedToken = botToken.length > 8 ? `${botToken.slice(0, 4)}••••${botToken.slice(-4)}` : '••••••••';
      console.log(`[DiscordGatewayManager] 🌐 Opening Discord Gateway connection for Credential: "${credInfo.name}" (${maskedToken})`);

      const gatewayUrl = 'wss://gateway.discord.gg/?v=10&encoding=json';
      const ws = new WebSocket(gatewayUrl);

      const connObj = {
        ws,
        credentialId: credId,
        botToken,
        heartbeatInterval: null,
        heartbeatTimer: null,
        sequence: null,
        isIdentified: false,
        reconnectAttempts: 0,
      };

      ws.onopen = () => {
        console.log(`[Discord Trigger] Gateway connected for Credential "${credId}"`);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleGatewayMessage(connObj, payload);
        } catch (err) {
          console.warn(`[DiscordGatewayManager] ⚠️ Error parsing Gateway payload: ${err.message}`);
        }
      };

      ws.onerror = (err) => {
        console.warn(`[DiscordGatewayManager] ⚠️ Gateway WebSocket Error for Credential "${credId}": ${err.message || 'Connection error'}`);
      };

      ws.onclose = (event) => {
        console.log(`[DiscordGatewayManager] 🔌 Gateway WebSocket Closed (Code ${event.code}): ${event.reason || 'Closed'}`);
        if (connObj.heartbeatTimer) clearInterval(connObj.heartbeatTimer);
        this.connections.delete(credId);

        // Opcode 4014: Disallowed intent(s)
        if (event.code === 4014) {
          console.error(`[DiscordGatewayManager] ❌ CRITICAL SETUP ERROR: Discord Message Content access is required for this trigger. Please enable MESSAGE CONTENT INTENT in the Discord Developer Portal for your bot.`);
          return;
        }

        // Auto-reconnect if subcriptions still exist
        const hasSubs = Array.from(this.subscriptions.values()).some((s) => s.credentialId === credId);
        if (hasSubs && connObj.reconnectAttempts < 5) {
          connObj.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, connObj.reconnectAttempts), 30000);
          console.log(`[DiscordGatewayManager] 🔄 Reconnecting Gateway in ${delay}ms (Attempt ${connObj.reconnectAttempts}/5)...`);
          setTimeout(() => {
            this.ensureConnection(credId, ownerId);
          }, delay);
        }
      };

      this.connections.set(credId, connObj);
      return ws;
    } catch (err) {
      console.warn(`[DiscordGatewayManager] ⚠️ Error initializing Gateway connection: ${err.message}`);
      return null;
    }
  }

  /**
   * Close a Gateway connection.
   */
  static closeConnection(credentialId) {
    const credId = String(credentialId);
    const connObj = this.connections.get(credId);
    if (connObj) {
      if (connObj.heartbeatTimer) clearInterval(connObj.heartbeatTimer);
      try {
        if (connObj.ws && connObj.ws.readyState === WebSocket.OPEN) {
          connObj.ws.close(1000, 'All subscribed workflows deactivated');
        }
      } catch {}
      this.connections.delete(credId);
      console.log(`[DiscordGatewayManager] 🛑 Closed Gateway connection for Credential "${credId}"`);
    }
  }

  /**
   * Handle incoming Discord Gateway protocol opcodes.
   */
  static handleGatewayMessage(connObj, payload) {
    const { op, d, s, t } = payload;
    if (s !== undefined && s !== null) {
      connObj.sequence = s;
    }

    // Opcode 10: Hello -> start heartbeat & send Identify
    if (op === 10) {
      const heartbeatInterval = d.heartbeat_interval;
      connObj.heartbeatInterval = heartbeatInterval;

      if (connObj.heartbeatTimer) clearInterval(connObj.heartbeatTimer);

      connObj.heartbeatTimer = setInterval(() => {
        if (connObj.ws && connObj.ws.readyState === WebSocket.OPEN) {
          connObj.ws.send(JSON.stringify({ op: 1, d: connObj.sequence }));
        }
      }, heartbeatInterval);

      // Send Identify opcode with required intents:
      // GUILDS (1) | GUILD_MESSAGES (512) | DIRECT_MESSAGES (4096) | MESSAGE_CONTENT (32768) = 37377
      const identifyPayload = {
        op: 2,
        d: {
          token: connObj.botToken,
          intents: 37377,
          properties: {
            os: 'linux',
            browser: 'AutomateX',
            device: 'AutomateX',
          },
        },
      };

      connObj.ws.send(JSON.stringify(identifyPayload));
      connObj.isIdentified = true;
      console.log(`[DiscordGatewayManager] 🔑 Sent Gateway Identify (Intents: 37377)`);
      return;
    }

    // Opcode 11: Heartbeat ACK
    if (op === 11) {
      return;
    }

    // Opcode 0: Dispatch Event
    if (op === 0 && t === 'MESSAGE_CREATE') {
      this.handleIncomingMessage(connObj, d);
    }
  }

  /**
   * Process incoming MESSAGE_CREATE event from Discord.
   */
  static async handleIncomingMessage(connObj, msg) {
    if (!msg || !msg.id) return;

    const messageId = String(msg.id);

    // 1. Deduplication check
    if (this.isDuplicate(messageId)) {
      return;
    }

    const author = msg.author || {};
    const isBot = Boolean(author.bot);
    const content = String(msg.content || '');
    const channelId = String(msg.channel_id || '');
    const guildId = String(msg.guild_id || '');

    console.log(`[Discord Trigger] Message received: "${content}"`);
    console.log(`[Discord Trigger] Guild ID: ${guildId || 'Direct Message'}`);
    console.log(`[Discord Trigger] Channel ID: ${channelId}`);
    console.log(`[Discord Trigger] Author ID: ${author.id || 'Unknown'} (${author.username || 'user'})`);

    // 2. Find matching subscribed workflows
    for (const [workflowId, sub] of this.subscriptions.entries()) {
      if (sub.credentialId !== connObj.credentialId) continue;

      const cfg = sub.config || {};

      // Filter: Ignore Bot Messages (default true)
      const ignoreBot = cfg.ignoreBotMessages !== false && cfg.ignoreBotMessages !== 'false';
      if (ignoreBot && isBot) {
        console.log(`[Discord Trigger] Ignoring bot message from "${author.username}" for workflow "${workflowId}"`);
        continue;
      }

      // Filter: Guild / Server
      if (cfg.guildId && cfg.guildId !== 'all' && cfg.guildId !== guildId) {
        continue;
      }

      // Filter: Channel
      if (cfg.channelId && cfg.channelId !== 'all' && cfg.channelId !== channelId) {
        continue;
      }

      // Filter: Only Trigger When Bot Is Mentioned
      if (cfg.onlyBotMentioned) {
        const mentions = msg.mentions || [];
        const botMentioned = mentions.some((m) => m.id === connObj.botId || m.bot);
        if (!botMentioned && !content.includes(`<@`)) {
          continue;
        }
      }

      // Format payload structure expected by Data Mapper & prompt expressions
      const triggerPayload = {
        messageId,
        channelId,
        guildId,
        authorId: String(author.id || ''),
        authorName: String(author.username || ''),
        content,
        timestamp: new Date().toISOString(),
        message: {
          id: messageId,
          content,
          channelId,
          guildId,
          author: {
            id: String(author.id || ''),
            username: String(author.username || ''),
            bot: isBot,
          },
        },
        author: {
          id: String(author.id || ''),
          username: String(author.username || ''),
          bot: isBot,
        },
        id: messageId,
        triggeredAt: new Date().toISOString(),
      };

      try {
        // Fetch active workflow document from database
        const workflowDoc = await Workflow.findById(workflowId);
        if (!workflowDoc || (workflowDoc.status !== 'published' && workflowDoc.status !== 'active')) {
          console.log(`[Discord Trigger] Workflow "${workflowId}" is not published/active (status: ${workflowDoc?.status || 'NOT_FOUND'}). Skipping trigger execution.`);
          continue;
        }

        console.log(`[Discord Trigger] Starting workflow: "${workflowDoc.name}" (${workflowId})`);

        const execResult = await RuntimeManager.triggerExecution(
          'discordMessageReceived',
          workflowDoc,
          triggerPayload
        );

        console.log(`[Discord Trigger] Execution created: ${execResult?.executionId || execResult?._id || 'Started'}`);
      } catch (triggerErr) {
        console.error(`[Discord Trigger] ❌ Error triggering workflow "${workflowId}": ${triggerErr.message}`);
      }
    }
  }
}
