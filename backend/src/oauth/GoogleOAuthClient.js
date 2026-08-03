import { google } from 'googleapis';

/**
 * GoogleOAuthClient
 * Thin wrapper around google-auth-library OAuth2 client.
 * Responsible for: auth URL generation, code exchange, token refresh.
 */
export class GoogleOAuthClient {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/oauth/google/callback';

    if (!this.clientId || !this.clientSecret) {
      console.warn('[GoogleOAuthClient] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set in .env');
    }
  }

  /**
   * Creates a fresh OAuth2 client instance
   */
  createClient(tokens = null) {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.callbackUrl
    );
    if (tokens) {
      oauth2Client.setCredentials(tokens);
    }
    return oauth2Client;
  }

  /**
   * Generate the Google consent screen URL
   * @param {string} state - opaque state string (e.g., credentialName:userId)
   */
  generateAuthUrl(state = '') {
    const client = this.createClient();
    return client.generateAuthUrl({
      access_type: 'offline',   // Required for refresh_token
      prompt: 'consent',        // Force consent screen every time so we always get refresh_token
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
    });
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - authorization code from Google callback
   * @returns {{ access_token, refresh_token, expiry_date, token_type, id_token }}
   */
  async exchangeCodeForTokens(code) {
    const client = this.createClient();
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  /**
   * Build an authenticated OAuth2 client from stored OAuth data.
   * Auto-refreshes access token if expired.
   * @param {{ clientId, clientSecret, refreshToken, accessToken, expiryDate }} oauthData
   */
  async getAuthenticatedClient(oauthData) {
    const oauth2Client = new google.auth.OAuth2(
      oauthData.clientId || this.clientId,
      oauthData.clientSecret || this.clientSecret,
      this.callbackUrl
    );

    oauth2Client.setCredentials({
      refresh_token: oauthData.refreshToken,
      access_token: oauthData.accessToken,
      expiry_date: oauthData.expiryDate,
    });

    // Auto-refresh if token is expired or close to expiry (within 5 min)
    const now = Date.now();
    const expiryDate = oauthData.expiryDate || 0;
    if (expiryDate < now + 5 * 60 * 1000) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    }

    return oauth2Client;
  }

  /**
   * Get the user's Gmail email address using the authenticated client
   * @param {object} oauth2Client - authenticated OAuth2 client
   */
  async getUserEmail(oauth2Client) {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data.email;
  }
}

// Singleton export
export const googleOAuthClient = new GoogleOAuthClient();
