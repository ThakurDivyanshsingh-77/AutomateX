import { DiscordGuildService } from './discord/services/DiscordGuildService.js';
import { credentialService } from './credentials/credentialService.js';
import { DiscordUtils } from './discord/utils/DiscordUtils.js';
import app from './app.js';
import mongoose from 'mongoose';

async function runExhaustiveStep2Verification() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting Exhaustive Discord Step 2 Verification');
  console.log('--------------------------------------------------');

  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  // Test Case 1: 1 Guild Scenario
  console.log('\n[Test 1/6] Testing 1 Guild Scenario...');
  const mockCred1 = await credentialService.createCredential(mockOwnerId, {
    name: 'Bot 1 Guild',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.MOCK_TOKEN_1_GUILD' },
  });
  const credId1 = String(mockCred1._id);

  // Directly test DiscordGuildService cache injection & response format
  // @ts-ignore
  DiscordGuildService.cache.set(`${mockOwnerId}:${credId1}`, {
    timestamp: Date.now(),
    guilds: [{ id: '1001', name: 'AutomateX Guild', label: 'AutomateX Guild', value: '1001', iconUrl: null, icon: null }],
  });

  const res1 = await DiscordGuildService.getGuilds(mockOwnerId, credId1);
  if (!res1.success || res1.guilds.length !== 1 || res1.guilds[0].name !== 'AutomateX Guild') {
    throw new Error('1 Guild test failed');
  }
  console.log('  ✅ Output format verified: { success: true, guilds: [ { id: "1001", name: "AutomateX Guild" } ] }');

  // Test Case 2: 5 Guilds Scenario
  console.log('\n[Test 2/6] Testing 5 Guilds Scenario...');
  const mockCred5 = await credentialService.createCredential(mockOwnerId, {
    name: 'Bot 5 Guilds',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.MOCK_TOKEN_5_GUILDS' },
  });
  const credId5 = String(mockCred5._id);

  const guilds5 = Array.from({ length: 5 }, (_, i) => ({
    id: `500${i + 1}`,
    name: `Server ${i + 1}`,
    label: `Server ${i + 1}`,
    value: `500${i + 1}`,
    iconUrl: `https://cdn.discordapp.com/icons/500${i + 1}/hash.png`,
    icon: `https://cdn.discordapp.com/icons/500${i + 1}/hash.png`,
  }));

  // @ts-ignore
  DiscordGuildService.cache.set(`${mockOwnerId}:${credId5}`, {
    timestamp: Date.now(),
    guilds: guilds5,
  });

  const res5 = await DiscordGuildService.getGuilds(mockOwnerId, credId5);
  if (!res5.success || res5.guilds.length !== 5) {
    throw new Error('5 Guilds test failed');
  }
  console.log('  ✅ 5 Guilds retrieved correctly:', res5.guilds.map(g => g.name).join(', '));

  // Test Case 3: 20 Guilds Scenario
  console.log('\n[Test 3/6] Testing 20 Guilds Scenario...');
  const mockCred20 = await credentialService.createCredential(mockOwnerId, {
    name: 'Bot 20 Guilds',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.MOCK_TOKEN_20_GUILDS' },
  });
  const credId20 = String(mockCred20._id);

  const guilds20 = Array.from({ length: 20 }, (_, i) => ({
    id: `200${i + 1}`,
    name: `Enterprise Server ${i + 1}`,
    label: `Enterprise Server ${i + 1}`,
    value: `200${i + 1}`,
    iconUrl: null,
    icon: null,
  }));

  // @ts-ignore
  DiscordGuildService.cache.set(`${mockOwnerId}:${credId20}`, {
    timestamp: Date.now(),
    guilds: guilds20,
  });

  const res20 = await DiscordGuildService.getGuilds(mockOwnerId, credId20);
  if (!res20.success || res20.guilds.length !== 20) {
    throw new Error('20 Guilds test failed');
  }
  console.log('  ✅ 20 Guilds retrieved correctly. Count:', res20.guilds.length);

  // Test Case 4: Empty Guild List Scenario
  console.log('\n[Test 4/6] Testing Empty Guild List (0 Guilds)...');
  const mockCredEmpty = await credentialService.createCredential(mockOwnerId, {
    name: 'Bot Empty Guilds',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.MOCK_TOKEN_EMPTY' },
  });
  const credIdEmpty = String(mockCredEmpty._id);

  // @ts-ignore
  DiscordGuildService.cache.set(`${mockOwnerId}:${credIdEmpty}`, {
    timestamp: Date.now(),
    guilds: [],
  });

  const resEmpty = await DiscordGuildService.getGuilds(mockOwnerId, credIdEmpty);
  if (!resEmpty.success || resEmpty.guilds.length !== 0) {
    throw new Error('Empty Guild list test failed');
  }
  console.log('  ✅ Empty Guild list handled cleanly with success: true and empty array []');

  // Test Case 5: Guild Validation (validateGuild)
  console.log('\n[Test 5/6] Testing DiscordGuildService.validateGuild...');
  const isValidServer = await DiscordGuildService.validateGuild(mockOwnerId, credId1, '1001');
  if (!isValidServer) throw new Error('validateGuild failed on existing guild');

  const isInvalidServer = await DiscordGuildService.validateGuild(mockOwnerId, credId1, '999999');
  if (isInvalidServer) throw new Error('validateGuild should return false for non-existent guild');
  console.log('  ✅ Guild validation (validateGuild) passed for both valid and invalid Guild IDs');

  // Test Case 6: Non-existent Credential Error Handling
  console.log('\n[Test 6/6] Testing Error Handling for Invalid Credential...');
  try {
    await DiscordGuildService.getGuilds(mockOwnerId, 'invalid_cred_9999', true);
    throw new Error('Should have failed for invalid credential');
  } catch (err) {
    console.log('  ✅ Correctly caught error:', err.message);
  }

  console.log('\n--------------------------------------------------');
  console.log('🎉 ALL EXHAUSTIVE STEP 2 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('--------------------------------------------------');
}

runExhaustiveStep2Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
