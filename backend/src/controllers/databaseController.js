import { DatabaseRegistry } from '../engine/database/DatabaseRegistry.js';
import { DatabaseCredentialManager } from '../engine/database/DatabaseCredentialManager.js';
import { DatabaseValidator } from '../engine/database/DatabaseValidator.js';
import { MongoConnectionPool } from '../engine/database/MongoConnectionPool.js';

export const getDatabaseProviders = async (req, res, next) => {
  try {
    const providers = DatabaseRegistry.list();
    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (err) {
    next(err);
  }
};

export const getDatabaseConnections = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      connections: [
        { id: 'conn_mongo_default', name: 'Primary MongoDB', provider: 'mongodb', host: 'localhost:27017' },
        { id: 'conn_mysql_default', name: 'Production MySQL', provider: 'mysql', host: 'localhost:3306' },
        { id: 'conn_pg_default', name: 'Analytics Postgres', provider: 'postgres', host: 'localhost:5432' },
      ],
    });
  } catch (err) {
    next(err);
  }
};

export const testMongoConnection = async (req, res, next) => {
  try {
    const { connectionUri, databaseName, username, password, authDatabase, tlsEnable } = req.body;
    const health = await MongoConnectionPool.healthCheck({
      connectionUri,
      databaseName,
      username,
      password,
      authDatabase,
      tlsEnable,
    });

    if (health.connected) {
      return res.status(200).json({
        success: true,
        message: 'Connected Successfully',
        version: health.version,
        latencyMs: health.latencyMs,
        database: health.database,
        health,
      });
    }

    return res.status(400).json({
      success: false,
      message: health.error || 'Connection Failed',
      latencyMs: health.latencyMs,
      health,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `MongoDB connection test failed: ${err.message}`,
    });
  }
};

export const getMongoStatus = async (req, res, next) => {
  try {
    const status = MongoConnectionPool.getPoolStatus();
    return res.status(200).json({
      success: true,
      status,
    });
  } catch (err) {
    next(err);
  }
};

export const testDatabaseConnection = async (req, res, next) => {
  try {
    const { provider, host, port, username, password, database, connectionUri } = req.body;
    const providerId = (provider || 'mongodb').toLowerCase();

    if (providerId === 'mongodb') {
      return testMongoConnection(req, res, next);
    }

    const instance = DatabaseRegistry.createInstance(providerId, {
      connectionUri,
      host,
      port,
      user: username,
      password,
      database,
    });

    await instance.connect();
    const health = await instance.healthCheck();
    await instance.disconnect();

    return res.status(200).json({
      success: true,
      provider: providerId,
      health,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Connection test failed: ${err.message}`,
    });
  }
};

export const executeDatabaseQuery = async (req, res, next) => {
  try {
    const { provider, collection, table, query, sql, params, limit = 20 } = req.body;
    const providerId = (provider || 'mongodb').toLowerCase();

    const validation = DatabaseValidator.validate(providerId, { collection, table, query, sql });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`,
      });
    }

    const instance = DatabaseRegistry.createInstance(providerId, req.body);
    await instance.connect();

    let result = null;
    const target = collection || table || 'default';

    if (providerId === 'mongodb') {
      result = await instance.find(target, query || {}, { limit });
    } else {
      if (sql) {
        result = await instance.execute(sql, params || []);
      } else {
        result = await instance.find(target, query || {}, { limit });
      }
    }

    await instance.disconnect();

    const rows = result.documents || result.rows || [];
    return res.status(200).json({
      success: true,
      provider: providerId,
      totalReturned: rows.length,
      previewRows: rows.slice(0, 20),
      rawResponse: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Query execution failed: ${err.message}`,
    });
  }
};
