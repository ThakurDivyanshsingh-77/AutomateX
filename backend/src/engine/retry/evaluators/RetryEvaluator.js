import { DEFAULT_RETRY_STATUS_CODES, NON_RETRYABLE_STATUS_CODES, DEFAULT_RETRY_ERRORS } from '../types/RetryTypes.js';

/**
 * Retry Evaluator Engine.
 * Evaluates whether an error or status code is eligible for retry according to configuration.
 */
export class RetryEvaluator {
  /**
   * Determine if an error or response status code is retryable.
   * @param {Error|any} error - The caught execution error
   * @param {object} config - Resolved node retry configuration
   * @returns {boolean} True if execution should be retried
   */
  static isRetryable(error, config = {}) {
    if (!error) return false;

    // 1. Extract HTTP status code if present
    const statusCode = this.extractStatusCode(error);

    // 2. Check explicit "Don't Retry On" Status Codes (400, 401, 403, 404, 422)
    const dontRetryCodes = config.dontRetryOnStatusCodes || NON_RETRYABLE_STATUS_CODES;
    if (statusCode && dontRetryCodes.map(Number).includes(Number(statusCode))) {
      return false;
    }

    // 3. Check explicit "Retry On" Status Codes (408, 429, 500, 502, 503, 504)
    const retryCodes = config.retryOnStatusCodes || DEFAULT_RETRY_STATUS_CODES;
    if (statusCode && retryCodes.map(Number).includes(Number(statusCode))) {
      return true;
    }

    // 4. Check explicit "Retry On Errors" (Network Error, Timeout, ECONNRESET, ETIMEDOUT, DNS Error, Rate Limit)
    const retryErrorPatterns = config.retryOnErrors || DEFAULT_RETRY_ERRORS;
    const errorString = `${error.name || ''} ${error.code || ''} ${error.message || ''} ${String(error)}`;

    for (const pattern of retryErrorPatterns) {
      if (this.matchPattern(errorString, pattern)) {
        return true;
      }
    }

    // 5. Special edge cases: Timeout errors or generic server errors (5xx)
    if (error.isTimeout || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      return true;
    }

    // Default to false for non-matching unhandled client errors
    return false;
  }

  /**
   * Helper: Extract HTTP status code from error object or response.
   * @param {any} err 
   * @returns {number|null}
   */
  static extractStatusCode(err) {
    if (!err) return null;
    if (typeof err.statusCode === 'number') return err.statusCode;
    if (typeof err.status === 'number') return err.status;
    if (err.response && typeof err.response.status === 'number') return err.response.status;
    if (err.output && typeof err.output.statusCode === 'number') return err.output.statusCode;

    // Regex check in error message for 3-digit status codes
    const match = String(err.message || '').match(/\b(4\d\d|5\d\d)\b/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Helper: Pattern matching for error strings.
   */
  static matchPattern(errorString, pattern) {
    if (!pattern) return false;
    const str = errorString.toLowerCase();
    const pat = String(pattern).toLowerCase();

    if (pat === 'network error') return str.includes('network') || str.includes('econnrefused') || str.includes('ehostunreach');
    if (pat === 'timeout') return str.includes('timeout') || str.includes('etimedout');
    if (pat === 'dns error') return str.includes('enotfound') || str.includes('eai_again') || str.includes('dns');
    if (pat === 'rate limit') return str.includes('rate limit') || str.includes('429') || str.includes('too many requests');

    return str.includes(pat);
  }
}
