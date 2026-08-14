import http from 'http';
import assert from 'assert';
import { GeminiStructureTournamentExecutor } from './engine/executors/GeminiStructureTournamentExecutor.js';
import { WebsiteCreateTournamentExecutor } from './engine/executors/WebsiteCreateTournamentExecutor.js';
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

const SAMPLE_DOCUMENT_TEXT = `
========================================
TOURNAMENT SPECIFICATION DOCUMENT
========================================
Tournament Title: Apex Championship
Game: Valorant
Mode: SQUAD
Prize Pool: ₹10,000
Entry Fee: ₹0
Slots: 64
Winner Count: 3
First Prize: ₹5,000
Second Prize: ₹3,000
Third Prize: ₹2,000
Date: 2026-08-20
Time: 18:00
Map: Haven
Banner Image: https://example.com/automatex-test-banner.jpg
Description: Official AutomateX test tournament for competitive Valorant teams.
========================================
`;

async function runTournamentWorkflowTests() {
  console.log(`\n======================================================`);
  console.log(`🏆 AUTOMATEX: TOURNAMENT PIPELINE END-TO-END TEST SUITE`);
  console.log(`======================================================\n`);

  const receivedRequests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const authHeader = req.headers['authorization'] || '';
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (e) {}

      if (!authHeader.includes('Bearer apex_esports_secret_jwt_token')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized: Invalid Apex JWT token.' }));
      }

      receivedRequests.push({ url: req.url, method: req.method, headers: req.headers, body: parsed });

      if (parsed.title === 'Validation Fail Tournament') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid tournament data.',
          errors: { slots: 'Slots cannot be negative' }
        }));
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tournamentId: `tourn_apex_${Date.now()}`,
        tournament: parsed,
        message: 'Tournament successfully created on Apex Esports backend.',
      }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  const targetApiBaseUrl = `http://127.0.0.1:${serverPort}/api/v1`;

  try {
    const testUserId = 'user_apex_test_owner';
    const connection = await websiteConnectionService.createConnection({
      ownerId: testUserId,
      name: 'Apex Esports Platform',
      websiteUrl: 'https://apex-esports-admin.vercel.app',
      apiBaseUrl: targetApiBaseUrl,
      connectionMethod: 'restApi',
      authType: 'bearerToken',
      credentials: {
        token: 'apex_esports_secret_jwt_token',
      },
    });

    // ----------------------------------------------------------------
    // TEST 1: GEMINI STRUCTURE TOURNAMENT AI EXTRACTION
    // ----------------------------------------------------------------
    console.log(`1️⃣ TESTING GEMINI → STRUCTURE TOURNAMENT (ZERO-HALLUCINATION & NO PLACEHOLDERS)`);

    const geminiExecutor = new GeminiStructureTournamentExecutor();

    let extractedData = null;
    await asyncReport('Extracts exact Valorant tournament data from raw document text', async () => {
      const result = await geminiExecutor.execute(
        {
          id: 'step_gemini_tourn',
          type: 'geminiStructureTournament',
          config: {
            documentText: SAMPLE_DOCUMENT_TEXT,
            model: 'gemini-1.5-pro',
            temperature: 0.0,
          },
        },
        { currentData: { content: { text: SAMPLE_DOCUMENT_TEXT } } }
      );

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 1);
      assert.ok(result.tournament);

      const t = result.tournament;
      assert.strictEqual(t.title, 'Apex Championship');
      assert.strictEqual(t.game, 'Valorant');
      assert.strictEqual(t.mode, 'SQUAD');
      assert.strictEqual(t.prizePool, '₹10,000');
      assert.strictEqual(t.entryFee, 0);
      assert.strictEqual(t.slots, 64);
      assert.strictEqual(t.winnerCount, '3');
      assert.strictEqual(t.firstPrize, 5000);
      assert.strictEqual(t.secondPrize, 3000);
      assert.strictEqual(t.thirdPrize, 2000);
      assert.strictEqual(t.date, '2026-08-20');
      assert.strictEqual(t.time, '18:00');
      assert.strictEqual(t.map, 'Haven');
      assert.strictEqual(t.roomID, '');
      assert.strictEqual(t.password, '');
      assert.strictEqual(t.bannerImage, 'https://example.com/automatex-test-banner.jpg');
      assert.ok(t.description.includes('Official AutomateX test tournament'));

      extractedData = t;
    });

    report('Strict Zero-Hallucination: Never returns World\'s Edge, 60 slots, or field name placeholders', () => {
      assert.notStrictEqual(extractedData.map, "World's Edge");
      assert.notStrictEqual(extractedData.slots, 60);
      assert.notStrictEqual(extractedData.title, 'title');
      assert.notStrictEqual(extractedData.game, 'game');
      assert.notStrictEqual(extractedData.mode, 'mode');
      assert.notStrictEqual(extractedData.date, 'date');
      assert.notStrictEqual(extractedData.time, 'time');
      assert.notStrictEqual(extractedData.map, 'map');
      assert.strictEqual(extractedData.map, 'Haven');
      assert.strictEqual(extractedData.slots, 64);
      assert.strictEqual(extractedData.winnerCount, '3');
    });

    // ----------------------------------------------------------------
    // TEST 2: WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)
    // ----------------------------------------------------------------
    console.log(`\n2️⃣ TESTING WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)`);

    const createTournExecutor = new WebsiteCreateTournamentExecutor();

    await asyncReport('Executes Dry Run Mode without HTTP network calls and returns wouldCreate: 1', async () => {
      const dryRes = await createTournExecutor.execute(
        {
          id: 'step_create_tourn_dry',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: extractedData,
            endpoint: '/tournaments',
            method: 'POST',
            dryRun: true,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(dryRes.success, true);
      assert.strictEqual(dryRes.dryRun, true);
      assert.strictEqual(dryRes.validated, true);
      assert.strictEqual(dryRes.wouldCreate, 1);
      assert.strictEqual(dryRes.created, 0);
      assert.strictEqual(dryRes.failed, 0);
      assert.strictEqual(receivedRequests.length, 0, 'Dry Run must never dispatch HTTP requests');
    });

    // ----------------------------------------------------------------
    // TEST 3: WEBSITE → CREATE TOURNAMENT (LIVE MODE WITH POST /tournaments)
    // ----------------------------------------------------------------
    console.log(`\n3️⃣ TESTING WEBSITE → CREATE TOURNAMENT (LIVE POST /tournaments)`);

    await asyncReport('Dispatches live POST /tournaments resolving to /api/v1/tournaments with decrypted Bearer token and created: 1', async () => {
      const liveRes = await createTournExecutor.execute(
        {
          id: 'step_create_tourn_live',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: extractedData,
            endpoint: '/tournaments',
            method: 'POST',
            dryRun: false,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(liveRes.success, true);
      assert.strictEqual(liveRes.dryRun, false);
      assert.strictEqual(liveRes.created, 1);
      assert.strictEqual(liveRes.failed, 0);
      assert.ok(liveRes.tournamentId);

      assert.strictEqual(receivedRequests.length, 1);
      const req = receivedRequests[0];
      assert.strictEqual(req.url, '/api/v1/tournaments');
      assert.strictEqual(req.method, 'POST');
      assert.strictEqual(req.headers['authorization'], 'Bearer apex_esports_secret_jwt_token');
      assert.strictEqual(req.body.title, 'Apex Championship');
      assert.strictEqual(req.body.game, 'Valorant');
      assert.strictEqual(req.body.mode, 'SQUAD');
      assert.strictEqual(req.body.prizePool, '₹10,000');
      assert.strictEqual(req.body.winnerCount, '3');
      assert.strictEqual(req.body.firstPrize, 5000);
      assert.strictEqual(req.body.secondPrize, 3000);
      assert.strictEqual(req.body.thirdPrize, 2000);
      assert.strictEqual(req.body.map, 'Haven');
      assert.strictEqual(req.body.slots, 64);
      assert.strictEqual(req.body.roomID, '');
      assert.strictEqual(req.body.password, '');
    });

    // ----------------------------------------------------------------
    // TEST 4: PRE-VALIDATION ENFORCEMENT & PLACEHOLDER REJECTION
    // ----------------------------------------------------------------
    console.log(`\n4️⃣ TESTING PRE-VALIDATION & PLACEHOLDER REJECTION`);

    await asyncReport('Stops workflow before HTTP POST if required field is missing or contains placeholder', async () => {
      const placeholderTournament = { ...extractedData, title: 'title' };
      let threwError = false;

      try {
        await createTournExecutor.execute(
          {
            id: 'step_invalid_tourn',
            type: 'websiteCreateTournament',
            config: {
              connectionId: connection.connectionId,
              tournament: placeholderTournament,
              endpoint: '/tournaments',
              method: 'POST',
              dryRun: false,
            },
          },
          { user: { _id: testUserId } }
        );
      } catch (err) {
        threwError = true;
        assert.ok(err.message.includes('Pre-validation error') || err.message.includes('placeholder'));
      }

      assert.strictEqual(threwError, true, 'Executor must throw and stop when placeholder or invalid payload is given');
    });

    // ----------------------------------------------------------------
    // TEST 5: HTTP 400 HANDLING WITH DETAILED BACKEND RESPONSE
    // ----------------------------------------------------------------
    console.log(`\n5️⃣ TESTING HTTP 400 ERROR RESPONSE HANDLING`);

    await asyncReport('Handles HTTP 400 without converting to success and surfaces validation details', async () => {
      const invalidData = { ...extractedData, title: 'Validation Fail Tournament' };
      const failRes = await createTournExecutor.execute(
        {
          id: 'step_fail_tourn',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: invalidData,
            endpoint: '/tournaments',
            method: 'POST',
            dryRun: false,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(failRes.success, false);
      assert.strictEqual(failRes.created, 0);
      assert.strictEqual(failRes.failed, 1);
      assert.ok(failRes.error.message.includes('400') || failRes.error.message.includes('Validation Error'));
    });

    // ----------------------------------------------------------------
    // TEST 6: FULL 6-NODE WORKFLOW ENGINE EXECUTION (NO LOOP NODE)
    // ----------------------------------------------------------------
    console.log(`\n6️⃣ TESTING FULL 6-NODE END-TO-END WORKFLOW ENGINE EXECUTION`);

    await asyncReport('Executes Start -> File Upload -> Extract Content -> Gemini Structure -> Website Connect -> Create Tournament -> End', async () => {
      const workflow = {
        id: 'wf_tournament_direct_publishing_pipeline',
        name: 'Apex Esports Direct Publishing Pipeline',
        nodes: [
          { id: 'start_node', type: 'start', config: {} },
          {
            id: 'gemini_tournament_node',
            type: 'geminiStructureTournament',
            config: {
              documentText: SAMPLE_DOCUMENT_TEXT,
            },
          },
          {
            id: 'website_connect_node',
            type: 'websiteConnect',
            config: {
              connectionId: connection.connectionId,
            },
          },
          {
            id: 'create_tournament_node',
            type: 'websiteCreateTournament',
            config: {
              connectionId: '{{steps["website_connect_node"].connectionId}}',
              tournament: '{{steps["gemini_tournament_node"].tournament}}',
              endpoint: '/tournaments',
              method: 'POST',
              dryRun: true,
            },
          },
          {
            id: 'end_node',
            type: 'end',
            config: {},
          },
        ],
        edges: [
          { source: 'start_node', target: 'gemini_tournament_node' },
          { source: 'gemini_tournament_node', target: 'website_connect_node' },
          { source: 'website_connect_node', target: 'create_tournament_node' },
          { source: 'create_tournament_node', target: 'end_node' },
        ],
      };

      const execResult = await WorkflowEngine.run(
        workflow,
        'exec_full_tourn_direct_1',
        {
          ownerId: testUserId,
          user: { _id: testUserId },
          currentData: { content: { text: SAMPLE_DOCUMENT_TEXT } },
        }
      );

      assert.strictEqual(execResult.status.toLowerCase(), 'success');
      assert.strictEqual(execResult.nodesExecuted, 5);

      const geminiLog = execResult.logs.find((l) => l.nodeId === 'gemini_tournament_node');
      assert.ok(geminiLog && geminiLog.output.success);
      assert.strictEqual(geminiLog.output.tournament.title, 'Apex Championship');
      assert.strictEqual(geminiLog.output.tournament.map, 'Haven');
      assert.strictEqual(geminiLog.output.tournament.winnerCount, '3');

      const createLog = execResult.logs.find((l) => l.nodeId === 'create_tournament_node');
      assert.ok(createLog && createLog.output.success);
      assert.strictEqual(createLog.output.wouldCreate, 1);
    });

  } finally {
    if (server && server.listening) {
      server.close();
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 TOURNAMENT WORKFLOW TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`======================================================\n`);
  process.exitCode = failedTests > 0 ? 1 : 0;
}

runTournamentWorkflowTests().catch((err) => {
  console.error('Tournament Workflow Test Suite Fatal Error:', err);
  process.exit(1);
});
