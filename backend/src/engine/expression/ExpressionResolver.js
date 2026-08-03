import { getValueByPath } from './helpers.js';

/**
 * ExpressionResolver
 * Resolves expression paths (e.g. "trigger.body.email", "webhook.body.email", "http.data.name")
 * against ExecutionContext (nodeOutputs Map, currentData, variables).
 */
export class ExpressionResolver {
  /**
   * Resolve path against context (nodeOutputs Map, currentData, variables).
   * Returns resolved value or undefined if not found.
   */
  static resolvePath(path, context) {
    if (!path || !context) return undefined;

    const parts = path.split('.');
    const firstSegment = parts[0].replace(/\[.*\]/, ''); // e.g. "trigger" from "trigger.body.email"
    const lowerFirst = firstSegment.toLowerCase();

    // 1. Check nodeOutputs map
    if (context.nodeOutputs) {
      // Handle 'trigger' alias -> maps to 'webhook' or 'start' or 'trigger' node output
      let keysToTry = [firstSegment, lowerFirst];
      if (lowerFirst === 'trigger') {
        keysToTry.push('webhook', 'start', 'manualtrigger', 'schedule');
      }

      for (const key of keysToTry) {
        if (context.nodeOutputs.has(key)) {
          const output = context.nodeOutputs.get(key);
          const subPath = parts.slice(1).join('.');
          if (!subPath) return output;
          const res = getValueByPath(output, subPath);
          if (res !== undefined) return res;
        }
      }

      // Fuzzy search across all nodeOutputs entries
      for (const [nodeId, output] of context.nodeOutputs.entries()) {
        const normalizedId = String(nodeId).toLowerCase();

        if (
          normalizedId === lowerFirst ||
          normalizedId.includes(`_${lowerFirst}`) ||
          normalizedId.startsWith(lowerFirst) ||
          (lowerFirst === 'trigger' && (normalizedId.includes('webhook') || normalizedId.includes('start'))) ||
          (output && output.provider === lowerFirst)
        ) {
          const subPath = parts.slice(1).join('.');
          if (!subPath) return output;
          const res = getValueByPath(output, subPath);
          if (res !== undefined) return res;
        }

        // Direct property check on output object
        const directRes = getValueByPath(output, path);
        if (directRes !== undefined) return directRes;
      }
    }

    // 2. Check currentData (RAM state)
    if (context.currentData) {
      const res = getValueByPath(context.currentData, path);
      if (res !== undefined) return res;

      // Handle 'trigger.body.email' when currentData is { body: { email: '...' } }
      if (lowerFirst === 'trigger') {
        const subPath = parts.slice(1).join('.');
        if (subPath) {
          const resSub = getValueByPath(context.currentData, subPath);
          if (resSub !== undefined) return resSub;
        }
      }
    }

    // 3. Check variables
    if (context.variables) {
      const res = getValueByPath(context.variables, path);
      if (res !== undefined) return res;
    }

    return undefined;
  }
}
