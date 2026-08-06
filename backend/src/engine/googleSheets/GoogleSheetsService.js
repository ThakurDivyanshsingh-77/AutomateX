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
   * Delete Row by rowNumber or Mapped Column Criteria
   * Uses Google Sheets API batchUpdate with deleteDimension (zero-indexed)
   */
  static async deleteRow({
    credentialId,
    userId,
    spreadsheetId,
    worksheetTitle = 'Sheet1',
    rowNumber,
    searchColumn,
    searchValue,
    columnsMap = {},
  }) {
    console.log(`[GoogleSheetsService] 🗑️ deleteRow requested for Spreadsheet: ${spreadsheetId}, Sheet: ${worksheetTitle}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Delete Row operation.');
    }

    const readResult = await this.readRows({ credentialId, userId, spreadsheetId, worksheetTitle, filterEmpty: false });
    const rows = readResult.rows || [];

    let targetRowNumber = rowNumber !== undefined && rowNumber !== null ? parseInt(rowNumber, 10) : null;
    let matchedRow = null;

    // Option A: If rowNumber provided explicitly
    if (targetRowNumber && !isNaN(targetRowNumber)) {
      matchedRow = rows.find((r) => r._rowNumber === targetRowNumber) || { _rowNumber: targetRowNumber };
    }
    // Option B: Match by searchColumn & searchValue
    else if (searchColumn && searchValue) {
      const findResult = await this.findRow({
        credentialId,
        userId,
        spreadsheetId,
        worksheetTitle,
        searchColumn,
        searchValue,
        matchType: 'equals',
      });
      if (findResult.foundRow) {
        matchedRow = findResult.foundRow;
        targetRowNumber = findResult.foundRow._rowNumber;
      }
    }
    // Option C: Match by column mappings (ignore empty mappings)
    else if (columnsMap && Object.keys(columnsMap).length > 0) {
      const activeMappings = Object.entries(columnsMap).filter(([_, v]) => v !== undefined && v !== null && String(v).trim().length > 0);
      if (activeMappings.length > 0) {
        matchedRow = rows.find((r) => {
          return activeMappings.every(([colKey, expectedVal]) => {
            const cellVal = r[colKey] !== undefined ? String(r[colKey]).trim() : '';
            return cellVal.toLowerCase() === String(expectedVal).trim().toLowerCase();
          });
        });
        if (matchedRow) {
          targetRowNumber = matchedRow._rowNumber;
        }
      }
    }

    // Safety Validation: Never allow deleting Header row 1 or invalid row number
    if (!targetRowNumber || isNaN(targetRowNumber) || targetRowNumber <= 1) {
      console.warn(`[GoogleSheetsService] ⚠️ Matching row not found or row <= 1 (headers preserved)`);
      return {
        success: false,
        message: 'Matching row not found.',
      };
    }

    console.log(`[GoogleSheetsService] 🔎 Target row for deletion identified: Row #${targetRowNumber}`);

    // Get sheet tab numeric sheetId required for batchUpdate deleteDimension
    const worksheets = await this.getWorksheets({ credentialId, userId, spreadsheetId });
    const targetSheet = worksheets.find((w) => w.title === worksheetTitle) || worksheets[0];
    const numericSheetId = targetSheet ? (targetSheet.sheetId !== undefined ? targetSheet.sheetId : targetSheet.id) : 0;

    const sheets = await this.getSheetsClient(credentialId, userId);
    const zeroIndexedStartIndex = targetRowNumber - 1; // Google API deleteDimension uses 0-indexed startIndex (inclusive) and endIndex (exclusive)

    console.log(`[GoogleSheetsService] 📤 Executing batchUpdate deleteDimension for SheetID: ${numericSheetId}, Row Index: ${zeroIndexedStartIndex}:${zeroIndexedStartIndex + 1}`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: numericSheetId || 0,
                dimension: 'ROWS',
                startIndex: zeroIndexedStartIndex,
                endIndex: zeroIndexedStartIndex + 1,
              },
            },
          },
        ],
      },
    });

    console.log(`[GoogleSheetsService] ✅ Row #${targetRowNumber} deleted successfully`);
    return {
      success: true,
      message: 'Row deleted successfully.',
      spreadsheetId,
      worksheet: worksheetTitle,
      deletedRowNumber: targetRowNumber,
      deletedRow: matchedRow,
      item: matchedRow,
    };
  }

  /**
   * Clear Range / Row
   * Automatically prefixes worksheet title and enforces header preservation (Row 1 protection)
   */
  static async clearRows({
    credentialId,
    userId,
    spreadsheetId,
    worksheetTitle = 'Sheet1',
    range = 'A2:ZZ100',
    allowHeaderClear = false,
  }) {
    console.log(`[GoogleSheetsService] 🧹 clearRows requested for Spreadsheet: ${spreadsheetId}, Sheet: ${worksheetTitle}, Raw Range: ${range}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Clear Range operation.');
    }
    if (!range || !String(range).trim()) {
      throw new Error('Cell Range is required for Clear Range operation.');
    }

    let cleanRange = String(range).trim();

    // Strip sheet title if user entered Sheet1!A2:C100
    if (cleanRange.includes('!')) {
      cleanRange = cleanRange.split('!')[1];
    }

    // Header Protection: Protect Row 1 unless allowHeaderClear is true
    if (!allowHeaderClear) {
      // Replace A1: or :1 with A2: or :2
      cleanRange = cleanRange.replace(/([A-Za-z]+)1(?=:|$|-|\b)/g, '$12');
    }

    const fullRange = `'${worksheetTitle}'!${cleanRange}`;
    console.log(`[GoogleSheetsService] 📤 Executing spreadsheets.values.clear on Range: ${fullRange}`);

    try {
      const sheets = await this.getSheetsClient(credentialId, userId);
      const response = await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: fullRange,
      });

      console.log(`[GoogleSheetsService] ✅ Range ${fullRange} cleared successfully`);
      return {
        success: true,
        message: 'Range cleared successfully.',
        spreadsheetId,
        worksheet: worksheetTitle,
        clearedRange: response.data.clearedRange || fullRange,
        range: fullRange,
      };
    } catch (err) {
      console.error(`[GoogleSheetsService] ❌ Google Sheets API clearRows failed for ${fullRange}: ${err.message}`);
      throw new Error(`Google Sheets API Clear Error: ${err.message}`);
    }
  }

  /**
   * Batch Update Rows using Google Sheets API spreadsheets.values.batchUpdate
   * Updates multiple rows efficiently in a single HTTP request
   */
  static async batchUpdateRows({
    credentialId,
    userId,
    spreadsheetId,
    worksheetTitle = 'Sheet1',
    updateMode = 'rowNumber', // 'rowNumber' or 'searchColumn'
    rowNumbers = [],
    searchColumn,
    searchValue,
    columnsMap = {},
    items = [],
    batchSize = 100,
    continueOnError = true,
  }) {
    const startTime = Date.now();
    console.log(`[GoogleSheetsService] 🚀 batchUpdateRows started for Spreadsheet: ${spreadsheetId}, Sheet: ${worksheetTitle}, Mode: ${updateMode}`);

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Batch Update operation.');
    }

    const headers = await this.getHeaders({ credentialId, userId, spreadsheetId, worksheetTitle });
    const readResult = await this.readRows({ credentialId, userId, spreadsheetId, worksheetTitle, filterEmpty: false });
    const existingRows = readResult.rows || [];

    // Target rows list [{ rowNumber, dataMap }]
    const targetUpdates = [];

    // Mode A: Update by Search Column & Search Value
    if (updateMode === 'searchColumn' && searchColumn && searchValue !== undefined) {
      const matchVal = String(searchValue).toLowerCase().trim();
      existingRows.forEach((r) => {
        const cellVal = r[searchColumn] !== undefined ? String(r[searchColumn]).toLowerCase().trim() : '';
        if (cellVal === matchVal) {
          targetUpdates.push({
            rowNumber: r._rowNumber,
            dataMap: columnsMap,
          });
        }
      });
    }
    // Mode B: Update by Array of Items or explicit Row Numbers
    else if (Array.isArray(items) && items.length > 0) {
      items.forEach((itemObj, idx) => {
        const rNum = itemObj.rowNumber || itemObj._rowNumber || (Array.isArray(rowNumbers) ? rowNumbers[idx] : null);
        const itemMap = { ...columnsMap, ...(typeof itemObj === 'object' ? itemObj : {}) };
        if (rNum && !isNaN(parseInt(rNum, 10)) && parseInt(rNum, 10) >= 2) {
          targetUpdates.push({
            rowNumber: parseInt(rNum, 10),
            dataMap: itemMap,
          });
        }
      });
    }
    // Mode C: Explicit array of rowNumbers (e.g. [2, 5, 8])
    else if (Array.isArray(rowNumbers) && rowNumbers.length > 0) {
      rowNumbers.forEach((rn) => {
        const parsed = parseInt(rn, 10);
        if (!isNaN(parsed) && parsed >= 2) {
          targetUpdates.push({
            rowNumber: parsed,
            dataMap: columnsMap,
          });
        }
      });
    }

    if (targetUpdates.length === 0) {
      console.warn(`[GoogleSheetsService] ⚠️ No valid target rows found for batch update.`);
      return {
        success: false,
        message: 'No matching or valid rows found for batch update.',
        count: 0,
        updatedRows: [],
        rows: [],
        executionTime: Date.now() - startTime,
      };
    }

    console.log(`[GoogleSheetsService] 📊 Identified ${targetUpdates.length} target row(s) for batch update`);

    // Build value ranges payload for Google Sheets API spreadsheets.values.batchUpdate
    const dataRanges = targetUpdates.map((update) => {
      const targetRow = update.rowNumber;
      const existingRow = existingRows.find((r) => r._rowNumber === targetRow) || {};

      // Preserve unmapped columns
      const rowVector = headers.map((h, cIdx) => {
        if (update.dataMap[h] !== undefined) return update.dataMap[h];
        return existingRow[h] !== undefined ? existingRow[h] : '';
      });

      return {
        range: `'${worksheetTitle}'!A${targetRow}`,
        values: [rowVector],
      };
    });

    const sheets = await this.getSheetsClient(credentialId, userId);
    const updatedStatusList = [];

    // Chunk requests into batches matching batchSize (default 100)
    const effectiveBatchSize = Math.max(1, parseInt(batchSize || 100, 10));
    for (let i = 0; i < dataRanges.length; i += effectiveBatchSize) {
      const chunk = dataRanges.slice(i, i + effectiveBatchSize);
      const chunkTargetUpdates = targetUpdates.slice(i, i + effectiveBatchSize);

      try {
        console.log(`[GoogleSheetsService] 📤 Executing spreadsheets.values.batchUpdate for ${chunk.length} range(s) (Batch ${Math.floor(i / effectiveBatchSize) + 1})`);
        const response = await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: chunk,
          },
        });

        chunkTargetUpdates.forEach((up) => {
          updatedStatusList.push({
            row: up.rowNumber,
            rowNumber: up.rowNumber,
            status: 'success',
          });
        });
      } catch (err) {
        console.error(`[GoogleSheetsService] ❌ Batch update chunk failed: ${err.message}`);
        if (!continueOnError) {
          throw new Error(`Google Sheets Batch Update Failed: ${err.message}`);
        }
        chunkTargetUpdates.forEach((up) => {
          updatedStatusList.push({
            row: up.rowNumber,
            rowNumber: up.rowNumber,
            status: 'failed',
            error: err.message,
          });
        });
      }
    }

    const successfulRows = updatedStatusList.filter((s) => s.status === 'success').map((s) => s.row);
    const executionTime = Date.now() - startTime;

    console.log(`[GoogleSheetsService] 🎉 Batch update completed cleanly in ${executionTime}ms. Successfully updated ${successfulRows.length}/${targetUpdates.length} row(s)`);

    return {
      success: successfulRows.length > 0,
      updatedRows: successfulRows.length,
      count: successfulRows.length,
      rows: successfulRows,
      updatedRowStatusList: updatedStatusList,
      executionTime,
    };
  }

  /**
   * Create a new Google Spreadsheet using Google Sheets API v4
   */
  static async createSpreadsheet({ credentialId, userId, title, spreadsheetName, worksheetTitle, initialWorksheetName, log = console.log }) {
    log('[CreateSpreadsheet] Loading OAuth credentials...');
    
    // Explicit separation: Spreadsheet File Title vs Initial Worksheet Tab Title
    const finalTitle = String(spreadsheetName || title || '').trim();
    const finalWorksheet = String(initialWorksheetName || worksheetTitle || '').trim() || 'Sheet1';

    if (!finalTitle) {
      throw new Error('Missing required configuration: Spreadsheet Name is required.');
    }

    const sheets = await this.getSheetsClient(credentialId, userId);
    log('[CreateSpreadsheet] Access token validated.');
    log('[CreateSpreadsheet] Creating spreadsheet...');

    try {
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: finalTitle,
          },
          sheets: [
            {
              properties: {
                sheetId: 0,
                title: finalWorksheet,
              },
            },
          ],
        },
      });

      const data = response.data;
      const spreadsheetId = data.spreadsheetId;
      const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      log('[CreateSpreadsheet] Spreadsheet created successfully.');
      log(`[CreateSpreadsheet] Spreadsheet ID: ${spreadsheetId}`);

      // Verify created worksheet title
      const createdSheetTitle = data.sheets?.[0]?.properties?.title;
      const createdSheetId = data.sheets?.[0]?.properties?.sheetId ?? 0;

      let actualWorksheetTitle = createdSheetTitle || finalWorksheet;

      // If Google API left default sheet title as "Sheet1" instead of requested finalWorksheet, rename tab via batchUpdate
      if (finalWorksheet && createdSheetTitle && createdSheetTitle !== finalWorksheet) {
        log(`[CreateSpreadsheet] Renaming default worksheet "${createdSheetTitle}" to "${finalWorksheet}"...`);
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  updateSheetProperties: {
                    properties: {
                      sheetId: createdSheetId,
                      title: finalWorksheet,
                    },
                    fields: 'title',
                  },
                },
              ],
            },
          });
          actualWorksheetTitle = finalWorksheet;
          log(`[CreateSpreadsheet] Worksheet tab renamed successfully to "${finalWorksheet}".`);
        } catch (renameErr) {
          log(`[CreateSpreadsheet] ⚠️ Failed to rename default worksheet tab: ${renameErr.message}`);
        }
      }

      log('[CreateSpreadsheet] Finished.');

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        title: finalTitle,
        worksheet: actualWorksheetTitle,
        raw: data,
      };
    } catch (err) {
      log(`[CreateSpreadsheet] ❌ Error creating spreadsheet: ${err.message}`);
      if (err.message.includes('invalid_grant') || err.message.includes('Token') || err.status === 401) {
        throw new Error('Google OAuth token invalid or expired. Please reconnect your Google account.');
      }
      if (err.status === 403 || err.message.includes('permission')) {
        throw new Error('Permission denied by Google Drive API. Please check OAuth scopes.');
      }
      throw err;
    }
  }

  /**
   * Create a new worksheet (tab) inside an existing Google Spreadsheet
   */
  static async createWorksheet({ credentialId, userId, spreadsheetId, worksheetName, rowCount = 1000, columnCount = 26, log = console.log }) {
    log('Loading credentials...');
    if (!spreadsheetId) {
      throw new Error('Missing required configuration: Spreadsheet ID is required.');
    }

    const cleanName = String(worksheetName || '').trim();
    if (!cleanName) {
      throw new Error('Missing required configuration: New Worksheet Name is required.');
    }

    const parsedRows = parseInt(rowCount, 10) || 1000;
    const parsedCols = parseInt(columnCount, 10) || 26;

    log('Validating spreadsheet...');
    const existingWorksheets = await this.getWorksheets({ credentialId, userId, spreadsheetId });

    // Duplicate worksheet name check
    const duplicate = existingWorksheets.find((w) => String(w.title).trim().toLowerCase() === cleanName.toLowerCase());
    if (duplicate) {
      throw new Error(`Worksheet '${cleanName}' already exists.`);
    }

    const sheets = await this.getSheetsClient(credentialId, userId);
    log('Creating worksheet...');

    try {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: cleanName,
                  gridProperties: {
                    rowCount: parsedRows,
                    columnCount: parsedCols,
                  },
                },
              },
            },
          ],
        },
      });

      const addedSheetProps = response.data.replies?.[0]?.addSheet?.properties || {};
      const worksheetId = String(addedSheetProps.sheetId ?? '');
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${worksheetId}`;

      log('Worksheet created successfully.');
      log('Finished.');

      return {
        success: true,
        spreadsheetId,
        worksheetId,
        worksheetName: cleanName,
        spreadsheetUrl,
        message: 'Worksheet created successfully.',
        raw: response.data,
      };
    } catch (err) {
      if (err.message.includes('already exists')) {
        throw err;
      }
      if (err.message.includes('invalid_grant') || err.message.includes('Token') || err.status === 401) {
        throw new Error('Google OAuth token invalid or expired. Please reconnect your Google account.');
      }
      if (err.status === 403 || err.message.includes('permission')) {
        throw new Error('Permission denied by Google Drive API. Please check OAuth scopes.');
      }
      throw err;
    }
  }

  /**
   * Delete a worksheet (tab) from an existing Google Spreadsheet
   */
  static async deleteWorksheet({ credentialId, userId, spreadsheetId, worksheetTitle, worksheetName, worksheet, log = console.log }) {
    log('Loading credentials...');
    if (!spreadsheetId) {
      throw new Error('Missing required configuration: Spreadsheet ID is required.');
    }

    const targetTitle = String(worksheetTitle || worksheetName || worksheet || '').trim();
    if (!targetTitle) {
      throw new Error('Missing required configuration: Worksheet selection is required.');
    }

    log('Fetching spreadsheet...');
    const worksheets = await this.getWorksheets({ credentialId, userId, spreadsheetId });

    log('Locating worksheet...');
    const targetSheet = worksheets.find(
      (w) => String(w.title).trim().toLowerCase() === targetTitle.toLowerCase()
    );

    if (!targetSheet) {
      throw new Error(`Worksheet '${targetTitle}' not found.`);
    }

    if (worksheets.length <= 1) {
      throw new Error('Cannot delete the last worksheet in a spreadsheet.');
    }

    const targetSheetId = targetSheet.id !== undefined ? targetSheet.id : targetSheet.sheetId;

    const sheets = await this.getSheetsClient(credentialId, userId);
    log('Deleting worksheet...');

    try {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: targetSheetId,
              },
            },
          ],
        },
      });

      log('Worksheet deleted successfully.');
      log('Finished.');

      return {
        success: true,
        spreadsheetId,
        deletedWorksheet: targetSheet.title,
        message: 'Worksheet deleted successfully.',
        raw: response.data,
      };
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('last worksheet')) {
        throw err;
      }
      if (err.message.includes('invalid_grant') || err.message.includes('Token') || err.status === 401) {
        throw new Error('Google OAuth token invalid or expired. Please reconnect your Google account.');
      }
      if (err.status === 403 || err.message.includes('permission')) {
        throw new Error('Permission denied by Google Drive API. Please check OAuth scopes.');
      }
      throw err;
    }
  }
}
