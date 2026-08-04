import { DatabaseRegistry } from './DatabaseRegistry.js';
import { DatabaseCredentialManager } from './DatabaseCredentialManager.js';
import { DatabaseValidator } from './DatabaseValidator.js';

/**
 * DatabaseExecutor — Workflow execution handler for all database nodes.
 */
export class DatabaseExecutor {
  static async execute(node, context) {
    const startTime = Date.now();
    const config = node.data?.config || {};
    const dbEngine = (node.type || config.provider || 'mongodb').toLowerCase();

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
      const operation = (config.operation || 'find').toLowerCase();
      const target = config.collection || config.table || 'default';
      const query = config.query || {};
      const payload = config.document || config.data || {};
      let result = null;

      if (dbEngine === 'mongodb') {
        switch (operation) {
          case 'find':
            result = await provider.find(target, query, { limit: config.limit || 50 });
            break;
          case 'findone':
            result = await provider.findOne(target, query);
            break;
          case 'insert':
          case 'insertone':
            result = await provider.insert(target, payload);
            break;
          case 'insertmany':
            result = await provider.insertMany(target, Array.isArray(payload) ? payload : [payload]);
            break;
          case 'update':
          case 'updatemany':
            result = await provider.update(target, query, payload);
            break;
          case 'delete':
            result = await provider.delete(target, query);
            break;
          case 'aggregate':
            result = await provider.aggregate(target, Array.isArray(query) ? query : []);
            break;
          default:
            result = await provider.find(target, query);
        }
      } else {
        // Relational SQL (MySQL / Postgres)
        if (config.sql) {
          result = await provider.execute(config.sql, config.params || []);
        } else {
          switch (operation) {
            case 'select':
            case 'find':
              result = await provider.find(target, query, { limit: config.limit || 50 });
              break;
            case 'insert':
              result = await provider.insert(target, payload);
              break;
            case 'update':
              result = await provider.update(target, query, payload);
              break;
            case 'delete':
              result = await provider.delete(target, query);
              break;
            default:
              result = await provider.find(target, query);
          }
        }
      }

      await provider.disconnect();

      return {
        status: 'SUCCESS',
        outputs: {
          documents: result.documents || result.rows || [],
          rows: result.rows || result.documents || [],
          count: result.count || result.rowCount || (result.documents?.length || result.rows?.length || 0),
          affectedRows: result.affectedRows || result.modifiedCount || 0,
          insertedId: result.insertedId || null,
          matchedCount: result.matchedCount || 0,
          modifiedCount: result.modifiedCount || 0,
          executionTime: Date.now() - startTime,
          rawResponse: result,
        },
      };
    } catch (err) {
      await provider.disconnect();
      throw new Error(`Database execution failed: ${err.message}`);
    }
  }
}
