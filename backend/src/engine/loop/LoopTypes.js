/**
 * Loop Node Constants & Types
 */

export const LoopExecutionMode = Object.freeze({
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
});

export const LoopErrorPolicy = Object.freeze({
  STOP: 'stop',
  SKIP: 'skip',
  CONTINUE: 'continue',
  RETRY: 'retry',
});

export const DEFAULT_LOOP_CONFIG = Object.freeze({
  collection: '',
  itemVariable: 'item',
  indexVariable: 'index',
  maxIterations: 10000,
  batchSize: 1,
  mode: LoopExecutionMode.SEQUENTIAL,
  concurrency: 5,
  continueOnError: false,
  breakOnError: true,
  errorPolicy: LoopErrorPolicy.STOP,
});
