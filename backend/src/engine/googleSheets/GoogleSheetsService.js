import { google } from 'googleapis';
import { googleOAuthClient } from '../../oauth/GoogleOAuthClient.js';
import { RetryEngine } from '../retry/RetryEngine.js';

export class GoogleSheetsService {
  /**
   * Helper to construct authenticated Google Sheets API client
   */
  static async getSheetsClient(oauthData) {
    const authClient = await googleOAuthClient.getAuthenticatedClient(oauthData);
    return google.sheets({ version: 'v4', auth: authClient });
  }

  /**
   * Read Rows from Spreadsheet
   */
  static async readRows({ oauthData, spreadsheetId, range = 'A1:Z100', headerRow = 1, filterEmpty = true, limit = 0, offset = 0 }) {
    const sheets = await this.getSheetsClient(oauthData);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rawValues = response.data.values || [];
    if (rawValues.length === 0) return { rows: [], totalRows: 0 };

    const headersIndex = Math.max(0, parseInt(headerRow || 1, 10) - 1);
    const headers = rawValues[headersIndex] || [];
    const dataRows = rawValues.slice(headersIndex + 1);

    let rows = dataRows.map((row, rIdx) => {
      const rowObj = { _rowNumber: headersIndex + 2 + rIdx };
      headers.forEach((h, cIdx) => {
        rowObj[h || `Column_${cIdx + 1}`] = row[cIdx] !== undefined ? row[cIdx] : '';
      });
      return rowObj;
    });

    if (filterEmpty) {
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).trim().length > 0));
    }

    if (offset > 0) {
      rows = rows.slice(offset);
    }

    if (limit > 0) {
      rows = rows.slice(0, limit);
    }

    return {
      success: true,
      affectedRows: rows.length,
      totalRows: rows.length,
      rows,
      headers,
    };
  }

  /**
   * Append Row to Spreadsheet
   */
  static async appendRow({ oauthData, spreadsheetId, range = 'Sheet1!A1', values = [] }) {
    const sheets = await this.getSheetsClient(oauthData);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    const updatedRange = response.data.updates?.updatedRange || '';
    const updatedRows = response.data.updates?.updatedRows || 1;

    return {
      success: true,
      affectedRows: updatedRows,
      updatedRange,
    };
  }

  /**
   * Update Row in Spreadsheet
   */
  static async updateRow({ oauthData, spreadsheetId, range, values = [] }) {
    const sheets = await this.getSheetsClient(oauthData);

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    return {
      success: true,
      affectedRows: response.data.updatedRows || 1,
      updatedRange: response.data.updatedRange,
    };
  }

  /**
   * Delete / Clear Row in Spreadsheet
   */
  static async clearRange({ oauthData, spreadsheetId, range }) {
    const sheets = await this.getSheetsClient(oauthData);

    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return {
      success: true,
      clearedRange: response.data.clearedRange,
    };
  }

  /**
   * Create Spreadsheet
   */
  static async createSpreadsheet({ oauthData, title = 'Untitled Spreadsheet', sheetName = 'Sheet1' }) {
    const sheets = await this.getSheetsClient(oauthData);

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: sheetName,
            },
          },
        ],
      },
    });

    return {
      success: true,
      spreadsheetId: response.data.spreadsheetId,
      spreadsheetUrl: response.data.spreadsheetUrl,
    };
  }

  /**
   * Create Worksheet inside existing Spreadsheet
   */
  static async createWorksheet({ oauthData, spreadsheetId, title = 'New Sheet' }) {
    const sheets = await this.getSheetsClient(oauthData);

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    });

    const reply = response.data.replies?.[0]?.addSheet;

    return {
      success: true,
      sheetId: reply?.properties?.sheetId,
      title: reply?.properties?.title,
    };
  }
}
