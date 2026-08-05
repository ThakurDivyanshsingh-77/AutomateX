import { JitterType } from '../types/RetryTypes.js';

/**
 * Jitter Utility for Retry Engine.
 * Reduces Thundering Herd problems on downstream services.
 */
export class JitterUtility {
  /**
   * Apply selected jitter algorithm to raw delay.
   * @param {number} rawDelayMs - Computed strategy delay in ms
   * @param {string} jitterType - 'none' | 'random' | 'full'
   * @returns {number} Delay in milliseconds with jitter applied
   */
  static applyJitter(rawDelayMs, jitterType = JitterType.FULL) {
    const delay = Math.max(0, Math.floor(rawDelayMs));
    if (delay === 0) return 0;

    const normalizedJitter = (jitterType || JitterType.NONE).toLowerCase();

    switch (normalizedJitter) {
      case JitterType.RANDOM:
        // Random Jitter: between 50% and 100% of computed delay
        return Math.floor(delay * (0.5 + Math.random() * 0.5));

      case JitterType.FULL:
        // Full Jitter: AWS Standard - random value between 0 and rawDelayMs
        return Math.floor(Math.random() * delay);

      case JitterType.NONE:
      default:
        return delay;
    }
  }
}
