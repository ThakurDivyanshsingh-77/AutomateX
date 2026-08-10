import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { AiNodeExecutor } from './ai/executors/AiNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';
import { GeminiProvider } from './ai/providers/GeminiProvider.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX GEMINI → GENERATE TEXT TEST SUITE');
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
  // Test Group 1: Gemini Generate Text Validator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: Gemini Generate Text Validator Unit Tests ---');

  // Test 1.1: Missing credential
  const valNoCred = AiGenerateTextValidator.validate({
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt: 'Write a welcome message',
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('credential')), 'Rejects configuration with missing Gemini credential');

  // Test 1.2: Empty prompt
  const valEmptyPrompt = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt: '   ',
  });
  assert(!valEmptyPrompt.isValid && valEmptyPrompt.errors.includes('Prompt cannot be empty.'), 'Rejects configuration with empty prompt');

  // Test 1.3: Temperature out of bounds (T > 2)
  const valTempHigh = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    prompt: 'Hello Gemini',
    temperature: 2.5,
  });
  assert(!valTempHigh.isValid && valTempHigh.errors.some(e => e.includes('Temperature')), 'Rejects temperature > 2.0');

  // Test 1.4: Max tokens negative
  const valTokensInvalid = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    prompt: 'Hello Gemini',
    maxTokens: 0,
  });
  assert(!valTokensInvalid.isValid && valTokensInvalid.errors.some(e => e.includes('Max Tokens')), 'Rejects non-positive max tokens');

  // Test 1.5: Valid Gemini config
  const valValid = AiGenerateTextValidator.validate({
    credentialId: 'cred_gemini_123',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt: 'Write a greeting for {{projectName}}',
    temperature: 0.7,
    maxTokens: 500,
  });
  assert(
    valValid.isValid &&
    valValid.credentialId === 'cred_gemini_123' &&
    valValid.provider === 'gemini' &&
    valValid.model === 'gemini-1.5-flash' &&
    valValid.temperature === 0.7 &&
    valValid.maxTokens === 500,
    'Validates correct Gemini → Generate Text configuration'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring for Gemini Node
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor1 = ExecutorRegistry.getExecutor('geminiGenerateText');
    const executor2 = ExecutorRegistry.getExecutor('googleGeminiGenerateText');
    assert(executor1 instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for "geminiGenerateText"');
    assert(executor2 instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for "googleGeminiGenerateText"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Variable Resolution (Data Mapper)
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Variable Resolution (Data Mapper) ---');

  const mockContext = new ExecutionContext('exec_gemini_001', { ownerId: 'user_gemini_789' });
  mockContext.setNodeOutput('Start Trigger', {
    user: {
      name: 'Divyansh',
    },
    projectName: 'AutomateX AI Engine',
  });

  const rawConfig = {
    credentialId: 'cred_gemini_789',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt: 'Create a greeting for {{steps["Start Trigger"].user.name}} regarding {{steps["Start Trigger"].projectName}}.',
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.prompt === 'Create a greeting for Divyansh regarding AutomateX AI Engine.',
    'ExpressionEngine resolves prompt dynamic variables {{steps["Start Trigger"].user.name}} and {{steps["Start Trigger"].projectName}}'
  );

  // ----------------------------------------------------
  // Test Group 4: GeminiProvider Unit & Interface Test
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: GeminiProvider Interface & Output Normalization ---');

  const provider = new GeminiProvider();
  try {
    await provider.generateText({ apiKey: '', prompt: 'Test' });
    assert(false, 'Should throw error when API key is missing');
  } catch (err) {
    assert(err.message.includes('API Key is required'), 'GeminiProvider rejects missing API key with 401 error');
  }

  // ----------------------------------------------------
  // Test Group 5: Credential Security Audit
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Credential Security Audit ---');

  try {
    await AiGenerateTextService.generateText('owner_gemini_security_test', 'non-existent-gemini-cred', {
      provider: 'gemini',
      prompt: 'Hello Gemini',
    });
    assert(false, 'Should fail credential lookup securely');
  } catch (err) {
    assert(
      !err.message.includes('key=') && !err.message.includes('Authorization'),
      'Security Audit: Error messages never expose API keys or authorization headers'
    );
  }

  // ----------------------------------------------------
  // Test Group 6: End-to-End Workflow Chaining: Gemini → Generate Text → Discord → Send Message
  // ----------------------------------------------------
  console.log('\n--- Test Group 6: Workflow Chaining (Gemini → Discord) ---');

  // Simulated output returned by Gemini → Generate Text node
  const mockGeminiOutput = {
    success: true,
    text: 'Hello Divyansh! Welcome to AutomateX AI Engine powered by Google Gemini.',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    usage: {
      promptTokens: 16,
      completionTokens: 22,
      totalTokens: 38,
    },
  };

  mockContext.setNodeOutput('Gemini → Generate Text', mockGeminiOutput);

  // Downstream Discord node configuration consuming Gemini text output
  const discordConfig = {
    credentialId: 'cred_discord_999',
    channelId: 'ch_88888',
    content: '{{steps["Gemini → Generate Text"].text}}',
  };

  const resolvedDiscordConfig = ExpressionEngine.resolve(discordConfig, mockContext);
  assert(
    resolvedDiscordConfig.content === 'Hello Divyansh! Welcome to AutomateX AI Engine powered by Google Gemini.',
    'Discord node seamlessly maps Gemini generated text output via Data Mapper {{steps["Gemini → Generate Text"].text}}'
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
