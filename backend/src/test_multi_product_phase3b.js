import http from 'http';
import assert from 'assert';
import { GeminiStructureProductsExecutor } from './engine/executors/GeminiStructureProductsExecutor.js';
import { ForEachProductExecutor } from './engine/executors/ForEachProductExecutor.js';
import { WebsiteCreateProductExecutor } from './engine/executors/WebsiteCreateProductExecutor.js';
import { websiteConnectionService } from './services/WebsiteConnectionService.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';

let passedTests = 0;
let failedTests = 0;

function report(testName, fn) {
  try {
    fn();
    console.log(`  ✅ PASSED: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${testName}\n     Error: ${err.message}`);
    failedTests++;
  }
}

async function asyncReport(testName, fn) {
  try {
    await fn();
    console.log(`  ✅ PASSED: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${testName}\n     Error: ${err.message}`);
    failedTests++;
  }
}

const SAMPLE_MULTI_PRODUCT_DOCUMENT = `
# Beta-citronellol | 106-22-9

SEO Element | SEO-Optimized Value
URL Slug | https://www.chemtom.com/beta-citronellol
Primary Keyword | Beta-citronellol
Title Tag | Beta-citronellol Supplier | CAS 106-22-9
Meta Description | Buy high quality Beta-citronellol CAS 106-22-9 from reliable chemical supplier.
H1 Tag | Beta-citronellol CAS 106-22-9

Product Description:
Beta-citronellol is a naturally occurring acyclic monoterpenoid aroma chemical used extensively in fine fragrance compounding and cosmetic formulations.

## What is Beta-citronellol?
Beta-citronellol is an organic chemical compound with a fresh floral rose aroma.

### Frequently Asked Questions
Q: What is the CAS number for Beta-citronellol?
A: 106-22-9.

# Geraniol | 106-24-1

URL Slug: https://www.chemtom.com/geraniol
Primary Keyword: Geraniol
Title Tag: Geraniol Manufacturer | CAS 106-24-1
Meta Description: Premium grade Geraniol 106-24-1 for industrial applications.
H1: Geraniol CAS 106-24-1

Description:
Geraniol is a primary monoterpenoid alcohol that forms the primary part of rose oil and palmarosa oil.

# Nerol | 106-25-2

URL Slug: https://www.chemtom.com/nerol
Primary Keyword: Nerol
Title Tag: Nerol Supplier & Distributor | CAS 106-25-2
Meta Description: High purity Nerol isomer with sweet citrus undertones.
H1: Nerol CAS 106-25-2

Description:
Nerol is the cis-isomer of geraniol, featuring a fresh sweet rose note with citrus hints.
`;

