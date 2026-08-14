import { BaseExecutor } from './BaseExecutor.js';
import { GeminiProvider } from '../../ai/providers/GeminiProvider.js';
import { credentialService } from '../../credentials/credentialService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GeminiStructureTournamentExecutor extends BaseExecutor {
  /**
   * System Prompt strictly enforcing zero-hallucination document-to-tournament JSON extraction.
   */
  /**
   * System Prompt strictly enforcing zero-hallucination document-to-tournament JSON extraction.
   */
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

If a field is missing from the document:
- Return an empty string "" for missing string fields.
- Return 0 for missing numeric fields.
- For winnerCount, return "3" if winner count is 3 or unspecified.

Return exactly ONE JSON object adhering strictly to this schema:
{
  "title": "",
  "game": "",
  "mode": "",
  "entryFee": 0,
  "prizePool": "",
  "winnerCount": "3",
  "firstPrize": 0,
  "secondPrize": 0,
  "thirdPrize": 0,
  "slots": 0,
  "date": "",
  "time": "",
  "map": "",
  "roomID": "",
  "password": "",
  "bannerImage": "",
  "description": ""
}

Data type rules:
- entryFee, firstPrize, secondPrize, thirdPrize, slots must be numbers (without currency symbols or commas).
- winnerCount must be a string: "1", "2", or "3".
- prizePool must be a string preserving the formatted value (e.g. "₹10,000" or "$10,000").
- date must be formatted as YYYY-MM-DD if available.
- time must be formatted as HH:mm if available.
- Return valid JSON only.`;
  }

  /**
   * Cleans currency/number strings (e.g. "₹10,000" -> 10000)
   */
  static parseNumber(val, defaultVal = 0) {
    if (val === null || val === undefined || val === '') return defaultVal;
    if (typeof val === 'number') return Number.isNaN(val) ? defaultVal : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      if (!cleaned) return defaultVal;
      const num = Number(cleaned);
      return Number.isNaN(num) ? defaultVal : num;
    }
    return defaultVal;
  }

  /**
   * Sanitizes string values preventing placeholder leakage
   */
  static cleanString(val, keyName = '') {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    if (keyName && s.toLowerCase() === keyName.toLowerCase()) {
      return '';
    }
    return s;
  }

  /**
   * Sanitizes and parses LLM text into JSON
   */
  static parseAndValidateJson(rawResponseText) {
    if (!rawResponseText || typeof rawResponseText !== 'string') {
      throw new Error('Received empty response from AI model.');
    }

    let cleaned = rawResponseText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
    }

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON parsing failed: ${e.message}`);
    }

    // Support single tournament object, array of tournaments, or { tournament: {...} } / { tournaments: [...] }
    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && Array.isArray(parsed.tournaments)) {
      rawList = parsed.tournaments;
    } else if (parsed && parsed.tournament && typeof parsed.tournament === 'object') {
      rawList = [parsed.tournament];
    } else if (parsed && typeof parsed === 'object') {
      rawList = [parsed];
    }

    if (rawList.length === 0) {
      throw new Error('Invalid schema: No tournament object detected in response.');
    }

    const normalizedTournaments = rawList.map((t) => {
      const firstPrize = this.parseNumber(t.firstPrize || t.first || t.prizeBreakdown?.first, 0);
      const secondPrize = this.parseNumber(t.secondPrize || t.second || t.prizeBreakdown?.second, 0);
      const thirdPrize = this.parseNumber(t.thirdPrize || t.third || t.prizeBreakdown?.third, 0);
      
      let prizePool = '';
      if (t.prizePool !== undefined && t.prizePool !== null && t.prizePool !== '') {
        if (typeof t.prizePool === 'number') {
          prizePool = `₹${t.prizePool.toLocaleString()}`;
        } else {
          prizePool = String(t.prizePool).trim();
        }
      } else if (t.totalPrize || t.prize) {
        prizePool = String(t.totalPrize || t.prize).trim();
      }

      let winnerCount = '3';
      if (t.winnerCount !== undefined && t.winnerCount !== null) {
        const wcStr = String(t.winnerCount).replace(/[^123]/g, '');
        if (wcStr === '1' || wcStr === '2' || wcStr === '3') {
          winnerCount = wcStr;
        }
      }

      const prizeBreakdown = {
        first: firstPrize,
        second: secondPrize,
        third: thirdPrize,
      };

      return {
        title: this.cleanString(t.title || t.name || t.tournamentName, 'title'),
        game: this.cleanString(t.game || t.gameName, 'game'),
        mode: this.cleanString(t.mode || t.gameMode, 'mode'),
        entryFee: this.parseNumber(t.entryFee, 0),
        prizePool,
        winnerCount,
        firstPrize,
        secondPrize,
        thirdPrize,
        slots: this.parseNumber(t.slots || t.maxTeams || t.maxSlots, 0),
        date: this.cleanString(t.date, 'date'),
        time: this.cleanString(t.time, 'time'),
        map: this.cleanString(t.map, 'map'),
        roomID: this.cleanString(t.roomID || t.roomId, 'roomID'),
        password: this.cleanString(t.password, 'password'),
        bannerImage: this.cleanString(t.bannerImage || t.bannerUrl || t.image, 'bannerImage'),
        description: this.cleanString(t.description || t.rules, 'description'),
        prizeBreakdown,
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

    console.log(`[GeminiStructureTournamentExecutor] ✓ Successfully structured ${tournaments.length} tournament(s) in ${durationMs}ms:`);
    tournaments.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.title || 'Untitled'} (Game: ${t.game || 'N/A'}, Map: ${t.map || 'N/A'}, Slots: ${t.slots || 'N/A'})`);
    });

    return {
      success: true,
      count: tournaments.length,
      tournament: primaryTournament,
      tournaments,
      currentTournament: primaryTournament,
      rawResponse: rawAiResponse,
      durationMs,
    };
  }

  /**
   * Deterministic zero-hallucination regex parser used as fallback/offline extractor
   */
  deterministicExtract(text) {
    const getValue = (patterns) => {
      for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1]) return m[1].trim();
      }
      return null;
    };

    const title = getValue([
      /(?:Tournament\s*(?:Title|Name)?|Title)\s*[:=-]\s*([^\n\r]+)/i,
      /(?:^|\n)\s*([A-Za-z0-9\s]+Tournament[^\n\r]*)/i,
    ]);

    const game = getValue([
      /(?:Game\s*(?:Name)?)\s*[:=-]\s*([^\n\r,]+)/i,
    ]);

    const mode = getValue([
      /(?:Mode|Game\s*Mode)\s*[:=-]\s*([^\n\r,]+)/i,
    ]);

    const prizePoolStr = getValue([
      /(?:Prize\s*Pool|Total\s*Prize)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const entryFeeStr = getValue([
      /(?:Entry\s*Fee|Fee)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const slotsStr = getValue([
      /(?:Slots|Max\s*Teams|Teams|Total\s*Slots)\s*[:=-]\s*(\d+)/i,
    ]);

    const winnerCountStr = getValue([
      /(?:Winner\s*Count|Winners)\s*[:=-]\s*(\d+)/i,
    ]);

    const firstPrizeStr = getValue([
      /(?:First\s*Prize|1st\s*Prize|1st)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const secondPrizeStr = getValue([
      /(?:Second\s*Prize|2nd\s*Prize|2nd)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const thirdPrizeStr = getValue([
      /(?:Third\s*Prize|3rd\s*Prize|3rd)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const date = getValue([
      /(?:Date|Event\s*Date)\s*[:=-]\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i,
    ]);

    const time = getValue([
      /(?:Time|Start\s*Time)\s*[:=-]\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i,
    ]);

    const map = getValue([
      /(?:Map|Playing\s*Map)\s*[:=-]\s*([^\n\r,]+)/i,
    ]);

    const bannerImage = getValue([
      /(?:Banner\s*(?:Image|URL)?|Image\s*URL)\s*[:=-]\s*(https?:\/\/[^\s\n\r]+)/i,
    ]);

    const description = getValue([
      /(?:Description|Details|Overview)\s*[:=-]\s*([^\n\r]+)/i,
    ]);

    const firstPrize = GeminiStructureTournamentExecutor.parseNumber(firstPrizeStr, 0);
    const secondPrize = GeminiStructureTournamentExecutor.parseNumber(secondPrizeStr, 0);
    const thirdPrize = GeminiStructureTournamentExecutor.parseNumber(thirdPrizeStr, 0);

    const prizeBreakdown = {
      first: firstPrize,
      second: secondPrize,
      third: thirdPrize,
    };

    let winnerCount = '3';
    if (winnerCountStr) {
      const s = String(winnerCountStr).replace(/[^123]/g, '');
      if (s === '1' || s === '2' || s === '3') winnerCount = s;
    }

    return [
      {
        title: GeminiStructureTournamentExecutor.cleanString(title, 'title'),
        game: GeminiStructureTournamentExecutor.cleanString(game, 'game'),
        mode: GeminiStructureTournamentExecutor.cleanString(mode, 'mode'),
        entryFee: GeminiStructureTournamentExecutor.parseNumber(entryFeeStr, 0),
        prizePool: prizePoolStr ? String(prizePoolStr).trim() : '',
        winnerCount,
        firstPrize,
        secondPrize,
        thirdPrize,
        slots: GeminiStructureTournamentExecutor.parseNumber(slotsStr, 0),
        date: GeminiStructureTournamentExecutor.cleanString(date, 'date'),
        time: GeminiStructureTournamentExecutor.cleanString(time, 'time'),
        map: GeminiStructureTournamentExecutor.cleanString(map, 'map'),
        roomID: '',
        password: '',
        bannerImage: GeminiStructureTournamentExecutor.cleanString(bannerImage, 'bannerImage'),
        description: GeminiStructureTournamentExecutor.cleanString(description, 'description'),
        prizeBreakdown,
      },
    ];
  }
}
