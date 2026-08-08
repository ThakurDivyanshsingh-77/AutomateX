import { DiscordCreateRoleValidator } from './discord/validations/DiscordCreateRoleValidator.js';
import { DiscordCreateRoleService } from './discord/services/DiscordCreateRoleService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → CREATE ROLE TEST SUITE');
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
  // Test Group 1: DiscordCreateRoleValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordCreateRoleValidator ---');

  // Test missing credential
  const valNoCred = DiscordCreateRoleValidator.validate({
    guildId: 'guild123',
    name: 'AutomateX Role',
  });
  assert(!valNoCred.isValid, 'Rejects input with missing credential');

  // Test missing guildId
  const valNoGuild = DiscordCreateRoleValidator.validate({
    credentialId: 'cred123',
    name: 'AutomateX Role',
  });
  assert(!valNoGuild.isValid, 'Rejects input with missing guildId');

  // Test empty role name
  const valEmptyName = DiscordCreateRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    name: '   ',
  });
  assert(!valEmptyName.isValid, 'Rejects input with whitespace-only role name');

  // Test role name exceeding 100 characters
  const longName = 'R'.repeat(101);
  const valLongName = DiscordCreateRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    name: longName,
  });
  assert(!valLongName.isValid, 'Rejects role name exceeding 100 characters');

  // Test HEX to Integer color conversion helper
  const intColorDefault = DiscordCreateRoleValidator.hexToIntColor('#5865F2');
  assert(intColorDefault === 5793266, 'Correctly converts Discord Blurple #5865F2 to 5793266');

  const intColorRed = DiscordCreateRoleValidator.hexToIntColor('#FF0000');
  assert(intColorRed === 16711680, 'Correctly converts Red #FF0000 to 16711680');

  const hexColor = DiscordCreateRoleValidator.intToHexColor(5793266);
  assert(hexColor.toLowerCase() === '#5865f2', 'Correctly converts integer color 5793266 back to #5865f2');

  // Test valid role config
  const valValid = DiscordCreateRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    name: 'AutomateX Admin',
    color: '#5865F2',
    hoist: true,
    mentionable: true,
    reason: 'Initial setup',
  });
  assert(
    valValid.isValid &&
    valValid.trimmedName === 'AutomateX Admin' &&
    valValid.colorInt === 5793266 &&
    valValid.hoist === true &&
    valValid.mentionable === true &&
    valValid.reason === 'Initial setup',
    'Validates correct role creation config'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordCreateRole');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordCreateRole"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: DiscordCreateRoleService Error Handling
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: DiscordCreateRoleService Error Handling ---');

  // Missing security ownerId check
  try {
    await DiscordCreateRoleService.createRole('', 'cred123', { guildId: 'g1', name: 'Role' });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Invalid Credential error
  try {
    await DiscordCreateRoleService.createRole('owner123', 'non-existent-cred', {
      guildId: 'guild123',
      name: 'Test Role',
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
