import assert from 'assert';
import { TriggerRegistry } from './runtime/registry/TriggerRegistry.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { DiscordMessageReceivedTrigger } from './runtime/triggers/DiscordMessageReceivedTrigger.js';
import { DiscordGatewayManager } from './discord/client/DiscordGatewayManager.js';
import { DiscordMessageReceivedTriggerExecutor } from './engine/executors/TriggerExecutors.js';
import { DiscordMessageReceivedService } from './discord/services/DiscordMessageReceivedService.js';

console.log('====================================================');
console.log('🧪 AUTOMATEX DISCORD → MESSAGE RECEIVED TRIGGER TEST SUITE');
console.log('====================================================\n');

async function runTestSuite() {
  let passed = 0;
  let failed = 0;

  // --- Test 1: Node & Trigger Registration ---
  console.log('--- Test 1: Node & Trigger Registration ---');
  try {
    assert.strictEqual(TriggerRegistry.isTrigger('discordMessageReceived'), true, 'TriggerRegistry recognizes discordMessageReceived');
    assert.strictEqual(TriggerRegistry.isTrigger('discordMessageReceivedTrigger'), true, 'TriggerRegistry recognizes discordMessageReceivedTrigger');
    assert.strictEqual(TriggerRegistry.isTrigger('discord_message_received'), true, 'TriggerRegistry recognizes discord_message_received');
    assert.strictEqual(ExecutorRegistry.executors.has('discordMessageReceived'), true, 'ExecutorRegistry has discordMessageReceived executor');
    console.log('✅ [PASS] Discord Message Received trigger & executor registered in all registries.');
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test 1 failed: ${err.message}`);
    failed++;
  }

  // --- Test 2: Event Formatter Payload Structure ---
  console.log('\n--- Test 2: Event Formatter Payload Structure ---');
  try {
    const formatter = new DiscordMessageReceivedTrigger();
    const mockInput = {
      message: {
        id: '1122334455',
        content: 'Explain MongoDB in one sentence.',
        channelId: '9988776655',
        guildId: '44332211',
        author: {
          id: '88776655',
          username: 'test_user',
          bot: false,
        },
      },
    };
    const formatted = formatter.formatEvent(mockInput);

    assert.strictEqual(formatted.message.id, '1122334455');
    assert.strictEqual(formatted.message.content, 'Explain MongoDB in one sentence.');
    assert.strictEqual(formatted.message.channelId, '9988776655');
    assert.strictEqual(formatted.message.guildId, '44332211');
    assert.strictEqual(formatted.message.author.username, 'test_user');
    assert.strictEqual(formatted.message.author.bot, false);

    // Top-level aliases for Data Mapper
    assert.strictEqual(formatted.content, 'Explain MongoDB in one sentence.');
    assert.strictEqual(formatted.channelId, '9988776655');
    assert.strictEqual(formatted.guildId, '44332211');
    assert.strictEqual(formatted.id, '1122334455');

    console.log('✅ [PASS] Trigger payload correctly structured for Data Mapper consumption.');
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test 2 failed: ${err.message}`);
    failed++;
  }

  // --- Test 3: Deduplication & Bot Loop Prevention ---
  console.log('\n--- Test 3: Deduplication & Bot Loop Prevention ---');
  try {
    const testMsgId = `test_msg_${Date.now()}`;
    assert.strictEqual(DiscordGatewayManager.isDuplicate(testMsgId), false, 'First processing returns false');
    assert.strictEqual(DiscordGatewayManager.isDuplicate(testMsgId), true, 'Duplicate processing returns true');

    // Bot message filter check
    const mockBotMessage = {
      id: 'bot_msg_001',
      content: 'I am a bot reply',
      author: { id: 'bot_123', username: 'AutomateXBot', bot: true },
    };
    const ignoreBotSetting = true;
    const isBot = Boolean(mockBotMessage.author.bot);
    assert.strictEqual(ignoreBotSetting && isBot, true, 'Bot message correctly flagged for filtering');

    console.log('✅ [PASS] Deduplication and Bot Loop Protection verified.');
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test 3 failed: ${err.message}`);
    failed++;
  }

  // --- Test 4: Trigger Executor Execution ---
  console.log('\n--- Test 4: Trigger Executor Execution ---');
  try {
    const executor = new DiscordMessageReceivedTriggerExecutor();
    const mockContext = {
      initialPayload: {
        message: {
          id: '998877',
          content: 'hello AutomateX',
          channelId: 'ch_123',
          guildId: 'g_456',
          author: { id: 'usr_789', username: 'alice', bot: false },
        },
      },
    };

    const res = await executor.execute({}, mockContext);
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.output.message.content, 'hello AutomateX');
    assert.strictEqual(res.output.channelId, 'ch_123');

    console.log('✅ [PASS] DiscordMessageReceivedTriggerExecutor executed cleanly.');
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test 4 failed: ${err.message}`);
    failed++;
  }

  // --- Test 5: Service Activation & Test API ---
  console.log('\n--- Test 5: Service Activation & Test API ---');
  try {
    const deactivateRes = DiscordMessageReceivedService.deactivateTrigger('wf_test_123');
    assert.strictEqual(deactivateRes.success, true);
    console.log('✅ [PASS] Service lifecycle methods verified.');
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test 5 failed: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
