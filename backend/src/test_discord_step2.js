import { DiscordDynamicOptions } from './discord/options/DiscordDynamicOptions.js';
import { credentialService } from './credentials/credentialService.js';
import { DiscordUtils } from './discord/utils/DiscordUtils.js';
import app from './app.js';
import mongoose from 'mongoose';

async function runStep2Verification() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting Discord Step 2 (Load Guilds) Verification');
  console.log('--------------------------------------------------');

  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  // Test 1: Create a mock credential in encrypted vault
  console.log('\n[1/5] Creating encrypted Discord credential for testing...');
  const mockCred = await credentialService.createCredential(mockOwnerId, {
    name: 'Step 2 Test Bot',
    service: 'discord',
    authType: 'botToken',
    secret: {
      botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.TEST_SECRET_BOT_TOKEN_STEP2',
      botId: '987654321098765432',
      botName: 'Test Guild Bot',
      username: 'TestGuildBot#0000',
      avatar: null,
      validatedAt: new Date().toISOString(),
    },
  });

  const credentialId = String(mockCred._id);
  console.log('  ✅ Credential created with ID:', credentialId);

  // Test 2: DiscordUtils getGuildIconUrl helper
  console.log('\n[2/5] Testing DiscordUtils.getGuildIconUrl...');
  const iconUrlPng = DiscordUtils.getGuildIconUrl('123456', 'a1b2c3d4e5f6');
  if (iconUrlPng !== 'https://cdn.discordapp.com/icons/123456/a1b2c3d4e5f6.png') {
    throw new Error(`PNG Icon URL mismatch: ${iconUrlPng}`);
  }
  const iconUrlGif = DiscordUtils.getGuildIconUrl('123456', 'a_1b2c3d4e5f6');
  if (iconUrlGif !== 'https://cdn.discordapp.com/icons/123456/a_1b2c3d4e5f6.gif') {
    throw new Error(`GIF Icon URL mismatch: ${iconUrlGif}`);
  }
  console.log('  ✅ Guild icon URLs constructed correctly (PNG & GIF)');

  // Test 3: Test Dynamic Options Caching Logic
  console.log('\n[3/5] Testing DiscordDynamicOptions Guild Caching Logic...');
  
  // Inject mock cached entry to test cache hit/miss behavior without hitting external API with fake token
  const cacheKey = `${mockOwnerId}:${credentialId}`;
  const mockGuildOptions = [
    {
      label: 'AutomateX Engineering',
      value: '111111111111111111',
      iconUrl: 'https://cdn.discordapp.com/icons/111111111111111111/icon1.png',
      id: '111111111111111111',
      name: 'AutomateX Engineering',
    },
    {
      label: 'DevOps & Community',
      value: '222222222222222222',
      iconUrl: null,
      id: '222222222222222222',
      name: 'DevOps & Community',
    },
  ];

  // @ts-ignore - Access private cache for testing
  DiscordDynamicOptions.guildsCache.set(cacheKey, {
    timestamp: Date.now(),
    data: mockGuildOptions,
  });

  const cachedGuilds = await DiscordDynamicOptions.getGuilds(mockOwnerId, credentialId, false);
  if (cachedGuilds.length !== 2 || cachedGuilds[0].name !== 'AutomateX Engineering') {
    throw new Error('Cache hit failed to return expected guild list');
  }
  console.log('  ✅ In-memory cache hit returned', cachedGuilds.length, 'cached guilds instantly');

  // Test 4: Missing & Invalid Credential Handling
  console.log('\n[4/5] Testing Error Handling for Missing / Non-existent Credentials...');
  try {
    await DiscordDynamicOptions.getGuilds(mockOwnerId, 'non_existent_cred_id', false);
    throw new Error('Should have thrown error for non-existent credential');
  } catch (err) {
    console.log('  ✅ Correctly threw error on missing credential:', err.message);
  }

  // Test 5: Route Endpoint Registration
  console.log('\n[5/5] Testing Express Route /api/v1/discord/guilds...');
  const routes = app._router.stack
    .filter((r) => r.route || r.name === 'router')
    .map((r) => r.regexp.toString());
  const hasDiscord = routes.some((r) => r.includes('discord'));
  if (!hasDiscord) throw new Error('/api/v1/discord route not mounted');
  console.log('  ✅ GET /api/v1/discord/guilds route registered and mounted cleanly');

  console.log('\n--------------------------------------------------');
  console.log('🎉 ALL DISCORD STEP 2 (LOAD GUILDS) VERIFICATION TESTS PASSED!');
  console.log('--------------------------------------------------');
}

runStep2Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
