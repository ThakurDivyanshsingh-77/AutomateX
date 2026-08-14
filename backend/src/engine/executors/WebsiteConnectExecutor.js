import { BaseExecutor } from './BaseExecutor.js';
import { websiteConnectionService } from '../../services/WebsiteConnectionService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class WebsiteConnectExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();

    // 1. Resolve raw connection ID or expression
    let rawConnectionId =
      node.rawConfig?.connectionId ||
      node.data?.rawConfig?.connectionId ||
      config.connectionId ||
      config.connection?.id ||
      config.connection?.connectionId ||
      '';

    let resolvedConnectionId = rawConnectionId;
    if (typeof rawConnectionId === 'string' && rawConnectionId.includes('{{')) {
      resolvedConnectionId = ExpressionEngine.resolve(rawConnectionId, context);
    }

    // Clean / trim connection ID
    const connectionId = String(resolvedConnectionId || '').trim();

    // 2. Fallback to direct inline config if provided
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;

    let connection = null;
    if (connectionId) {
      try {
        connection = await websiteConnectionService.getConnection(connectionId, ownerId, false);
      } catch (err) {
        console.warn(`[WebsiteConnectExecutor] Connection lookup error for ${connectionId}:`, err.message);
      }
    }

    // 3. Fallback to attached configuration if connectionId is inline draft
    if (!connection && (config.websiteUrl || config.website?.url)) {
      const inlineUrl = config.websiteUrl || config.website?.url;
      const normalizedUrl = websiteConnectionService.normalizeUrl(inlineUrl);
      connection = {
        id: connectionId || `conn_draft_${Date.now()}`,
        name: config.name || 'Inline Website Connection',
        websiteUrl: normalizedUrl,
        apiBaseUrl: config.apiBaseUrl || '',
        connectionMethod: config.connectionMethod || config.method || 'restApi',
        status: config.status || 'connected',
      };
    }

    if (!connection) {
      console.log(`Website → Connect`);
      console.log(`✕ Connection failed`);
      console.log(`Reason: Website connection with ID '${connectionId}' was not found.`);
      const error = new Error(`Website connection with ID '${connectionId}' not found.`);
      error.code = 'CONNECTION_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const durationMs = Date.now() - startTime;
    const formattedMethod = String(connection.connectionMethod || 'REST_API')
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase();

    // Safe Execution Logging — NEVER log secrets
    console.log(`Website → Connect`);
    console.log(`✓ Connection successful`);
    console.log(`Website: ${connection.websiteUrl}`);
    console.log(`Method: ${formattedMethod}`);
    console.log(`Connection ID: ${connection.id || connection.connectionId}`);
    console.log(`Duration: ${durationMs}ms`);

    return {
      success: true,
      connectionId: connection.id || connection.connectionId,
      websiteUrl: connection.websiteUrl,
      website: {
        url: connection.websiteUrl,
        apiBaseUrl: connection.apiBaseUrl || '',
        method: formattedMethod,
        status: connection.status === 'error' ? 'error' : 'connected',
      },
    };
  }
}
