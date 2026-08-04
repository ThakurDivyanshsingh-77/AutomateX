import { credentialService } from '../../credentials/credentialService.js';

/**
 * DatabaseCredentialManager — Resolves and decrypts database connection credentials.
 */
export class DatabaseCredentialManager {
  /**
   * Resolve database connection configuration from node config or vault
   */
  static async resolveCredentials(nodeConfig = {}, ownerId = null) {
    // If explicit inline connection params exist
    if (nodeConfig.connectionUri || nodeConfig.host) {
      return {
        connectionUri: nodeConfig.connectionUri,
        host: nodeConfig.host || 'localhost',
        port: nodeConfig.port,
        user: nodeConfig.username || nodeConfig.user,
        password: nodeConfig.password,
        database: nodeConfig.database,
      };
    }

    // If credentialId is referenced from Credential Vault
    if (nodeConfig.credentialId && ownerId) {
      try {
        const decrypted = await credentialService.getCredentialById(nodeConfig.credentialId, ownerId);
        return {
          connectionUri: decrypted.connectionUri || decrypted.data?.connectionUri,
          host: decrypted.host || decrypted.data?.host,
          port: decrypted.port || decrypted.data?.port,
          user: decrypted.username || decrypted.user || decrypted.data?.username,
          password: decrypted.password || decrypted.data?.password,
          database: decrypted.database || decrypted.data?.database,
        };
      } catch (err) {
        console.warn(`[DatabaseCredentialManager]: Credential lookup failed (${err.message}). Using default configuration.`);
      }
    }

    return {
      host: 'localhost',
      port: 5432,
      database: 'automatex',
    };
  }
}
