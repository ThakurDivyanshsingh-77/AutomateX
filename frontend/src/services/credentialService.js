import api from './api';

/**
 * Credential Service — Frontend
 * Handles all credential management API calls.
 */
export const credentialService = {
  /**
   * Fetch all Gmail (OAuth2) credentials for the current user.
   * Used by the Gmail node credential dropdown.
   */
  getGmailCredentials: async () => {
    const res = await api.get('/credentials/google');
    return res.data;
  },

  /**
   * Get all credentials for the user.
   */
  getAllCredentials: async () => {
    const res = await api.get('/credentials');
    return res.data;
  },

  /**
   * Test whether a Gmail credential is still valid / connected.
   * Returns { connected: true, email } or { connected: false, error }.
   */
  testConnection: async (credentialId) => {
    const res = await api.post(`/credentials/${credentialId}/test`);
    return res.data;
  },

  /**
   * Initiate Google OAuth2 flow.
   * Opens a popup window pointing to the backend OAuth initiation endpoint.
   * Returns a Promise that resolves when the popup signals success/failure.
   *
   * @param {string} userId - the logged-in user's ID
   * @param {string} credentialName - friendly name for the credential
   * @returns {Promise<{ credentialId, email, name }>}
   */
  connectGmail: (userId, credentialName = 'My Gmail') => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token') || '';
      const params = new URLSearchParams({
        name: credentialName,
        userId,
        token,
        frontendUrl: window.location.origin,
      });
      const backendHost = (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost'))
        ? 'https://automatex-a839.onrender.com'
        : (import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000');
      const oauthUrl = `${backendHost}/api/v1/oauth/google?${params}`;

      // Open popup centered on screen
      const width = 500;
      const height = 650;
      const left = Math.round((window.screen.width - width) / 2);
      const top = Math.round((window.screen.height - height) / 2);

      const popup = window.open(
        oauthUrl,
        'gmail-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
        return;
      }

      // Poll until popup closes (either by redirect or user close)
      const pollTimer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(pollTimer);
            reject(new Error('OAuth window closed without completing authorization.'));
          }
        } catch {
          // Cross-origin access error — popup is on Google domain, ignore
        }
      }, 500);

      // Listen for message from OAuthCallback page
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'GMAIL_OAUTH_SUCCESS') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve(event.data.payload);
        } else if (event.data?.type === 'GMAIL_OAUTH_ERROR') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.message));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  },

  /**
   * Delete a credential by ID.
   */
  deleteCredential: async (credentialId) => {
    const res = await api.delete(`/credentials/${credentialId}`);
    return res.data;
  },
};
