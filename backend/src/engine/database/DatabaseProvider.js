/**
 * DatabaseProvider.js
 * Abstract Base Class for Universal Database Framework.
 * Every database engine (MongoDB, MySQL, PostgreSQL, Redis, etc.) must implement this interface.
 */

export class DatabaseProvider {
  constructor(config = {}) {
    if (new.target === DatabaseProvider) {
      throw new TypeError('Cannot construct DatabaseProvider abstract instances directly.');
    }
    this.config = config;
    this.isConnected = false;
  }

  /**
   * Connect to the database engine
   */
  async connect() {
    throw new Error('DatabaseProvider.connect() must be implemented.');
  }

  /**
   * Disconnect from the database engine
   */
  async disconnect() {
    throw new Error('DatabaseProvider.disconnect() must be implemented.');
  }

  /**
   * Health check / ping connection and measure latency
   */
  async healthCheck() {
    throw new Error('DatabaseProvider.healthCheck() must be implemented.');
  }

  /**
   * Find / SELECT multiple records
   */
  async find(target, query = {}, options = {}) {
    throw new Error('DatabaseProvider.find() must be implemented.');
  }

  /**
   * Find / SELECT single record
   */
  async findOne(target, query = {}, options = {}) {
    throw new Error('DatabaseProvider.findOne() must be implemented.');
  }

  /**
   * Insert single record
   */
  async insert(target, document = {}) {
    throw new Error('DatabaseProvider.insert() must be implemented.');
  }

  /**
   * Insert multiple records
   */
  async insertMany(target, documents = []) {
    throw new Error('DatabaseProvider.insertMany() must be implemented.');
  }

  /**
   * Update single or multiple records
   */
  async update(target, filter = {}, updateDoc = {}, options = {}) {
    throw new Error('DatabaseProvider.update() must be implemented.');
  }

  /**
   * Delete records
   */
  async delete(target, filter = {}) {
    throw new Error('DatabaseProvider.delete() must be implemented.');
  }

  /**
   * Execute aggregation pipeline or custom query string
   */
  async aggregate(target, pipeline = []) {
    throw new Error('DatabaseProvider.aggregate() must be implemented.');
  }

  /**
   * Execute raw parameterized query
   */
  async execute(sqlOrQuery, params = []) {
    throw new Error('DatabaseProvider.execute() must be implemented.');
  }

  /**
   * Validate parameters before execution
   */
  validate(config) {
    return { isValid: true, errors: [] };
  }
}
