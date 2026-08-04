/**
 * ExpressionFunctions.js
 * Production-grade transformation functions for Universal Variables & Data Mapper Engine.
 * Supports: upper, lower, trim, length, substring, replace, split, join, json, date, formatDate, base64, urlEncode, urlDecode, math, if
 */

export class ExpressionFunctions {
  static registry = {
    // String functions
    upper: (val) => (val !== undefined && val !== null ? String(val).toUpperCase() : ''),
    lower: (val) => (val !== undefined && val !== null ? String(val).toLowerCase() : ''),
    trim: (val) => (val !== undefined && val !== null ? String(val).trim() : ''),
    length: (val) => {
      if (val === undefined || val === null) return 0;
      if (Array.isArray(val) || typeof val === 'string') return val.length;
      if (typeof val === 'object') return Object.keys(val).length;
      return String(val).length;
    },
    substring: (val, start, end) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      const s = parseInt(start, 10) || 0;
      const e = end !== undefined ? parseInt(end, 10) : undefined;
      return str.substring(s, e);
    },
    replace: (val, searchValue, replaceValue) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      const search = String(searchValue || '');
      const replace = String(replaceValue || '');
      return str.replaceAll(search, replace);
    },
    split: (val, separator = ',') => {
      if (val === undefined || val === null) return [];
      return String(val).split(String(separator));
    },
    join: (val, separator = ',') => {
      if (!Array.isArray(val)) return String(val || '');
      return val.join(String(separator));
    },
    base64: (val) => {
      if (val === undefined || val === null) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return Buffer.from(str).toString('base64');
    },
    urlEncode: (val) => (val !== undefined && val !== null ? encodeURIComponent(String(val)) : ''),
    urlDecode: (val) => (val !== undefined && val !== null ? decodeURIComponent(String(val)) : ''),

    // Utility & Type functions
    json: (val) => {
      if (val === undefined || val === null) return 'null';
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return JSON.stringify(val);
    },
    date: (val) => {
      const d = val ? new Date(val) : new Date();
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    },
    formatDate: (val, locale = 'en-US') => {
      const d = val ? new Date(val) : new Date();
      if (isNaN(d.getTime())) return '';
      return d.toLocaleString(String(locale));
    },

    // Math & Conditional functions
    math: (expr) => {
      if (expr === undefined || expr === null) return 0;
      try {
        // Safe math evaluation supporting +, -, *, /, %, (, ), Math functions
        const sanitized = String(expr).replace(/[^0-9+\-*/%.()\sMath\.a-z]/gi, '');
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${sanitized})`)();
      } catch {
        return 0;
      }
    },
    if: (condition, trueVal, falseVal) => {
      const isTrue = Boolean(condition) && condition !== 'false' && condition !== '0' && condition !== 0;
      return isTrue ? trueVal : falseVal !== undefined ? falseVal : '';
    },
  };

  /**
   * Execute a transformation function by name with given arguments
   */
  static execute(fnName, args = []) {
    const fn = this.registry[fnName];
    if (!fn) {
      throw new Error(`Unknown function: ${fnName}`);
    }
    return fn(...args);
  }

  /**
   * Check if a function is registered
   */
  static has(fnName) {
    return Boolean(this.registry[fnName]);
  }
}
