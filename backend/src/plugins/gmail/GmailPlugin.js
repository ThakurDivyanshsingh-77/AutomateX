import { google } from 'googleapis';
import { credentialService } from '../../credentials/credentialService.js';
import { googleOAuthClient } from '../../oauth/GoogleOAuthClient.js';
import { ExpressionEngine } from '../../engine/expression/ExpressionEngine.js';

/**
 * Build a proper RFC 2822 MIME email message and base64url encode it.
 * Supports To, CC, BCC, Subject, plain text/HTML body, and PDF/file attachments.
 */
function buildRawEmail({ to, cc, bcc, subject, body, bodyType = 'plain', attachments = [] }) {
  const lines = [];

  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push(`Subject: ${subject}`);

  const activeAttachments = (Array.isArray(attachments) ? attachments : [attachments]).filter(Boolean);

  if (activeAttachments.length > 0) {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    lines.push(`MIME-Version: 1.0`);
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');

    // Message Body Part
    lines.push(`--${boundary}`);
    const mimeType = bodyType === 'html' ? 'text/html' : 'text/plain';
    lines.push(`Content-Type: ${mimeType}; charset="UTF-8"`);
    lines.push(`Content-Transfer-Encoding: 7bit`);
    lines.push('');
    lines.push(body);
    lines.push('');

    // Attachment Parts
    activeAttachments.forEach((att) => {
      const filename = att.filename || att.fileName || 'attachment.pdf';
      const contentType = att.contentType || att.mimeType || 'application/pdf';
      const rawContent = att.content || att.base64 || (typeof att === 'string' ? att : '');

      if (!rawContent) return;

      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${contentType}; name="${filename}"`);
      lines.push(`Content-Description: ${filename}`);
      lines.push(`Content-Disposition: attachment; filename="${filename}"`);
      lines.push(`Content-Transfer-Encoding: base64`);
      lines.push('');
      lines.push(rawContent.replace(/(.{76})/g, '$1\r\n'));
      lines.push('');
    });

    lines.push(`--${boundary}--`);
  } else {
    // Simple email without attachments
    const mimeType = bodyType === 'html' ? 'text/html' : 'text/plain';
    lines.push(`MIME-Version: 1.0`);
    lines.push(`Content-Type: ${mimeType}; charset="UTF-8"`);
    lines.push(`Content-Transfer-Encoding: 7bit`);
    lines.push('');
    lines.push(body);
  }

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

    // ── Resolve & Auto-Detect Attachments ──────────────────────────────────────
    const attachments = [];
    if (config.attachment) {
      let resolvedAtt = config.attachment;
      if (typeof resolvedAtt === 'string' && resolvedAtt.includes('{{') && context) {
        resolvedAtt = ExpressionEngine.resolve(resolvedAtt, context);
      }
      if (resolvedAtt) {
        if (typeof resolvedAtt === 'object') {
          attachments.push(resolvedAtt);
        } else if (typeof resolvedAtt === 'string') {
          attachments.push({
            filename: 'document.pdf',
            content: resolvedAtt,
            encoding: 'base64',
            contentType: 'application/pdf',
          });
        }
      }
    }

    // Auto-detect upstream attachment object if no explicit attachment configured
    if (attachments.length === 0 && context) {
      Object.values(context).forEach((nodeOutput) => {
        if (nodeOutput && typeof nodeOutput === 'object') {
          const att = nodeOutput.attachment || nodeOutput.output?.attachment;
          if (att && typeof att === 'object' && (att.content || att.base64)) {
            attachments.push(att);
          }
        }
      });
    }

    if (!to) throw new GmailExecutorError('Recipient email address (To) is required.', 'MISSING_RECIPIENT');
    if (!subject) throw new GmailExecutorError('Email subject is required.', 'MISSING_SUBJECT');
    if (!body) throw new GmailExecutorError('Email body is required.', 'MISSING_BODY');

    // Logging required by verification pipeline
    console.log('Resolved recipient:', to);
    console.log('Resolved subject:', subject);
    console.log('Resolved body:', body);
    console.log('Resolved attachments count:', attachments.length);
    console.log('Before calling gmail.users.messages.send():', {
      to,
      subject,
      body,
      attachmentsCount: attachments.length,
    });

    const rawEmail = buildRawEmail({ to, cc, bcc, subject, body, bodyType, attachments });

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

  // ── Enrich Message Stubs with Full Email Metadata ────────────────────────
  async _enrichMessages(gmail, messageStubs) {
    if (!Array.isArray(messageStubs) || messageStubs.length === 0) return [];

    const enrichedMessages = await Promise.all(
      messageStubs.map(async (stub) => {
        try {
          const detailRes = await gmail.users.messages.get({
            userId: 'me',
            id: stub.id,
            format: 'full',
          });

          const msg = detailRes.data;
          const headers = msg.payload?.headers || [];

          const getHeader = (name) => {
            const h = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase());
            return h ? h.value : '';
          };

          const from = getHeader('From');
          const to = getHeader('To');
          const subject = getHeader('Subject');
          const date = getHeader('Date');
          const cc = getHeader('Cc');
          const bcc = getHeader('Bcc');

          let bodyText = '';
          let bodyHtml = '';
          const attachments = [];

          // Helper function to recursively parse mime parts
          const parsePart = (part) => {
            if (!part) return;

            if (part.mimeType === 'text/plain' && part.body?.data) {
              bodyText += Buffer.from(part.body.data, 'base64').toString('utf8');
            } else if (part.mimeType === 'text/html' && part.body?.data) {
              bodyHtml += Buffer.from(part.body.data, 'base64').toString('utf8');
            }

            if (part.filename && part.filename.length > 0) {
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body?.size || 0,
                attachmentId: part.body?.attachmentId || null,
              });
            }

            if (Array.isArray(part.parts)) {
              part.parts.forEach(parsePart);
            }
          };

          if (msg.payload) {
            if (msg.payload.body?.data) {
              const bodyStr = Buffer.from(msg.payload.body.data, 'base64').toString('utf8');
              if (msg.payload.mimeType === 'text/html') {
                bodyHtml = bodyStr;
              } else {
                bodyText = bodyStr;
              }
            }
            if (Array.isArray(msg.payload.parts)) {
              msg.payload.parts.forEach(parsePart);
            }
          }

          return {
            id: msg.id,
            threadId: msg.threadId,
            from,
            to,
            subject,
            date,
            cc,
            bcc,
            snippet: msg.snippet || '',
            labelIds: msg.labelIds || [],
            hasAttachments: attachments.length > 0,
            attachments,
            bodyText: bodyText.trim(),
            bodyHtml: bodyHtml.trim(),
          };
        } catch (err) {
          console.warn(`[GmailPlugin] Could not fetch details for message ${stub.id}: ${err.message}`);
          return {
            id: stub.id,
            threadId: stub.threadId,
            from: '',
            to: '',
            subject: '(Failed to fetch email details)',
            date: '',
            snippet: '',
            labelIds: [],
            hasAttachments: false,
            attachments: [],
            bodyText: '',
            bodyHtml: '',
          };
        }
      })
    );

    return enrichedMessages;
  }

  // ── Read Emails (most recent N) ────────────────────────────────────────────
  async _readEmails(auth, config, executionId) {
    const gmail = google.gmail({ version: 'v1', auth });

    let listRes;
    try {
      listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: config.maxResults || 10,
        labelIds: ['INBOX'],
      });
    } catch (err) {
      this._handleGmailApiError(err);
    }

    const rawStubs = listRes.data?.messages || [];
    const messages = await this._enrichMessages(gmail, rawStubs);

    console.log(`[GmailPlugin] ReadEmails fetched & enriched ${messages.length} messages.`);
    if (messages.length > 0) {
      console.log('[GmailPlugin] Sample enriched message payload:', JSON.stringify(messages[0], null, 2));
    }

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
        maxResults: config.maxResults || 20,
      });
    } catch (err) {
      this._handleGmailApiError(err);
    }

    const rawStubs = searchRes.data?.messages || [];
    const messages = await this._enrichMessages(gmail, rawStubs);

    console.log(`[GmailPlugin] SearchEmails query="${searchQuery}" fetched & enriched ${messages.length} messages.`);
    if (messages.length > 0) {
      console.log('[GmailPlugin] Sample enriched message payload:', JSON.stringify(messages[0], null, 2));
    }

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
