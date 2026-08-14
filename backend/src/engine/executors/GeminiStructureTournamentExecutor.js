import { BaseExecutor } from './BaseExecutor.js';
import { GeminiProvider } from '../../ai/providers/GeminiProvider.js';
import { credentialService } from '../../credentials/credentialService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GeminiStructureTournamentExecutor extends BaseExecutor {
  constructor() {
    super('geminiStructureTournament');
  }

  static getSystemPrompt() {
    return `You are a strict tournament document extraction engine.

Extract tournament information ONLY from the provided document text.

The source document is authoritative.

Never invent values.
Never use example values.
Never use default values.
Never infer missing values.
Never substitute values from previous runs.
Never use values from another document.
Never output field names like "title", "game", "mode", "date", "time", "map", "bannerImage", "description" as placeholder values.

If a field does not exist in the document, return null.

Return exactly ONE JSON object adhering strictly to this schema:
{
  "title": string | null,
  "game": string | null,
  "mode": string | null,
  "entryFee": number | null,
  "prizePool": number | null,
  "winnerCount": number | null,
  "prizeBreakdown": {
    "first": number | null,
    "second": number | null,
    "third": number | null
  },
  "slots": number | null,
  "date": string | null,
  "time": string | null,
  "map": string | null,
  "bannerImage": string | null,
  "description": string | null
}

Data type rules:
- entryFee, first, second, third, slots must be numbers (e.g. 0, 5000, 64) without currency symbols or commas.
- prizePool must be a number (e.g. 10000) or null.
- winnerCount must be an integer (e.g. 3, 2, 1).
- date must be formatted as YYYY-MM-DD if available.
- time must be formatted as HH:mm if available.
- Return valid JSON only without markdown formatting.`;
  }

  static cleanString(val, keyName = '') {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    if (!s) return null;
    if (keyName && s.toLowerCase() === keyName.toLowerCase()) {
      return null;
    }
    return s;
  }

  static parseNumber(val, defaultVal = null) {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'number') return Number.isNaN(val) ? defaultVal : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      if (!cleaned) return defaultVal;
      const num = Number(cleaned);
      return Number.isNaN(num) ? defaultVal : num;
    }
    return defaultVal;
  }

  static parseAndValidateJson(rawResponse) {
    if (!rawResponse || typeof rawResponse !== 'string') {
      return [];
    }

    let cleaned = rawResponse.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          return [];
        }
      } else {
        return [];
      }
    }

    const rawTournaments = Array.isArray(parsed)
      ? parsed
      : parsed?.tournaments && Array.isArray(parsed.tournaments)
      ? parsed.tournaments
      : parsed?.tournament && typeof parsed.tournament === 'object'
      ? [parsed.tournament]
      : parsed && typeof parsed === 'object'
      ? [parsed]
      : [];

    return this.normalizeTournamentList(rawTournaments);
  }

  static normalizeTournamentList(rawList) {
    const normalizedTournaments = rawList.map((t) => {
      const firstPrize = this.parseNumber(t.firstPrize || t.prizeBreakdown?.first, null);
      const secondPrize = this.parseNumber(t.secondPrize || t.prizeBreakdown?.second, null);
      const thirdPrize = this.parseNumber(t.thirdPrize || t.prizeBreakdown?.third, null);

      let prizePool = this.parseNumber(t.prizePool, null);
      if (prizePool === null && (firstPrize || secondPrize || thirdPrize)) {
        prizePool = (firstPrize || 0) + (secondPrize || 0) + (thirdPrize || 0);
      }

      let winnerCount = this.parseNumber(t.winnerCount, null);
      if (winnerCount === null) {
        if (thirdPrize) winnerCount = 3;
        else if (secondPrize) winnerCount = 2;
        else if (firstPrize) winnerCount = 1;
      }

      const prizeBreakdown = {
        first: firstPrize,
        second: secondPrize,
        third: thirdPrize,
      };

      return {
        title: this.cleanString(t.title || t.name || t.tournamentName, 'title'),
        game: this.cleanString(t.game || t.gameName, 'game'),
        mode: this.cleanString(t.mode || t.gameMode || t.tournamentMode, 'mode'),
        entryFee: this.parseNumber(t.entryFee, 0),
        prizePool,
        winnerCount,
        firstPrize,
        secondPrize,
        thirdPrize,
        prizeBreakdown,
        slots: this.parseNumber(t.slots || t.maxCapacity || t.maxTeams || t.maxSlots || t.capacity, null),
        date: this.cleanString(t.date || t.tournamentDate || t.eventDate, 'date'),
        time: this.cleanString(t.time || t.startTime || t.eventTime, 'time'),
        map: this.cleanString(t.map || t.mapName || t.playingMap, 'map'),
        bannerImage: this.cleanString(t.bannerImage || t.bannerImageUrl || t.bannerUrl || t.imageUrl, 'bannerImage'),
        description: this.cleanString(t.description || t.rules || t.details, 'description'),
      };
    });

    return normalizedTournaments;
  }

  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();

    // 1. Resolve Document Text Expression
    let rawText = config.documentText || config.text || config.content || '';
    if (typeof rawText === 'string' && rawText.includes('{{')) {
      rawText = ExpressionEngine.resolve(rawText, context);
    }

    // Fallback search in context data if expression was empty
    if (!rawText && context.currentData) {
      if (context.currentData.content?.text) {
        rawText = context.currentData.content.text;
      } else if (context.currentData.text) {
        rawText = context.currentData.text;
      } else if (typeof context.currentData === 'string') {
        rawText = context.currentData;
      }
    }

    if (!rawText && context.steps) {
      for (const step of Object.values(context.steps)) {
        if (step?.content?.text) {
          rawText = step.content.text;
          break;
        }
        if (step?.text) {
          rawText = step.text;
          break;
        }
      }
    }

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      throw new Error('Document text is empty or could not be resolved for Gemini → Structure Tournament.');
    }

    const documentText = rawText.trim();
    const systemPrompt = config.systemPrompt || GeminiStructureTournamentExecutor.getSystemPrompt();
    const model = config.model || 'gemini-1.5-pro';
    const temperature = typeof config.temperature === 'number' ? config.temperature : 0.0;

    // 2. Resolve Gemini API Key (Credential or Environment Variable)
    let apiKey = null;
    if (config.credentialId) {
      try {
        const userId = context.userId || context.ownerId || context.user?._id;
        const cred = await credentialService.getCredentialById(config.credentialId, userId);
        if (cred?.data?.apiKey) {
          apiKey = cred.data.apiKey;
        }
      } catch (err) {
        console.warn(`[GeminiStructureTournamentExecutor] Failed to load credential ${config.credentialId}: ${err.message}`);
      }
    }

    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    }

    let tournaments = [];
    let rawAiResponse = '';

    // 3. Call Gemini Model or deterministic parser if offline / test mode
    if (apiKey && !config.useDeterministic && process.env.NODE_ENV !== 'test' && !apiKey.includes('test_mock_') && !apiKey.includes('offline')) {
      const provider = new GeminiProvider({ apiKey });
      const prompt = `${systemPrompt}\n\nDOCUMENT TEXT TO EXTRACT FROM:\n"""\n${documentText}\n"""`;

      try {
        const responsePromise = provider.generateText({
          prompt,
          model,
          temperature,
          maxOutputTokens: 4096,
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 4000)
        );
        const response = await Promise.race([responsePromise, timeoutPromise]);

        rawAiResponse = response.text || '';
        tournaments = GeminiStructureTournamentExecutor.parseAndValidateJson(rawAiResponse);
      } catch (aiErr) {
        console.warn(`[GeminiStructureTournamentExecutor] Gemini call failed (${aiErr.message}), falling back to deterministic extraction.`);
        tournaments = this.deterministicExtract(documentText);
      }
    } else {
      // Deterministic rule-based extraction for zero-key local execution & unit tests
      tournaments = this.deterministicExtract(documentText);
    }

    const primaryTournament = tournaments[0] || null;
    const durationMs = Date.now() - startTime;

    // 4. Strict Validation of Required Fields from Extracted Document
    if (!primaryTournament) {
      throw new Error("No tournament structure could be extracted from the uploaded document.");
    }

    const requiredFields = [
      { key: 'game', name: 'game' },
      { key: 'mode', name: 'mode' },
      { key: 'title', name: 'title' },
    ];

    for (const req of requiredFields) {
      const val = primaryTournament[req.key];
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
        throw new Error(`Required tournament field '${req.name}' could not be extracted from the uploaded document.`);
      }
    }

    console.log(`[GeminiStructureTournamentExecutor] ✓ Successfully structured ${tournaments.length} tournament(s) in ${durationMs}ms:`);
    tournaments.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.title || 'Untitled'} (Game: ${t.game || 'N/A'}, Mode: ${t.mode || 'N/A'}, Map: ${t.map || 'N/A'}, Slots: ${t.slots || 'N/A'})`);
    });

    return {
      success: true,
      count: tournaments.length,
      tournament: primaryTournament,
      tournaments,
      currentTournament: primaryTournament,
      rawResponse: rawAiResponse,
      extractionDebug: {
        rawTextReceived: documentText,
        textLength: documentText.length,
        linesCount: documentText.split('\n').length,
      },
      durationMs,
    };
  }

  /**
   * Deterministic zero-hallucination regex parser used as fallback/offline extractor.
   * Dynamically handles tab, colon, pipe, equal separators and variations in field labels.
   */
  deterministicExtract(text) {
    if (!text || typeof text !== 'string') return [];

    const getValue = (patterns) => {
      for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1]) return m[1].trim();
      }
      return null;
    };

    const title = getValue([
      /(?:Tournament\s*(?:Title|Name)?|Title)\s*[:=\t|-]\s*([^\n\r]+)/i,
      /(?:^|\n)\s*([A-Za-z0-9\s]+Tournament[^\n\r]*)/i,
    ]);

    const game = getValue([
      /(?:Game\s*(?:Name)?)\s*[:=\t|-]\s*([^\n\r,]+)/i,
    ]);

    const mode = getValue([
      /(?:Mode|Game\s*Mode|Tournament\s*Mode)\s*[:=\t|-]\s*([^\n\r,]+)/i,
    ]);

    const prizePoolStr = getValue([
      /(?:Total\s*Prize\s*Pool|Total\s*Prize|Prize\s*Pool)\s*[:=\t|-]\s*([^\n\r]+)/i,
    ]);

    const entryFeeStr = getValue([
      /(?:Entry\s*Fee|Fee)\s*[:=\t|-]\s*([^\n\r]+)/i,
    ]);

    const slotsStr = getValue([
      /(?:Max\s*Capacity\s*Slots|Max\s*Capacity|Capacity|Total\s*Slots|Slots|Max\s*Teams|Teams)\s*[:=\t|-]\s*(\d+)/i,
    ]);

    const winnerCountStr = getValue([
      /(?:Winner\s*Count|Winners|Total\s*Winners)\s*[:=\t|-]\s*(\d+)/i,
    ]);

    const firstPrizeStr = getValue([
      /(?:1st\s*Place\s*Prize|1st\s*Prize|First\s*Place\s*Prize|First\s*Prize|1st)\s*[:=\t|-]\s*([^\n\r]+)/i,
    ]);

    const secondPrizeStr = getValue([
      /(?:2nd\s*Place\s*Prize|2nd\s*Prize|Second\s*Place\s*Prize|Second\s*Prize|2nd)\s*[:=\t|-]\s*([^\n\r]+)/i,
    ]);

    const thirdPrizeStr = getValue([
      /(?:3rd\s*Place\s*Prize|3rd\s*Prize|Third\s*Place\s*Prize|Third\s*Prize|3rd)\s*[:=\t|-]\s*([^\n\r]+)/i,
    ]);

    const date = getValue([
      /(?:Tournament\s*Date|Event\s*Date|Date)\s*[:=\t|-]\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i,
    ]);

    const time = getValue([
      /(?:Start\s*Time|Event\s*Time|Time)\s*[:=\t|-]\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i,
    ]);

    const map = getValue([
      /(?:Map\s*Name|Playing\s*Map|Map)\s*[:=\t|-]\s*([^\n\r,]+)/i,
    ]);

    const bannerImage = getValue([
      /(?:Banner\s*Image\s*URL|Banner\s*(?:Image|URL)?|Image\s*URL)\s*[:=\t|-]\s*(https?:\/\/[^\s\n\r]+)/i,
    ]);

    const description = getValue([
      /(?:Description\s*(?:&|\+)?\s*Rules|Description|Rules|Details|Overview)\s*[:=\t|-]\s*([^\n\r]+(?:\n[^\n\r]+)*)/i,
    ]);

    const firstPrize = GeminiStructureTournamentExecutor.parseNumber(firstPrizeStr, null);
    const secondPrize = GeminiStructureTournamentExecutor.parseNumber(secondPrizeStr, null);
    const thirdPrize = GeminiStructureTournamentExecutor.parseNumber(thirdPrizeStr, null);

    const prizeBreakdown = {
      first: firstPrize,
      second: secondPrize,
      third: thirdPrize,
    };

    let prizePool = GeminiStructureTournamentExecutor.parseNumber(prizePoolStr, null);
    if (prizePool === null && (firstPrize || secondPrize || thirdPrize)) {
      prizePool = (firstPrize || 0) + (secondPrize || 0) + (thirdPrize || 0);
    }

    let winnerCount = GeminiStructureTournamentExecutor.parseNumber(winnerCountStr, null);
    if (winnerCount === null) {
      if (thirdPrize) winnerCount = 3;
      else if (secondPrize) winnerCount = 2;
      else if (firstPrize) winnerCount = 1;
    }

    return [
      {
        title: GeminiStructureTournamentExecutor.cleanString(title, 'title'),
        game: GeminiStructureTournamentExecutor.cleanString(game, 'game'),
        mode: GeminiStructureTournamentExecutor.cleanString(mode, 'mode'),
        entryFee: GeminiStructureTournamentExecutor.parseNumber(entryFeeStr, 0),
        prizePool,
        winnerCount,
        firstPrize,
        secondPrize,
        thirdPrize,
        prizeBreakdown,
        slots: GeminiStructureTournamentExecutor.parseNumber(slotsStr, null),
        date: GeminiStructureTournamentExecutor.cleanString(date, 'date'),
        time: GeminiStructureTournamentExecutor.cleanString(time, 'time'),
        map: GeminiStructureTournamentExecutor.cleanString(map, 'map'),
        bannerImage: GeminiStructureTournamentExecutor.cleanString(bannerImage, 'bannerImage'),
        description: GeminiStructureTournamentExecutor.cleanString(description, 'description'),
      },
    ];
  }
}
