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
   * `gmail` is the canonical service for credentials created by the shared
   * Google OAuth callback; the other values preserve legacy credentials.
   */
  getGoogleOAuthCredentials: async (ownerId) => {
    const query = {
      owner: ownerId,
      service: { $in: GOOGLE_OAUTH_SERVICES },
      authType: 'oauth2',
    };

    console.debug('[CredentialService] Google OAuth credential query', {
      ownerId: String(ownerId),
      query: { service: query.service, authType: query.authType },
      storage: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory',
    });

    const credentials = mongoose.connection.readyState === 1
      ? await Credential.find(query).sort({ createdAt: -1 })
      : inMemoryCredentials.filter((credential) => (
        String(credential.owner) === String(ownerId) &&
        GOOGLE_OAUTH_SERVICES.includes(credential.service) &&
        credential.authType === 'oauth2'
      ));

    console.debug('[CredentialService] Google OAuth credentials returned', {
      ownerId: String(ownerId),
      count: credentials.length,
      credentialIds: credentials.map((credential) => String(credential._id)),
    });
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
   * Get decrypted plain-text secret or object
   */
  getDecryptedSecret: async (ownerId, credentialId) => {
    let encryptedData;
    if (mongoose.connection.readyState === 1) {
      const cred = await Credential.findOne({ _id: credentialId, owner: ownerId }).select('+encryptedData');
      if (!cred) return null;
      encryptedData = cred.encryptedData;
    } else {
      const cred = inMemoryCredentials.find((credential) => (
        credential._id === credentialId && (!ownerId || String(credential.owner) === String(ownerId))
      ));
      if (!cred) return null;
      encryptedData = cred.encryptedData;
    }

    const decrypted = credentialCrypto.decrypt(encryptedData);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  },

  /**
   * Get decrypted credential by ID
   */
  getCredentialById: async (credentialId, ownerId = null) => {
    let encryptedData;
    if (mongoose.connection.readyState === 1) {
      const query = ownerId ? { _id: credentialId, owner: ownerId } : { _id: credentialId };
      const cred = await Credential.findOne(query).select('+encryptedData');
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

  /**
   * Get decrypted OAuth2 data as a parsed JSON object.
   */
  getDecryptedOAuthData: async (credentialId) => {
    return credentialService.getCredentialById(credentialId);
  },
};
