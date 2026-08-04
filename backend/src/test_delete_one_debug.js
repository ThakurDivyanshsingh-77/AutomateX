import { MongoProvider } from './engine/database/MongoProvider.js';
import mongoose from 'mongoose';

async function testDeleteOne() {
  console.log('=== Running MongoDB Delete One Debug & Verification Suite ===\n');
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

  const mongo = new MongoProvider({ database: 'automatex_delete_test' });
  await mongo.connect();

  // Test 1: Insert document first
  const testId = new mongoose.Types.ObjectId().toString();
  console.log(`Test 1: Inserting document with _id: "${testId}"...`);
  const insertRes = await mongo.insert('test_delete_col', {
    _id: new mongoose.Types.ObjectId(testId),
    name: 'Delete Target Item',
    email: 'delete_test@automatex.io',
  });
  assert('Insert succeeded', Boolean(insertRes.insertedId), true);

  // Test 2: Execute Delete One with String _id
  console.log(`\nTest 2: Executing deleteOne with String _id filter: { _id: "${testId}" }...`);
  const deleteRes = await mongo.deleteOne('test_delete_col', { _id: testId });
  assert('Driver response acknowledged', deleteRes.acknowledged, true);
  assert('Driver deletedCount equals 1', deleteRes.deletedCount, 1);
  assert('Post-delete verification document is null', deleteRes.documentExistsPostDelete, false);

  // Test 3: Delete non-existent document
  console.log(`\nTest 3: Attempting to delete non-existent document...`);
  const missingId = new mongoose.Types.ObjectId().toString();
  const deleteMissingRes = await mongo.deleteOne('test_delete_col', { _id: missingId });
  assert('Driver deletedCount equals 0 for missing document', deleteMissingRes.deletedCount, 0);

  await mongo.disconnect();

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL MONGO DELETE ONE VERIFICATION TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

testDeleteOne().catch((err) => {
  console.error('Delete One Test Error:', err);
  process.exit(1);
});
