import { GoogleSheetsService } from './GoogleSheetsService.js';
import { TriggerSnapshot } from '../../models/TriggerSnapshot.js';
import mongoose from 'mongoose';

export class GoogleSheetsTriggerExecutor {
  /**
   * Compare previous snapshot rows against latest fetched rows to detect changes
   * 
   * @param {Array} previousRows - Cached previous rows from DB snapshot
   * @param {Array} currentRows - Freshly fetched rows from Google Sheets
   * @param {string} triggerEvent - 'newRow' | 'updatedRow' | 'anyChange'
   * @param {boolean} isInitialRun - True if no previous snapshot existed
   * @param {boolean} ignoreExistingRows - Default true
   * @returns {Array} List of detected change payloads
   */
  static compareSnapshots(previousRows = [], currentRows = [], triggerEvent = 'newRow', isInitialRun = false, ignoreExistingRows = true) {
    const timestamp = new Date().toISOString();
    const eventType = (triggerEvent || 'newRow').toLowerCase();

    // Initial run handling
    if (isInitialRun) {
      if (ignoreExistingRows) {
        console.log(`[GoogleSheetsTriggerExecutor] ℹ️ Initial poll with ignoreExistingRows=true. Baseline saved with ${currentRows.length} rows. No workflow triggered.`);
        return [];
      } else {
        console.log(`[GoogleSheetsTriggerExecutor] ℹ️ Initial poll with ignoreExistingRows=false. Returning all ${currentRows.length} rows as NEW_ROW events.`);
        return currentRows.map((row) => ({
          type: 'NEW_ROW',
          rowNumber: row._rowNumber || 1,
          item: row,
          triggeredAt: timestamp,
        }));
      }
    }

    const prevMap = new Map();
    let maxPrevRow = 0;
    (previousRows || []).forEach((r) => {
      const rNum = Number(r._rowNumber);
      if (rNum) {
        prevMap.set(rNum, r);
        if (rNum > maxPrevRow) maxPrevRow = rNum;
      }
    });

    const changes = [];

    // Helper to check if two row objects are content-equal (ignoring _rowNumber)
    const isRowModified = (prevRow, currRow) => {
      if (!prevRow || !currRow) return true;
      const keys = new Set([...Object.keys(prevRow), ...Object.keys(currRow)]);
      for (const k of keys) {
        if (k === '_rowNumber') continue;
        const val1 = String(prevRow[k] !== undefined ? prevRow[k] : '').trim();
        const val2 = String(currRow[k] !== undefined ? currRow[k] : '').trim();
        if (val1 !== val2) return true;
      }
      return false;
    };

    if (eventType === 'newrow' || eventType === 'new_row') {
      // Return only newly added rows (row numbers higher than max previous or not in prevMap)
      currentRows.forEach((row) => {
        const rNum = Number(row._rowNumber);
        if (!prevMap.has(rNum) || rNum > maxPrevRow) {
          changes.push({
            type: 'NEW_ROW',
            rowNumber: rNum,
            item: row,
            triggeredAt: timestamp,
          });
        }
      });
    } else if (eventType === 'updatedrow' || eventType === 'updated_row') {
      // Compare existing rows by row number
      currentRows.forEach((row) => {
        const rNum = Number(row._rowNumber);
        if (prevMap.has(rNum)) {
          const prevRow = prevMap.get(rNum);
          if (isRowModified(prevRow, row)) {
            changes.push({
              type: 'UPDATED_ROW',
              rowNumber: rNum,
              item: row,
              previousItem: prevRow,
              triggeredAt: timestamp,
            });
          }
        }
      });
    } else if (eventType === 'anychange' || eventType === 'any_change') {
      const currMap = new Map();
      currentRows.forEach((row) => {
        const rNum = Number(row._rowNumber);
        currMap.set(rNum, row);

        if (!prevMap.has(rNum) || rNum > maxPrevRow) {
          // New row
          changes.push({
            type: 'NEW_ROW',
            rowNumber: rNum,
            item: row,
            triggeredAt: timestamp,
          });
        } else {
          // Check for update
          const prevRow = prevMap.get(rNum);
          if (isRowModified(prevRow, row)) {
            changes.push({
              type: 'UPDATED_ROW',
              rowNumber: rNum,
              item: row,
              previousItem: prevRow,
              triggeredAt: timestamp,
            });
          }
        }
      });

      // Check for deleted rows
      prevMap.forEach((prevRow, rNum) => {
        if (!currMap.has(rNum)) {
          changes.push({
            type: 'ROW_DELETED',
            rowNumber: rNum,
            item: prevRow,
            triggeredAt: timestamp,
          });
        }
      });
    }

    return changes;
  }

