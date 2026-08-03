import { BaseExecutor } from './BaseExecutor.js';

export class DelayExecutor extends BaseExecutor {
  async execute(node, context) {
    const seconds = Math.max(Number(node.config?.seconds) || 1, 0.1);
    const ms = seconds * 1000;

    await new Promise((resolve) => setTimeout(resolve, ms));

    return {
      status: 'success',
      output: {
        delayedSeconds: seconds,
        completedAt: new Date().toISOString(),
      },
    };
  }
}
