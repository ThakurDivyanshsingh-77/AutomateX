import assert from 'assert';
import { 
  GitHubDailyActivityService,
  DEFAULT_ACTIVITY_FILE,
  DEFAULT_COMMIT_MESSAGE,
  DEFAULT_ACTIVITY_DESCRIPTION
} from './engine/github/GitHubDailyActivityService.js';
import { maskSecret } from './engine/github/GitHubSyncReadmeService.js';
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { executorRegistry } from './engine/ExecutorRegistry.js';
import { ExecutorRegistry as CentralExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';

async function runTests() {
  console.log('🧪 Starting Test Suite: GitHub -> Daily Activity Commit Node\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // ─── 1. Date Detection & Idempotency Tests ─────────────────────────────────
  console.log('📅 1. Date Detection & Idempotency Tests:');

  test('Correctly formats today date string', () => {
    const today = GitHubDailyActivityService.getTodayDateString('UTC');
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'Date should match YYYY-MM-DD');
  });

  test('hasActivityForDate returns true when today is already recorded', () => {
    const activityDoc = `# AutomateX Daily Activity

- 2026-08-24 — AutomateX daily automation heartbeat
- 2026-08-25 — AutomateX daily automation heartbeat
`;
    assert.strictEqual(GitHubDailyActivityService.hasActivityForDate(activityDoc, '2026-08-25'), true);
    assert.strictEqual(GitHubDailyActivityService.hasActivityForDate(activityDoc, '2026-08-26'), false);
  });

  test('appendActivityEntry preserves previous entries and appends new date line', () => {
    const existing = `# AutomateX Daily Activity\n\n- 2026-08-24 — Old heartbeat\n`;
    const updated = GitHubDailyActivityService.appendActivityEntry(existing, '2026-08-25', 'AutomateX daily automation heartbeat');

    assert(updated.includes('- 2026-08-24 — Old heartbeat'), 'Preserves past entries');
    assert(updated.includes('- 2026-08-25 — AutomateX daily automation heartbeat'), 'Appends today entry');
    assert(updated.startsWith('# AutomateX Daily Activity'), 'Maintains markdown header');
  });

  test('appendActivityEntry creates header when file is empty', () => {
    const updated = GitHubDailyActivityService.appendActivityEntry('', '2026-08-25', 'Initial heartbeat');
    assert(updated.startsWith('# AutomateX Daily Activity'));
    assert(updated.includes('- 2026-08-25 — Initial heartbeat'));
  });

  // ─── 2. Security & Token Masking Tests ────────────────────────────────────
  console.log('\n🔒 2. Security & Token Masking Tests:');

  test('Tokens are masked and never exposed in output', () => {
    const masked = maskSecret('ghp_abcdef1234567890xyz');
    assert(masked.startsWith('ghp_'));
    assert(!masked.includes('abcdef1234567890'));
  });

  // ─── 3. Missing Credential Validation ─────────────────────────────────────
  console.log('\n⚠️ 3. Validation & Error Handling Tests:');

  await asyncTest('previewActivityCommit fails with GITHUB_CREDENTIAL_MISSING when no token provided', async () => {
    try {
      await GitHubDailyActivityService.previewActivityCommit({ repository: 'user/repo' }, null);
      assert.fail('Should have thrown error');
    } catch (err) {
      assert.strictEqual(err.code, 'GITHUB_CREDENTIAL_MISSING');
    }
  });

  // ─── 4. Executor Registration Tests ───────────────────────────────────────
  console.log('\n🚀 4. Executor Registry Tests:');

  test('Central ExecutorRegistry has githubDailyActivityCommit registered', () => {
    const centralExecutor = CentralExecutorRegistry.getExecutor('githubDailyActivityCommit');
    assert(centralExecutor !== null && centralExecutor !== undefined, 'Central executor should be registered');
  });

  test('Legacy ExecutorRegistry has githubDailyActivityCommit registered', () => {
    const legacyExecutor = executorRegistry.getExecutor('githubDailyActivityCommit');
    assert(legacyExecutor !== null && legacyExecutor !== undefined, 'Legacy executor should be registered');
  });

  // ─── 5. Full Workflow DAG Execution Tests ─────────────────────────────────
  console.log('\n⚡ 5. Workflow Execution DAG Tests:');

  await asyncTest('WorkflowEngine.run executes Cron -> githubDailyActivityCommit -> End Completion', async () => {
    const workflowDAG = {
      _id: 'wf_cron_github_activity_end',
      nodes: [
        {
          id: 'node_cron',
          type: 'cron',
          data: { label: 'Cron Schedule' },
          config: { expression: '0 0 * * *' },
        },
        {
          id: 'node_github_activity',
          type: 'githubDailyActivityCommit',
          data: {
            label: 'GitHub → Daily Activity Commit',
            config: {
              repository: 'USERNAME/REPOSITORY',
              branch: 'main',
              activityFile: '.github/automatex/activity.md',
              commitMessage: 'chore: daily AutomateX activity',
              dailyDeduplication: true,
              dryRun: true,
            },
          },
        },
        {
          id: 'node_end',
          type: 'end',
          data: { label: 'End Completion' },
        },
      ],
      edges: [
        { id: 'e1', source: 'node_cron', target: 'node_github_activity' },
        { id: 'e2', source: 'node_github_activity', target: 'node_end' },
      ],
    };

    const initialPayload = {
      message: 'AutomateX sync commit [automatex-sync]',
      sender: { login: 'AutomateX Bot' },
    };

    const runResult = await WorkflowEngine.run(workflowDAG, 'exec_test_activity', initialPayload);
    assert.strictEqual(runResult.status.toLowerCase(), 'success');
    assert.strictEqual(runResult.logs.length, 3);

    const activityLog = runResult.logs.find((l) => l.nodeId === 'node_github_activity');
    assert(activityLog !== undefined);
    assert.strictEqual(activityLog.status.toLowerCase(), 'success');
  });

  await asyncTest('ExecutionEngine executes workflow with githubDailyActivityCommit', async () => {
    const mockWorkflow = {
      _id: 'wf_test_activity_exec',
      nodes: [
        {
          id: 'trigger_1',
          type: 'start',
          data: { label: 'Manual Trigger' },
        },
        {
          id: 'activity_node_1',
          type: 'githubDailyActivityCommit',
          data: {
            label: 'Daily Activity Commit',
            config: {
              repository: 'demo/demo',
              branch: 'main',
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger_1', target: 'activity_node_1' },
      ],
    };

    const initialPayload = {
      message: 'AutomateX sync commit [automatex-sync]',
      sender: { login: 'AutomateX Bot' },
    };

    const summary = await ExecutionEngine.executeWorkflow(mockWorkflow, initialPayload, 'MANUAL', 'user_123');
    assert.strictEqual(summary.status, 'SUCCESS');
    assert.strictEqual(summary.stepResults.length, 2);

    const activityStep = summary.stepResults.find((s) => s.nodeId === 'activity_node_1');
    assert(activityStep !== undefined);
    assert.strictEqual(activityStep.outputData.skipped, true);
  });

  console.log('\n──────────────────────────────────────────────');
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
