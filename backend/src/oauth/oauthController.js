import { googleOAuthClient } from './GoogleOAuthClient.js';
import { credentialService } from '../credentials/credentialService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

/**
 * Helper to verify JWT token and extract authenticated user ID
 */
const verifyUserToken = async (token) => {
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    console.log(`[GoogleOAuth] 🔑 JWT token verified successfully for User ID: ${decoded.id}`);
    return decoded.id;
  } catch (err) {
    console.warn(`[GoogleOAuth] ⚠️ JWT token verification failed: ${err.message}`);
    return null;
  }
};

/**
 * Step 1: Redirect user to Google OAuth consent screen
 * GET /api/v1/oauth/google?name=Google+Account&userId=<id>&token=<jwt>
 */
export const initiateGoogleOAuth = asyncHandler(async (req, res) => {
  console.log('=== INITIATE GOOGLE OAUTH FLOW ===');
  const { name = 'Google Account', userId: queryUserId, token: queryToken, frontendUrl: clientFrontendUrl } = req.query;

  // Extract bearer token from Auth header or query param
  let token = queryToken;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  let verifiedUserId = await verifyUserToken(token);

  // Fallback to query userId if valid ObjectId
  if (!verifiedUserId && queryUserId && mongoose.Types.ObjectId.isValid(queryUserId)) {
    verifiedUserId = queryUserId;
    console.log(`[GoogleOAuth] ℹ️ Using validated query userId: ${verifiedUserId}`);
  }

  if (!verifiedUserId) {
    console.warn('[GoogleOAuth] 🚫 Authorization failed: No valid JWT token or user ObjectId provided');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid authenticated session token or user ObjectId is required',
    });
  }

  const referer = req.get('Referer') || req.get('Origin');
  let frontendOrigin = clientFrontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!clientFrontendUrl && referer) {
    try {
      const parsed = new URL(referer);
      frontendOrigin = parsed.origin;
    } catch {
      // fallback
    }
  }

  // Encode state payload preserving user identity and token
  const statePayload = Buffer.from(
    JSON.stringify({ name, userId: verifiedUserId, token, frontendUrl: frontendOrigin })
  ).toString('base64');

  const authUrl = googleOAuthClient.generateAuthUrl(statePayload, req);
  console.log(`[GoogleOAuth] 🚀 Redirecting user ${verifiedUserId} to Google Consent Screen.`);
  res.redirect(authUrl);
});

/**
 * Step 2: Google redirects here after user grants consent
 * GET /api/v1/oauth/google/callback?code=...&state=...
 */
export const handleGoogleCallback = asyncHandler(async (req, res) => {
  console.log('=== HANDLE GOOGLE OAUTH CALLBACK ===');
  const { code, state, error } = req.query;

  let decodedState;
  if (state) {
    try {
      decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch (err) {
      console.error('[GoogleOAuth] ❌ Failed to parse base64 OAuth state:', err.message);
    }
  }

  const frontendUrl = decodedState?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  if (error) {
    console.warn(`[GoogleOAuth] ⚠️ User denied Google OAuth consent: ${error}`);
    return res.redirect(`${frontendUrl}/oauth/callback?status=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.warn('[GoogleOAuth] 🚫 Missing authorization code or state in callback request');
    return res.status(400).json({ success: false, message: 'Missing code or state from Google callback' });
  }

  const { name, userId: stateUserId, token: stateToken } = decodedState || {};
  let authenticatedUserId = await verifyUserToken(stateToken);

  if (!authenticatedUserId && stateUserId && mongoose.Types.ObjectId.isValid(stateUserId)) {
    authenticatedUserId = stateUserId;
  }

  if (!authenticatedUserId) {
    console.error('[GoogleOAuth] ❌ OAuth Callback failed: Unauthenticated request state');
    return res.redirect(
      `${frontendUrl}/oauth/callback?status=error&message=${encodeURIComponent(
        'Unauthorized: Valid authenticated session token missing from OAuth state.'
      )}`
    );
  }

  console.log(`[GoogleOAuth] ✅ Processing callback for Authenticated User ID: ${authenticatedUserId}`);

  // Exchange code for Google OAuth access & refresh tokens
  const tokens = await googleOAuthClient.exchangeCodeForTokens(code, req);

  if (!tokens.refresh_token) {
    console.warn('[GoogleOAuth] ⚠️ No refresh token returned by Google OAuth');
    return res.redirect(
      `${frontendUrl}/oauth/callback?status=error&message=${encodeURIComponent(
        'No refresh token received. Please revoke access at myaccount.google.com/permissions and try again.'
      )}`
    );
  }

  // Fetch Google account email
  let userEmail = 'Unknown';
  try {
    const authClient = await googleOAuthClient.getAuthenticatedClient({
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    });
    userEmail = await googleOAuthClient.getUserEmail(authClient);
    console.log(`[GoogleOAuth] 📧 Retrieved Google Account Email: ${userEmail}`);
  } catch (err) {
    console.warn('[GoogleOAuth] ⚠️ Email lookup failed during callback:', err.message);
  }

  const oauthData = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiryDate: tokens.expiry_date,
    userEmail,
  };

  // Create & save encrypted credential using authenticated user ObjectId
  const credential = await credentialService.createCredential(authenticatedUserId, {
    name: name || `Google – ${userEmail}`,
    service: 'gmail',
    authType: 'oauth2',
    secret: JSON.stringify(oauthData),
  });

  console.log(`[GoogleOAuth] 🎉 Credential created successfully (ID: ${credential._id}, Owner: ${authenticatedUserId})`);

  const redirectTarget = `${frontendUrl}/oauth/callback?status=success&credentialId=${credential._id}&email=${encodeURIComponent(
    userEmail
  )}&name=${encodeURIComponent(name || 'Google Account')}`;
  
  console.log(`[GoogleOAuth] 🔀 Redirecting browser to destination: ${redirectTarget}`);
  res.redirect(redirectTarget);
});

