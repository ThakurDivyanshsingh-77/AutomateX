import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { AiNodeExecutor } from './ai/executors/AiNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';
import { OpenAIProvider } from './ai/providers/OpenAIProvider.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX AI → GENERATE TEXT TEST SUITE');
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
  // Test Group 1: AiGenerateTextValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: AiGenerateTextValidator Unit Tests ---');

  // Test 1.1: Missing credential
  const valNoCred = AiGenerateTextValidator.validate({
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a welcome message',
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('credential')), 'Rejects configuration with missing credential');

  // Test 1.2: Empty prompt
  const valEmptyPrompt = AiGenerateTextValidator.validate({
    credentialId: 'cred123',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: '   ',
  });
  assert(!valEmptyPrompt.isValid && valEmptyPrompt.errors.includes('Prompt cannot be empty.'), 'Rejects configuration with empty prompt');

  // Test 1.3: Temperature out of bounds (T > 2)
  const valTempHigh = AiGenerateTextValidator.validate({
    credentialId: 'cred123',
    prompt: 'Hello AI',
    temperature: 3.5,
  });
  assert(!valTempHigh.isValid && valTempHigh.errors.some(e => e.includes('Temperature')), 'Rejects temperature > 2.0');

  // Test 1.4: Max tokens negative
  const valTokensInvalid = AiGenerateTextValidator.validate({
    credentialId: 'cred123',
    prompt: 'Hello AI',
    maxTokens: -50,
  });
  assert(!valTokensInvalid.isValid && valTokensInvalid.errors.some(e => e.includes('Max Tokens')), 'Rejects negative max tokens');

  // Test 1.5: Valid config
  const valValid = AiGenerateTextValidator.validate({
    credentialId: 'cred123',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a announcement for {{workflow.name}}',
    temperature: 0.7,
    maxTokens: 500,
  });
  assert(
    valValid.isValid &&
    valValid.credentialId === 'cred123' &&
    valValid.provider === 'openai' &&
    valValid.model === 'gpt-4o-mini' &&
    valValid.temperature === 0.7 &&
    valValid.maxTokens === 500,
    'Validates correct AI Generate Text configuration'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('aiGenerateText');
    const executorAlias = ExecutorRegistry.getExecutor('ai');
    assert(executor instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for "aiGenerateText"');
    assert(executorAlias instanceof AiNodeExecutor, 'ExecutorRegistry correctly returns AiNodeExecutor for alias "ai"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Dynamic Data Mapper Variable Resolution
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Dynamic Variable Resolution ---');

  const mockContext = new ExecutionContext('exec_ai_test_001', { ownerId: 'user_123' });
  mockContext.setNodeOutput('Start Trigger', {
    name: 'Customer Welcome Flow',
    user: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      company: 'Acme Corp',
    },
  });

  const rawConfig = {
    credentialId: 'cred_openai_123',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: 'Write a professional email to {{steps["Start Trigger"].user.name}} from {{steps["Start Trigger"].user.company}} regarding {{steps["Start Trigger"].name}}.',
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.prompt === 'Write a professional email to Alice Johnson from Acme Corp regarding Customer Welcome Flow.',
    'ExpressionEngine resolves dynamic prompt variables from previous node outputs'
  );

  // ----------------------------------------------------
  // Test Group 4: OpenAI Provider Unit & Mock Response
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: OpenAIProvider Interface & Output Normalization ---');

  const provider = new OpenAIProvider();
  try {
    // Missing API key error test
    await provider.generateText({ apiKey: '', prompt: 'Test' });
    assert(false, 'Should throw error when API key is missing');
  } catch (err) {
    assert(err.message.includes('API Key is required'), 'OpenAIProvider rejects missing API key with 401 error');
  }

  // ----------------------------------------------------
  // Test Group 5: AiGenerateTextService Security & Error Handling
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: AiGenerateTextService Security & Errors ---');

  // Test 5.1: Missing ownerId security check
  try {
    await AiGenerateTextService.generateText('', 'cred123', { prompt: 'Hello' });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Test 5.2: Non-existent credential handling
  try {
    await AiGenerateTextService.generateText('owner123', 'non-existent-ai-cred-id', {
      prompt: 'Summarize news',
    });
    assert(false, 'Should throw error for non-existent credential');
  } catch (err) {
    assert(
      err.message.includes('Credential') ||
      err.message.includes('found') ||
      err.message.includes('vault') ||
      err.message.includes('invalid'),
      'Handles non-existent credential gracefully without exposing secrets'
    );
  }

  // ----------------------------------------------------
  // Test Group 6: Downstream Data Mapping Chain (AI → Generate Text → Discord)
  // ----------------------------------------------------
  console.log('\n--- Test Group 6: Downstream Workflow Chaining (AI → Discord) ---');

  // Simulate output produced by AI Generate Text node
  const mockAiOutput = {
    success: true,
    text: "Welcome everyone! We're excited to have you in our Discord community.",
    provider: 'openai',
    model: 'gpt-4o-mini',
    usage: {
      promptTokens: 18,
      completionTokens: 24,
      totalTokens: 42,
    },
  };

  mockContext.setNodeOutput('AI → Generate Text', mockAiOutput);

  // Next node config (Discord Send Message)
  const discordConfig = {
    credentialId: 'cred_discord_777',
    channelId: 'ch_12345',
    content: '{{steps["AI → Generate Text"].text}}',
  };

  const resolvedDiscordConfig = ExpressionEngine.resolve(discordConfig, mockContext);
  assert(
    resolvedDiscordConfig.content === "Welcome everyone! We're excited to have you in our Discord community.",
    'Downstream Discord node seamlessly consumes generated text output via Data Mapper {{steps["AI → Generate Text"].text}}'
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
