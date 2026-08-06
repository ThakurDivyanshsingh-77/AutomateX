import { GoogleSheetsService } from './GoogleSheetsService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class GoogleSheetsGetSpreadsheetInfoExecutor {
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

    let spreadsheetId = rawSpreadsheetId;

    if (context && typeof context.resolveVariables === 'function') {
      if (rawSpreadsheetId) spreadsheetId = context.resolveVariables(rawSpreadsheetId);
    } else {
      if (typeof rawSpreadsheetId === 'string' && rawSpreadsheetId.includes('{{')) {
        spreadsheetId = ExpressionEngine.resolve(rawSpreadsheetId, context);
      }
    }

    const userId = context?.userId || context?.ownerId;

    if (!spreadsheetId) {
      throw new Error(`Google Sheets Execution Error: Spreadsheet selection is required for node "${node.id}".`);
    }

    const result = await GoogleSheetsService.getSpreadsheetInfo({
      credentialId,
      userId,
      spreadsheetId: String(spreadsheetId).trim(),
      bypassCache: true,
      log,
    });

    return {
      ...result,
      executionLogs: logs,
    };
  }
}
