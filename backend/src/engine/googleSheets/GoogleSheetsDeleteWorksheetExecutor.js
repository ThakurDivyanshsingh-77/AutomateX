import { GoogleSheetsService } from './GoogleSheetsService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GoogleSheetsDeleteWorksheetExecutor {
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
    const rawWorksheetTitle = config.worksheetTitle || config.worksheetName || config.worksheet || '';

    let spreadsheetId = rawSpreadsheetId;
    let worksheetTitle = rawWorksheetTitle;

    if (context && typeof context.resolveVariables === 'function') {
      if (rawSpreadsheetId) spreadsheetId = context.resolveVariables(rawSpreadsheetId);
      if (rawWorksheetTitle) worksheetTitle = context.resolveVariables(rawWorksheetTitle);
    } else {
      if (typeof rawSpreadsheetId === 'string' && rawSpreadsheetId.includes('{{')) {
        spreadsheetId = ExpressionEngine.resolve(rawSpreadsheetId, context);
      }
      if (typeof rawWorksheetTitle === 'string' && rawWorksheetTitle.includes('{{')) {
        worksheetTitle = ExpressionEngine.resolve(rawWorksheetTitle, context);
      }
    }

    const userId = context.userId || context.ownerId;

    if (!spreadsheetId) {
      throw new Error(`Google Sheets Execution Error: Spreadsheet selection is required for node "${node.id}".`);
    }

    if (!worksheetTitle || !String(worksheetTitle).trim()) {
      throw new Error(`Google Sheets Execution Error: Worksheet selection is required for node "${node.id}".`);
    }

    const result = await GoogleSheetsService.deleteWorksheet({
      credentialId,
      userId,
      spreadsheetId,
      worksheetTitle: String(worksheetTitle).trim(),
      log,
    });

    return {
      ...result,
      executionLogs: logs,
    };
  }
}
