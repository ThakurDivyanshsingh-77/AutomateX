import { ExpressionEngine } from './ExpressionEngine.js';
import { ExecutionContext } from '../runtime/ExecutionContext.js';

async function runTests() {
  console.log('=== Running ExpressionEngine Test Suite ===\n');
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

  // Set up mock ExecutionContext with realistic node outputs
  const context = new ExecutionContext('test_exec_101');
  context.setNodeOutput('http', {
    statusCode: 200,
    statusText: 'OK',
    data: {
      id: 101,
      name: 'Divyansh',
      user: {
        email: 'DIVYANSH@EXAMPLE.COM',
        address: {
          city: 'Jaipur',
          country: 'India',
        },
      },
      items: [
        { id: 1, name: 'Laptop', price: 1200 },
        { id: 2, name: 'Wireless Mouse', price: 40 },
      ],
    },
  });

  context.setNodeOutput('gmail', {
    provider: 'gmail',
    messageId: '18ab4d8d90ef',
    threadId: '18ab4d8d90ef',
    status: 'SENT',
  });

  context.setNodeOutput('logger', {
    message: 'Workflow execution complete',
  });

  // 1. Simple Variable Resolution
  assert(
    'Simple Variable (HTTP Status Code)',
    ExpressionEngine.resolve('{{http.statusCode}}', context),
    200
  );

  assert(
    'Simple Variable (HTTP Data Name)',
    ExpressionEngine.resolve('{{http.data.name}}', context),
    'Divyansh'
  );

  // 2. Transformation Functions
  assert(
    'Function upper()',
    ExpressionEngine.resolve('{{upper(http.data.name)}}', context),
    'DIVYANSH'
  );

  assert(
    'Function lower()',
    ExpressionEngine.resolve('{{lower(http.data.user.email)}}', context),
    'divyansh@example.com'
  );

  assert(
    'Function length()',
    ExpressionEngine.resolve('{{length(http.data.items)}}', context),
    2
  );

  assert(
    'Function if() conditional true',
    ExpressionEngine.resolve('{{if(http.statusCode == 200, "Success", "Failure")}}', context),
    'Success'
  );

  assert(
    'Fallback operator (missing path | default)',
    ExpressionEngine.resolve('{{http.missing | "Default Fallback"}}', context),
    'Default Fallback'
  );

  // 3. Nested Object & Array Index Resolution
  assert(
    'Nested Path (user.address.city)',
    ExpressionEngine.resolve('{{http.data.user.address.city}}', context),
    'Jaipur'
  );

  assert(
    'Array Index (items[0].name)',
    ExpressionEngine.resolve('{{http.data.items[0].name}}', context),
    'Laptop'
  );

  // 4. Missing Property Handling
  assert(
    'Missing Property (Non-existent path)',
    ExpressionEngine.resolve('{{http.data.nonExistentField}}', context),
    ''
  );

  console.log(`\n=== Test Results: ${passedCount}/${totalCount} Passed ===`);
  if (passedCount === totalCount) {
    console.log('🎉 ALL EXPRESSION ENGINE TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
