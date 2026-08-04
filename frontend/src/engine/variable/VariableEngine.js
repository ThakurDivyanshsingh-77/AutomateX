/**
 * VariableEngine.js
 * Universal Variable & Data Mapper Engine for Frontend Visual Builder.
 * Developer API: list(), resolve(), validate(), search(), transform(), addRecent(), toggleFavorite()
 */

const STORAGE_KEYS = {
  FAVORITES: 'automatex_var_favorites',
  RECENTS: 'automatex_var_recents',
};

// Node Output Schema Definitions for Dynamic Discovery & Autocomplete
export const NODE_SCHEMA_REGISTRY = {
  webhook: {
    label: 'Webhook Trigger',
    icon: 'Webhook',
    outputs: {
      body: { type: 'Object', example: { email: 'user@example.com', name: 'Divyansh' }, description: 'HTTP request body payload' },
      headers: { type: 'Object', example: { 'content-type': 'application/json' }, description: 'HTTP request headers' },
      query: { type: 'Object', example: { ref: 'google' }, description: 'URL query parameters' },
      params: { type: 'Object', example: { id: '123' }, description: 'Route parameters' },
    },
  },
  http: {
    label: 'HTTP Request',
    icon: 'Globe',
    outputs: {
      status: { type: 'Number', example: 200, description: 'HTTP status code' },
      statusText: { type: 'String', example: 'OK', description: 'HTTP status message' },
      headers: { type: 'Object', example: { 'content-type': 'application/json' }, description: 'Response headers' },
      data: { type: 'Object', example: { temp: 28.5, city: 'Jaipur', user: { name: 'Divyansh' } }, description: 'Parsed JSON response body' },
      body: { type: 'String', example: '{"temp": 28.5}', description: 'Raw response body' },
    },
  },
  gmail: {
    label: 'Gmail Action',
    icon: 'Mail',
    outputs: {
      messageId: { type: 'String', example: '18ab4d8d90ef', description: 'Gmail message unique ID' },
      threadId: { type: 'String', example: '18ab4d8d90ef', description: 'Gmail thread ID' },
      status: { type: 'String', example: 'SENT', description: 'Delivery status' },
      from: { type: 'String', example: 'sender@example.com', description: 'Sender email' },
      to: { type: 'String', example: 'receiver@example.com', description: 'Recipient email' },
      subject: { type: 'String', example: 'Workflow Notification', description: 'Email subject line' },
    },
  },
  slack: {
    label: 'Slack Message',
    icon: 'MessageSquare',
    outputs: {
      channel: { type: 'String', example: '#general', description: 'Target Slack channel' },
      message: { type: 'String', example: 'Task complete', description: 'Sent message text' },
      timestamp: { type: 'String', example: '1722749000.000100', description: 'Slack message timestamp' },
      ok: { type: 'Boolean', example: true, description: 'Slack API success status' },
    },
  },
  discord: {
    label: 'Discord Webhook',
    icon: 'MessageCircle',
    outputs: {
      id: { type: 'String', example: '123456789012345678', description: 'Discord message ID' },
      channelId: { type: 'String', example: '987654321098765432', description: 'Channel ID' },
      content: { type: 'String', example: 'Alert: Deployment finished', description: 'Message content' },
    },
  },
  mongodb: {
    label: 'MongoDB Database',
    icon: 'Database',
    outputs: {
      documents: { type: 'Array', example: [{ _id: '64a1b2c3', name: 'Item 1' }], description: 'Query results array' },
      count: { type: 'Number', example: 1, description: 'Number of returned documents' },
      insertedId: { type: 'String', example: '64a1b2c3d4e5f6', description: 'ID of newly inserted document' },
    },
  },
  groq: {
    label: 'Groq AI Model',
    icon: 'Bot',
    outputs: {
      response: { type: 'String', example: 'AI generated response text...', description: 'Completion answer from LLM' },
      usage: { type: 'Object', example: { total_tokens: 150 }, description: 'Token usage breakdown' },
      tokens: { type: 'Number', example: 150, description: 'Total tokens used' },
    },
  },
  pdf: {
    label: 'PDF Generator',
    icon: 'FileText',
    outputs: {
      pdfBuffer: { type: 'Binary', example: '<Buffer 25 50 44 46...>', description: 'Raw binary PDF buffer' },
      pageCount: { type: 'Number', example: 3, description: 'Total generated pages' },
      filename: { type: 'String', example: 'invoice_101.pdf', description: 'PDF file name' },
    },
  },
  cron: {
    label: 'Cron Scheduler',
    icon: 'Clock',
    outputs: {
      timestamp: { type: 'String', example: '2026-08-04T08:00:00.000Z', description: 'Scheduled execution timestamp' },
      scheduledTime: { type: 'String', example: '08:00:00', description: 'Time of trigger' },
      timezone: { type: 'String', example: 'UTC', description: 'Scheduler timezone' },
    },
  },
  condition: {
    label: 'Condition IF',
    icon: 'GitFork',
    outputs: {
      result: { type: 'Boolean', example: true, description: 'Evaluated condition boolean' },
      selectedBranch: { type: 'String', example: 'true', description: 'Executed output handle (true | false)' },
    },
  },
  tryCatch: {
    label: 'Try / Catch',
    icon: 'ShieldAlert',
    outputs: {
      status: { type: 'String', example: 'SUCCESS', description: 'Try/Catch result status' },
      error: { type: 'Object', example: { message: 'Timeout' }, description: 'Caught error details if failed' },
    },
  },
  log: {
    label: 'Log Output',
    icon: 'Terminal',
    outputs: {
      message: { type: 'String', example: 'Workflow log message', description: 'Logged string value' },
      timestamp: { type: 'String', example: '2026-08-04T08:00:00.000Z', description: 'Log timestamp' },
    },
  },
};

