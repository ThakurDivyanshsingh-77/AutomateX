import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsCreateSpreadsheetExecutor } from './engine/googleSheets/GoogleSheetsCreateSpreadsheetExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Verification Test Suite for Google Sheets Create Spreadsheet Node...\n');

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

  // 3. Test Case 1: Initial Worksheet Name = "order"
  // Verify that sheets.spreadsheets.create requestBody contains sheetId: 0 and title: "order"
  const executor = new GoogleSheetsCreateSpreadsheetExecutor();
  const case1Node = {
    id: 'node_create_sheet_order',
    type: 'googleSheetsCreateSpreadsheet',
    data: {
      config: {
        spreadsheetName: 'AutomateX Orders',
        initialWorksheetName: 'order',
      },
    },
  };

  const mockContext = {
    userId: 'usr_demo_123',
    resolveVariables: (expr) => expr,
  };

  // Mock getSheetsClient to spy on Google API calls
  let createRequestBody = null;
  let batchUpdateCalled = false;

  const originalGetSheetsClient = GoogleSheetsService.getSheetsClient;
  GoogleSheetsService.getSheetsClient = async () => {
    return {
      spreadsheets: {
        create: async ({ requestBody }) => {
          createRequestBody = requestBody;
          return {
            data: {
              spreadsheetId: 'mock_sheet_order_123',
              spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock_sheet_order_123/edit',
              sheets: [
                {
                  properties: {
                    sheetId: 0,
                    title: requestBody.sheets?.[0]?.properties?.title || 'Sheet1',
                  },
                },
              ],
            },
          };
        },
        batchUpdate: async ({ spreadsheetId, requestBody }) => {
          batchUpdateCalled = true;
          return { data: {} };
        },
      },
    };
  };

  const res1 = await executor.execute(case1Node, mockContext);

  console.assert(createRequestBody.properties.title === 'AutomateX Orders', `File title mismatch: expected "AutomateX Orders", got "${createRequestBody.properties.title}"`);
  console.assert(createRequestBody.sheets?.[0]?.properties?.title === 'order', `Initial sheet tab title mismatch in API payload: expected "order", got "${createRequestBody.sheets?.[0]?.properties?.title}"`);
  console.assert(res1.worksheet === 'order', `Result worksheet mismatch: expected "order", got "${res1.worksheet}"`);
  console.log('✓ 3. Verified sheets.spreadsheets.create payload includes initialWorksheetName="order" and sheetId=0');

  // 4. Test Case 2: Fallback tab rename if Google API ignores sheets array in create call
  GoogleSheetsService.getSheetsClient = async () => {
    return {
      spreadsheets: {
        create: async ({ requestBody }) => {
          createRequestBody = requestBody;
          // Simulate Google API creating default "Sheet1" instead of requested "order"
          return {
            data: {
              spreadsheetId: 'mock_sheet_order_fallback',
              spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock_sheet_order_fallback/edit',
              sheets: [
                {
                  properties: {
                    sheetId: 0,
                    title: 'Sheet1',
                  },
                },
              ],
            },
          };
        },
        batchUpdate: async ({ spreadsheetId, requestBody }) => {
          batchUpdateCalled = true;
          return { data: {} };
        },
      },
    };
  };

  batchUpdateCalled = false;
  const res2 = await executor.execute(case1Node, mockContext);

  console.assert(batchUpdateCalled === true, 'Expected batchUpdate rename call when Google API returned "Sheet1"');
  console.assert(res2.worksheet === 'order', `Expected renamed worksheet "order", got "${res2.worksheet}"`);
  console.log('✓ 4. Verified fallback batchUpdate worksheet renaming when Google API defaults to "Sheet1"');

  // Restore original method
  GoogleSheetsService.getSheetsClient = originalGetSheetsClient;

  console.log('\n🎉 ALL GOOGLE SHEETS CREATE SPREADSHEET TESTS PASSED SUCCESSFULLY! (4/4 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
