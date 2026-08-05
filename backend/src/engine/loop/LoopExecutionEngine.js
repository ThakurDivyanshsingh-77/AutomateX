import { LoopScopeStack } from './LoopScopeStack.js';
import { LoopStreamManager } from './LoopStreamManager.js';
import { LoopExecutionMode, LoopErrorPolicy, DEFAULT_LOOP_CONFIG } from './LoopTypes.js';

export class LoopExecutionEngine {
  /**
   * Execute Loop node over collection array.
   * @param {object} nodeToExecute - Loop node definition with config
   * @param {object} context - ExecutionContext RAM state
   * @param {Function} executeSubGraphCallback - Callback function `async (item, scopeStack, index) => result`
   * @returns {Promise<{ success: boolean, totalItems: number, completed: number, failed: number, remaining: number, iterations: Array, executionTime: number, error: Error|null }>}
   */
  static async executeLoop(nodeToExecute, context, executeSubGraphCallback) {
    const startTime = Date.now();
    const rawConfig = { ...DEFAULT_LOOP_CONFIG, ...(nodeToExecute.config || nodeToExecute.data?.config || {}) };
    
    // Resolve collection input from context or node configuration
    const rawCollection = rawConfig.collection !== undefined ? rawConfig.collection : context.currentData;
    const collection = LoopStreamManager.normalizeCollection(rawCollection);

    const maxIterations = Math.max(1, parseInt(rawConfig.maxIterations || 10000, 10));
    const itemsToProcess = collection.slice(0, maxIterations);
    const totalItems = itemsToProcess.length;

    const mode = rawConfig.mode || LoopExecutionMode.SEQUENTIAL;
    const batchSize = Math.max(1, parseInt(rawConfig.batchSize || 1, 10));
    const concurrency = Math.max(1, Math.min(20, parseInt(rawConfig.concurrency || 5, 10)));
    const errorPolicy = rawConfig.errorPolicy || (rawConfig.breakOnError ? LoopErrorPolicy.STOP : LoopErrorPolicy.SKIP);

    const itemVar = rawConfig.itemVariable || 'item';
    const indexVar = rawConfig.indexVariable || 'index';

    // Retrieve or initialize parent scope stack from context
    const parentStack = context.getScopeStack ? context.getScopeStack() : null;

    const iterations = [];
    let completedCount = 0;
    let failedCount = 0;
    let globalError = null;

    console.log(
      `[LoopExecutionEngine] 🔄 Starting Loop Node "${nodeToExecute.id}". Total Items: ${totalItems}, Mode: "${mode.toUpperCase()}", Concurrency: ${concurrency}, Batch Size: ${batchSize}`
    );

    // Batch generator for memory efficiency
    const batchIterator = LoopStreamManager.createBatchIterator(itemsToProcess, batchSize);

    if (mode === LoopExecutionMode.PARALLEL && concurrency > 1) {
      // ----------------------------------------------------
      // PARALLEL BATCH EXECUTION ENGINE (Clean Promise Pool)
      // ----------------------------------------------------
      const resultsMap = new Map();

      // Collect all batches into list
      const batches = Array.from(batchIterator);
      let nextBatchIdx = 0;

      const worker = async () => {
        while (nextBatchIdx < batches.length) {
          if (globalError && errorPolicy === LoopErrorPolicy.STOP) break;
          const currentBatchIdx = nextBatchIdx++;
          const batch = batches[currentBatchIdx];

          for (let bIdx = 0; bIdx < batch.batchItems.length; bIdx++) {
            const item = batch.batchItems[bIdx];
            const index = batch.batchIndices[bIdx];

            if (globalError && errorPolicy === LoopErrorPolicy.STOP) break;

            const iterationScopeStack = new LoopScopeStack(parentStack);
            iterationScopeStack.pushScope({ item, index, total: totalItems, itemVar, indexVar });

            const iterStartTime = Date.now();
            let iterStatus = 'completed';
            let iterError = null;
            let iterResult = null;

            try {
              iterResult = await executeSubGraphCallback(item, iterationScopeStack, index);
              completedCount++;
            } catch (err) {
              failedCount++;
              iterStatus = 'failed';
              iterError = err.message || String(err);

              if (errorPolicy === LoopErrorPolicy.STOP) {
                globalError = err;
              }
            } finally {
              const iterDuration = Date.now() - iterStartTime;
              resultsMap.set(index, {
                iterationIndex: index,
                item,
                status: iterStatus,
                durationMs: iterDuration,
                error: iterError,
                result: iterResult,
              });
            }
          }
        }
      };

      const workerPromises = Array.from({ length: Math.min(concurrency, batches.length) }, () => worker());
      await Promise.all(workerPromises);

      // Re-sort results chronologically by index
      for (let i = 0; i < totalItems; i++) {
        if (resultsMap.has(i)) {
          iterations.push(resultsMap.get(i));
        }
      }
    } else {
      // ----------------------------------------------------
      // SEQUENTIAL EXECUTION ENGINE
      // ----------------------------------------------------
      for (const batch of batchIterator) {
        if (globalError && errorPolicy === LoopErrorPolicy.STOP) break;

        for (let bIdx = 0; bIdx < batch.batchItems.length; bIdx++) {
          const item = batch.batchItems[bIdx];
          const index = batch.batchIndices[bIdx];

          const iterationScopeStack = new LoopScopeStack(parentStack);
          iterationScopeStack.pushScope({ item, index, total: totalItems, itemVar, indexVar });

          const iterStartTime = Date.now();
          let iterStatus = 'completed';
          let iterError = null;
          let iterResult = null;

          try {
            iterResult = await executeSubGraphCallback(item, iterationScopeStack, index);
            completedCount++;
          } catch (err) {
            failedCount++;
            iterStatus = 'failed';
            iterError = err.message || String(err);

            if (errorPolicy === LoopErrorPolicy.STOP) {
              globalError = err;
              break;
            }
          } finally {
            const iterDuration = Date.now() - iterStartTime;
            iterations.push({
              iterationIndex: index,
              item,
              status: iterStatus,
              durationMs: iterDuration,
              error: iterError,
              result: iterResult,
            });
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;
    const remaining = totalItems - (completedCount + failedCount);

    const progressSummary = {
      totalItems,
      completed: completedCount,
      failed: failedCount,
      remaining,
      percent: totalItems > 0 ? Math.round(((completedCount + failedCount) / totalItems) * 100) : 100,
      executionTime,
      iterations,
    };

    console.log(
      `[LoopExecutionEngine] ✅ Loop Node "${nodeToExecute.id}" Finished in ${executionTime}ms. Completed: ${completedCount}/${totalItems}, Failed: ${failedCount}`
    );

    return {
      success: !globalError && failedCount === 0,
      ...progressSummary,
      error: globalError,
    };
  }
}
