import { BaseParser } from './BaseParser.js';

export class DOCParser extends BaseParser {
  async parse(buffer, fileMetadata) {
    if (!buffer || buffer.length === 0) {
      const error = new Error('The legacy DOC document file is empty.');
      error.code = 'EMPTY_DOCUMENT';
      error.status = 400;
      throw error;
    }

    try {
      // Safe plain text extraction from binary stream without macro execution
      const rawString = buffer.toString('utf-8');
      
      // Extract printable character blocks (at least 4 characters long)
      const matches = rawString.match(/[\x20-\x7E\t\r\n]{4,}/g) || [];
      const cleanedLines = matches
        .map((m) => m.trim())
        .filter((line) => line.length > 3 && !/^[\s\d\W]+$/.test(line) && !line.includes('Root Entry') && !line.includes('WordDocument'));

      const combinedText = cleanedLines.join('\n\n');

      if (!combinedText || cleanedLines.length === 0) {
        const error = new Error('The legacy DOC document does not contain readable content.');
        error.code = 'EMPTY_DOCUMENT';
        error.status = 400;
        throw error;
      }

      const paragraphs = cleanedLines.map((text, index) => ({
        index,
        text,
      }));

      const blocks = cleanedLines.map((text) => ({
        type: 'paragraph',
        text,
      }));

      return {
        text: combinedText,
        paragraphs,
        headings: [],
        tables: [],
        blocks,
      };
    } catch (err) {
      if (err.code === 'EMPTY_DOCUMENT') throw err;
      console.error('[DOCParser] Error parsing DOC file:', err);
      const error = new Error('The legacy DOC document could not be parsed.');
      error.code = 'PARSER_ERROR';
      error.status = 400;
      throw error;
    }
  }
}
