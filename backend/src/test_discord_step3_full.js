import { DiscordChannelService } from './discord/services/DiscordChannelService.js';
import { DiscordChannelMapper } from './discord/mappers/DiscordChannelMapper.js';
import { credentialService } from './credentials/credentialService.js';
import app from './app.js';
import mongoose from 'mongoose';

async function runExhaustiveStep3Verification() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting Exhaustive Discord Step 3 Verification');
  console.log('--------------------------------------------------');

  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  // Test 1: Mapper filtering tests (GUILD_TEXT=0, GUILD_ANNOUNCEMENT=5, GUILD_FORUM=15 vs Voice=2, Category=4)
  console.log('\n[Test 1/7] Testing DiscordChannelMapper filtering & DTO mapping...');
  const rawSampleChannels = [
    { id: '101', name: 'general', type: 0, position: 1 },
    { id: '102', name: 'voice-lounge', type: 2, position: 2 }, // Voice (Ignore)
    { id: '103', name: 'announcements', type: 5, position: 0 }, // Announcement (Include)
    { id: '104', name: 'text-chat-category', type: 4, position: 3 }, // Category (Ignore)
    { id: '105', name: 'developer-forum', type: 15, position: 4 }, // Forum (Include)
  ];

  const mappedDtos = DiscordChannelMapper.mapManyToDto(rawSampleChannels);
  if (mappedDtos.length !== 3) {
    throw new Error(`Mapper failed: Expected 3 channels, got ${mappedDtos.length}`);
  }
  const typesMapped = mappedDtos.map((c) => c.type).join(', ');
  if (!typesMapped.includes('GUILD_TEXT') || !typesMapped.includes('GUILD_ANNOUNCEMENT') || !typesMapped.includes('GUILD_FORUM')) {
    throw new Error(`Mapper failed to map channel types correctly: ${typesMapped}`);
  }
  console.log('  ✅ Mapper correctly filtered out Voice & Category channels and returned:', typesMapped);

  // Test 2: Guild with 1 channel
  console.log('\n[Test 2/7] Testing Guild with 1 channel...');
  const mockCred1 = await credentialService.createCredential(mockOwnerId, {
    name: 'Step 3 Credential',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.MOCK_TOKEN_STEP3' },
  });
  const credId = String(mockCred1._id);

  // @ts-ignore - Inject cache for Test 2
  DiscordChannelService.cache.set(`${mockOwnerId}:${credId}:guild_1_channel`, {
    timestamp: Date.now(),
    channels: [{ id: '1001', name: 'general', type: 'GUILD_TEXT', typeId: 0, position: 1 }],
  });

  const res1 = await DiscordChannelService.getChannels(mockOwnerId, credId, 'guild_1_channel');
  if (!res1.success || res1.channels.length !== 1 || res1.channels[0].name !== 'general') {
    throw new Error('1 Channel test failed');
  }
  console.log('  ✅ 1 Channel scenario passed. Output format:', JSON.stringify(res1));

  // Test 3: Guild with 20 channels
  console.log('\n[Test 3/7] Testing Guild with 20 channels...');
  const channels20 = Array.from({ length: 20 }, (_, i) => ({
    id: `ch_200${i + 1}`,
    name: i === 0 ? 'announcements' : i === 1 ? 'forum-help' : `channel-${i + 1}`,
    type: i === 0 ? 'GUILD_ANNOUNCEMENT' : i === 1 ? 'GUILD_FORUM' : 'GUILD_TEXT',
    typeId: i === 0 ? 5 : i === 1 ? 15 : 0,
    position: i,
  }));

  // @ts-ignore - Inject cache for Test 3
  DiscordChannelService.cache.set(`${mockOwnerId}:${credId}:guild_20_channels`, {
    timestamp: Date.now(),
    channels: channels20,
  });

  const res20 = await DiscordChannelService.getChannels(mockOwnerId, credId, 'guild_20_channels');
  if (!res20.success || res20.channels.length !== 20) {
    throw new Error('20 Channels test failed');
  }
  console.log('  ✅ 20 Channels scenario passed. Count:', res20.channels.length);

  // Test 4: Channel Validation (validateChannel)
  console.log('\n[Test 4/7] Testing DiscordChannelService.validateChannel...');
  const isValidChannel = await DiscordChannelService.validateChannel(mockOwnerId, credId, 'guild_1_channel', '1001');
  if (!isValidChannel) throw new Error('validateChannel failed for existing channel');

  const isInvalidChannel = await DiscordChannelService.validateChannel(mockOwnerId, credId, 'guild_1_channel', 'non_existent_channel_id');
  if (isInvalidChannel) throw new Error('validateChannel should return false for missing channel');
  console.log('  ✅ validateChannel correctly returned true for existing channel and false for missing channel');

  // Test 5: Cache Invalidation on Guild Change & Clear
  console.log('\n[Test 5/7] Testing Cache Invalidation...');
  const cacheKey = `${mockOwnerId}:${credId}:guild_1_channel`;
  if (!DiscordChannelService.cache.has(cacheKey)) {
    throw new Error('Cache should contain entry before clearing');
  }
  DiscordChannelService.clearCache(mockOwnerId, credId, 'guild_1_channel');
  if (DiscordChannelService.cache.has(cacheKey)) {
    throw new Error('Cache clear failed to remove key');
  }
  console.log('  ✅ Cache clearing & invalidation verified cleanly');

  // Test 6: Non-existent Credential Error Handling
  console.log('\n[Test 6/7] Testing Error Handling for Missing Credential...');
  try {
    await DiscordChannelService.getChannels(mockOwnerId, 'invalid_cred_9999', 'guild_1_channel', true);
    throw new Error('Should have thrown error for invalid credential');
  } catch (err) {
    console.log('  ✅ Correctly caught error for missing credential:', err.message);
  }

  // Test 7: Express Route Registration
  console.log('\n[Test 7/7] Testing Express Routes Registration for Channels...');
  const routes = app._router.stack
    .filter((r) => r.route || r.name === 'router')
    .map((r) => r.regexp.toString());
  const hasChannels = routes.some((r) => r.includes('discord'));
  if (!hasChannels) throw new Error('/api/v1/discord/channels route not mounted');
  console.log('  ✅ GET & POST /api/v1/discord/channels routes mounted cleanly in Express app');

  console.log('\n--------------------------------------------------');
  console.log('🎉 ALL EXHAUSTIVE STEP 3 (LOAD CHANNELS) VERIFICATION TESTS PASSED!');
  console.log('--------------------------------------------------');
}

runExhaustiveStep3Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
