import { Trophy } from 'lucide-react';

export const geminiStructureTournamentManifest = {
  type: 'geminiStructureTournament',
  label: 'Gemini → Structure Tournament',
  category: 'AI / DOCUMENT PROCESSING',
  description: 'Extract tournament data from documents into a strict validated tournament JSON object.',
  icon: Trophy,
  badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  defaultConfig: {
    documentText: '{{steps["Document → Extract Content"].content.text}}',
    model: 'gemini-1.5-pro',
    temperature: 0.0,
    systemPrompt: `You are a strict tournament document extraction engine.

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

Return valid JSON only.`,
  },
  inputs: [
    {
      id: 'input',
      label: 'Document Content',
      type: 'target',
    },
  ],
  outputs: [
    {
      id: 'output',
      label: 'Tournament Data',
      type: 'source',
    },
  ],
  searchKeywords: [
    'tournament',
    'structure tournament',
    'gemini tournament',
    'esports',
    'ai tournament',
    'extract tournament',
    'apex',
    'valorant',
  ],
};
