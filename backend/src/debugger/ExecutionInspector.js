/**
 * ExecutionInspector
 * Specialized node inspectors for formatting detailed inputs, outputs,
 * Gmail details, Webhook headers, Condition evaluations, and Expression diffs.
 */
export class ExecutionInspector {
  /**
   * Format Node Details according to node type
   */
  static inspectNode(stepLog = {}) {
    const nodeType = stepLog.nodeType || '';
    const input = stepLog.input || {};
    const output = stepLog.output || {};

    const baseInspection = {
      nodeId: stepLog.nodeId,
      nodeName: stepLog.nodeName || nodeType,
      nodeType: nodeType,
      status: stepLog.status,
      durationMs: stepLog.duration || 0,
      timestamp: stepLog.timestamp,
      rawInput: input,
      output: output,
      error: stepLog.error || null,
    };

    switch (nodeType.toLowerCase()) {
      case 'http':
        baseInspection.httpDetails = this.inspectHttp(input, output);
        break;
      case 'gmail':
        baseInspection.gmailDetails = this.inspectGmail(input, output);
        break;
      case 'webhook':
        baseInspection.webhookDetails = this.inspectWebhook(input, output);
        break;
      case 'condition':
        baseInspection.conditionDetails = this.inspectCondition(input, output);
        break;
      default:
        break;
    }

    baseInspection.expressions = this.extractExpressions(input, output);
    return baseInspection;
  }

  static inspectHttp(input = {}, output = {}) {
    return {
      url: input.url || output.url || '',
      method: input.method || output.method || 'GET',
      headers: input.headers || output.headers || {},
      body: input.body || input.data || {},
      statusCode: output.status || output.statusCode || 200,
      responseBody: output.data || output.body || {},
    };
  }

  static inspectGmail(input = {}, output = {}) {
    return {
      provider: 'gmail',
      recipient: input.to || output.recipient || '',
      cc: input.cc || '',
      bcc: input.bcc || '',
      subject: input.subject || output.subject || '',
      resolvedSubject: output.subject || input.subject || '',
      body: input.body || '',
      messageId: output.messageId || '',
      threadId: output.threadId || '',
      status: output.status || 'SENT',
    };
  }

  static inspectWebhook(input = {}, output = {}) {
    const trigger = input.trigger || output.trigger || output || {};
    return {
      method: trigger.method || 'POST',
      headers: trigger.headers || {},
      query: trigger.query || {},
      body: trigger.body || {},
      requesterIp: trigger.ip || '127.0.0.1',
      timestamp: trigger.timestamp || new Date().toISOString(),
    };
  }

  static inspectCondition(input = {}, output = {}) {
    return {
      leftRaw: output.leftRaw || input.left || '',
      leftResolved: output.leftResolved !== undefined ? output.leftResolved : input.left,
      operator: output.operator || input.operator || 'equals',
      rightRaw: output.rightRaw || input.right || '',
      rightResolved: output.rightResolved !== undefined ? output.rightResolved : input.right,
      result: Boolean(output.result),
      selectedBranch: output.selectedBranch || (output.result ? 'true' : 'false'),
    };
  }

  static extractExpressions(input = {}, output = {}) {
    const expressions = [];

    const scan = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string' && val.includes('{{')) {
          expressions.push({
            field: prefix ? `${prefix}.${key}` : key,
            original: val,
            resolved: output[key] !== undefined ? output[key] : val,
          });
        } else if (typeof val === 'object') {
          scan(val, prefix ? `${prefix}.${key}` : key);
        }
      }
    };

    scan(input);
    return expressions;
  }
}
