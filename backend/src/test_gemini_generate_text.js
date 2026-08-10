import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { AiNodeExecutor } from './ai/executors/AiNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';
import { GeminiProvider } from './ai/providers/GeminiProvider.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX GEMINI → MODEL SELECTION TEST SUITE');
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
  // Test 1: Custom Model Identifier (e.g. gemini-2.5-flash)
  // ----------------------------------------------------
  console.log('--- Test 1: Custom Model Identifier Propagation (gemini-2.5-flash) ---');
  const normalizedCustom = GeminiProvider.normalizeModelName('gemini-2.5-flash');
  assert(normalizedCustom === 'gemini-2.5-flash', 'GeminiProvider.normalizeModelName preserves custom model "gemini-2.5-flash" without hardcoded override');

  const valCustom = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    prompt: 'Test custom model',
  });
  assert(valCustom.isValid && valCustom.model === 'gemini-2.5-flash', 'Validator retains custom model "gemini-2.5-flash"');

  // ----------------------------------------------------
  // Test 2: Predefined Model Identifier
  // ----------------------------------------------------
  console.log('\n--- Test 2: Predefined Model Identifier (gemini-1.5-pro) ---');
  const normalizedPredefined = GeminiProvider.normalizeModelName('gemini-1.5-pro');
  assert(normalizedPredefined === 'gemini-1.5-pro', 'GeminiProvider.normalizeModelName handles predefined model "gemini-1.5-pro"');

  // ----------------------------------------------------
  // Test 3: Fallback to Valid Default Model When Unspecified
  // ----------------------------------------------------
  console.log('\n--- Test 3: Unspecified / Empty Model Fallback ---');
  const normalizedDefault = GeminiProvider.normalizeModelName('');
  assert(normalizedDefault === 'gemini-1.5-flash', 'GeminiProvider.normalizeModelName falls back to "gemini-1.5-flash" when model is empty');

  // ----------------------------------------------------
  // Test 4: Custom Model with Whitespace and Models/ Prefix
  // ----------------------------------------------------
  console.log('\n--- Test 4: Whitespace and Prefix Trimming ---');
  const normalizedWhitespace = GeminiProvider.normalizeModelName('   models/gemini-2.5-flash   ');
  assert(normalizedWhitespace === 'gemini-2.5-flash', 'GeminiProvider.normalizeModelName trims whitespace and strips redundant "models/" prefix');

  // ----------------------------------------------------
  // Test 5: Invalid/Empty Custom Model Validation
  // ----------------------------------------------------
  console.log('\n--- Test 5: Empty Model Validation Error ---');
  const valEmptyModel = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    model: '   ',
    prompt: 'Test prompt',
  });
  assert(!valEmptyModel.isValid && valEmptyModel.errors.some(e => e.includes('model')), 'Validator rejects empty custom model with clear error');

  // ----------------------------------------------------
  // Test 6: Security Audit (No Key Leakage in Payload/Logs)
  // ----------------------------------------------------
  console.log('\n--- Test 6: Security & Key Leakage Audit ---');
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
  // Test Group 7: Engine Registry Wiring & Workflow Execution Context
  // ----------------------------------------------------
  console.log('\n--- Test Group 7: Workflow Engine Chaining (Gemini → Discord) ---');

  const mockContext = new ExecutionContext('exec_gemini_002', { ownerId: 'user_gemini_999' });
  mockContext.setNodeOutput('Gemini → Generate Text', {
    success: true,
    text: 'Hello Divyansh! This response was generated by Gemini 2.5 Flash.',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    usage: { promptTokens: 12, completionTokens: 18, totalTokens: 30 },
  });

  const discordConfig = {
    credentialId: 'cred_discord_777',
    channelId: 'ch_55555',
    content: '{{steps["Gemini → Generate Text"].text}}',
  };

  const resolvedDiscordConfig = ExpressionEngine.resolve(discordConfig, mockContext);
  assert(
    resolvedDiscordConfig.content === 'Hello Divyansh! This response was generated by Gemini 2.5 Flash.',
    'Discord node seamlessly receives Gemini custom model output via Data Mapper'
  );

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
