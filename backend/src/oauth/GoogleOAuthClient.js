import { google } from 'googleapis';

/**
 * GoogleOAuthClient
 * Wrapper around google-auth-library OAuth2 client.
 * Responsible for: auth URL generation, code exchange, token refresh.
 */
export class GoogleOAuthClient {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      console.warn('[GoogleOAuthClient] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set in .env');
    }
  }

  /**
   * Dynamically determines the appropriate callback URL (Render vs local)
   */
  getCallbackUrl(req = null) {
    if (process.env.GOOGLE_CALLBACK_URL && !process.env.GOOGLE_CALLBACK_URL.includes('localhost')) {
      return process.env.GOOGLE_CALLBACK_URL;
    }
    if (req) {
      const host = req.get('host');
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      if (host && !host.includes('localhost')) {
        return `${protocol}://${host}/api/v1/oauth/google/callback`;
      }
    }
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      return 'https://automatex-a839.onrender.com/api/v1/oauth/google/callback';
    }
    return process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/oauth/google/callback';
  }

  /**
   * Creates a fresh OAuth2 client instance
   */
  createClient(tokens = null, req = null) {
    const callbackUrl = this.getCallbackUrl(req);
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      callbackUrl
    );
    if (tokens) {
      oauth2Client.setCredentials(tokens);
    }
    return oauth2Client;
  }

  /**
   * Generate the Google consent screen URL
   */
  generateAuthUrl(state = '', req = null) {
    const client = this.createClient(null, req);
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
   */
  async exchangeCodeForTokens(code, req = null) {
    const client = this.createClient(null, req);
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  /**
   * Build an authenticated OAuth2 client from stored OAuth data.
   * Auto-refreshes access token if expired.
   */
  async getAuthenticatedClient(oauthData, req = null) {
    const callbackUrl = this.getCallbackUrl(req);
    const oauth2Client = new google.auth.OAuth2(
      oauthData.clientId || this.clientId,
      oauthData.clientSecret || this.clientSecret,
      callbackUrl
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
   */
  async getUserEmail(oauth2Client) {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data.email;
  }
}

// Singleton export
export const googleOAuthClient = new GoogleOAuthClient();
