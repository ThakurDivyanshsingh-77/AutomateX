/**
 * Retry Module Types & Constants
 * Standardized data definitions for AutomateX Retry Engine.
 */

export const RetryStrategyType = Object.freeze({
  FIXED: 'fixed',
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
});

export const JitterType = Object.freeze({
  NONE: 'none',
  RANDOM: 'random',
  FULL: 'full',
});

export const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 422];

export const DEFAULT_RETRY_ERRORS = [
  'Network Error',
  'Timeout',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'DNS Error',
  'Rate Limit',
];

export const DEFAULT_RETRY_CONFIG = Object.freeze({
  enableRetry: false,
  maxAttempts: 3,
  retryStrategy: RetryStrategyType.EXPONENTIAL,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
  retryOnStatusCodes: DEFAULT_RETRY_STATUS_CODES,
  dontRetryOnStatusCodes: NON_RETRYABLE_STATUS_CODES,
  retryOnErrors: DEFAULT_RETRY_ERRORS,
  retryJitter: JitterType.FULL,
  continueOnError: false,
  logRetryAttempts: true,
});
