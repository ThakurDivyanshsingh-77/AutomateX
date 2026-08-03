import { google } from 'googleapis';
import { credentialService } from '../../credentials/credentialService.js';
import { googleOAuthClient } from '../../oauth/GoogleOAuthClient.js';
import { ExpressionEngine } from '../../engine/expression/ExpressionEngine.js';

/**
 * Build a proper RFC 2822 MIME email message and base64url encode it.
 * Supports To, CC, BCC, Subject, plain text and HTML body.
 */
function buildRawEmail({ to, cc, bcc, subject, body, bodyType = 'plain' }) {
  const lines = [];

  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push(`Subject: ${subject}`);

  const mimeType = bodyType === 'html' ? 'text/html' : 'text/plain';
  lines.push(`MIME-Version: 1.0`);
  lines.push(`Content-Type: ${mimeType}; charset="UTF-8"`);
  lines.push(`Content-Transfer-Encoding: 7bit`);
  lines.push('');   // Blank line separates headers from body
  lines.push(body);

  const rawMessage = lines.join('\r\n');

  // Base64url encode (Gmail API requires base64url, NOT standard base64)
  return Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * RealGmailExecutor
 *
 * Uses Google OAuth2 + gmail.users.messages.send() to send real emails.
 * Supports: To, CC, BCC, Subject, HTML/Plain body.
 * Handles: token auto-refresh, 401, 403, quota, invalid recipient.
 */
export class GmailPlugin {
  get name() { return 'gmail'; }
  get displayName() { return 'Google Gmail'; }
  get version() { return '2.0'; }
  get category() { return 'Google'; }

  /**
   * Main entry point called by the Workflow Engine's plugin registry.
   * node.config = { credential, operation, to, cc, bcc, subject, body, bodyType }
   */
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const credentialId = config.credential || config.credentialId;
    const operation = config.operation || 'sendEmail';
    const executionId = context?.executionId || 'unknown';

    // ── 1. Validate credential ID ──────────────────────────────────────────
    if (!credentialId) {
      throw new GmailExecutorError(
        'No Gmail credential selected. Please connect a Gmail account in the node properties.',
        'MISSING_CREDENTIAL'
      );
    }

    // ── 2. Load & decrypt OAuth data ──────────────────────────────────────
    let oauthData;
    try {
      oauthData = await credentialService.getDecryptedOAuthData(credentialId);
    } catch (err) {
      throw new GmailExecutorError(
        `Failed to load Gmail credential: ${err.message}`,
        'CREDENTIAL_LOAD_FAILED'
      );
    }

    if (!oauthData || !oauthData.refreshToken) {
      throw new GmailExecutorError(
        'Gmail credential is invalid or missing a refresh token. Please reconnect your Gmail account.',
        'INVALID_CREDENTIAL'
      );
    }

    // ── 3. Build authenticated OAuth2 client (auto-refreshes if expired) ──
    let auth;
    try {
      auth = await googleOAuthClient.getAuthenticatedClient(oauthData);
    } catch (err) {
      if (err.message?.includes('invalid_grant')) {
        throw new GmailExecutorError(
          'Gmail refresh token has been revoked. Please reconnect your Gmail account.',
          'REFRESH_TOKEN_REVOKED'
        );
      }
      throw new GmailExecutorError(
        `OAuth authentication failed: ${err.message}`,
        'AUTH_FAILED'
      );
    }

    // ── 4. Route to correct operation ──────────────────────────────────────
    switch (operation) {
      case 'sendEmail':
        return await this._sendEmail(auth, config, executionId, context);
      case 'readEmail':
        return await this._readEmails(auth, config, executionId);
      case 'searchEmails':
        return await this._searchEmails(auth, config, executionId);
      default:
        throw new GmailExecutorError(`Unsupported Gmail operation: "${operation}"`, 'UNSUPPORTED_OPERATION');
    }
  }

  // ── Send Email ────────────────────────────────────────────────────────────
  async _sendEmail(auth, config, executionId, context) {
    let { to, cc, bcc, subject, body, bodyType = 'plain' } = config;

    // Dynamically resolve expressions if present
    if (context) {
      if (typeof to === 'string' && to.includes('{{')) to = ExpressionEngine.resolve(to, context);
      if (typeof cc === 'string' && cc.includes('{{')) cc = ExpressionEngine.resolve(cc, context);
      if (typeof bcc === 'string' && bcc.includes('{{')) bcc = ExpressionEngine.resolve(bcc, context);
      if (typeof subject === 'string' && subject.includes('{{')) subject = ExpressionEngine.resolve(subject, context);
      if (typeof body === 'string' && body.includes('{{')) body = ExpressionEngine.resolve(body, context);
    }

    if (!to) throw new GmailExecutorError('Recipient email address (To) is required.', 'MISSING_RECIPIENT');
    if (!subject) throw new GmailExecutorError('Email subject is required.', 'MISSING_SUBJECT');
    if (!body) throw new GmailExecutorError('Email body is required.', 'MISSING_BODY');

    // Logging required by verification pipeline
    console.log('Resolved recipient:', to);
    console.log('Resolved subject:', subject);
    console.log('Resolved body:', body);
    console.log('Before calling gmail.users.messages.send():', {
      to,
      subject,
      body,
    });

    const rawEmail = buildRawEmail({ to, cc, bcc, subject, body, bodyType });

    const gmail = google.gmail({ version: 'v1', auth });

    let response;
    try {
      response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawEmail },
      });
    } catch (err) {
      this._handleGmailApiError(err);
    }

    const { id: messageId, threadId, labelIds } = response.data;

    return {
      success: true,
      provider: 'gmail',
      operation: 'sendEmail',
      messageId,
      threadId,
      labelIds,
      status: 'SENT',
      recipient: to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      executionId,
      logs: [
        { step: 'Started', ts: new Date().toISOString() },
        { step: 'Authenticated', ts: new Date().toISOString() },
        { step: `Email Sent to ${to}`, ts: new Date().toISOString() },
        { step: 'Completed', ts: new Date().toISOString() },
      ],
    };
  }

  // ── Read Emails (most recent N) ────────────────────────────────────────────
  async _readEmails(auth, config, executionId) {
    const gmail = google.gmail({ version: 'v1', auth });

    let listRes;
    try {
      listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        labelIds: ['INBOX'],
      });
    } catch (err) {
      this._handleGmailApiError(err);
    }

    const messages = listRes.data.messages || [];
    return {
      success: true,
      provider: 'gmail',
      operation: 'readEmail',
      count: messages.length,
      messages,
      executionId,
    };
  }

  // ── Search Emails ─────────────────────────────────────────────────────────
  async _searchEmails(auth, config, executionId) {
    const { searchQuery = 'is:unread' } = config;
    const gmail = google.gmail({ version: 'v1', auth });

    let searchRes;
    try {
      searchRes = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: 20,
      });
    } catch (err) {
      this._handleGmailApiError(err);
    }

    const messages = searchRes.data.messages || [];
    return {
      success: true,
      provider: 'gmail',
      operation: 'searchEmails',
      query: searchQuery,
      count: messages.length,
      messages,
      executionId,
    };
  }

  // ── Centralised Gmail API Error Handler ───────────────────────────────────
  _handleGmailApiError(err) {
    const status = err?.response?.status || err?.code;
    const message = err?.response?.data?.error?.message || err.message;

    if (status === 401) throw new GmailExecutorError(`Unauthorized – Gmail token expired or revoked: ${message}`, 'UNAUTHORIZED');
    if (status === 403) throw new GmailExecutorError(`Permission denied – check Gmail API scopes: ${message}`, 'FORBIDDEN');
    if (status === 429) throw new GmailExecutorError(`Gmail API quota exceeded. Try again later.`, 'QUOTA_EXCEEDED');
    if (status === 400 && message?.includes('Invalid')) throw new GmailExecutorError(`Invalid recipient address or message format: ${message}`, 'INVALID_REQUEST');
    if (err.message?.includes('invalid_grant')) throw new GmailExecutorError('Refresh token revoked – reconnect Gmail account.', 'REFRESH_TOKEN_REVOKED');
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') throw new GmailExecutorError('Network failure reaching Gmail API.', 'NETWORK_ERROR');

    throw new GmailExecutorError(`Gmail API error (${status}): ${message}`, 'GMAIL_API_ERROR');
  }
}

/**
 * Typed error class for clear error identification upstream
 */
export class GmailExecutorError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'GmailExecutorError';
    this.code = code;
  }
}
