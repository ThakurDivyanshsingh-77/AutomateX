import { RetryPolicy } from './RetryPolicy.js';
import { TimeoutManager } from './TimeoutManager.js';

export class RetryEngine {
  /**
   * Execute a node with configured retry policy and optional per-attempt timeout.
   * @param {object} executor - Registered executor instance
   * @param {object} nodeToExecute - Node definition with resolved config
   * @param {object} context - ExecutionContext RAM state
   * @returns {Promise<{ result: any, attempts: Array, success: boolean, error: Error|null, recovered: boolean, continueOnError: boolean, timedOut: boolean }>}
   */
  static async executeWithRetry(executor, nodeToExecute, context) {
    const config = nodeToExecute.config || nodeToExecute.data?.config || {};
    const maxRetries = Math.max(0, parseInt(config.retryCount || 0, 10));
    const baseDelay = Math.max(0, parseInt(config.retryDelay || 1000, 10));
    const strategy = config.retryStrategy || 'fixed';
    const continueOnError = Boolean(config.continueOnError);
    // Phase 11: per-node timeout (0 = disabled)
    const timeoutMs = Math.max(0, parseInt(config.timeoutMs || 0, 10));

    const attempts = [];
    let lastError = null;
    let result = null;
    let success = false;
    let recovered = false;
    let timedOut = false;

    // Total executions = 1 initial attempt + maxRetries
    const maxAttempts = 1 + maxRetries;

    for (let attemptNum = 1; attemptNum <= maxAttempts; attemptNum++) {
      const attemptStartTime = Date.now();

      try {
        // Phase 11: Wrap executor call in timeout race
        const executorPromise = executor.execute(nodeToExecute, context);
        result = await TimeoutManager.raceWithTimeout(executorPromise, timeoutMs, nodeToExecute.id);

        const durationMs = Date.now() - attemptStartTime;

        success = true;
        if (attemptNum > 1) {
          recovered = true;
        }

        attempts.push({
          attemptNumber: attemptNum,
          status: recovered ? 'recovered' : 'success',
          durationMs,
          timestamp: new Date().toISOString(),
        });

        break; // Exit loop on clean execution
      } catch (err) {
        lastError = err;
        const durationMs = Date.now() - attemptStartTime;

        // Track timeout flag
        if (err.isTimeout) {
          timedOut = true;
        }

        const isLastAttempt = attemptNum === maxAttempts;
        const delayMs = !isLastAttempt ? RetryPolicy.calculateDelay(strategy, attemptNum, baseDelay) : 0;

        attempts.push({
          attemptNumber: attemptNum,
          status: err.isTimeout ? 'timeout' : 'failed',
          durationMs,
          delayMs,
          error: err.message || String(err),
          isTimeout: Boolean(err.isTimeout),
          timestamp: new Date().toISOString(),
        });

        if (!isLastAttempt) {
          console.warn(
            `[RetryEngine]: Node "${nodeToExecute.id}" (${nodeToExecute.type}) attempt ${attemptNum}/${maxAttempts} ${err.isTimeout ? 'TIMED OUT' : 'failed'}: ${err.message}. Retrying in ${delayMs}ms using strategy "${strategy}"...`
          );
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
    }

    return {
      result,
      attempts,
      success,
      recovered,
      timedOut,
      error: lastError,
      continueOnError,
    };
  }
}
