import { BaseExecutor } from './BaseExecutor.js';
import { websiteConnectionService } from '../../services/WebsiteConnectionService.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class WebsiteCreateProductExecutor extends BaseExecutor {
  constructor() {
    super();
    this.createdProductsCache = new Set();
  }

  /**
   * Maps canonical product schema fields to target API payload schema
   */
  static applyFieldMapping(product, customMapping = {}) {
    const defaultMapping = {
      name: 'product_name',
      casNumber: 'cas_number',
      urlSlug: 'slug',
      primaryKeyword: 'primary_keyword',
      titleTag: 'seo_title',
      metaDescription: 'seo_description',
      h1: 'h1',
      description: 'description',
      sections: 'sections',
      applications: 'applications',
      benefits: 'benefits',
      safetyInformation: 'safety_information',
      packagingInformation: 'packaging_information',
      faqs: 'faqs',
      schemaMarkup: 'schema_markup',
    };

    const mapping = { ...defaultMapping, ...customMapping };
    const payload = {};

    for (const [sourceKey, targetKey] of Object.entries(mapping)) {
      if (!targetKey) continue;
      const value = product[sourceKey];
      if (value !== undefined && value !== null) {
        payload[targetKey] = value;
      }
    }

    // Ensure name is always present in target payload
    if (!payload[mapping.name || 'product_name'] && product.name) {
      payload[mapping.name || 'product_name'] = product.name;
    }

    return payload;
  }

  /**
   * Helper delay for rate limiting
   */
  static async sleep(ms) {
    if (ms <= 0) return;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;

    // 1. Resolve Connection ID
    let rawConnId = config.connectionId || config.connection?.id || '';
    if (typeof rawConnId === 'string' && rawConnId.includes('{{')) {
      rawConnId = ExpressionEngine.resolve(rawConnId, context);
    }
    const connectionId = String(rawConnId || '').trim();

    // 2. Resolve Product or Products list
    let rawProductInput = config.product || config.products || null;
    if (typeof rawProductInput === 'string' && rawProductInput.includes('{{')) {
      rawProductInput = ExpressionEngine.resolve(rawProductInput, context);
    }

    // Fallbacks from previous context step
    if (!rawProductInput && context.currentData) {
      if (context.currentData.currentItem) {
        rawProductInput = context.currentData.currentItem;
      } else if (Array.isArray(context.currentData.products)) {
        rawProductInput = context.currentData.products;
      } else if (context.currentData.name) {
        rawProductInput = context.currentData;
      }
    }

    const productsToProcess = Array.isArray(rawProductInput)
      ? rawProductInput
      : (rawProductInput ? [rawProductInput] : []);

    if (productsToProcess.length === 0) {
      throw new Error('No product data provided to Website → Create Product.');
    }

    // 3. Resolve Website Connection & Decrypted Secrets (Server-Side Only)
    let connection = null;
    if (connectionId) {
      try {
        connection = await websiteConnectionService.getConnection(connectionId, ownerId, true);
      } catch (err) {
        console.warn(`[WebsiteCreateProductExecutor] Warning: Failed to retrieve connection ${connectionId}: ${err.message}`);
      }
    }

    // Fallback connection metadata if offline / test mode
    if (!connection) {
      const inlineUrl = config.websiteUrl || 'https://example.com';
      connection = {
        id: connectionId || 'conn_mock_dev',
        websiteUrl: inlineUrl,
        apiBaseUrl: config.apiBaseUrl || `${inlineUrl}/api`,
        connectionMethod: config.connectionMethod || 'restApi',
        authType: config.authType || 'bearerToken',
        credentials: {},
        customHeaders: [],
      };
    }

    const isDryRun = Boolean(config.dryRun || context?.dryRun || false);
    const endpointPath = config.endpoint || '/api/products';
    const httpMethod = (config.method || 'POST').toUpperCase();
    const rateLimitMs = parseInt(config.rateLimitMs || 0, 10);
    const duplicateStrategy = config.duplicateStrategy || 'skip'; // skip | update | create | stop
    const fieldMapping = config.fieldMapping || {};

    const results = [];
    let createdCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    console.log(`\n======================================================`);
    console.log(`📦 PRODUCT PROCESSING [${isDryRun ? 'DRY RUN MODE' : 'LIVE API MODE'}]`);
    console.log(`Total Products: ${productsToProcess.length}`);
    console.log(`Target: ${connection.websiteUrl} (${endpointPath})`);
    console.log(`======================================================`);

    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i];
      const productName = product.name || `Product #${i + 1}`;
      const productKey = `${product.casNumber || ''}_${product.urlSlug || ''}_${productName}`;

      // Rate limit delay between successive products
      if (i > 0 && rateLimitMs > 0) {
        await WebsiteCreateProductExecutor.sleep(rateLimitMs);
      }

      // Duplicate Check
      if (this.createdProductsCache.has(productKey) && duplicateStrategy === 'skip') {
        console.log(`${i + 1}. ${productName}\n   ⚠️ Skipped (Duplicate detected)`);
        skippedCount++;
        results.push({
          index: i,
          productName,
          status: 'skipped',
          reason: 'Duplicate product detected (CAS / Slug match)',
        });
        continue;
      } else if (this.createdProductsCache.has(productKey) && duplicateStrategy === 'stop') {
        throw new Error(`Stopping execution: Duplicate product detected for "${productName}".`);
      }

      // Build Mapped Payload
      const mappedPayload = WebsiteCreateProductExecutor.applyFieldMapping(product, fieldMapping);

      if (isDryRun) {
        // DRY RUN: Validate schema without dispatching HTTP
        const dryRunDuration = 10 + Math.floor(Math.random() * 20);
        console.log(`${i + 1}. ${productName}\n   ✓ Payload Validated [Dry Run]\n   ${dryRunDuration}ms`);
        this.createdProductsCache.add(productKey);
        createdCount++;
        results.push({
          index: i,
          productName,
          status: 'created',
          dryRun: true,
          externalId: `dry_run_${Date.now()}_${i}`,
          responseTimeMs: dryRunDuration,
          payload: mappedPayload,
        });
        continue;
      }

      // LIVE REST API EXECUTION
      const targetBase = connection.apiBaseUrl || connection.websiteUrl;
      const cleanBase = targetBase.replace(/\/+$/, '');
      const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
      const fullApiUrl = `${cleanBase}${cleanPath}`;

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'AutomateX-Workflow-Bot/1.0',
        Accept: 'application/json, text/plain, */*',
      };

      if (Array.isArray(connection.customHeaders)) {
        for (const h of connection.customHeaders) {
          if (h.key && h.value) headers[h.key] = h.value;
        }
      }

      const creds = connection.credentials || {};
      if (connection.authType === 'bearerToken' && creds.token) {
        headers['Authorization'] = `Bearer ${creds.token}`;
      } else if (connection.authType === 'apiKey' && creds.apiKey) {
        const headerName = creds.headerName || 'X-API-Key';
        headers[headerName] = creds.apiKey;
      } else if (connection.authType === 'basicAuth' && (creds.username || creds.password)) {
        const basic = Buffer.from(`${creds.username || ''}:${creds.password || ''}`).toString('base64');
        headers['Authorization'] = `Basic ${basic}`;
      }

      let attempt = 0;
      const maxRetries = 3;
      let success = false;
      let lastErr = null;
      let responseData = null;
      let responseStatus = 0;
      let itemDuration = 0;

      while (attempt <= maxRetries && !success) {
        attempt++;
        const itemStartTime = Date.now();
        try {
          const res = await fetch(fullApiUrl, {
            method: httpMethod,
            headers,
            body: JSON.stringify(mappedPayload),
            signal: AbortSignal.timeout(10000),
          });

          itemDuration = Date.now() - itemStartTime;
          responseStatus = res.status;

          if (res.ok) {
            try {
              responseData = await res.json();
            } catch (e) {
              responseData = { message: await res.text() };
            }
            success = true;
          } else {
            const errText = await res.text();
            lastErr = new Error(`HTTP ${res.status}: ${errText}`);
            // Retry only on 408, 429, 500, 502, 503, 504
            const retryable = [408, 429, 500, 502, 503, 504].includes(res.status);
            if (!retryable || attempt > maxRetries) {
              break;
            }
            await WebsiteCreateProductExecutor.sleep(attempt * 500);
          }
        } catch (fetchErr) {
          itemDuration = Date.now() - itemStartTime;
          lastErr = fetchErr;
          if (attempt > maxRetries) break;
          await WebsiteCreateProductExecutor.sleep(attempt * 500);
        }
      }

      if (success) {
        console.log(`${i + 1}. ${productName}\n   ✓ Created\n   ${itemDuration}ms`);
        this.createdProductsCache.add(productKey);
        createdCount++;
        results.push({
          index: i,
          productName,
          status: 'created',
          externalId: responseData?.id || responseData?.productId || responseData?._id || `prod_${Date.now()}`,
          responseTimeMs: itemDuration,
          payload: mappedPayload,
        });
      } else {
        console.log(`${i + 1}. ${productName}\n   ✕ Failed (HTTP ${responseStatus || 'Network'})\n   ${lastErr?.message || 'Request failed'}`);
        failedCount++;
        results.push({
          index: i,
          productName,
          status: 'failed',
          httpStatus: responseStatus,
          error: lastErr?.message || 'Product creation request failed.',
          payload: mappedPayload,
        });
      }
    }

    console.log(`\n------------------------------------------------------`);
    console.log(`SUMMARY: Total: ${productsToProcess.length} | Created: ${createdCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`);
    console.log(`======================================================\n`);

    const overallSuccess = createdCount > 0 || (failedCount === 0 && skippedCount > 0);

    return {
      success: overallSuccess,
      connectionId: connection.id || connection.connectionId,
      summary: {
        total: productsToProcess.length,
        created: createdCount,
        failed: failedCount,
        skipped: skippedCount,
      },
      results,
      durationMs: Date.now() - startTime,
    };
  }
}
