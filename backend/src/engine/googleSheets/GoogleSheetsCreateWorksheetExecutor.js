import { GoogleSheetsService } from './GoogleSheetsService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GoogleSheetsCreateWorksheetExecutor {
  async execute(node, context) {
    const config = {
      ...(node.data || {}),
      ...(node.data?.config || {}),
      ...(node.config || {}),
    };

    const logs = [];
    const log = (msg) => {
      console.log(msg);
      logs.push({ message: msg, timestamp: new Date().toISOString() });
    };

    const credentialId = config.credentialId;
    const rawSpreadsheetId = config.spreadsheetId || '';
    const rawWorksheetName = config.worksheetName || config.newWorksheetName || config.worksheetTitle || config.title || '';
    const rawRowCount = config.rowCount || 1000;
    const rawColumnCount = config.columnCount || 26;

    let spreadsheetId = rawSpreadsheetId;
    let worksheetName = rawWorksheetName;
    let rowCount = rawRowCount;
    let columnCount = rawColumnCount;

    if (context && typeof context.resolveVariables === 'function') {
      if (rawSpreadsheetId) spreadsheetId = context.resolveVariables(rawSpreadsheetId);
      if (rawWorksheetName) worksheetName = context.resolveVariables(rawWorksheetName);
      if (rawRowCount) rowCount = context.resolveVariables(rawRowCount);
      if (rawColumnCount) columnCount = context.resolveVariables(rawColumnCount);
    } else {
      if (typeof rawSpreadsheetId === 'string' && rawSpreadsheetId.includes('{{')) {
        spreadsheetId = ExpressionEngine.resolve(rawSpreadsheetId, context);
      }
      if (typeof rawWorksheetName === 'string' && rawWorksheetName.includes('{{')) {
        worksheetName = ExpressionEngine.resolve(rawWorksheetName, context);
      }
    }

    const userId = context.userId || context.ownerId;

    if (!spreadsheetId) {
      throw new Error(`Google Sheets Execution Error: Spreadsheet ID is required for node "${node.id}".`);
    }

    if (!worksheetName || !String(worksheetName).trim()) {
      throw new Error(`Google Sheets Execution Error: New Worksheet Name is required for node "${node.id}".`);
    }

    const result = await GoogleSheetsService.createWorksheet({
      credentialId,
      userId,
      spreadsheetId,
      worksheetName: String(worksheetName).trim(),
      rowCount: parseInt(rowCount, 10) || 1000,
      columnCount: parseInt(columnCount, 10) || 26,
      log,
    });

    return {
      ...result,
      executionLogs: logs,
    };
  }
}
