import { BaseExecutor } from './BaseExecutor.js';
import axios from 'axios';
import vm from 'vm';

export class HttpRequestExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    const url = this.interpolate(config.url || 'https://jsonplaceholder.typicode.com/todos/1', context);
    const method = (config.method || 'GET').toUpperCase();
    
    let headers = {};
    if (config.headers) {
      try {
        const rawHeaders = typeof config.headers === 'string' ? JSON.parse(config.headers) : config.headers;
        for (const [key, val] of Object.entries(rawHeaders)) {
          headers[key] = this.interpolate(val, context);
        }
      } catch (e) {
        // Fallback if headers string isn't JSON
      }
    }

    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method) && config.body) {
      const interpolatedBody = this.interpolate(config.body, context);
      try {
        body = JSON.parse(interpolatedBody);
      } catch (e) {
        body = interpolatedBody;
      }
    }

    const response = await axios({
      method,
      url,
      headers,
      data: body,
      timeout: config.timeout || 10000,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    };
  }
}

export class DelayExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    const seconds = Math.min(Math.max(Number(config.seconds) || 1, 1), 60); // Cap between 1s and 60s
    
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));

    return {
      delayedSeconds: seconds,
      resumedAt: new Date().toISOString(),
    };
  }
}

export class CodeTransformExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    const code = config.code || 'return { transformed: true, input: $input };';
    const input = context.getLastStepOutput() || {};

    const sandbox = {
      $input: input,
      $context: context.getAllOutputs(),
      console: {
        log: (...args) => console.log('[Workflow Code Log]:', ...args),
      },
      result: null,
    };

    const vmContext = vm.createContext(sandbox);
    const wrappedCode = `
      (function() {
        ${code}
      })()
    `;

    const script = new vm.Script(wrappedCode, { timeout: 2000 });
    const output = script.runInContext(vmContext);

    return {
      result: output,
      executedAt: new Date().toISOString(),
    };
  }
}

export class ConditionExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    const field = this.interpolate(config.field || '', context);
    const operator = config.operator || 'equals';
    const compareValue = this.interpolate(config.value || '', context);

    let isTrue = false;
    switch (operator) {
      case 'equals':
        isTrue = String(field) === String(compareValue);
        break;
      case 'not_equals':
        isTrue = String(field) !== String(compareValue);
        break;
      case 'contains':
        isTrue = String(field).includes(String(compareValue));
        break;
      case 'greater_than':
        isTrue = Number(field) > Number(compareValue);
        break;
      case 'less_than':
        isTrue = Number(field) < Number(compareValue);
        break;
      case 'exists':
        isTrue = field !== undefined && field !== null && field !== '';
        break;
      default:
        isTrue = Boolean(field);
    }

    return {
      conditionMet: isTrue,
      branch: isTrue ? 'true' : 'false',
      evaluatedField: field,
      operator,
      compareValue,
    };
  }
}

export class LogActionExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    const message = this.interpolate(config.message || 'Log message from node', context);
    const lastOutput = context.getLastStepOutput();

    console.log(`[Workflow Execution Log Node ${node.id}]:`, message, lastOutput);

    return {
      loggedMessage: message,
      payload: lastOutput,
      timestamp: new Date().toISOString(),
    };
  }
}
