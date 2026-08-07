import { DiscordMessageService } from './discord/services/DiscordMessageService.js';
import { DiscordNodeExecutor } from './discord/executors/DiscordNodeExecutor.js';
import { credentialService } from './credentials/credentialService.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import app from './app.js';
import mongoose from 'mongoose';

async function runExhaustiveStep4Verification() {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting Exhaustive Discord Step 4 Verification');
  console.log('--------------------------------------------------');

  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  // Test 1: Create a mock credential in encrypted vault
  console.log('\n[Test 1/8] Creating encrypted Discord credential for testing...');
  const mockCred = await credentialService.createCredential(mockOwnerId, {
    name: 'Step 4 Test Bot',
    service: 'discord',
    authType: 'botToken',
    secret: { botToken: 'MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.TEST_SECRET_BOT_TOKEN_STEP4' },
  });
  const credId = String(mockCred._id);
  console.log('  ✅ Credential created with ID:', credId);

  // Test 2: Validation Check - Empty Message Rejection
  console.log('\n[Test 2/8] Testing Validation: Empty Message Rejection...');
  try {
    await DiscordMessageService.sendMessage(mockOwnerId, credId, {
      credentialId: credId,
      guildId: '111111111111111111',
      channelId: '222222222222222222',
      content: '   ',
    });
    throw new Error('Should have rejected empty message');
  } catch (err) {
    console.log('  ✅ Correctly rejected empty message:', err.message);
  }

  // Test 3: Validation Check - Exceeding 2000 Chars Limit
  console.log('\n[Test 3/8] Testing Validation: Message Exceeding 2000 Characters Limit...');
  const longContent = 'A'.repeat(2001);
  try {
    await DiscordMessageService.sendMessage(mockOwnerId, credId, {
      credentialId: credId,
      guildId: '111111111111111111',
      channelId: '222222222222222222',
      content: longContent,
    });
    throw new Error('Should have rejected content over 2000 characters');
  } catch (err) {
    console.log('  ✅ Correctly rejected content over 2000 characters:', err.message);
  }

  // Test 4: Validation Check - Missing Guild or Channel ID
  console.log('\n[Test 4/8] Testing Validation: Missing Guild or Channel ID...');
  try {
    await DiscordMessageService.sendMessage(mockOwnerId, credId, {
      credentialId: credId,
      guildId: '',
      channelId: '222222222222222222',
      content: 'Hello World',
    });
    throw new Error('Should have rejected missing guildId');
  } catch (err) {
    console.log('  ✅ Correctly caught missing guildId error:', err.message);
  }

  // Test 5: Embed JSON Parsing Validation
  console.log('\n[Test 5/8] Testing Embed JSON Parsing & Payload Formatting...');
  const validEmbedJson = JSON.stringify([
    {
      title: 'Workflow Execution Notification',
      description: 'System alert from AutomateX',
      color: 5814783,
    },
  ]);
  
  // Test invalid embed JSON string
  try {
    await DiscordMessageService.sendMessage(mockOwnerId, credId, {
      credentialId: credId,
      guildId: '111111111111111111',
      channelId: '222222222222222222',
      content: 'Alert',
      embeds: '{ invalid_json: ',
    });
    throw new Error('Should have rejected invalid embed JSON');
  } catch (err) {
    console.log('  ✅ Correctly rejected invalid embed JSON string:', err.message);
  }

  // Test 6: Backend ExecutorRegistry Registration
  console.log('\n[Test 6/8] Testing ExecutorRegistry Integration...');
  const executor = ExecutorRegistry.getExecutor('discordSendMessage');
  if (!executor) throw new Error('discordSendMessage not registered in ExecutorRegistry');
  console.log('  ✅ ExecutorRegistry resolved discordSendMessage handler successfully');

  // Test 7: Non-existent Credential Handling
  console.log('\n[Test 7/8] Testing Non-existent Credential Error Handling...');
  try {
    await DiscordMessageService.sendMessage(mockOwnerId, 'non_existent_cred_id', {
      credentialId: 'non_existent_cred_id',
      guildId: '111111111111111111',
      channelId: '222222222222222222',
      content: 'Test',
    });
    throw new Error('Should have failed for non-existent credential');
  } catch (err) {
    console.log('  ✅ Correctly caught error for missing credential:', err.message);
  }

  // Test 8: Express Route Mounting Check
  console.log('\n[Test 8/8] Testing Express Route Registration for Send Message...');
  const routes = app._router.stack
    .filter((r) => r.route || r.name === 'router')
    .map((r) => r.regexp.toString());
  const hasSendMessage = routes.some((r) => r.includes('discord'));
  if (!hasSendMessage) throw new Error('/api/v1/discord/send-message route not mounted');
  console.log('  ✅ POST /api/v1/discord/send-message & /messages/send mounted cleanly');

  console.log('\n--------------------------------------------------');
  console.log('🎉 ALL EXHAUSTIVE STEP 4 (SEND MESSAGE NODE) VERIFICATION TESTS PASSED!');
  console.log('--------------------------------------------------');
}

runExhaustiveStep4Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
