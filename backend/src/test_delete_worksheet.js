import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsDeleteWorksheetExecutor } from './engine/googleSheets/GoogleSheetsDeleteWorksheetExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Google Sheets Delete Worksheet Verification Test Suite...\n');

  // 1. Test Executor Registry Registration
  const registeredExecutor = ExecutorRegistry.getExecutor('googleSheetsDeleteWorksheet');
  console.assert(registeredExecutor instanceof GoogleSheetsDeleteWorksheetExecutor, 'ExecutorRegistry mapping failed for googleSheetsDeleteWorksheet');
  console.log('✓ 1. ExecutorRegistry registration for googleSheetsDeleteWorksheet verified');

  // 2. Parameter Validation
  try {
    await GoogleSheetsService.deleteWorksheet({ spreadsheetId: '', worksheetTitle: 'Orders' });
    console.assert(false, 'Should have thrown error for empty spreadsheetId');
  } catch (err) {
    console.assert(err.message.includes('Spreadsheet ID') || err.message.includes('required'), 'Expected spreadsheet ID validation error');
    console.log('✓ 2. Parameter validation for missing spreadsheet ID verified');
  }

  try {
    await GoogleSheetsService.deleteWorksheet({ spreadsheetId: 'sp_123', worksheetTitle: '' });
    console.assert(false, 'Should have thrown error for empty worksheet selection');
  } catch (err) {
    console.assert(err.message.includes('Worksheet selection') || err.message.includes('required'), 'Expected worksheet selection validation error');
    console.log('✓ 3. Parameter validation for missing worksheet selection verified');
  }

  // 3. Mock Store & Setup
  let mockWorksheetsStore = [
    { id: 0, sheetId: 0, title: 'Sheet1', index: 0 },
    { id: 101, sheetId: 101, title: 'Orders', index: 1 },
    { id: 102, sheetId: 102, title: 'Customers', index: 2 },
  ];

  let deleteSheetPayloads = [];

  const originalGetWorksheets = GoogleSheetsService.getWorksheets;
  const originalGetSheetsClient = GoogleSheetsService.getSheetsClient;

  GoogleSheetsService.getWorksheets = async ({ spreadsheetId }) => {
    return [...mockWorksheetsStore];
  };

  GoogleSheetsService.getSheetsClient = async () => {
    return {
      spreadsheets: {
        get: async ({ spreadsheetId }) => {
          return {
            data: {
              spreadsheetId,
              properties: { title: 'AutomateX Test' },
              sheets: mockWorksheetsStore.map((w) => ({
                properties: {
                  sheetId: w.id !== undefined ? w.id : (w.sheetId !== undefined ? w.sheetId : 0),
                  title: w.title,
                  index: w.index ?? 0,
                },
              })),
            },
          };
        },
        batchUpdate: async ({ spreadsheetId, requestBody }) => {
          deleteSheetPayloads.push({ spreadsheetId, requestBody });
          const delSheetId = requestBody.requests?.[0]?.deleteSheet?.sheetId;
          mockWorksheetsStore = mockWorksheetsStore.filter((w) => w.id !== delSheetId && w.sheetId !== delSheetId);
          return { data: { spreadsheetId } };
        },
      },
    };
  };

  const executor = new GoogleSheetsDeleteWorksheetExecutor();
  const mockContext = {
    userId: 'usr_demo_123',
    resolveVariables: (expr) => expr,
  };

  // --- TEST 1: Delete "Orders" from [Sheet1, Orders, Customers] ---
  const deleteOrdersNode = {
    id: 'node_delete_orders',
    type: 'googleSheetsDeleteWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_100',
        worksheetTitle: 'Orders',
      },
    },
  };

  const res1 = await executor.execute(deleteOrdersNode, mockContext);
  console.assert(res1.success === true, 'Test 1: Delete Orders failed');
  console.assert(res1.deletedWorksheet === 'Orders', `Expected deletedWorksheet "Orders", got "${res1.deletedWorksheet}"`);
  console.assert(res1.message === 'Worksheet deleted successfully.', 'Message mismatch');
  
  // Verify execution logs
  console.assert(res1.executionLogs.some((l) => l.message === 'Loading credentials...'), 'Log missing: Loading credentials...');
  console.assert(res1.executionLogs.some((l) => l.message === 'Fetching spreadsheet...'), 'Log missing: Fetching spreadsheet...');
  console.assert(res1.executionLogs.some((l) => l.message === 'Locating worksheet...'), 'Log missing: Locating worksheet...');
  console.assert(res1.executionLogs.some((l) => l.message === 'Deleting worksheet...'), 'Log missing: Deleting worksheet...');
  console.assert(res1.executionLogs.some((l) => l.message === 'Worksheet deleted successfully.'), 'Log missing: Worksheet deleted successfully.');
  console.assert(res1.executionLogs.some((l) => l.message === 'Finished.'), 'Log missing: Finished.');

  // Verify sheetId 101 was passed in deleteSheet request
  const lastDeleteReq = deleteSheetPayloads[deleteSheetPayloads.length - 1];
  console.assert(lastDeleteReq.requestBody.requests[0].deleteSheet.sheetId === 101, 'Correct sheetId 101 was not sent in deleteSheet payload');

  // Verify remaining tabs are Sheet1 and Customers
  const remainingTitles = mockWorksheetsStore.map((w) => w.title);
  console.assert(remainingTitles.length === 2, `Expected 2 remaining tabs, got ${remainingTitles.length}`);
  console.assert(remainingTitles.includes('Sheet1') && remainingTitles.includes('Customers'), 'Remaining tabs mismatch');
  console.assert(!remainingTitles.includes('Orders'), '"Orders" was not removed from spreadsheet');
  console.log('✓ 4. Test 1 Passed: Deleted "Orders" tab successfully. Remaining tabs: Sheet1, Customers');

  // --- TEST 2: Try deleting a worksheet that doesn't exist ---
  const deleteNonExistentNode = {
    id: 'node_delete_non_existent',
    type: 'googleSheetsDeleteWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_100',
        worksheetTitle: 'NonExistentTab',
      },
    },
  };

  try {
    await executor.execute(deleteNonExistentNode, mockContext);
    console.assert(false, 'Test 2 should have thrown error for non-existent worksheet');
  } catch (err) {
    console.assert(err.message === "Worksheet 'NonExistentTab' not found.", `Expected "Worksheet 'NonExistentTab' not found.", got "${err.message}"`);
    console.log('✓ 5. Test 2 Passed: Deleting non-existent worksheet returned clear error: "Worksheet \'NonExistentTab\' not found."');
  }

  // --- TEST 3: Delete "Customers", leaving only 1 sheet tab "Sheet1", then attempt to delete "Sheet1" ---
  const deleteCustomersNode = {
    id: 'node_delete_customers',
    type: 'googleSheetsDeleteWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_100',
        worksheetTitle: 'Customers',
      },
    },
  };

  await executor.execute(deleteCustomersNode, mockContext);
  console.assert(mockWorksheetsStore.length === 1 && mockWorksheetsStore[0].title === 'Sheet1', 'Spreadsheet should now contain only 1 tab: Sheet1');

  // Attempt to delete the single remaining worksheet tab "Sheet1"
  const deleteSheet1Node = {
    id: 'node_delete_sheet1',
    type: 'googleSheetsDeleteWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_100',
        worksheetTitle: 'Sheet1',
      },
    },
  };

  try {
    await executor.execute(deleteSheet1Node, mockContext);
    console.assert(false, 'Test 3 should have prevented deleting the single remaining worksheet');
  } catch (err) {
    console.assert(err.message === 'Cannot delete the last worksheet in a spreadsheet.', `Expected "Cannot delete the last worksheet in a spreadsheet.", got "${err.message}"`);
    console.log('✓ 6. Test 3 Passed: Attempting to delete sole remaining tab returned safety error: "Cannot delete the last worksheet in a spreadsheet."');
  }

  // Restore original methods
  GoogleSheetsService.getWorksheets = originalGetWorksheets;
  GoogleSheetsService.getSheetsClient = originalGetSheetsClient;

  console.log('\n🎉 ALL GOOGLE SHEETS DELETE WORKSHEET TESTS PASSED SUCCESSFULLY! (6/6 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
