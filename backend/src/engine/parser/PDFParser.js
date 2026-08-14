import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');
import { BaseParser } from './BaseParser.js';

export class PDFParser extends BaseParser {
  async parse(buffer, fileMetadata) {
    if (!buffer || buffer.length === 0) {
      const error = new Error('The PDF document file is empty.');
      error.code = 'EMPTY_DOCUMENT';
      error.status = 400;
      throw error;
    }

    try {
      let rawText = '';
      let numPages = 1;
      let tables = [];

      // 1. Check for pdf-parse v2 API (new PDFParse({ data: buffer }))
      if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        try {
          const textRes = await parser.getText();
          rawText = this.cleanText(textRes?.text || '');
          numPages = textRes?.total || textRes?.pages?.length || 1;

          if (typeof parser.getTable === 'function') {
            try {
              const tableRes = await parser.getTable();
              if (tableRes?.tables && Array.isArray(tableRes.tables)) {
                tables = tableRes.tables;
              }
            } catch (tErr) {
              // Ignore table extraction error if unsupported
            }
          }
        } catch (v2Err) {
          console.warn('[PDFParser] pdf-parse v2 failed, attempting v1 fallback:', v2Err.message);
        }
      }

      // 2. Fallback to pdf-parse v1 function API if v2 did not extract text
      if (!rawText) {
        const parseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule?.default || null);
        if (typeof parseFn === 'function') {
          const data = await parseFn(buffer);
          rawText = this.cleanText(data?.text || '');
          numPages = data?.numpages || 1;
        }
      }

      // 3. Fallback to basic text stream extraction if parsing engine produced no output
      if (!rawText) {
        const bufferStr = buffer.toString('latin1');
        const textMatches = bufferStr.match(/\(([^)]+)\)\s*Tj/g);
        if (textMatches) {
          rawText = textMatches
            .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim())
            .filter(Boolean)
            .join(' ');
        }
      }

      if (!rawText) {
        const error = new Error('The PDF document does not contain readable text content.');
        error.code = 'EMPTY_DOCUMENT';
        error.status = 400;
        throw error;
      }

      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const paragraphs = lines.map((text, index) => ({
        index,
        text,
      }));

      const blocks = lines.map((text) => ({
        type: 'paragraph',
        text,
      }));

      return {
        text: rawText,
        paragraphs,
        headings: [],
        tables,
        blocks,
        pages: numPages,
      };
    } catch (err) {
      if (err.code === 'EMPTY_DOCUMENT') throw err;
      console.error('[PDFParser] Error parsing PDF file:', err);
      const error = new Error('The PDF document could not be parsed or appears corrupted.');
      error.code = 'PARSER_ERROR';
      error.status = 400;
      throw error;
    }
  }
}
