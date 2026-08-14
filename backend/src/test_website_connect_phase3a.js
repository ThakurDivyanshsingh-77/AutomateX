import assert from 'assert';
import http from 'http';
import { websiteConnectionService } from './services/WebsiteConnectionService.js';
import { WebsiteConnectExecutor } from './engine/executors/WebsiteConnectExecutor.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';
import { ExpressionEngine } from './engine/expression/ExpressionEngine.js';
import { ExecutionContext } from './engine/runtime/ExecutionContext.js';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASSED: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${desc}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✅ PASSED: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${desc}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function runPhase3aTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX PHASE 3A: WEBSITE CONNECTION TEST SUITE');
  console.log('======================================================\n');

  // Start a local mock HTTP server to test connection ping safely
  const mockServer = http.createServer((req, res) => {
    if (req.url === '/api/unauthorized') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
    } else if (req.url === '/api/health' || req.url === '/api' || req.url === '/' || req.url.startsWith('/api?')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', authenticated: Boolean(req.headers.authorization) }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  await new Promise((resolve) => mockServer.listen(0, resolve));
  const serverPort = mockServer.address().port;
  const mockBaseUrl = `http://127.0.0.1:${serverPort}`;

  try {
    // ─── 1. URL Normalization Tests ──────────────────────────────────────────
    console.log('1️⃣ TESTING URL NORMALIZATION & VALIDATION');
    it('Normalizes trailing slashes from URLs', () => {
      const normalized = websiteConnectionService.normalizeUrl('https://example.com///');
      assert.strictEqual(normalized, 'https://example.com');
    });

    it('Adds https:// protocol if missing', () => {
      const normalized = websiteConnectionService.normalizeUrl('chemtom.com/api/');
      assert.strictEqual(normalized, 'https://chemtom.com/api');
    });

    it('Preserves query parameters without trailing slashes on path', () => {
      const normalized = websiteConnectionService.normalizeUrl('https://store.com/products/?ref=123');
      assert.ok(normalized.includes('https://store.com/products'));
    });

    // ─── 2. Encryption & Credential Vault Tests ──────────────────────────────
    console.log('\n2️⃣ TESTING ENCRYPTION & ZERO-LEAK CREDENTIAL VAULT');
    let createdConn = null;
    await itAsync('Creates Website Connection with encrypted credentials and unique connectionId', async () => {
      createdConn = await websiteConnectionService.createConnection({
        ownerId: 'usr_64a1b2c3d4e5f60718293a4b',
        name: 'Chemtom Production Store',
        websiteUrl: mockBaseUrl,
        apiBaseUrl: `${mockBaseUrl}/api`,
        connectionMethod: 'restApi',
        authType: 'bearerToken',
        credentials: {
          token: 'secret_token_1234567890abcdef7F2A',
        },
        customHeaders: [{ key: 'X-Custom-Client', value: 'AutomateX-Bot' }],
      });

      assert.ok(createdConn.id.startsWith('conn_'), 'connectionId should start with conn_');
      assert.strictEqual(createdConn.name, 'Chemtom Production Store');
      assert.strictEqual(createdConn.websiteUrl, mockBaseUrl);
      assert.strictEqual(createdConn.connectionMethod, 'restApi');
    });

    it('Masks credentials in API responses (never exposes plaintext secrets)', () => {
      assert.ok(createdConn.maskedCredentials, 'maskedCredentials should exist');
      assert.ok(!createdConn.credentials, 'Plaintext credentials must not be returned');
      assert.ok(createdConn.maskedCredentials.token.includes('••••'));
      assert.ok(createdConn.maskedCredentials.token.endsWith('7F2A'));
    });

    await itAsync('Retrieves internal decrypted credentials securely server-side only', async () => {
      const internalConn = await websiteConnectionService.getConnection(createdConn.id, 'usr_64a1b2c3d4e5f60718293a4b', true);
      assert.ok(internalConn.credentials, 'Internal call should retrieve credentials');
      assert.strictEqual(internalConn.credentials.token, 'secret_token_1234567890abcdef7F2A');
    });

    // ─── 3. Connection Test Endpoint ─────────────────────────────────────────
    console.log('\n3️⃣ TESTING CONNECTION TESTER & DIAGNOSTICS');
    await itAsync('Successfully tests valid website connection', async () => {
      const result = await websiteConnectionService.testConnection(createdConn.id, 'usr_64a1b2c3d4e5f60718293a4b');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.status, 'connected');
      assert.ok(result.responseTimeMs >= 0, 'responseTimeMs should be calculated');
      assert.strictEqual(result.message, 'Connection successful');
    });

    await itAsync('Handles 401 Unauthorized safely with human-readable error', async () => {
      const rawRes = await websiteConnectionService.testRawConnection({
        websiteUrl: `${mockBaseUrl}/api/unauthorized`,
        connectionMethod: 'restApi',
        authType: 'bearerToken',
        credentials: { token: 'invalid_token' },
      });
      assert.strictEqual(rawRes.success, false);
      assert.strictEqual(rawRes.status, 'error');
      assert.strictEqual(rawRes.message, 'Authentication failed. Please verify your API token or credentials.');
    });

    await itAsync('Handles network/server unreachable safely', async () => {
      const rawRes = await websiteConnectionService.testRawConnection({
        websiteUrl: 'http://127.0.0.1:59999/unreachable',
        connectionMethod: 'restApi',
      });
      assert.strictEqual(rawRes.success, false);
      assert.strictEqual(rawRes.status, 'error');
      assert.ok(rawRes.message.includes('unavailable') || rawRes.message.includes('failed'));
    });

    // ─── 4. End-to-End Workflow Execution ────────────────────────────────────
    console.log('\n4️⃣ EXECUTING WORKFLOW: Start -> Website -> Connect -> End');
    const workflowDefinition = {
      id: 'wf_phase3a_test',
      name: 'Phase 3A Website Connect Workflow',
      ownerId: 'usr_64a1b2c3d4e5f60718293a4b',
      nodes: [
        {
          id: 'start_node',
          type: 'start',
          data: { label: 'Start Trigger' },
        },
        {
          id: 'website_node',
          type: 'websiteConnect',
          data: {
            label: 'Website → Connect',
            config: {
              connectionId: createdConn.id,
            },
          },
        },
        {
          id: 'end_node',
          type: 'end',
          data: { label: 'End Completion' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start_node', target: 'website_node' },
        { id: 'e2', source: 'website_node', target: 'end_node' },
      ],
    };

    let workflowResult = null;
    await itAsync('Executes workflow through WorkflowEngine', async () => {
      workflowResult = await WorkflowEngine.run(workflowDefinition, 'exec_3a_001', {
        ownerId: 'usr_64a1b2c3d4e5f60718293a4b',
      });
      assert.ok(workflowResult.success || workflowResult.status === 'success' || workflowResult.status === 'SUCCESS');
    });

    it('Step "Website → Connect" executed with status success', () => {
      const logs = workflowResult.logs || workflowResult.steps || [];
      const websiteStep = logs.find((s) => s.nodeId === 'website_node');
      assert.ok(websiteStep, 'Website step should exist in execution logs');
      assert.strictEqual(websiteStep.status, 'success');
    });

    it('Website → Connect step outputs connectionId and website metadata', () => {
      const logs = workflowResult.logs || workflowResult.steps || [];
      const websiteStep = logs.find((s) => s.nodeId === 'website_node');
      const stepOutput = websiteStep.output !== undefined ? websiteStep.output : (websiteStep.outputData || {});
      assert.strictEqual(stepOutput.success, true);
      assert.strictEqual(stepOutput.connectionId, createdConn.id);
      assert.strictEqual(stepOutput.website.url, mockBaseUrl);
      assert.strictEqual(stepOutput.website.method, 'REST_API');
      assert.strictEqual(stepOutput.website.status, 'connected');
    });

    // ─── 5. Downstream Variable Resolution ───────────────────────────────────
    console.log('\n5️⃣ TESTING DOWNSTREAM VARIABLE EXPRESSIONS');
    const downstreamWorkflow = {
      id: 'wf_downstream_test',
      name: 'Downstream Variable Test',
      ownerId: 'usr_64a1b2c3d4e5f60718293a4b',
      nodes: [
        { id: 'start_node', type: 'start', data: { label: 'Start Trigger' } },
        {
          id: 'website_node',
          type: 'websiteConnect',
          data: {
            label: 'Website → Connect',
            config: { connectionId: createdConn.id },
          },
        },
        {
          id: 'downstream_log',
          type: 'log',
          data: {
            label: 'Log Connection Info',
            config: {
              message: 'Connected to {{steps["Website → Connect"].website.url}} with ID {{steps["Website → Connect"].connectionId}} (status: {{steps["Website → Connect"].website.status}})',
            },
          },
        },
        { id: 'end_node', type: 'end', data: { label: 'End Completion' } },
      ],
      edges: [
        { id: 'e1', source: 'start_node', target: 'website_node' },
        { id: 'e2', source: 'website_node', target: 'downstream_log' },
        { id: 'e3', source: 'downstream_log', target: 'end_node' },
      ],
    };

    let downstreamResult = null;
    await itAsync('Resolves {{steps["Website → Connect"]...}} in downstream nodes', async () => {
      downstreamResult = await WorkflowEngine.run(downstreamWorkflow, 'exec_downstream_001', {
        ownerId: 'usr_64a1b2c3d4e5f60718293a4b',
      });
      assert.ok(downstreamResult.success || downstreamResult.status === 'success' || downstreamResult.status === 'SUCCESS');

      const logs = downstreamResult.logs || downstreamResult.steps || [];
      const logStep = logs.find((s) => s.nodeId === 'downstream_log');
      assert.ok(logStep, 'Log step should exist in execution logs');
      const logMsg = logStep.output?.message || logStep.outputData?.message || logStep.input?.message || logStep.inputData?.message || '';
      assert.ok(logMsg.includes(mockBaseUrl), 'Log message should contain resolved URL');
      assert.ok(logMsg.includes(createdConn.id), 'Log message should contain resolved connectionId');
      assert.ok(logMsg.includes('connected'), 'Log message should contain status connected');
    });

    // ─── 6. Clean Deletion & Security Verification ───────────────────────────
    console.log('\n6️⃣ TESTING DELETION & SECURITY ACCESS CONTROLS');
    await itAsync('Deletes connection securely', async () => {
      const delRes = await websiteConnectionService.deleteConnection(createdConn.id, 'usr_64a1b2c3d4e5f60718293a4b');
      assert.strictEqual(delRes.success, true);
    });

    await itAsync('Fails gracefully when deleted connection is accessed', async () => {
      let threw = false;
      try {
        await websiteConnectionService.getConnection(createdConn.id, 'usr_64a1b2c3d4e5f60718293a4b');
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, true, 'Should throw error for deleted connection');
    });

  } finally {
    mockServer.close();
  }

  console.log('\n======================================================');
  console.log(`📊 PHASE 3A TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3aTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
