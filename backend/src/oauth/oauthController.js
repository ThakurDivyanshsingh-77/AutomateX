import { googleOAuthClient } from './GoogleOAuthClient.js';
import { credentialService } from '../credentials/credentialService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Step 1: Redirect user to Google OAuth consent screen
 * GET /api/v1/oauth/google?name=My+Gmail&userId=<id>
 *
 * State encodes: "credentialName|||userId" so we can recover it after callback.
 * We pass userId in state because Google callback has no auth cookie in some setups.
 */
export const initiateGoogleOAuth = asyncHandler(async (req, res) => {
  const { name = 'My Gmail', userId, frontendUrl: clientFrontendUrl } = req.query;
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

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId query param is required' });
  }

  // Encode state as base64 JSON so special characters don't break the URL
  const statePayload = Buffer.from(JSON.stringify({ name, userId, frontendUrl: frontendOrigin })).toString('base64');
  const authUrl = googleOAuthClient.generateAuthUrl(statePayload, req);

  res.redirect(authUrl);
});

/**
 * Step 2: Google redirects here after user grants consent
 * GET /api/v1/oauth/google/callback?code=...&state=...
 */
export const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  // Decode state
  let decodedState;
  if (state) {
    try {
      decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch {
      // fallback
    }
  }

  const frontendUrl = decodedState?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  // User denied consent
  if (error) {
    return res.redirect(`${frontendUrl}/oauth/callback?status=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return res.status(400).json({ success: false, message: 'Missing code or state from Google callback' });
  }

  const { name, userId } = decodedState || {};

  // Exchange authorization code for tokens
  const tokens = await googleOAuthClient.exchangeCodeForTokens(code, req);

  if (!tokens.refresh_token) {
    return res.redirect(
      `${frontendUrl}/oauth/callback?status=error&message=${encodeURIComponent(
        'No refresh token received. Please revoke access at myaccount.google.com/permissions and try again.'
      )}`
    );
  }

  // Build an authenticated client to fetch user's email
  let userEmail = 'Unknown';
  try {
    const authClient = await googleOAuthClient.getAuthenticatedClient({
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    });
    userEmail = await googleOAuthClient.getUserEmail(authClient);
  } catch {
    // Non-fatal — we still store the credential even if email lookup fails
  }

  // Encrypt and store the OAuth data as a JSON blob in existing credential vault
  const oauthData = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiryDate: tokens.expiry_date,
    userEmail,
  };

  const credential = await credentialService.createCredential(userId, {
    name: name || `Gmail – ${userEmail}`,
    service: 'gmail',
    authType: 'oauth2',
    secret: JSON.stringify(oauthData), // Stored encrypted as JSON blob
  });

  // Redirect frontend with success + credential ID
  res.redirect(
    `${frontendUrl}/oauth/callback?status=success&credentialId=${credential._id}&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(name)}`
  );
});
