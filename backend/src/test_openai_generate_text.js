import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { AiNodeExecutor } from './ai/executors/AiNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';
import { OpenAIProvider } from './ai/providers/OpenAIProvider.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX OPENAI → GENERATE TEXT TEST SUITE');
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
  // Test Group 1: OpenAI Generate Text Validator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: OpenAI Generate Text Validator Unit Tests ---');

  // Test 1.1: Missing credential
  const valNoCred = AiGenerateTextValidator.validate({
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a welcome message',
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('credential')), 'Rejects configuration with missing OpenAI credential');

  // Test 1.2: Empty prompt
  const valEmptyPrompt = AiGenerateTextValidator.validate({
    credentialId: 'cred_openai_123',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: '   ',
  });
  assert(!valEmptyPrompt.isValid && valEmptyPrompt.errors.includes('Prompt cannot be empty.'), 'Rejects configuration with empty prompt');

  // Test 1.3: Temperature out of bounds (T > 2)
  const valTempHigh = AiGenerateTextValidator.validate({
    credentialId: 'cred_openai_123',
    prompt: 'Hello OpenAI',
    temperature: 2.5,
  });
  assert(!valTempHigh.isValid && valTempHigh.errors.some(e => e.includes('Temperature')), 'Rejects temperature > 2.0');

  // Test 1.4: Max tokens negative
  const valTokensInvalid = AiGenerateTextValidator.validate({
    credentialId: 'cred_openai_123',
    prompt: 'Hello OpenAI',
    maxTokens: 0,
  });
  assert(!valTokensInvalid.isValid && valTokensInvalid.errors.some(e => e.includes('Max Tokens')), 'Rejects non-positive max tokens');

  // Test 1.5: Valid OpenAI config
  const valValid = AiGenerateTextValidator.validate({
    credentialId: 'cred_openai_123',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a greeting for {{projectName}}',
    temperature: 0.7,
    maxTokens: 500,
  });
  assert(
    valValid.isValid &&
    valValid.credentialId === 'cred_openai_123' &&
    valValid.provider === 'openai' &&
    valValid.model === 'gpt-4o-mini' &&
    valValid.temperature === 0.7 &&
    valValid.maxTokens === 500,
    'Validates correct OpenAI → Generate Text configuration'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring for OpenAI Node
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor1 = ExecutorRegistry.getExecutor('openaiGenerateText');
    const executor2 = ExecutorRegistry.getExecutor('openAiGenerateText');
    assert(executor1 instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for "openaiGenerateText"');
    assert(executor2 instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for "openAiGenerateText"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Variable Resolution via Expression Engine
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Variable Resolution (Data Mapper) ---');

  const mockContext = new ExecutionContext('exec_openai_001', { ownerId: 'user_456' });
  mockContext.setNodeOutput('Start Trigger', {
    user: {
      name: 'Divyansh',
    },
    projectName: 'AutomateX Core Platform',
  });

  const rawConfig = {
    credentialId: 'cred_openai_456',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a greeting for {{steps["Start Trigger"].user.name}} regarding {{steps["Start Trigger"].projectName}}.',
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.prompt === 'Write a greeting for Divyansh regarding AutomateX Core Platform.',
    'ExpressionEngine resolves prompt dynamic variables {{steps["Start Trigger"].user.name}} and {{steps["Start Trigger"].projectName}}'
  );

  // ----------------------------------------------------
  // Test Group 4: Credential Security Audit
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: Credential Security Audit ---');

  try {
    await AiGenerateTextService.generateText('owner_security_test', 'non-existent-cred', {
      prompt: 'Hello OpenAI',
    });
    assert(false, 'Should fail credential lookup securely');
  } catch (err) {
    assert(
      !err.message.includes('sk-') && !err.message.includes('Authorization'),
      'Security Audit: Error messages never expose API keys or authorization headers'
    );
  }

  // ----------------------------------------------------
  // Test Group 5: End-to-End Workflow Chaining: OpenAI → Generate Text → Discord → Send Message
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Workflow Chaining (OpenAI → Discord) ---');

  // Simulated output returned by OpenAI → Generate Text node
  const mockOpenAiOutput = {
    success: true,
    text: 'Hello Divyansh! Welcome to AutomateX Core Platform. We are thrilled to have you onboard.',
    provider: 'openai',
    model: 'gpt-4o-mini',
    usage: {
      promptTokens: 14,
      completionTokens: 21,
      totalTokens: 35,
    },
  };

  mockContext.setNodeOutput('OpenAI → Generate Text', mockOpenAiOutput);

  // Downstream Discord node configuration consuming OpenAI text output
  const discordConfig = {
    credentialId: 'cred_discord_888',
    channelId: 'ch_99999',
    content: '{{steps["OpenAI → Generate Text"].text}}',
  };

  const resolvedDiscordConfig = ExpressionEngine.resolve(discordConfig, mockContext);
  assert(
    resolvedDiscordConfig.content === 'Hello Divyansh! Welcome to AutomateX Core Platform. We are thrilled to have you onboard.',
    'Discord node seamlessly maps OpenAI generated text output via Data Mapper {{steps["OpenAI → Generate Text"].text}}'
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
