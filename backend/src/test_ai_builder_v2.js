import assert from 'assert';
import { AIWorkflowService } from './services/ai/AIWorkflowService.js';
import { IntentClassifier } from './services/ai/IntentClassifier.js';
import { CapabilityRegistry } from './services/ai/CapabilityRegistry.js';
import { CapabilityMatcher } from './services/ai/CapabilityMatcher.js';
import { CredentialValidator } from './services/ai/CredentialValidator.js';
import { FieldValidator } from './services/ai/FieldValidator.js';

async function runTests() {
  console.log('🧪 Starting Test Suite: AutomateX AI Workflow Builder 2.0\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
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

  // ─── 1. Intent Classifier Tests ───────────────────────────────────────────
  console.log('🧠 1. Intent Classification Guardrails:');

  await test('Rejects physical action: "make a coffee"', async () => {
    const res = IntentClassifier.classify('make a coffee');
    assert.strictEqual(res.intent, 'PHYSICAL_ACTION');
    assert.strictEqual(res.isAutomation, false);
    assert(res.suggestions.length > 0);
  });

  await test('Rejects informational question: "How does GitHub work?"', async () => {
    const res = IntentClassifier.classify('How does GitHub work?');
    assert.strictEqual(res.intent, 'INFORMATIONAL');
    assert.strictEqual(res.isAutomation, false);
  });

  await test('Identifies ambiguous request: "send a message"', async () => {
    const res = IntentClassifier.classify('send a message');
    assert.strictEqual(res.intent, 'AMBIGUOUS');
    assert.strictEqual(res.isAutomation, false);
  });

  await test('Rejects impossible task: "backup MongoDB to Mars"', async () => {
    const res = IntentClassifier.classify('backup MongoDB to Mars');
    assert.strictEqual(res.intent, 'IMPOSSIBLE');
    assert.strictEqual(res.isAutomation, false);
  });

  await test('Rejects unsupported integration: "Update my Notion database"', async () => {
    const res = IntentClassifier.classify('When a form is submitted update my Notion database');
    assert.strictEqual(res.intent, 'UNSUPPORTED');
    assert.strictEqual(res.isAutomation, false);
    assert.strictEqual(res.unsupportedTarget, 'Notion');
  });

  // ─── 2. Capability Registry & Matcher Tests ───────────────────────────────
  console.log('\n📦 2. Capability Registry & Matcher Tests:');

  await test('CapabilityRegistry only contains valid node specs', async () => {
    assert(CapabilityRegistry.hasNodeType('start'));
    assert(CapabilityRegistry.hasNodeType('cron'));
    assert(CapabilityRegistry.hasNodeType('webhook'));
    assert(CapabilityRegistry.hasNodeType('discordSendMessage'));
    assert(CapabilityRegistry.hasNodeType('githubSyncProfileReadme'));
    assert(CapabilityRegistry.hasNodeType('githubDailyActivityCommit'));
    assert(!CapabilityRegistry.hasNodeType('coffeeMachine'));
    assert(!CapabilityRegistry.hasNodeType('notionDatabase'));
  });

  await test('CapabilityMatcher matches Discord Live Stream prompt', async () => {
    const matched = CapabilityMatcher.match('every 10 minutes send my live stream link to Discord');
    assert.strictEqual(matched.trigger.nodeType, 'cron');
    assert(matched.actions.some((a) => a.nodeType === 'discordSendEmbed'));
    assert(matched.actions.some((a) => a.nodeType === 'end'));
  });

  await test('CapabilityMatcher matches GitHub Profile README sync prompt', async () => {
    const matched = CapabilityMatcher.match('when a new GitHub repo is created update my profile README');
    assert.strictEqual(matched.trigger.nodeType, 'webhook');
    assert(matched.actions.some((a) => a.nodeType === 'githubSyncProfileReadme'));
  });

  // ─── 3. Full 9-Stage AI Workflow Pipeline Tests ───────────────────────────
  console.log('\n⚡ 3. End-to-End AI Workflow Pipeline (AIWorkflowService):');

  await test('Generates valid workflow: "every 10 minutes send my live stream link to Discord"', async () => {
    const res = await AIWorkflowService.generate('every 10 minutes send my live stream link to Discord');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isAutomation, true);
    assert.strictEqual(res.intent, 'AUTOMATION');
    assert(res.definition.nodes.length >= 3);
    assert.strictEqual(res.definition.nodes[0].type, 'cron');
    assert.strictEqual(res.definition.nodes[1].type, 'discordSendEmbed');
    assert.strictEqual(res.definition.nodes[2].type, 'end');
    assert(res.qualityScore >= 0.8);
    assert.strictEqual(res.checks.intent, true);
    assert.strictEqual(res.checks.nodes, true);
    assert.strictEqual(res.checks.connections, true);
  });

  await test('Generates valid workflow: "every day commit activity to GitHub"', async () => {
    const res = await AIWorkflowService.generate('every day commit activity to GitHub');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isAutomation, true);
    assert.strictEqual(res.definition.nodes[0].type, 'cron');
    assert.strictEqual(res.definition.nodes[1].type, 'githubDailyActivityCommit');
    assert.strictEqual(res.definition.nodes[2].type, 'end');
  });

  await test('Generates valid workflow: "When a new GitHub repo is created update my profile README"', async () => {
    const res = await AIWorkflowService.generate('When a new GitHub repo is created update my profile README');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isAutomation, true);
    assert.strictEqual(res.definition.nodes[0].type, 'webhook');
    assert.strictEqual(res.definition.nodes[1].type, 'githubSyncProfileReadme');
    assert.strictEqual(res.definition.nodes[2].type, 'end');
  });

  await test('Generates valid workflow: "Every morning at 9 AM send Gmail notification report"', async () => {
    const res = await AIWorkflowService.generate('Every morning at 9 AM send Gmail notification report');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isAutomation, true);
    assert.strictEqual(res.definition.nodes[0].type, 'cron');
    assert.strictEqual(res.definition.nodes[1].type, 'gmail');
    assert.strictEqual(res.definition.nodes[2].type, 'end');
  });

  await test('Rejects non-automation prompt without generating broken workflow: "make a coffee"', async () => {
    const res = await AIWorkflowService.generate('make a coffee');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.isAutomation, false);
    assert.strictEqual(res.intent, 'PHYSICAL_ACTION');
    assert.strictEqual(res.definition.nodes.length, 0);
    assert(res.suggestions.length > 0);
  });

  // ─── 4. Credential & Field Validation Tests ───────────────────────────────
  console.log('\n🔒 4. Credential & Field Validation Tests:');

  await test('Detects missing GitHub credentials', async () => {
    const credRes = CredentialValidator.validate(['githubSyncProfileReadme'], {});
    assert.strictEqual(credRes.isValid, false);
    assert(credRes.missingCredentials.includes('github'));
    assert(credRes.guidance.length > 0);
  });

  await test('Passes when credentials exist', async () => {
    const credRes = CredentialValidator.validate(['githubSyncProfileReadme'], { github: 'token_123' });
    assert.strictEqual(credRes.isValid, true);
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
