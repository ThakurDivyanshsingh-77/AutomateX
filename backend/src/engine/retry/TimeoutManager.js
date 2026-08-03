/**
 * TimeoutManager — Per-node execution timeout support.
 *
 * Provides a reusable timeout promise that integrates with
 * Promise.race() inside the RetryEngine.
 */

export class ExecutionTimeoutError extends Error {
  constructor(nodeId, timeoutMs) {
    super(`Node "${nodeId}" timed out after ${timeoutMs}ms`);
    this.name = 'ExecutionTimeoutError';
    this.isTimeout = true;
    this.nodeId = nodeId;
    this.timeoutMs = timeoutMs;
  }
}

export class TimeoutManager {
  /**
   * Create a promise that rejects with ExecutionTimeoutError after timeoutMs.
   * Returns null if timeoutMs is 0 or falsy (timeout disabled).
   *
   * @param {number} timeoutMs - Milliseconds before timeout (0 = disabled)
   * @param {string} nodeId - Node ID for error context
   * @returns {{ promise: Promise<never>, clear: () => void } | null}
   */
  static createTimeout(timeoutMs, nodeId = 'unknown') {
    if (!timeoutMs || timeoutMs <= 0) return null;

    let timeoutHandle;
    const promise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new ExecutionTimeoutError(nodeId, timeoutMs));
      }, timeoutMs);
    });

    const clear = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };

    return { promise, clear };
  }

  /**
   * Race a primary promise against an optional timeout.
   * If timeoutMs is 0 or falsy, just awaits the primary promise.
   *
   * @param {Promise} primaryPromise - The node executor promise
   * @param {number} timeoutMs - Timeout in ms (0 = disabled)
   * @param {string} nodeId - Node ID for error messages
   * @returns {Promise<any>}
   */
  static async raceWithTimeout(primaryPromise, timeoutMs, nodeId) {
    const timeout = TimeoutManager.createTimeout(timeoutMs, nodeId);

    if (!timeout) {
      return primaryPromise;
    }

    try {
      const result = await Promise.race([primaryPromise, timeout.promise]);
      timeout.clear(); // Clean up the timer on success
      return result;
    } catch (err) {
      timeout.clear(); // Always clean up
      throw err;
    }
  }
}
