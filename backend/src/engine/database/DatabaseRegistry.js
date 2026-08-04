import { MongoProvider } from './MongoProvider.js';
import { MySQLProvider } from './MySQLProvider.js';
import { PostgresProvider } from './PostgresProvider.js';

/**
 * DatabaseRegistry — Singleton registry managing database providers.
 * Allows registering custom database engines dynamically without modifying WorkflowEngine.
 */
export class DatabaseRegistry {
  static providers = new Map();

  static initialize() {
    this.register('mongodb', MongoProvider, {
      label: 'MongoDB Database',
      type: 'nosql',
      icon: 'Database',
      defaultPort: 27017,
      supportedOperations: ['find', 'findOne', 'insert', 'insertMany', 'update', 'delete', 'aggregate'],
    });

    this.register('mysql', MySQLProvider, {
      label: 'MySQL Relational Database',
      type: 'sql',
      icon: 'Database',
      defaultPort: 3306,
      supportedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'UPSERT', 'TRANSACTION'],
    });

    this.register('postgres', PostgresProvider, {
      label: 'PostgreSQL Relational Database',
      type: 'sql',
      icon: 'Database',
      defaultPort: 5432,
      supportedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'UPSERT', 'JSONB', 'TRANSACTION'],
    });
  }

  /**
   * Register a new database provider class
   */
  static register(providerId, ProviderClass, metadata = {}) {
    const key = providerId.toLowerCase();
    this.providers.set(key, {
      id: key,
      ProviderClass,
      metadata,
    });
    return this.providers.get(key);
  }

  /**
   * Get registered provider instance factory
   */
  static get(providerId) {
    if (this.providers.size === 0) this.initialize();
    const key = (providerId || 'mongodb').toLowerCase();
    return this.providers.get(key) || this.providers.get('mongodb');
  }

  /**
   * Create an instantiated provider for a given type & configuration
   */
  static createInstance(providerId, config = {}) {
    const providerMeta = this.get(providerId);
    if (!providerMeta || !providerMeta.ProviderClass) {
      throw new Error(`Unsupported database provider: ${providerId}`);
    }
    return new providerMeta.ProviderClass(config);
  }

  /**
   * List all registered providers with metadata
   */
  static list() {
    if (this.providers.size === 0) this.initialize();
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      ...p.metadata,
    }));
  }
}
