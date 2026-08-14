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
        } else if (tagName === 'ul' || tagName === 'ol') {
          const listItems = [];
          $(el).find('li').each((_, li) => {
            const liText = $(li).text().trim();
            if (liText) listItems.push(liText);
          });
          if (listItems.length > 0) {
            const combinedList = listItems.map((item) => `• ${item}`).join('\n');
            paragraphs.push({
              index: paragraphIndex++,
              text: combinedList,
            });
            blocks.push({
              type: 'list',
              items: listItems,
              text: combinedList,
            });
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
        } else if (tagName === 'p' || tagName === 'blockquote' || tagName === 'div') {
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
          if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'ul', 'ol'].includes(el.tagName?.toLowerCase())) {
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

      // 4. Construct complete, normalized document text from blocks in reading order
      const structuredLines = [];
      for (const block of blocks) {
        if (block.type === 'heading') {
          structuredLines.push(block.text);
        } else if (block.type === 'paragraph' || block.type === 'list') {
          structuredLines.push(block.text);
        } else if (block.type === 'table') {
          const formattedTable = this._formatTableAsText(block);
          if (formattedTable) {
            structuredLines.push(formattedTable);
          }
        }
      }

      let combinedText = structuredLines.join('\n\n').trim();

      // If structured text is empty or missing content, fall back to raw text
      if (!combinedText) {
        combinedText = rawText || paragraphs.map((p) => p.text).join('\n\n');
      }

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
   * Helper: Normalize table content into readable key-value text preserving all columns.
   */
  _formatTableAsText(table) {
    if (!table) return '';
    const lines = [];
    const headers = table.headers || [];
    const rows = table.rows || [];

    // Check if 2-column key-value table
    const isTwoCol = (headers.length === 2 && rows.every((r) => r.length <= 2)) ||
                     (headers.length === 0 && rows.length > 0 && rows.every((r) => r.length === 2));

    if (isTwoCol) {
      const isGenericHeader = headers.length === 2 &&
        /^(field|attribute|property|key|name|item|column)\b/i.test(headers[0]) &&
        /^(value|data|content|val|details)\b/i.test(headers[1]);

      if (!isGenericHeader && headers.length === 2 && headers[0] && headers[1]) {
        lines.push(`${headers[0]}: ${headers[1]}`);
      }

      for (const row of rows) {
        const k = (row[0] || '').trim();
        const v = (row[1] || '').trim();
        if (k && v) {
          lines.push(`${k}: ${v}`);
        } else if (k) {
          lines.push(k);
        } else if (v) {
          lines.push(v);
        }
      }
    } else {
      // Multi-column table: include headers and key-value mapping per row
      if (headers.length > 0 && headers.some((h) => Boolean(h))) {
        lines.push(headers.join(' | '));
      }
      for (const row of rows) {
        if (headers.length > 0 && headers.length === row.length) {
          const pairs = row
            .map((val, idx) => {
              const h = (headers[idx] || '').trim();
              const v = (val || '').trim();
              if (h && v) return `${h}: ${v}`;
              return v;
            })
            .filter(Boolean);
          lines.push(pairs.join(', '));
        } else {
          lines.push(row.filter(Boolean).join(' | '));
        }
      }
    }

    return lines.join('\n');
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
