import { DEFAULT_RETRY_CONFIG } from '../../engine/retry/types/RetryTypes.js';

export const RetryConfigSchema = {
  enableRetry: {
    type: 'boolean',
    label: 'Enable Retry',
    default: false,
    description: 'Automatically retry failed executions for this node',
  },
  maxAttempts: {
    type: 'number',
    label: 'Maximum Attempts',
    default: 3,
    min: 1,
    max: 10,
    description: 'Total execution attempts (initial + retries)',
  },
  retryStrategy: {
    type: 'select',
    label: 'Retry Strategy',
    default: 'exponential',
    options: [
      { label: 'Fixed Delay', value: 'fixed' },
      { label: 'Linear Backoff', value: 'linear' },
      { label: 'Exponential Backoff', value: 'exponential' },
    ],
  },
  initialDelayMs: {
    type: 'number',
    label: 'Initial Delay (ms)',
    default: 1000,
    min: 0,
    max: 300000,
    description: 'Base delay before first retry attempt',
  },
  backoffMultiplier: {
    type: 'number',
    label: 'Backoff Multiplier',
    default: 2,
    min: 1,
    max: 10,
    description: 'Multiplier for linear and exponential strategies',
  },
  maxDelayMs: {
    type: 'number',
    label: 'Maximum Delay (ms)',
    default: 30000,
    min: 1000,
    max: 600000,
    description: 'Upper bound limit for retry delay',
  },
  retryOnStatusCodes: {
    type: 'array',
    label: 'Retry On Status Codes',
    default: [408, 429, 500, 502, 503, 504],
    placeholder: '408, 429, 500, 502, 503, 504',
  },
  dontRetryOnStatusCodes: {
    type: 'array',
    label: "Don't Retry On",
    default: [400, 401, 403, 404, 422],
    placeholder: '400, 401, 403, 404, 422',
  },
  retryOnErrors: {
    type: 'array',
    label: 'Retry On Errors',
    default: ['Network Error', 'Timeout', 'ECONNRESET', 'ETIMEDOUT', 'DNS Error', 'Rate Limit'],
    placeholder: 'Network Error, Timeout, ECONNRESET, ETIMEDOUT, DNS Error, Rate Limit',
  },
  retryJitter: {
    type: 'select',
    label: 'Retry Jitter',
    default: 'full',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Random (50%-100%)', value: 'random' },
      { label: 'Full Jitter (AWS Standard)', value: 'full' },
    ],
  },
  continueOnError: {
    type: 'boolean',
    label: 'Continue Workflow On Failure',
    default: false,
    description: 'Allow remaining downstream nodes to run even if retries fail',
  },
  logRetryAttempts: {
    type: 'boolean',
    label: 'Log Retry Attempts',
    default: true,
    description: 'Log individual attempt entries in execution history',
  },
};
