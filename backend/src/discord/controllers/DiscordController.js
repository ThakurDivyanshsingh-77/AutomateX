import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordGuildService } from '../services/DiscordGuildService.js';
import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordController {
  static async verifyCredential(req, res, next) {
    try {
      const { botToken } = req.body;
      if (!botToken) {
        res.status(400).json({
          success: false,
          message: 'botToken is required for verification',
        });
        return;
      }

      const result = await DiscordCredentialService.validateBotToken(botToken);
      if (!result.valid) {
        res.status(401).json({
          success: false,
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
      res.status(normalized.statusCode).json({
        success: false,
        message: normalized.message,
      });
    }
  }

  static async createCredential(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.status(401).json({
          success: false,
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
      res.status(statusCode).json({
        success: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async getGuilds(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const credentialId = req.query.credentialId || req.query.credential;
      if (!credentialId) {
        res.status(400).json({
          success: false,
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
      res.status(statusCode).json({
        success: false,
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
        res.status(400).json({ success: false, message: 'credentialId body parameter is required' });
        return;
      }

      const result = await DiscordGuildService.refreshGuilds(String(ownerId), credentialId);
      res.status(200).json({
        success: true,
        guilds: result.guilds,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async validateGuild(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId } = req.body;
      if (!credentialId || !guildId) {
        res.status(400).json({ success: false, message: 'credentialId and guildId are required' });
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
      res.status(normalized.statusCode).json({
        success: false,
        valid: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.status(401).json({
          success: false,
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
      res.status(statusCode).json({
        success: false,
        message: error.message || normalized.message,
        error: normalized,
      });
    }
  }
}
