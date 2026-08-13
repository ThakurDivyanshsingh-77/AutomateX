/**
 * BaseParser — Abstract interface for format-specific document parsers.
 */
export class BaseParser {
  /**
   * Parse document buffer and return structured content payload
   * @param {Buffer} buffer - Raw file buffer
   * @param {Object} fileMetadata - File metadata (id, name, mimeType, extension, size)
   * @returns {Promise<Object>} Structured document result
   */
  async parse(buffer, fileMetadata) {
    throw new Error(`parse method must be implemented by ${this.constructor.name}`);
  }

  /**
   * Helper: Normalize text by trimming excess whitespace and empty lines
   */
  cleanText(text) {
    if (!text) return '';
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  }

  /**
   * Helper: Normalize cell text (preserves string values, returns empty string for null/undefined)
   */
  cleanCellText(val) {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  }
}