  /**
   * Execute live polling tick for a specific trigger node instance
   */
  static async pollTrigger({ workflowId, nodeId, config, userId }) {
    const startTime = Date.now();
    const {
      credentialId,
      spreadsheetId,
      worksheetTitle = 'Sheet1',
      triggerEvent = 'newRow',
      ignoreExistingRows = true,
      maxRows = 100,
    } = config;

    console.log(`[GoogleSheetsTriggerExecutor] 📊 Poll Started | Spreadsheet: ${spreadsheetId} | Worksheet: ${worksheetTitle} | Event: ${triggerEvent} | Workflow: ${workflowId}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Google Sheets Trigger');
    }

    // 1. Fetch current rows from Google Sheets API
    const readResult = await GoogleSheetsService.readRows({
      credentialId,
      userId,
      spreadsheetId,
      worksheetTitle,
      limit: parseInt(maxRows, 10) || 100,
      filterEmpty: true,
    });

    const currentRows = readResult.rows || [];
    console.log(`[GoogleSheetsTriggerExecutor] 📥 Fetched ${currentRows.length} current row(s) from Google Sheets`);

    // 2. Load previous DB snapshot
    let isInitialRun = false;
    let previousRows = [];
    const isValidWorkflowId = workflowId && mongoose.Types.ObjectId.isValid(workflowId);

    if (isValidWorkflowId && mongoose.connection.readyState === 1) {
      const existingSnapshot = await TriggerSnapshot.findOne({ workflowId, nodeId }).lean();
      if (!existingSnapshot) {
        isInitialRun = true;
        console.log(`[GoogleSheetsTriggerExecutor] 🆕 No previous snapshot found for (Workflow: ${workflowId}, Node: ${nodeId}). Marking as Initial Run.`);
      } else {
        previousRows = existingSnapshot.rows || [];
      }
    } else {
      isInitialRun = true;
    }

    // 3. Perform Change Detection
    const changes = this.compareSnapshots(
      previousRows,
      currentRows,
      triggerEvent,
      isInitialRun,
      ignoreExistingRows
    );

    const executionTime = Date.now() - startTime;
    console.log(`[GoogleSheetsTriggerExecutor] 🔍 Changes Detected: ${changes.length} | Rows Before: ${previousRows.length} | Rows After: ${currentRows.length} | Exec Time: ${executionTime}ms`);

    // 4. Update or save persistent DB Snapshot
    if (isValidWorkflowId && nodeId && mongoose.connection.readyState === 1) {
      await TriggerSnapshot.findOneAndUpdate(
        { workflowId, nodeId },
        {
          workflowId,
          nodeId,
          spreadsheetId,
          worksheetTitle,
          triggerEvent,
          rowCount: currentRows.length,
          rows: currentRows,
          lastPolledAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`[GoogleSheetsTriggerExecutor] 💾 Updated DB TriggerSnapshot for (Workflow: ${workflowId}, Node: ${nodeId})`);
    }

    return {
      success: true,
      changesDetected: changes.length,
      changes,
      rowsBefore: previousRows.length,
      rowsAfter: currentRows.length,
      executionTime,
    };
  }

  /**
   * Handle "Test Trigger" button call from UI
   */
  static async executeTest({ credentialId, spreadsheetId, worksheetTitle = 'Sheet1', userId, workflowId, nodeId }) {
    console.log(`[GoogleSheetsTriggerExecutor] 🧪 Executing Test Trigger for Spreadsheet: ${spreadsheetId}, Worksheet: ${worksheetTitle}, WorkflowId: ${workflowId || 'N/A'}, NodeId: ${nodeId || 'N/A'}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Test Trigger');
    }

    const readResult = await GoogleSheetsService.readRows({
      credentialId,
      userId,
      spreadsheetId,
      worksheetTitle,
      limit: 100,
      filterEmpty: true,
    });

    const rows = readResult.rows || [];
    const isValidWorkflowId = workflowId && mongoose.Types.ObjectId.isValid(workflowId);

    // Optional snapshot save if valid workflowId and nodeId are present
    if (isValidWorkflowId && nodeId && mongoose.connection.readyState === 1) {
      await TriggerSnapshot.findOneAndUpdate(
        { workflowId, nodeId },
        {
          workflowId,
          nodeId,
          spreadsheetId,
          worksheetTitle,
          rowCount: rows.length,
          rows,
          lastPolledAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`[GoogleSheetsTriggerExecutor] 💾 Saved baseline snapshot for Workflow: ${workflowId}, Node: ${nodeId}`);
    } else {
      console.log(`[GoogleSheetsTriggerExecutor] ℹ️ Tested trigger cleanly (${rows.length} rows found). Snapshot DB save skipped (Workflow is draft or has temporary ID).`);
    }

    return {
      success: true,
      rows: rows.length,
      snapshotSaved: true,
      sampleData: rows.slice(0, 3),
      headers: readResult.headers || [],
    };
  }

  /**
   * Node Executor interface for graph workflow execution engine
   */
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const triggerData = context.triggerEvent || context.input || {};

    return {
      type: triggerData.type || 'NEW_ROW',
      rowNumber: triggerData.rowNumber || 1,
      item: triggerData.item || {},
      triggeredAt: triggerData.triggeredAt || new Date().toISOString(),
      config,
    };
  }
}
