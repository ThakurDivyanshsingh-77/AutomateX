import { Repeat } from 'lucide-react';

export const forEachTournamentManifest = {
  type: 'forEachTournament',
  label: 'For Each Tournament',
  category: 'CONTROL / FLOW',
  description: 'Iterate over extracted tournaments array or single tournament object.',
  icon: Repeat,
  badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  defaultConfig: {
    tournaments: '{{steps["Gemini → Structure Tournament"].tournaments}}',
    batchSize: 1,
    concurrency: 1,
  },
  inputs: [
    {
      id: 'input',
      label: 'Tournaments Collection',
      type: 'target',
    },
  ],
  outputs: [
    {
      id: 'output',
      label: 'Current Tournament Item',
      type: 'source',
    },
  ],
  searchKeywords: [
    'loop',
    'for each tournament',
    'iterate tournaments',
    'tournament loop',
    'batch tournament',
    'control flow',
  ],
};
