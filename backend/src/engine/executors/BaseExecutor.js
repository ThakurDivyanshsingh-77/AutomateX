import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class BaseExecutor {
  async execute(node, context) {
    throw new Error(`execute method must be implemented by ${this.constructor.name}`);
  }

  interpolate(template, context) {
    if (typeof template !== 'string') return template;
    return ExpressionEngine.resolve(template, context);
  }
}
