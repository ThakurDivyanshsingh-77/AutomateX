/**
 * DatabaseValidator — Sanitizes and validates query parameters to prevent SQL injection.
 */
export class DatabaseValidator {
  /**
   * Validate node configuration and query safety
   */
  static validate(nodeType, config = {}) {
    const errors = [];
    const dbType = (nodeType || 'mongodb').toLowerCase();

    if (dbType === 'mongodb') {
      if (!config.collection && !config.target) {
        errors.push('MongoDB collection name is required.');
      }
    } else if (dbType === 'mysql' || dbType === 'postgres' || dbType === 'databasequery') {
      if (!config.table && !config.query && !config.sql) {
        errors.push('SQL table name or raw query is required.');
      }

      // Security Check: Flag dangerous un-parameterized raw string concatenations
      const sql = (config.query || config.sql || '').toString();
      if (sql && (sql.includes("'+") || sql.includes('"+') || sql.includes('${'))) {
        errors.push('SQL Injection Warning: Direct string concatenation detected in query. Use parameterized values (?) or ($1).');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
