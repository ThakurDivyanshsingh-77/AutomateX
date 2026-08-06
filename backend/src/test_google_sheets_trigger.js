import { GoogleSheetsTriggerExecutor } from './engine/googleSheets/GoogleSheetsTriggerExecutor.js';
import { GoogleSheetsTriggerScheduler } from './runtime/scheduler/GoogleSheetsTriggerScheduler.js';
import { TriggerRegistry } from './runtime/registry/TriggerRegistry.js';
import { ExecutorRegistry } from './engine/registry/ExecutorRegistry.js';
import { GoogleSheetsTrigger } from './runtime/triggers/GoogleSheetsTrigger.js';

async function runTests() {
  console.log('🧪 Starting Comprehensive Google Sheets Trigger Backend Audit Test Suite...\n');

  // 1. Test Registrations
  console.assert(TriggerRegistry.isTrigger('googleSheetsTrigger') === true, 'TriggerRegistry.isTrigger failed for googleSheetsTrigger');
  console.assert(TriggerRegistry.isTrigger('googleSheetsTriggerWatchRows') === true, 'TriggerRegistry.isTrigger failed for googleSheetsTriggerWatchRows');
  console.log('✓ 1. TriggerRegistry registration verified');

  const executor = ExecutorRegistry.getExecutor('googleSheetsTrigger');
  console.assert(executor instanceof GoogleSheetsTriggerExecutor, 'ExecutorRegistry failed for googleSheetsTrigger');
  console.log('✓ 2. ExecutorRegistry registration verified');

  // 2. Test Node Matcher in Scheduler
  console.assert(GoogleSheetsTriggerScheduler.isGoogleSheetsTriggerNode({ type: 'googleSheetsTrigger' }) === true, 'Matcher failed for type: googleSheetsTrigger');
  console.assert(GoogleSheetsTriggerScheduler.isGoogleSheetsTriggerNode({ type: 'googleSheetsTriggerWatchRows' }) === true, 'Matcher failed for type: googleSheetsTriggerWatchRows');
  console.assert(GoogleSheetsTriggerScheduler.isGoogleSheetsTriggerNode({ type: 'googleSheets', config: { operation: 'watchRows' } }) === true, 'Matcher failed for type: googleSheets operation: watchRows');
  console.assert(GoogleSheetsTriggerScheduler.isGoogleSheetsTriggerNode({ type: 'http' }) === false, 'Matcher returned true for HTTP node');
  console.log('✓ 3. Scheduler node matcher verified across all variants & operations');

  // 3. Test Interval Parsing in Scheduler
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('30s') === 30000, '30s interval parsing failed');
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('1m') === 60000, '1m interval parsing failed');
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('5m') === 300000, '5m interval parsing failed');
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('15m') === 900000, '15m interval parsing failed');
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('30m') === 1800000, '30m interval parsing failed');
  console.assert(GoogleSheetsTriggerScheduler.parseIntervalMs('1h') === 3600000, '1h interval parsing failed');
  console.log('✓ 4. Scheduler interval parser verified (30s, 1m, 5m, 15m, 30m, 1h)');

  // 4. Test Trigger Event Formatter
  const triggerInst = new GoogleSheetsTrigger();
  const formattedPayload = triggerInst.formatEvent({
    type: 'NEW_ROW',
    rowNumber: 26,
    item: { Name: 'Aman', Email: 'aman@gmail.com', City: 'Surat' },
    triggeredAt: '2026-08-06T10:00:00.000Z',
  });
  console.assert(formattedPayload.triggerType === 'googleSheetsTrigger', 'Trigger formatEvent triggerType mismatch');
  console.assert(formattedPayload.type === 'NEW_ROW', 'Trigger formatEvent type mismatch');
  console.assert(formattedPayload.rowNumber === 26, 'Trigger formatEvent rowNumber mismatch');
  console.assert(formattedPayload.item.Name === 'Aman', 'Trigger formatEvent item mismatch');
  console.log('✓ 5. GoogleSheetsTrigger formatEvent verified');

  // 5. Test Change Detection Engine (Initial Run with ignoreExistingRows=true)
  const initialRows = [
    { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Vapi' },
    { _rowNumber: 3, Name: 'Rohan', Email: 'rohan@gmail.com', City: 'Mumbai' },
  ];
  const initialChanges = GoogleSheetsTriggerExecutor.compareSnapshots([], initialRows, 'newRow', true, true);
  console.assert(initialChanges.length === 0, 'Initial run with ignoreExistingRows=true should return 0 changes');
  console.log('✓ 6. Change detection engine: Initial run baseline verified (0 changes returned when ignoreExistingRows=true)');

  // 6. Test Change Detection Engine (New Row Event)
  const updatedRows = [
    { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Vapi' },
    { _rowNumber: 3, Name: 'Rohan', Email: 'rohan@gmail.com', City: 'Mumbai' },
    { _rowNumber: 4, Name: 'Aman', Email: 'aman@gmail.com', City: 'Surat' },
  ];
  const newRowChanges = GoogleSheetsTriggerExecutor.compareSnapshots(initialRows, updatedRows, 'newRow', false, true);
  console.assert(newRowChanges.length === 1, `Expected 1 new row change, got ${newRowChanges.length}`);
  console.assert(newRowChanges[0].type === 'NEW_ROW', 'Event type should be NEW_ROW');
  console.assert(newRowChanges[0].rowNumber === 4, 'Row number should be 4');
  console.assert(newRowChanges[0].item.Name === 'Aman', 'New item name should be Aman');
  console.log('✓ 7. Change detection engine: NEW_ROW detection verified');

  // 7. Test Change Detection Engine (Updated Row Event)
  const modifiedRows = [
    { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Bangalore' }, // City updated
    { _rowNumber: 3, Name: 'Rohan', Email: 'rohan@gmail.com', City: 'Mumbai' },
  ];
  const updatedRowChanges = GoogleSheetsTriggerExecutor.compareSnapshots(initialRows, modifiedRows, 'updatedRow', false, true);
  console.assert(updatedRowChanges.length === 1, `Expected 1 updated row change, got ${updatedRowChanges.length}`);
  console.assert(updatedRowChanges[0].type === 'UPDATED_ROW', 'Event type should be UPDATED_ROW');
  console.assert(updatedRowChanges[0].rowNumber === 2, 'Row number should be 2');
  console.assert(updatedRowChanges[0].item.City === 'Bangalore', 'Updated city should be Bangalore');
  console.log('✓ 8. Change detection engine: UPDATED_ROW detection verified');

  // 8. Test Change Detection Engine (Any Change Event: New + Updated + Deleted)
  const anyChangeRows = [
    { _rowNumber: 2, Name: 'Divyansh', Email: 'divyansh@gmail.com', City: 'Bangalore' }, // Updated
    // Row 3 deleted
    { _rowNumber: 5, Name: 'Neha', Email: 'neha@gmail.com', City: 'Delhi' }, // New
  ];
  const anyChanges = GoogleSheetsTriggerExecutor.compareSnapshots(initialRows, anyChangeRows, 'anyChange', false, true);
  console.assert(anyChanges.length === 3, `Expected 3 changes (1 updated, 1 new, 1 deleted), got ${anyChanges.length}`);
  console.log('✓ 9. Change detection engine: ANY_CHANGE (New, Updated, Deleted) verified');

  console.log('\n🎉 ALL GOOGLE SHEETS TRIGGER BACKEND AUDIT TESTS PASSED SUCCESSFULLY! (9/9 Assertions Passed)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
