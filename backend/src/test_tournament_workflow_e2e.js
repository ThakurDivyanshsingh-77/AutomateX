import http from 'http';
import assert from 'assert';
import { GeminiStructureTournamentExecutor } from './engine/executors/GeminiStructureTournamentExecutor.js';
import { ForEachTournamentExecutor } from './engine/executors/ForEachTournamentExecutor.js';
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
Tournament Title: AutomateX Test Tournament
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
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tournamentId: `tourn_val_${Date.now()}`,
        tournament: parsed,
        message: 'Tournament successfully created on Apex Esports backend.',
      }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  const targetApiUrl = `http://127.0.0.1:${serverPort}`;

  try {
    const testUserId = 'user_apex_test_owner';
    const connection = await websiteConnectionService.createConnection({
      ownerId: testUserId,
      name: 'Apex Esports Platform',
      websiteUrl: targetApiUrl,
      apiBaseUrl: targetApiUrl,
      connectionMethod: 'restApi',
      authType: 'bearerToken',
      credentials: {
        token: 'apex_esports_secret_jwt_token',
      },
    });

    // ----------------------------------------------------------------
    // TEST 1: GEMINI STRUCTURE TOURNAMENT AI EXTRACTION
    // ----------------------------------------------------------------
    console.log(`1️⃣ TESTING GEMINI → STRUCTURE TOURNAMENT (ZERO-HALLUCINATION)`);

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
      assert.strictEqual(t.title, 'AutomateX Test Tournament');
      assert.strictEqual(t.game, 'Valorant');
      assert.strictEqual(t.mode, 'SQUAD');
      assert.strictEqual(t.prizePool, 10000);
      assert.strictEqual(t.entryFee, 0);
      assert.strictEqual(t.slots, 64);
      assert.strictEqual(t.winnerCount, 3);
      assert.strictEqual(t.firstPrize, 5000);
      assert.strictEqual(t.secondPrize, 3000);
      assert.strictEqual(t.thirdPrize, 2000);
      assert.strictEqual(t.date, '2026-08-20');
      assert.strictEqual(t.time, '18:00');
      assert.strictEqual(t.map, 'Haven');
      assert.strictEqual(t.bannerImage, 'https://example.com/automatex-test-banner.jpg');
      assert.ok(t.description.includes('Official AutomateX test tournament'));

      extractedData = t;
    });

    report('Strict Zero-Hallucination: Never returns World\'s Edge or 60 slots unless present', () => {
      assert.notStrictEqual(extractedData.map, "World's Edge", 'Map must NOT hallucinate World\'s Edge');
      assert.notStrictEqual(extractedData.slots, 60, 'Slots must NOT hallucinate 60');
      assert.strictEqual(extractedData.map, 'Haven');
      assert.strictEqual(extractedData.slots, 64);
    });

    // ----------------------------------------------------------------
    // TEST 2: FOR EACH TOURNAMENT ITERATOR
    // ----------------------------------------------------------------
    console.log(`\n2️⃣ TESTING FOR EACH TOURNAMENT ITERATOR`);

    const loopExecutor = new ForEachTournamentExecutor();
    let loopContextVars = {};

    await asyncReport('Iterates single tournament object or array and exposes currentTournament', async () => {
      const mockContext = {
        setVariable: (k, v) => { loopContextVars[k] = v; },
        variables: {},
      };

      const loopRes = await loopExecutor.execute(
        {
          id: 'step_for_each_tourn',
          type: 'forEachTournament',
          config: {
            tournaments: [extractedData],
          },
        },
        mockContext
      );

      assert.strictEqual(loopRes.success, true);
      assert.strictEqual(loopRes.totalItems, 1);
      assert.strictEqual(loopRes.currentIndex, 0);
      assert.strictEqual(loopRes.currentTournament.title, 'AutomateX Test Tournament');
      assert.strictEqual(loopContextVars.currentTournament.title, 'AutomateX Test Tournament');
      assert.strictEqual(loopContextVars.currentItem.title, 'AutomateX Test Tournament');
    });

    // ----------------------------------------------------------------
    // TEST 3: WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)
    // ----------------------------------------------------------------
    console.log(`\n3️⃣ TESTING WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)`);

    const createTournExecutor = new WebsiteCreateTournamentExecutor();

    await asyncReport('Executes Dry Run Mode without HTTP network calls and returns wouldCreate: 1', async () => {
      const dryRes = await createTournExecutor.execute(
        {
          id: 'step_create_tourn_dry',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: extractedData,
            endpoint: '/api/v1/tournaments',
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
    // TEST 4: WEBSITE → CREATE TOURNAMENT (LIVE MODE WITH POST)
    // ----------------------------------------------------------------
    console.log(`\n4️⃣ TESTING WEBSITE → CREATE TOURNAMENT (LIVE POST /api/v1/tournaments)`);

    await asyncReport('Dispatches live POST /api/v1/tournaments with decrypted Bearer token and returns created: 1', async () => {
      const liveRes = await createTournExecutor.execute(
        {
          id: 'step_create_tourn_live',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: extractedData,
            endpoint: '/api/v1/tournaments',
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
      assert.strictEqual(req.body.title, 'AutomateX Test Tournament');
      assert.strictEqual(req.body.game, 'Valorant');
      assert.strictEqual(req.body.map, 'Haven');
      assert.strictEqual(req.body.slots, 64);
      assert.strictEqual(req.body.prizePool, 10000);
      assert.strictEqual(req.body.firstPrize, 5000);
    });

    // ----------------------------------------------------------------
    // TEST 5: PRE-VALIDATION HALTS WORKFLOW IF REQUIRED FIELD MISSING
    // ----------------------------------------------------------------
    console.log(`\n5️⃣ TESTING PRE-VALIDATION ENFORCEMENT`);

    await asyncReport('Stops workflow before HTTP POST if required field (e.g. map) is missing', async () => {
      const invalidTournament = { ...extractedData, map: null };
      let threwError = false;

      try {
        await createTournExecutor.execute(
          {
            id: 'step_invalid_tourn',
            type: 'websiteCreateTournament',
            config: {
              connectionId: connection.connectionId,
              tournament: invalidTournament,
              endpoint: '/api/v1/tournaments',
              method: 'POST',
              dryRun: false,
            },
          },
          { user: { _id: testUserId } }
        );
      } catch (err) {
        threwError = true;
        assert.ok(err.message.includes("required field 'map' is missing"));
      }

      assert.strictEqual(threwError, true, 'Executor must throw and stop when required field is missing');
    });

    // ----------------------------------------------------------------
    // TEST 6: FULL 7-NODE WORKFLOW ENGINE EXECUTION
    // ----------------------------------------------------------------
    console.log(`\n6️⃣ TESTING FULL 7-NODE END-TO-END WORKFLOW ENGINE EXECUTION`);

    await asyncReport('Executes Start -> Gemini Structure -> For Each -> Connect -> Create Tournament -> End', async () => {
      const workflow = {
        id: 'wf_tournament_publishing_pipeline',
        name: 'Apex Esports Tournament Publisher Pipeline',
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
            id: 'for_each_tournament_node',
            type: 'forEachTournament',
            config: {
              tournaments: '{{steps["gemini_tournament_node"].tournaments}}',
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
              tournament: '{{steps["for_each_tournament_node"].currentTournament}}',
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
          { source: 'gemini_tournament_node', target: 'for_each_tournament_node' },
          { source: 'for_each_tournament_node', target: 'website_connect_node' },
          { source: 'website_connect_node', target: 'create_tournament_node' },
          { source: 'create_tournament_node', target: 'end_node' },
        ],
      };

      const execResult = await WorkflowEngine.run(
        workflow,
        'exec_full_tourn_test_1',
        {
          ownerId: testUserId,
          user: { _id: testUserId },
          currentData: { content: { text: SAMPLE_DOCUMENT_TEXT } },
        }
      );

      assert.strictEqual(execResult.status.toLowerCase(), 'success');
      assert.strictEqual(execResult.nodesExecuted, 6);

      const geminiLog = execResult.logs.find((l) => l.nodeId === 'gemini_tournament_node');
      assert.ok(geminiLog && geminiLog.output.success);
      assert.strictEqual(geminiLog.output.tournament.title, 'AutomateX Test Tournament');
      assert.strictEqual(geminiLog.output.tournament.map, 'Haven');

      const createLog = execResult.logs.find((l) => l.nodeId === 'create_tournament_node');
      assert.ok(createLog && createLog.output.success);
      assert.strictEqual(createLog.output.wouldCreate, 1);
    });

  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`📊 TOURNAMENT WORKFLOW TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`======================================================\n`);
}

runTournamentWorkflowTests().catch((err) => {
  console.error('Tournament Workflow Test Suite Fatal Error:', err);
  process.exit(1);
});