export const TRANSFORMATION_FUNCTIONS = [
  { name: 'upper', syntax: 'upper(path)', category: 'String', description: 'Converts text to uppercase' },
  { name: 'lower', syntax: 'lower(path)', category: 'String', description: 'Converts text to lowercase' },
  { name: 'trim', syntax: 'trim(path)', category: 'String', description: 'Removes leading & trailing whitespace' },
  { name: 'length', syntax: 'length(path)', category: 'String/Array', description: 'Returns character length or array item count' },
  { name: 'substring', syntax: 'substring(path, start, end)', category: 'String', description: 'Extracts substring' },
  { name: 'replace', syntax: 'replace(path, search, replace)', category: 'String', description: 'Replaces matching substring' },
  { name: 'split', syntax: 'split(path, separator)', category: 'Array', description: 'Splits string into array' },
  { name: 'join', syntax: 'join(arrayPath, separator)', category: 'Array', description: 'Joins array into string' },
  { name: 'json', syntax: 'json(path)', category: 'Utility', description: 'Parses JSON string or formats object to JSON' },
  { name: 'date', syntax: 'date(path)', category: 'Date', description: 'Converts value to ISO Date string' },
  { name: 'formatDate', syntax: 'formatDate(path, locale)', category: 'Date', description: 'Formats date to localized string' },
  { name: 'base64', syntax: 'base64(path)', category: 'Utility', description: 'Encodes value to Base64' },
  { name: 'urlEncode', syntax: 'urlEncode(path)', category: 'Utility', description: 'URL encodes string' },
  { name: 'urlDecode', syntax: 'urlDecode(path)', category: 'Utility', description: 'Decodes URL encoded string' },
  { name: 'math', syntax: 'math(expression)', category: 'Math', description: 'Evaluates mathematical expression' },
  { name: 'if', syntax: 'if(condition, trueVal, falseVal)', category: 'Logic', description: 'Ternary conditional logic' },
];

