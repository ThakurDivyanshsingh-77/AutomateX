/**
 * ErrorHandler — Centralized error classifier for the Reliability Engine.
 *
 * Classifies errors into typed categories and determines retryability,
 * severity, and recommended recovery strategy.
 */

export const ERROR_TYPES = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  AUTH: 'auth',
  RATE_LIMIT: 'rate_limit',
  SERVER_ERROR: 'server_error',
  CLIENT_ERROR: 'client_error',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
};

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export class ErrorHandler {
  /**
   * Classify an error into a typed descriptor.
   *
   * @param {Error|any} error - The raw error thrown by a node executor
   * @returns {{ type: string, retryable: boolean, severity: string, message: string, recommendation: string }}
   */
  static classify(error) {
    const message = (error?.message || String(error) || '').toLowerCase();
    const statusCode = error?.statusCode || error?.status || null;

    // Timeout errors
    if (error?.isTimeout || message.includes('timed out') || message.includes('timeout')) {
      return {
        type: ERROR_TYPES.TIMEOUT,
        retryable: true,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error?.message || 'Execution timed out',
        recommendation: 'Increase node timeout or retry with exponential backoff',
      };
    }

    // Network errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT, fetch failed)
    if (
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout') ||
      message.includes('network') ||
      message.includes('fetch failed') ||
      message.includes('failed to fetch') ||
      message.includes('econnreset')
    ) {
      return {
        type: ERROR_TYPES.NETWORK,
        retryable: true,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error?.message || 'Network connectivity error',
        recommendation: 'Retry with exponential backoff — transient network issue',
      };
    }

    // Authentication errors (401, 403, OAuth)
    if (
      statusCode === 401 || statusCode === 403 ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid token') ||
      message.includes('oauth') ||
      message.includes('authentication failed') ||
      message.includes('credentials')
    ) {
      return {
        type: ERROR_TYPES.AUTH,
        retryable: false,
        severity: ERROR_SEVERITY.HIGH,
        message: error?.message || 'Authentication failure',
        recommendation: 'Check OAuth credentials and re-authenticate',
      };
    }

    // Rate limiting (429)
    if (
      statusCode === 429 ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('quota exceeded')
    ) {
      return {
        type: ERROR_TYPES.RATE_LIMIT,
        retryable: true,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error?.message || 'Rate limit exceeded',
        recommendation: 'Retry with longer delay using linear or exponential backoff',
      };
    }

    // Server errors (5xx)
    if (
      (statusCode >= 500 && statusCode < 600) ||
      message.includes('http 5') ||
      message.includes('internal server error') ||
      message.includes('service unavailable') ||
      message.includes('bad gateway')
    ) {
      return {
        type: ERROR_TYPES.SERVER_ERROR,
        retryable: true,
        severity: ERROR_SEVERITY.HIGH,
        message: error?.message || 'Remote server error',
        recommendation: 'Retry — remote server may be temporarily unavailable',
      };
    }

    // Client errors (4xx, non-auth)
    if (
      (statusCode >= 400 && statusCode < 500) ||
      message.includes('http 4') ||
      message.includes('bad request') ||
      message.includes('not found')
    ) {
      return {
        type: ERROR_TYPES.CLIENT_ERROR,
        retryable: false,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error?.message || 'Client request error',
        recommendation: 'Check node configuration — retrying will not help',
      };
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('missing')
    ) {
      return {
        type: ERROR_TYPES.VALIDATION,
        retryable: false,
        severity: ERROR_SEVERITY.LOW,
        message: error?.message || 'Validation error',
        recommendation: 'Fix node configuration or input data',
      };
    }

    // Unknown / unclassified
    return {
      type: ERROR_TYPES.UNKNOWN,
      retryable: false,
      severity: ERROR_SEVERITY.MEDIUM,
      message: error?.message || 'Unknown error',
      recommendation: 'Inspect error details and stack trace',
    };
  }

  /**
   * Format an error for storage (safe serialization).
   */
  static serialize(error) {
    const classified = ErrorHandler.classify(error);
    return {
      ...classified,
      stack: error?.stack || null,
      raw: String(error?.message || error || ''),
    };
  }
}
