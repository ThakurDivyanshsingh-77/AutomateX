import path from 'path';
import { DOCXParser } from './DOCXParser.js';
import { PDFParser } from './PDFParser.js';
import { XLSXParser } from './XLSXParser.js';
import { DOCParser } from './DOCParser.js';

export class DocumentParserService {
  constructor() {
    this.docxParser = new DOCXParser();
    this.pdfParser = new PDFParser();
    this.xlsxParser = new XLSXParser();
    this.docParser = new DOCParser();
  }

  /**
   * Resolves appropriate parser based on file extension and MIME type
   */
  getParser(fileMetadata) {
    const ext = (fileMetadata?.extension || path.extname(fileMetadata?.name || '')).toLowerCase();
    const mime = (fileMetadata?.mimeType || '').toLowerCase();

    if (ext === '.docx' || mime.includes('wordprocessingml.document')) {
      return this.docxParser;
    }
    if (ext === '.pdf' || mime.includes('pdf')) {
      return this.pdfParser;
    }
    if (ext === '.xlsx' || ext === '.xls' || mime.includes('spreadsheetml') || mime.includes('excel')) {
      return this.xlsxParser;
    }
    if (ext === '.doc' || mime.includes('msword')) {
      return this.docParser;
    }

    // Default fallback to DOCX parser
    return this.docxParser;
  }

  /**
   * Parse document buffer and return structured content payload
   */
  async parseDocument(fileBuffer, fileMetadata) {
    if (!fileBuffer || fileBuffer.length === 0) {
      const error = new Error('Document buffer is empty.');
      error.code = 'EMPTY_DOCUMENT';
      error.status = 400;
      throw error;
    }

    const parser = this.getParser(fileMetadata);
    const parsedData = await parser.parse(fileBuffer, fileMetadata);

    return {
      text: parsedData.text || '',
      paragraphs: parsedData.paragraphs || [],
      headings: parsedData.headings || [],
      tables: parsedData.tables || [],
      blocks: parsedData.blocks || [],
    };
  }
}

export const documentParserService = new DocumentParserService();
