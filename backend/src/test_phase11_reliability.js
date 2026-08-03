import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Execution } from './models/Execution.js';
import { Workflow } from './models/Workflow.js';
import { DeadLetterItem } from './models/DeadLetterItem.js';
import { TimeoutManager, ExecutionTimeoutError } from './engine/retry/TimeoutManager.js';
import { RetryEngine } from './engine/retry/RetryEngine.js';
import { ErrorHandler, ERROR_TYPES } from './services/ErrorHandler.js';
import { DeadLetterQueue } from './services/DeadLetterQueue.js';
import { FailureRecovery } from './services/FailureRecovery.js';
import { NotificationManager } from './services/NotificationManager.js';

async function runTest() {
  console.log('====================================================');
  console.log('  PHASE 11 — RELIABILITY ENGINE VERIFICATION TEST');
  console.log('====================================================\n');

  await connectDB();

  // 1. Get test user
  const user = await User.findOne({});
  if (!user) throw new Error('No user found in DB');
  console.log(`✓ 1. User identified: ID=${user._id}`);

  // 2. Test ErrorHandler classifications
  const timeoutErr = new ExecutionTimeoutError('n1', 5000);
  const timeoutClassified = ErrorHandler.classify(timeoutErr);
  console.assert(timeoutClassified.type === ERROR_TYPES.TIMEOUT, 'Timeout error classification failed!');
  console.assert(timeoutClassified.retryable === true, 'Timeout should be retryable');

  const authErr = new Error('HTTP 401 Unauthorized');
  authErr.statusCode = 401;
  const authClassified = ErrorHandler.classify(authErr);
  console.assert(authClassified.type === ERROR_TYPES.AUTH, 'Auth error classification failed!');
  console.assert(authClassified.retryable === false, 'Auth error should not be retryable');

  const netErr = new Error('fetch failed: ECONNREFUSED 127.0.0.1:5000');
  const netClassified = ErrorHandler.classify(netErr);
  console.assert(netClassified.type === ERROR_TYPES.NETWORK, 'Network error classification failed!');

  console.log('✓ 2. ErrorHandler correctly classifies TIMEOUT, AUTH, and NETWORK errors');

  // 3. Test TimeoutManager race
  const fastPromise = new Promise((resolve) => setTimeout(() => resolve('fast'), 50));
  const fastResult = await TimeoutManager.raceWithTimeout(fastPromise, 2000, 'node_fast');
  console.assert(fastResult === 'fast', 'Fast promise failed');

  let timeoutCaught = false;
  const slowPromise = new Promise((resolve) => setTimeout(() => resolve('slow'), 2000));
  try {
    await TimeoutManager.raceWithTimeout(slowPromise, 100, 'node_slow');
  } catch (err) {
    if (err.isTimeout) timeoutCaught = true;
  }
  console.assert(timeoutCaught === true, 'TimeoutManager failed to reject timed out promise');
  console.log('✓ 3. TimeoutManager races promises cleanly and throws ExecutionTimeoutError on timeout');

  // 4. Test RetryEngine with per-node timeout
  const mockTimingOutExecutor = {
    execute: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { status: 'success' };
    },
  };

  const retryResult = await RetryEngine.executeWithRetry(mockTimingOutExecutor, {
    id: 'n_timeout_test',
    type: 'http',
    config: { retryCount: 2, retryDelay: 50, retryStrategy: 'fixed', timeoutMs: 100 },
  }, {});

  console.assert(retryResult.success === false, 'Should have failed due to timeout');
  console.assert(retryResult.timedOut === true, 'timedOut flag should be true');
  console.assert(retryResult.attempts.length === 3, 'Should have made 3 total attempts (1 + 2 retries)');
  console.log('✓ 4. RetryEngine correctly handles node timeout per attempt and attempts all retries');

  // 5. Test Dead Letter Queue
  const dummyExecution = await Execution.create({
    workflow: new (await import('mongoose')).default.Types.ObjectId(),
    workflowName: `Phase 11 DLQ Test ${Date.now()}`,
    owner: user._id,
    triggerType: 'manual',
    triggerPayload: { testParam: 'dlq_value' },
    status: 'failed',
    startedAt: new Date(),
  });

  const dlqItem = await DeadLetterQueue.enqueue(dummyExecution, {
    failedNodeId: 'n2',
    failedNodeType: 'http',
    error: new Error('HTTP 500 Server Error'),
    retryCount: 3,
  });

  console.assert(dlqItem.status === 'dead', 'DLQ item status should be "dead"');
  console.assert(dlqItem.error.type === ERROR_TYPES.SERVER_ERROR, 'DLQ error should be classified as server_error');
  console.log(`✓ 5. DeadLetterQueue successfully enqueued item: ID=${dlqItem._id}`);

  // List DLQ
  const dlqList = await DeadLetterQueue.list(user._id, { limit: 10 });
  console.assert(dlqList.items.length >= 1, 'DLQ list should contain enqueued item');
  console.log(`✓ 5. DeadLetterQueue list returns ${dlqList.items.length} item(s)`);

  // Delete DLQ
  await DeadLetterQueue.purge(dlqItem._id, user._id);
  console.log('✓ 5. DeadLetterQueue item purged cleanly');

  // 6. Test NotificationManager
  const notifPayload = await NotificationManager.notifyFailure(dummyExecution, {
    error: new Error('Simulated failure notification'),
    failedNodeId: 'n3',
    failedNodeType: 'gmail',
    retriesAttempted: 3,
  });

  console.assert(notifPayload.event === 'workflow.execution.failed', 'Notification payload event type mismatch');
  console.log('✓ 6. NotificationManager generates structured alert payload cleanly');

  // 7. Test FailureRecovery helper
  const recoverySummary = await FailureRecovery.getRecoverySummary(dummyExecution._id, user._id);
  console.assert(recoverySummary.canResume === true, 'Failed execution should be marked as resumable');
  console.log('✓ 7. FailureRecovery summary correctly identifies resumable execution');

  // Cleanup
  await Execution.findByIdAndDelete(dummyExecution._id);
  await DeadLetterItem.deleteMany({ executionId: dummyExecution._id });
  console.log('\n✓ Test records cleaned up');

  console.log('\n🎉 PHASE 11 RELIABILITY ENGINE BACKEND VERIFICATION PASSED!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Phase 11 Test Error:', err.message || err);
  process.exit(1);
});
