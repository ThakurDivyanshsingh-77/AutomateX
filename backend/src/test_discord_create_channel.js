import { DiscordCreateChannelValidator } from './discord/validations/DiscordCreateChannelValidator.js';
import { DiscordCreateChannelService } from './discord/services/DiscordCreateChannelService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → CREATE CHANNEL TEST SUITE');
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
  // Test 1: Validator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordCreateChannelValidator ---');

  // Test empty name
  const valEmptyName = DiscordCreateChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelType: 0,
    name: '   ',
  });
  assert(!valEmptyName.isValid, 'Rejects empty / whitespace-only channel name');

  // Test name exceeding 100 chars
  const longName = 'a'.repeat(101);
  const valLongName = DiscordCreateChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelType: 0,
    name: longName,
  });
  assert(!valLongName.isValid, 'Rejects channel name exceeding 100 characters');

  // Test valid Text Channel config
  const valText = DiscordCreateChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelType: 0,
    name: 'automatex-test',
    topic: 'Test Topic',
    slowmode: 10,
  });
  assert(valText.isValid && valText.parsedType === 0 && valText.trimmedName === 'automatex-test', 'Validates Text Channel config');

  // Test valid Voice Channel config
  const valVoice = DiscordCreateChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelType: 2,
    name: 'AutomateX Voice',
    bitrate: 64000,
    userLimit: 5,
  });
  assert(valVoice.isValid && valVoice.parsedType === 2 && valVoice.trimmedName === 'AutomateX Voice', 'Validates Voice Channel config');

  // Test valid Category config
  const valCategory = DiscordCreateChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelType: 4,
    name: 'AutomateX Category',
  });
  assert(valCategory.isValid && valCategory.parsedType === 4 && valCategory.trimmedName === 'AutomateX Category', 'Validates Category config');

  // ----------------------------------------------------
  // Test Group 2: Executor Registry & Node Executor Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordCreateChannel');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordCreateChannel"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Service Error Handling (Unit Level)
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: DiscordCreateChannelService Error Handling ---');

  // Missing security ownerId check
  try {
    await DiscordCreateChannelService.createChannel('', 'cred123', { guildId: 'g1', name: 'test' });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Invalid Credential error
  try {
    await DiscordCreateChannelService.createChannel('owner123', 'invalid-cred-id', {
      guildId: 'guild123',
      channelType: 0,
      name: 'automatex-test',
    });
    assert(false, 'Should throw error for non-existent credential');
  } catch (err) {
    assert(err.message.includes('Credential') || err.message.includes('found') || err.message.includes('Bot Token'), 'Handles missing/invalid credential properly');
  }

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
