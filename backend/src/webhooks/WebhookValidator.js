/**
 * WebhookValidator
 * Handles HTTP method validation, payload size checks, and sliding-window rate limiting.
 */
export class WebhookValidator {
  // In-memory rate limiting map: identifier -> array of timestamps
  static rateLimitMap = new Map();
  static WINDOW_MS = 60 * 1000; // 1 minute
  static MAX_REQUESTS_PER_WINDOW = 100;

  /**
   * Validate HTTP Method against allowed methods in node config
   * @param {string} reqMethod - e.g. "POST"
   * @param {string} allowedMethod - e.g. "ANY" or "POST"
   */
  static validateMethod(reqMethod = 'POST', allowedMethod = 'ANY') {
    const reqM = reqMethod.toUpperCase();
    const allowM = (allowedMethod || 'ANY').toUpperCase();

    if (allowM === 'ANY' || reqM === allowM) {
      return { valid: true };
    }

    return {
      valid: false,
      statusCode: 405,
      message: `HTTP Method "${reqM}" not allowed. Expected "${allowM}"`,
    };
  }

  /**
   * Sliding window rate limiting: max 100 requests per minute per webhook identifier
   */
  static checkRateLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    let timestamps = this.rateLimitMap.get(identifier) || [];
    // Filter out timestamps older than 1 minute
    timestamps = timestamps.filter((ts) => ts > windowStart);

    if (timestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        statusCode: 429,
        message: 'Rate limit exceeded: Max 100 requests per minute allowed per webhook.',
      };
    }

    timestamps.push(now);
    this.rateLimitMap.set(identifier, timestamps);

    return { allowed: true };
  }

  /**
   * Validate incoming payload size (max 2MB)
   */
  static validatePayloadSize(req) {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (contentLength > MAX_SIZE) {
      return {
        valid: false,
        statusCode: 413,
        message: 'Payload Too Large: Webhook payload exceeds maximum limit of 2MB.',
      };
    }

    return { valid: true };
  }
}
