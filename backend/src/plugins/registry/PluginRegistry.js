import { GmailPlugin } from '../gmail/GmailPlugin.js';
import { SlackPlugin } from '../slack/SlackPlugin.js';
import { DiscordPlugin } from '../discord/DiscordPlugin.js';
import { TelegramPlugin } from '../telegram/TelegramPlugin.js';
import { HttpPlugin } from '../http/HttpPlugin.js';

export class PluginRegistry {
  static plugins = new Map([
    ['gmail', new GmailPlugin()],
    ['slack', new SlackPlugin()],
    ['discord', new DiscordPlugin()],
    ['telegram', new TelegramPlugin()],
    ['http', new HttpPlugin()],
  ]);

  static getPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered in the ecosystem.`);
    }
    return plugin;
  }

  static listPlugins() {
    return Array.from(this.plugins.values()).map((p) => ({
      name: p.name,
      displayName: p.displayName,
      version: p.version,
      icon: p.icon,
      category: p.category,
      actions: p.actions,
    }));
  }
}
