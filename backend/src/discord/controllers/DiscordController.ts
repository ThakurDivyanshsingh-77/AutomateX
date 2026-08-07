import { Request, Response, NextFunction } from 'express';
import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordController {
  /**
   * POST /api/v1/discord/credentials/verify
   * Verify Bot Token without saving credential.
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
   * Validate, encrypt, and save Discord Bot Credential.
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
}
