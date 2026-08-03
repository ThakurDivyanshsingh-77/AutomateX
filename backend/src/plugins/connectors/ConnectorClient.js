export class ConnectorClient {
  static async request(options) {
    const { url, method = 'GET', headers = {}, body = null, secret = null } = options;

    const requestHeaders = { ...headers };

    // Inject decrypted secret into headers if available
    if (secret) {
      if (secret.startsWith('https://hooks.slack.com') || secret.startsWith('https://discord.com/api/webhooks')) {
        // Webhook URL secret handled directly
      } else {
        requestHeaders['Authorization'] = secret.startsWith('Bearer ') ? secret : `Bearer ${secret}`;
      }
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
    }

    const targetUrl = secret && secret.startsWith('http') ? secret : url;
    const response = await fetch(targetUrl, fetchOptions);

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`Connector request failed (${response.status}): ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return {
      status: response.status,
      data,
    };
  }
}
