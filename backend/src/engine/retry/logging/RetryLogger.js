/**
 * Retry Logger Service for structured attempt tracking.
 */
export class RetryLogger {
  /**
   * Log individual attempt attempt details.
   * @param {string} nodeId - Target node ID
   * @param {string} nodeType - Node type
   * @param {object} attemptInfo - Details of attempt
   * @param {boolean} shouldLog - Whether console logging is enabled
   */
  static logAttempt(nodeId, nodeType, attemptInfo, shouldLog = true) {
    if (!shouldLog) return;

    const { attemptNumber, totalAttempts, status, durationMs, delayMs, error, statusCode } = attemptInfo;

    if (status === 'success' || status === 'recovered') {
      console.log(
        `[RetryEngine] ✅ Node "${nodeId}" (${nodeType}) Attempt #${attemptNumber}/${totalAttempts} ${status.toUpperCase()} in ${durationMs}ms.`
      );
    } else {
      const codeStr = statusCode ? ` (HTTP ${statusCode})` : '';
      const nextDelayStr = delayMs > 0 ? ` Next retry in ${delayMs}ms.` : ' Max retries reached.';
      console.warn(
        `[RetryEngine] ⚠️ Node "${nodeId}" (${nodeType}) Attempt #${attemptNumber}/${totalAttempts} FAILED${codeStr} in ${durationMs}ms: ${error}.${nextDelayStr}`
      );
    }
  }
}
