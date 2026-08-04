import { MongoConnectionPool } from './engine/database/MongoConnectionPool.js';
import { MongoProvider } from './engine/database/MongoProvider.js';
import { credentialService } from './credentials/credentialService.js';
import { testMongoConnection, getMongoStatus } from './controllers/databaseController.js';

async function runTests() {
  console.log('=== Running Phase 14.1 MongoDB Framework & Credential Management Test Suite ===\n');
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

  // 1. Connection Pool Test
  const poolStatus = MongoConnectionPool.getPoolStatus();
  assert('MongoConnectionPool initializes empty/active pool', typeof poolStatus.activeConnections, 'number');

  // 2. Mongo Provider Health Check & Latency
  const health = await MongoConnectionPool.healthCheck({ databaseName: 'automatex_test' });
  assert('Health Check Returns Connected status', health.connected, true);
  assert('Health Check Measures Latency in MS', typeof health.latencyMs, 'number');
  assert('Health Check Detects Mongo Version', Boolean(health.version), true);

  // 3. Mongo Credential Vault Encryption Test
  const cred = await credentialService.createCredential('user_owner_1', {
    name: 'Production Mongo DB',
    service: 'mongodb',
    authType: 'uri',
    secret: {
      connectionUri: 'mongodb://localhost:27017',
      databaseName: 'automatex_prod',
      authDatabase: 'admin',
      tlsEnable: false,
    },
  });
  assert('MongoDB Credential Encrypted & Created', Boolean(cred._id), true);
  assert('MongoDB Credential Masks Secret Value', cred.maskedValue !== 'mongodb://localhost:27017', true);

  // 4. Decrypt Credential Test
  const decrypted = await credentialService.getCredentialById(cred._id, 'user_owner_1');
  assert('MongoDB Credential Decrypts Correctly', decrypted.connectionUri, 'mongodb://localhost:27017');
  assert('MongoDB Credential Preserves Database Name', decrypted.databaseName, 'automatex_prod');

  // 5. Test Controller Handler
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

  await testMongoConnection(
    { body: { connectionUri: 'mongodb://localhost:27017', databaseName: 'automatex' } },
    mockRes,
    () => {}
  );
  assert('testMongoConnection API returns 200 OK', mockRes.statusCode, 200);
  assert('testMongoConnection API returns Connected status', mockRes.body.message, 'Connected Successfully');

  // 6. Test Pool Status API Handler
  mockRes = {
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
  await getMongoStatus({}, mockRes, () => {});
  assert('getMongoStatus API returns 200 OK', mockRes.statusCode, 200);
  assert('getMongoStatus API returns active connections', typeof mockRes.body.status.activeConnections, 'number');

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PHASE 14.1 MONGODB FRAMEWORK TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
