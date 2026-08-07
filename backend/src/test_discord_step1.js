import { DiscordValidators } from './discord/validations/DiscordValidators.js';
import { DiscordUtils } from './discord/utils/DiscordUtils.js';
import { DiscordCredentialService } from './discord/services/DiscordCredentialService.js';
import { credentialService } from './credentials/credentialService.js';
import app from './app.js';
import mongoose from 'mongoose';

async function runStep1Verification() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting Discord Step 1 Verification');
  console.log('--------------------------------------------------');

  // Test 1: Validator Unit Tests
  console.log('\n[1/5] Testing DiscordValidators...');
  const emptyVal = DiscordValidators.validateCredentialInput({});
  if (emptyVal.isValid) throw new Error('Validator should fail on empty input');
  console.log('  ✅ Empty input validation failed correctly with errors:', emptyVal.errors.length);

  const shortTokenVal = DiscordValidators.validateBotToken('short');
  if (shortTokenVal.isValid) throw new Error('Validator should fail on short token');
  console.log('  ✅ Short token validation failed correctly');

  const validTokenVal = DiscordValidators.validateBotToken('MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.abcdefghijklmnopqrstuvwxyz1234567890');
  if (!validTokenVal.isValid) throw new Error('Validator failed on valid formatted token');
  console.log('  ✅ Valid token format passed validation');

  // Test 2: Utility Formatting & Error Handling
  console.log('\n[2/5] Testing DiscordUtils...');
  const formattedHeader = DiscordUtils.formatBotAuthHeader('my_test_token_123');
  if (formattedHeader !== 'Bot my_test_token_123') throw new Error(`Header format unexpected: ${formattedHeader}`);
  console.log('  ✅ Header formatted correctly:', formattedHeader);

  const avatarUrl = DiscordUtils.getAvatarUrl('123456789', 'a_8675309');
  if (!avatarUrl.includes('gif')) throw new Error('Animated avatar should yield .gif CDN link');
  console.log('  ✅ Avatar URL constructed:', avatarUrl);

  const normalized401 = DiscordUtils.normalizeDiscordError({ status: 401 });
  if (!normalized401.isAuthError || normalized401.statusCode !== 401) throw new Error('401 Normalization failed');
  console.log('  ✅ Error 401 normalized correctly:', normalized401.message);

  const normalized429 = DiscordUtils.normalizeDiscordError({ status: 429, retryAfterMs: 2500 });
  if (!normalized429.isRateLimited || normalized429.retryAfterMs !== 2500) throw new Error('429 Rate Limit normalization failed');
  console.log('  ✅ Error 429 normalized correctly with retryAfterMs:', normalized429.retryAfterMs);

  // Test 3: Invalid Token Authentication
  console.log('\n[3/5] Testing DiscordCredentialService.validateBotToken (Invalid Token Handling)...');
  const invalidResult = await DiscordCredentialService.validateBotToken('MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.INVALID_TOKEN_FOR_TESTING_PURPOSES');
  if (invalidResult.valid) throw new Error('Invalid token should not be marked valid');
  console.log('  ✅ Invalid token correctly rejected with message:', invalidResult.error);

  // Test 4: Credential Service Creation & Retrieval
  console.log('\n[4/5] Testing DiscordCredentialService.createCredential (Mock Validation)...');
  const mockOwnerId = new mongoose.Types.ObjectId().toString();
  
  // Directly test credential storage flow
  const savedCred = await credentialService.createCredential(mockOwnerId, {
    name: 'Production Discord Bot',
    service: 'discord',
    authType: 'botToken',
    secret: {
      botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.TEST_SECRET_BOT_TOKEN_2026',
      botId: '123456789012345678',
      botName: 'AutomateX Bot',
      username: 'AutomateX Bot#0000',
      avatar: 'https://cdn.discordapp.com/avatars/123456789012345678/abc.png',
      validatedAt: new Date().toISOString(),
    },
  });

  if (!savedCred._id) throw new Error('Failed to create encrypted credential');
  console.log('  ✅ Credential created with ID:', savedCred._id);

  const decryptedToken = await DiscordCredentialService.getDecryptedBotToken(mockOwnerId, String(savedCred._id));
  if (decryptedToken !== 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.TEST_SECRET_BOT_TOKEN_2026') {
    throw new Error(`Decrypted token mismatch: ${decryptedToken}`);
  }
  console.log('  ✅ Decrypted bot token successfully retrieved from encrypted vault!');

  // Test 5: Route registration check
  console.log('\n[5/5] Checking Express Routes Registration...');
  const routes = app._router.stack
    .filter((r) => r.route || r.name === 'router')
    .map((r) => r.regexp.toString());
  const hasDiscord = routes.some((r) => r.includes('discord'));
  if (!hasDiscord) throw new Error('/api/v1/discord route not mounted in Express app');
  console.log('  ✅ /api/v1/discord routes successfully mounted in Express app');

  console.log('\n--------------------------------------------------');
  console.log('🎉 ALL DISCORD STEP 1 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('--------------------------------------------------');
}

runStep1Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
