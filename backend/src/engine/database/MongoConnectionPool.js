import mongoose from 'mongoose';

/**
 * MongoConnectionPool.js
 * Production-grade MongoDB Connection Pooling Subsystem.
 * Caches active MongoDB connections across workflow executions to prevent connection overhead.
 */
export class MongoConnectionPool {
  static connections = new Map();

  /**
   * Get an active connection from the pool or establish a new connection.
   */
  static async getConnection(config = {}) {
    const uri = config.connectionUri || config.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/automatex';
    const dbName = config.databaseName || config.database || 'automatex';
    const poolKey = `${uri}_${dbName}`;

    if (this.connections.has(poolKey)) {
      const pooled = this.connections.get(poolKey);
      if (pooled.readyState === 1) {
        pooled.lastAccessed = Date.now();
        return pooled;
      }
    }

    const startTime = Date.now();
    try {
      // Connect or use primary mongoose connection
      if (mongoose.connection.readyState === 1 && !config.connectionUri) {
        this.connections.set(poolKey, {
          connection: mongoose.connection,
          readyState: 1,
          lastAccessed: Date.now(),
          latencyMs: Date.now() - startTime,
        });
        return mongoose.connection;
      }

      // Create new pool connection if URI provided
      const conn = await mongoose.createConnection(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }).asPromise();

      const poolEntry = {
        connection: conn,
        readyState: conn.readyState,
        lastAccessed: Date.now(),
        latencyMs: Date.now() - startTime,
      };

      this.connections.set(poolKey, poolEntry);
      return conn;
    } catch (err) {
      throw new Error(`MongoDB connection pool failed: ${err.message}`);
    }
  }

  /**
   * Health check / Ping connection and measure latency
   */
  static async healthCheck(config = {}) {
    const startTime = Date.now();
    try {
      if (mongoose.connection.readyState === 1) {
        const admin = mongoose.connection.db?.admin();
        let version = 'MongoDB v6.0';
        if (admin) {
          try {
            const serverInfo = await admin.serverStatus();
            if (serverInfo?.version) version = `MongoDB v${serverInfo.version}`;
          } catch {
            // fallback
          }
        }

        return {
          connected: true,
          status: 'Connected Successfully',
          latencyMs: Date.now() - startTime,
          version,
          database: config.databaseName || 'automatex',
          lastTested: new Date().toISOString(),
        };
      }

      const conn = await this.getConnection(config);
      const isReady = conn.readyState === 1;
      return {
        connected: isReady,
        status: isReady ? 'Connected Successfully' : 'Connection Failed',
        latencyMs: Date.now() - startTime,
        version: 'MongoDB v6.0',
        database: config.databaseName || 'automatex',
        lastTested: new Date().toISOString(),
      };
    } catch (err) {
      return {
        connected: false,
        status: 'Connection Failed',
        latencyMs: Date.now() - startTime,
        error: err.message,
        lastTested: new Date().toISOString(),
      };
    }
  }

  /**
   * Get active connection pool statistics for dashboard
   */
  static getPoolStatus() {
    return {
      activeConnections: this.connections.size + (mongoose.connection.readyState === 1 ? 1 : 0),
      totalPoolCount: this.connections.size,
      connections: Array.from(this.connections.entries()).map(([key, item]) => ({
        poolKey: key.replace(/\/\/.*@/, '//***:***@'), // Mask credentials
        readyState: item.readyState,
        lastAccessed: new Date(item.lastAccessed).toISOString(),
        latencyMs: item.latencyMs,
      })),
    };
  }

  /**
   * Close all idle connections in pool
   */
  static async drainPool() {
    for (const [key, item] of this.connections.entries()) {
      try {
        if (item.connection?.close) await item.connection.close();
      } catch {
        // ignore
      }
    }
    this.connections.clear();
  }
}
