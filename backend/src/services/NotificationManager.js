import { ErrorHandler } from './ErrorHandler.js';

/**
 * NotificationManager — Sends failure alerts when workflow executions fail.
 *
 * Supported channels:
 * - console (always active — server logs)
 * - webhook (HTTP POST to user-configured URL)
 *
 * Notification payload is always structured as:
 * {
 *   event: 'workflow.execution.failed',
 *   workflowId,
 *   workflowName,
 *   executionId,
 *   failedNodeId,
 *   failedNodeType,
 *   error: { type, message, severity, retryable },
 *   retriesAttempted,
 *   timestamp
 * }
 */
export class NotificationManager {
  /**
   * Send a failure notification for a permanently failed execution.
   *
   * @param {Object} execution - Mongoose Execution document (lean)
   * @param {Object} options
   * @param {Error|null} options.error - The final error that caused the failure
   * @param {string|null} options.failedNodeId
   * @param {string|null} options.failedNodeType
   * @param {number} options.retriesAttempted
   * @param {string|null} options.notifyWebhookUrl - User-configured webhook URL (optional)
   */
  static async notifyFailure(execution, {
    error = null,
    failedNodeId = null,
    failedNodeType = null,
    retriesAttempted = 0,
    notifyWebhookUrl = null,
  } = {}) {
    const classified = error ? ErrorHandler.classify(error) : { type: 'unknown', severity: 'medium', retryable: false, message: 'Unknown error' };

    const payload = {
      event: 'workflow.execution.failed',
      workflowId: String(execution.workflow || execution.workflowId || ''),
      workflowName: execution.workflowName || 'Untitled Workflow',
      executionId: String(execution._id || ''),
      failedNodeId,
      failedNodeType,
      error: {
        type: classified.type,
        message: classified.message,
        severity: classified.severity,
        retryable: classified.retryable,
        recommendation: classified.recommendation,
      },
      retriesAttempted,
      timestamp: new Date().toISOString(),
    };

    // Always log to console
    NotificationManager._logToConsole(payload);

    // Send to webhook if configured
    if (notifyWebhookUrl) {
      await NotificationManager._sendWebhook(notifyWebhookUrl, payload).catch((err) => {
        console.error(`[NotificationManager]: Webhook notification failed for ${notifyWebhookUrl}: ${err.message}`);
      });
    }

    return payload;
  }

  /**
   * Log failure notification to console/server logs.
   */
  static _logToConsole(payload) {
    console.error(
      `\n[NotificationManager] ⚠️  WORKFLOW FAILURE ALERT\n` +
      `  Workflow:    ${payload.workflowName} (${payload.workflowId})\n` +
      `  Execution:   ${payload.executionId}\n` +
      `  Failed Node: ${payload.failedNodeId || 'N/A'} (${payload.failedNodeType || 'N/A'})\n` +
      `  Error Type:  ${payload.error.type} | Severity: ${payload.error.severity}\n` +
      `  Message:     ${payload.error.message}\n` +
      `  Retried:     ${payload.retriesAttempted} times\n` +
      `  Time:        ${payload.timestamp}\n`
    );
  }

  /**
   * POST the notification payload to a webhook URL.
   */
  static async _sendWebhook(url, payload) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-AutomateX-Event': 'workflow.failure' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout for notification delivery
    });

    if (!res.ok) {
      throw new Error(`Webhook notification returned HTTP ${res.status}`);
    }

    console.log(`[NotificationManager]: Failure webhook delivered to ${url} (HTTP ${res.status})`);
    return true;
  }

  /**
   * Build a quick summary string for a notification payload.
   */
  static formatSummary(payload) {
    return (
      `Workflow "${payload.workflowName}" failed at node "${payload.failedNodeId || 'unknown'}" ` +
      `(${payload.error.type}). ${payload.retriesAttempted} retries attempted.`
    );
  }
}
