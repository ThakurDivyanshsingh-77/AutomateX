import { google } from 'googleapis';
import { googleOAuthClient } from '../../oauth/GoogleOAuthClient.js';
import { credentialService } from '../../credentials/credentialService.js';

export class GoogleSheetsService {
  /**
   * Helper to construct authenticated Google client from credential ID or raw OAuth data
   */
  static async getAuthClient(credentialId, userId = null) {
    let oauthData = null;

    console.log(`[GoogleSheetsService] 🔐 Resolving Google Auth Client for Credential ID: ${credentialId || 'default'}, User ID: ${userId}`);
    if (credentialId) {
      const cred = await credentialService.getCredentialById(credentialId, userId);
      if (cred) {
        oauthData = cred.data || cred;
        console.log(`[GoogleSheetsService] 💳 Credential loaded successfully. Access Token Present: ${!!oauthData.accessToken}, Refresh Token Present: ${!!oauthData.refreshToken}, Expiry Date: ${oauthData.expiryDate || 'N/A'}`);
      }
    }

    if (!oauthData || (!oauthData.refreshToken && !oauthData.accessToken)) {
      console.warn(`[GoogleSheetsService] ⚠️ No database OAuth token found. Falling back to environment variables.`);
      oauthData = {
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      };
    }

    return await googleOAuthClient.getAuthenticatedClient(oauthData);
  }

  /**
   * Helper to get Google Sheets API v4 instance
   */
  static async getSheetsClient(credentialId, userId = null) {
    const auth = await this.getAuthClient(credentialId, userId);
    return google.sheets({ version: 'v4', auth });
  }

  /**
   * Helper to get Google Drive API v3 instance
   */
  static async getDriveClient(credentialId, userId = null) {
    const auth = await this.getAuthClient(credentialId, userId);
    return google.drive({ version: 'v3', auth });
  }

  /**
   * List all Google Spreadsheets from Google Drive API
   */
  static async listSpreadsheets({ credentialId, userId, query = '' }) {
    console.log(`[GoogleSheetsService] 🔍 Drive listSpreadsheets requested for User ID: ${userId}, Credential ID: ${credentialId || 'default'}`);
    try {
      const drive = await this.getDriveClient(credentialId, userId);

      let mimeQuery = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
      if (query) {
        mimeQuery += ` and name contains '${query.replace(/'/g, "\\'")}'`;
      }

      console.log(`[GoogleSheetsService] 📤 Executing Google Drive files.list (query: "${mimeQuery}")`);
      const response = await drive.files.list({
        q: mimeQuery,
        fields: 'files(id, name, modifiedTime, thumbnailLink, webViewLink)',
        pageSize: 100,
        orderBy: 'modifiedTime desc',
      });

      const sheets = (response.data.files || []).map((file) => ({
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      }));

      console.log(`[GoogleSheetsService] ✅ Retrieved ${sheets.length} spreadsheet(s) from Google Drive API`);
      return sheets;
    } catch (err) {
      console.error(`[GoogleSheetsService] ❌ Google Drive API listSpreadsheets failed: ${err.message}`, err.stack);
      return [];
    }
  }

