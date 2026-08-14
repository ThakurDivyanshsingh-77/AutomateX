import { BaseExecutor } from './BaseExecutor.js';
import { GeminiProvider } from '../../ai/providers/GeminiProvider.js';
import { credentialService } from '../../credentials/credentialService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GeminiStructureTournamentExecutor extends BaseExecutor {
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

If a field does not exist in the document, return null.

Return exactly one tournament object unless the document explicitly contains multiple tournaments.

Preserve the original meaning and values from the source document.

Numeric currency fields must be returned as numbers without currency symbols or commas.

Date must be returned as YYYY-MM-DD when the source provides a valid date.

Time must be returned as HH:mm when possible.

Return valid JSON only adhering strictly to this schema:
{
  "title": string or null,
  "game": string or null,
  "mode": string or null,
  "prizePool": number or null,
  "entryFee": number or null,
  "slots": number or null,
  "winnerCount": number or null,
  "firstPrize": number or null,
  "secondPrize": number or null,
  "thirdPrize": number or null,
  "date": string or null,
  "time": string or null,
  "map": string or null,
  "bannerImage": string or null,
  "description": string or null
}`;
  }

  /**
   * Cleans currency/number strings (e.g. "₹10,000" -> 10000)
   */
  static parseNumber(val) {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return Number.isNaN(val) ? null : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]+/g, '');
      if (!cleaned) return null;
      const num = Number(cleaned);
      return Number.isNaN(num) ? null : num;
    }
    return null;
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
      // Map flat prizes to prizeBreakdown if present
      const firstPrize = this.parseNumber(t.firstPrize || t.first || t.prizeBreakdown?.first);
      const secondPrize = this.parseNumber(t.secondPrize || t.second || t.prizeBreakdown?.second);
      const thirdPrize = this.parseNumber(t.thirdPrize || t.third || t.prizeBreakdown?.third);
      const prizePool = this.parseNumber(t.prizePool || t.totalPrize || t.prize);

      let prizeBreakdown = null;
      if (firstPrize !== null || secondPrize !== null || thirdPrize !== null) {
        prizeBreakdown = {
          first: firstPrize || 0,
          second: secondPrize || 0,
          third: thirdPrize || 0,
        };
      }

      return {
        title: t.title || t.name || t.tournamentName || null,
        game: t.game || t.gameName || null,
        mode: t.mode || t.gameMode || null,
        prizePool: prizePool !== null ? prizePool : null,
        entryFee: this.parseNumber(t.entryFee),
        slots: this.parseNumber(t.slots || t.maxTeams || t.maxSlots),
        winnerCount: this.parseNumber(t.winnerCount || t.winners),
        firstPrize: firstPrize !== null ? firstPrize : null,
        secondPrize: secondPrize !== null ? secondPrize : null,
        thirdPrize: thirdPrize !== null ? thirdPrize : null,
        prizeBreakdown,
        date: t.date ? String(t.date).trim() : null,
        time: t.time ? String(t.time).trim() : null,
        map: t.map ? String(t.map).trim() : null,
        bannerImage: t.bannerImage || t.bannerUrl || t.image || null,
        description: t.description || t.rules || null,
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
    if (apiKey && !apiKey.includes('test_mock_') && !apiKey.includes('offline')) {
      const provider = new GeminiProvider({ apiKey });
      const prompt = `${systemPrompt}\n\nDOCUMENT TEXT TO EXTRACT FROM:\n"""\n${documentText}\n"""`;

      try {
        const response = await provider.generateText({
          prompt,
          model,
          temperature,
          maxOutputTokens: 4096,
        });

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

    const firstPrize = GeminiStructureTournamentExecutor.parseNumber(firstPrizeStr);
    const secondPrize = GeminiStructureTournamentExecutor.parseNumber(secondPrizeStr);
    const thirdPrize = GeminiStructureTournamentExecutor.parseNumber(thirdPrizeStr);

    let prizeBreakdown = null;
    if (firstPrize !== null || secondPrize !== null || thirdPrize !== null) {
      prizeBreakdown = {
        first: firstPrize || 0,
        second: secondPrize || 0,
        third: thirdPrize || 0,
      };
    }

    return [
      {
        title: title || null,
        game: game || null,
        mode: mode || null,
        prizePool: GeminiStructureTournamentExecutor.parseNumber(prizePoolStr),
        entryFee: GeminiStructureTournamentExecutor.parseNumber(entryFeeStr),
        slots: GeminiStructureTournamentExecutor.parseNumber(slotsStr),
        winnerCount: GeminiStructureTournamentExecutor.parseNumber(winnerCountStr),
        firstPrize: firstPrize !== null ? firstPrize : null,
        secondPrize: secondPrize !== null ? secondPrize : null,
        thirdPrize: thirdPrize !== null ? thirdPrize : null,
        prizeBreakdown,
        date: date || null,
        time: time || null,
        map: map || null,
        bannerImage: bannerImage || null,
        description: description || null,
      },
    ];
  }
}
