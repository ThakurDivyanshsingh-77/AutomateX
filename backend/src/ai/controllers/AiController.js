import { AiGenerateTextService } from '../services/AiGenerateTextService.js';

export class AiController {
  /**
   * Controller handler for POST /api/v1/ai/generate-text endpoint.
   */
  static async generateText(req, res, next) {
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

      const result = await AiGenerateTextService.generateText(
        String(ownerId),
        targetCredId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error?.statusCode || 500;
      console.warn(`[AiController] ⚠️ Error during AI generate text on ${req.originalUrl}: ${error.message} (Status: ${statusCode})`);
      res.setHeader('X-AutomateX-User-Auth-Error', 'false');
      res.status(statusCode).json({
        success: false,
        isThirdPartyError: true,
        isUserAuthTokenError: false,
        message: error.message || 'AI generate text request failed.',
      });
    }
  }
}
