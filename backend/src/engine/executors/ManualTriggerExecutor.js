import { BaseExecutor } from './BaseExecutor.js';

export class ManualTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    return {
      status: 'success',
      output: {
        triggeredAt: new Date().toISOString(),
        triggerType: 'manual',
        message: 'Workflow execution initialized',
      },
    };
  }
}
