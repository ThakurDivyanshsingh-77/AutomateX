import { IRetryStrategy } from './IRetryStrategy.js';

/**
 * Fixed Delay Strategy: Returns constant initialDelayMs.
 */
export class FixedDelayStrategy extends IRetryStrategy {
  calculateDelay(attempt, config) {
    const initialDelay = Math.max(0, parseInt(config.initialDelayMs ?? config.retryDelay ?? 1000, 10));
    const maxDelay = Math.max(initialDelay, parseInt(config.maxDelayMs || 30000, 10));
    return Math.min(initialDelay, maxDelay);
  }
}

/**
 * Linear Backoff Strategy: InitialDelay * attempt * backoffMultiplier.
 */
export class LinearBackoffStrategy extends IRetryStrategy {
  calculateDelay(attempt, config) {
    const initialDelay = Math.max(0, parseInt(config.initialDelayMs ?? config.retryDelay ?? 1000, 10));
    const multiplier = Math.max(1, parseFloat(config.backoffMultiplier || 1));
    const maxDelay = Math.max(initialDelay, parseInt(config.maxDelayMs || 30000, 10));

    const calculated = initialDelay * attempt * multiplier;
    return Math.min(calculated, maxDelay);
  }
}

/**
 * Exponential Backoff Strategy: InitialDelay * (backoffMultiplier ^ (attempt - 1)).
 */
export class ExponentialBackoffStrategy extends IRetryStrategy {
  calculateDelay(attempt, config) {
    const initialDelay = Math.max(0, parseInt(config.initialDelayMs ?? config.retryDelay ?? 1000, 10));
    const multiplier = Math.max(1, parseFloat(config.backoffMultiplier || 2));
    const maxDelay = Math.max(initialDelay, parseInt(config.maxDelayMs || 30000, 10));

    const calculated = initialDelay * Math.pow(multiplier, attempt - 1);
    return Math.min(calculated, maxDelay);
  }
}
