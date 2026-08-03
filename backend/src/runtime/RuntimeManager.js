import { TriggerRegistry } from './registry/TriggerRegistry.js';
import { RuntimeEventBus } from './eventBus/RuntimeEventBus.js';
import { QueueProducer } from './queue/QueueProducer.js';
import { Execution } from '../models/Execution.js';
import mongoose from 'mongoose';

export class RuntimeManager {
  static async triggerExecution(triggerType, workflow, payload = {}) {
    // 1. Format Trigger Event payload
    const triggerHandler = TriggerRegistry.getTrigger(triggerType);
    const formattedEvent = triggerHandler.formatEvent(payload);

    // 2. Emit Runtime Event to EventBus
    RuntimeEventBus.emit('workflow:trigger', {
      workflowId: workflow._id,
      triggerType,
      event: formattedEvent,
    });

    let executionId = 'exec_' + Date.now();

    // 3. Create Execution record with status = 'queued'
    if (mongoose.connection.readyState === 1) {
      const executionRecord = await Execution.create({
        workflow: workflow._id,
        owner: workflow.owner,
        status: 'queued',
        startedAt: new Date(),
      });
      executionId = executionRecord._id.toString();
    }

    // 4. Enqueue Job for Background Processing
    await QueueProducer.addExecutionJob({
      executionId,
      workflowId: workflow._id.toString(),
      ownerId: workflow.owner ? workflow.owner.toString() : null,
      definition: workflow.definition,
      triggerEvent: formattedEvent,
    });

    return {
      success: true,
      executionId,
      status: 'queued',
      message: `Workflow queued for ${triggerType} execution`,
    };
  }
}
