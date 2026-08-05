import { NODE_TYPES } from '../constants/status.js';
import { ManualTriggerExecutor, WebhookTriggerExecutor, ScheduleTriggerExecutor } from './executors/TriggerExecutors.js';
import { HttpRequestExecutor, DelayExecutor, CodeTransformExecutor, ConditionExecutor, LogActionExecutor } from './executors/ActionExecutors.js';

import { LoopExecutor } from './executors/LoopExecutor.js';
import { GoogleSheetsExecutor } from './googleSheets/GoogleSheetsExecutor.js';

class ExecutorRegistry {
  constructor() {
    this.executors = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    // Triggers
    this.register(NODE_TYPES.MANUAL_TRIGGER, new ManualTriggerExecutor());
    this.register(NODE_TYPES.WEBHOOK_TRIGGER, new WebhookTriggerExecutor());
    this.register(NODE_TYPES.SCHEDULE_TRIGGER, new ScheduleTriggerExecutor());

    // Actions
    this.register(NODE_TYPES.HTTP_REQUEST, new HttpRequestExecutor());
    this.register(NODE_TYPES.DELAY, new DelayExecutor());
    this.register(NODE_TYPES.CODE_TRANSFORM, new CodeTransformExecutor());
    this.register(NODE_TYPES.CONDITION, new ConditionExecutor());
    this.register(NODE_TYPES.LOG_ACTION, new LogActionExecutor());
    this.register('loop', new LoopExecutor());
    this.register('googleSheets', new GoogleSheetsExecutor());
  }

  register(nodeType, executorInstance) {
    this.executors.set(nodeType, executorInstance);
  }

  getExecutor(nodeType) {
    const executor = this.executors.get(nodeType);
    if (!executor) {
      throw new Error(`No executor registered for node type: '${nodeType}'`);
    }
    return executor;
  }
}

export const executorRegistry = new ExecutorRegistry();