  /**
   * Get Worksheets (Sheet Tabs) for a given Spreadsheet
   */
  static async getWorksheets({ credentialId, userId, spreadsheetId }) {
    console.log(`[GoogleSheetsService] 🔍 getWorksheets requested for Spreadsheet ID: ${spreadsheetId}, User ID: ${userId}, Credential ID: ${credentialId || 'default'}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required to fetch worksheets');
    }

    try {
      const sheets = await this.getSheetsClient(credentialId, userId);

      console.log(`[GoogleSheetsService] 📤 Executing Google Sheets API spreadsheets.get for ID: ${spreadsheetId}`);
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(sheetId, title, index, gridProperties))',
      });

      const rawSheets = response.data.sheets || [];
      console.log(`[GoogleSheetsService] 📥 Received ${rawSheets.length} sheet tab(s) from Google Sheets API`);

      if (rawSheets.length === 0) {
        console.warn(`[GoogleSheetsService] ⚠️ Google Sheets API returned 0 worksheets for spreadsheet: ${spreadsheetId}`);
      }

      const worksheets = rawSheets.map((s) => ({
        id: s.properties.sheetId,
        sheetId: s.properties.sheetId,
        title: s.properties.title,
        index: s.properties.index,
        rowCount: s.properties.gridProperties?.rowCount || 0,
        columnCount: s.properties.gridProperties?.columnCount || 0,
      }));

      return worksheets;
    } catch (err) {
      console.warn(`[GoogleSheetsService] ⚠️ Google Sheets API getWorksheets warning for ${spreadsheetId}: ${err.message}`);
      // Return default Sheet1 tab fallback cleanly instead of throwing error to toast listener
      return [
        { id: 0, sheetId: 0, title: 'Sheet1', index: 0, rowCount: 100, columnCount: 26 }
      ];
    }
  }

  /**
   * Automatically Read Header Columns from First Row of Worksheet
   */
  static async getHeaders({ credentialId, userId, spreadsheetId, worksheetTitle = 'Sheet1', headerRow = 1 }) {
    const sheets = await this.getSheetsClient(credentialId, userId);

    const rowNum = Math.max(1, parseInt(headerRow || 1, 10));
    const range = `'${worksheetTitle}'!A${rowNum}:ZZ${rowNum}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const headerValues = response.data.values?.[0] || [];
    return headerValues.map((h, idx) => (h && String(h).trim() ? String(h).trim() : `Column_${idx + 1}`));
  }

  /**
   * Read Rows with Limit, Offset, Filtering, and Header mapping
   */
  static async readRows({ credentialId, userId, spreadsheetId, worksheetTitle = 'Sheet1', headerRow = 1, limit = 0, offset = 0, filterEmpty = true }) {
    const sheets = await this.getSheetsClient(credentialId, userId);
    const range = `'${worksheetTitle}'!A1:ZZ100000`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rawValues = response.data.values || [];
    if (rawValues.length === 0) {
      return { success: true, spreadsheetId, worksheet: worksheetTitle, rowsAffected: 0, rows: [] };
    }

    const headersIndex = Math.max(0, parseInt(headerRow || 1, 10) - 1);
    const headers = (rawValues[headersIndex] || []).map((h, idx) => (h && String(h).trim() ? String(h).trim() : `Column_${idx + 1}`));
    const dataRows = rawValues.slice(headersIndex + 1);

    let rows = dataRows.map((row, rIdx) => {
      const rowObj = { _rowNumber: headersIndex + 2 + rIdx };
      headers.forEach((h, cIdx) => {
        rowObj[h] = row[cIdx] !== undefined ? row[cIdx] : '';
      });
      return rowObj;
    });

    if (filterEmpty) {
      rows = rows.filter((r) => Object.entries(r).some(([k, v]) => k !== '_rowNumber' && String(v).trim().length > 0));
    }

    if (offset > 0) rows = rows.slice(offset);
    if (limit > 0) rows = rows.slice(0, limit);

    return {
      success: true,
      spreadsheetId,
      worksheet: worksheetTitle,
      rowsAffected: rows.length,
      totalRows: rows.length,
      rows,
      headers,
    };
  }

  /**
   * Append Row using Column Mappings object
   */
  static async appendRow({ credentialId, userId, spreadsheetId, worksheetTitle = 'Sheet1', columnsMap = {} }) {
    const headers = await this.getHeaders({ credentialId, userId, spreadsheetId, worksheetTitle });
    const sheets = await this.getSheetsClient(credentialId, userId);

    // Build row array in correct column order matching sheet headers
    const rowValues = headers.map((header) => {
      return columnsMap[header] !== undefined ? columnsMap[header] : '';
    });

    const range = `'${worksheetTitle}'!A1`;
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    const updatedRange = response.data.updates?.updatedRange || '';
    const match = updatedRange.match(/!A?(\d+)/);
    const rowNumber = match ? parseInt(match[1], 10) : null;

    return {
      success: true,
      spreadsheetId,
      worksheet: worksheetTitle,
      rowsAffected: 1,
      rowNumber,
      values: columnsMap,
    };
  }

  /**
   * Update Row by Row Number or Search Column Value
   */
  static async updateRow({ credentialId, userId, spreadsheetId, worksheetTitle = 'Sheet1', rowNumber, searchColumn, searchValue, columnsMap = {} }) {
    console.log(`[GoogleSheetsService] ✏️ updateRow requested for Spreadsheet: ${spreadsheetId}, Sheet: ${worksheetTitle}, RowNum: ${rowNumber}`);

    const headers = await this.getHeaders({ credentialId, userId, spreadsheetId, worksheetTitle });
    let targetRow = rowNumber !== undefined && rowNumber !== null ? parseInt(rowNumber, 10) : null;

    if (!targetRow && searchColumn && searchValue) {
      const findResult = await this.findRow({ credentialId, userId, spreadsheetId, worksheetTitle, searchColumn, searchValue, matchType: 'equals' });
      if (findResult.foundRow) {
        targetRow = findResult.foundRow._rowNumber;
      }
    }

    if (!targetRow || isNaN(targetRow) || targetRow < 1) {
      throw new Error(`Row to update could not be identified (valid Row Number >= 1 required). Received: ${rowNumber}`);
    }

    const sheets = await this.getSheetsClient(credentialId, userId);

    // Read existing row values first to preserve unmapped columns
    const existingRange = `'${worksheetTitle}'!A${targetRow}:ZZ${targetRow}`;
    let existingRow = [];
    try {
      const existingRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: existingRange });
      existingRow = existingRes.data.values?.[0] || [];
    } catch (err) {
      console.warn(`[GoogleSheetsService] ⚠️ Unable to read existing row ${targetRow}: ${err.message}`);
    }

