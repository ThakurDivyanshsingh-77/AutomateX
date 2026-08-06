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

    const rawTitle = config.title || config.spreadsheetName || config.name || '';
    const rawWorksheet = config.worksheetTitle || config.worksheet || config.initialWorksheetName || 'Sheet1';

    // Resolve dynamic expressions (e.g. {{steps.http.title}}, {{now}}) using ExpressionEngine
    let title = rawTitle;
    let worksheetTitle = rawWorksheet;

    if (context && typeof context.resolveVariables === 'function') {
      title = context.resolveVariables(rawTitle);
      worksheetTitle = context.resolveVariables(rawWorksheet);
    } else if (typeof rawTitle === 'string' && rawTitle.includes('{{')) {
      title = ExpressionEngine.resolve(rawTitle, context);
    }

    if (typeof rawWorksheet === 'string' && rawWorksheet.includes('{{')) {
      worksheetTitle = ExpressionEngine.resolve(rawWorksheet, context);
    }

    title = title || rawTitle;
    worksheetTitle = worksheetTitle || rawWorksheet || 'Sheet1';

    const credentialId = config.credentialId;
    const userId = context.userId || context.ownerId;

    if (!title || !String(title).trim()) {
      throw new Error(`Google Sheets Execution Error: Spreadsheet Name (title) is required for node "${node.id}".`);
    }

    const result = await GoogleSheetsService.createSpreadsheet({
      credentialId,
      userId,
      title,
      worksheetTitle,
      log,
    });

    return {
      ...result,
      executionLogs: logs,
    };
  }
}
