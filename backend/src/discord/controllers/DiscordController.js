import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordGuildService } from '../services/DiscordGuildService.js';
import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { DiscordEmbedService } from '../services/DiscordEmbedService.js';
import { DiscordCreateChannelService } from '../services/DiscordCreateChannelService.js';
import { DiscordDeleteChannelService } from '../services/DiscordDeleteChannelService.js';
import { DiscordCreateRoleService } from '../services/DiscordCreateRoleService.js';
import { DiscordRoleService } from '../services/DiscordRoleService.js';
import { DiscordDeleteRoleService } from '../services/DiscordDeleteRoleService.js';
import { DiscordMemberService } from '../services/DiscordMemberService.js';
import { DiscordAddRoleToMemberService } from '../services/DiscordAddRoleToMemberService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';




export class DiscordController {
  static async verifyCredential(req, res, next) {
    try {
      const { botToken } = req.body;
      if (!botToken) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({
          success: false,
          isThirdPartyError: true,
          message: 'botToken is required for verification',
        });
        return;
      }

      const result = await DiscordCredentialService.validateBotToken(botToken);
      if (!result.valid) {
        console.warn(`[DiscordController] ⚠️ Third-Party Discord Token Verification Failed: ${result.error}`);
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(401).json({
          success: false,
          isThirdPartyError: true,
          isUserAuthTokenError: false,
          message: result.error || 'Discord Bot Token verification failed',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          botName: result.botName,
          botId: result.botId,
          avatar: result.avatar,
          username: result.username,
          discriminator: result.discriminator,
        },
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordController] ⚠️ Exception during verifyCredential on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: normalized.message,
        error: normalized,
      });
    }
  }

  static async createCredential(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { name, botToken } = req.body;
      const result = await DiscordCredentialService.createCredential(String(ownerId), {
        name,
        botToken,
      });

      res.status(201).json({
        success: true,
        message: 'Discord Bot Credential saved successfully',
        data: result,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error creating credential on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async getGuilds(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const credentialId = req.query.credentialId || req.query.credential;
      if (!credentialId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({
          success: false,
          isThirdPartyError: true,
          message: 'credentialId query parameter is required',
        });
        return;
      }

      const refresh = req.query.refresh === 'true' || req.query.bypassCache === 'true';
      const result = await DiscordGuildService.getGuilds(String(ownerId), credentialId, refresh);

      res.status(200).json({
        success: true,
        guilds: result.guilds,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error fetching guilds on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async refreshGuilds(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId } = req.body;
      if (!credentialId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId body parameter is required' });
        return;
      }

      const result = await DiscordGuildService.refreshGuilds(String(ownerId), credentialId);
      res.status(200).json({
        success: true,
        guilds: result.guilds,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordController] ⚠️ Error refreshing guilds on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async validateGuild(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId } = req.body;
      if (!credentialId || !guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId and guildId are required' });
        return;
      }

      const isValid = await DiscordGuildService.validateGuild(String(ownerId), credentialId, guildId);
      res.status(200).json({
        success: true,
        valid: isValid,
        guildId,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordController] ⚠️ Error validating guild on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        valid: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId, guildId, channelId, content, message, embeds, tts, replyToMessageId, suppressEmbeds } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordMessageService.sendMessage(String(ownerId), targetCredId, {
        credentialId: targetCredId,
        guildId: guildId || req.body.guild,
        channelId: channelId || req.body.channel,
        content: content || message,
        embeds,
        tts,
        replyToMessageId,
        suppressEmbeds,
      });

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error sending message on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async sendEmbed(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId, guildId, channelId, title, description, color, url, authorName, authorUrl, authorIconUrl, thumbnailUrl, imageUrl, footerText, footerIconUrl, timestamp, fields } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordEmbedService.sendEmbed(String(ownerId), targetCredId, {
        credentialId: targetCredId,
        guildId: guildId || req.body.guild,
        channelId: channelId || req.body.channel,
        title,
        description,
        color,
        url,
        authorName,
        authorUrl,
        authorIconUrl,
        thumbnailUrl,
        imageUrl,
        footerText,
        footerIconUrl,
        timestamp,
        fields,
      });

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error sending embed message on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async createChannel(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordCreateChannelService.createChannel(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error creating channel on ${req.originalUrl}: ${error.message || normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async deleteChannel(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordDeleteChannelService.deleteChannel(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error deleting channel on ${req.originalUrl}: ${error.message || normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async createRole(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordCreateRoleService.createRole(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error creating role on ${req.originalUrl}: ${error.message || normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async getRoles(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const credentialId = req.query.credentialId || req.query.credential;
      const guildId = req.query.guildId || req.query.guild;

      if (!credentialId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId query parameter is required' });
        return;
      }

      if (!guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'guildId query parameter is required' });
        return;
      }

      const refresh = req.query.refresh === 'true' || req.query.bypassCache === 'true';
      const result = await DiscordRoleService.getRoles(String(ownerId), credentialId, guildId, refresh);

      res.status(200).json({
        success: true,
        roles: result.roles,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error fetching roles on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async refreshRoles(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId } = req.body;

      if (!credentialId || !guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId and guildId body parameters are required' });
        return;
      }

      const result = await DiscordRoleService.refreshRoles(String(ownerId), credentialId, guildId);
      res.status(200).json({
        success: true,
        roles: result.roles,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordController] ⚠️ Error refreshing roles on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async deleteRole(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordDeleteRoleService.deleteRole(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error deleting role on ${req.originalUrl}: ${error.message || normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async getMembers(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const credentialId = req.query.credentialId || req.query.credential;
      const guildId = req.query.guildId || req.query.guild;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;

      if (!credentialId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId query parameter is required' });
        return;
      }

      if (!guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'guildId query parameter is required' });
        return;
      }

      const refresh = req.query.refresh === 'true' || req.query.bypassCache === 'true';
      const result = await DiscordMemberService.getMembers(String(ownerId), credentialId, guildId, limit, refresh);

      res.status(200).json({
        success: true,
        members: result.members,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error fetching members on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }

  static async refreshMembers(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId, limit } = req.body;

      if (!credentialId || !guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId and guildId body parameters are required' });
        return;
      }

      const result = await DiscordMemberService.refreshMembers(String(ownerId), credentialId, guildId, limit || 1000);
      res.status(200).json({
        success: true,
        members: result.members,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordController] ⚠️ Error refreshing members on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async addRoleToMember(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'true');
        res.status(401).json({
          success: false,
          isUserAuthTokenError: true,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const { credentialId } = req.body;
      const targetCredId = credentialId || req.body.credential;

      const result = await DiscordAddRoleToMemberService.addRoleToMember(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordController] ⚠️ Error adding role to member on ${req.originalUrl}: ${error.message || normalized.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }
}



