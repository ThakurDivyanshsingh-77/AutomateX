import { asyncHandler } from '../utils/asyncHandler.js';
import { Execution } from '../models/Execution.js';
import { DeadLetterQueue } from '../services/DeadLetterQueue.js';
import { FailureRecovery } from '../services/FailureRecovery.js';
import { executionService } from '../services/executionService.js';
import mongoose from 'mongoose';

// ─── Stats ────────────────────────────────────────────────────────────────────

// @desc    Get reliability dashboard stats
// @route   GET /api/v1/reliability/stats
// @access  Private
export const getReliabilityStats = asyncHandler(async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.user._id);

  const [execStats, dlqCounts] = await Promise.all([
    Execution.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          succeeded: { $sum: { $cond: [{ $in: ['$status', ['success', 'completed']] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          running: { $sum: { $cond: [{ $in: ['$status', ['running', 'pending', 'queued']] }, 1, 0] } },
          timeout: { $sum: { $cond: [{ $eq: ['$status', 'timeout'] }, 1, 0] } },
          // Count executions that had retries (recovered)
          recovered: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['success', 'completed']] },
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: { $ifNull: ['$logs', []] },
                              as: 'log',
                              cond: { $eq: ['$$log.status', 'recovered'] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    DeadLetterQueue.getCounts(ownerId),
  ]);

  const stats = execStats[0] || {
    total: 0, succeeded: 0, failed: 0, running: 0, timeout: 0, recovered: 0,
  };

  return res.status(200).json({
    success: true,
    stats: {
      total: stats.total || 0,
      running: stats.running || 0,
      succeeded: stats.succeeded || 0,
      failed: stats.failed || 0,
      recovered: stats.recovered || 0,
      timeout: stats.timeout || 0,
      deadLetter: dlqCounts.dead || 0,
      successRate: stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0,
    },
  });
});

// ─── Failed Executions ────────────────────────────────────────────────────────

// @desc    List failed executions with pagination
// @route   GET /api/v1/reliability/failures
// @access  Private
export const getFailedExecutions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {
    owner: req.user._id,
    status: { $in: ['failed', 'timeout', 'cancelled'] },
  };

  if (search) {
    filter.$or = [
      { workflowName: new RegExp(search, 'i') },
      { 'error.message': new RegExp(search, 'i') },
    ];
  }

  const [failures, total] = await Promise.all([
    Execution.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workflow', 'name')
      .select('workflowName status error duration logs startedAt finishedAt triggerType')
      .lean(),
    Execution.countDocuments(filter),
  ]);

  // Add retry summary to each execution
  const enriched = failures.map(exec => {
    const totalRetryAttempts = (exec.logs || []).reduce((sum, log) => {
      return sum + ((log.retryAttempts || []).length > 1 ? log.retryAttempts.length - 1 : 0);
    }, 0);
    const hasTimedOut = (exec.logs || []).some(log =>
      (log.retryAttempts || []).some(a => a.isTimeout)
    );
    return { ...exec, totalRetryAttempts, hasTimedOut };
  });

  return res.status(200).json({
    success: true,
    failures: enriched,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

// ─── Dead Letter Queue ────────────────────────────────────────────────────────

// @desc    List DLQ items
// @route   GET /api/v1/reliability/dead-letter
// @access  Private
export const getDeadLetterQueue = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status = null } = req.query;
  const result = await DeadLetterQueue.list(req.user._id, { status, page: parseInt(page), limit: parseInt(limit) });

  return res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Replay a DLQ item (re-trigger its workflow)
// @route   POST /api/v1/reliability/dead-letter/:id/replay
// @access  Private
export const replayDeadLetterItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { item, triggerPayload, workflowId } = await DeadLetterQueue.prepareReplay(id, req.user._id);

  // Re-run the workflow with original trigger payload
  const result = await executionService.runWorkflow(req.user._id, workflowId, triggerPayload);

  // If replay succeeded, resolve the DLQ item
  if (result.status === 'success' || result.status === 'completed') {
    await DeadLetterQueue.resolve(id, req.user._id).catch(() => {});
  }

  return res.status(200).json({
    success: true,
    message: 'Workflow replayed from Dead Letter Queue',
    dlqItemId: id,
    execution: result,
  });
});

// @desc    Delete a DLQ item
// @route   DELETE /api/v1/reliability/dead-letter/:id
// @access  Private
export const deleteDeadLetterItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await DeadLetterQueue.purge(id, req.user._id);

  return res.status(200).json({
    success: true,
    message: 'DLQ item permanently deleted',
  });
});

// ─── Retry & Resume ───────────────────────────────────────────────────────────

// @desc    Manually retry a failed execution
// @route   POST /api/v1/reliability/retry/:executionId
// @access  Private
export const retryExecution = asyncHandler(async (req, res) => {
  const { executionId } = req.params;

  const failedExecution = await Execution.findOne({
    _id: executionId,
    owner: req.user._id,
    status: { $in: ['failed', 'timeout', 'cancelled'] },
  }).lean();

  if (!failedExecution) {
    return res.status(404).json({ success: false, message: 'Failed execution not found' });
  }

  // Re-run via executionService using the same workflowId
  const result = await executionService.runWorkflow(req.user._id, failedExecution.workflow);

  return res.status(200).json({
    success: true,
    message: 'Execution retried successfully',
    originalExecutionId: executionId,
    execution: result,
  });
});

// @desc    Resume a failed execution from the last successful node
// @route   POST /api/v1/reliability/resume/:executionId
// @access  Private
export const resumeExecution = asyncHandler(async (req, res) => {
  const { executionId } = req.params;

  const summary = await FailureRecovery.getRecoverySummary(executionId, req.user._id);
  if (!summary.canResume) {
    return res.status(400).json({
      success: false,
      message: `Execution cannot be resumed (status: ${summary.status})`,
    });
  }

  const result = await FailureRecovery.resumeExecution(executionId, req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Execution resumed from last successful node',
    recoverySummary: summary,
    result,
  });
});

// @desc    Get recovery summary for a specific execution
// @route   GET /api/v1/reliability/recovery/:executionId
// @access  Private
export const getRecoverySummary = asyncHandler(async (req, res) => {
  const { executionId } = req.params;
  const summary = await FailureRecovery.getRecoverySummary(executionId, req.user._id);

  return res.status(200).json({
    success: true,
    summary,
  });
});