async function runPhase3BTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 AUTOMATEX PHASE 3B: MULTI-PRODUCT WORKFLOW TEST SUITE`);
  console.log(`======================================================\n`);

  // ----------------------------------------------------------------
  // 1. Test Mock Target Server Setup
  // ----------------------------------------------------------------
  const receivedProducts = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const authHeader = req.headers['authorization'] || '';
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (e) {}

      // Check Authorization
      if (!authHeader.includes('Bearer secret_test_token_123')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }

      // Simulate partial failure on Nerol (400 Bad Request) if requested
      if (parsed.product_name === 'Nerol' && req.headers['x-fail-nerol'] === 'true') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid product slug configuration.' }));
      }

      receivedProducts.push(parsed);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        productId: `prod_${parsed.cas_number || Date.now()}`,
        name: parsed.product_name || parsed.name,
      }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  const targetApiUrl = `http://127.0.0.1:${serverPort}`;

  try {
    // ----------------------------------------------------------------
    // TEST SECTION 1: GEMINI MULTI-PRODUCT STRUCTURING
    // ----------------------------------------------------------------
    console.log(`1️⃣ TESTING GEMINI MULTI-PRODUCT PARSING & VALIDATION`);

    const geminiExecutor = new GeminiStructureProductsExecutor();
    let structuredResult;

    await asyncReport('Detects 3 products from multi-product document text', async () => {
      structuredResult = await geminiExecutor.execute(
        {
          id: 'gemini_step_1',
          type: 'geminiStructureProducts',
          config: {
            documentText: SAMPLE_MULTI_PRODUCT_DOCUMENT,
          },
        },
        { currentData: {} }
      );

      assert.strictEqual(structuredResult.success, true);
      assert.strictEqual(structuredResult.count, 3);
      assert.strictEqual(structuredResult.products.length, 3);
    });

    report('Preserves product names, CAS numbers and URLs accurately', () => {
      const [p1, p2, p3] = structuredResult.products;
      assert.strictEqual(p1.name, 'Beta-citronellol');
      assert.strictEqual(p1.casNumber, '106-22-9');
      assert.ok(p1.urlSlug.includes('beta-citronellol'));

      assert.strictEqual(p2.name, 'Geraniol');
      assert.strictEqual(p2.casNumber, '106-24-1');

      assert.strictEqual(p3.name, 'Nerol');
      assert.strictEqual(p3.casNumber, '106-25-2');
    });

    report('Enforces zero-hallucination for absent properties (null or empty array)', () => {
      const [p1] = structuredResult.products;
      assert.ok(Array.isArray(p1.applications));
      assert.ok(Array.isArray(p1.benefits));
      assert.ok(Array.isArray(p1.safetyInformation));
    });

    // ----------------------------------------------------------------
    // TEST SECTION 2: FOR EACH PRODUCT NODE
    // ----------------------------------------------------------------
    console.log(`\n2️⃣ TESTING FOR EACH PRODUCT ITERATION NODE`);

    const forEachExecutor = new ForEachProductExecutor();
    let loopResult;

    await asyncReport('Initializes loop context with currentItem and totalItems', async () => {
      const mockContext = {
        variables: {},
        setVariable(key, val) { this.variables[key] = val; },
      };

      loopResult = await forEachExecutor.execute(
        {
          id: 'for_each_1',
          type: 'forEachProduct',
          config: {
            products: structuredResult.products,
          },
        },
        mockContext
      );

      assert.strictEqual(loopResult.success, true);
      assert.strictEqual(loopResult.totalItems, 3);
      assert.strictEqual(loopResult.currentIndex, 0);
      assert.strictEqual(loopResult.currentItem.name, 'Beta-citronellol');
      assert.strictEqual(mockContext.variables.currentItem.name, 'Beta-citronellol');
      assert.strictEqual(mockContext.variables.totalItems, 3);
    });

    // ----------------------------------------------------------------
    // TEST SECTION 3: WEBSITE CONNECTION & PRODUCT CREATOR (DRY RUN)
    // ----------------------------------------------------------------
    console.log(`\n3️⃣ TESTING WEBSITE → CREATE PRODUCT (DRY RUN MODE)`);

    const testUserId = 'user_phase3b_test';
    const connection = await websiteConnectionService.createConnection({
      ownerId: testUserId,
      name: 'Phase 3B Test Site',
      websiteUrl: targetApiUrl,
      apiBaseUrl: `${targetApiUrl}/api`,
      connectionMethod: 'restApi',
      authType: 'bearerToken',
      credentials: {
        token: 'secret_test_token_123',
      },
    });

    const createProductExecutor = new WebsiteCreateProductExecutor();

    await asyncReport('Executes Dry Run without dispatching network calls', async () => {
      const dryRunRes = await createProductExecutor.execute(
        {
          id: 'create_product_step',
          type: 'websiteCreateProduct',
          config: {
            connectionId: connection.connectionId,
            products: structuredResult.products,
            endpoint: '/api/products',
            method: 'POST',
            dryRun: true,
            fieldMapping: {
              name: 'product_name',
              casNumber: 'cas_number',
              urlSlug: 'slug',
              titleTag: 'seo_title',
            },
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(dryRunRes.success, true);
      assert.strictEqual(dryRunRes.summary.total, 3);
      assert.strictEqual(dryRunRes.summary.created, 3);
      assert.strictEqual(dryRunRes.summary.failed, 0);
      assert.strictEqual(receivedProducts.length, 0, 'No HTTP requests should be received in dry run');

      // Verify payload structure in dry run
      const payload1 = dryRunRes.results[0].payload;
      assert.strictEqual(payload1.product_name, 'Beta-citronellol');
      assert.strictEqual(payload1.cas_number, '106-22-9');
      assert.strictEqual(payload1.slug, 'https://www.chemtom.com/beta-citronellol');
    });

    // ----------------------------------------------------------------
    // TEST SECTION 4: LIVE REST API PRODUCT CREATION
    // ----------------------------------------------------------------
    console.log(`\n4️⃣ TESTING LIVE REST API PRODUCT CREATION`);

    await asyncReport('Successfully creates products over REST API with decrypted credentials', async () => {
      const liveExecutor = new WebsiteCreateProductExecutor();
      const liveRes = await liveExecutor.execute(
        {
          id: 'live_create_step',
          type: 'websiteCreateProduct',
          config: {
            connectionId: connection.connectionId,
            products: structuredResult.products,
            endpoint: '/api/products',
            method: 'POST',
            dryRun: false,
            rateLimitMs: 10,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(liveRes.success, true);
      assert.strictEqual(liveRes.summary.total, 3);
      assert.strictEqual(liveRes.summary.created, 3);
      assert.strictEqual(liveRes.summary.failed, 0);
      assert.strictEqual(receivedProducts.length, 3);
      assert.strictEqual(receivedProducts[0].product_name, 'Beta-citronellol');
      assert.strictEqual(receivedProducts[1].product_name, 'Geraniol');
      assert.strictEqual(receivedProducts[2].product_name, 'Nerol');
    });

    // ----------------------------------------------------------------
    // TEST SECTION 5: FAULT TOLERANCE & PARTIAL SUCCESS
    // ----------------------------------------------------------------
    console.log(`\n5️⃣ TESTING FAULT TOLERANCE & INDIVIDUAL PRODUCT FAILURES`);

    await asyncReport('Continues execution when one product fails and generates final summary', async () => {
      receivedProducts.length = 0; // Clear received list
      const faultExecutor = new WebsiteCreateProductExecutor();

      // Custom connection headers simulating error on Nerol
      const failConnection = await websiteConnectionService.createConnection({
        ownerId: testUserId,
        name: 'Fault Test Site',
        websiteUrl: targetApiUrl,
        apiBaseUrl: `${targetApiUrl}/api`,
        connectionMethod: 'restApi',
        authType: 'bearerToken',
        credentials: { token: 'secret_test_token_123' },
        customHeaders: [{ key: 'x-fail-nerol', value: 'true' }],
      });

      const faultRes = await faultExecutor.execute(
        {
          id: 'fault_create_step',
          type: 'websiteCreateProduct',
          config: {
            connectionId: failConnection.connectionId,
            products: structuredResult.products,
            endpoint: '/api/products',
            method: 'POST',
            dryRun: false,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(faultRes.summary.total, 3);
      assert.strictEqual(faultRes.summary.created, 2, 'Beta-citronellol and Geraniol must succeed');
      assert.strictEqual(faultRes.summary.failed, 1, 'Nerol must fail');
      assert.strictEqual(faultRes.results[2].status, 'failed');
      assert.ok(faultRes.results[2].error.includes('400'));
    });

    // ----------------------------------------------------------------
    // TEST SECTION 6: DUPLICATE PROTECTION
    // ----------------------------------------------------------------
    console.log(`\n6️⃣ TESTING DUPLICATE PROTECTION`);

    await asyncReport('Skips duplicate product when duplicateStrategy is "skip"', async () => {
      const dupeExecutor = new WebsiteCreateProductExecutor();
      const duplicateList = [
        { name: 'Beta-citronellol', casNumber: '106-22-9' },
        { name: 'Beta-citronellol', casNumber: '106-22-9' }, // Duplicate
      ];

      const dupeRes = await dupeExecutor.execute(
        {
          id: 'dupe_step',
          type: 'websiteCreateProduct',
          config: {
            connectionId: connection.connectionId,
            products: duplicateList,
            dryRun: true,
            duplicateStrategy: 'skip',
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(dupeRes.summary.total, 2);
      assert.strictEqual(dupeRes.summary.created, 1);
      assert.strictEqual(dupeRes.summary.skipped, 1);
      assert.strictEqual(dupeRes.results[1].status, 'skipped');
    });

    // ----------------------------------------------------------------
    // TEST SECTION 7: END-TO-END WORKFLOW ENGINE INTEGRATION
    // ----------------------------------------------------------------
    console.log(`\n7️⃣ TESTING END-TO-END WORKFLOW: Start -> Gemini Structure -> For Each -> Create -> End`);

    await asyncReport('Executes full Phase 3B workflow with variable resolution', async () => {
      const workflow = {
        id: 'wf_phase3b_master',
        name: 'Multi-Product Publishing Pipeline',
        nodes: [
          {
            id: 'start_node',
            type: 'start',
            config: {},
          },
          {
            id: 'structure_node',
            type: 'geminiStructureProducts',
            config: {
              documentText: SAMPLE_MULTI_PRODUCT_DOCUMENT,
            },
          },
          {
            id: 'loop_node',
            type: 'forEachProduct',
            config: {
              products: '{{steps["structure_node"].products}}',
            },
          },
          {
            id: 'create_node',
            type: 'websiteCreateProduct',
            config: {
              connectionId: connection.connectionId,
              products: '{{steps["loop_node"].products}}',
              dryRun: true,
            },
          },
          {
            id: 'end_node',
            type: 'end',
            config: {
              summary: '{{steps["create_node"].summary}}',
            },
          },
        ],
        edges: [
          { source: 'start_node', target: 'structure_node' },
          { source: 'structure_node', target: 'loop_node' },
          { source: 'loop_node', target: 'create_node' },
          { source: 'create_node', target: 'end_node' },
        ],
      };

      const execResult = await WorkflowEngine.run(
        workflow,
        'exec_phase3b_test',
        {
          ownerId: testUserId,
          user: { _id: testUserId },
        }
      );

      assert.strictEqual(execResult.status.toLowerCase(), 'success');
      assert.strictEqual(execResult.nodesExecuted, 5);

      const structureLog = execResult.logs.find((l) => l.nodeId === 'structure_node');
      const createLog = execResult.logs.find((l) => l.nodeId === 'create_node');

      assert.ok(structureLog && structureLog.output.success);
      assert.strictEqual(structureLog.output.count, 3);
      assert.ok(createLog && createLog.output.success);
      assert.strictEqual(createLog.output.summary.created, 3);
    });
  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`📊 PHASE 3B TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`======================================================\n`);
}

runPhase3BTests().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
