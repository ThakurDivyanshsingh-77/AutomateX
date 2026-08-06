import { GoogleSheetsService } from './GoogleSheetsService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GoogleSheetsCreateSpreadsheetExecutor {
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

    // Spreadsheet file title MUST come strictly from spreadsheetName or title or name
    const rawSpreadsheetName = (config.spreadsheetName !== undefined && config.spreadsheetName !== '')
      ? config.spreadsheetName
      : (config.title !== undefined ? config.title : (config.name || ''));

    // Initial worksheet tab title MUST come strictly from initialWorksheetName or worksheetTitle or worksheet
    const rawWorksheetName = (config.initialWorksheetName !== undefined && config.initialWorksheetName !== '')
      ? config.initialWorksheetName
      : (config.worksheetTitle !== undefined && config.worksheetTitle !== ''
          ? config.worksheetTitle
          : (config.worksheet !== undefined && config.worksheet !== '' ? config.worksheet : 'Sheet1'));

    let spreadsheetName = rawSpreadsheetName;
    let initialWorksheetName = rawWorksheetName;

    // Resolve expressions independently
    if (context && typeof context.resolveVariables === 'function') {
      if (rawSpreadsheetName) spreadsheetName = context.resolveVariables(rawSpreadsheetName);
      if (rawWorksheetName) initialWorksheetName = context.resolveVariables(rawWorksheetName);
    } else {
      if (typeof rawSpreadsheetName === 'string' && rawSpreadsheetName.includes('{{')) {
        spreadsheetName = ExpressionEngine.resolve(rawSpreadsheetName, context);
      }
      if (typeof rawWorksheetName === 'string' && rawWorksheetName.includes('{{')) {
        initialWorksheetName = ExpressionEngine.resolve(rawWorksheetName, context);
      }
    }

    spreadsheetName = String(spreadsheetName || rawSpreadsheetName || '').trim();
    initialWorksheetName = String(initialWorksheetName || rawWorksheetName || '').trim() || 'Sheet1';

    const credentialId = config.credentialId;
    const userId = context.userId || context.ownerId;

    if (!spreadsheetName) {
      throw new Error(`Google Sheets Execution Error: Spreadsheet Name is required for node "${node.id}".`);
    }

    const result = await GoogleSheetsService.createSpreadsheet({
      credentialId,
      userId,
      spreadsheetName,
      title: spreadsheetName,
      initialWorksheetName,
      worksheetTitle: initialWorksheetName,
      log,
    });

    return {
      ...result,
      executionLogs: logs,
    };
  }
}
