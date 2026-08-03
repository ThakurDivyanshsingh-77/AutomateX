import { DeadLetterItem } from '../models/DeadLetterItem.js';
import { ErrorHandler } from './ErrorHandler.js';

/**
 * DeadLetterQueue — Manages permanently failed executions.
 *
 * When a workflow execution fails with all retries exhausted and no
 * continueOnError / error branch, it lands in the DLQ for later inspection
 * and replay.
 */
export class DeadLetterQueue {
  /**
   * Enqueue a failed execution into the DLQ.
   *
   * @param {Object} execution - Mongoose Execution document
   * @param {Object} options - { failedNodeId, failedNodeType, error, retryCount }
   * @returns {Promise<DeadLetterItem>}
   */
  static async enqueue(execution, { failedNodeId = null, failedNodeType = null, error = null, retryCount = 0 } = {}) {
    const classified = error ? ErrorHandler.serialize(error) : ErrorHandler.serialize(new Error('Unknown execution failure'));

    const item = await DeadLetterItem.create({
      executionId: execution._id,
      workflowId: execution.workflow,
      ownerId: execution.owner,
      workflowName: execution.workflowName || 'Untitled Workflow',
      failedNodeId,
      failedNodeType,
      triggerPayload: execution.triggerPayload || {},
      triggerType: execution.triggerType || 'manual',
      error: classified,
      retryCount,
      status: 'dead',
    });

    console.log(`[DeadLetterQueue]: Execution ${execution._id} enqueued. Failed node: ${failedNodeId || 'unknown'}`);
    return item;
  }

  /**
   * List DLQ items for a user.
   *
   * @param {string} ownerId
   * @param {Object} query - { status, page, limit }
   * @returns {Promise<{ items: Array, total: number, pages: number }>}
   */
  static async list(ownerId, { status = null, page = 1, limit = 20 } = {}) {
    const filter = { ownerId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      DeadLetterItem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('workflowId', 'name')
        .lean(),
      DeadLetterItem.countDocuments(filter),
    ]);

    return {
      items,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  }

  /**
   * Get a single DLQ item by ID.
   */
  static async getById(dlqItemId, ownerId) {
    const item = await DeadLetterItem.findOne({ _id: dlqItemId, ownerId }).lean();
    if (!item) throw new Error('DLQ item not found or access denied');
    return item;
  }

  /**
   * Mark a DLQ item as replaying and return its trigger payload.
   * The caller is responsible for re-triggering the workflow.
   *
   * @param {string} dlqItemId
   * @param {string} ownerId
   * @returns {Promise<{ item: DeadLetterItem, triggerPayload: Object, workflowId: string }>}
   */
  static async prepareReplay(dlqItemId, ownerId) {
    const item = await DeadLetterItem.findOneAndUpdate(
      { _id: dlqItemId, ownerId, status: 'dead' },
      { $set: { status: 'replaying', replayedAt: new Date() } },
      { new: true }
    );

    if (!item) throw new Error('DLQ item not found, already replaying, or access denied');

    return {
      item,
      triggerPayload: item.triggerPayload || {},
      workflowId: item.workflowId,
    };
  }

  /**
   * Mark a DLQ item as resolved.
   */
  static async resolve(dlqItemId, ownerId) {
    const item = await DeadLetterItem.findOneAndUpdate(
      { _id: dlqItemId, ownerId },
      { $set: { status: 'resolved', resolvedAt: new Date() } },
      { new: true }
    );
    if (!item) throw new Error('DLQ item not found or access denied');
    return item;
  }

  /**
   * Permanently delete a DLQ item.
   */
  static async purge(dlqItemId, ownerId) {
    const result = await DeadLetterItem.deleteOne({ _id: dlqItemId, ownerId });
    if (result.deletedCount === 0) throw new Error('DLQ item not found or access denied');
    return { deleted: true };
  }

  /**
   * Get count of DLQ items by status for a user.
   */
  static async getCounts(ownerId) {
    const counts = await DeadLetterItem.aggregate([
      { $match: { ownerId: ownerId instanceof Object ? ownerId : new (await import('mongoose')).default.Types.ObjectId(ownerId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = { dead: 0, replaying: 0, resolved: 0, total: 0 };
    for (const { _id, count } of counts) {
      if (_id in result) result[_id] = count;
      result.total += count;
    }
    return result;
  }
}
