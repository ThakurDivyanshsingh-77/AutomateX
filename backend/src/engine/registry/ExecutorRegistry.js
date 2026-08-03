import { ManualTriggerExecutor, WebhookTriggerExecutor } from '../executors/TriggerExecutors.js';
import { HttpExecutor } from '../executors/HttpExecutor.js';
import { DelayExecutor } from '../executors/DelayExecutor.js';
import { LogExecutor } from '../executors/LogExecutor.js';
import { EndExecutor } from '../executors/EndExecutor.js';
import { GmailExecutor } from '../executors/GmailExecutor.js';
import { ConditionExecutor } from '../executors/ConditionExecutor.js';
import { TryCatchExecutor } from '../executors/TryCatchExecutor.js';

export class ExecutorRegistry {
  static executors = new Map([
    ['start', new ManualTriggerExecutor()],
    ['webhook', new WebhookTriggerExecutor()],
    ['http', new HttpExecutor()],
    ['delay', new DelayExecutor()],
    ['log', new LogExecutor()],
    ['end', new EndExecutor()],
    ['gmail', new GmailExecutor()],
    ['condition', new ConditionExecutor()],
    ['tryCatch', new TryCatchExecutor()],
  ]);

  static getExecutor(nodeType) {
    const executor = this.executors.get(nodeType);
    if (!executor) {
      throw new Error(`No executor registered for node type: "${nodeType}"`);
    }
    return executor;
  }

  static registerExecutor(nodeType, executorInstance) {
    this.executors.set(nodeType, executorInstance);
  }
}
