import { DiscordDeleteChannelValidator } from './discord/validations/DiscordDeleteChannelValidator.js';
import { DiscordDeleteChannelService } from './discord/services/DiscordDeleteChannelService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → DELETE CHANNEL TEST SUITE');
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
  // Test Group 1: DiscordDeleteChannelValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordDeleteChannelValidator ---');

  // Test missing credential
  const valNoCred = DiscordDeleteChannelValidator.validate({
    channelId: '123456789',
    confirmDelete: true,
  });
  assert(!valNoCred.isValid, 'Rejects input with missing credential');

  // Test missing channelId
  const valNoChannel = DiscordDeleteChannelValidator.validate({
    credentialId: 'cred123',
    confirmDelete: true,
  });
  assert(!valNoChannel.isValid, 'Rejects input with missing channelId');

  // Test unconfirmed checkbox (confirmDelete: false)
  const valUnconfirmed = DiscordDeleteChannelValidator.validate({
    credentialId: 'cred123',
    channelId: '123456789',
    confirmDelete: false,
  });
  assert(!valUnconfirmed.isValid, 'Rejects unconfirmed channel deletion request (confirmDelete: false)');

  // Test valid configuration
  const valValid = DiscordDeleteChannelValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    channelId: '123456789',
    confirmDelete: true,
  });
  assert(valValid.isValid && valValid.channelId === '123456789', 'Validates correct channel deletion config');

  // Test dynamic variable channelId expression
  const valDynamic = DiscordDeleteChannelValidator.validate({
    credentialId: 'cred123',
    channelId: '{{steps["Discord → Create Channel"].channel.id}}',
    confirmDelete: true,
  });
  assert(valDynamic.isValid && valDynamic.channelId.includes('{{'), 'Validates dynamic channel ID expression');

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordDeleteChannel');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordDeleteChannel"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: DiscordDeleteChannelService Error & Security Checks
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: DiscordDeleteChannelService Error Handling ---');

  // Missing security ownerId check
  try {
    await DiscordDeleteChannelService.deleteChannel('', 'cred123', { channelId: '123', confirmDelete: true });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Unconfirmed request check in service
  try {
    await DiscordDeleteChannelService.deleteChannel('owner123', 'cred123', { channelId: '123', confirmDelete: false });
    assert(false, 'Should throw validation error when confirmDelete is false');
  } catch (err) {
    assert(err.message.includes('Confirmation is required') || err.message.includes('permanently deleted'), 'Blocks execution when confirmation checkbox is disabled');
  }

  // Non-existent credential handling
  try {
    await DiscordDeleteChannelService.deleteChannel('owner123', 'non-existent-cred', {
      channelId: '123456789',
      confirmDelete: true,
    });
    assert(false, 'Should throw error for non-existent credential');
  } catch (err) {
    assert(err.message.includes('Credential') || err.message.includes('found') || err.message.includes('Bot Token') || err.message.includes('invalid'), 'Handles non-existent credential properly');
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
