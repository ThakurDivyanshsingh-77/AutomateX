import { Request, Response, NextFunction } from 'express';
import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordGuildService } from '../services/DiscordGuildService.js';
import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordController {
  /**
   * POST /api/v1/discord/credentials/verify
   */
  public static async verifyCredential(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        message: normalized.message,
      });
    }
  }

  /**
   * POST /api/v1/discord/credentials
   */
  public static async createCredential(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore - req.user populated by authMiddleware
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = (error as unknown as { statusCode?: number }).statusCode || normalized.statusCode;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || normalized.message,
      });
    }
  }

  /**
   * GET /api/v1/discord/guilds
   */
  public static async getGuilds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
      const ownerId = req.user?._id || req.user?.id;
      if (!ownerId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User context required',
        });
        return;
      }

      const credentialId = (req.query.credentialId as string) || (req.query.credential as string);
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = (error as unknown as { statusCode?: number }).statusCode || normalized.statusCode;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || normalized.message,
        error: normalized,
      });
    }
  }

  /**
   * POST /api/v1/discord/guilds/refresh
   */
  public static async refreshGuilds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        message: (error as Error).message || normalized.message,
      });
    }
  }

  /**
   * POST /api/v1/discord/guilds/validate
   */
  public static async validateGuild(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        valid: false,
        message: (error as Error).message || normalized.message,
      });
    }
  }

  /**
   * POST /api/v1/discord/send-message
   * Step 4 API: Send message to a Discord channel.
   */
  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
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
    } catch (error: unknown) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = (error as unknown as { statusCode?: number }).statusCode || normalized.statusCode;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || normalized.message,
        error: normalized,
      });
    }
  }
}
