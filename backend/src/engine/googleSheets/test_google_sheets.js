import { GoogleSheetsService } from './GoogleSheetsService.js';

async function runGoogleSheetsTestSuite() {
  console.log('====================================================');
  console.log('🚀 AUTOMATEX GOOGLE SHEETS INTEGRATION TEST SUITE');
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
  // Test 1: Service API Structure
  // ----------------------------------------------------
  console.log('--- Test 1: GoogleSheetsService Method Declarations ---');
  assert(typeof GoogleSheetsService.readRows === 'function', 'readRows declared');
  assert(typeof GoogleSheetsService.appendRow === 'function', 'appendRow declared');
  assert(typeof GoogleSheetsService.updateRow === 'function', 'updateRow declared');
  assert(typeof GoogleSheetsService.clearRange === 'function', 'clearRange declared');
  assert(typeof GoogleSheetsService.createSpreadsheet === 'function', 'createSpreadsheet declared');
  assert(typeof GoogleSheetsService.createWorksheet === 'function', 'createWorksheet declared');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runGoogleSheetsTestSuite().catch((err) => {
  console.error('❌ Google Sheets Test Suite failed:', err);
  process.exit(1);
});
