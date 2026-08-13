import * as XLSX from 'xlsx';
import { BaseParser } from './BaseParser.js';

export class XLSXParser extends BaseParser {
  async parse(buffer, fileMetadata) {
    if (!buffer || buffer.length === 0) {
      const error = new Error('The spreadsheet document file is empty.');
      error.code = 'EMPTY_DOCUMENT';
      error.status = 400;
      throw error;
    }

    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        const error = new Error('The Excel workbook contains no worksheets.');
        error.code = 'EMPTY_DOCUMENT';
        error.status = 400;
        throw error;
      }

      const tables = [];
      const paragraphs = [];
      const blocks = [];
      const textLines = [];
      let paragraphIndex = 0;

      workbook.SheetNames.forEach((sheetName, tableIndex) => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return;

        // Convert sheet to 2D array of rows
        const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rawGrid || rawGrid.length === 0) return;

        // Clean cell values
        const cleanedRows = rawGrid.map((row) =>
          (Array.isArray(row) ? row : []).map((cell) => this.cleanCellText(cell))
        );

        // Filter out completely blank rows
        const nonBlankRows = cleanedRows.filter((r) => r.some((c) => c.length > 0));

        if (nonBlankRows.length === 0) return;

        const maxCols = Math.max(...nonBlankRows.map((r) => r.length));

        // Pad all rows to equal length
        const paddedRows = nonBlankRows.map((row) => {
          const padded = [...row];
          while (padded.length < maxCols) {
            padded.push('');
          }
          return padded;
        });

        const headers = paddedRows[0] || [];
        const dataRows = paddedRows.slice(1);

        tables.push({
          sheetName,
          tableIndex,
          headers,
          rows: dataRows,
        });

        blocks.push({
          type: 'heading',
          level: 2,
          text: `Sheet: ${sheetName}`,
        });

        blocks.push({
          type: 'table',
          sheetName,
          tableIndex,
          headers,
          rows: dataRows,
        });

        // Add formatted text representation for paragraphs & text summary
        const sheetHeaderStr = `[Sheet: ${sheetName}] Headers: ${headers.join(' | ')}`;
        textLines.push(sheetHeaderStr);
        paragraphs.push({ index: paragraphIndex++, text: sheetHeaderStr });

        dataRows.forEach((row) => {
          const rowStr = row.join(' | ');
          textLines.push(rowStr);
          paragraphs.push({ index: paragraphIndex++, text: rowStr });
        });
      });

      const combinedText = textLines.join('\n');

      if (!combinedText && tables.length === 0) {
        const error = new Error('The spreadsheet document does not contain readable content.');
        error.code = 'EMPTY_DOCUMENT';
        error.status = 400;
        throw error;
      }

      return {
        text: combinedText,
        paragraphs,
        headings: workbook.SheetNames.map((s) => ({ level: 2, text: s })),
        tables,
        blocks,
      };
    } catch (err) {
      if (err.code === 'EMPTY_DOCUMENT') throw err;
      console.error('[XLSXParser] Error parsing Excel file:', err);
      const error = new Error('The Excel document could not be parsed or appears corrupted.');
      error.code = 'PARSER_ERROR';
      error.status = 400;
      throw error;
    }
  }
}
