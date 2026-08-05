import { GoogleSheetsService } from './GoogleSheetsService.js';
import { credentialVaultService } from '../../services/CredentialVaultService.js';

export class GoogleSheetsExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const operation = config.operation || 'readRows';

    // 1. Resolve Credential
    const credentialId = config.credentialId;
    let oauthData = null;

    if (credentialId) {
      const cred = await credentialVaultService.getCredentialById(credentialId, context.userId);
      if (cred && cred.data) {
        oauthData = cred.data;
      }
    }

    if (!oauthData) {
      // Fallback to environment credentials if available
      oauthData = {
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      };
    }

    const spreadsheetId = config.spreadsheetId;
    const range = config.range || 'Sheet1!A1:Z100';

    const startTime = Date.now();
    let result = null;

    switch (operation) {
      case 'readRows':
        result = await GoogleSheetsService.readRows({
          oauthData,
          spreadsheetId,
          range,
          headerRow: config.headerRow || 1,
          limit: config.limit || 0,
          offset: config.offset || 0,
          filterEmpty: config.filterEmpty !== false,
        });
        break;

      case 'appendRow':
        const rowValues = Array.isArray(config.values) ? config.values : Object.values(config.values || {});
        result = await GoogleSheetsService.appendRow({
          oauthData,
          spreadsheetId,
          range,
          values: rowValues,
        });
        break;

      case 'updateRow':
        const updateValues = Array.isArray(config.values) ? config.values : Object.values(config.values || {});
        result = await GoogleSheetsService.updateRow({
          oauthData,
          spreadsheetId,
          range: config.targetRange || range,
          values: updateValues,
        });
        break;

      case 'clearRange':
        result = await GoogleSheetsService.clearRange({
          oauthData,
          spreadsheetId,
          range,
        });
        break;

      case 'createSpreadsheet':
        result = await GoogleSheetsService.createSpreadsheet({
          oauthData,
          title: config.title || 'New Workflow Spreadsheet',
          sheetName: config.sheetName || 'Sheet1',
        });
        break;

      case 'createWorksheet':
        result = await GoogleSheetsService.createWorksheet({
          oauthData,
          spreadsheetId,
          title: config.sheetName || 'Worksheet',
        });
        break;

      default:
        throw new Error(`Unsupported Google Sheets operation: '${operation}'`);
    }

    const executionTime = Date.now() - startTime;

    return {
      output: {
        success: true,
        affectedRows: result.affectedRows || result.rows?.length || 0,
        executionTime,
        spreadsheetId,
        sheetId: result.sheetId || '',
        rows: result.rows || [],
        ...result,
      },
    };
  }
}
