import { LoopExecutionEngine } from './LoopExecutionEngine.js';
import { LoopScopeStack } from './LoopScopeStack.js';
import { LoopStreamManager } from './LoopStreamManager.js';

async function runLoopTestSuite() {
  console.log('====================================================');
  console.log('🚀 AUTOMATEX LOOP (FOR EACH) NODE TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // ----------------------------------------------------
  // Test 1: Collection Stream Normalization
  // ----------------------------------------------------
  console.log('--- Test 1: Collection Stream Normalization ---');
  const mongoInput = { documents: [{ id: 1 }, { id: 2 }] };
  const sqlInput = { rows: [{ name: 'John' }, { name: 'Alice' }] };
  const jsonStringInput = '[{"a": 10}, {"a": 20}]';

  assert(LoopStreamManager.normalizeCollection(mongoInput).length === 2, 'MongoDB documents array normalized');
  assert(LoopStreamManager.normalizeCollection(sqlInput).length === 2, 'SQL rows array normalized');
  assert(LoopStreamManager.normalizeCollection(jsonStringInput).length === 2, 'JSON string array normalized');

  // ----------------------------------------------------
  // Test 2: Scoped Variable Stack & Nested Loops
  // ----------------------------------------------------
  console.log('\n--- Test 2: Scoped Variable Stack & Nested Loops ---');
  const parentStack = new LoopScopeStack();
  parentStack.pushScope({ item: { name: 'Outer User', id: 100 }, index: 0, total: 2, itemVar: 'item' });

  const childStack = new LoopScopeStack(parentStack);
  childStack.pushScope({ item: { role: 'Admin', permission: 'read' }, index: 1, total: 5, itemVar: 'item' });

  assert(childStack.resolveVariable('item.role') === 'Admin', 'Innermost item.role resolves to Admin');
  assert(childStack.resolveVariable('parent.item.name') === 'Outer User', 'Parent loop item.name resolves to Outer User');
  assert(childStack.resolveVariable('root.item.id') === 100, 'Root loop item.id resolves to 100');
  assert(childStack.resolveVariable('index') === 1, 'Child index resolves to 1');
  assert(childStack.resolveVariable('parent.index') === 0, 'Parent index resolves to 0');

  // ----------------------------------------------------
  // Test 3: Sequential Loop Execution
  // ----------------------------------------------------
  console.log('\n--- Test 3: Sequential Loop Execution ---');
  const sampleUsers = [
    { name: 'John', email: 'john@gmail.com' },
    { name: 'Alice', email: 'alice@gmail.com' },
    { name: 'Bob', email: 'bob@gmail.com' },
  ];

  const processedItems = [];
  const seqNode = {
    id: 'loop_1',
    type: 'loop',
    config: {
      collection: sampleUsers,
      mode: 'sequential',
    },
  };

  const seqResult = await LoopExecutionEngine.executeLoop(seqNode, {}, async (item, scopeStack, index) => {
    processedItems.push({ email: item.email, index });
    return { status: 'sent', email: item.email };
  });

  assert(seqResult.success === true, 'Sequential loop execution success should be true');
  assert(seqResult.completed === 3, 'All 3 items processed');
  assert(processedItems.length === 3, 'Processed items length should equal 3');
  assert(processedItems[0].email === 'john@gmail.com', 'Iteration 0 email matches John');
  assert(processedItems[2].email === 'bob@gmail.com', 'Iteration 2 email matches Bob');

  // ----------------------------------------------------
  // Test 4: Parallel Loop Execution (Concurrency = 5)
  // ----------------------------------------------------
  console.log('\n--- Test 4: Parallel Loop Execution (Concurrency = 5) ---');
  const items20 = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
  const parallelNode = {
    id: 'loop_parallel',
    type: 'loop',
    config: {
      collection: items20,
      mode: 'parallel',
      concurrency: 5,
    },
  };

  const parResult = await LoopExecutionEngine.executeLoop(parallelNode, {}, async (item) => {
    await new Promise((r) => setTimeout(r, 5)); // Simulate async work
    return { status: 'done', id: item.id };
  });

  assert(parResult.success === true, 'Parallel loop execution success');
  assert(parResult.completed === 20, 'All 20 items completed in parallel');
  assert(parResult.iterations.length === 20, 'All 20 iteration records stored');

  // ----------------------------------------------------
  // Test 5: Error Handling Policy (Skip vs Stop)
  // ----------------------------------------------------
  console.log('\n--- Test 5: Error Handling Policies (Skip on Error) ---');
  const errNode = {
    id: 'loop_err',
    type: 'loop',
    config: {
      collection: [{ id: 1 }, { id: 2, fail: true }, { id: 3 }],
      mode: 'sequential',
      errorPolicy: 'skip',
    },
  };

  const errResult = await LoopExecutionEngine.executeLoop(errNode, {}, async (item) => {
    if (item.fail) throw new Error('Simulated Item Failure');
    return { status: 'ok' };
  });

  assert(errResult.completed === 2, '2 items succeeded');
  assert(errResult.failed === 1, '1 item failed');
  assert(errResult.iterations[1].status === 'failed', 'Item 2 status is failed');

  // ----------------------------------------------------
  // Test 6: 10,000 Item Memory Optimization Benchmark
  // ----------------------------------------------------
  console.log('\n--- Test 6: 10,000 Item Memory & Batch Processing Benchmark ---');
  const largeCollection = Array.from({ length: 10000 }, (_, i) => ({ recordId: i }));
  const largeNode = {
    id: 'loop_large',
    type: 'loop',
    config: {
      collection: largeCollection,
      mode: 'parallel',
      batchSize: 100,
      concurrency: 10,
    },
  };

  const startRam = process.memoryUsage().heapUsed;
  const largeResult = await LoopExecutionEngine.executeLoop(largeNode, {}, async (item) => {
    return item.recordId;
  });
  const endRam = process.memoryUsage().heapUsed;

  assert(largeResult.completed === 10000, 'Successfully processed 10,000 items');
  console.log(` ℹ️ Processed 10,000 items in ${largeResult.executionTime}ms. Heap Delta: ${((endRam - startRam) / 1024 / 1024).toFixed(2)} MB`);

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runLoopTestSuite().catch((err) => {
  console.error('❌ Loop Engine Test Suite failed with exception:', err);
  process.exit(1);
});
