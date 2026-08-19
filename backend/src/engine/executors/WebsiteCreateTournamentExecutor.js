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
 * Strips currency symbols (₹, $, etc.) and commas for numeric fields.
 */
function normalizeTournamentFieldValue(key, val) {
  const targetKey = String(key || '').trim();
  const lower = targetKey.toLowerCase();

  // If val is literal placeholder matching key name, treat as missing
  if (typeof val === 'string' && val.toLowerCase().trim() === lower) {
    return null;
  }

  if (val === undefined || val === null) {
    if (['entryFee', 'firstPrize', 'secondPrize', 'thirdPrize'].includes(targetKey) || lower.endsWith('.first') || lower.endsWith('.second') || lower.endsWith('.third')) {
      return 0;
    }
    return null;
  }

  if (targetKey === 'winnerCount') {
    if (typeof val === 'number') return Number.isNaN(val) ? 3 : val;
    const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(num) ? 3 : num;
  }

  if (targetKey === 'prizePool') {
    if (typeof val === 'number') return Number.isNaN(val) ? null : val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      const cleaned = trimmed.replace(/[^0-9.-]+/g, '');
      if (!cleaned || cleaned === '-' || cleaned === '.') return null;
      const num = Number(cleaned);
      return Number.isNaN(num) ? null : num;
    }
    return val;
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
      const trimmed = val.trim();
      if (!trimmed) return targetKey === 'slots' ? null : 0;
      const cleaned = trimmed.replace(/[^0-9.-]+/g, '');
      if (!cleaned || cleaned === '-' || cleaned === '.') return targetKey === 'slots' ? null : 0;
      const num = Number(cleaned);
      return Number.isNaN(num) ? (targetKey === 'slots' ? null : 0) : num;
    }
    return 0;
  }

  return typeof val === 'string' ? val.trim() : val;
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
    const rawEndpoint = config.endpoint || config.endpointPath || '/api/v1/tournaments';
    const resolvedEndpoint = this.interpolate(rawEndpoint, context);
    const method = (config.method || 'POST').toUpperCase();

    // 4. Resolve Tournaments Source (Dynamic mapping from Gemini structured output)
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

    // Auto-discover tournament data from previous Gemini Structure Tournament step if not explicitly provided
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
      { sourceKey: 'firstPrize', targetKey: 'prizeBreakdown.first' },
      { sourceKey: 'secondPrize', targetKey: 'prizeBreakdown.second' },
      { sourceKey: 'thirdPrize', targetKey: 'prizeBreakdown.third' },
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
    if (dryRun) {
      console.log(`⚠️ DRY RUN — NO REQUEST SENT`);
    }
    console.log(`======================================================`);

    const results = [];
    const createdTournaments = [];
    const validatedTournaments = [];
    const executionDedupeCache = new Set();

    let createdCount = 0;
    let validatedCount = 0;
    let requestedCount = 0;
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

      console.log(`${i + 1}. ${tournamentTitle} (Game: ${payload.game || 'N/A'}, Mode: ${payload.mode || 'N/A'})`);

      // Pre-Validation: Stop if any required field is missing or invalid
      const validationError = this.validateTournamentPayload(payload);
      if (validationError) {
        console.error(`   ✕ Validation Failed: ${validationError}`);
        const errObj = {
          status: 400,
          message: validationError,
        };
        lastErrorDetails = errObj;
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          validated: false,
          requested: false,
          created: false,
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
            validated: false,
            requested: false,
            created: false,
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

      validatedCount++;
      validatedTournaments.push(payload);

      // Dry Run Branch: validated=true, requested=false, created=0
      if (dryRun) {
        console.log(`   ✓ Payload Validated [Dry Run — No Request Sent]`);
        const itemDuration = Date.now() - itemStartTime;
        console.log(`   ${itemDuration}ms`);
        const dryItem = {
          index: i,
          title: tournamentTitle,
          status: 'validated',
          validated: true,
          requested: false,
          created: false,
          payload,
          durationMs: itemDuration,
        };
        results.push(dryItem);
        createdTournaments.push(payload);
        continue;
      }

      // Live HTTP Dispatch: dryRun=false
      requestedCount++;
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
          validated: true,
          requested: true,
          created: true,
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
        const httpStatus = err.status || (statusMatch ? parseInt(statusMatch[1], 10) : 500);

        const errObj = {
          status: httpStatus,
          statusText: err.statusText || 'Error',
          message: err.validationMessage || err.message,
          responseBody: err.responseBody || null,
          requestPayload: payload,
          targetUrl: err.targetUrl || resolvedEndpoint,
        };
        lastErrorDetails = errObj;
        results.push({
          index: i,
          title: tournamentTitle,
          status: 'failed',
          validated: true,
          requested: true,
          created: false,
          httpStatus,
          error: errObj,
          response: err.responseBody || null,
          payload,
          durationMs: itemDuration,
        });
        failedCount++;
      }
    }

    const totalDuration = Date.now() - startTime;
    const summary = {
      total: tournamentList.length,
      validated: validatedCount,
      requested: requestedCount,
      created: createdCount,
      wouldCreate: dryRun ? validatedCount : 0,
      failed: failedCount,
      skipped: skippedCount,
      durationMs: totalDuration,
    };

    console.log(`\n------------------------------------------------------`);
    console.log(`SUMMARY: Total: ${summary.total} | Validated: ${summary.validated} | Requested: ${summary.requested} | Created: ${summary.created} | Failed: ${summary.failed} | Skipped: ${summary.skipped}`);
    console.log(`======================================================\n`);

    const primaryPayload = validatedTournaments[0] || tournamentList[0] || null;

    if (dryRun) {
      return {
        success: failedCount === 0,
        dryRun: true,
        validated: true,
        requested: false,
        created: 0,
        wouldCreate: validatedCount,
        failed: failedCount,
        previewJson: JSON.stringify(primaryPayload, null, 2),
        payload: primaryPayload,
        tournament: primaryPayload,
        tournaments: createdTournaments,
        summary,
        results,
      };
    }

    if (failedCount > 0 && createdCount === 0) {
      return {
        success: false,
        dryRun: false,
        validated: validatedCount > 0,
        requested: requestedCount > 0,
        created: 0,
        failed: failedCount,
        httpStatus: lastErrorDetails?.status || 500,
        error: lastErrorDetails || { status: 500, message: 'Tournament creation failed.' },
        response: lastErrorDetails?.responseBody || null,
        requestPayload: primaryPayload,
        previewJson: JSON.stringify(primaryPayload, null, 2),
        tournament: primaryPayload,
        tournaments: createdTournaments,
        summary,
        results,
      };
    }

    return {
      success: true,
      dryRun: false,
      validated: true,
      requested: true,
      created: createdCount,
      failed: failedCount,
      httpStatus: 201,
      response: results[0]?.response || null,
      tournamentId: results[0]?.tournamentId || null,
      previewJson: JSON.stringify(primaryPayload, null, 2),
      tournament: primaryPayload,
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

    const findSourceValue = (sourceKey, targetKey) => {
      let val = undefined;

      if (sourceKey.startsWith('{{') && sourceKey.endsWith('}}')) {
        return ExpressionEngine.resolve(sourceKey, evalContext);
      }

      if (!sourceItem || typeof sourceItem !== 'object') return undefined;

      // 1. Direct key lookups
      if (sourceKey in sourceItem && sourceItem[sourceKey] !== undefined) {
        return sourceItem[sourceKey];
      }
      if (targetKey in sourceItem && sourceItem[targetKey] !== undefined) {
        return sourceItem[targetKey];
      }

      // 2. Deep value lookups
      val = this.getDeepValue(sourceItem, sourceKey);
      if (val !== undefined) return val;

      val = this.getDeepValue(sourceItem, targetKey);
      if (val !== undefined) return val;

      // 3. Known Aliases for tournament attributes
      const keyAliases = {
        title: ['name', 'tournamentName', 'Tournament Title', 'Title'],
        game: ['gameName', 'Game Name', 'Game'],
        mode: ['gameMode', 'tournamentMode', 'Game Mode', 'Mode'],
        prizePool: ['Total Prize Pool', 'Total Prize Pool (₹)', 'totalPrizePool', 'totalPrize', 'Total Prize', 'Prize Pool', 'prize_pool', 'prizePoolStr'],
        entryFee: ['Entry Fee', 'Entry Fee (₹)', 'fee', 'entry_fee'],
        winnerCount: ['Winner Count', 'winners', 'Total Winners', 'winner_count'],
        firstPrize: ['prizeBreakdown.first', 'first', '1stPlacePrize', '1st Place Prize', '1st Place Prize (₹)', '1st Prize', '1st'],
        secondPrize: ['prizeBreakdown.second', 'second', '2ndPlacePrize', '2nd Place Prize', '2nd Place Prize (₹)', '2nd Prize', '2nd'],
        thirdPrize: ['prizeBreakdown.third', 'third', '3rdPlacePrize', '3rd Place Prize', '3rd Place Prize (₹)', '3rd Prize', '3rd'],
        'prizeBreakdown.first': ['firstPrize', 'first', '1stPlacePrize', '1st Place Prize', '1st Place Prize (₹)', '1st Prize'],
        'prizeBreakdown.second': ['secondPrize', 'second', '2ndPlacePrize', '2nd Place Prize', '2nd Place Prize (₹)', '2nd Prize'],
        'prizeBreakdown.third': ['thirdPrize', 'third', '3rdPlacePrize', '3rd Place Prize', '3rd Place Prize (₹)', '3rd Prize'],
        slots: ['Max Capacity Slots', 'Max Capacity', 'maxCapacity', 'maxTeams', 'maxSlots', 'capacity', 'totalSlots', 'Total Slots'],
        date: ['tournamentDate', 'eventDate', 'Tournament Date', 'Date'],
        time: ['startTime', 'eventTime', 'Start Time', 'Time'],
        map: ['mapName', 'playingMap', 'Map Name', 'Map'],
        bannerImage: ['bannerImageUrl', 'bannerUrl', 'imageUrl', 'Banner Image URL', 'Banner Image'],
        description: ['rules', 'details', 'Description & Rules', 'Description'],
      };

      const aliases = [...(keyAliases[sourceKey] || []), ...(keyAliases[targetKey] || [])];
      for (const alias of aliases) {
        if (alias in sourceItem && sourceItem[alias] !== undefined) {
          return sourceItem[alias];
        }
        val = this.getDeepValue(sourceItem, alias);
        if (val !== undefined) return val;
      }

      return undefined;
    };

    if (Array.isArray(fieldMapping)) {
      for (const row of fieldMapping) {
        if (!row || !row.targetKey) continue;
        const targetKey = String(row.targetKey).trim();
        const rawSource = String(row.sourceKey || '').trim();
        if (!targetKey) continue;

        const val = findSourceValue(rawSource, targetKey);

        if (val !== undefined && val !== null) {
          const normalizedVal = normalizeTournamentFieldValue(targetKey, val);
          if (normalizedVal !== undefined && normalizedVal !== null) {
            setDeepValue(payload, targetKey, normalizedVal);
          }
        }
      }
    }

    // Direct fallbacks for standard tournament schema if missing from payload
    if (payload.prizePool === undefined || payload.prizePool === null) {
      const rawPool = findSourceValue('prizePool', 'prizePool');
      if (rawPool !== undefined && rawPool !== null) {
        payload.prizePool = normalizeTournamentFieldValue('prizePool', rawPool);
      }
    }

    if (payload.entryFee === undefined || payload.entryFee === null) {
      const rawFee = findSourceValue('entryFee', 'entryFee');
      payload.entryFee = normalizeTournamentFieldValue('entryFee', rawFee ?? 0);
    }

    // Normalize prizeBreakdown
    if (!payload.prizeBreakdown || typeof payload.prizeBreakdown !== 'object') {
      if (sourceItem?.prizeBreakdown && typeof sourceItem.prizeBreakdown === 'object') {
        payload.prizeBreakdown = {
          first: normalizeTournamentFieldValue('firstPrize', sourceItem.prizeBreakdown.first),
          second: normalizeTournamentFieldValue('secondPrize', sourceItem.prizeBreakdown.second),
          third: normalizeTournamentFieldValue('thirdPrize', sourceItem.prizeBreakdown.third),
        };
      } else {
        const first = normalizeTournamentFieldValue('firstPrize', payload.firstPrize || sourceItem?.firstPrize);
        const second = normalizeTournamentFieldValue('secondPrize', payload.secondPrize || sourceItem?.secondPrize);
        const third = normalizeTournamentFieldValue('thirdPrize', payload.thirdPrize || sourceItem?.thirdPrize);
        if (first > 0 || second > 0 || third > 0) {
          payload.prizeBreakdown = { first, second, third };
        } else if (payload.prizePool) {
          const poolNum = Number(payload.prizePool) || 0;
          if (poolNum > 0) {
            payload.prizeBreakdown = {
              first: Math.round(poolNum * 0.5),
              second: Math.round(poolNum * 0.3),
              third: Math.round(poolNum * 0.2),
            };
          }
        }
      }
    } else {
      payload.prizeBreakdown.first = normalizeTournamentFieldValue('firstPrize', payload.prizeBreakdown.first);
      payload.prizeBreakdown.second = normalizeTournamentFieldValue('secondPrize', payload.prizeBreakdown.second);
      payload.prizeBreakdown.third = normalizeTournamentFieldValue('thirdPrize', payload.prizeBreakdown.third);
    }

    // If prizePool is still missing but prizeBreakdown has values, sum them up
    if (payload.prizePool === undefined || payload.prizePool === null) {
      if (payload.prizeBreakdown) {
        const sum = (payload.prizeBreakdown.first || 0) + (payload.prizeBreakdown.second || 0) + (payload.prizeBreakdown.third || 0);
        if (sum > 0) {
          payload.prizePool = sum;
        }
      }
    }

    // Merge any direct root properties on sourceItem that are not yet set
    if (sourceItem && typeof sourceItem === 'object') {
      for (const [k, v] of Object.entries(sourceItem)) {
        if (payload[k] === undefined && v !== undefined && v !== null) {
          payload[k] = normalizeTournamentFieldValue(k, v);
        }
      }
    }

    return this.cleanFinalPayload(payload);
  }

  /**
   * Sanitizes final tournament object to match expected schema and strip internal engine keys
   */
  cleanFinalPayload(payload) {
    const clean = {};
    const standardKeys = [
      'title',
      'game',
      'mode',
      'entryFee',
      'prizePool',
      'winnerCount',
      'prizeBreakdown',
      'slots',
      'date',
      'time',
      'map',
      'bannerImage',
      'description',
      'rules',
      'roomID',
      'password',
    ];

    for (const key of standardKeys) {
      if (payload[key] !== undefined && payload[key] !== null) {
        if (typeof payload[key] === 'string' && payload[key].trim() === '' && ['roomID', 'password'].includes(key)) {
          continue;
        }
        clean[key] = payload[key];
      }
    }

    // Include any custom mapped keys that are not engine internal properties
    const excludedInternalKeys = new Set([
      'firstPrize',
      'secondPrize',
      'thirdPrize',
      'extractionDebug',
      'rawResponse',
      'durationMs',
      'success',
      'count',
      'currentTournament',
      'tournament',
      'tournaments',
      'nodeId',
      'stepId',
      'executionId',
      'previewJson',
      'results',
      'summary',
      'name',
    ]);

    for (const [k, v] of Object.entries(payload)) {
      if (!standardKeys.includes(k) && !excludedInternalKeys.has(k) && v !== undefined && v !== null) {
        clean[k] = v;
      }
    }

    return clean;
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
   * Validates required tournament payload fields according to platform schema
   */
  validateTournamentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return 'Tournament payload is empty or invalid.';
    }

    const placeholderPattern = /^(title|game|mode|map|date|time|description|https?:\/\/example\.com\/placeholder.*)$/i;

    // title
    if (!payload.title || (typeof payload.title === 'string' && payload.title.trim() === '')) {
      return "Required tournament field 'title' could not be extracted from the uploaded document.";
    }
    if (typeof payload.title === 'string' && placeholderPattern.test(payload.title.trim())) {
      return "Required tournament field 'title' contains invalid placeholder value.";
    }

    // game
    if (!payload.game || (typeof payload.game === 'string' && payload.game.trim() === '')) {
      return "Required tournament field 'game' could not be extracted from the uploaded document.";
    }
    if (typeof payload.game === 'string' && placeholderPattern.test(payload.game.trim())) {
      return "Required tournament field 'game' contains invalid placeholder value.";
    }

    // mode
    if (!payload.mode || (typeof payload.mode === 'string' && payload.mode.trim() === '')) {
      return "Required tournament field 'mode' could not be extracted from the uploaded document.";
    }
    if (typeof payload.mode === 'string' && placeholderPattern.test(payload.mode.trim())) {
      return "Required tournament field 'mode' contains invalid placeholder value.";
    }

    // prizePool: numeric validation (0 or greater is valid)
    if (
      payload.prizePool === undefined ||
      payload.prizePool === null ||
      payload.prizePool === '' ||
      (typeof payload.prizePool === 'number' && Number.isNaN(payload.prizePool))
    ) {
      return "Required tournament field 'prizePool' could not be extracted from the uploaded document.";
    }
    if (typeof payload.prizePool === 'string') {
      const cleaned = payload.prizePool.replace(/[^0-9.-]+/g, '');
      const num = Number(cleaned);
      if (!cleaned || Number.isNaN(num) || num < 0) {
        return "Required tournament field 'prizePool' must be a valid non-negative number.";
      }
      payload.prizePool = num;
    }
    if (typeof payload.prizePool !== 'number' || Number.isNaN(payload.prizePool) || payload.prizePool < 0) {
      return "Required tournament field 'prizePool' must be a valid non-negative number.";
    }

    // entryFee: 0 is completely valid!
    if (
      payload.entryFee === undefined ||
      payload.entryFee === null ||
      payload.entryFee === '' ||
      (typeof payload.entryFee === 'number' && Number.isNaN(payload.entryFee))
    ) {
      return "Required tournament field 'entryFee' must be a valid number (0 is allowed).";
    }
    if (typeof payload.entryFee === 'string') {
      const cleaned = payload.entryFee.replace(/[^0-9.-]+/g, '');
      const num = Number(cleaned);
      if (Number.isNaN(num)) {
        return "Required tournament field 'entryFee' must be a valid number.";
      }
      payload.entryFee = num;
    }
    if (typeof payload.entryFee !== 'number' || Number.isNaN(payload.entryFee)) {
      return "Required tournament field 'entryFee' must be a valid number.";
    }

    // slots
    if (
      payload.slots === undefined ||
      payload.slots === null ||
      payload.slots === '' ||
      (typeof payload.slots === 'number' && Number.isNaN(payload.slots))
    ) {
      return "Required tournament field 'slots' must be a valid positive number.";
    }
    if (typeof payload.slots === 'string') {
      const cleaned = payload.slots.replace(/[^0-9.-]+/g, '');
      const num = Number(cleaned);
      if (!cleaned || Number.isNaN(num) || num <= 0) {
        return "Required tournament field 'slots' must be a valid positive number.";
      }
      payload.slots = num;
    }
    if (typeof payload.slots !== 'number' || Number.isNaN(payload.slots) || payload.slots <= 0) {
      return "Required tournament field 'slots' must be a valid positive number.";
    }

    if (!payload.date || (typeof payload.date === 'string' && payload.date.trim() === '')) {
      return "Required tournament field 'date' could not be extracted from the uploaded document.";
    }
    if (!payload.time || (typeof payload.time === 'string' && payload.time.trim() === '')) {
      return "Required tournament field 'time' could not be extracted from the uploaded document.";
    }
    if (!payload.map || (typeof payload.map === 'string' && payload.map.trim() === '')) {
      return "Required tournament field 'map' could not be extracted from the uploaded document.";
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

        // Extract full descriptive error message from backend response
        let detailMsg = '';
        if (data.errors) {
          detailMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
        } else if (data.message) {
          detailMsg = data.message;
        } else if (data.error) {
          detailMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else if (data.detail) {
          detailMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.details) {
          detailMsg = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
        } else if (data.msg) {
          detailMsg = data.msg;
        } else {
          detailMsg = text || response.statusText || `HTTP ${response.status}`;
        }

        console.error(`\n======================================================`);
        console.error(`❌ HTTP REQUEST REJECTED: ${method} ${targetUrl}`);
        console.error(`HTTP Status     : ${response.status} ${response.statusText || ''}`);
        console.error(`Validation Msg  : ${detailMsg}`);
        console.error(`Response Body   :`, JSON.stringify(data, null, 2));
        console.error(`Request Payload :`, JSON.stringify(payload, null, 2));
        console.error(`======================================================\n`);

        const err = new Error(`HTTP ${response.status} (${response.statusText || 'Error'}): ${detailMsg}`);
        err.status = response.status;
        err.statusText = response.statusText;
        err.responseBody = data;
        err.validationMessage = detailMsg;
        err.requestPayload = payload;
        err.targetUrl = targetUrl;
        err.method = method;

        // Check if retryable
        const isRetryable = response.status === 408 || response.status === 429 || response.status >= 500;
        if (isRetryable && attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 200;
          console.warn(`[WebsiteCreateTournamentExecutor] Attempt #${attempt} returned HTTP ${response.status}. Retrying in ${backoffMs}ms...`);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        throw err;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries && err.status && (err.status === 408 || err.status === 429 || err.status >= 500)) {
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
