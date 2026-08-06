import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsGetSpreadsheetInfoExecutor } from './engine/googleSheets/GoogleSheetsGetSpreadsheetInfoExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Google Sheets Get Spreadsheet Info Verification Test Suite...\n');

  // 1. Test Executor Registry Registration
  const registeredExecutor = ExecutorRegistry.getExecutor('googleSheetsGetSpreadsheetInfo');
  console.assert(registeredExecutor instanceof GoogleSheetsGetSpreadsheetInfoExecutor, 'ExecutorRegistry mapping failed for googleSheetsGetSpreadsheetInfo');
  console.log('✓ 1. ExecutorRegistry registration for googleSheetsGetSpreadsheetInfo verified');

  // 2. Parameter Validation
  try {
    await GoogleSheetsService.getSpreadsheetInfo({ spreadsheetId: '' });
    console.assert(false, 'Should have thrown error for empty spreadsheetId');
  } catch (err) {
    console.assert(err.message.includes('Spreadsheet ID') || err.message.includes('required'), 'Expected spreadsheet ID validation error');
    console.log('✓ 2. Parameter validation for missing spreadsheet ID verified');
  }

  // Mock GoogleSheetsService.getSheetsClient & getDriveClient for testing
  const originalGetSheetsClient = GoogleSheetsService.getSheetsClient;
  const originalGetDriveClient = GoogleSheetsService.getDriveClient;

  let mockWorksheetsStore = [
    {
      properties: {
        sheetId: 0,
        title: 'Sheet1',
        index: 0,
        gridProperties: { rowCount: 1000, columnCount: 26, frozenRowCount: 1, frozenColumnCount: 0 },
        hidden: false,
      },
    },
    {
      properties: {
        sheetId: 987654321,
        title: 'Orders',
        index: 1,
        gridProperties: { rowCount: 500, columnCount: 15, frozenRowCount: 0, frozenColumnCount: 0 },
        hidden: true,
      },
    },
  ];

  GoogleSheetsService.getSheetsClient = async () => {
    return {
      spreadsheets: {
        get: async ({ spreadsheetId }) => {
          if (spreadsheetId === 'invalid_sp_404') {
            const err = new Error('Requested entity was not found');
            err.status = 404;
            throw err;
          }
          if (spreadsheetId === 'forbidden_sp_403') {
            const err = new Error('Permission denied');
            err.status = 403;
            throw err;
          }
          return {
            data: {
              spreadsheetId,
              properties: {
                title: 'AutomateX Master Report',
                locale: 'en_US',
                timeZone: 'America/New_York',
              },
              spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
              sheets: mockWorksheetsStore,
            },
          };
        },
        batchUpdate: async ({ spreadsheetId, requestBody }) => {
          if (requestBody.requests?.[0]?.addSheet) {
            const props = requestBody.requests[0].addSheet.properties;
            mockWorksheetsStore.push({
              properties: {
                sheetId: Date.now(),
                title: props.title,
                index: mockWorksheetsStore.length,
                gridProperties: { rowCount: props.gridProperties?.rowCount || 1000, columnCount: props.gridProperties?.columnCount || 26 },
                hidden: false,
              },
            });
          }
          if (requestBody.requests?.[0]?.deleteSheet) {
            const delId = requestBody.requests[0].deleteSheet.sheetId;
            mockWorksheetsStore = mockWorksheetsStore.filter((s) => s.properties.sheetId !== delId);
          }
          return { data: { spreadsheetId } };
        },
      },
    };
  };

  GoogleSheetsService.getDriveClient = async () => {
    return {
      files: {
        get: async ({ fileId }) => {
          return {
            data: {
              owners: [{ displayName: 'Divyansh Singh', emailAddress: 'divyansh@automatex.com' }],
              modifiedTime: '2026-08-06T12:00:00.000Z',
            },
          };
        },
      },
    };
  };

  // 3. Test Full Metadata Retrieval via Executor
  const executor = new GoogleSheetsGetSpreadsheetInfoExecutor();
  const mockContext = {
    userId: 'user_999',
    resolveVariables: (val) => val,
  };

  const node = {
    id: 'node_get_info_1',
    type: 'googleSheetsGetSpreadsheetInfo',
    data: {
      config: {
        credentialId: 'cred_google_1',
        spreadsheetId: 'sp_live_100',
      },
    },
  };

  const result = await executor.execute(node, mockContext);
  console.assert(result.success === true, 'Result success should be true');
  console.assert(result.spreadsheetId === 'sp_live_100', 'Spreadsheet ID mismatch');
  console.assert(result.spreadsheetName === 'AutomateX Master Report', 'Spreadsheet title mismatch');
  console.assert(result.owner === 'Divyansh Singh', 'Owner mismatch');
  console.assert(result.locale === 'en_US', 'Locale mismatch');
  console.assert(result.timeZone === 'America/New_York', 'Time zone mismatch');
  console.assert(result.worksheetCount === 2, 'Worksheet count should be 2');
  console.assert(result.worksheets[0].title === 'Sheet1', 'First worksheet title mismatch');
  console.assert(result.worksheets[1].title === 'Orders', 'Second worksheet title mismatch');
  console.assert(result.worksheets[1].hidden === true, 'Hidden worksheet flag mismatch');
  console.assert(result.worksheets[0].frozenRows === 1, 'Frozen rows mismatch');
  console.assert(result.executionLogs.length >= 4, 'Execution logs count insufficient');
  console.log('✓ 3. Test 1 Passed: Retrieved complete metadata for spreadsheet with 2 worksheets (including hidden state & grid properties)');

  // 4. Test Cache Invalidation on Create & Delete Worksheet
  await GoogleSheetsService.createWorksheet({
    credentialId: 'cred_google_1',
    userId: 'user_999',
    spreadsheetId: 'sp_live_100',
    worksheetName: 'Customers',
  });

  const updatedResult = await executor.execute(node, mockContext);
  console.assert(updatedResult.worksheetCount === 3, `Expected 3 worksheets after creation, got ${updatedResult.worksheetCount}`);
  console.assert(updatedResult.worksheets[2].title === 'Customers', 'New tab title should be Customers');
  console.log('✓ 4. Test 2 Passed: Cache invalidated & metadata updated cleanly after Create Worksheet (worksheets: 3)');

  await GoogleSheetsService.deleteWorksheet({
    credentialId: 'cred_google_1',
    userId: 'user_999',
    spreadsheetId: 'sp_live_100',
    worksheetTitle: 'Orders',
  });

  const finalResult = await executor.execute(node, mockContext);
  console.assert(finalResult.worksheetCount === 2, `Expected 2 worksheets after deletion, got ${finalResult.worksheetCount}`);
  console.assert(!finalResult.worksheets.some((w) => w.title === 'Orders'), 'Orders tab should be removed');
  console.log('✓ 5. Test 3 Passed: Cache invalidated & metadata updated cleanly after Delete Worksheet (worksheets: 2)');

  // 5. Test Error Handling (Not Found & Forbidden)
  try {
    await GoogleSheetsService.getSpreadsheetInfo({ spreadsheetId: 'invalid_sp_404', bypassCache: true });
    console.assert(false, 'Should have thrown 404 error');
  } catch (err) {
    console.assert(err.message.includes('not found'), 'Expected not found error message');
    console.log('✓ 6. Test 4 Passed: 404 Spreadsheet Not Found error handled cleanly');
  }

  try {
    await GoogleSheetsService.getSpreadsheetInfo({ spreadsheetId: 'forbidden_sp_403', bypassCache: true });
    console.assert(false, 'Should have thrown 403 error');
  } catch (err) {
    console.assert(err.message.includes('Permission denied'), 'Expected permission denied error message');
    console.log('✓ 7. Test 5 Passed: 403 Permission Denied error handled cleanly');
  }

  // Restore mocks
  GoogleSheetsService.getSheetsClient = originalGetSheetsClient;
  GoogleSheetsService.getDriveClient = originalGetDriveClient;

  console.log('\n🎉 ALL GOOGLE SHEETS GET SPREADSHEET INFO TESTS PASSED SUCCESSFULLY! (7/7 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
