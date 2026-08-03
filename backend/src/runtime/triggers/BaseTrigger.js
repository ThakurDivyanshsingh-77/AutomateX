export class BaseTrigger {
  formatEvent(payload = {}) {
    throw new Error(`formatEvent must be implemented by ${this.constructor.name}`);
  }
}
