import { Request, Response, NextFunction } from 'express';
import { DiscordChannelService } from '../services/DiscordChannelService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordChannelController {
  /**
   * GET /api/v1/discord/channels
   * Step 3 API: Fetch all supported channels (GUILD_TEXT, GUILD_ANNOUNCEMENT, GUILD_FORUM) for a guild.
   */
  public static async getChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const credentialId = (req.query.credentialId as string) || (req.query.credential as string);
      const guildId = (req.query.guildId as string) || (req.query.guild as string);

      if (!credentialId) {
        res.status(400).json({ success: false, message: 'credentialId query parameter is required' });
        return;
      }

      if (!guildId) {
        res.status(400).json({ success: false, message: 'guildId query parameter is required' });
        return;
      }

      const refresh = req.query.refresh === 'true' || req.query.bypassCache === 'true';
      const result = await DiscordChannelService.getChannels(String(ownerId), credentialId, guildId, refresh);

      res.status(200).json({
        success: true,
        channels: result.channels,
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
   * POST /api/v1/discord/channels/refresh
   * Step 3 API: Invalidate cache and force reload Discord channels for a guild.
   */
  public static async refreshChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId } = req.body;

      if (!credentialId || !guildId) {
        res.status(400).json({ success: false, message: 'credentialId and guildId body parameters are required' });
        return;
      }

      const result = await DiscordChannelService.refreshChannels(String(ownerId), credentialId, guildId);
      res.status(200).json({
        success: true,
        channels: result.channels,
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
   * POST /api/v1/discord/channels/validate
   * Step 3 API: Validate whether a channel ID is valid and accessible in a guild.
   */
  public static async validateChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId, channelId } = req.body;

      if (!credentialId || !guildId || !channelId) {
        res.status(400).json({ success: false, message: 'credentialId, guildId, and channelId are required' });
        return;
      }

      const isValid = await DiscordChannelService.validateChannel(String(ownerId), credentialId, guildId, channelId);
      res.status(200).json({
        success: true,
        valid: isValid,
        channelId,
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
}
