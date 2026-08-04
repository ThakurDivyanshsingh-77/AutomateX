import { credentialService } from '../credentials/credentialService.js';
import { googleOAuthClient } from '../oauth/GoogleOAuthClient.js';
import { google } from 'googleapis';

export const createCredential = async (req, res, next) => {
  console.log('=== CREATE CREDENTIAL ===');
  console.log('Incoming Payload:', req.body);

  try {
    const { name, service, authType, secret } = req.body;
    if (!name || !service || !secret) {
      console.warn('Validation Failed: Missing name, service, or secret');
      return res.status(400).json({ success: false, message: 'Name, service, and secret are required' });
    }

    console.log('Validation Passed');
    console.log('Encrypting Secret');
    console.log('Creating Credential Document');

    const cred = await credentialService.createCredential(req.user._id, {
      name,
      service,
      authType,
      secret,
    });

    console.log('Saving to MongoDB');
    console.log('Credential Saved Successfully');

    return res.status(201).json({
      success: true,
      message: 'Credential created and encrypted in vault',
      credential: cred,
    });
  } catch (error) {
    console.error('=== CREATE CREDENTIAL FAILED ===');
    console.error(error);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save credential to vault',
      stack: error.stack,
    });
  }
};

export const getUserCredentials = async (req, res, next) => {
  try {
    const credentials = await credentialService.getUserCredentials(req.user._id);
    return res.status(200).json({
      success: true,
      count: credentials.length,
      data: credentials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export const deleteCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await credentialService.deleteCredential(req.user._id, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }
    return res.status(200).json({ success: true, message: 'Credential deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

/**
 * GET /api/v1/credentials/google
 * Returns only gmail OAuth2 credentials for the logged-in user.
 */
export const getGmailCredentials = async (req, res, next) => {
  try {
    const credentials = await credentialService.getCredentialsByService(req.user._id, 'gmail');
    return res.status(200).json({
      success: true,
      count: credentials.length,
      data: credentials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

/**
 * POST /api/v1/credentials/:id/test
 * Validates a Gmail OAuth2 credential by calling gmail.users.getProfile().
 */
export const testGmailConnection = async (req, res, next) => {
  const { id } = req.params;

  let oauthData;
  try {
    oauthData = await credentialService.getDecryptedOAuthData(id);
  } catch (err) {
    return res.status(404).json({ success: false, connected: false, error: err.message });
  }

  if (!oauthData?.refreshToken) {
    return res.status(400).json({
      success: false,
      connected: false,
      error: 'Credential is missing a refresh token. Please reconnect the Gmail account.',
    });
  }

  try {
    const auth = await googleOAuthClient.getAuthenticatedClient(oauthData);
    const gmail = google.gmail({ version: 'v1', auth });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return res.status(200).json({
      success: true,
      connected: true,
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
    });
  } catch (err) {
    const status = err?.response?.status;
    let errorMessage = err.message;

    if (status === 401 || err.message?.includes('invalid_grant')) {
      errorMessage = 'Token expired or revoked. Please reconnect the Gmail account.';
    } else if (status === 403) {
      errorMessage = 'Insufficient permissions. Ensure Gmail API is enabled and correct scopes are granted.';
    }

    return res.status(200).json({
      success: false,
      connected: false,
      error: errorMessage,
    });
  }
};
