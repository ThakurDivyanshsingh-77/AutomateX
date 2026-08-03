/**
 * ExpressionParser
 * Parses string templates containing {{ expression }} placeholders.
 * Uses an in-memory Map cache to avoid re-parsing identical template strings.
 */
export class ExpressionParser {
  static parseCache = new Map();
  static MAX_CACHE_SIZE = 1000;

  /**
   * Parse a string template into tokens.
   * Returns array of token objects:
   * - { type: 'literal', value: string }
   * - { type: 'expression', raw: string, path: string }
   */
  static parse(template) {
    if (typeof template !== 'string') {
      return [{ type: 'literal', value: template }];
    }

    if (!template.includes('{{')) {
      return [{ type: 'literal', value: template }];
    }

    if (this.parseCache.has(template)) {
      return this.parseCache.get(template);
    }

    const tokens = [];
    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template)) !== null) {
      const matchIndex = match.index;

      // Add literal text prior to expression
      if (matchIndex > lastIndex) {
        tokens.push({
          type: 'literal',
          value: template.substring(lastIndex, matchIndex),
        });
      }

      // Add expression token
      const rawExpr = match[0];
      const path = match[1].trim();

      tokens.push({
        type: 'expression',
        raw: rawExpr,
        path: path,
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining literal text after last match
    if (lastIndex < template.length) {
      tokens.push({
        type: 'literal',
        value: template.substring(lastIndex),
      });
    }

    // Maintain max cache size
    if (this.parseCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.parseCache.keys().next().value;
      this.parseCache.delete(firstKey);
    }

    this.parseCache.set(template, tokens);
    return tokens;
  }
}
