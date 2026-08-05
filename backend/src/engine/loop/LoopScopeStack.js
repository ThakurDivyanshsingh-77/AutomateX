/**
 * Hierarchical Variable Scope Manager for Nested Loops.
 * Supports {{item}}, {{index}}, {{isFirst}}, {{isLast}}, {{total}}, {{remaining}},
 * {{parent.item}}, {{root.item}}, etc.
 */
export class LoopScopeStack {
  constructor(parentStack = null) {
    this.parentStack = parentStack;
    this.scopes = [];
  }

  /**
   * Push a new loop iteration scope onto the stack.
   * @param {object} scopeInfo - Current iteration state
   */
  pushScope({ item, index, total, itemVar = 'item', indexVar = 'index' }) {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const remaining = total - index - 1;

    const currentScope = {
      itemVar,
      indexVar,
      item,
      index,
      total,
      remaining,
      isFirst,
      isLast,
    };

    this.scopes.push(currentScope);
    return currentScope;
  }

  /**
   * Pop top scope when iteration completes.
   */
  popScope() {
    return this.scopes.pop();
  }

  /**
   * Get active leaf scope (innermost loop).
   */
  getCurrentScope() {
    if (this.scopes.length > 0) {
      return this.scopes[this.scopes.length - 1];
    }
    return this.parentStack ? this.parentStack.getCurrentScope() : null;
  }

  /**
   * Resolve runtime variable dynamically from the stack.
   * Supports: item, index, total, remaining, isFirst, isLast, parent.item, root.item
   * @param {string} path - Variable access string e.g. "item.email", "parent.item.id", "root.item"
   * @returns {any}
   */
  resolveVariable(path) {
    if (!path || typeof path !== 'string') return undefined;

    const allScopes = this.getAllActiveScopes();
    if (allScopes.length === 0) return undefined;

    const parts = path.split('.');
    const head = parts[0];

    // Handle "root.item" or "root.index"
    if (head === 'root') {
      const rootScope = allScopes[0];
      const property = parts[1];
      if (property === 'item') return this.extractNestedPath(rootScope.item, parts.slice(2));
      if (property === 'index') return rootScope.index;
      if (property in rootScope) return rootScope[property];
    }

    // Handle "parent.item" or "parent.parent.item"
    if (head === 'parent') {
      let parentDepth = 0;
      let idx = 0;
      while (idx < parts.length && parts[idx] === 'parent') {
        parentDepth++;
        idx++;
      }

      const targetScopeIndex = allScopes.length - 1 - parentDepth;
      if (targetScopeIndex >= 0) {
        const targetScope = allScopes[targetScopeIndex];
        const property = parts[idx];
        if (property === 'item' || property === targetScope.itemVar) {
          return this.extractNestedPath(targetScope.item, parts.slice(idx + 1));
        }
        if (property === 'index' || property === targetScope.indexVar) {
          return targetScope.index;
        }
        if (property in targetScope) return targetScope[property];
      }
    }

    // Innermost scope lookup (default)
    const current = allScopes[allScopes.length - 1];

    if (head === 'item' || head === current.itemVar) {
      return this.extractNestedPath(current.item, parts.slice(1));
    }

    if (head === 'index' || head === current.indexVar) {
      return current.index;
    }

    if (head === 'isFirst') return current.isFirst;
    if (head === 'isLast') return current.isLast;
    if (head === 'total') return current.total;
    if (head === 'remaining') return current.remaining;

    // Check if path refers directly to properties on current item
    if (current.item && typeof current.item === 'object' && head in current.item) {
      return this.extractNestedPath(current.item, parts);
    }

    return undefined;
  }

  /**
   * Collect all active scopes from root parent to innermost child.
   */
  getAllActiveScopes() {
    const ancestors = this.parentStack ? this.parentStack.getAllActiveScopes() : [];
    return [...ancestors, ...this.scopes];
  }

  /**
   * Helper: Extract nested property value from object.
   */
  extractNestedPath(obj, keys) {
    if (keys.length === 0) return obj;
    let curr = obj;
    for (const k of keys) {
      if (curr === null || curr === undefined) return undefined;
      curr = curr[k];
    }
    return curr;
  }
}
