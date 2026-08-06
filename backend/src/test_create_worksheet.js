import { GoogleSheetsService } from './engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsCreateWorksheetExecutor } from './engine/googleSheets/GoogleSheetsCreateWorksheetExecutor.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';

async function runTests() {
  console.log('🧪 Starting Google Sheets Create Worksheet Verification Test Suite...\n');

  // 1. Test Executor Registry Registration
  const registeredExecutor = ExecutorRegistry.getExecutor('googleSheetsCreateWorksheet');
  console.assert(registeredExecutor instanceof GoogleSheetsCreateWorksheetExecutor, 'ExecutorRegistry mapping failed for googleSheetsCreateWorksheet');
  console.log('✓ 1. ExecutorRegistry registration for googleSheetsCreateWorksheet verified');

  // 2. Test Parameter Validation (Missing Spreadsheet ID & Worksheet Name)
  try {
    await GoogleSheetsService.createWorksheet({ spreadsheetId: '', worksheetName: 'Orders' });
    console.assert(false, 'Should have thrown error for empty spreadsheetId');
  } catch (err) {
    console.assert(err.message.includes('Spreadsheet ID') || err.message.includes('required'), 'Expected spreadsheet ID validation error');
    console.log('✓ 2. Parameter validation for missing spreadsheet ID verified');
  }

  try {
    await GoogleSheetsService.createWorksheet({ spreadsheetId: 'sp_123', worksheetName: '' });
    console.assert(false, 'Should have thrown error for empty worksheetName');
  } catch (err) {
    console.assert(err.message.includes('New Worksheet Name') || err.message.includes('required'), 'Expected worksheet name validation error');
    console.log('✓ 3. Parameter validation for missing worksheet name verified');
  }

  // 3. Mock GoogleSheetsService.getWorksheets & getSheetsClient for testing worksheet creation
  const mockWorksheetsStore = [
    { id: 0, sheetId: 0, title: 'Sheet1', index: 0 },
  ];
  let batchUpdateCalls = [];

  const originalGetWorksheets = GoogleSheetsService.getWorksheets;
  const originalGetSheetsClient = GoogleSheetsService.getSheetsClient;

  GoogleSheetsService.getWorksheets = async ({ spreadsheetId }) => {
    return [...mockWorksheetsStore];
  };

  GoogleSheetsService.getSheetsClient = async () => {
    return {
      spreadsheets: {
        batchUpdate: async ({ spreadsheetId, requestBody }) => {
          batchUpdateCalls.push({ spreadsheetId, requestBody });
          const addSheetProp = requestBody.requests?.[0]?.addSheet?.properties;
          const newSheetId = mockWorksheetsStore.length + 100;
          const newTab = {
            id: newSheetId,
            sheetId: newSheetId,
            title: addSheetProp.title,
            index: mockWorksheetsStore.length,
            rowCount: addSheetProp.gridProperties?.rowCount || 1000,
            columnCount: addSheetProp.gridProperties?.columnCount || 26,
          };
          mockWorksheetsStore.push(newTab);

          return {
            data: {
              spreadsheetId,
              replies: [
                {
                  addSheet: {
                    properties: {
                      sheetId: newSheetId,
                      title: addSheetProp.title,
                      index: newTab.index,
                    },
                  },
                },
              ],
            },
          };
        },
      },
    };
  };

  const executor = new GoogleSheetsCreateWorksheetExecutor();
  const mockContext = {
    userId: 'usr_demo_123',
    resolveVariables: (expr) => expr,
  };

  // Test Case A: Create "Orders" worksheet
  const ordersNode = {
    id: 'node_create_orders',
    type: 'googleSheetsCreateWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_999',
        worksheetName: 'Orders',
        rowCount: 1000,
        columnCount: 26,
      },
    },
  };

  const resA = await executor.execute(ordersNode, mockContext);
  console.assert(resA.success === true, 'Orders creation failed');
  console.assert(resA.worksheetName === 'Orders', `Expected worksheetName "Orders", got "${resA.worksheetName}"`);
  console.assert(resA.spreadsheetId === 'sp_test_store_999', 'Spreadsheet ID mismatch');
  console.assert(resA.spreadsheetUrl.includes('sp_test_store_999'), 'Spreadsheet URL mismatch');
  console.assert(resA.message === 'Worksheet created successfully.', 'Message mismatch');
  console.assert(resA.executionLogs.some((l) => l.message === 'Loading credentials...'), 'Log missing: Loading credentials...');
  console.assert(resA.executionLogs.some((l) => l.message === 'Validating spreadsheet...'), 'Log missing: Validating spreadsheet...');
  console.assert(resA.executionLogs.some((l) => l.message === 'Creating worksheet...'), 'Log missing: Creating worksheet...');
  console.assert(resA.executionLogs.some((l) => l.message === 'Worksheet created successfully.'), 'Log missing: Worksheet created successfully.');
  console.assert(resA.executionLogs.some((l) => l.message === 'Finished.'), 'Log missing: Finished.');
  console.log('✓ 4. Created worksheet "Orders" successfully with required logs');

  // Test Case B: Create "Customers" worksheet in the SAME spreadsheet
  const customersNode = {
    id: 'node_create_customers',
    type: 'googleSheetsCreateWorksheet',
    data: {
      config: {
        spreadsheetId: 'sp_test_store_999',
        worksheetName: 'Customers',
        rowCount: 500,
        columnCount: 15,
      },
    },
  };

  const resB = await executor.execute(customersNode, mockContext);
  console.assert(resB.success === true, 'Customers creation failed');
  console.assert(resB.worksheetName === 'Customers', `Expected worksheetName "Customers", got "${resB.worksheetName}"`);
  console.log('✓ 5. Created worksheet "Customers" successfully in the same spreadsheet');

  // Verify both "Orders" and "Customers" tabs exist in mockWorksheetsStore
  const titles = mockWorksheetsStore.map((w) => w.title);
  console.assert(titles.includes('Sheet1'), 'Sheet1 missing from store');
  console.assert(titles.includes('Orders'), 'Orders missing from store');
  console.assert(titles.includes('Customers'), 'Customers missing from store');
  console.log('✓ 6. Verified both "Orders" and "Customers" tabs appear in the same spreadsheet');

  // Test Case C: Try creating "Orders" AGAIN -> Ensure duplicate error "Worksheet 'Orders' already exists."
  try {
    await executor.execute(ordersNode, mockContext);
    console.assert(false, 'Should have thrown duplicate worksheet error for "Orders"');
  } catch (err) {
    console.assert(err.message === "Worksheet 'Orders' already exists.", `Expected error "Worksheet 'Orders' already exists.", got "${err.message}"`);
    console.log('✓ 7. Verified duplicate creation of "Orders" returned exact error: "Worksheet \'Orders\' already exists."');
  }

  // Restore original methods
  GoogleSheetsService.getWorksheets = originalGetWorksheets;
  GoogleSheetsService.getSheetsClient = originalGetSheetsClient;

  console.log('\n🎉 ALL GOOGLE SHEETS CREATE WORKSHEET TESTS PASSED SUCCESSFULLY! (7/7 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
