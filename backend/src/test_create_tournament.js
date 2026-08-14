import http from 'http';
import assert from 'assert';
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

const SAMPLE_TOURNAMENT_INPUT = {
  title: 'Apex Legends Global Series Season 5 Qualifier',
  game: 'Apex Legends',
  mode: 'Battle Royale Trios',
  entryFee: 50,
  prizePool: 25000,
  winnerCount: 3,
  prizeBreakdown: {
    first: 15000,
    second: 7000,
    third: 3000,
  },
  slots: 60,
  date: '2026-08-20',
  time: '18:00',
  map: "World's Edge",
  bannerImage: 'https://apex-esports.onrender.com/assets/algs_banner.png',
  description: 'Official online qualifier for the seasonal apex esports championship.',
};

async function runTournamentTests() {
  console.log(`\n======================================================`);
  console.log(`🏆 AUTOMATEX: WEBSITE → CREATE TOURNAMENT TEST SUITE`);
  console.log(`======================================================\n`);

  const receivedRequests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const authHeader = req.headers['authorization'] || '';
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (e) {}

      // Auth validation
      if (!authHeader.includes('Bearer apex_secret_jwt_token_999')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized: Invalid Apex JWT token.' }));
      }

      // Role check simulation
      if (req.headers['x-role-fail'] === 'true') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Forbidden: Admin role required to create tournaments.' }));
      }

      // Conflict simulation
      if (parsed.title === 'Conflict Tournament') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Conflict: Tournament with this name already scheduled.' }));
      }

      receivedRequests.push({ url: req.url, method: req.method, headers: req.headers, body: parsed });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tournamentId: `tourn_apex_${Date.now()}`,
        tournament: parsed,
        message: 'Tournament successfully created on Apex Esports.',
      }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  const targetApiUrl = `http://127.0.0.1:${serverPort}`;

  try {
    const testUserId = 'user_apex_organizer_1';
    const connection = await websiteConnectionService.createConnection({
      ownerId: testUserId,
      name: 'Apex Esports Production Site',
      websiteUrl: targetApiUrl,
      apiBaseUrl: targetApiUrl,
      connectionMethod: 'restApi',
      authType: 'bearerToken',
      credentials: {
        token: 'apex_secret_jwt_token_999',
      },
    });

    // ----------------------------------------------------------------
    // TEST SECTION 1: PAYLOAD CONSTRUCTION WITH NESTED DOT KEYS
    // ----------------------------------------------------------------
    console.log(`1️⃣ TESTING DYNAMIC PAYLOAD CONSTRUCTION & NESTED KEYS`);

    const executor = new WebsiteCreateTournamentExecutor();

    report('Builds deep nested object keys (prizeBreakdown.first, etc.) dynamically', () => {
      const fieldMapping = [
        { sourceKey: 'title', targetKey: 'title' },
        { sourceKey: 'game', targetKey: 'game' },
        { sourceKey: 'mode', targetKey: 'mode' },
        { sourceKey: 'entryFee', targetKey: 'entryFee' },
        { sourceKey: 'prizePool', targetKey: 'prizePool' },
        { sourceKey: 'winnerCount', targetKey: 'winnerCount' },
        { sourceKey: 'prizeBreakdown.first', targetKey: 'prizeBreakdown.first' },
        { sourceKey: 'prizeBreakdown.second', targetKey: 'prizeBreakdown.second' },
        { sourceKey: 'prizeBreakdown.third', targetKey: 'prizeBreakdown.third' },
        { sourceKey: 'slots', targetKey: 'slots' },
        { sourceKey: 'date', targetKey: 'date' },
        { sourceKey: 'time', targetKey: 'time' },
        { sourceKey: 'map', targetKey: 'map' },
        { sourceKey: 'bannerImage', targetKey: 'bannerImage' },
        { sourceKey: 'description', targetKey: 'description' },
      ];

      const payload = executor.buildTournamentPayload(SAMPLE_TOURNAMENT_INPUT, fieldMapping, {}, 0);

      assert.strictEqual(payload.title, 'Apex Legends Global Series Season 5 Qualifier');
      assert.strictEqual(payload.game, 'Apex Legends');
      assert.strictEqual(payload.mode, 'Battle Royale Trios');
      assert.strictEqual(payload.entryFee, 50);
      assert.strictEqual(payload.prizePool, 25000);
      assert.strictEqual(payload.winnerCount, 3);
      assert.strictEqual(payload.slots, 60);
      assert.strictEqual(payload.date, '2026-08-20');
      assert.strictEqual(payload.time, '18:00');
      assert.strictEqual(payload.map, "World's Edge");
      assert.ok(payload.prizeBreakdown, 'prizeBreakdown object must exist');
      assert.strictEqual(payload.prizeBreakdown.first, 15000);
      assert.strictEqual(payload.prizeBreakdown.second, 7000);
      assert.strictEqual(payload.prizeBreakdown.third, 3000);
    });

    // ----------------------------------------------------------------
    // TEST SECTION 2: DRY RUN EXECUTION
    // ----------------------------------------------------------------
    console.log(`\n2️⃣ TESTING DRY RUN EXECUTION (NO NETWORK DISPATCH)`);

    await asyncReport('Executes Dry Run and validates payload without sending HTTP requests', async () => {
      const dryRes = await executor.execute(
        {
          id: 'step_create_tourn_dry',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: SAMPLE_TOURNAMENT_INPUT,
            endpoint: '/api/v1/tournaments',
            method: 'POST',
            dryRun: true,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(dryRes.success, true);
      assert.strictEqual(dryRes.dryRun, true);
      assert.strictEqual(dryRes.summary.wouldCreate, 1);
      assert.strictEqual(dryRes.summary.created, 0);
      assert.strictEqual(dryRes.summary.failed, 0);
      assert.strictEqual(receivedRequests.length, 0, 'Dry Run must never dispatch HTTP calls');
    });

    // ----------------------------------------------------------------
    // TEST SECTION 3: LIVE REST API DISPATCH & AUTHENTICATION
    // ----------------------------------------------------------------
    console.log(`\n3️⃣ TESTING LIVE REST API DISPATCH (POST /api/v1/tournaments)`);

    await asyncReport('Dispatches real HTTP POST request with decrypted Bearer token', async () => {
      const liveRes = await executor.execute(
        {
          id: 'step_create_tourn_live',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournament: SAMPLE_TOURNAMENT_INPUT,
            endpoint: '/api/v1/tournaments',
            method: 'POST',
            dryRun: false,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(liveRes.success, true);
      assert.strictEqual(liveRes.summary.created, 1);
      assert.strictEqual(receivedRequests.length, 1);
      
      const req = receivedRequests[0];
      assert.strictEqual(req.url, '/api/v1/tournaments');
      assert.strictEqual(req.method, 'POST');
      assert.strictEqual(req.headers['authorization'], 'Bearer apex_secret_jwt_token_999');
      assert.strictEqual(req.body.title, 'Apex Legends Global Series Season 5 Qualifier');
      assert.strictEqual(req.body.prizeBreakdown.first, 15000);
      assert.ok(liveRes.tournamentId.startsWith('tourn_apex_'));
    });

    // ----------------------------------------------------------------
    // TEST SECTION 4: DUPLICATE PROTECTION STRATEGY
    // ----------------------------------------------------------------
    console.log(`\n4️⃣ TESTING DUPLICATE TOURNAMENT STRATEGY`);

    await asyncReport('Skips duplicate tournament when duplicateStrategy is "skip"', async () => {
      const dupeExecutor = new WebsiteCreateTournamentExecutor();
      const duplicateList = [
        SAMPLE_TOURNAMENT_INPUT,
        SAMPLE_TOURNAMENT_INPUT, // duplicate
      ];

      const dupeRes = await dupeExecutor.execute(
        {
          id: 'step_dupe',
          type: 'websiteCreateTournament',
          config: {
            connectionId: connection.connectionId,
            tournaments: duplicateList,
            dryRun: true,
            duplicateStrategy: 'skip',
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(dupeRes.summary.total, 2);
      assert.strictEqual(dupeRes.summary.wouldCreate, 1);
      assert.strictEqual(dupeRes.summary.skipped, 1);
      assert.strictEqual(dupeRes.results[1].status, 'skipped');
    });

    // ----------------------------------------------------------------
    // TEST SECTION 5: ERROR HANDLING & STATUS CODES
    // ----------------------------------------------------------------
    console.log(`\n5️⃣ TESTING ERROR STATUS CODE HANDLING`);

    await asyncReport('Handles HTTP 403 Forbidden with human-readable error', async () => {
      const forbiddenConn = await websiteConnectionService.createConnection({
        ownerId: testUserId,
        name: 'Forbidden Site',
        websiteUrl: targetApiUrl,
        apiBaseUrl: targetApiUrl,
        connectionMethod: 'restApi',
        authType: 'bearerToken',
        credentials: { token: 'apex_secret_jwt_token_999' },
        customHeaders: [{ key: 'x-role-fail', value: 'true' }],
      });

      const errExecutor = new WebsiteCreateTournamentExecutor();
      const failRes = await errExecutor.execute(
        {
          id: 'step_err',
          type: 'websiteCreateTournament',
          config: {
            connectionId: forbiddenConn.connectionId,
            tournament: {
              ...SAMPLE_TOURNAMENT_INPUT,
              title: 'Permission Denied Tourney',
            },
            dryRun: false,
          },
        },
        { user: { _id: testUserId } }
      );

      assert.strictEqual(failRes.summary.failed, 1);
      assert.strictEqual(failRes.results[0].status, 'failed');
      const errStr = typeof failRes.results[0].error === 'string' ? failRes.results[0].error : JSON.stringify(failRes.results[0].error);
      assert.ok(errStr.includes('403'));
    });

    // ----------------------------------------------------------------
    // TEST SECTION 6: FULL WORKFLOW ENGINE GRAPH EXECUTION
    // ----------------------------------------------------------------
    console.log(`\n6️⃣ TESTING FULL WORKFLOW ENGINE GRAPH EXECUTION`);

    await asyncReport('Runs full graph: Start -> Website Connect -> Create Tournament -> End', async () => {
      const workflow = {
        id: 'wf_apex_esports_publishing',
        name: 'Apex Esports Tournament Publisher',
        nodes: [
          { id: 'start_node', type: 'start', config: {} },
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
              tournament: SAMPLE_TOURNAMENT_INPUT,
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
          { source: 'start_node', target: 'website_connect_node' },
          { source: 'website_connect_node', target: 'create_tournament_node' },
          { source: 'create_tournament_node', target: 'end_node' },
        ],
      };

      const execResult = await WorkflowEngine.run(
        workflow,
        'exec_apex_test_1',
        {
          ownerId: testUserId,
          user: { _id: testUserId },
        }
      );

      assert.strictEqual(execResult.status.toLowerCase(), 'success');
      assert.strictEqual(execResult.nodesExecuted, 4);

      const tournLog = execResult.logs.find((l) => l.nodeId === 'create_tournament_node');
      assert.ok(tournLog && tournLog.output.success);
      assert.strictEqual(tournLog.output.summary.wouldCreate, 1);
    });

  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`📊 TOURNAMENT TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`======================================================\n`);
}

runTournamentTests().catch((err) => {
  console.error('Tournament Test Suite Fatal Error:', err);
  process.exit(1);
});
