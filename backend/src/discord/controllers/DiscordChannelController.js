import { DiscordChannelService } from '../services/DiscordChannelService.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordChannelController {
  static async getChannels(req, res, next) {
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
      const result = await DiscordChannelService.getChannels(String(ownerId), credentialId, guildId, refresh);

      res.status(200).json({
        success: true,
        channels: result.channels,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      const statusCode = error?.statusCode || normalized.statusCode;
      console.warn(`[DiscordChannelController] ⚠️ Error fetching channels on ${req.originalUrl}: ${normalized.message} (Status: ${statusCode})`);
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

  static async refreshChannels(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId } = req.body;

      if (!credentialId || !guildId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId and guildId body parameters are required' });
        return;
      }

      const result = await DiscordChannelService.refreshChannels(String(ownerId), credentialId, guildId);
      res.status(200).json({
        success: true,
        channels: result.channels,
      });
    } catch (error) {
      const normalized = DiscordUtils.normalizeDiscordError(error);
      console.warn(`[DiscordChannelController] ⚠️ Error refreshing channels on ${req.originalUrl}: ${normalized.message}`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(normalized.statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || normalized.message,
      });
    }
  }

  static async validateChannel(req, res, next) {
    try {
      const ownerId = req.user?._id || req.user?.id;
      const { credentialId, guildId, channelId } = req.body;

      if (!credentialId || !guildId || !channelId) {
        res.setHeader('X-AutomateX-User-Auth-Error', 'false');
        res.status(400).json({ success: false, isThirdPartyError: true, message: 'credentialId, guildId, and channelId are required' });
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
      console.warn(`[DiscordChannelController] ⚠️ Error validating channel on ${req.originalUrl}: ${normalized.message}`);
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
}
