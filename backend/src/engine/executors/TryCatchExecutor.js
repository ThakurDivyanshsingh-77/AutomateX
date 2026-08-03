import { BaseExecutor } from './BaseExecutor.js';

export class TryCatchExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    
    // Output state for tryCatch node
    return {
      output: {
        executed: true,
        mode: 'tryCatch',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
