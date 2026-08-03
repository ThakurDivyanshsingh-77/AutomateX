import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

/**
 * OAuthCallback Page
 *
 * Rendered at /oauth/callback after Google redirects back from consent screen.
 * Reads query params (status, credentialId, email, name, message) set by backend.
 * Posts a message to the opener window (parent) if opened as a popup,
 * then auto-redirects to /credentials after a short delay.
 */
export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status'); // 'success' | 'error'
  const credentialId = searchParams.get('credentialId');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const errorMessage = searchParams.get('message');

  const isSuccess = status === 'success';

  // Notify parent window (popup flow) then close or redirect
  React.useEffect(() => {
    if (window.opener) {
      if (isSuccess) {
        window.opener.postMessage(
          {
            type: 'GMAIL_OAUTH_SUCCESS',
            payload: { credentialId, email, name },
          },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          {
            type: 'GMAIL_OAUTH_ERROR',
            message: errorMessage || 'OAuth failed',
          },
          window.location.origin
        );
      }
      // Auto-close popup after 1.5 seconds
      const t = setTimeout(() => window.close(), 1500);
      return () => clearTimeout(t);
    } else {
      // Full page redirect — navigate to credentials page after delay
      const t = setTimeout(() => navigate('/credentials'), 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, credentialId, email, name, errorMessage, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-5">
        {/* Icon */}
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-red-500/10 border-2 border-red-500/30'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-white">
            {isSuccess ? '✅ Gmail Connected!' : '❌ Connection Failed'}
          </h1>
          {isSuccess && email && (
            <p className="text-sm text-slate-400 mt-1">
              Authenticated as{' '}
              <span className="text-emerald-400 font-semibold">{email}</span>
            </p>
          )}
          {!isSuccess && errorMessage && (
            <p className="text-xs text-red-400 mt-2 leading-relaxed">{errorMessage}</p>
          )}
        </div>

        {/* Spinner / closing message */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {window.opener ? 'Closing window...' : 'Redirecting...'}
        </div>

        {/* Gmail branding hint */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
