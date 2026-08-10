import assert from 'assert';
import { DiscordTriggerScheduler } from './runtime/scheduler/DiscordTriggerScheduler.js';
import { DiscordGatewayManager } from './discord/client/DiscordGatewayManager.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { DiscordMessageReceivedTrigger } from './runtime/triggers/DiscordMessageReceivedTrigger.js';

console.log('🧪 Starting Discord AI Auto-Reply Workflow Verification Test Suite...');

// Test 1: Helper check for Discord trigger node identification
const testNode = {
  id: 'node_trigger_1',
  type: 'discordMessageReceived',
  data: {
    config: {
      credentialId: 'cred_discord_123',
      guildId: 'all',
      channelId: 'all',
      ignoreBotMessages: true,
    },
  },
};

assert.strictEqual(
  DiscordTriggerScheduler.isDiscordTriggerNode(testNode),
  true,
  'Matcher should identify discordMessageReceived as trigger node'
);
console.log('  ✓ 1. DiscordTriggerScheduler correctly identifies Discord Message Received trigger node');

// Test 2: Trigger payload formatting
const triggerFormatter = new DiscordMessageReceivedTrigger();
const rawDiscordPayload = {
  id: '1234567890987654321',
  channelId: '987654321012345678',
  guildId: '112233445566778899',
  content: 'Explain Quantum Computing in one sentence.',
  author: {
    id: '554433221100',
    username: 'AliceDev',
    bot: false,
  },
};

const formattedPayload = triggerFormatter.formatEvent(rawDiscordPayload);

assert.strictEqual(formattedPayload.content, 'Explain Quantum Computing in one sentence.');
assert.strictEqual(formattedPayload.channelId, '987654321012345678');
assert.strictEqual(formattedPayload.guildId, '112233445566778899');
assert.strictEqual(formattedPayload.authorId, '554433221100');
assert.strictEqual(formattedPayload.authorName, 'AliceDev');
assert.strictEqual(formattedPayload.messageId, '1234567890987654321');
console.log('  ✓ 2. Discord Message Received Trigger outputs clean predictable payload with all required fields');

// Test 3: Expression Engine resolution for Gemini prompt & Discord Send Message nodes
const mockContext = {
  nodeOutputs: new Map([
    [
      'Discord → Message Received',
      formattedPayload,
    ],
    [
      'Gemini → Generate Text',
      { text: 'Quantum computing uses qubits to perform complex calculations exponentially faster.' },
    ],
  ]),
};

const rawGeminiConfig = {
  prompt: 'Answer the user query: {{steps["Discord → Message Received"].content}}',
};

const resolvedGeminiConfig = ExpressionEngine.resolve(rawGeminiConfig, mockContext);
assert.strictEqual(
  resolvedGeminiConfig.prompt,
  'Answer the user query: Explain Quantum Computing in one sentence.'
);
console.log('  ✓ 3. Gemini prompt seamlessly resolves dynamic Discord message content {{steps["Discord → Message Received"].content}}');

const rawDiscordSendConfig = {
  channelId: '{{steps["Discord → Message Received"].channelId}}',
  content: '{{steps["Gemini → Generate Text"].text}}',
};

const resolvedDiscordSendConfig = ExpressionEngine.resolve(rawDiscordSendConfig, mockContext);
assert.strictEqual(resolvedDiscordSendConfig.channelId, '987654321012345678');
assert.strictEqual(
  resolvedDiscordSendConfig.content,
  'Quantum computing uses qubits to perform complex calculations exponentially faster.'
);
console.log('  ✓ 4. Discord Send Message dynamically targets same channel ID {{steps["Discord → Message Received"].channelId}} and AI response {{steps["Gemini → Generate Text"].text}}');

// Test 4: Deduplication & Bot Message Ignore
const botMessageId = '9999888877776666';
assert.strictEqual(DiscordGatewayManager.isDuplicate(botMessageId), false);
assert.strictEqual(DiscordGatewayManager.isDuplicate(botMessageId), true);
console.log('  ✓ 5. Gateway message deduplication cache prevents double triggering');

console.log('\n🎉 ALL DISCORD AI AUTO-REPLY VERIFICATION TESTS PASSED SUCCESSFULLY! (5 PASSED, 0 FAILED)');
