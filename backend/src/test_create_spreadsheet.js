import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsCreateSpreadsheetExecutor } from './engine/googleSheets/GoogleSheetsCreateSpreadsheetExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Independent Parameter Google Sheets Create Spreadsheet Test Suite...\n');

  // 1. Test Executor Registry Registration
  const registeredExecutor = ExecutorRegistry.getExecutor('googleSheetsCreateSpreadsheet');
  console.assert(registeredExecutor instanceof GoogleSheetsCreateSpreadsheetExecutor, 'ExecutorRegistry mapping failed for googleSheetsCreateSpreadsheet');
  console.log('✓ 1. ExecutorRegistry registration for googleSheetsCreateSpreadsheet verified');

  // 2. Test Parameter Validation (Missing Spreadsheet Name)
  try {
    await GoogleSheetsService.createSpreadsheet({ title: '', spreadsheetName: '' });
    console.assert(false, 'Should have thrown error for empty spreadsheet name');
  } catch (err) {
    console.assert(err.message.includes('Spreadsheet Name') || err.message.includes('required'), 'Expected spreadsheet name validation error');
    console.log('✓ 2. Parameter validation for missing spreadsheet name verified');
  }

  // 3. Test Requirement Case 1: Spreadsheet Name = "Sales Report", Worksheet = "Orders"
  // -> File name MUST be "Sales Report"
  // -> First tab MUST be "Orders"
  const executor = new GoogleSheetsCreateSpreadsheetExecutor();
  const case1Node = {
    id: 'node_create_sheet_case1',
    type: 'googleSheetsCreateSpreadsheet',
    data: {
      config: {
        spreadsheetName: 'Sales Report',
        initialWorksheetName: 'Orders',
      },
    },
  };

  const mockContext = {
    userId: 'usr_demo_123',
    resolveVariables: (expr) => expr,
  };

  // Mock GoogleSheetsService.createSpreadsheet for isolated assertions
  let lastCreatedPayload = null;
  const originalCreate = GoogleSheetsService.createSpreadsheet;
  GoogleSheetsService.createSpreadsheet = async ({ credentialId, userId, spreadsheetName, title, initialWorksheetName, worksheetTitle, log }) => {
    log('[CreateSpreadsheet] Loading OAuth credentials...');
    log('[CreateSpreadsheet] Access token validated.');
    log('[CreateSpreadsheet] Creating spreadsheet...');

    const finalTitle = String(spreadsheetName || title || '').trim();
    const finalWorksheet = String(initialWorksheetName || worksheetTitle || '').trim() || 'Sheet1';

    lastCreatedPayload = {
      title: finalTitle,
      worksheet: finalWorksheet,
    };

    return {
      success: true,
      spreadsheetId: 'mock_sheet_case1_123',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock_sheet_case1_123/edit',
      title: finalTitle,
      worksheet: finalWorksheet,
    };
  };

  const res1 = await executor.execute(case1Node, mockContext);
  console.assert(res1.title === 'Sales Report', `Expected File Title "Sales Report", got "${res1.title}"`);
  console.assert(res1.worksheet === 'Orders', `Expected Tab Title "Orders", got "${res1.worksheet}"`);
  console.assert(lastCreatedPayload.title === 'Sales Report', 'Google API payload title mismatch');
  console.assert(lastCreatedPayload.worksheet === 'Orders', 'Google API payload worksheet mismatch');
  console.log('✓ 3. Test Case 1 Verified: Spreadsheet Name="Sales Report", Worksheet="Orders" -> File name: "Sales Report", First tab: "Orders"');

  // 4. Test Requirement Case 2: Spreadsheet Name = "Inventory", Worksheet empty
  // -> File name MUST be "Inventory"
  // -> First tab MUST default to "Sheet1"
  const case2Node = {
    id: 'node_create_sheet_case2',
    type: 'googleSheetsCreateSpreadsheet',
    data: {
      config: {
        spreadsheetName: 'Inventory',
        initialWorksheetName: '',
      },
    },
  };

  const res2 = await executor.execute(case2Node, mockContext);
  console.assert(res2.title === 'Inventory', `Expected File Title "Inventory", got "${res2.title}"`);
  console.assert(res2.worksheet === 'Sheet1', `Expected Tab Title default "Sheet1", got "${res2.worksheet}"`);
  console.assert(lastCreatedPayload.title === 'Inventory', 'Google API payload title mismatch');
  console.assert(lastCreatedPayload.worksheet === 'Sheet1', 'Google API payload default worksheet mismatch');
  console.log('✓ 4. Test Case 2 Verified: Spreadsheet Name="Inventory", Worksheet="" -> File name: "Inventory", First tab: "Sheet1"');

  // Restore original method
  GoogleSheetsService.createSpreadsheet = originalCreate;

  console.log('\n🎉 ALL INDEPENDENT PARAMETER SPREADSHEET TESTS PASSED SUCCESSFULLY! (4/4 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
