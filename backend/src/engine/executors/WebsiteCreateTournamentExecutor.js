import { BaseExecutor } from './BaseExecutor.js';
import { websiteConnectionService } from '../../services/WebsiteConnectionService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

/**
 * Utility helper to set deep nested property on an object (e.g. "prizeBreakdown.first")
 */
function setDeepValue(obj, path, value) {
  if (!path || typeof path !== 'string') return;
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }

  const finalKey = parts[parts.length - 1];
  current[finalKey] = value;
}

/**
 * Utility helper to cast/coerce value based on key or content
 */
function normalizeTournamentFieldValue(targetKey, val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'object') return val;

  const keyLower = targetKey.toLowerCase();
  const trimmed = String(val).trim();

  // Numeric fields
  if (
    keyLower === 'entryfee' ||
    keyLower === 'prizepool' ||
    keyLower === 'winnercount' ||
    keyLower === 'slots' ||
    keyLower.endsWith('.first') ||
    keyLower.endsWith('.second') ||
    keyLower.endsWith('.third')
  ) {
    const num = Number(trimmed);
    return isNaN(num) ? val : num;
  }

  // JSON string objects/arrays
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  }

  return val;
}

/**
 * WebsiteCreateTournamentExecutor
 * Dispatches tournament creation payloads to connected websites (e.g., Apex Esports API)
 * with dynamic field mappings, nested keys, Dry Run mode, rate limiting, and duplicate handling.
 */
export class WebsiteCreateTournamentExecutor extends BaseExecutor {
  constructor() {
    super('websiteCreateTournament');
    this.duplicateCache = new Set();
  }

  async execute(node, context) {
    const startTime = Date.now();
    const config = node.config || node.data?.config || {};

    // 1. Resolve Connection ID
    const rawConnId = config.connectionId || config.connection || '';
    const resolvedConnId = this.interpolate(rawConnId, context);

    if (!resolvedConnId || !resolvedConnId.trim()) {
      throw new Error(
        'Website Connection is required for Website → Create Tournament. Please select a valid connection.'
      );
    }

    // 2. Retrieve Decrypted Website Connection
    const ownerId = String(context.userId || context.ownerId || context.user?._id || '').trim();
    let connection;
    try {
      connection = await websiteConnectionService.getConnection(resolvedConnId, ownerId, true);
    } catch (err) {
      throw new Error(`Failed to load website connection "${resolvedConnId}": ${err.message}`);
    }

    if (!connection) {
      throw new Error(`Website connection with ID "${resolvedConnId}" was not found or is inaccessible.`);
    }

    // 3. Resolve Endpoint & Method
    const rawEndpoint = config.endpoint || config.endpointPath || '/api/v1/tournaments';
    const resolvedEndpoint = this.interpolate(rawEndpoint, context);
    const method = (config.method || 'POST').toUpperCase();

    // 4. Resolve Tournaments Source
    let rawTournaments = config.tournaments || config.tournament || config.items || config.tournamentSource || [];
    if (typeof rawTournaments === 'string') {
      try {
        const resolved = this.interpolate(rawTournaments, context);
        rawTournaments = typeof resolved === 'string' ? JSON.parse(resolved) : resolved;
      } catch {
        rawTournaments = this.interpolate(rawTournaments, context);
      }
    }

    // Normalize single item to array
    let tournamentList = Array.isArray(rawTournaments)
      ? rawTournaments
      : rawTournaments && typeof rawTournaments === 'object'
      ? [rawTournaments]
      : [];

    // Fallback check: if tournamentList is empty, look in currentContext variables
    if (tournamentList.length === 0 && context.variables?.currentItem) {
      tournamentList = [context.variables.currentItem];
    } else if (tournamentList.length === 0 && context.currentData?.tournament) {
      tournamentList = [context.currentData.tournament];
    } else if (tournamentList.length === 0 && context.currentData?.tournaments) {
      const td = context.currentData.tournaments;
      tournamentList = Array.isArray(td) ? td : [td];
    }

    if (tournamentList.length === 0) {
      // Create a default empty template tournament so field mappings can evaluate root context expressions
      tournamentList = [{}];
    }

    // 5. Field Mapping Configuration
    const fieldMapping = config.fieldMapping || [
      { sourceKey: 'title', targetKey: 'title' },
      { sourceKey: 'game', targetKey: 'game' },
      { sourceKey: 'mode', targetKey: 'mode' },
      { sourceKey: 'entryFee', targetKey: 'entryFee' },
      { sourceKey: 'prizePool', targetKey: 'prizePool' },
      { sourceKey: 'winnerCount', targetKey: 'winnerCount' },
      { sourceKey: 'prizeBreakdown', targetKey: 'prizeBreakdown' },
      { sourceKey: 'slots', targetKey: 'slots' },
      { sourceKey: 'date', targetKey: 'date' },
      { sourceKey: 'time', targetKey: 'time' },
      { sourceKey: 'map', targetKey: 'map' },
      { sourceKey: 'bannerImage', targetKey: 'bannerImage' },
      { sourceKey: 'description', targetKey: 'description' },
    ];

    // Execution options
    const dryRun = Boolean(config.dryRun);
    const duplicateStrategy = config.duplicateStrategy || 'skip'; // skip | update | create | stop
    const rateLimitMs = Math.max(0, Math.min(5000, Number(config.rateLimitMs || config.delayMs || 0)));

    console.log(`\n======================================================`);
    console.log(`🏆 TOURNAMENT PROCESSING [${dryRun ? 'DRY RUN MODE' : 'LIVE API MODE'}]`);
    console.log(`Total Tournaments: ${tournamentList.length}`);
    console.log(`Target: ${connection.apiBaseUrl || connection.websiteUrl} (${resolvedEndpoint})`);
    console.log(`======================================================`);

    const results = [];
    const createdTournaments = [];
    let createdCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const executionDedupeCache = new Set();

    for (let i = 0; i < tournamentList.length; i++) {
      const rawItem = tournamentList[i];
      const itemStartTime = Date.now();

      // Rate limit delay between dispatches
      if (i > 0 && rateLimitMs > 0) {
        await new Promise((r) => setTimeout(r, rateLimitMs));
      }

      // Build payload from field mapping
      const payload = this.buildTournamentPayload(rawItem, fieldMapping, context, i);

      // Validate required core fields
      const validationError = this.validateTournamentPayload(payload);
      const tournamentTitle = payload.title || payload.name || `Tournament #${i + 1}`;

      console.log(`${i + 1}. ${tournamentTitle}`);

      if (validationError) {
        console.error(`   ✕ Validation Failed: ${validationError}`);
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          error: validationError,
          durationMs: Date.now() - itemStartTime,
        });
        failedCount++;
        continue;
      }

