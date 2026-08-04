import { AIWorkflowService } from './services/ai/AIWorkflowService.js';
import { IntentClassifier } from './services/ai/IntentClassifier.js';

async function runTests() {
  console.log('=== Running AI Intent Validation Subsystem Test Suite ===\n');
  let passed = 0;
  let total = 0;

  function assert(testName, actual, expected) {
    total++;
    const match = JSON.stringify(actual) === JSON.stringify(expected);
    if (match) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
    }
  }

  // Test 1: "Make me coffee" -> Physical Action (REJECTED)
  const res1 = await AIWorkflowService.generate('Make me coffee');
  assert('Prompt: "Make me coffee" -> Rejected', res1.isAutomation, false);
  assert('Prompt: "Make me coffee" -> 0 Nodes Generated', res1.definition.nodes.length, 0);

  // Test 2: "Tell me joke" -> Casual Conversation (REJECTED)
  const res2 = await AIWorkflowService.generate('Tell me joke');
  assert('Prompt: "Tell me joke" -> Rejected', res2.isAutomation, false);
  assert('Prompt: "Tell me joke" -> 0 Nodes Generated', res2.definition.nodes.length, 0);

  // Test 3: "Who is Virat Kohli?" -> Knowledge Question (REJECTED)
  const res3 = await AIWorkflowService.generate('Who is Virat Kohli?');
  assert('Prompt: "Who is Virat Kohli?" -> Rejected', res3.isAutomation, false);
  assert('Prompt: "Who is Virat Kohli?" -> 0 Nodes Generated', res3.definition.nodes.length, 0);

  // Test 4: "When user signs up send email" -> Valid Automation (ACCEPTED)
  const res4 = await AIWorkflowService.generate('When user signs up send email');
  assert('Prompt: "When user signs up send email" -> Accepted', res4.isAutomation, true);
  assert('Prompt: "When user signs up send email" -> Nodes Generated', res4.definition.nodes.length > 0, true);
  assert('Prompt: "When user signs up send email" -> First node Webhook', res4.definition.nodes[0].type, 'webhook');

  // Test 5: "Every 20 minutes send weather" -> Valid Cron Automation (ACCEPTED)
  const res5 = await AIWorkflowService.generate('Every 20 minutes send weather');
  assert('Prompt: "Every 20 minutes send weather" -> Accepted', res5.isAutomation, true);
  assert('Prompt: "Every 20 minutes send weather" -> Nodes Generated', res5.definition.nodes.length > 0, true);
  assert('Prompt: "Every 20 minutes send weather" -> First node Cron', res5.definition.nodes[0].type, 'cron');

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL AI INTENT VALIDATION TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
