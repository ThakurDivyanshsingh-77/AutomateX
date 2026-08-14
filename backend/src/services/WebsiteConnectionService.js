import crypto from 'crypto';
import mongoose from 'mongoose';
import { WebsiteConnection } from '../models/WebsiteConnection.js';
import { credentialCrypto } from '../credentials/credentialCrypto.js';

export class WebsiteConnectionService {
  constructor() {
    this.memoryCache = new Map();
  }

  /**
   * Normalizes website URL by removing trailing slashes and ensuring valid protocol
   */
  normalizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let url = rawUrl.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      const parsed = new URL(url);
      let pathname = parsed.pathname;
      if (pathname.endsWith('/') && pathname.length > 1) {
        pathname = pathname.replace(/\/+$/, '');
      } else if (pathname === '/') {
        pathname = '';
      }
      return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search}`;
    } catch (e) {
      return url.replace(/\/+$/, '');
    }
  }

  /**
   * Masks sensitive credentials for safe UI display
   */
  maskCredentials(credentials = {}) {
    const masked = {};
    for (const [key, value] of Object.entries(credentials)) {
      if (!value) continue;
      const str = String(value);
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
        masked[key] = '••••••••';
      } else if (str.length <= 8) {
        masked[key] = '••••••••';
      } else {
        masked[key] = '••••••••' + str.substring(str.length - 4);
      }
    }
    return masked;
  }

  /**
   * Creates and persists a new Website Connection
   */
  async createConnection({
    ownerId,
    name,
    websiteUrl,
    apiBaseUrl,
    connectionMethod = 'restApi',
    authType = 'bearerToken',
    credentials = {},
    customHeaders = [],
  }) {
    if (!name || !name.trim()) {
      const error = new Error('Connection name is required.');
      error.code = 'INVALID_INPUT';
      error.status = 400;
      throw error;
    }

    if (!websiteUrl || !websiteUrl.trim()) {
      const error = new Error('Website URL is required.');
      error.code = 'INVALID_INPUT';
      error.status = 400;
      throw error;
    }

    const normalizedWebsiteUrl = this.normalizeUrl(websiteUrl);
    const normalizedApiBaseUrl = apiBaseUrl ? this.normalizeUrl(apiBaseUrl) : '';

    // Generate unique connection ID
    const connectionId = `conn_${crypto.randomBytes(6).toString('hex')}`;

    // Encrypt secrets at rest
    const { encryptedData } = credentialCrypto.encrypt(JSON.stringify(credentials || {}));
    const maskedCredentials = this.maskCredentials(credentials || {});

    const resolvedOwnerId = (ownerId || 'system_user').toString();

    const connectionDocData = {
      id: connectionId,
      ownerId: resolvedOwnerId,
      name: name.trim(),
      websiteUrl: normalizedWebsiteUrl,
      apiBaseUrl: normalizedApiBaseUrl,
      connectionMethod,
      authType,
      maskedCredentials,
      customHeaders: Array.isArray(customHeaders) ? customHeaders : [],
      status: 'untested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let savedDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const validMongoOwner = mongoose.Types.ObjectId.isValid(resolvedOwnerId)
          ? new mongoose.Types.ObjectId(resolvedOwnerId)
          : (mongoose.Types.ObjectId.isValid(resolvedOwnerId.replace('usr_', ''))
              ? new mongoose.Types.ObjectId(resolvedOwnerId.replace('usr_', ''))
              : new mongoose.Types.ObjectId());

        savedDoc = await WebsiteConnection.create({
          ...connectionDocData,
          ownerId: validMongoOwner,
          encryptedCredentials: encryptedData,
        });
      } catch (err) {
        console.warn('[WebsiteConnectionService] Error saving to MongoDB:', err.message);
      }
    }

    // Cache in memory
    this.memoryCache.set(connectionId, {
      ...connectionDocData,
      encryptedCredentials: encryptedData,
    });

    return {
      id: connectionId,
      connectionId,
      name: connectionDocData.name,
      websiteUrl: connectionDocData.websiteUrl,
      apiBaseUrl: connectionDocData.apiBaseUrl,
      connectionMethod: connectionDocData.connectionMethod,
      authType: connectionDocData.authType,
      maskedCredentials: connectionDocData.maskedCredentials,
      customHeaders: connectionDocData.customHeaders,
      status: connectionDocData.status,
      createdAt: connectionDocData.createdAt,
    };
  }

  /**
   * Lists all website connections for an owner (never exposes secrets)
   */
  async listConnections(ownerId) {
    let connections = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const query = ownerId ? { ownerId } : {};
        connections = await WebsiteConnection.find(query).sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn('[WebsiteConnectionService] Error querying MongoDB:', err.message);
      }
    }

    if (connections.length === 0 && this.memoryCache.size > 0) {
      connections = Array.from(this.memoryCache.values());
      if (ownerId) {
        connections = connections.filter((c) => c.ownerId?.toString() === ownerId.toString());
      }
    }

    return connections.map((c) => ({
      id: c.id,
      connectionId: c.id,
      name: c.name,
      websiteUrl: c.websiteUrl,
      apiBaseUrl: c.apiBaseUrl,
      connectionMethod: c.connectionMethod,
      authType: c.authType,
      maskedCredentials: c.maskedCredentials || {},
      customHeaders: c.customHeaders || [],
      status: c.status || 'untested',
      lastTestedAt: c.lastTestedAt,
      lastResponseTimeMs: c.lastResponseTimeMs,
      lastError: c.lastError,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  /**
   * Retrieves connection metadata (and optionally decrypted credentials for internal execution)
   */
  async getConnection(connectionId, ownerId, includeDecrypted = false) {
    if (!connectionId) {
      const error = new Error('Connection ID is required.');
      error.code = 'INVALID_INPUT';
      error.status = 400;
      throw error;
    }

    let connection = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const query = WebsiteConnection.findOne({ id: connectionId });
        if (includeDecrypted) {
          query.select('+encryptedCredentials');
        }
        connection = await query.lean();
      } catch (err) {
        // Fallback to memory cache
      }
    }

    if (!connection && this.memoryCache.has(connectionId)) {
      connection = { ...this.memoryCache.get(connectionId) };
    }

    if (!connection) {
      const error = new Error(`Website connection '${connectionId}' not found.`);
      error.code = 'CONNECTION_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (ownerId && connection.ownerId) {
      const connOwner = connection.ownerId.toString();
      const reqOwner = ownerId.toString();
      const match =
        connOwner === reqOwner ||
        connOwner.replace('usr_', '') === reqOwner.replace('usr_', '') ||
        reqOwner === 'system_user' ||
        connOwner === 'system_user';
      if (!match) {
        const error = new Error('You do not have permission to access this connection.');
        error.code = 'UNAUTHORIZED_ACCESS';
        error.status = 403;
        throw error;
      }
    }

    let decryptedCredentials = {};
    if (includeDecrypted && connection.encryptedCredentials) {
      try {
        const rawJson = credentialCrypto.decrypt(connection.encryptedCredentials);
        decryptedCredentials = JSON.parse(rawJson || '{}');
      } catch (err) {
        console.warn('[WebsiteConnectionService] Decryption failed:', err.message);
      }
    }

    const safeResult = {
      id: connection.id,
      connectionId: connection.id,
      name: connection.name,
      websiteUrl: connection.websiteUrl,
      apiBaseUrl: connection.apiBaseUrl,
      connectionMethod: connection.connectionMethod,
      authType: connection.authType,
      maskedCredentials: connection.maskedCredentials || {},
      customHeaders: connection.customHeaders || [],
      status: connection.status || 'untested',
      lastTestedAt: connection.lastTestedAt,
      lastResponseTimeMs: connection.lastResponseTimeMs,
      lastError: connection.lastError,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };

    if (includeDecrypted) {
      safeResult.credentials = decryptedCredentials;
    }

    return safeResult;
  }

  /**
   * Tests a website connection safely with HTTP ping and humanized errors using native fetch
   */
  async testConnection(connectionId, ownerId) {
    const connection = await this.getConnection(connectionId, ownerId, true);
    const testUrl = connection.apiBaseUrl || connection.websiteUrl;
    const startTime = Date.now();

    const headers = {
      'User-Agent': 'AutomateX-Workflow-Bot/1.0',
      Accept: 'application/json, text/plain, */*',
    };

    if (Array.isArray(connection.customHeaders)) {
      for (const h of connection.customHeaders) {
        if (h.key && h.value) headers[h.key] = h.value;
      }
    }

    const creds = connection.credentials || {};
    if (connection.authType === 'bearerToken' && creds.token) {
      headers['Authorization'] = `Bearer ${creds.token}`;
    } else if (connection.authType === 'apiKey' && creds.apiKey) {
      const headerName = creds.headerName || 'X-API-Key';
      headers[headerName] = creds.apiKey;
    } else if (connection.authType === 'basicAuth' && (creds.username || creds.password)) {
      const basic = Buffer.from(`${creds.username || ''}:${creds.password || ''}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    }

    let status = 'connected';
    let errorMessage = null;
    let responseTimeMs = 0;

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });

      responseTimeMs = Date.now() - startTime;

      if (response.status >= 200 && response.status < 400) {
        status = 'connected';
        errorMessage = null;
      } else if (response.status === 401) {
        status = 'error';
        errorMessage = 'Authentication failed. Please verify your API token or credentials.';
      } else if (response.status === 403) {
        status = 'error';
        errorMessage = 'Access forbidden. Your account does not have sufficient permissions.';
      } else if (response.status === 404) {
        status = 'error';
        errorMessage = 'API endpoint not found. Please verify the Website or API URL.';
      } else if (response.status === 429) {
        status = 'error';
        errorMessage = 'Rate limit exceeded on target website.';
      } else {
        status = 'error';
        errorMessage = `Website responded with HTTP ${response.status}.`;
      }
    } catch (err) {
      responseTimeMs = Date.now() - startTime;
      status = 'error';

      if (err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted')) {
        errorMessage = 'Connection timed out. Target website did not respond in time.';
      } else if (err.cause?.code === 'ENOTFOUND' || err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        errorMessage = 'Server unavailable. Please verify your website hostname and network.';
      } else {
        errorMessage = 'Connection failed. Please check the website URL and network settings.';
      }
    }

    // Update connection status in DB and memory
    const lastTestedAt = new Date();
    if (mongoose.connection.readyState === 1) {
      try {
        await WebsiteConnection.updateOne(
          { id: connectionId },
          {
            $set: {
              status,
              lastTestedAt,
              lastResponseTimeMs: responseTimeMs,
              lastError: errorMessage,
            },
          }
        );
      } catch (err) {}
    }

    if (this.memoryCache.has(connectionId)) {
      const cached = this.memoryCache.get(connectionId);
      this.memoryCache.set(connectionId, {
        ...cached,
        status,
        lastTestedAt,
        lastResponseTimeMs: responseTimeMs,
        lastError: errorMessage,
      });
    }

    return {
      success: status === 'connected',
      connectionId,
      websiteUrl: connection.websiteUrl,
      apiBaseUrl: connection.apiBaseUrl,
      connectionMethod: connection.connectionMethod,
      status,
      responseTimeMs,
      message: status === 'connected' ? 'Connection successful' : errorMessage,
      error: errorMessage,
    };
  }

  /**
   * Tests unsaved/draft connection credentials before saving using native fetch
   */
  async testRawConnection({ websiteUrl, apiBaseUrl, connectionMethod, authType, credentials, customHeaders }) {
    if (!websiteUrl) {
      const error = new Error('Website URL is required for testing.');
      error.code = 'INVALID_INPUT';
      error.status = 400;
      throw error;
    }

    const testUrl = this.normalizeUrl(apiBaseUrl || websiteUrl);
    const startTime = Date.now();

    const headers = {
      'User-Agent': 'AutomateX-Workflow-Bot/1.0',
      Accept: 'application/json, text/plain, */*',
    };

    if (Array.isArray(customHeaders)) {
      for (const h of customHeaders) {
        if (h.key && h.value) headers[h.key] = h.value;
      }
    }

    const creds = credentials || {};
    if (authType === 'bearerToken' && creds.token) {
      headers['Authorization'] = `Bearer ${creds.token}`;
    } else if (authType === 'apiKey' && creds.apiKey) {
      const headerName = creds.headerName || 'X-API-Key';
      headers[headerName] = creds.apiKey;
    } else if (authType === 'basicAuth' && (creds.username || creds.password)) {
      const basic = Buffer.from(`${creds.username || ''}:${creds.password || ''}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    }

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });

      const responseTimeMs = Date.now() - startTime;

      if (response.status >= 200 && response.status < 400) {
        return {
          success: true,
          status: 'connected',
          responseTimeMs,
          message: 'Connection successful',
          websiteUrl: this.normalizeUrl(websiteUrl),
        };
      } else if (response.status === 401) {
        return {
          success: false,
          status: 'error',
          responseTimeMs,
          message: 'Authentication failed. Please verify your API token or credentials.',
        };
      } else if (response.status === 403) {
        return {
          success: false,
          status: 'error',
          responseTimeMs,
          message: 'Access forbidden. Your account does not have sufficient permissions.',
        };
      } else {
        return {
          success: false,
          status: 'error',
          responseTimeMs,
          message: `Website responded with HTTP ${response.status}.`,
        };
      }
    } catch (err) {
      const responseTimeMs = Date.now() - startTime;
      let msg = 'Connection failed. Please check the website URL and network settings.';
      if (err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted')) {
        msg = 'Connection timed out. Target website did not respond in time.';
      } else if (err.cause?.code === 'ENOTFOUND' || err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        msg = 'Server unavailable. Please verify your website hostname and network.';
      }
      return {
        success: false,
        status: 'error',
        responseTimeMs,
        message: msg,
      };
    }
  }

  /**
   * Deletes a connection
   */
  async deleteConnection(connectionId, ownerId) {
    await this.getConnection(connectionId, ownerId);

    if (mongoose.connection.readyState === 1) {
      try {
        await WebsiteConnection.deleteOne({ id: connectionId });
      } catch (err) {}
    }

    this.memoryCache.delete(connectionId);
    return { success: true, deletedConnectionId: connectionId };
  }
}

export const websiteConnectionService = new WebsiteConnectionService();
