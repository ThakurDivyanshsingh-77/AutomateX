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
        email: 'divyansh@example.com',
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

  assert(
    'Simple Variable (Gmail MessageId)',
    ExpressionEngine.resolve('{{gmail.messageId}}', context),
    '18ab4d8d90ef'
  );

  // 2. Nested Object Resolution
  assert(
    'Nested Path (user.address.city)',
    ExpressionEngine.resolve('{{http.data.user.address.city}}', context),
    'Jaipur'
  );

  // 3. Array Index Resolution
  assert(
    'Array Index (items[0].name)',
    ExpressionEngine.resolve('{{http.data.items[0].name}}', context),
    'Laptop'
  );

  assert(
    'Array Index (items[1].price)',
    ExpressionEngine.resolve('{{http.data.items[1].price}}', context),
    40
  );

  // 4. Missing Property Handling (Returns empty string, NEVER throws)
  assert(
    'Missing Property (Non-existent path)',
    ExpressionEngine.resolve('{{http.data.nonExistentField}}', context),
    ''
  );

  assert(
    'Missing Property in Template String',
    ExpressionEngine.resolve('Hello {{http.data.missingName}}!', context),
    'Hello !'
  );

  // 5. Multiple Expressions in Single String
  assert(
    'Multiple Expressions in Single Template',
    ExpressionEngine.resolve(
      'Order #{{http.data.id}} for {{http.data.name}} - Status: {{http.statusCode}}',
      context
    ),
    'Order #101 for Divyansh - Status: 200'
  );

  // 6. Standalone Type Preservation vs Embedded Stringification
  assert(
    'Standalone Expression Type Preservation (Object)',
    ExpressionEngine.resolve('{{http.data.user.address}}', context),
    { city: 'Jaipur', country: 'India' }
  );

  assert(
    'Embedded Object Stringification',
    ExpressionEngine.resolve('Address: {{http.data.user.address}}', context),
    'Address: {"city":"Jaipur","country":"India"}'
  );

  // 7. Recursive Object Resolution
  const inputObject = {
    url: 'https://api.example.com/orders/{{http.data.id}}',
    headers: {
      Authorization: 'Bearer token_{{http.data.name}}',
    },
    payload: {
      userId: '{{http.data.id}}',
      city: '{{http.data.user.address.city}}',
      firstItem: '{{http.data.items[0].name}}',
    },
  };

  const expectedResolvedObject = {
    url: 'https://api.example.com/orders/101',
    headers: {
      Authorization: 'Bearer token_Divyansh',
    },
    payload: {
      userId: 101,
      city: 'Jaipur',
      firstItem: 'Laptop',
    },
  };

  assert(
    'Recursive Object Resolution (resolveObject)',
    ExpressionEngine.resolve(inputObject, context),
    expectedResolvedObject
  );

  // 8. Recursive Array Resolution
  const inputArray = [
    'Welcome {{http.data.name}}',
    'Item: {{http.data.items[0].name}}',
    '{{http.statusCode}}',
  ];

  const expectedResolvedArray = ['Welcome Divyansh', 'Item: Laptop', 200];

  assert(
    'Recursive Array Resolution (resolveArray)',
    ExpressionEngine.resolve(inputArray, context),
    expectedResolvedArray
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
