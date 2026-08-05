/**
 * Interface base class for Retry Strategies.
 * Follows Strategy Pattern (SOLID Principles).
 */
export class IRetryStrategy {
  /**
   * Calculate base delay for a given attempt number.
   * @param {number} attempt - Current retry attempt index (1-based for first retry)
   * @param {object} config - Resolved node retry configuration
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt, config) {
    throw new Error('Method calculateDelay() must be implemented by strategy subclass.');
  }
}
