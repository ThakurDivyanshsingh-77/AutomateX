import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { BaseParser } from './BaseParser.js';

export class DOCXParser extends BaseParser {
  async parse(buffer, fileMetadata) {
    if (!buffer || buffer.length === 0) {
      const error = new Error('The document file buffer is empty.');
      error.code = 'EMPTY_DOCUMENT';
      error.status = 400;
      throw error;
    }

    try {
      // 1. Extract raw text & HTML representation via Mammoth
      const rawTextResult = await mammoth.extractRawText({ buffer });
      const htmlResult = await mammoth.convertToHtml({ buffer });

      const rawText = this.cleanText(rawTextResult.value || '');
      const html = htmlResult.value || '';

      const paragraphs = [];
      const headings = [];
      const tables = [];
      const blocks = [];
      let paragraphIndex = 0;
      let tableIndexCounter = 0;

      // 2. Parse HTML structure via Cheerio to preserve order, headings, & tables
      const $ = cheerio.load(html);
      const bodyChildren = $('body').children();

      const processElement = (el) => {
        const tagName = el.tagName ? el.tagName.toLowerCase() : '';
        const textContent = $(el).text().trim();

        if (/^h[1-6]$/.test(tagName)) {
          const level = parseInt(tagName.replace('h', ''), 10);
          if (textContent) {
            headings.push({ level, text: textContent });
            blocks.push({
              type: 'heading',
              level,
              text: textContent,
            });
          }
        } else if (tagName === 'table') {
          const parsedTable = this._extractTable($, el, tableIndexCounter);
          if (parsedTable && (parsedTable.headers.length > 0 || parsedTable.rows.length > 0)) {
            tables.push(parsedTable);
            blocks.push({
              type: 'table',
              tableIndex: tableIndexCounter,
              headers: parsedTable.headers,
              rows: parsedTable.rows,
            });
            tableIndexCounter++;
          }
        } else if (tagName === 'p' || tagName === 'ul' || tagName === 'ol' || tagName === 'blockquote' || tagName === 'div') {
          if (textContent) {
            paragraphs.push({
              index: paragraphIndex++,
              text: textContent,
            });
            blocks.push({
              type: 'paragraph',
              text: textContent,
            });
          }
        } else if (textContent) {
          paragraphs.push({
            index: paragraphIndex++,
            text: textContent,
          });
          blocks.push({
            type: 'paragraph',
            text: textContent,
          });
        }
      };

      if (bodyChildren.length > 0) {
        bodyChildren.each((_, el) => processElement(el));
      } else if (html) {
        // Fallback if mammoth HTML has no top-level body wrapper
        $('*').each((_, el) => {
          if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table'].includes(el.tagName?.toLowerCase())) {
            processElement(el);
          }
        });
      }

      // 3. Fallback for raw text paragraphs if HTML cheerio parsing found no blocks
      if (blocks.length === 0 && rawText) {
        const rawLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
        rawLines.forEach((line, idx) => {
          paragraphs.push({ index: idx, text: line });
          blocks.push({ type: 'paragraph', text: line });
        });
      }

      const combinedText = rawText || paragraphs.map((p) => p.text).join('\n\n');

      if (!combinedText && paragraphs.length === 0 && tables.length === 0) {
        const error = new Error('The document does not contain readable content.');
        error.code = 'EMPTY_DOCUMENT';
        error.status = 400;
        throw error;
      }

      return {
        text: combinedText,
        paragraphs,
        headings,
        tables,
        blocks,
      };
    } catch (err) {
      if (err.code === 'EMPTY_DOCUMENT') throw err;
      console.error('[DOCXParser] Error parsing DOCX file:', err);
      const error = new Error('The DOCX document could not be parsed or appears to be corrupted.');
      error.code = 'PARSER_ERROR';
      error.status = 400;
      throw error;
    }
  }

  /**
   * Helper: Extract and normalize table headers/rows from HTML <table> element
   */
  _extractTable($, tableEl, tableIndex) {
    const rowsRaw = [];
    $(tableEl).find('tr').each((_, tr) => {
      const rowCells = [];
      $(tr).find('th, td').each((_, cell) => {
        rowCells.push(this.cleanCellText($(cell).text()));
      });
      if (rowCells.some((cell) => cell.length > 0)) {
        rowsRaw.push(rowCells);
      }
    });

    if (rowsRaw.length === 0) {
      return { tableIndex, headers: [], rows: [] };
    }

    // Determine max column count across all rows
    const maxCols = Math.max(...rowsRaw.map((r) => r.length));

    // Pad rows to equal length
    const paddedRows = rowsRaw.map((row) => {
      const padded = [...row];
      while (padded.length < maxCols) {
        padded.push('');
      }
      return padded;
    });

    // Check if first row looks like headers (e.g. contains th elements or header keywords)
    const hasHeaderTag = $(tableEl).find('th').length > 0;
    let headers = [];
    let dataRows = paddedRows;

    if (hasHeaderTag || paddedRows.length > 1) {
      headers = paddedRows[0];
      dataRows = paddedRows.slice(1);
    } else {
      headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
      dataRows = paddedRows;
    }

    return {
      tableIndex,
      headers,
      rows: dataRows,
    };
  }
}
