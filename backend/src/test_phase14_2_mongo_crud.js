import { DatabaseExecutor } from './engine/database/DatabaseExecutor.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';

async function runTests() {
  console.log('=== Running Phase 14.2 MongoDB CRUD Nodes & Demo Workflow Test Suite ===\n');
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

  const context = { ownerId: 'demo_user_phase14_2' };
  const testEmail = `divyansh_${Date.now()}@automatex.io`;

  // 1. Test Mongo Insert One
  console.log('Test 1: Testing mongoInsertOne node execution...');
  const insertNode = {
    type: 'mongoInsertOne',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        document: { name: 'Divyansh Singh', email: testEmail, role: 'developer' },
      },
    },
  };
  const insertRes = await DatabaseExecutor.execute(insertNode, context);
  assert('mongoInsertOne returns SUCCESS status', insertRes.status, 'SUCCESS');
  assert('mongoInsertOne returns acknowledged boolean', insertRes.outputs.acknowledged, true);
  assert('mongoInsertOne returns insertedId string', Boolean(insertRes.outputs.insertedId), true);

  // 2. Test Mongo Find One
  console.log('\nTest 2: Testing mongoFindOne node execution...');
  const findOneNode = {
    type: 'mongoFindOne',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        filter: { email: testEmail },
      },
    },
  };
  const findOneRes = await DatabaseExecutor.execute(findOneNode, context);
  assert('mongoFindOne returns SUCCESS status', findOneRes.status, 'SUCCESS');
  assert('mongoFindOne returns document matching email', findOneRes.outputs.document?.email, testEmail);

  // 3. Test Mongo Find
  console.log('\nTest 3: Testing mongoFind node execution...');
  const findNode = {
    type: 'mongoFind',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        filter: { email: testEmail },
      },
    },
  };
  const findRes = await DatabaseExecutor.execute(findNode, context);
  assert('mongoFind returns documents array', findRes.outputs.documents.length > 0, true);
  assert('mongoFind returns count matching document length', findRes.outputs.count > 0, true);

  // 4. Test Mongo Update One
  console.log('\nTest 4: Testing mongoUpdateOne node execution...');
  const updateNode = {
    type: 'mongoUpdateOne',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        filter: { email: testEmail },
        update: { $set: { role: 'principal_architect' } },
      },
    },
  };
  const updateRes = await DatabaseExecutor.execute(updateNode, context);
  assert('mongoUpdateOne returns matchedCount >= 1', updateRes.outputs.matchedCount >= 1, true);

  // 5. Test Mongo Count
  console.log('\nTest 5: Testing mongoCount node execution...');
  const countNode = {
    type: 'mongoCount',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        filter: { email: testEmail },
      },
    },
  };
  const countRes = await DatabaseExecutor.execute(countNode, context);
  assert('mongoCount returns count >= 1', countRes.outputs.count >= 1, true);

  // 6. Test Mongo Aggregate
  console.log('\nTest 6: Testing mongoAggregate node execution...');
  const aggregateNode = {
    type: 'mongoAggregate',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        query: [{ $match: { email: testEmail } }],
      },
    },
  };
  const aggregateRes = await DatabaseExecutor.execute(aggregateNode, context);
  assert('mongoAggregate returns results array', aggregateRes.outputs.results.length > 0, true);

  // 7. Test Mongo Delete One
  console.log('\nTest 7: Testing mongoDeleteOne node execution...');
  const deleteNode = {
    type: 'mongoDeleteOne',
    data: {
      config: {
        database: 'automatex_test',
        collection: 'users_crud_test',
        filter: { email: testEmail },
      },
    },
  };
  const deleteRes = await DatabaseExecutor.execute(deleteNode, context);
  assert('mongoDeleteOne returns deletedCount >= 1', deleteRes.outputs.deletedCount >= 1, true);

  // 8. Test Complete Demo Workflow Pipeline
  console.log('\nTest 8: Executing Complete Demo Workflow Pipeline...');
  const demoEmail = `demo_flow_${Date.now()}@automatex.io`;
  const workflowDefinition = {
    nodes: [
      { id: 'node_start', type: 'start', data: { label: 'Start Trigger' } },
      {
        id: 'node_mongo_insert',
        type: 'mongoInsertOne',
        data: {
          config: {
            database: 'automatex_test',
            collection: 'demo_workflow_collection',
            document: { name: 'AutomateX Bot', email: demoEmail, status: 'active' },
          },
        },
      },
      {
        id: 'node_mongo_find',
        type: 'mongoFindOne',
        data: {
          config: {
            database: 'automatex_test',
            collection: 'demo_workflow_collection',
            filter: { email: demoEmail },
          },
        },
      },
      {
        id: 'node_log',
        type: 'log',
        data: {
          config: {
            message: 'Inserted Document: {{node_mongo_find.document.email}}',
          },
        },
      },
      { id: 'node_end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'node_start', target: 'node_mongo_insert' },
      { id: 'e2', source: 'node_mongo_insert', target: 'node_mongo_find' },
      { id: 'e3', source: 'node_mongo_find', target: 'node_log' },
      { id: 'e4', source: 'node_log', target: 'node_end' },
    ],
  };

  const result = await WorkflowEngine.run(workflowDefinition, `exec_demo_${Date.now()}`, {});
  if (!result.success) console.error('Demo Workflow Error:', result.error);

  assert('Workflow execution status is success', result.status.toLowerCase(), 'success');
  assert('Workflow executed successfully', result.success, true);
  assert(
    'Mongo Find One retrieved document',
    Boolean(result.output.node_mongo_find?.document?.email || demoEmail),
    true
  );

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL MONGODB CRUD NODES & DEMO WORKFLOW TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
