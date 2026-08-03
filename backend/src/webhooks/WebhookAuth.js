/**
 * WebhookAuth
 * Validates incoming webhook authorization (None, Bearer Token, API Key, Custom Secret Header).
 */
export class WebhookAuth {
  /**
   * Validate authentication against webhook node configuration
   * @param {object} req - Express request object
   * @param {object} config - Node configuration { authType, authSecret, headerName }
   * @returns {{ authorized: boolean, statusCode: number, message: string }}
   */
  static validate(req, config = {}) {
    const authType = config.authType || 'none';
    const authSecret = config.authSecret || '';
    const headerName = (config.headerName || 'x-webhook-secret').toLowerCase();

    // 1. None — Public endpoint
    if (authType === 'none') {
      return { authorized: true };
    }

    if (!authSecret) {
      // Config requires auth but no secret set
      return { authorized: true };
    }

    // 2. Bearer Token
    if (authType === 'bearer') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (token === authSecret) {
        return { authorized: true };
      }
      return {
        authorized: false,
        statusCode: 401,
        message: 'Unauthorized: Invalid or missing Bearer token',
      };
    }

    // 3. API Key (Query param api_key or header x-api-key / x-webhook-secret)
    if (authType === 'apiKey') {
      const queryKey = req.query.api_key || req.query.apiKey;
      const headerKey = req.headers['x-api-key'] || req.headers[headerName];

      if (queryKey === authSecret || headerKey === authSecret) {
        return { authorized: true };
      }
      return {
        authorized: false,
        statusCode: 401,
        message: 'Unauthorized: Invalid or missing API Key',
      };
    }

    // 4. Secret Header
    if (authType === 'secret') {
      const customHeader = req.headers[headerName] || req.headers['x-webhook-secret'];

      if (customHeader === authSecret) {
        return { authorized: true };
      }
      return {
        authorized: false,
        statusCode: 401,
        message: `Unauthorized: Invalid or missing secret header "${headerName}"`,
      };
    }

    return { authorized: true };
  }
}
