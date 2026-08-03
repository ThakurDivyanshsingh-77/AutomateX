import { RetryPolicy } from './RetryPolicy.js';
import { RetryEngine } from './RetryEngine.js';
import { WorkflowEngine } from '../WorkflowEngine.js';

async function runTests() {
  console.log('=== Running Error Handling & Retry Engine Test Suite ===\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(testName, actual, expected) {
    totalCount++;
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
    if (isMatch) {
      passedCount++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
    }
  }

  // 1. Retry Strategy Delays
  const dImmediate = RetryPolicy.calculateDelay('immediate', 2, 1000);
  assert('Strategy: Immediate delay is 0ms', dImmediate, 0);

  const dFixed = RetryPolicy.calculateDelay('fixed', 3, 2000);
  assert('Strategy: Fixed delay remains 2000ms', dFixed, 2000);

  const dExp1 = RetryPolicy.calculateDelay('exponential', 1, 1000);
  const dExp2 = RetryPolicy.calculateDelay('exponential', 2, 1000);
  const dExp3 = RetryPolicy.calculateDelay('exponential', 3, 1000);
  assert('Strategy: Exponential Attempt 1 delay', dExp1, 1000);
  assert('Strategy: Exponential Attempt 2 delay', dExp2, 2000);
  assert('Strategy: Exponential Attempt 3 delay', dExp3, 4000);

  const dLin1 = RetryPolicy.calculateDelay('linear', 1, 1000);
  const dLin2 = RetryPolicy.calculateDelay('linear', 2, 1000);
  const dLin3 = RetryPolicy.calculateDelay('linear', 3, 1000);
  assert('Strategy: Linear Attempt 1 delay', dLin1, 1000);
  assert('Strategy: Linear Attempt 2 delay', dLin2, 2000);
  assert('Strategy: Linear Attempt 3 delay', dLin3, 3000);

  // 2. Retry Engine Execution with Mock Flaky Executor
  let attemptCounter = 0;
  const mockFlakyExecutor = {
    execute: async () => {
      attemptCounter++;
      if (attemptCounter < 3) {
        throw new Error(`Flaky error attempt ${attemptCounter}`);
      }
      return { output: { message: 'Recovered on attempt 3' } };
    },
  };

  const mockNode = {
    id: 'flaky_node_1',
    type: 'http',
    config: { retryCount: 3, retryDelay: 10, retryStrategy: 'fixed' },
  };

  const retryRes = await RetryEngine.executeWithRetry(mockFlakyExecutor, mockNode, {});
  assert('RetryEngine: Operation succeeded after retries', retryRes.success, true);
  assert('RetryEngine: Status flagged as recovered', retryRes.recovered, true);
  assert('RetryEngine: Recorded 3 attempts', retryRes.attempts.length, 3);

  // 3. Error Branch Routing Test
  const errorBranchWorkflow = {
    nodes: [
      { id: 'n1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
      {
        id: 'n2',
        type: 'http',
        position: { x: 200, y: 0 },
        data: { label: 'Failing HTTP', config: { url: 'https://invalid-host-999.test', retryCount: 0 } },
      },
      { id: 'n_success', type: 'log', position: { x: 400, y: 0 }, data: { label: 'Normal Success Path' } },
      { id: 'n_error', type: 'log', position: { x: 400, y: 200 }, data: { label: 'Error Branch Handler' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n_success' },
      { id: 'e3', source: 'n2', target: 'n_error', sourceHandle: 'error' },
    ],
  };

  const wfResult = await WorkflowEngine.run(errorBranchWorkflow);
  assert('Error Branch: Workflow routed through Error Branch', wfResult.success, true);
  assert('Error Branch: Execution reached n_error handler', wfResult.logs.some((l) => l.nodeId === 'n_error'), true);

  console.log(`\n=== Test Results: ${passedCount}/${totalCount} Passed ===`);
  if (passedCount === totalCount) {
    console.log('🎉 ALL ERROR HANDLING & RETRY ENGINE TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
