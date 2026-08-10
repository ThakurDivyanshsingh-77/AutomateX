import { GeminiProvider } from './ai/providers/GeminiProvider.js';
import { AiGenerateTextService } from './ai/services/AiGenerateTextService.js';
import { AiGenerateTextValidator } from './ai/validations/AiGenerateTextValidator.js';
import { AiNodeExecutor } from './ai/executors/AiNodeExecutor.js';

async function testGeminiPrompt() {
  console.log('====================================================');
  console.log('🧪 TESTING GEMINI GENERATE TEXT NODE EXECUTION FLOW');
  console.log('====================================================\n');

  // 1. Model Normalization Test
  const norm1 = GeminiProvider.normalizeModelName('gemini-2.5-flash');
  console.log(`[Test 1] Normalized model: ${norm1}`);
  if (norm1 !== 'gemini-2.5-flash') {
    throw new Error(`Normalization failed for custom model: expected gemini-2.5-flash, got ${norm1}`);
  }

  const norm2 = GeminiProvider.normalizeModelName('models/gemini-2.0-flash');
  console.log(`[Test 2] Normalized prefixed model: ${norm2}`);
  if (norm2 !== 'gemini-2.0-flash') {
    throw new Error(`Normalization failed for prefixed model: expected gemini-2.0-flash, got ${norm2}`);
  }

  // 2. Mock execution context
  const mockContext = {
    ownerId: 'user_123_test',
    workflowId: 'wf_456_test',
  };

  const nodeData = {
    id: 'node_gemini_1',
    type: 'geminiGenerateText',
    config: {
      provider: 'gemini',
      modelIdentifier: 'gemini-2.5-flash',
      autoSelectModel: false,
      prompt: 'hi kya haal hai',
      temperature: 0.7,
      maxTokens: 100,
    },
  };

  console.log('[Test 3] Node config prepared:');
  console.log(`  - Provider: ${nodeData.config.provider}`);
  console.log(`  - Model: ${nodeData.config.modelIdentifier}`);
  console.log(`  - Prompt: "${nodeData.config.prompt}"`);

  // 3. Directly verify GeminiProvider.generateText with mock API key or handling
  const provider = new GeminiProvider();

  // Test provider logic error handling for fake/unauthorized key (must NOT throw ReferenceError: selectedModel is not defined)
  try {
    console.log('\n[Test 4] Invoking GeminiProvider.generateText with test key...');
    await provider.generateText({
      apiKey: 'AIzaSyTestFakeKey123456789',
      model: nodeData.config.modelIdentifier,
      autoSelectModel: nodeData.config.autoSelectModel,
      prompt: nodeData.config.prompt,
      temperature: nodeData.config.temperature,
      maxTokens: nodeData.config.maxTokens,
    });
    console.log('✅ Gemini API returned success response!');
  } catch (err) {
    console.log(`ℹ️ Execution finished with handled error/response: [${err.name}] ${err.message}`);

    // CRITICAL ASSERTION: Error MUST NOT be ReferenceError: selectedModel is not defined
    if (err instanceof ReferenceError || err.message.includes('selectedModel is not defined')) {
      console.error('❌ FAIL: ReferenceError selectedModel is not defined detected!');
      process.exit(1);
    }
    console.log('✅ PASS: No ReferenceError thrown! Variable selectedModel is properly scoped and defined.');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL GEMINI GENERATE TEXT FIX VERIFICATIONS PASSED');
  console.log('====================================================');
}

testGeminiPrompt().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
