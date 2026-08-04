import { VariableEngine } from './VariableEngine.js';

async function runTests() {
  console.log('=== Running Frontend VariableEngine Test Suite ===\n');
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

  // 1. Variable Discovery & Listing
  const defaultList = VariableEngine.list([]);
  assert(
    'Variable Listing returns nodes, system, and functions',
    Boolean(defaultList.nodes && defaultList.system && defaultList.functions),
    true
  );

  // 2. Custom Node Registration (Developer API)
  const registered = VariableEngine.register('customAiNode', {
    label: 'Custom AI Node',
    icon: 'Sparkles',
    outputs: {
      resultText: { type: 'String', example: 'Hello world', description: 'Generated text' },
      score: { type: 'Number', example: 0.98, description: 'Confidence score' },
    },
  });
  assert('Register Custom Node Schema', registered.label, 'Custom AI Node');

  // Verify custom node appears in listing
  const updatedList = VariableEngine.list([{ id: 'node_1', type: 'customAiNode', data: { label: 'My Custom AI' } }]);
  assert('Custom Node in List', updatedList.nodes[0].nodeName, 'My Custom AI');
  assert('Custom Node Outputs Path', updatedList.nodes[0].outputs[0].path, 'customAiNode.resultText');

  // 3. Search Variables
  const searchTemp = VariableEngine.search('temp', defaultList.nodes);
  assert('Search filter temp returns node with temp path', searchTemp.length > 0, true);

  // 4. Expression Resolution & Evaluation API
  const resolvedString = VariableEngine.resolve('Hello {{http.data.name}}!', { 'http.data.name': 'Divyansh' });
  assert('Resolve string with context', resolvedString, 'Hello Divyansh!');

  const evaluated = VariableEngine.evaluate('http.data.name', { 'http.data.name': 'Divyansh' });
  assert('Evaluate single expression', evaluated, 'Divyansh');

  // 5. executeFunction API
  const upperRes = VariableEngine.executeFunction('upper', ['divyansh']);
  assert('executeFunction upper', upperRes, 'DIVYANSH');

  const ifRes = VariableEngine.executeFunction('if', [true, 'Adult', 'Minor']);
  assert('executeFunction if conditional', ifRes, 'Adult');

  // 6. Validation API
  const validCheck = VariableEngine.validate('{{http.data.name}}', { 'http.data.name': 'Divyansh' });
  assert('Validate known variable', validCheck.isValid, true);

  const invalidCheck = VariableEngine.validate('{{http.data.unknownField}}', { 'http.data.name': 'Divyansh' });
  assert('Validate unknown variable returns false', invalidCheck.isValid, false);
  assert('Validate unknown variable captures name', invalidCheck.unknownVars[0], 'http.data.unknownField');

  // 7. Get Metadata API
  const meta = VariableEngine.getMetadata('http.data.status', defaultList.nodes);
  assert('Get Metadata path', meta.path, 'http.data.status');

  console.log(`\n=== Test Results: ${passedCount}/${totalCount} Passed ===`);
  if (passedCount === totalCount) {
    console.log('🎉 ALL FRONTEND VARIABLE ENGINE TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
