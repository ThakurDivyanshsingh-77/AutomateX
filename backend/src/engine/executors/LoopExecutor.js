import { LoopExecutionEngine } from '../loop/LoopExecutionEngine.js';

export class LoopExecutor {
  /**
   * Executor method invoked by ExecutorRegistry for loop node type.
   * @param {object} node - Loop node configuration
   * @param {object} context - ExecutionContext state
   * @returns {Promise<{ output: object, loopProgress: object }>}
   */
  async execute(node, context) {
    const rawConfig = node.config || node.data?.config || {};
    
    // Sub-graph runner stub if called standalone or via WorkflowEngine integration
    const subGraphRunner = async (item, scopeStack, index) => {
      // Expose current item and loop metrics into local execution context for downstream node calls
      context.setVariable('item', item);
      context.setVariable('index', index);
      context.setVariable('isFirst', index === 0);
      context.setVariable('isLast', index === scopeStack.getCurrentScope()?.total - 1);
      
      return { status: 'processed', item, index };
    };

    const loopResult = await LoopExecutionEngine.executeLoop(node, context, subGraphRunner);

    return {
      output: {
        totalItems: loopResult.totalItems,
        completed: loopResult.completed,
        failed: loopResult.failed,
        percent: loopResult.percent,
        iterationsCount: loopResult.iterations.length,
      },
      loopProgress: loopResult,
    };
  }
}
