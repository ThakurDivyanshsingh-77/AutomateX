import { RetryStrategyFactory } from './strategies/RetryStrategyFactory.js';
import { JitterUtility } from './strategies/JitterUtility.js';
import { RetryEvaluator } from './evaluators/RetryEvaluator.js';
import { RetryLogger } from './logging/RetryLogger.js';
import { TimeoutManager } from './TimeoutManager.js';
import { DEFAULT_RETRY_CONFIG } from './types/RetryTypes.js';

export class RetryEngine {
  /**
   * Execute a node with configurable retry policy, exponential backoff, jitter, and status code / error matching.
   * @param {object} executor - Registered executor instance
   * @param {object} nodeToExecute - Node definition with resolved config
   * @param {object} context - ExecutionContext RAM state
   * @returns {Promise<{ success: boolean, retryAttempts: number, finalError: string|null, executionTime: number, result: any, attempts: Array, recovered: boolean, timedOut: boolean, continueOnError: boolean }>}
   */
  static async executeWithRetry(executor, nodeToExecute, context) {
    const totalStartTime = Date.now();
    const config = { ...DEFAULT_RETRY_CONFIG, ...(nodeToExecute.config || nodeToExecute.data?.config || {}) };
    
    const isRetryEnabled = Boolean(config.enableRetry ?? (config.retryCount > 0));
    const maxRetries = isRetryEnabled ? Math.max(0, parseInt(config.maxAttempts ?? config.retryCount ?? 3, 10)) : 0;
    const maxAttempts = 1 + maxRetries;

    const timeoutMs = Math.max(0, parseInt(config.timeoutMs || 0, 10));
    const strategyName = config.retryStrategy || 'exponential';
    const jitterType = config.retryJitter || 'full';
    const logAttempts = Boolean(config.logRetryAttempts ?? true);
    const continueOnError = Boolean(config.continueOnError);

    const strategy = RetryStrategyFactory.getStrategy(strategyName);

    const attempts = [];
    let lastError = null;
    let result = null;
    let success = false;
    let recovered = false;
    let timedOut = false;

    for (let attemptNum = 1; attemptNum <= maxAttempts; attemptNum++) {
      const attemptStartTime = Date.now();
      let attemptStatus = 'failed';
      let delayMs = 0;
      let statusCode = null;

      try {
        // Execute executor call with optional per-attempt timeout
        const executorPromise = executor.execute(nodeToExecute, context);
        result = await TimeoutManager.raceWithTimeout(executorPromise, timeoutMs, nodeToExecute.id);

        const durationMs = Date.now() - attemptStartTime;
        success = true;
        if (attemptNum > 1) {
          recovered = true;
        }

        attemptStatus = recovered ? 'recovered' : 'success';

        const attemptRecord = {
          attemptNumber: attemptNum,
          timestamp: new Date().toISOString(),
          delayUsed: 0,
          status: attemptStatus,
          statusCode: result?.statusCode || result?.status || 200,
          error: null,
          duration: durationMs,
          durationMs,
        };

        attempts.push(attemptRecord);

        RetryLogger.logAttempt(nodeToExecute.id, nodeToExecute.type, {
          attemptNumber: attemptNum,
          totalAttempts: maxAttempts,
          status: attemptStatus,
          durationMs,
          delayMs: 0,
          error: null,
        }, logAttempts);

        break; // Exit execution loop on success
      } catch (err) {
        lastError = err;
        const durationMs = Date.now() - attemptStartTime;
        statusCode = RetryEvaluator.extractStatusCode(err);

        if (err.isTimeout) {
          timedOut = true;
          attemptStatus = 'timeout';
        } else {
          attemptStatus = 'failed';
        }

        const isLastAttempt = attemptNum === maxAttempts;
        const isRetryable = isRetryEnabled && !isLastAttempt && RetryEvaluator.isRetryable(err, config);

        if (isRetryable) {
          // Calculate raw strategy delay for retry attempt (1-based index for retry)
          const rawDelay = strategy.calculateDelay(attemptNum, config);
          delayMs = JitterUtility.applyJitter(rawDelay, jitterType);
        } else {
          delayMs = 0;
        }

        const attemptRecord = {
          attemptNumber: attemptNum,
          timestamp: new Date().toISOString(),
          delayUsed: delayMs,
          status: attemptStatus,
          statusCode,
          error: err.message || String(err),
          isTimeout: Boolean(err.isTimeout),
          duration: durationMs,
          durationMs,
        };

        attempts.push(attemptRecord);

        RetryLogger.logAttempt(nodeToExecute.id, nodeToExecute.type, {
          attemptNumber: attemptNum,
          totalAttempts: maxAttempts,
          status: attemptStatus,
          durationMs,
          delayMs,
          statusCode,
          error: err.message || String(err),
        }, logAttempts);

        if (isRetryable && delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else if (!isRetryable && !isLastAttempt) {
          // Non-retryable error (e.g. 401, 404, invalid credentials) -> fail fast
          if (logAttempts) {
            console.warn(`[RetryEngine] 🚫 Non-retryable error detected for node "${nodeToExecute.id}". Fast-failing execution.`);
          }
          break;
        }
      }
    }

    const executionTime = Date.now() - totalStartTime;
    const finalErrorMsg = lastError ? (lastError.message || String(lastError)) : null;

    return {
      success,
      retryAttempts: attempts.length,
      finalError: finalErrorMsg,
      executionTime,
      result,
      attempts,
      recovered,
      timedOut,
      error: lastError,
      continueOnError,
    };
  }
}
