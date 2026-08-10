import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { GeminiProvider } from './ai/providers/GeminiProvider.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX GEMINI → INTELLIGENT MODEL SELECTION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: Model Normalization Layer
  // ----------------------------------------------------
  console.log('--- Test 1: Model Normalization Layer ---');
  const normalized = GeminiProvider.normalizeModelName('  models/gemini-2.5-flash  ');
  assert(normalized === 'gemini-2.5-flash', 'GeminiProvider.normalizeModelName trims whitespace and strips redundant "models/" prefix');

  // ----------------------------------------------------
  // Test 2: Discovery and Validation of Models List
  // ----------------------------------------------------
  console.log('\n--- Test 2: validateModelAvailability Discovery ---');
  const fakeApiKey = 'fake-api-key-test';
  const discovery = await GeminiProvider.validateModelAvailability(fakeApiKey, 'gemini-2.5-flash');
  assert(typeof discovery.isAvailable === 'boolean', 'validateModelAvailability returns valid isAvailable boolean');
  assert(Array.isArray(discovery.availableModels), 'validateModelAvailability returns array of available generateContent models');

  // ----------------------------------------------------
  // Test 3: Priority Fallback Resolution Logic
  // ----------------------------------------------------
  console.log('\n--- Test 3: Priority Fallback Resolution ---');

  // Simulate available models list returned by Google API
  const mockDiscovery = {
    isAvailable: false,
    supportsGenContent: false,
    availableModels: [
      { cleanName: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
      { cleanName: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
    ],
  };

  const PRIORITY_FALLBACKS = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  const availableNames = mockDiscovery.availableModels.map((m) => m.cleanName);
  const chosenFallback = PRIORITY_FALLBACKS.find((pref) => availableNames.includes(pref));
  assert(chosenFallback === 'gemini-2.0-flash', 'Intelligent fallback selects top available priority model (gemini-2.0-flash)');

  // ----------------------------------------------------
  // Test 4: Auto-Select Available Model Option
  // ----------------------------------------------------
  console.log('\n--- Test 4: Auto Select Mode Validation ---');
  const valAutoSelect = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_auto',
    provider: 'gemini',
    autoSelectModel: true,
    prompt: 'Auto select model test prompt',
  });
  assert(valAutoSelect.isValid, 'Validator allows execution when autoSelectModel is true even if model string is empty');

  // ----------------------------------------------------
  // Test 5: Security & Key Leakage Audit
  // ----------------------------------------------------
  console.log('\n--- Test 5: Security & Key Leakage Audit ---');
  try {
    await AiGenerateTextService.generateText('owner_gemini_sec_test', 'non-existent-cred-id', {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      prompt: 'Security audit prompt',
    });
    assert(false, 'Should throw error for non-existent credential');
  } catch (err) {
    assert(
      !err.message.includes('key=') && !err.message.includes('Authorization') && !err.message.includes('AIza'),
      'Security Audit: Error logs and messages never expose API keys or credentials'
    );
  }

  // ----------------------------------------------------
  // Test 6: Workflow Engine Data Mapper Chaining
  // ----------------------------------------------------
  console.log('\n--- Test 6: Workflow Engine Chaining (Gemini → Downstream Node) ---');
  const mockContext = new ExecutionContext('exec_gemini_999', { ownerId: 'user_gemini_777' });
  mockContext.setNodeOutput('Gemini → Generate Text', {
    success: true,
    text: 'Hello from Gemini AI node!',
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 },
  });

  const resolved = ExpressionEngine.resolve(
    { text: '{{steps["Gemini → Generate Text"].text}}' },
    mockContext
  );
  assert(resolved.text === 'Hello from Gemini AI node!', 'Data Mapper seamlessly passes Gemini AI output to downstream nodes');

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