export class VariableEngine {
  // Storage Helpers for Favorites & Recents
  static getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleFavorite(varPath) {
    try {
      const current = this.getFavorites();
      const exists = current.includes(varPath);
      const updated = exists ? current.filter((p) => p !== varPath) : [...current, varPath];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  static getRecents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addRecent(varPath) {
    if (!varPath) return;
    try {
      const current = this.getRecents();
      const filtered = current.filter((p) => p !== varPath);
      const updated = [varPath, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  /**
   * Discovers and structures available variables from active workflow nodes & execution snapshots
   */
  static list(workflowNodes = [], executionSnapshot = null) {
    const nodesList = [];
    const favorites = this.getFavorites();
    const recents = this.getRecents();

    // 1. Process active Canvas Nodes
    workflowNodes.forEach((node) => {
      const nodeType = node.type || 'http';
      const label = node.data?.label || NODE_SCHEMA_REGISTRY[nodeType]?.label || nodeType;
      const schema = NODE_SCHEMA_REGISTRY[nodeType] || NODE_SCHEMA_REGISTRY.http;

      // Extract real runtime values if execution snapshot exists
      const runtimeOutputs = executionSnapshot?.outputs?.[node.id] || executionSnapshot?.outputs?.[nodeType];

      const outputsTree = this.buildOutputTree(
        nodeType,
        runtimeOutputs || schema.outputs
      );

      nodesList.push({
        id: node.id,
        nodeType: nodeType,
        nodeName: label,
        icon: schema.icon,
        status: runtimeOutputs ? 'SUCCESS' : 'IDLE',
        outputs: outputsTree,
      });
    });

    // Fallback default nodes if canvas has no nodes yet
    if (nodesList.length === 0) {
      Object.entries(NODE_SCHEMA_REGISTRY).slice(0, 5).forEach(([nodeType, schema], idx) => {
        nodesList.push({
          id: `${nodeType}_demo_${idx}`,
          nodeType: nodeType,
          nodeName: schema.label,
          icon: schema.icon,
          status: 'TEST_PAYLOAD',
          outputs: this.buildOutputTree(nodeType, schema.outputs),
        });
      });
    }

    // 2. System & Environment Variables
    const systemVars = [
      { path: '$now', name: 'Current ISO Timestamp', type: 'Date', example: new Date().toISOString() },
      { path: '$now.timestamp', name: 'Current Epoch Milliseconds', type: 'Number', example: Date.now() },
      { path: '$execution.id', name: 'Execution ID', type: 'String', example: 'exec_8f9a2b' },
      { path: '$execution.workflowId', name: 'Workflow ID', type: 'String', example: 'wf_4k2l1m' },
      { path: '$env.NODE_ENV', name: 'Node Environment', type: 'String', example: 'production' },
    ];

    return {
      nodes: nodesList,
      system: systemVars,
      favorites: favorites,
      recents: recents,
      functions: TRANSFORMATION_FUNCTIONS,
    };
  }

  /**
   * Helper to recursively turn output objects/primitives into structured tree nodes
   */
  static buildOutputTree(prefix, data, currentPath = prefix) {
    if (data === null || data === undefined) {
      return [{ path: currentPath, name: currentPath.split('.').pop(), type: 'Null', value: null }];
    }

    // Direct Schema format with type & example
    if (data.type && (data.example !== undefined || data.description !== undefined)) {
      return [
        {
          path: currentPath,
          name: currentPath.split('.').pop(),
          type: data.type,
          example: data.example,
          description: data.description,
        },
      ];
    }

    if (Array.isArray(data)) {
      const items = [];
      data.forEach((item, idx) => {
        const itemPath = `${currentPath}[${idx}]`;
        items.push({
          path: itemPath,
          name: `[${idx}]`,
          type: typeof item === 'object' ? (Array.isArray(item) ? 'Array' : 'Object') : this.detectType(item),
          value: item,
          children: typeof item === 'object' ? this.buildOutputTree(prefix, item, itemPath) : undefined,
        });
      });
      return items;
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return keys.map((key) => {
        const val = data[key];
        const itemPath = `${currentPath}.${key}`;
        const isObj = typeof val === 'object' && val !== null;
        return {
          path: itemPath,
          name: key,
          type: isObj ? (Array.isArray(val) ? 'Array' : 'Object') : this.detectType(val),
          value: isObj ? undefined : val,
          example: isObj ? undefined : val,
          description: val?.description,
          children: isObj ? this.buildOutputTree(prefix, val, itemPath) : undefined,
        };
      });
    }

    return [
      {
        path: currentPath,
        name: currentPath.split('.').pop(),
        type: this.detectType(data),
        value: data,
        example: data,
      },
    ];
  }

  static detectType(val) {
    if (val === null || val === undefined) return 'Null';
    if (typeof val === 'boolean') return 'Boolean';
    if (typeof val === 'number') return 'Number';
    if (Array.isArray(val)) return 'Array';
    if (typeof val === 'object') return 'Object';
    if (typeof val === 'string') {
      if (!isNaN(Date.parse(val)) && val.length > 10 && (val.includes('T') || val.includes('-'))) {
        return 'Date';
      }
      return 'String';
    }
    return 'String';
  }

  /**
   * Search variables by query matching name, path, type, or value
   */
  static search(query, nodesList = []) {
    if (!query || !query.trim()) return nodesList;
    const q = query.toLowerCase().trim();

    return nodesList
      .map((node) => {
        const matchingOutputs = this.filterTreeNodes(node.outputs, q);
        if (matchingOutputs.length > 0 || node.nodeName.toLowerCase().includes(q) || node.nodeType.toLowerCase().includes(q)) {
          return {
            ...node,
            outputs: matchingOutputs.length > 0 ? matchingOutputs : node.outputs,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  static filterTreeNodes(treeNodes = [], q) {
    const result = [];
    treeNodes.forEach((item) => {
      const match =
        item.name.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        String(item.value || '').toLowerCase().includes(q) ||
        String(item.example || '').toLowerCase().includes(q);

      const filteredChildren = item.children ? this.filterTreeNodes(item.children, q) : [];

      if (match || filteredChildren.length > 0) {
        result.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children,
        });
      }
    });
    return result;
  }

  /**
   * Evaluates inline text expressions with sample/runtime data
   */
  static resolve(template, sampleContext = {}) {
    if (typeof template !== 'string' || !template.includes('{{')) return template;

    return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, expr) => {
      const trimmed = expr.trim();
      if (!trimmed) return '';

      // Direct mock lookup
      if (sampleContext[trimmed] !== undefined) {
        return sampleContext[trimmed];
      }

      // Check simple functions: upper(x), lower(x), etc.
      const fnMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*\(([\s\S]*)\)$/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        const argStr = fnMatch[2].trim();
        const resolvedArg = sampleContext[argStr] !== undefined ? sampleContext[argStr] : argStr.replace(/['"]/g, '');

        switch (fnName) {
          case 'upper': return String(resolvedArg).toUpperCase();
          case 'lower': return String(resolvedArg).toLowerCase();
          case 'trim': return String(resolvedArg).trim();
          case 'length': return resolvedArg?.length || 0;
          case 'json': return typeof resolvedArg === 'object' ? JSON.stringify(resolvedArg) : String(resolvedArg);
          case 'base64': return btoa(String(resolvedArg));
          case 'urlEncode': return encodeURIComponent(String(resolvedArg));
          case 'date': return new Date().toISOString();
        }
      }

      // Default sample fallback
      for (const [k, v] of Object.entries(sampleContext)) {
        if (k.endsWith(`.${trimmed}`) || k === trimmed) {
          return String(v);
        }
      }
      return `[${trimmed}]`;
    });
  }

  /**
   * Validate expression string and check for syntax errors or unknown variables
   */
  static validate(template, sampleContext = {}) {
    if (typeof template !== 'string' || !template.includes('{{')) {
      return { isValid: true, unknownVars: [] };
    }

    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    const unknownVars = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      const expr = match[1].trim();
      if (expr && !expr.includes('(') && !expr.startsWith('$')) {
        const exists =
          sampleContext[expr] !== undefined ||
          Object.keys(sampleContext).some((k) => k.endsWith(`.${expr}`) || k.startsWith(expr.split('.')[0]));

        if (!exists) {
          unknownVars.push(expr);
        }
      }
    }

    return {
      isValid: unknownVars.length === 0,
      unknownVars,
    };
  }

  /**
   * Helper for autocomplete suggestions based on query typed inside {{ ... }}
   */
  static getAutocompleteSuggestions(query, nodesList = []) {
    const q = (query || '').toLowerCase().trim();
    const suggestions = [];

    // System variables
    if (q.startsWith('$') || '$'.startsWith(q)) {
      suggestions.push(
        { path: '$now', label: '$now', type: 'Date', description: 'Current timestamp' },
        { path: '$execution.id', label: '$execution.id', type: 'String', description: 'Current execution ID' },
        { path: '$env.NODE_ENV', label: '$env.NODE_ENV', type: 'String', description: 'Environment name' }
      );
    }

    // Node Output paths
    nodesList.forEach((node) => {
      const walkTree = (items) => {
        items.forEach((item) => {
          if (!q || item.path.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)) {
            suggestions.push({
              path: item.path,
              label: item.path,
              type: item.type,
              nodeName: node.nodeName,
              example: item.example || item.value,
            });
          }
          if (item.children) walkTree(item.children);
        });
      };
      if (node.outputs) walkTree(node.outputs);
    });

    // Functions
    TRANSFORMATION_FUNCTIONS.forEach((fn) => {
      if (!q || fn.name.toLowerCase().includes(q) || fn.syntax.toLowerCase().includes(q)) {
        suggestions.push({
          path: fn.syntax,
          label: fn.syntax,
          type: 'Function',
          description: fn.description,
          isFunction: true,
        });
      }
    });

    return suggestions.slice(0, 30); // Max 30 suggestions
  }
}
