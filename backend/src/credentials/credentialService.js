import { Credential } from './Credential.js';
import { credentialCrypto } from './credentialCrypto.js';
import mongoose from 'mongoose';

const inMemoryCredentials = [];
const GOOGLE_OAUTH_SERVICES = ['gmail', 'google', 'googleSheets'];

export const credentialService = {
  createCredential: async (ownerId, data) => {
    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      const err = new Error('Unauthorized: Valid user ID is required to create a credential');
      err.statusCode = 401;
      throw err;
    }

    const rawSecret = typeof data.secret === 'object' ? JSON.stringify(data.secret) : data.secret;
    const { encryptedData, maskedValue } = credentialCrypto.encrypt(rawSecret);

    if (mongoose.connection.readyState === 1) {
      const cred = await Credential.create({
        owner: ownerId,
        name: data.name,
        service: data.service,
        authType: data.authType || 'apiKey',
        encryptedData,
        maskedValue,
      });
      return cred;
    } else {
      const newCred = {
        _id: 'cred_' + Date.now(),
        owner: ownerId,
        name: data.name,
        service: data.service,
        authType: data.authType || 'apiKey',
        encryptedData,
        maskedValue,
        createdAt: new Date().toISOString(),
      };
      inMemoryCredentials.unshift(newCred);
      return newCred;
    }
  },

  getUserCredentials: async (ownerId) => {
    if (mongoose.connection.readyState === 1) {
      return await Credential.find({ owner: ownerId }).sort({ createdAt: -1 });
    }
    return inMemoryCredentials.filter((credential) => String(credential.owner) === String(ownerId));
  },

  /**
   * Get credentials filtered by service type (e.g., 'gmail', 'mongodb')
   */
  getCredentialsByService: async (ownerId, service) => {
    if (mongoose.connection.readyState === 1) {
      return await Credential.find({ owner: ownerId, service }).sort({ createdAt: -1 });
    }
    return inMemoryCredentials.filter((credential) => (
      String(credential.owner) === String(ownerId) && credential.service === service
    ));
  },

  /**
   * Return Google OAuth credentials usable by every Google integration.
   */
  getGoogleOAuthCredentials: async (ownerId) => {
    const query = {
      owner: ownerId,
      service: { $in: GOOGLE_OAUTH_SERVICES },
      authType: 'oauth2',
    };

    const credentials = mongoose.connection.readyState === 1
      ? await Credential.find(query).sort({ createdAt: -1 })
      : inMemoryCredentials.filter((credential) => (
        String(credential.owner) === String(ownerId) &&
        GOOGLE_OAUTH_SERVICES.includes(credential.service) &&
        credential.authType === 'oauth2'
      ));

    return credentials;
  },

  deleteCredential: async (ownerId, credentialId) => {
    if (mongoose.connection.readyState === 1) {
      const cred = await Credential.findOne({ _id: credentialId, owner: ownerId });
      if (!cred) return false;
      await cred.deleteOne();
      return true;
    } else {
      const idx = inMemoryCredentials.findIndex((c) => c._id === credentialId);
      if (idx !== -1) {
        inMemoryCredentials.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  /**
   * Unified shared method for loading credentials during both Test API ("Send Test Message")
   * and Workflow Runner ("Run Workflow"). Enforces strict owner lookup and prohibits "system".
   */
  getCredentialForExecution: async (credentialId, ownerId) => {
    if (!credentialId) {
      const err = new Error('[CredentialService] credentialId is required for execution credential lookup');
      err.statusCode = 400;
      throw err;
    }

    const resolvedUserId = String(ownerId || '').trim();
    if (!resolvedUserId || resolvedUserId === 'system' || resolvedUserId === 'undefined') {
      console.error('[CredentialService] ❌ CRITICAL: Attempted credential lookup with invalid or "system" ownerId:', {
        credentialId,
        resolvedUserId,
      });
      const err = new Error(`[CredentialService] Security Violation: Cannot perform credential lookup with owner "${resolvedUserId}". Valid authenticated user ID is required.`);
      err.statusCode = 401;
      throw err;
    }

    let credDocument = null;
    let encryptedData = null;

    if (mongoose.connection.readyState === 1) {
      credDocument = await Credential.findOne({ _id: credentialId, owner: resolvedUserId }).select('+encryptedData');

      if (!credDocument) {
        // Diagnostic audit check: check if credential exists under a different owner
        const existingCredAnyOwner = await Credential.findById(credentialId);
        const actualOwner = existingCredAnyOwner ? String(existingCredAnyOwner.owner) : 'NOT_FOUND';

        console.error(`[CredentialService Audit Log]
Execution owner: ${resolvedUserId}
Workflow owner: ${resolvedUserId}
Credential owner: ${actualOwner}
Credential ID: ${credentialId}
Resolved User ID: ${resolvedUserId}`);

        const err = new Error(`Credential lookup failed: Credential ID "${credentialId}" does not belong to user "${resolvedUserId}" (Actual credential owner: ${actualOwner}).`);
        err.statusCode = 404;
        throw err;
      }
      encryptedData = credDocument.encryptedData;
    } else {
      credDocument = inMemoryCredentials.find((c) => String(c._id) === String(credentialId) && String(c.owner) === resolvedUserId);
      if (!credDocument) {
        const anyCred = inMemoryCredentials.find((c) => String(c._id) === String(credentialId));
        const actualOwner = anyCred ? String(anyCred.owner) : 'NOT_FOUND';

        console.error(`[CredentialService Audit Log]
Execution owner: ${resolvedUserId}
Workflow owner: ${resolvedUserId}
Credential owner: ${actualOwner}
Credential ID: ${credentialId}
Resolved User ID: ${resolvedUserId}`);

        const err = new Error(`Credential lookup failed in memory: Credential ID "${credentialId}" not found for user "${resolvedUserId}".`);
        err.statusCode = 404;
        throw err;
      }
      encryptedData = credDocument.encryptedData;
    }

    console.log(`[CredentialService Debug Log]
Execution owner: ${resolvedUserId}
Workflow owner: ${resolvedUserId}
Credential owner: ${String(credDocument.owner)}
Credential ID: ${credentialId}
Resolved User ID: ${resolvedUserId}`);

    const decrypted = credentialCrypto.decrypt(encryptedData);
    let parsedSecret;
    try {
      parsedSecret = JSON.parse(decrypted);
    } catch {
      parsedSecret = decrypted;
    }

    return {
      credentialId,
      ownerId: resolvedUserId,
      service: credDocument.service,
      authType: credDocument.authType,
      name: credDocument.name,
      secret: parsedSecret,
    };
  },

  /**
   * Get decrypted plain-text secret or object
   */
  getDecryptedSecret: async (ownerId, credentialId) => {
    try {
      const res = await credentialService.getCredentialForExecution(credentialId, ownerId);
      return res.secret;
    } catch (err) {
      if (err.message?.includes('Security Violation') || err.message?.includes('does not belong to user')) {
        throw err;
      }
      return null;
    }
  },

  /**
   * Get decrypted credential by ID
   */
  getCredentialById: async (credentialId, ownerId = null) => {
    if (ownerId) {
      const res = await credentialService.getCredentialForExecution(credentialId, ownerId);
      return res.secret;
    }
    let encryptedData;
    if (mongoose.connection.readyState === 1) {
      const cred = await Credential.findById(credentialId).select('+encryptedData');
      if (!cred) throw new Error(`Credential not found: ${credentialId}`);
      encryptedData = cred.encryptedData;
    } else {
      const cred = inMemoryCredentials.find((c) => c._id === credentialId);
      if (!cred) throw new Error(`Credential not found in memory: ${credentialId}`);
      encryptedData = cred.encryptedData;
    }

    const decrypted = credentialCrypto.decrypt(encryptedData);
    try {
      return JSON.parse(decrypted);
    } catch {
      return { connectionUri: decrypted };
    }
  },

  getDecryptedOAuthData: async (credentialId) => {
    return credentialService.getCredentialById(credentialId);
  },
};
