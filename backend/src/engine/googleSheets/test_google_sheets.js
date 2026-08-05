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
  // Test 1: Service API Structure & Executor Registration
  // ----------------------------------------------------
  console.log('--- Test 1: GoogleSheetsService & Executor Registry ---');
  assert(typeof GoogleSheetsService.readRows === 'function', 'readRows declared');
  assert(typeof GoogleSheetsService.appendRow === 'function', 'appendRow declared');
  assert(typeof GoogleSheetsService.updateRow === 'function', 'updateRow declared');
  assert(typeof GoogleSheetsService.clearRows === 'function', 'clearRows declared');
  assert(typeof GoogleSheetsService.listSpreadsheets === 'function', 'listSpreadsheets declared');
  assert(typeof GoogleSheetsService.getWorksheets === 'function', 'getWorksheets declared');

  const { ExecutorRegistry } = await import('../registry/ExecutorRegistry.js');
  assert(!!ExecutorRegistry.getExecutor('googleSheetsAppendRow'), 'googleSheetsAppendRow executor registered');
  assert(!!ExecutorRegistry.getExecutor('googleSheetsReadRows'), 'googleSheetsReadRows executor registered');
  assert(!!ExecutorRegistry.getExecutor('googleSheetsFindRow'), 'googleSheetsFindRow executor registered');

  // ----------------------------------------------------
  // Test 2: Find Row Search Logic & Operators
  // ----------------------------------------------------
  console.log('\n--- Test 2: Find Row Search Logic & Operators ---');
  const mockReadResult = {
    rows: [
      { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Vapi' },
      { _rowNumber: 3, Name: 'Alex', Email: 'alex@example.com', City: 'New York' },
      { _rowNumber: 4, Name: 'Divyansh Singh', Email: 'divyansh.singh@gmail.com', City: 'Mumbai' },
    ]
  };

  const origReadRows = GoogleSheetsService.readRows;
  GoogleSheetsService.readRows = async () => mockReadResult;

  try {
    // 2a. Equals search
    const eqResult = await GoogleSheetsService.findRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      searchColumn: 'Name',
      searchValue: 'Divyansh',
      matchType: 'equals',
    });
    assert(eqResult.success && eqResult.foundRow.City === 'Vapi', 'Equals match succeeded');

    // 2b. Contains search
    const containsResult = await GoogleSheetsService.findRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      searchColumn: 'Email',
      searchValue: 'gmail',
      matchType: 'contains',
      returnMode: 'all',
      limit: 100,
    });
    assert(containsResult.count === 2, 'Contains match returned all 2 gmail rows');

    // 2c. StartsWith search
    const startsResult = await GoogleSheetsService.findRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      searchColumn: 'Name',
      searchValue: 'Div',
      matchType: 'startsWith',
    });
    assert(startsResult.foundRow._rowNumber === 2, 'StartsWith match succeeded');

    // 2d. Case sensitive check
    const caseResult = await GoogleSheetsService.findRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      searchColumn: 'Name',
      searchValue: 'divyansh',
      matchType: 'equals',
      caseSensitive: true,
    });
    assert(!caseResult.success, 'Case sensitive match correctly rejected lowercase "divyansh"');
  } finally {
    GoogleSheetsService.readRows = origReadRows;
  }

  // ----------------------------------------------------
  // Test 3: Update Row Operations & Mappings
  // ----------------------------------------------------
  console.log('\n--- Test 3: Update Row Operations & Mappings ---');
  const origGetHeaders = GoogleSheetsService.getHeaders;
  const origGetSheetsClient = GoogleSheetsService.getSheetsClient;

  GoogleSheetsService.getHeaders = async () => ['Name', 'Email', 'City'];
  GoogleSheetsService.getSheetsClient = async () => ({
    spreadsheets: {
      values: {
        get: async () => ({ data: { values: [['Divyansh', 'divyansh@gmail.com', 'Vapi']] } }),
        update: async ({ range, requestBody }) => ({ data: { updatedRange: range, updatedValues: requestBody.values } }),
      }
    }
  });

  try {
    const updateRes = await GoogleSheetsService.updateRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      worksheetTitle: 'Sheet1',
      rowNumber: 2,
      columnsMap: { City: 'Mumbai' },
    });

    assert(updateRes.success && updateRes.updatedRow === 2, 'Update row returned success & rowNumber 2');
    assert(updateRes.values.City === 'Mumbai', 'Updated City mapped to Mumbai');
    assert(updateRes.values.Name === 'Divyansh', 'Unmapped Name preserved as Divyansh');
  } finally {
    GoogleSheetsService.getHeaders = origGetHeaders;
    GoogleSheetsService.getSheetsClient = origGetSheetsClient;
  }

  // ----------------------------------------------------
  // Test 4: Delete Row Operations
  // ----------------------------------------------------
  console.log('\n--- Test 4: Delete Row Operations ---');
  const origReadRows4 = GoogleSheetsService.readRows;
  const origGetWorksheets4 = GoogleSheetsService.getWorksheets;

  GoogleSheetsService.readRows = async () => ({
    rows: [
      { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Vapi' },
      { _rowNumber: 3, Name: 'Alex', Email: 'alex@example.com', City: 'New York' },
    ]
  });
  GoogleSheetsService.getWorksheets = async () => [{ sheetId: 0, title: 'Sheet1' }];
  GoogleSheetsService.getSheetsClient = async () => ({
    spreadsheets: {
      batchUpdate: async ({ requestBody }) => ({ data: { replies: [{ deleteDimension: {} }] } }),
    }
  });

  try {
    // 4a. Delete existing row by mapped column criteria
    const delRes = await GoogleSheetsService.deleteRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      worksheetTitle: 'Sheet1',
      columnsMap: { Email: 'divyansh@gmail.com' },
    });
    assert(delRes.success && delRes.deletedRowNumber === 2, 'Delete row matched by column criteria and returned row #2');
    assert(delRes.deletedRow.Name === 'Divyansh', 'Deleted row payload preserved rowData');

    // 4b. Return 404/failure when row does not exist
    const delNotFound = await GoogleSheetsService.deleteRow({
      credentialId: 'test',
      userId: 'test',
      spreadsheetId: 'sp1',
      worksheetTitle: 'Sheet1',
      columnsMap: { Email: 'nonexistent@gmail.com' },
    });
    assert(!delNotFound.success && delNotFound.message === 'Matching row not found.', 'Nonexistent row returned success: false');
  } finally {
    GoogleSheetsService.readRows = origReadRows4;
    GoogleSheetsService.getWorksheets = origGetWorksheets4;
    GoogleSheetsService.getSheetsClient = origGetSheetsClient;
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runGoogleSheetsTestSuite().catch((err) => {
  console.error('❌ Google Sheets Test Suite failed:', err);
  process.exit(1);
});
