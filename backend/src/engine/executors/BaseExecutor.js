export class BaseExecutor {
  async execute(node, context) {
    throw new Error(`execute method must be implemented by ${this.constructor.name}`);
  }
}
