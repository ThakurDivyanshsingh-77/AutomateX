import { BaseExecutor } from './BaseExecutor.js';

export class EndExecutor extends BaseExecutor {
  async execute(node, context) {
    return {
      status: 'success',
      output: {
        completed: true,
        finalData: context.currentData || {},
        finishedAt: new Date().toISOString(),
      },
    };
  }
}