    // Build updated row vector preserving unmapped columns
    const updatedRow = headers.map((header, idx) => {
      if (columnsMap[header] !== undefined) return columnsMap[header];
      return existingRow[idx] !== undefined ? existingRow[idx] : '';
    });

    const updateRange = `'${worksheetTitle}'!A${targetRow}`;
    console.log(`[GoogleSheetsService] 📤 Executing spreadsheets.values.update on range: ${updateRange}`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    // Build resulting value object matching header names
    const finalValuesObj = {};
    headers.forEach((h, idx) => {
      finalValuesObj[h] = updatedRow[idx] !== undefined ? updatedRow[idx] : '';
    });

    console.log(`[GoogleSheetsService] ✅ Row ${targetRow} updated successfully`);
    return {
      success: true,
      updatedRow: targetRow,
      rowNumber: targetRow,
      spreadsheetId,
      worksheet: worksheetTitle,
      rowsAffected: 1,
      values: finalValuesObj,
      updatedValues: columnsMap,
      item: { _rowNumber: targetRow, ...finalValuesObj },
    };
  }

  /**
   * Find Row by Condition (equals, contains, startsWith, endsWith, regex)
   * Supports returnMode ('first', 'all'), limit, and caseSensitive
   */
  static async findRow({
    credentialId,
    userId,
    spreadsheetId,
    worksheetTitle = 'Sheet1',
    searchColumn,
    searchValue,
    matchType = 'equals',
    returnMode = 'first',
    limit = 1,
    caseSensitive = false,
  }) {
    console.log(`[GoogleSheetsService] 🔍 findRow requested for Spreadsheet: ${spreadsheetId}, Sheet: ${worksheetTitle}, Col: ${searchColumn}, Val: ${searchValue}, Match: ${matchType}, Mode: ${returnMode}`);

    const readResult = await this.readRows({ credentialId, userId, spreadsheetId, worksheetTitle, filterEmpty: false });
    const rows = readResult.rows || [];

    if (!searchColumn) {
      throw new Error('Search column is required for Find Row operation');
    }

    const targetValStr = searchValue !== undefined && searchValue !== null ? String(searchValue) : '';
    const matchVal = caseSensitive ? targetValStr : targetValStr.toLowerCase();

    const matchedRows = rows.filter((r) => {
      const cellValRaw = r[searchColumn] !== undefined && r[searchColumn] !== null ? String(r[searchColumn]) : '';
      const cellVal = caseSensitive ? cellValRaw : cellValRaw.toLowerCase();

      switch (matchType) {
        case 'contains':
          return cellVal.includes(matchVal);
        case 'startsWith':
          return cellVal.startsWith(matchVal);
        case 'endsWith':
          return cellVal.endsWith(matchVal);
        case 'regex':
          return new RegExp(targetValStr, caseSensitive ? '' : 'i').test(cellValRaw);
        case 'equals':
        default:
          return cellVal === matchVal;
      }
    });

    console.log(`[GoogleSheetsService] 🔎 findRow found ${matchedRows.length} matching row(s)`);

    if (returnMode === 'all') {
      const parsedLimit = parseInt(limit, 10);
      const maxLimit = parsedLimit > 0 ? parsedLimit : matchedRows.length;
      const finalRows = matchedRows.slice(0, maxLimit);
      return {
        success: finalRows.length > 0,
        spreadsheetId,
        worksheet: worksheetTitle,
        count: finalRows.length,
        rows: finalRows,
        foundRow: finalRows[0] || null,
        rowNumber: finalRows[0] ? finalRows[0]._rowNumber : null,
        values: finalRows[0] || null,
        item: finalRows[0] || null,
      };
    }

    // Default returnMode === 'first'
    const firstMatch = matchedRows[0] || null;
    return {
      success: !!firstMatch,
      spreadsheetId,
      worksheet: worksheetTitle,
      count: firstMatch ? 1 : 0,
      foundRow: firstMatch,
      rowNumber: firstMatch ? firstMatch._rowNumber : null,
      values: firstMatch || null,
      item: firstMatch || null,
      rows: firstMatch ? [firstMatch] : [],
      message: firstMatch ? 'Matching row found.' : 'No matching row found.',
    };
  }

  /**
   * Clear Range / Row
   */
  static async clearRows({ credentialId, userId, spreadsheetId, worksheetTitle = 'Sheet1', range = 'A2:ZZ100' }) {
    const sheets = await this.getSheetsClient(credentialId, userId);
    const fullRange = `'${worksheetTitle}'!${range}`;

    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: fullRange,
    });

    return {
      success: true,
      spreadsheetId,
      worksheet: worksheetTitle,
      rowsAffected: 1,
      clearedRange: response.data.clearedRange,
    };
  }
}
