import { BaseExecutor } from './BaseExecutor.js';

export class LogExecutor extends BaseExecutor {
  async execute(node, context) {
    const messageTemplate = node.config?.message || 'Logged workflow payload step.';
    const inputData = context.currentData || {};

    const logOutput = {
      message: messageTemplate,
      payload: inputData,
      loggedAt: new Date().toISOString(),
    };

    console.log(`[Workflow Engine Log - ${node.id}]:`, messageTemplate, inputData);

    return {
      status: 'success',
      output: logOutput,
    };
  }
}
