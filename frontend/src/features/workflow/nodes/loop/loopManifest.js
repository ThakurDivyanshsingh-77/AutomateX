export const loopManifest = {
  type: 'loop',
  label: 'Loop (For Each)',
  category: 'Control Flow',
  description: 'Iterate over an array and execute connected nodes once for every item',
  icon: 'Repeat',
  color: '#06b6d4',
  inputs: [
    {
      id: 'input',
      label: 'Input Data',
      type: 'any',
      description: 'Collection array or upstream node payload',
    },
  ],
  outputs: [
    {
      id: 'body',
      label: 'Loop Body',
      type: 'any',
      description: 'Executes per iteration item',
    },
    {
      id: 'completed',
      label: 'Completed',
      type: 'any',
      description: 'Triggers after all iterations finish',
    },
  ],
  defaultConfig: {
    collection: '{{http.data}}',
    itemVariable: 'item',
    indexVariable: 'index',
    maxIterations: 10000,
    batchSize: 1,
    mode: 'sequential',
    concurrency: 5,
    errorPolicy: 'stop',
  },
};
