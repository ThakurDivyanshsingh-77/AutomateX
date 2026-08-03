import { Credential } from './Credential.js';
import { credentialCrypto } from './credentialCrypto.js';
import mongoose from 'mongoose';

const inMemoryCredentials = [];

export const credentialService = {
  createCredential: async (ownerId, data) => {
    const { encryptedData, maskedValue } = credentialCrypto.encrypt(data.secret);

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
    return inMemoryCredentials;
  },

  /**
   * Get credentials filtered by service type (e.g., 'gmail')
   */
  getCredentialsByService: async (ownerId, service) => {
    if (mongoose.connection.readyState === 1) {
      return await Credential.find({ owner: ownerId, service }).sort({ createdAt: -1 });
    }
    return inMemoryCredentials.filter((c) => c.service === service);
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
   * Get decrypted plain-text secret (for simple API key / bearer token credentials)
   */
  getDecryptedSecret: async (ownerId, credentialId) => {
    if (mongoose.connection.readyState === 1) {
      const cred = await Credential.findOne({ _id: credentialId, owner: ownerId }).select('+encryptedData');
      if (!cred) return null;
      return credentialCrypto.decrypt(cred.encryptedData);
    } else {
      const cred = inMemoryCredentials.find((c) => c._id === credentialId);
      if (!cred) return null;
      return credentialCrypto.decrypt(cred.encryptedData);
    }
  },

  /**
   * Get decrypted OAuth2 data as a parsed JSON object.
   * Used by GmailPlugin, SlackPlugin, etc.
   * Returns: { clientId, clientSecret, refreshToken, accessToken, expiryDate, userEmail }
   *
   * NOTE: No ownerId check here — executors run server-side and need direct access.
   *       The workflow is already owned by the user, so indirect ownership is guaranteed.
   */
  getDecryptedOAuthData: async (credentialId) => {
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
      throw new Error('Credential data is not valid OAuth JSON. Please reconnect the account.');
    }
  },
};
