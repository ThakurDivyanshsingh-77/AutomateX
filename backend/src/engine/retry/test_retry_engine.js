import { RetryEngine } from './RetryEngine.js';
import { RetryEvaluator } from './evaluators/RetryEvaluator.js';
import { RetryStrategyFactory } from './strategies/RetryStrategyFactory.js';
import { JitterUtility } from './strategies/JitterUtility.js';

async function runRetryTestSuite() {
  console.log('====================================================');
  console.log('🚀 AUTOMATEX RETRY POLICY ENGINE TEST SUITE');
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
  // Test 1: Exponential Backoff Calculation
  // ----------------------------------------------------
  console.log('--- Test 1: Exponential Backoff Strategy Calculation ---');
  const expStrategy = RetryStrategyFactory.getStrategy('exponential');
  const expConfig = { initialDelayMs: 1000, backoffMultiplier: 2, maxDelayMs: 30000 };

  const delay1 = expStrategy.calculateDelay(1, expConfig); // 1000 * 2^0 = 1000
  const delay2 = expStrategy.calculateDelay(2, expConfig); // 1000 * 2^1 = 2000
  const delay3 = expStrategy.calculateDelay(3, expConfig); // 1000 * 2^2 = 4000

  assert(delay1 === 1000, 'Attempt 1 delay should be 1000ms');
  assert(delay2 === 2000, 'Attempt 2 delay should be 2000ms');
  assert(delay3 === 4000, 'Attempt 3 delay should be 4000ms');

  // ----------------------------------------------------
  // Test 2: Linear Backoff Calculation
  // ----------------------------------------------------
  console.log('\n--- Test 2: Linear Backoff Strategy Calculation ---');
  const linearStrategy = RetryStrategyFactory.getStrategy('linear');
  const linearConfig = { initialDelayMs: 1000, backoffMultiplier: 1, maxDelayMs: 30000 };

  const lDelay1 = linearStrategy.calculateDelay(1, linearConfig); // 1000 * 1 * 1 = 1000
  const lDelay2 = linearStrategy.calculateDelay(2, linearConfig); // 1000 * 2 * 1 = 2000
  const lDelay3 = linearStrategy.calculateDelay(3, linearConfig); // 1000 * 3 * 1 = 3000

  assert(lDelay1 === 1000, 'Linear Attempt 1 delay should be 1000ms');
  assert(lDelay2 === 2000, 'Linear Attempt 2 delay should be 2000ms');
  assert(lDelay3 === 3000, 'Linear Attempt 3 delay should be 3000ms');

  // ----------------------------------------------------
  // Test 3: Full Jitter Bounds
  // ----------------------------------------------------
  console.log('\n--- Test 3: Full Jitter Calculation Bounds ---');
  const baseDelay = 5000;
  for (let i = 0; i < 20; i++) {
    const jittered = JitterUtility.applyJitter(baseDelay, 'full');
    assert(jittered >= 0 && jittered <= baseDelay, `Full Jitter result (${jittered}ms) must be between 0 and ${baseDelay}ms`);
  }

  // ----------------------------------------------------
  // Test 4: Retry Evaluator (Status Codes & Errors)
  // ----------------------------------------------------
  console.log('\n--- Test 4: Retry Evaluator Matcher ---');
  assert(RetryEvaluator.isRetryable({ statusCode: 500 }), 'HTTP 500 should be retryable');
  assert(RetryEvaluator.isRetryable({ statusCode: 429 }), 'HTTP 429 Rate Limit should be retryable');
  assert(RetryEvaluator.isRetryable({ message: 'ECONNRESET connection reset' }), 'ECONNRESET error should be retryable');
  assert(!RetryEvaluator.isRetryable({ statusCode: 404 }), 'HTTP 404 Not Found should NOT be retryable');
  assert(!RetryEvaluator.isRetryable({ statusCode: 401 }), 'HTTP 401 Unauthorized should NOT be retryable');

  // ----------------------------------------------------
  // Test 5: Full Retry Engine Workflow Execution (Failure -> Recovered)
  // ----------------------------------------------------
  console.log('\n--- Test 5: Full Execution (Fails 2 Times -> Succeeds on 3rd) ---');
  let mockAttemptsCount = 0;
  const mockExecutor = {
    async execute() {
      mockAttemptsCount++;
      if (mockAttemptsCount < 3) {
        const err = new Error('500 Internal Server Error');
        err.statusCode = 500;
        throw err;
      }
      return { status: 200, data: { success: true } };
    },
  };

  const nodeToExecute = {
    id: 'http_test_node',
    type: 'http',
    config: {
      enableRetry: true,
      maxAttempts: 3,
      retryStrategy: 'fixed',
      initialDelayMs: 10,
      retryJitter: 'none',
    },
  };

  const result = await RetryEngine.executeWithRetry(mockExecutor, nodeToExecute, {});
  assert(result.success === true, 'Execution result success should be true');
  assert(result.recovered === true, 'Execution should be flagged as recovered');
  assert(result.retryAttempts === 3, 'Total execution attempts should equal 3');
  assert(result.attempts.length === 3, 'Attempt history array length should equal 3');
  assert(result.attempts[0].status === 'failed', 'Attempt #1 status should be failed');
  assert(result.attempts[1].status === 'failed', 'Attempt #2 status should be failed');
  assert(result.attempts[2].status === 'recovered', 'Attempt #3 status should be recovered');

  // ----------------------------------------------------
  // Test 6: Fast-Fail Non-Retryable Error (HTTP 401)
  // ----------------------------------------------------
  console.log('\n--- Test 6: Fast-Fail Non-Retryable Error (401 Unauthorized) ---');
  const authExecutor = {
    async execute() {
      const err = new Error('Unauthorized Credentials');
      err.statusCode = 401;
      throw err;
    },
  };

  const authResult = await RetryEngine.executeWithRetry(authExecutor, nodeToExecute, {});
  assert(authResult.success === false, 'Auth result success should be false');
  assert(authResult.retryAttempts === 1, 'Should fail fast on Attempt #1 without retrying');
  assert(authResult.finalError === 'Unauthorized Credentials', 'Final error should match');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runRetryTestSuite().catch((err) => {
  console.error('❌ Retry Engine Test Suite failed with exception:', err);
  process.exit(1);
});
