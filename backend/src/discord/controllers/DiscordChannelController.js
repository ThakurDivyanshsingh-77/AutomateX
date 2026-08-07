import { DiscordChannelService } from '../services/DiscordChannelService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordChannelController {
  static async getChannels(req, res, next) {
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
      const guildId = req.query.guildId || req.query.guild;

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

  static async refreshChannels(req, res, next) {
    try {
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
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async validateChannel(req, res, next) {
    try {
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
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      res.status(normalized.statusCode).json({
        success: false,
        valid: false,
        message: error.message || normalized.message,
      });
    }
  }
}
