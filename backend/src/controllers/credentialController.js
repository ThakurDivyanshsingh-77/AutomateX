import { credentialService } from '../credentials/credentialService.js';
import { googleOAuthClient } from '../oauth/GoogleOAuthClient.js';
import { google } from 'googleapis';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCredential = asyncHandler(async (req, res) => {
  const { name, service, authType, secret } = req.body;
  if (!name || !service || !secret) {
    return res.status(400).json({ success: false, message: 'Name, service, and secret are required' });
  }

  const cred = await credentialService.createCredential(req.user._id, {
    name,
    service,
    authType,
    secret,
  });

  return res.status(201).json({
    success: true,
    message: 'Credential created and encrypted in vault',
    credential: cred,
  });
});

export const getUserCredentials = asyncHandler(async (req, res) => {
  const credentials = await credentialService.getUserCredentials(req.user._id);
  return res.status(200).json({
    success: true,
    count: credentials.length,
    data: credentials,
  });
});

export const deleteCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await credentialService.deleteCredential(req.user._id, id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Credential not found' });
  }
  return res.status(200).json({ success: true, message: 'Credential deleted successfully' });
});

/**
 * GET /api/v1/credentials/google
 * Returns only gmail OAuth2 credentials for the logged-in user.
 * Used by the Gmail node properties panel credential dropdown.
 */
export const getGmailCredentials = asyncHandler(async (req, res) => {
  const credentials = await credentialService.getCredentialsByService(req.user._id, 'gmail');
  return res.status(200).json({
    success: true,
    count: credentials.length,
    data: credentials,
  });
});

/**
 * POST /api/v1/credentials/:id/test
 * Validates a Gmail OAuth2 credential by calling gmail.users.getProfile().
 * Returns { connected: true, email } or { connected: false, error }.
 */
export const testGmailConnection = asyncHandler(async (req, res) => {
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
});
