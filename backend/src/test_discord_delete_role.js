import { DiscordDeleteRoleValidator } from './discord/validations/DiscordDeleteRoleValidator.js';
import { DiscordDeleteRoleService } from './discord/services/DiscordDeleteRoleService.js';
import { DiscordRoleService } from './discord/services/DiscordRoleService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → DELETE ROLE TEST SUITE');
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
  // Test Group 1: DiscordDeleteRoleValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordDeleteRoleValidator ---');

  // Test 1.1: Missing credential
  const valNoCred = DiscordDeleteRoleValidator.validate({
    guildId: 'guild123',
    roleId: 'role123',
    confirmDelete: true,
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('Credential')), 'Rejects input with missing credential');

  // Test 1.2: Missing roleId
  const valNoRole = DiscordDeleteRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    confirmDelete: true,
  });
  assert(!valNoRole.isValid && valNoRole.errors.some(e => e.includes('Role selection')), 'Rejects input with missing roleId');

  // Test 1.3: Missing confirmation
  const valNoConfirm = DiscordDeleteRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    roleId: 'role123',
    confirmDelete: false,
  });
  assert(!valNoConfirm.isValid && valNoConfirm.errors.some(e => e.includes('Confirmation')), 'Rejects execution when confirmation is disabled');

  // Test 1.4: @everyone role deletion attempt (roleId === guildId)
  const valEveryoneId = DiscordDeleteRoleValidator.validate({
    credentialId: 'cred123',
    guildId: '1234567890',
    roleId: '1234567890',
    confirmDelete: true,
  });
  assert(!valEveryoneId.isValid && valEveryoneId.errors.includes('The @everyone role cannot be deleted.'), 'Blocks execution when roleId matches guildId (@everyone)');

  // Test 1.5: @everyone role deletion attempt (roleId = "@everyone")
  const valEveryoneName = DiscordDeleteRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    roleId: '@everyone',
    confirmDelete: true,
  });
  assert(!valEveryoneName.isValid && valEveryoneName.errors.includes('The @everyone role cannot be deleted.'), 'Blocks execution when roleId is "@everyone"');

  // Test 1.6: Valid deletion config
  const valValid = DiscordDeleteRoleValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    roleId: 'role999',
    reason: 'Cleanup test role',
    confirmDelete: true,
  });
  assert(
    valValid.isValid &&
    valValid.roleId === 'role999' &&
    valValid.guildId === 'guild123' &&
    valValid.reason === 'Cleanup test role' &&
    valValid.confirmDelete === true,
    'Validates correct role deletion config'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordDeleteRole');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordDeleteRole"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Data Mapper Expression Engine Resolution
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Dynamic Data Mapper Resolution ---');

  const mockContext = new ExecutionContext('exec_test_001', { ownerId: 'user_123' });
  mockContext.setNodeOutput('Discord → Create Role', {
    success: true,
    role: {
      id: 'role_created_555',
      name: 'Dynamic Test Role',
      guildId: 'guild_777',
    },
  });

  const rawConfig = {
    credentialId: 'cred_abc',
    guildId: '{{steps["Discord → Create Role"].role.guildId}}',
    roleId: '{{steps["Discord → Create Role"].role.id}}',
    reason: 'Deleting {{steps["Discord → Create Role"].role.name}}',
    confirmDelete: true,
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.guildId === 'guild_777' &&
    resolvedConfig.roleId === 'role_created_555' &&
    resolvedConfig.reason === 'Deleting Dynamic Test Role',
    'ExpressionEngine resolves dynamic role ID, guild ID, and reason from previous Create Role step'
  );

  // ----------------------------------------------------
  // Test Group 4: DiscordDeleteRoleService Security & Error Mapping
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: DiscordDeleteRoleService Security & Errors ---');

  // Test 4.1: Missing security ownerId check
  try {
    await DiscordDeleteRoleService.deleteRole('', 'cred123', {
      guildId: 'g1',
      roleId: 'r1',
      confirmDelete: true,
    });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Test 4.2: Non-existent credential error
  try {
    await DiscordDeleteRoleService.deleteRole('owner123', 'non-existent-cred-id', {
      guildId: 'guild123',
      roleId: 'role123',
      confirmDelete: true,
    });
    assert(false, 'Should throw error for non-existent credential');
  } catch (err) {
    assert(
      err.message.includes('Credential') ||
      err.message.includes('found') ||
      err.message.includes('Bot Token') ||
      err.message.includes('invalid'),
      'Handles non-existent credential properly'
    );
  }

  // ----------------------------------------------------
  // Test Group 5: Role Service Cache Invalidation
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Role Service Cache Invalidation ---');
  DiscordRoleService.cache.set('owner123:cred123:guild123', {
    timestamp: Date.now(),
    roles: [{ id: 'role123', name: 'Role 123' }],
  });
  assert(DiscordRoleService.cache.has('owner123:cred123:guild123'), 'Role service cache populated');

  DiscordRoleService.clearCache('owner123', 'cred123', 'guild123');
  assert(!DiscordRoleService.cache.has('owner123:cred123:guild123'), 'Role service clearCache invalidates cache properly');

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
