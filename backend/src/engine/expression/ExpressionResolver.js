import { getValueByPath } from './helpers.js';
import { ExpressionFunctions } from './ExpressionFunctions.js';

/**
 * ExpressionResolver
 * Resolves expression paths (e.g. "trigger.body.email", "upper(http.data.name)", "if(user.age > 18, 'Adult', 'Minor')")
 * against ExecutionContext (nodeOutputs Map, currentData, variables).
 */
export class ExpressionResolver {
  /**
   * Main entry point to resolve an expression string inside {{ ... }}.
   */
  static resolveExpression(expr, context = {}) {
    if (expr === undefined || expr === null) return undefined;
    const trimmed = String(expr).trim();
    if (!trimmed) return '';

    // Handle fallback operator: path | "fallback value"
    if (trimmed.includes('|') && !trimmed.startsWith('if(')) {
      const parts = trimmed.split('|');
      for (const part of parts) {
        const res = this.evalSingleToken(part.trim(), context);
        if (res !== undefined && res !== null && res !== '') {
          return res;
        }
      }
      return '';
    }

    return this.evalSingleToken(trimmed, context);
  }

  /**
   * Evaluates a single token which could be a function call, a comparison condition, system variable, literal, or path.
   */
  static evalSingleToken(token, context) {
    if (!token) return undefined;

    // 1. Quoted literal string ('hello' or "hello")
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }

    // 2. Numeric or Boolean literal
    if (!isNaN(Number(token)) && token !== '') return Number(token);
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'null') return null;

    // 3. Function Call Syntax: fnName(arg1, arg2, ...) -> Must run BEFORE comparison split!
    const fnMatch = token.match(/^([a-zA-Z0-9_]+)\s*\(([\s\S]*)\)$/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const rawArgsStr = fnMatch[2];

      if (ExpressionFunctions.has(fnName)) {
        const rawArgs = this.parseFunctionArgs(rawArgsStr);
        const resolvedArgs = rawArgs.map((arg) => this.evalSingleToken(arg.trim(), context));
        return ExpressionFunctions.execute(fnName, resolvedArgs);
      }
    }

    // 4. Comparison Condition Check (e.g. http.statusCode == 200, user.age > 18)
    const compOperators = ['==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOperators) {
      if (token.includes(op) && !token.startsWith('"') && !token.startsWith("'")) {
        const parts = token.split(op);
        if (parts.length === 2) {
          const leftVal = this.evalSingleToken(parts[0].trim(), context);
          const rightVal = this.evalSingleToken(parts[1].trim(), context);

          switch (op) {
            case '==': return leftVal == rightVal;
            case '!=': return leftVal != rightVal;
            case '>=': return Number(leftVal) >= Number(rightVal);
            case '<=': return Number(leftVal) <= Number(rightVal);
            case '>': return Number(leftVal) > Number(rightVal);
            case '<': return Number(leftVal) < Number(rightVal);
          }
        }
      }
    }

    // 5. System Variables ($now, $execution, $env)
    if (token.startsWith('$')) {
      return this.resolveSystemVariable(token, context);
    }

    // 6. Normal Variable Path (e.g., http.data.temp or weather[0].main)
    return this.resolvePath(token, context);
  }

  /**
   * Parses function arguments respecting comma boundaries inside quotes or nested parens
   */
  static parseFunctionArgs(argsStr) {
    if (!argsStr || !argsStr.trim()) return [];
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let parenDepth = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];

      if ((char === '"' || char === "'") && (i === 0 || argsStr[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
        current += char;
      } else if (!inQuotes && char === '(') {
        parenDepth++;
        current += char;
      } else if (!inQuotes && char === ')') {
        parenDepth--;
        current += char;
      } else if (!inQuotes && char === ',' && parenDepth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      args.push(current.trim());
    }
    return args;
  }

  /**
   * Resolve system variables like $now, $execution.id, $env.NODE_ENV
   */
  static resolveSystemVariable(token, context) {
    const parts = token.split('.');
    const sysVar = parts[0].toLowerCase();
    const subPath = parts.slice(1).join('.');

    if (sysVar === '$now') {
      const d = new Date();
      if (!subPath || subPath === 'iso') return d.toISOString();
      if (subPath === 'timestamp') return d.getTime();
      if (subPath === 'date') return d.toLocaleDateString();
      if (subPath === 'time') return d.toLocaleTimeString();
    }

    if (sysVar === '$execution') {
      const executionInfo = {
        id: context.executionId || 'exec_test_123',
        workflowId: context.workflowId || 'wf_demo_001',
        mode: context.mode || 'test',
        timestamp: context.timestamp || new Date().toISOString(),
      };
      return subPath ? getValueByPath(executionInfo, subPath) : executionInfo;
    }

    if (sysVar === '$env') {
      return subPath ? process.env[subPath] || '' : process.env;
    }

    return undefined;
  }

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
      let keysToTry = [firstSegment, lowerFirst];
      if (lowerFirst === 'trigger') {
        keysToTry.push('webhook', 'start', 'manualtrigger', 'schedule', 'cron');
      }

      for (const key of keysToTry) {
        if (context.nodeOutputs.has && context.nodeOutputs.has(key)) {
          const output = context.nodeOutputs.get(key);
          const subPath = parts.slice(1).join('.');
          if (!subPath) return output;
          const res = getValueByPath(output, subPath);
          if (res !== undefined) return res;
        } else if (context.nodeOutputs[key]) {
          const output = context.nodeOutputs[key];
          const subPath = parts.slice(1).join('.');
          if (!subPath) return output;
          const res = getValueByPath(output, subPath);
          if (res !== undefined) return res;
        }
      }

      // Fuzzy search across nodeOutputs entries
      const entries = context.nodeOutputs.entries
        ? Array.from(context.nodeOutputs.entries())
        : Object.entries(context.nodeOutputs);

      for (const [nodeId, output] of entries) {
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
