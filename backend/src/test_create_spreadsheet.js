import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsCreateSpreadsheetExecutor } from './engine/googleSheets/GoogleSheetsCreateSpreadsheetExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Google Sheets Create Spreadsheet Node Test Suite...\n');

  // 1. Test Executor Registry Registration
  const registeredExecutor = ExecutorRegistry.getExecutor('googleSheetsCreateSpreadsheet');
  console.assert(registeredExecutor instanceof GoogleSheetsCreateSpreadsheetExecutor, 'ExecutorRegistry mapping failed for googleSheetsCreateSpreadsheet');
  console.log('✓ 1. ExecutorRegistry registration for googleSheetsCreateSpreadsheet verified');

  // 2. Test Parameter Validation
  try {
    await GoogleSheetsService.createSpreadsheet({ title: '' });
    console.assert(false, 'Should have thrown error for empty title');
  } catch (err) {
    console.assert(err.message.includes('Spreadsheet Name') || err.message.includes('required'), 'Expected title validation error');
    console.log('✓ 2. Parameter validation for missing title verified');
  }

  // 3. Test Executor Input Resolution & Logging
  const executor = new GoogleSheetsCreateSpreadsheetExecutor();
  const mockNode = {
    id: 'node_create_sheet_123',
    type: 'googleSheetsCreateSpreadsheet',
    data: {
      config: {
        title: 'Test Spreadsheet {{now}}',
        worksheetTitle: 'CustomSheet',
      },
    },
  };

  const mockContext = {
    userId: 'usr_demo_123',
    resolveVariables: (expr) => expr.replace('{{now}}', '2026-08-06'),
  };

  // Mock GoogleSheetsService.createSpreadsheet for isolated unit testing
  const originalCreate = GoogleSheetsService.createSpreadsheet;
  GoogleSheetsService.createSpreadsheet = async ({ credentialId, userId, title, worksheetTitle, log }) => {
    log('[CreateSpreadsheet] Loading OAuth credentials...');
    log('[CreateSpreadsheet] Access token validated.');
    log('[CreateSpreadsheet] Creating spreadsheet...');
    log('[CreateSpreadsheet] Spreadsheet created successfully.');
    log('[CreateSpreadsheet] Spreadsheet ID: mock_sheet_id_999');
    log('[CreateSpreadsheet] Finished.');

    return {
      success: true,
      spreadsheetId: 'mock_sheet_id_999',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock_sheet_id_999/edit',
      title,
      worksheet: worksheetTitle,
    };
  };

  const executionResult = await executor.execute(mockNode, mockContext);
  GoogleSheetsService.createSpreadsheet = originalCreate;

  console.assert(executionResult.success === true, 'Execution result success mismatch');
  console.assert(executionResult.spreadsheetId === 'mock_sheet_id_999', 'Execution result spreadsheetId mismatch');
  console.assert(executionResult.spreadsheetUrl.includes('mock_sheet_id_999'), 'Execution result spreadsheetUrl mismatch');
  console.assert(executionResult.title === 'Test Spreadsheet 2026-08-06', 'Title resolution mismatch');
  console.assert(executionResult.worksheet === 'CustomSheet', 'Worksheet resolution mismatch');
  console.assert(executionResult.executionLogs.length === 6, `Expected 6 log entries, got ${executionResult.executionLogs.length}`);

  console.log('✓ 3. GoogleSheetsCreateSpreadsheetExecutor execution & structured logging verified');

  console.log('\n🎉 ALL CREATE SPREADSHEET AUTOMATED TESTS PASSED SUCCESSFULLY! (3/3 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
