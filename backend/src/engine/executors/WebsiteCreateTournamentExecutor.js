import { BaseExecutor } from './BaseExecutor.js';
import { websiteConnectionService } from '../../services/WebsiteConnectionService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

/**
 * Utility to assign nested object paths like "prizeBreakdown.first" -> 5000
 */
function setDeepValue(obj, path, value) {
  if (!obj || !path) return;
  const parts = String(path).split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Normalize and cast field values according to tournament attributes.
 * Prevents literal placeholder leakage (e.g. "title", "game", "mode").
 */
function normalizeTournamentFieldValue(key, val) {
  const targetKey = String(key || '').trim();
  const lower = targetKey.toLowerCase();

  // If val is literal placeholder matching key name, treat as missing
  if (typeof val === 'string' && val.toLowerCase().trim() === lower) {
    val = undefined;
  }

  // Handle missing values according to data type rules
  if (val === undefined || val === null) {
    if (['entryFee', 'firstPrize', 'secondPrize', 'thirdPrize', 'slots'].includes(targetKey) || lower.endsWith('.first') || lower.endsWith('.second') || lower.endsWith('.third')) {
      return 0;
    }
    if (targetKey === 'winnerCount') {
      return '3';
    }
    return '';
  }

  if (targetKey === 'winnerCount') {
    const s = String(val).replace(/[^123]/g, '');
    if (s === '1' || s === '2' || s === '3') return s;
    return '3';
  }

  if (targetKey === 'prizePool') {
    if (typeof val === 'number') {
      return `₹${val.toLocaleString()}`;
    }
    return String(val).trim();
  }

  if (
    targetKey === 'entryFee' ||
    targetKey === 'firstPrize' ||
    targetKey === 'secondPrize' ||
    targetKey === 'thirdPrize' ||
    targetKey === 'slots' ||
    lower.endsWith('.first') ||
    lower.endsWith('.second') ||
    lower.endsWith('.third')
  ) {
    if (typeof val === 'number') return Number.isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      const num = Number(cleaned);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  }

  return String(val).trim();
}

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
    const rawEndpoint = config.endpoint || config.endpointPath || '/tournaments';
    const resolvedEndpoint = this.interpolate(rawEndpoint, context);
    const method = (config.method || 'POST').toUpperCase();

    // 4. Resolve Tournaments Source
    let rawTournaments = config.tournaments || config.tournament || config.items || config.currentTournament || config.tournamentSource || '';
    
    let resolvedData = null;
    if (typeof rawTournaments === 'string' && rawTournaments.trim()) {
      if (rawTournaments.includes('{{')) {
        try {
          const resolved = ExpressionEngine.resolve(rawTournaments, context);
          resolvedData = typeof resolved === 'string' ? JSON.parse(resolved) : resolved;
        } catch {
          resolvedData = ExpressionEngine.resolve(rawTournaments, context);
        }
      } else {
        try {
          resolvedData = JSON.parse(rawTournaments);
        } catch {
          resolvedData = rawTournaments;
        }
      }
    } else if (rawTournaments && typeof rawTournaments === 'object') {
      resolvedData = rawTournaments;
    }

    // Auto-discover tournament data from previous Gemini Structure Tournament step if not explicitly provided or if unresolved
    if (!resolvedData || (typeof resolvedData === 'object' && Object.keys(resolvedData).length === 0)) {
      if (context.steps) {
        for (const [stepKey, stepVal] of Object.entries(context.steps)) {
          if (!stepVal) continue;
          if (stepVal.tournament && typeof stepVal.tournament === 'object' && Object.keys(stepVal.tournament).length > 0) {
            resolvedData = stepVal.tournament;
            break;
          }
          if (stepVal.currentTournament && typeof stepVal.currentTournament === 'object') {
            resolvedData = stepVal.currentTournament;
            break;
          }
          if (Array.isArray(stepVal.tournaments) && stepVal.tournaments.length > 0) {
            resolvedData = stepVal.tournaments;
            break;
          }
          if (stepVal.title && stepVal.game) {
            resolvedData = stepVal;
            break;
          }
        }
      }

      if (!resolvedData && context.currentData) {
        if (context.currentData.tournament) resolvedData = context.currentData.tournament;
        else if (context.currentData.currentTournament) resolvedData = context.currentData.currentTournament;
        else if (Array.isArray(context.currentData.tournaments)) resolvedData = context.currentData.tournaments;
        else if (context.currentData.title && context.currentData.game) resolvedData = context.currentData;
      }

      if (!resolvedData && context.variables) {
        if (context.variables.currentTournament) resolvedData = context.variables.currentTournament;
        else if (context.variables.tournament) resolvedData = context.variables.tournament;
        else if (context.variables.currentItem) resolvedData = context.variables.currentItem;
      }
    }

    // Normalize single item or object to array
    let tournamentList = Array.isArray(resolvedData)
      ? resolvedData
      : resolvedData && typeof resolvedData === 'object'
      ? [resolvedData]
      : [];

    if (tournamentList.length === 0) {
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
      { sourceKey: 'firstPrize', targetKey: 'firstPrize' },
      { sourceKey: 'secondPrize', targetKey: 'secondPrize' },
      { sourceKey: 'thirdPrize', targetKey: 'thirdPrize' },
      { sourceKey: 'slots', targetKey: 'slots' },
      { sourceKey: 'date', targetKey: 'date' },
      { sourceKey: 'time', targetKey: 'time' },
      { sourceKey: 'map', targetKey: 'map' },
      { sourceKey: 'roomID', targetKey: 'roomID' },
      { sourceKey: 'password', targetKey: 'password' },
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
    if (dryRun) {
      console.log(`⚠️ DRY RUN — NO REQUEST SENT`);
    }
    console.log(`======================================================`);

    const results = [];
    const createdTournaments = [];
    const executionDedupeCache = new Set();

    let createdCount = 0;
    let wouldCreateCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let lastErrorDetails = null;

    for (let i = 0; i < tournamentList.length; i++) {
      const rawItem = tournamentList[i];
      const itemStartTime = Date.now();

      // Apply rate limiting delay if configured
      if (i > 0 && rateLimitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }

      // Build payload from field mapping
      const payload = this.buildTournamentPayload(rawItem, fieldMapping, context, i);
      const tournamentTitle = payload.title || `Tournament #${i + 1}`;

      console.log(`${i + 1}. ${tournamentTitle}`);

      // Pre-Validation: Stop if any required field is missing or invalid
      const validationError = this.validateTournamentPayload(payload);
      if (validationError) {
        console.error(`   ✕ Validation Failed: ${validationError}`);
        const errObj = {
          status: 400,
          message: `Pre-validation error: ${validationError}`,
        };
        lastErrorDetails = errObj;
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          error: errObj,
          payload,
          durationMs: Date.now() - itemStartTime,
        });
        failedCount++;
        // If strict validation fails on single tournament execution, throw error to stop workflow
        if (tournamentList.length === 1) {
          throw new Error(errObj.message);
        }
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
        console.log(`   ✓ Payload Validated [Dry Run — No Request Sent]`);
        const itemDuration = Date.now() - itemStartTime;
        console.log(`   ${itemDuration}ms`);
        wouldCreateCount++;
        const dryItem = {
          index: i,
          title: tournamentTitle,
          status: 'validated',
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
          tournamentId: responseData?.tournamentId || responseData?._id || responseData?.id || responseData?.data?.id || `tourn_${Date.now()}`,
          response: responseData,
          payload,
          durationMs: itemDuration,
        };
        results.push(successItem);
        createdTournaments.push(successItem);
      } catch (err) {
        const itemDuration = Date.now() - itemStartTime;
        console.error(`   ✕ Failed (${err.message})`);
        const statusMatch = err.message.match(/HTTP\s*(\d{3})/i);
        const errObj = {
          status: statusMatch ? parseInt(statusMatch[1], 10) : 500,
          message: err.message,
        };
        lastErrorDetails = errObj;
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          error: errObj,
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
      wouldCreate: wouldCreateCount,
      failed: failedCount,
      skipped: skippedCount,
      durationMs: totalDuration,
    };

    console.log(`\n------------------------------------------------------`);
    console.log(`SUMMARY: Total: ${summary.total} | Created: ${summary.created} | WouldCreate: ${summary.wouldCreate} | Failed: ${summary.failed} | Skipped: ${summary.skipped}`);
    console.log(`======================================================\n`);

    if (dryRun) {
      return {
        success: failedCount === 0,
        dryRun: true,
        validated: failedCount === 0,
        wouldCreate: wouldCreateCount,
        created: 0,
        failed: failedCount,
        payload: createdTournaments[0] || null,
        tournaments: createdTournaments,
        summary,
        results,
      };
    }

    if (failedCount > 0 && createdCount === 0) {
      return {
        success: false,
        dryRun: false,
        created: 0,
        failed: failedCount,
        error: lastErrorDetails || { status: 500, message: 'Tournament creation failed.' },
        summary,
        results,
      };
    }

    return {
      success: true,
      dryRun: false,
      created: createdCount,
      failed: failedCount,
      httpStatus: 201,
      response: results[0]?.response || null,
      tournamentId: results[0]?.tournamentId || null,
      tournament: createdTournaments[0] || null,
      tournaments: createdTournaments,
      summary,
      results,
    };
  }

  /**
   * Evaluates mapping configuration against raw source item.
   */
  buildTournamentPayload(sourceItem, fieldMapping, context, index) {
    const payload = {};

    const evalContext = {
      ...context,
      item: sourceItem,
      currentItem: sourceItem,
      currentTournament: sourceItem,
      index,
      currentIndex: index,
    };

    if (Array.isArray(fieldMapping)) {
      for (const row of fieldMapping) {
        if (!row || !row.targetKey) continue;
        const targetKey = String(row.targetKey).trim();
        const rawSource = String(row.sourceKey || '').trim();
        if (!targetKey) continue;

        let val = undefined;

        if (rawSource.startsWith('{{') && rawSource.endsWith('}}')) {
          val = ExpressionEngine.resolve(rawSource, evalContext);
        } else if (sourceItem && rawSource in sourceItem) {
          val = sourceItem[rawSource];
        } else if (sourceItem && targetKey in sourceItem) {
          val = sourceItem[targetKey];
        } else if (rawSource) {
          val = this.getDeepValue(sourceItem, rawSource);
        }

        const normalizedVal = normalizeTournamentFieldValue(targetKey, val);
        if (normalizedVal !== undefined) {
          setDeepValue(payload, targetKey, normalizedVal);
        }
      }
    } else if (typeof fieldMapping === 'object' && fieldMapping !== null) {
      for (const [sourceKey, targetKey] of Object.entries(fieldMapping)) {
        if (!targetKey) continue;
        let val = undefined;
        if (sourceKey.startsWith('{{') && sourceKey.endsWith('}}')) {
          val = ExpressionEngine.resolve(sourceKey, evalContext);
        } else if (sourceItem && sourceKey in sourceItem) {
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

    // Default prizeBreakdown object if flat prizes or prizePool exists
    if (!payload.prizeBreakdown) {
      if (sourceItem?.prizeBreakdown && typeof sourceItem.prizeBreakdown === 'object') {
        payload.prizeBreakdown = { ...sourceItem.prizeBreakdown };
      } else {
        const first = Number(payload.firstPrize || 0);
        const second = Number(payload.secondPrize || 0);
        const third = Number(payload.thirdPrize || 0);
        if (first > 0 || second > 0 || third > 0) {
          payload.prizeBreakdown = { first, second, third };
        } else if (payload.prizePool) {
          const poolNum = typeof payload.prizePool === 'number'
            ? payload.prizePool
            : Number(String(payload.prizePool).replace(/[^0-9.-]+/g, '')) || 0;
          if (poolNum > 0) {
            payload.prizeBreakdown = {
              first: Math.round(poolNum * 0.5),
              second: Math.round(poolNum * 0.3),
              third: Math.round(poolNum * 0.2),
            };
          }
        }
      }
    }

    // Merge any direct root properties on sourceItem that are not yet set
    if (sourceItem && typeof sourceItem === 'object') {
      for (const [k, v] of Object.entries(sourceItem)) {
        if (payload[k] === undefined && v !== undefined && v !== null) {
          payload[k] = v;
        }
      }
    }

    return payload;
  }

  getDeepValue(obj, path) {
    if (!obj || typeof obj !== 'object' || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Validates required tournament payload attributes.
   * Required: title, game, mode, prizePool, entryFee, slots, date, time, map
   */
  validateTournamentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return 'payload is empty';
    }

    // Check placeholder values
    const placeholders = ['title', 'game', 'mode', 'date', 'time', 'map', 'bannerimage', 'description'];
    for (const ph of placeholders) {
      if (typeof payload[ph] === 'string' && payload[ph].toLowerCase().trim() === ph) {
        return `field '${ph}' contains literal placeholder value "${payload[ph]}" instead of extracted document content`;
      }
    }

    if (!payload.title && !payload.name) {
      return "required field 'title' is missing";
    }
    if (!payload.game) {
      return "required field 'game' is missing";
    }
    if (!payload.mode) {
      return "required field 'mode' is missing";
    }
    if (payload.prizePool === undefined || payload.prizePool === null || String(payload.prizePool).trim() === '') {
      return "required field 'prizePool' is missing";
    }
    if (payload.entryFee === undefined || payload.entryFee === null || typeof payload.entryFee !== 'number' || Number.isNaN(payload.entryFee)) {
      return "required field 'entryFee' must be a valid number";
    }
    if (payload.slots === undefined || payload.slots === null || typeof payload.slots !== 'number' || Number.isNaN(payload.slots) || payload.slots <= 0) {
      return "required field 'slots' must be a valid positive number";
    }
    if (!payload.date) {
      return "required field 'date' is missing";
    }
    if (!payload.time) {
      return "required field 'time' is missing";
    }
    if (!payload.map) {
      return "required field 'map' is missing";
    }

    return null;
  }

  /**
   * Constructs the target URL handling URL deduplication
   */
  buildTargetUrl(baseUrl, endpoint) {
    const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
    let cleanEndpoint = String(endpoint || '').trim();
    if (cleanEndpoint.toUpperCase().startsWith('POST ')) {
      cleanEndpoint = cleanEndpoint.substring(5).trim();
    }
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`;
    }

    // Deduplicate /api/v1 if cleanBase ends with /api/v1 and cleanEndpoint starts with /api/v1
    if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1/, '');
    } else if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
    }

    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`;
    }

    return `${cleanBase}${cleanEndpoint}`;
  }

  /**
   * Dispatches tournament creation HTTP request with 3x exponential backoff retries
   */
  async dispatchTournamentCreationWithRetry(connection, endpoint, method, payload, maxRetries = 3) {
    const baseUrl = connection.apiBaseUrl || connection.websiteUrl;
    const targetUrl = this.buildTargetUrl(baseUrl, endpoint);

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
          const detailMsg = data.errors
            ? JSON.stringify(data.errors)
            : (data.message || data.error || text);
          throw new Error(`HTTP 400 (Validation Error): ${detailMsg}`);
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
