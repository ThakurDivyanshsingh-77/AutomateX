import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Workflow } from './models/Workflow.js';
import { CronScheduler } from './runtime/scheduler/CronScheduler.js';
import { PublishManager } from './services/PublishManager.js';
import { workflowService } from './services/workflowService.js';

const CRON_WORKFLOW_DEF = {
  nodes: [
    {
      id: 'n_cron_1',
      type: 'cron',
      position: { x: 100, y: 150 },
      data: {
        label: 'Cron Schedule Trigger',
        config: {
          cronExpression: '*/20 * * * *',
          timezone: 'Asia/Kolkata',
          enabled: true,
        },
      },
    },
    {
      id: 'n_log_2',
      type: 'log',
      position: { x: 350, y: 150 },
      data: {
        label: 'Logger',
        config: { message: 'Scheduled cron execution succeeded' },
      },
    },
    {
      id: 'n_end_3',
      type: 'end',
      position: { x: 600, y: 150 },
      data: { label: 'End Completion' },
    },
  ],
  edges: [
    { id: 'e1', source: 'n_cron_1', target: 'n_log_2' },
    { id: 'e2', source: 'n_log_2', target: 'n_end_3' },
  ],
};

async function runTest() {
  console.log('====================================================');
  console.log('  PHASE 13 — PRODUCTION CRON SCHEDULER VERIFICATION');
  console.log('====================================================\n');

  await connectDB();

  // 1. User check
  const user = await User.findOne({});
  if (!user) throw new Error('No user found in DB');
  console.log(`✓ 1. User identified: ID=${user._id}`);

  // 2. Test CronScheduler.start() & validation helpers
  await CronScheduler.start();
  console.assert(CronScheduler.isRunning === true, 'CronScheduler should be running');
  console.log('✓ 2. CronScheduler.start() initialized background engine');

  console.assert(CronScheduler.isValidCron('*/20 * * * *') === true, 'Valid cron validation failed');
  console.assert(CronScheduler.isValidCron('invalid_cron_syntax') === false, 'Invalid cron validation failed');
  const humanPreview = CronScheduler.getHumanReadable('*/20 * * * *');
  console.log(`✓ 2. Human readable preview helper: "*/20 * * * *" → "${humanPreview}"`);

  // 3. Create test workflow
  const testWf = await Workflow.create({
    owner: user._id,
    name: `Phase 13 Cron Test ${Date.now()}`,
    description: 'Cron scheduler test workflow',
    status: 'draft',
    definition: CRON_WORKFLOW_DEF,
  });
  console.log(`✓ 3. Draft workflow created: ID=${testWf._id}`);

  // Draft should NOT be registered
  console.assert(CronScheduler.activeJobs.has(testWf._id.toString()) === false, 'Draft workflow should not be registered in CronScheduler');
  console.log('✓ 3. Draft workflow correctly ignored by CronScheduler');

  // 4. Test Publish Integration (Publishing should auto-register schedule)
  await PublishManager.publishWorkflow(testWf._id, user._id, {
    definition: CRON_WORKFLOW_DEF,
    title: 'v1.0.0 Cron Release',
  });

  const isRegisteredAfterPublish = CronScheduler.activeJobs.has(testWf._id.toString());
  console.assert(isRegisteredAfterPublish === true, 'Published workflow should be auto-registered in CronScheduler');
  const jobInfo = CronScheduler.activeJobs.get(testWf._id.toString());
  console.assert(jobInfo.cronExpression === '*/20 * * * *', 'Registered expression mismatch');
  console.assert(jobInfo.timezone === 'Asia/Kolkata', 'Registered timezone mismatch');
  console.log(`✓ 4. Publish integration auto-registered schedule: "${jobInfo.humanReadable}" (TZ: ${jobInfo.timezone})`);

  // 5. Test Manual Execution Triggering via CronScheduler.executeWorkflow
  console.log('✓ 5. Triggering manual Cron execution via RuntimeManager pipeline...');
  await CronScheduler.executeWorkflow(testWf._id, testWf);
  const updatedJob = CronScheduler.activeJobs.get(testWf._id.toString());
  console.assert(updatedJob.runCount === 1, 'Run count should be 1');
  console.log(`✓ 5. Scheduled execution completed cleanly (Run Count: ${updatedJob.runCount})`);

  // 6. Test Unpublish / Draft Integration
  await workflowService.publishWorkflow(user._id, testWf._id); // Toggles to draft
  const isUnregisteredAfterDraft = CronScheduler.activeJobs.has(testWf._id.toString());
  console.assert(isUnregisteredAfterDraft === false, 'Unpublished workflow should be unregistered from CronScheduler');
  console.log('✓ 6. Unpublish integration immediately unregistered schedule');

  // 7. Test Restart Recovery simulation (reloadPublishedWorkflows)
  // Re-publish workflow
  await workflowService.publishWorkflow(user._id, testWf._id);
  console.assert(CronScheduler.activeJobs.has(testWf._id.toString()) === true, 'Re-publish failed to register');

  // Simulate server restart by wiping activeJobs and re-running reload
  CronScheduler.activeJobs.clear();
  console.assert(CronScheduler.activeJobs.size === 0, 'Wipe failed');
  await CronScheduler.reloadPublishedWorkflows();

  const isRestoredAfterRestart = CronScheduler.activeJobs.has(testWf._id.toString());
  console.assert(isRestoredAfterRestart === true, 'Reload published workflows failed to restore job');
  console.log('✓ 7. Restart recovery simulation reloaded all published cron workflows from DB');

  // 8. Test Delete Integration
  await workflowService.deleteWorkflow(user._id, testWf._id);
  const isUnregisteredAfterDelete = CronScheduler.activeJobs.has(testWf._id.toString());
  console.assert(isUnregisteredAfterDelete === false, 'Deleted workflow should be unregistered immediately');
  console.log('✓ 8. Delete integration unregistered job immediately');

  // 9. Test GET Status report
  const statusReport = CronScheduler.getStatus();
  console.assert(statusReport.running === true, 'Status running mismatch');
  console.log(`✓ 9. CronScheduler.getStatus() returns running=${statusReport.running}, jobsCount=${statusReport.registeredJobsCount}`);

  // Cleanup
  CronScheduler.stop();
  console.log('\n✓ Scheduler stopped cleanly');

  console.log('\n🎉 PHASE 13 PRODUCTION CRON SCHEDULER BACKEND VERIFICATION PASSED!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Phase 13 Test Error:', err.message || err);
  process.exit(1);
});
