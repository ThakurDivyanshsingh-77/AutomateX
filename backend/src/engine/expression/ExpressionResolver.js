import { getValueByPath } from './helpers.js';

/**
 * ExpressionResolver
 * Resolves expression paths (e.g. "http.data.name", "http.statusCode", "gmail.messageId")
 * against ExecutionContext (nodeOutputs, currentData, variables).
 */
export class ExpressionResolver {
  /**
   * Resolve path against context (nodeOutputs Map, currentData, variables).
   * Returns resolved value or undefined if not found.
   */
  static resolvePath(path, context) {
    if (!path || !context) return undefined;

    const parts = path.split('.');
    const firstSegment = parts[0].replace(/\[.*\]/, ''); // e.g. "http" from "http.data"

    // 1. Direct match on nodeOutputs map key
    if (context.nodeOutputs) {
      // Exact key match (e.g. "http" or "node_http_1")
      if (context.nodeOutputs.has(firstSegment)) {
        const nodeOutput = context.nodeOutputs.get(firstSegment);
        const subPath = parts.slice(1).join('.');
        if (!subPath) return nodeOutput;
        const res = getValueByPath(nodeOutput, subPath);
        if (res !== undefined) return res;
      }

      // Type / Prefix search across nodeOutputs entries
      for (const [nodeId, output] of context.nodeOutputs.entries()) {
        const normalizedId = String(nodeId).toLowerCase();
        const normalizedSeg = firstSegment.toLowerCase();

        if (
          normalizedId === normalizedSeg ||
          normalizedId.includes(`_${normalizedSeg}`) ||
          normalizedId.startsWith(normalizedSeg) ||
          (output && output.provider === normalizedSeg)
        ) {
          const subPath = parts.slice(1).join('.');
          if (!subPath) return output;
          const res = getValueByPath(output, subPath);
          if (res !== undefined) return res;
        }

        // Direct property check on output object (e.g. output = { statusCode: 200 })
        const directRes = getValueByPath(output, path);
        if (directRes !== undefined) return directRes;
      }
    }

    // 2. Check currentData
    if (context.currentData) {
      const res = getValueByPath(context.currentData, path);
      if (res !== undefined) return res;

      const subPath = parts.slice(1).join('.');
      if (subPath) {
        const resSub = getValueByPath(context.currentData, subPath);
        if (resSub !== undefined) return resSub;
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
