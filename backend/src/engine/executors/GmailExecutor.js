import { BaseExecutor } from './BaseExecutor.js';
import { GmailPlugin } from '../../plugins/gmail/GmailPlugin.js';

/**
 * GmailExecutor (Production)
 *
 * Engine-side executor that delegates to GmailPlugin.execute().
 * The engine knows nothing about Gmail internals —
 * it only calls plugin.execute(node, context) and wraps the result.
 *
 * This replaces the previous mock executor.
 */
export class GmailExecutor extends BaseExecutor {
  constructor() {
    super();
    this.plugin = new GmailPlugin();
  }

  async execute(node, context) {
    // Normalise node shape: engine passes { id, type, config }
    // GmailPlugin expects { config } or { data: { config } }
    const normalisedNode = {
      ...node,
      config: node.config || node.data?.config || {},
    };

    const result = await this.plugin.execute(normalisedNode, context);

    return {
      status: result.success ? 'success' : 'error',
      output: result,
    };
  }
}
