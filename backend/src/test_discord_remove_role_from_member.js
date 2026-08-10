import { DiscordRemoveRoleFromMemberValidator } from './discord/validations/DiscordRemoveRoleFromMemberValidator.js';
import { DiscordRemoveRoleFromMemberService } from './discord/services/DiscordRemoveRoleFromMemberService.js';
import { DiscordMemberService } from './discord/services/DiscordMemberService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → REMOVE ROLE FROM MEMBER TEST SUITE');
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
  // Test Group 1: DiscordRemoveRoleFromMemberValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordRemoveRoleFromMemberValidator ---');

  // Test 1.1: Missing credential
  const valNoCred = DiscordRemoveRoleFromMemberValidator.validate({
    guildId: 'guild123',
    userId: 'user123',
    roleId: 'role123',
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('Credential')), 'Rejects input with missing credential');

  // Test 1.2: Missing userId/memberId
  const valNoUser = DiscordRemoveRoleFromMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    roleId: 'role123',
  });
  assert(!valNoUser.isValid && valNoUser.errors.some(e => e.includes('Member')), 'Rejects input with missing member/user ID');

  // Test 1.3: Missing roleId
  const valNoRole = DiscordRemoveRoleFromMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user123',
  });
  assert(!valNoRole.isValid && valNoRole.errors.some(e => e.includes('Role')), 'Rejects input with missing role ID');

  // Test 1.4: @everyone role removal attempt (roleId === guildId)
  const valEveryoneId = DiscordRemoveRoleFromMemberValidator.validate({
    credentialId: 'cred123',
    guildId: '1234567890',
    userId: 'user999',
    roleId: '1234567890',
  });
  assert(!valEveryoneId.isValid && valEveryoneId.errors.includes('The @everyone role cannot be removed.'), 'Blocks execution when roleId matches guildId (@everyone)');

  // Test 1.5: @everyone role removal attempt (roleId = "@everyone")
  const valEveryoneName = DiscordRemoveRoleFromMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user999',
    roleId: '@everyone',
  });
  assert(!valEveryoneName.isValid && valEveryoneName.errors.includes('The @everyone role cannot be removed.'), 'Blocks execution when roleId is "@everyone"');

  // Test 1.6: Valid role removal config
  const valValid = DiscordRemoveRoleFromMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user999',
    roleId: 'role888',
    reason: 'Temporary VIP expired',
  });
  assert(
    valValid.isValid &&
    valValid.userId === 'user999' &&
    valValid.roleId === 'role888' &&
    valValid.guildId === 'guild123' &&
    valValid.reason === 'Temporary VIP expired',
    'Validates correct role removal config'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordRemoveRoleFromMember');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordRemoveRoleFromMember"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Dynamic Data Mapper & Workflow Expression Resolution
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Dynamic Data Mapper Resolution ---');

  const mockContext = new ExecutionContext('exec_test_003', { ownerId: 'user_123' });
  mockContext.setNodeOutput('Discord → Add Role to Member', {
    success: true,
    added: true,
    guildId: 'guild_7777',
    userId: 'member_user_9999',
    roleId: 'role_vip_8888',
  });

  const rawConfig = {
    credentialId: 'cred_abc',
    guildId: '{{steps["Discord → Add Role to Member"].guildId}}',
    userId: '{{steps["Discord → Add Role to Member"].userId}}',
    roleId: '{{steps["Discord → Add Role to Member"].roleId}}',
    reason: 'Revoking role {{steps["Discord → Add Role to Member"].roleId}} from user {{steps["Discord → Add Role to Member"].userId}}',
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.guildId === 'guild_7777' &&
    resolvedConfig.userId === 'member_user_9999' &&
    resolvedConfig.roleId === 'role_vip_8888' &&
    resolvedConfig.reason === 'Revoking role role_vip_8888 from user member_user_9999',
    'ExpressionEngine resolves dynamic roleId, userId, and guildId from previous Add Role to Member step'
  );

  // ----------------------------------------------------
  // Test Group 4: DiscordRemoveRoleFromMemberService Security & Errors
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: DiscordRemoveRoleFromMemberService Security & Errors ---');

  // Test 4.1: Missing security ownerId check
  try {
    await DiscordRemoveRoleFromMemberService.removeRoleFromMember('', 'cred123', {
      guildId: 'g1',
      userId: 'u1',
      roleId: 'r1',
    });
    assert(false, 'Should throw error when ownerId is missing');
  } catch (err) {
    assert(err.message.includes('Security Error'), 'Rejects execution with missing ownerId');
  }

  // Test 4.2: Non-existent credential error
  try {
    await DiscordRemoveRoleFromMemberService.removeRoleFromMember('owner123', 'non-existent-cred-id', {
      guildId: 'guild123',
      userId: 'user123',
      roleId: 'role123',
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
  // Test Group 5: Member Service Cache Invalidation
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Member Service Cache Invalidation ---');
  DiscordMemberService.cache.set('owner123:cred123:guild123:1000', {
    timestamp: Date.now(),
    members: [{ id: 'user123', username: 'testuser' }],
  });
  assert(DiscordMemberService.cache.has('owner123:cred123:guild123:1000'), 'Member service cache populated');

  DiscordMemberService.clearCache('owner123', 'cred123', 'guild123');
  assert(!DiscordMemberService.cache.has('owner123:cred123:guild123:1000'), 'Member service clearCache invalidates cache properly');

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
