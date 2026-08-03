import { BaseExecutor } from './BaseExecutor.js';

export class HttpExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || {};
    const url = config.url || 'https://jsonplaceholder.typicode.com/todos/1';
    const method = (config.method || 'GET').toUpperCase();

    // Format headers
    const headersObj = {};
    if (Array.isArray(config.headers)) {
      config.headers.forEach((h) => {
        if (h.key && h.value) headersObj[h.key] = h.value;
      });
    } else if (typeof config.headers === 'string' && config.headers.trim()) {
      try {
        Object.assign(headersObj, JSON.parse(config.headers.trim()));
      } catch (e) {
        // ignore parse error
      }
    }

    const options = {
      method,
      headers: headersObj,
    };

    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && config.body) {
      options.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
      if (!headersObj['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, options);
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return {
      status: 'success',
      output: {
        statusCode: response.status,
        statusText: response.statusText,
        data,
      },
    };
  }
}