      // Duplicate Check
      const dedupeKey = `${(payload.title || '').toLowerCase()}_${(payload.game || '').toLowerCase()}_${payload.date || ''}`;
      if (dedupeKey && duplicateStrategy !== 'create' && executionDedupeCache.has(dedupeKey)) {
        if (duplicateStrategy === 'skip') {
          console.warn(`   ⚠️ Skipped (Duplicate detected)`);
          results.push({
            index: i,
            title: tournamentTitle,
            status: 'skipped',
            reason: 'Duplicate tournament detected',
            payload,
            durationMs: Date.now() - itemStartTime,
          });
          skippedCount++;
          continue;
        } else if (duplicateStrategy === 'stop') {
          throw new Error(`Execution halted: Duplicate tournament "${tournamentTitle}" encountered.`);
        }
      }
      executionDedupeCache.add(dedupeKey);

      // Dry Run Branch
      if (dryRun) {
        console.log(`   ✓ Payload Validated [Dry Run]`);
        const itemDuration = Date.now() - itemStartTime;
        console.log(`   ${itemDuration}ms`);
        createdCount++;
        const dryItem = {
          index: i,
          title: tournamentTitle,
          status: 'dry_run_success',
          payload,
          durationMs: itemDuration,
        };
        results.push(dryItem);
        createdTournaments.push(payload);
        continue;
      }

