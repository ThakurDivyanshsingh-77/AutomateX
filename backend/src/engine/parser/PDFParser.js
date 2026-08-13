import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
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
      const data = await pdfParse(buffer);
      const rawText = this.cleanText(data.text || '');

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
        tables: [],
        blocks,
        pages: data.numpages || 1,
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
