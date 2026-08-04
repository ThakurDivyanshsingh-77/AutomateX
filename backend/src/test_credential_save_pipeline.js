import { credentialService } from './credentials/credentialService.js';
import { createCredential, getUserCredentials, deleteCredential } from './controllers/credentialController.js';
import { Credential } from './credentials/Credential.js';
import mongoose from 'mongoose';

async function runCredentialPipelineTests() {
  console.log('=== Running Credential Save Pipeline End-to-End Test Suite ===\n');
  let passed = 0;
  let total = 0;

  function assert(testName, actual, expected) {
    total++;
    const match = JSON.stringify(actual) === JSON.stringify(expected);
    if (match) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
    }
  }

  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  // Test 1: Direct Service Call
  console.log('Test 1: Testing direct credentialService.createCredential for MongoDB...');
  const cred = await credentialService.createCredential(mockOwnerId, {
    name: 'Test Production MongoDB Vault',
    service: 'mongodb',
    authType: 'uri',
    secret: {
      connectionUri: 'mongodb://localhost:27017',
      databaseName: 'automatex_prod',
      authDatabase: 'admin',
      tlsEnable: false,
    },
  });
  assert('credentialService.createCredential returns object with _id', Boolean(cred._id), true);
  assert('Credential service field is mongodb', cred.service, 'mongodb');
  assert('Credential authType field is uri', cred.authType, 'uri');

  // Test 2: Controller API Mock Call
  console.log('\nTest 2: Testing Controller API createCredential handler...');
  let mockRes = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };

  await createCredential(
    {
      user: { _id: mockOwnerId },
      body: {
        name: 'API Controller Mongo Credential',
        service: 'mongodb',
        authType: 'uri',
        secret: JSON.stringify({
          connectionUri: 'mongodb://localhost:27017',
          databaseName: 'automatex_api_db',
        }),
      },
    },
    mockRes,
    () => {}
  );

  assert('createCredential Controller returns HTTP 201 Created', mockRes.statusCode, 201);
  assert('createCredential Response includes success: true', mockRes.body.success, true);
  assert('createCredential Response contains saved credential', Boolean(mockRes.body.credential), true);

  // Test 3: Retrieve Saved Credential
  const createdId = mockRes.body.credential._id;
  const retrievedSecret = await credentialService.getCredentialById(createdId, mockOwnerId);
  assert('Decrypted Secret preserves connectionUri', retrievedSecret.connectionUri, 'mongodb://localhost:27017');
  assert('Decrypted Secret preserves databaseName', retrievedSecret.databaseName, 'automatex_api_db');

  // Test 4: Delete Credential
  const deleted = await credentialService.deleteCredential(mockOwnerId, createdId);
  assert('deleteCredential returns true', deleted, true);

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL CREDENTIAL PIPELINE TESTS PASSED PERFECTLY WITH 0 ERRORS!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runCredentialPipelineTests().catch((err) => {
  console.error('Pipeline Test Error:', err);
  process.exit(1);
});
