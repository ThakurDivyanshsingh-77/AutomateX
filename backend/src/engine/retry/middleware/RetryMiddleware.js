import { RetryEngine } from '../RetryEngine.js';

/**
 * Middleware wrapper for node execution.
 * Allows wrapping any node executor call or Express controller with standardized retry policy semantics.
 */
export function createRetryMiddleware() {
  return async function retryMiddleware(nodeToExecute, context, executorCall, next) {
    // If wrapping an executor
    if (typeof executorCall === 'function') {
      const mockExecutor = { execute: executorCall };
      return await RetryEngine.executeWithRetry(mockExecutor, nodeToExecute, context);
    }
    
    // Express middleware next() pattern fallback
    if (typeof next === 'function') {
      try {
        return await executorCall(nodeToExecute, context);
      } catch (err) {
        return next(err);
      }
    }
  };
}
