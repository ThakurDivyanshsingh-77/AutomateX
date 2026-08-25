import assert from 'assert';
import { 
  GitHubSyncReadmeService, 
  AUTOMATEX_START_MARKER, 
  AUTOMATEX_END_MARKER,
  maskSecret
} from './engine/github/GitHubSyncReadmeService.js';
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { executorRegistry } from './engine/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Test Suite: GitHub -> Sync Profile README Node\n');
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

  // ─── 1. Non-Destructive Marker Injection Tests ─────────────────────────────
  console.log('📦 1. Non-Destructive Marker Injection Tests:');

  test('Preserves content outside existing markers and replaces only inner content', () => {
    const existingReadme = `# Hi, I am Divyansh! 👋
I build awesome automation systems.

${AUTOMATEX_START_MARKER}
### Old Project
Old description
${AUTOMATEX_END_MARKER}

## 📬 Get in touch
Contact me at email@example.com`;

    const newSection = `### [AutomateX](https://github.com/user/automatex)
Enterprise workflow automation platform.
- ⭐ **50 stars** • 💻 **JavaScript**`;

    const injected = GitHubSyncReadmeService.injectManagedSection(existingReadme, newSection);

    assert(injected.includes('# Hi, I am Divyansh! 👋'), 'Should preserve header');
    assert(injected.includes('## 📬 Get in touch'), 'Should preserve footer');
    assert(injected.includes('AutomateX'), 'Should include new project');
    assert(!injected.includes('Old Project'), 'Should remove old project content');
    assert(injected.indexOf(AUTOMATEX_START_MARKER) < injected.indexOf('AutomateX'));
    assert(injected.indexOf('AutomateX') < injected.indexOf(AUTOMATEX_END_MARKER));
  });

  test('Safely appends managed section when markers do not exist', () => {
    const existingReadme = `# Welcome to my GitHub Profile!
Here is my custom bio and skills.`;

    const newSection = `### [RepoA](https://github.com/user/repoa)`;

    const injected = GitHubSyncReadmeService.injectManagedSection(existingReadme, newSection);

    assert(injected.startsWith('# Welcome to my GitHub Profile!'), 'Preserves original top content');
    assert(injected.includes(AUTOMATEX_START_MARKER), 'Appends start marker');
    assert(injected.includes(AUTOMATEX_END_MARKER), 'Appends end marker');
    assert(injected.includes('### [RepoA]'), 'Contains project section');
  });

  test('Handles empty or null existing README safely', () => {
    const newSection = `### [RepoA](https://github.com/user/repoa)`;
    const injected = GitHubSyncReadmeService.injectManagedSection('', newSection);

    assert(injected.includes(AUTOMATEX_START_MARKER));
    assert(injected.includes(AUTOMATEX_END_MARKER));
    assert(injected.includes('### [RepoA]'));
  });

  // ─── 2. Deterministic Template Generation Tests ──────────────────────────
  console.log('\n📄 2. Deterministic Template Generation Tests:');

  const sampleProjects = [
    {
      id: 1,
      name: 'AutomateX',
      htmlUrl: 'https://github.com/user/automatex',
      description: 'Visual workflow builder.',
      language: 'JavaScript',
      stargazersCount: 42,
      topics: ['workflow', 'automation', 'nodejs'],
      updatedAt: '2026-08-25T08:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'MicroService-Kit',
      htmlUrl: 'https://github.com/user/microservice-kit',
      description: 'Distributed microservices toolkit.',
      language: 'Go',
      stargazersCount: 15,
      topics: ['microservices', 'grpc'],
      updatedAt: '2026-08-20T08:00:00Z',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  test('Generates deterministic markdown with stars, language, and topics', () => {
    const md = GitHubSyncReadmeService.generateProjectsMarkdown(sampleProjects, {
      showLanguage: true,
      showStars: true,
      showTopics: true,
      showUpdatedAt: true,
      showDescription: true,
    });

    assert(md.includes('### [AutomateX](https://github.com/user/automatex)'));
    assert(md.includes('Visual workflow builder.'));
    assert(md.includes('⭐ **42 stars**'));
    assert(md.includes('💻 **JavaScript**'));
    assert(md.includes('`workflow`'));
    assert(md.includes('`automation`'));
    assert(md.includes('🕒 Updated: `2026-08-25`'));
  });

  test('Omits disabled fields when configured', () => {
    const md = GitHubSyncReadmeService.generateProjectsMarkdown(sampleProjects, {
      showLanguage: false,
      showStars: false,
      showTopics: false,
      showUpdatedAt: false,
      showDescription: false,
    });

    assert(md.includes('### [AutomateX](https://github.com/user/automatex)'));
    assert(!md.includes('Visual workflow builder.'));
    assert(!md.includes('⭐'));
    assert(!md.includes('💻'));
    assert(!md.includes('🏷️'));
  });

  // ─── 3. Idempotency & Diff Tests ─────────────────────────────────────────
  console.log('\n⚡ 3. Idempotency & Diff Detection Tests:');

  test('hasContentChanged returns false when content is identical', () => {
    const doc1 = `# Profile\n\n${AUTOMATEX_START_MARKER}\n### [RepoA](...)\n${AUTOMATEX_END_MARKER}\n`;
    const doc2 = `# Profile\n\n${AUTOMATEX_START_MARKER}\n### [RepoA](...)\n${AUTOMATEX_END_MARKER}\n`;
    assert.strictEqual(GitHubSyncReadmeService.hasContentChanged(doc1, doc2), false);
  });

  test('hasContentChanged returns true when project content differs', () => {
    const doc1 = `# Profile\n\n${AUTOMATEX_START_MARKER}\n### [RepoA](...)\n${AUTOMATEX_END_MARKER}\n`;
    const doc2 = `# Profile\n\n${AUTOMATEX_START_MARKER}\n### [RepoA](...)\n- ⭐ **5 stars**\n${AUTOMATEX_END_MARKER}\n`;
    assert.strictEqual(GitHubSyncReadmeService.hasContentChanged(doc1, doc2), true);
  });

  // ─── 4. Security & Token Masking Tests ──────────────────────────────────
  console.log('\n🔒 4. Security & Token Masking Tests:');

  test('maskSecret hides sensitive token characters', () => {
    const masked = maskSecret('ghp_abcdef1234567890xyz');
    assert(masked.startsWith('ghp_'));
    assert(masked.endsWith('0xyz'));
    assert(masked.includes('...'));
    assert(!masked.includes('abcdef1234567890'));
  });

  // ─── 5. Executor Registry & Engine DAG Execution Tests ────────────────
  console.log('\n🚀 5. Executor Registry & Engine DAG Execution Tests:');

  await asyncTest('ExecutorRegistry has githubSyncProfileReadme registered in both registries', async () => {
    const { ExecutorRegistry: CentralRegistry } = await import('./engine/registry/ExecutorRegistry.js');
    const centralExecutor = CentralRegistry.getExecutor('githubSyncProfileReadme');
    assert(centralExecutor !== null && centralExecutor !== undefined, 'Central Registry executor should be registered');

    const legacyExecutor = executorRegistry.getExecutor('githubSyncProfileReadme');
    assert(legacyExecutor !== null && legacyExecutor !== undefined, 'Legacy Registry executor should be registered');
  });

  await asyncTest('WorkflowEngine.run executes Cron -> githubSyncProfileReadme -> End without missing executor error', async () => {
    const { WorkflowEngine } = await import('./engine/WorkflowEngine.js');

    const workflowDAG = {
      _id: 'wf_cron_github_sync_end',
      nodes: [
        {
          id: 'node_cron',
          type: 'cron',
          data: { label: 'Cron Schedule' },
          config: { expression: '0 0 * * *' },
        },
        {
          id: 'node_github',
          type: 'githubSyncProfileReadme',
          data: {
            label: 'GitHub Profile README Sync',
            config: {
              repository: 'USERNAME/USERNAME',
              branch: 'main',
              sort: 'updated',
              maxRepositories: 10,
              managedMarkers: true,
              autoCommit: true,
              commitMessage: 'docs: sync profile README',
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
        { id: 'e1', source: 'node_cron', target: 'node_github' },
        { id: 'e2', source: 'node_github', target: 'node_end' },
      ],
    };

    const initialPayload = {
      message: 'AutomateX sync commit [automatex-sync]',
      sender: { login: 'AutomateX Bot' },
    };

    const runResult = await WorkflowEngine.run(workflowDAG, 'exec_test_github_sync', initialPayload);
    assert.strictEqual(runResult.status.toLowerCase(), 'success');
    assert.strictEqual(runResult.logs.length, 3);

    const githubLog = runResult.logs.find((l) => l.nodeId === 'node_github');
    assert(githubLog !== undefined);
    assert.strictEqual(githubLog.status.toLowerCase(), 'success');
  });

  await asyncTest('ExecutionEngine executes workflow with githubSyncProfileReadme (dry-run mode)', async () => {
    const mockWorkflow = {
      _id: 'wf_test_github_sync',
      nodes: [
        {
          id: 'trigger_1',
          type: 'start',
          data: { label: 'Manual Trigger' },
        },
        {
          id: 'github_node_1',
          type: 'githubSyncProfileReadme',
          data: {
            label: 'Sync Profile README',
            config: {
              profileRepo: 'demo/demo',
              readmePath: 'README.md',
              branch: 'main',
              maxProjects: 5,
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger_1', target: 'github_node_1' },
      ],
    };

    // When loop protection trigger event is provided:
    const initialPayload = {
      message: 'AutomateX sync commit [automatex-sync]',
      sender: { login: 'AutomateX Bot' },
    };

    const summary = await ExecutionEngine.executeWorkflow(mockWorkflow, initialPayload, 'MANUAL', 'user_123');
    assert.strictEqual(summary.status, 'SUCCESS');
    assert.strictEqual(summary.stepResults.length, 2);

    const githubStep = summary.stepResults.find((s) => s.nodeId === 'github_node_1');
    assert(githubStep !== undefined);
    assert.strictEqual(githubStep.outputData.skipped, true);
    assert.strictEqual(githubStep.outputData.reason, 'Loop protection: Triggered by previous AutomateX sync commit');
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
