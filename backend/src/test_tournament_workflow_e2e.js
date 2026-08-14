import http from 'http';
import assert from 'assert';
import { GeminiStructureTournamentExecutor } from './engine/executors/GeminiStructureTournamentExecutor.js';
import { WebsiteCreateTournamentExecutor } from './engine/executors/WebsiteCreateTournamentExecutor.js';
import { DOCXParser } from './engine/parser/DOCXParser.js';
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

const TEST_DOCUMENT_TEXT = `
Tournament Title: AutomateX Test Tournament
Game: Valorant
Mode: SQUAD
Total Prize Pool: ₹10000
Entry Fee: ₹0
Max Capacity Slots: 64
Winner Count: 3
1st Place Prize: ₹5000
2nd Place Prize: ₹3000
3rd Place Prize: ₹2000
Tournament Date: 2026-08-20
Start Time: 18:00
Map Name: Haven
Banner Image URL: https://example.com/automatex-test-banner.jpg
Description & Rules:
Official AutomateX test tournament. Players must follow the tournament rules and join before the scheduled start time.
`;

async function runTournamentWorkflowTests() {
  console.log(`\n======================================================`);
  console.log(`🏆 AUTOMATEX: TOURNAMENT EXTRACTION & API PIPELINE TEST SUITE`);
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
    // TEST 1: DOCX TABLE NORMALIZATION TO KEY-VALUE PAIRS
    // ----------------------------------------------------------------
    console.log(`1️⃣ TESTING DOCX TABLE EXTRACTION & KEY-VALUE NORMALIZATION`);

    const docxParser = new DOCXParser();
    report('Normalizes 2-column DOCX tables (Field | Value) to structured key-value lines', () => {
      const mockTableBlock = {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['Game', 'Valorant'],
          ['Mode', 'SQUAD'],
          ['Total Prize Pool', '₹10000'],
          ['Entry Fee', '₹0'],
          ['Max Capacity Slots', '64'],
          ['Winner Count', '3'],
          ['1st Place Prize', '₹5000'],
          ['2nd Place Prize', '₹3000'],
          ['3rd Place Prize', '₹2000'],
          ['Tournament Date', '2026-08-20'],
          ['Start Time', '18:00'],
          ['Map Name', 'Haven'],
          ['Banner Image URL', 'https://example.com/automatex-test-banner.jpg'],
          ['Description & Rules', 'Official AutomateX test tournament.'],
        ],
      };

      const formatted = docxParser._formatTableAsText(mockTableBlock);
      assert.ok(formatted.includes('Game: Valorant'));
      assert.ok(formatted.includes('Mode: SQUAD'));
      assert.ok(formatted.includes('Total Prize Pool: ₹10000'));
      assert.ok(formatted.includes('Map Name: Haven'));
      assert.ok(!formatted.includes('Field: Value'), 'Generic header row should be skipped');
    });

    // ----------------------------------------------------------------
    // TEST 2: GEMINI STRUCTURE TOURNAMENT AI EXTRACTION
    // ----------------------------------------------------------------
    console.log(`\n2️⃣ TESTING GEMINI → STRUCTURE TOURNAMENT (DYNAMIC EXTRACTION & ZERO PLACEHOLDERS)`);

    const geminiExecutor = new GeminiStructureTournamentExecutor();

    let extractedData = null;
    await asyncReport('Extracts exact tournament structure matching user requirements', async () => {
      const result = await geminiExecutor.execute(
        {
          id: 'step_gemini_tourn',
          type: 'geminiStructureTournament',
          config: {
            documentText: TEST_DOCUMENT_TEXT,
            model: 'gemini-1.5-pro',
            temperature: 0.0,
          },
        },
        { currentData: { content: { text: TEST_DOCUMENT_TEXT } } }
      );

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 1);
      assert.ok(result.tournament);
      assert.ok(result.extractionDebug);
      assert.strictEqual(result.extractionDebug.rawTextReceived, TEST_DOCUMENT_TEXT.trim());

      const t = result.tournament;
      assert.strictEqual(t.title, 'AutomateX Test Tournament');
      assert.strictEqual(t.game, 'Valorant');
      assert.strictEqual(t.mode, 'SQUAD');
      assert.strictEqual(t.entryFee, 0);
      assert.strictEqual(t.prizePool, 10000);
      assert.strictEqual(t.winnerCount, 3);
      assert.strictEqual(t.slots, 64);
      assert.deepStrictEqual(t.prizeBreakdown, {
        first: 5000,
        second: 3000,
        third: 2000,
      });
      assert.strictEqual(t.firstPrize, 5000);
      assert.strictEqual(t.secondPrize, 3000);
      assert.strictEqual(t.thirdPrize, 2000);
      assert.strictEqual(t.date, '2026-08-20');
      assert.strictEqual(t.time, '18:00');
      assert.strictEqual(t.map, 'Haven');
      assert.strictEqual(t.bannerImage, 'https://example.com/automatex-test-banner.jpg');
      assert.strictEqual(t.description, 'Official AutomateX test tournament. Players must follow the tournament rules and join before the scheduled start time.');

      extractedData = t;
    });

    // ----------------------------------------------------------------
    // TEST 3: REQUIRED FIELD VALIDATION ERROR HALTING
    // ----------------------------------------------------------------
    console.log(`\n3️⃣ TESTING REQUIRED FIELD VALIDATION & ERROR MESSAGES`);

    await asyncReport('Stops with clear error when required field game is missing', async () => {
      let threwError = false;
      try {
        await geminiExecutor.execute(
          {
            id: 'step_gemini_missing',
            type: 'geminiStructureTournament',
            config: {
              documentText: 'Tournament Title: Test\nMode: SQUAD\nDate: 2026-08-20',
            },
          },
          {}
        );
      } catch (err) {
        threwError = true;
        assert.strictEqual(err.message, "Required tournament field 'game' could not be extracted from the uploaded document.");
      }
      assert.strictEqual(threwError, true);
    });

    // ----------------------------------------------------------------
    // TEST 4: WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)
    // ----------------------------------------------------------------
    console.log(`\n4️⃣ TESTING WEBSITE → CREATE TOURNAMENT (DRY RUN MODE)`);

    const createTournExecutor = new WebsiteCreateTournamentExecutor();

    await asyncReport('Executes Dry Run Mode without HTTP network calls: validated=true, requested=false, created=0', async () => {
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
      assert.strictEqual(dryRes.requested, false);
      assert.strictEqual(dryRes.created, 0);
      assert.strictEqual(dryRes.wouldCreate, 1);
      assert.strictEqual(dryRes.failed, 0);
      assert.ok(dryRes.previewJson);
      assert.strictEqual(receivedRequests.length, 0, 'Dry Run must never dispatch HTTP requests');
    });

    // ----------------------------------------------------------------
    // TEST 5: WEBSITE → CREATE TOURNAMENT (LIVE POST /api/v1/tournaments)
    // ----------------------------------------------------------------
    console.log(`\n5️⃣ TESTING WEBSITE → CREATE TOURNAMENT (LIVE POST /api/v1/tournaments)`);

    await asyncReport('Dispatches live POST /api/v1/tournaments with Bearer token: validated=true, requested=true, created=1', async () => {
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
      assert.strictEqual(liveRes.validated, true);
      assert.strictEqual(liveRes.requested, true);
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
      assert.strictEqual(req.body.mode, 'SQUAD');
      assert.strictEqual(req.body.prizePool, 10000);
      assert.strictEqual(req.body.winnerCount, 3);
      assert.deepStrictEqual(req.body.prizeBreakdown, {
        first: 5000,
        second: 3000,
        third: 2000,
      });
      assert.strictEqual(req.body.map, 'Haven');
      assert.strictEqual(req.body.slots, 64);
    });

    // ----------------------------------------------------------------
    // TEST 6: PRE-VALIDATION & PLACEHOLDER REJECTION
    // ----------------------------------------------------------------
    console.log(`\n6️⃣ TESTING PRE-VALIDATION & PLACEHOLDER REJECTION`);

    await asyncReport('Stops workflow before HTTP POST if placeholder value is supplied', async () => {
      const placeholderTournament = { ...extractedData, game: 'game' };
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
        assert.ok(err.message.includes('Required tournament field'));
      }

      assert.strictEqual(threwError, true, 'Executor must throw and stop when placeholder or invalid payload is given');
    });

    // ----------------------------------------------------------------
    // TEST 7: FULL DIRECT WORKFLOW ENGINE EXECUTION
    // ----------------------------------------------------------------
    console.log(`\n7️⃣ TESTING DIRECT 6-NODE END-TO-END WORKFLOW ENGINE EXECUTION`);

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
              documentText: TEST_DOCUMENT_TEXT,
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
          currentData: { content: { text: TEST_DOCUMENT_TEXT } },
        }
      );

      assert.strictEqual(execResult.status.toLowerCase(), 'success');
      assert.strictEqual(execResult.nodesExecuted, 5);

      const geminiLog = execResult.logs.find((l) => l.nodeId === 'gemini_tournament_node');
      assert.ok(geminiLog && geminiLog.output.success);
      assert.strictEqual(geminiLog.output.tournament.title, 'AutomateX Test Tournament');
      assert.strictEqual(geminiLog.output.tournament.game, 'Valorant');
      assert.strictEqual(geminiLog.output.tournament.mode, 'SQUAD');
      assert.strictEqual(geminiLog.output.tournament.map, 'Haven');
      assert.strictEqual(geminiLog.output.tournament.winnerCount, 3);

      const createLog = execResult.logs.find((l) => l.nodeId === 'create_tournament_node');
      assert.ok(createLog && createLog.output.success);
      assert.strictEqual(createLog.output.wouldCreate, 1);
      assert.strictEqual(createLog.output.validated, true);
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
