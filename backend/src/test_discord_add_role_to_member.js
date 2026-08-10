import { DiscordAddRoleToMemberValidator } from './discord/validations/DiscordAddRoleToMemberValidator.js';
import { DiscordAddRoleToMemberService } from './discord/services/DiscordAddRoleToMemberService.js';
import { DiscordMemberService } from './discord/services/DiscordMemberService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AUTOMATEX DISCORD → ADD ROLE TO MEMBER TEST SUITE');
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
  // Test Group 1: DiscordAddRoleToMemberValidator Unit Tests
  // ----------------------------------------------------
  console.log('--- Test Group 1: DiscordAddRoleToMemberValidator ---');

  // Test 1.1: Missing credential
  const valNoCred = DiscordAddRoleToMemberValidator.validate({
    guildId: 'guild123',
    userId: 'user123',
    roleId: 'role123',
  });
  assert(!valNoCred.isValid && valNoCred.errors.some(e => e.includes('Credential')), 'Rejects input with missing credential');

  // Test 1.2: Missing userId/memberId
  const valNoUser = DiscordAddRoleToMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    roleId: 'role123',
  });
  assert(!valNoUser.isValid && valNoUser.errors.some(e => e.includes('Member')), 'Rejects input with missing member/user ID');

  // Test 1.3: Missing roleId
  const valNoRole = DiscordAddRoleToMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user123',
  });
  assert(!valNoRole.isValid && valNoRole.errors.some(e => e.includes('Role')), 'Rejects input with missing role ID');

  // Test 1.4: @everyone role assignment attempt (roleId === guildId)
  const valEveryoneId = DiscordAddRoleToMemberValidator.validate({
    credentialId: 'cred123',
    guildId: '1234567890',
    userId: 'user999',
    roleId: '1234567890',
  });
  assert(!valEveryoneId.isValid && valEveryoneId.errors.includes('The @everyone role cannot be assigned.'), 'Blocks execution when roleId matches guildId (@everyone)');

  // Test 1.5: @everyone role assignment attempt (roleId = "@everyone")
  const valEveryoneName = DiscordAddRoleToMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user999',
    roleId: '@everyone',
  });
  assert(!valEveryoneName.isValid && valEveryoneName.errors.includes('The @everyone role cannot be assigned.'), 'Blocks execution when roleId is "@everyone"');

  // Test 1.6: Valid role assignment config
  const valValid = DiscordAddRoleToMemberValidator.validate({
    credentialId: 'cred123',
    guildId: 'guild123',
    userId: 'user999',
    roleId: 'role888',
    reason: 'Promoted to VIP',
  });
  assert(
    valValid.isValid &&
    valValid.userId === 'user999' &&
    valValid.roleId === 'role888' &&
    valValid.guildId === 'guild123' &&
    valValid.reason === 'Promoted to VIP',
    'Validates correct role assignment config'
  );

  // ----------------------------------------------------
  // Test Group 2: Engine Executor Registry Wiring
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Engine Executor Registry Wiring ---');
  try {
    const executor = ExecutorRegistry.getExecutor('discordAddRoleToMember');
    assert(executor instanceof DiscordNodeExecutor, 'ExecutorRegistry correctly returns DiscordNodeExecutor for "discordAddRoleToMember"');
  } catch (err) {
    assert(false, `ExecutorRegistry lookup failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Group 3: Dynamic Data Mapper Expression Engine Resolution
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Dynamic Data Mapper Resolution ---');

  const mockContext = new ExecutionContext('exec_test_002', { ownerId: 'user_123' });
  mockContext.setNodeOutput('Discord → Create Role', {
    success: true,
    role: {
      id: 'role_created_999',
      name: 'Vip Role',
      guildId: 'guild_111',
    },
    user: {
      id: 'member_user_444',
      name: 'Test Member',
    },
  });

  const rawConfig = {
    credentialId: 'cred_xyz',
    guildId: '{{steps["Discord → Create Role"].role.guildId}}',
    userId: '{{steps["Discord → Create Role"].user.id}}',
    roleId: '{{steps["Discord → Create Role"].role.id}}',
    reason: 'Assigning {{steps["Discord → Create Role"].role.name}} to {{steps["Discord → Create Role"].user.name}}',
  };

  const resolvedConfig = ExpressionEngine.resolve(rawConfig, mockContext);
  assert(
    resolvedConfig.guildId === 'guild_111' &&
    resolvedConfig.userId === 'member_user_444' &&
    resolvedConfig.roleId === 'role_created_999' &&
    resolvedConfig.reason === 'Assigning Vip Role to Test Member',
    'ExpressionEngine resolves dynamic role ID, user ID, guild ID, and reason from previous step'
  );

  // ----------------------------------------------------
  // Test Group 4: DiscordAddRoleToMemberService Security & Errors
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: DiscordAddRoleToMemberService Security & Errors ---');

  // Test 4.1: Missing security ownerId check
  try {
    await DiscordAddRoleToMemberService.addRoleToMember('', 'cred123', {
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
    await DiscordAddRoleToMemberService.addRoleToMember('owner123', 'non-existent-cred-id', {
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
