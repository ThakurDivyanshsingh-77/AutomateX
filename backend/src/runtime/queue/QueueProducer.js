import { ExecutionWorker } from '../workers/ExecutionWorker.js';

export class QueueProducer {
  static async addExecutionJob(jobPayload) {
    console.log(`[QueueProducer]: Enqueuing job for execution ${jobPayload.executionId}`);

    // Asynchronous background execution process
    setImmediate(async () => {
      try {
        await ExecutionWorker.processJob(jobPayload);
      } catch (err) {
        console.error(`[QueueProducer]: Background execution error: ${err.message}`);
      }
    });

    return {
      queued: true,
      jobId: jobPayload.executionId,
      enqueuedAt: new Date().toISOString(),
    };
  }
}
