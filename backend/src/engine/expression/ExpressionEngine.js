import { ExpressionParser } from './ExpressionParser.js';
import { ExpressionResolver } from './ExpressionResolver.js';
import { isPlainObject } from './helpers.js';

/**
 * ExpressionEngine
 * Reusable, production-ready Expression Engine for Workflow Execution.
 * Replaces {{ nodeType.property }} placeholders and function expressions with runtime values.
 */
export class ExpressionEngine {
  /**
   * Main API entry point: Resolves input (string, object, array, or primitive) against context.
   */
  static resolve(input, context) {
    if (input === undefined || input === null) {
      return input;
    }

    if (typeof input === 'string') {
      return this.resolveString(input, context);
    }

    if (Array.isArray(input)) {
      return this.resolveArray(input, context);
    }

    if (isPlainObject(input)) {
      return this.resolveObject(input, context);
    }

    return input;
  }

  /**
   * Resolves {{ ... }} placeholders in a string.
   * If string is ONLY a single placeholder (e.g. "{{http.statusCode}}"),
   * preserves the raw resolved type (number, boolean, object, array).
   * Otherwise, embeds resolved values into surrounding string.
   * Missing properties resolve to empty string "" (never throws).
   */
  static resolveString(template, context) {
    if (typeof template !== 'string' || !template.includes('{{')) {
      return template;
    }

    const tokens = ExpressionParser.parse(template);

    // Case 1: Standalone single expression (e.g. "{{http.statusCode}}")
    if (tokens.length === 1 && tokens[0].type === 'expression') {
      const resolved = ExpressionResolver.resolveExpression(tokens[0].path, context);
      return resolved !== undefined ? resolved : '';
    }

    // Case 2: Multi-expression or embedded expression string (e.g. "Order #{{http.data.id}}")
    let resultStr = '';
    for (const token of tokens) {
      if (token.type === 'literal') {
        resultStr += token.value;
      } else if (token.type === 'expression') {
        const resolved = ExpressionResolver.resolveExpression(token.path, context);
        if (resolved !== undefined && resolved !== null) {
          resultStr += typeof resolved === 'object' ? JSON.stringify(resolved) : String(resolved);
        } else {
          resultStr += ''; // Missing property -> empty string
        }
      }
    }

    return resultStr;
  }

  /**
   * Recursively resolves all string values inside a plain object.
   */
  static resolveObject(obj, context) {
    if (!isPlainObject(obj)) return obj;

    const resolvedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      resolvedObj[key] = this.resolve(value, context);
    }
    return resolvedObj;
  }

  /**
   * Recursively resolves all elements inside an array.
   */
  static resolveArray(arr, context) {
    if (!Array.isArray(arr)) return arr;
    return arr.map((item) => this.resolve(item, context));
  }
}