      // Live HTTP Dispatch
      try {
        const responseData = await this.dispatchTournamentCreationWithRetry(
          connection,
          resolvedEndpoint,
          method,
          payload
        );

        const itemDuration = Date.now() - itemStartTime;
        console.log(`   ✓ Created (HTTP 201/200)`);
        console.log(`   ${itemDuration}ms`);

        createdCount++;
        const successItem = {
          index: i,
          title: tournamentTitle,
          status: 'created',
          tournamentId: responseData?.tournamentId || responseData?._id || responseData?.id || `tourn_${Date.now()}`,
          response: responseData,
          payload,
          durationMs: itemDuration,
        };
        results.push(successItem);
        createdTournaments.push(successItem);
      } catch (err) {
        const itemDuration = Date.now() - itemStartTime;
        console.error(`   ✕ Failed (${err.message})`);
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          error: err.message,
          payload,
          durationMs: itemDuration,
        });
        failedCount++;
      }
    }

    const totalDuration = Date.now() - startTime;
    const summary = {
      total: tournamentList.length,
      created: createdCount,
      failed: failedCount,
      skipped: skippedCount,
      durationMs: totalDuration,
    };

    console.log(`\n------------------------------------------------------`);
    console.log(`SUMMARY: Total: ${summary.total} | Created: ${summary.created} | Failed: ${summary.failed} | Skipped: ${summary.skipped}`);
    console.log(`======================================================\n`);

    const isOverallSuccess = failedCount === 0 || createdCount > 0;

    return {
      success: isOverallSuccess,
      dryRun,
      summary,
      results,
      tournaments: createdTournaments,
      createdTournament: createdTournaments[0] || null,
      tournamentId: results[0]?.tournamentId || null,
    };
  }

  /**
   * Constructs the final JSON request body dynamically from field mappings.
   * Supports dot-notation keys (e.g. "prizeBreakdown.first", "bannerImage")
   */
  buildTournamentPayload(sourceItem, fieldMapping, context, index) {
    const payload = {};

    // Prepare evaluation context
    const evalContext = {
      ...context,
      item: sourceItem,
      currentItem: sourceItem,
      index,
      currentIndex: index,
    };

    // If fieldMapping is an array of { sourceKey, targetKey, type }
    if (Array.isArray(fieldMapping)) {
      for (const row of fieldMapping) {
        if (!row || !row.targetKey) continue;
        const targetKey = String(row.targetKey).trim();
        const rawSource = String(row.sourceKey || '').trim();
        if (!targetKey) continue;

        let val = undefined;

        // Check if rawSource is an expression like {{...}}
        if (rawSource.startsWith('{{') && rawSource.endsWith('}}')) {
          val = ExpressionEngine.resolve(rawSource, evalContext);
        } else if (rawSource in sourceItem) {
          val = sourceItem[rawSource];
        } else if (rawSource) {
          // Attempt dot-path resolution on sourceItem
          val = this.getDeepValue(sourceItem, rawSource);
          if (val === undefined) {
            // Attempt expression resolution
            val = ExpressionEngine.resolve(rawSource, evalContext);
          }
        }

        const normalizedVal = normalizeTournamentFieldValue(targetKey, val);
        if (normalizedVal !== undefined) {
          setDeepValue(payload, targetKey, normalizedVal);
        }
      }
    } else if (typeof fieldMapping === 'object' && fieldMapping !== null) {
      // If fieldMapping is a key-value object { [sourceKey]: targetKey }
      for (const [sourceKey, targetKey] of Object.entries(fieldMapping)) {
        if (!targetKey) continue;
        let val = undefined;
        if (sourceKey.startsWith('{{') && sourceKey.endsWith('}}')) {
          val = ExpressionEngine.resolve(sourceKey, evalContext);
        } else if (sourceKey in sourceItem) {
          val = sourceItem[sourceKey];
        } else {
          val = this.getDeepValue(sourceItem, sourceKey);
        }

        const normalizedVal = normalizeTournamentFieldValue(targetKey, val);
        if (normalizedVal !== undefined) {
          setDeepValue(payload, targetKey, normalizedVal);
        }
      }
    }

    // Default prizeBreakdown object if flat keys weren't set but prizePool exists
    if (!payload.prizeBreakdown && payload.prizePool) {
      const pool = Number(payload.prizePool) || 0;
      payload.prizeBreakdown = {
        first: Math.round(pool * 0.5),
        second: Math.round(pool * 0.3),
        third: Math.round(pool * 0.2),
      };
    }

    return payload;
  }

  /**
   * Helper to retrieve nested property from object using dot path
   */
  getDeepValue(obj, path) {
    if (!obj || typeof obj !== 'object' || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * Validates required tournament payload attributes
   */
  validateTournamentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return 'Tournament payload is empty.';
    }
    const missing = [];
    if (!payload.title && !payload.name) missing.push('title');
    if (!payload.game) missing.push('game');
    if (!payload.mode) missing.push('mode');
    if (!payload.date) missing.push('date');
    if (!payload.time) missing.push('time');

    if (missing.length > 0) {
      return `Missing required tournament fields: ${missing.join(', ')}`;
    }
    return null;
  }

  /**
   * Dispatches tournament creation HTTP request with 3x exponential backoff retries
   */
  async dispatchTournamentCreationWithRetry(connection, endpoint, method, payload, maxRetries = 3) {
    const baseUrl = connection.apiBaseUrl || connection.websiteUrl;
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${cleanBase}${cleanEndpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (Array.isArray(connection.customHeaders)) {
      for (const h of connection.customHeaders) {
        if (h && h.key && h.value) {
          headers[h.key] = h.value;
        }
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

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(targetUrl, {
          method,
          headers,
          body: JSON.stringify(payload),
        });

        let data = {};
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { rawResponse: text };
        }

        if (response.ok || response.status === 200 || response.status === 201) {
          return data;
        }

        // Handle specific API status codes
        if (response.status === 400) {
          throw new Error(`HTTP 400 (Validation Error): ${data.message || data.error || text}`);
        } else if (response.status === 401) {
          throw new Error(`HTTP 401 (Unauthorized): Invalid credentials for connected website.`);
        } else if (response.status === 403) {
          throw new Error(`HTTP 403 (Forbidden): Insufficient permissions to create tournaments.`);
        } else if (response.status === 409) {
          throw new Error(`HTTP 409 (Conflict): Tournament already exists.`);
        }

        const isRetryable = response.status === 408 || response.status === 429 || response.status >= 500;
        if (isRetryable && attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 200;
          console.warn(`[WebsiteCreateTournamentExecutor] Attempt #${attempt} returned HTTP ${response.status}. Retrying in ${backoffMs}ms...`);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        throw new Error(`HTTP ${response.status}: ${data.message || data.error || text}`);
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries && !err.message.includes('400') && !err.message.includes('401') && !err.message.includes('403')) {
          const backoffMs = Math.pow(2, attempt) * 200;
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        break;
      }
    }

    throw lastError || new Error('Failed to create tournament.');
  }
}
