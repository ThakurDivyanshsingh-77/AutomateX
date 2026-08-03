import { CronScheduler } from '../runtime/scheduler/CronScheduler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get Cron Scheduler health & registered jobs status
// @route   GET /api/v1/runtime/cron/status
// @access  Public / Private
export const getCronStatus = asyncHandler(async (req, res) => {
  const status = CronScheduler.getStatus();
  return res.status(200).json({
    success: true,
    ...status,
  });
});

// @desc    Manually trigger a reload of all published cron workflows
// @route   POST /api/v1/runtime/cron/reload
// @access  Private (JWT)
export const reloadCronJobs = asyncHandler(async (req, res) => {
  await CronScheduler.reloadPublishedWorkflows();
  const status = CronScheduler.getStatus();
  return res.status(200).json({
    success: true,
    message: 'Cron Scheduler reloaded published workflows cleanly',
    ...status,
  });
});
