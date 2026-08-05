import { RetryStrategyType } from '../types/RetryTypes.js';
import { FixedDelayStrategy, LinearBackoffStrategy, ExponentialBackoffStrategy } from './RetryStrategies.js';

/**
 * Factory class to resolve Retry Strategy instances based on configuration.
 */
export class RetryStrategyFactory {
  static #strategies = new Map([
    [RetryStrategyType.FIXED, new FixedDelayStrategy()],
    [RetryStrategyType.LINEAR, new LinearBackoffStrategy()],
    [RetryStrategyType.EXPONENTIAL, new ExponentialBackoffStrategy()],
  ]);

  /**
   * Resolve appropriate strategy instance.
   * @param {string} strategyName - Strategy name ('fixed', 'linear', 'exponential')
   * @returns {import('./IRetryStrategy.js').IRetryStrategy}
   */
  static getStrategy(strategyName) {
    const key = (strategyName || RetryStrategyType.EXPONENTIAL).toLowerCase();
    const strategy = this.#strategies.get(key);
    if (!strategy) {
      // Default fallback
      return this.#strategies.get(RetryStrategyType.EXPONENTIAL);
    }
    return strategy;
  }
}
