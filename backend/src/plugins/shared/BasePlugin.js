export class BasePlugin {
  constructor(manifest) {
    this.name = manifest.name;
    this.displayName = manifest.displayName;
    this.version = manifest.version || '1.0';
    this.icon = manifest.icon;
    this.category = manifest.category || 'Action';
    this.actions = manifest.actions || [];
  }

  async executeAction(actionName, payload, credentialSecret) {
    throw new Error(`executeAction must be implemented by ${this.constructor.name}`);
  }
}
