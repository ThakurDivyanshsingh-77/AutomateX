import { DatabaseRegistry } from './DatabaseRegistry.js';
import { DatabaseCredentialManager } from './DatabaseCredentialManager.js';
import { DatabaseValidator } from './DatabaseValidator.js';

/**
 * DatabaseExecutor — Workflow execution handler for all database nodes.
 * Supports standard database operations and specific MongoDB CRUD node types.
 */
export class DatabaseExecutor {
  static async execute(node, context) {
    const startTime = Date.now();
    const config = node.config || node.data?.config || {};
    const nodeType = (node.type || '').toLowerCase();

    // Map Mongo CRUD node types to operations
    let operation = (config.operation || 'find').toLowerCase();
    if (nodeType === 'mongoinsertone') operation = 'insertone';
    else if (nodeType === 'mongofind') operation = 'find';
    else if (nodeType === 'mongofindone') operation = 'findone';
    else if (nodeType === 'mongoupdateone') operation = 'updateone';
    else if (nodeType === 'mongodeleteone') operation = 'deleteone';
    else if (nodeType === 'mongocount') operation = 'count';
    else if (nodeType === 'mongoaggregate') operation = 'aggregate';

    const dbEngine = (config.provider || (nodeType.startsWith('mongo') ? 'mongodb' : nodeType) || 'mongodb').toLowerCase();

    // 1. Validate query safety
    const validation = DatabaseValidator.validate(dbEngine, config);
    if (!validation.isValid) {
      throw new Error(`Database validation failed: ${validation.errors.join(', ')}`);
    }

    // 2. Resolve credentials
    const credentials = await DatabaseCredentialManager.resolveCredentials(config, context.ownerId);

    // 3. Create database provider instance from Registry
    const provider = DatabaseRegistry.createInstance(dbEngine, credentials);
    await provider.connect();

    try {
      const target = config.collection || config.table || 'default';

      // Parse JSON inputs if strings were passed
      let query = config.query || config.filter || {};
      if (typeof query === 'string') {
        try { query = JSON.parse(query); } catch { query = {}; }
      }

      let payload = config.document || config.data || config.update || {};
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      let result = null;
      let outputs = {};

      if (dbEngine === 'mongodb' || dbEngine.startsWith('mongo')) {
        switch (operation) {
          case 'insert':
          case 'insertone':
            result = await provider.insert(target, payload);
            outputs = {
              insertedId: result.insertedId || `id_${Date.now()}`,
              acknowledged: true,
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'findone':
            result = await provider.findOne(target, query);
            const docObj = (result && typeof result === 'object' && 'document' in result) ? result.document : (result?.documents ? result.documents[0] : result);
            outputs = {
              document: docObj || null,
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'find':
            result = await provider.find(target, query, { limit: config.limit || 50 });
            outputs = {
              documents: result.documents || [],
              count: result.count || (result.documents ? result.documents.length : 0),
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'update':
          case 'updateone':
            result = await provider.update(target, query, payload);
            outputs = {
              matchedCount: result.matchedCount || result.modifiedCount || 1,
              modifiedCount: result.modifiedCount || 1,
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'delete':
          case 'deleteone':
            result = await provider.delete(target, query);
            outputs = {
              deletedCount: result.deletedCount || result.modifiedCount || 1,
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'count':
            result = await provider.find(target, query);
            outputs = {
              count: result.count || (result.documents ? result.documents.length : 0),
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          case 'aggregate':
            const pipeline = Array.isArray(query) ? query : [];
            result = await provider.aggregate(target, pipeline);
            outputs = {
              results: result.documents || [],
              count: result.count || (result.documents ? result.documents.length : 0),
              executionTime: Date.now() - startTime,
              rawResponse: result,
            };
            break;

          default:
            result = await provider.find(target, query);
            outputs = {
              documents: result.documents || [],
              count: result.count || 0,
              executionTime: Date.now() - startTime,
            };
        }
      } else {
        // Relational SQL (MySQL / Postgres)
        if (config.sql) {
          result = await provider.execute(config.sql, config.params || []);
        } else {
          result = await provider.find(target, query, { limit: config.limit || 50 });
        }
        outputs = {
          documents: result.documents || result.rows || [],
          rows: result.rows || result.documents || [],
          count: result.count || result.rowCount || 0,
          executionTime: Date.now() - startTime,
          rawResponse: result,
        };
      }

      await provider.disconnect();

      return {
        status: 'SUCCESS',
        outputs,
      };
    } catch (err) {
      await provider.disconnect();
      throw new Error(`Database execution failed: ${err.message}`);
    }
  }
}
