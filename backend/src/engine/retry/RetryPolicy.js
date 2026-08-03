/**
 * RetryPolicy
 * Calculates delay intervals for node retry strategies:
 * - Immediate: 0ms
 * - Fixed: constant delay
 * - Exponential: delay * 2^(attempt - 1)
 * - Linear: delay * attempt
 */
export class RetryPolicy {
  /**
   * Calculate delay in milliseconds for a specific retry attempt
   * @param {string} strategy - "immediate" | "fixed" | "exponential" | "linear"
   * @param {number} attempt - 1-based attempt index
   * @param {number} baseDelayMs - Base delay in milliseconds (default: 1000)
   * @returns {number} Delay in milliseconds
   */
  static calculateDelay(strategy = 'fixed', attempt = 1, baseDelayMs = 1000) {
    const strat = (strategy || 'fixed').toLowerCase();
    const delay = Math.max(0, parseInt(baseDelayMs, 10) || 1000);

    switch (strat) {
      case 'immediate':
        return 0;

      case 'exponential':
        // 1s, 2s, 4s, 8s, 16s...
        return delay * Math.pow(2, Math.max(0, attempt - 1));

      case 'linear':
        // 1s, 2s, 3s, 4s...
        return delay * Math.max(1, attempt);

      case 'fixed':
      default:
        return delay;
    }
  }
}
