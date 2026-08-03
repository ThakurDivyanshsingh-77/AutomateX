import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Mail, Plus, Loader2, CheckCircle2, AlertCircle,
  RefreshCw, Trash2, ChevronDown, Send, Search, Inbox
} from 'lucide-react';
import { credentialService } from '../../../../services/credentialService';
import { AuthContext } from '../../../../context/AuthContext';

import toast from 'react-hot-toast';

// ── Field Components ─────────────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

const TextInput = ({ value, onChange, placeholder, disabled }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
  />
);

const TextareaInput = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
  />
);

// ── Credential Dropdown ───────────────────────────────────────────────────────

const CredentialDropdown = ({ credentials, selectedId, onSelect, isLoading }) => {
  const selected = credentials.find((c) => c._id === selectedId);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-600 transition-colors">
        <div className="p-1 rounded bg-red-500/10">
          <Mail className="w-3 h-3 text-red-400" />
        </div>
        <select
          value={selectedId || ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer appearance-none"
        >
          <option value="">— Select Gmail Account —</option>
          {credentials.map((cred) => (
            <option key={cred._id} value={cred._id}>
              {cred.name} {cred.maskedValue ? `(${cred.maskedValue})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
      </div>
    </div>
  );
};

// ── Operation Selector ────────────────────────────────────────────────────────

const OPERATIONS = [
  { value: 'sendEmail', label: 'Send Email', icon: Send },
  { value: 'readEmail', label: 'Read Inbox', icon: Inbox },
  { value: 'searchEmails', label: 'Search Emails', icon: Search },
];

const OperationSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {OPERATIONS.map(({ value: v, label, icon: Icon }) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`p-2 rounded-lg border text-[10px] font-semibold flex flex-col items-center gap-1 transition-all ${
          value === v
            ? 'bg-red-500/15 border-red-500/40 text-red-300'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    ))}
  </div>
);

// ── Body Type Toggle ──────────────────────────────────────────────────────────

const BodyTypeToggle = ({ value = 'plain', onChange }) => (
  <div className="flex rounded-lg overflow-hidden border border-slate-800">
    {['plain', 'html'].map((type) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          value === type
            ? 'bg-red-500/20 text-red-300'
            : 'bg-slate-950 text-slate-500 hover:text-slate-300'
        }`}
      >
        {type === 'plain' ? '📝 Plain Text' : '🌐 HTML'}
      </button>
    ))}
  </div>
);

// ── Connection Status Badge ───────────────────────────────────────────────────

const ConnectionBadge = ({ status }) => {
  if (status === 'checking')
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking...
      </span>
    );
  if (status === 'connected')
    return (
      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
        <CheckCircle2 className="w-3 h-3" /> Connected
      </span>
    );
  if (status === 'failed')
    return (
      <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
        <AlertCircle className="w-3 h-3" /> Auth Failed
      </span>
    );
  return null;
};

// ── Main GmailProperties Component ───────────────────────────────────────────

export const GmailProperties = ({ node, onUpdateNodeData }) => {
  const { user } = useContext(AuthContext);
  const config = node?.data?.config || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connStatus, setConnStatus] = useState(null); // null | 'checking' | 'connected' | 'failed'
  const [connEmail, setConnEmail] = useState('');

  // ── Load Gmail credentials from backend ──────────────────────────────────
  const loadCredentials = useCallback(async () => {
    setLoadingCreds(true);
    try {
      const { data } = await credentialService.getGmailCredentials();
      setCredentials(data || []);
    } catch (err) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoadingCreds(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // ── Config helpers ────────────────────────────────────────────────────────
  const updateConfig = (field, value) => {
    const nextConfig = { ...config, [field]: value };
    onUpdateNodeData(node.id, { config: nextConfig });
  };

  // ── Connect Gmail (OAuth popup) ───────────────────────────────────────────
  const handleConnectGmail = async () => {
    // Support both _id (MongoDB raw) and id (serialized JSON)
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error('You must be logged in to connect Gmail.');
      return;
    }
    setConnecting(true);
    try {
      const result = await credentialService.connectGmail(userId, `Gmail – ${user.name || user.email}`);
      toast.success(`✅ Gmail connected: ${result.email}`);
      await loadCredentials();
      // Auto-select the new credential
      updateConfig('credential', result.credentialId);
    } catch (err) {
      toast.error(err.message || 'OAuth connection failed');
    } finally {
      setConnecting(false);
    }
  };

  // ── Test Connection ───────────────────────────────────────────────────────
  const handleTestConnection = async () => {
    const credId = config.credential;
    if (!credId) {
      toast.error('Select a Gmail account first.');
      return;
    }
    setConnStatus('checking');
    try {
      const result = await credentialService.testConnection(credId);
      if (result.connected) {
        setConnStatus('connected');
        setConnEmail(result.email || '');
        toast.success(`✅ Connected as ${result.email}`);
      } else {
        setConnStatus('failed');
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch {
      setConnStatus('failed');
      toast.error('Test connection request failed');
    }
  };

  const operation = config.operation || 'sendEmail';

  return (
    <div className="space-y-5">
      {/* ── Section: Gmail Account ───────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Gmail Account</FieldLabel>
          {connStatus && <ConnectionBadge status={connStatus} />}
        </div>

        {loadingCreds ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 py-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading accounts...
          </div>
        ) : (
          <CredentialDropdown
            credentials={credentials}
            selectedId={config.credential}
            onSelect={(id) => {
              updateConfig('credential', id);
              setConnStatus(null);
            }}
            isLoading={loadingCreds}
          />
        )}

        {connStatus === 'connected' && connEmail && (
          <p className="text-[10px] text-emerald-400 font-mono pl-1">
            Authenticated as: {connEmail}
          </p>
        )}

        {/* Action buttons row */}
        <div className="flex gap-2">
          <button
            onClick={handleConnectGmail}
            disabled={connecting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            {connecting ? 'Connecting...' : 'Connect Gmail'}
          </button>

          <button
            onClick={handleTestConnection}
            disabled={!config.credential || connStatus === 'checking'}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            {connStatus === 'checking' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Test Connection
          </button>
        </div>
      </div>

      {/* ── Section: Operation ───────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-slate-800 pt-4">
        <FieldLabel required>Operation</FieldLabel>
        <OperationSelector value={operation} onChange={(v) => updateConfig('operation', v)} />
      </div>

      {/* ── Section: Send Email fields ───────────────────────────────────── */}
      {operation === 'sendEmail' && (
        <>
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <FieldLabel required>To (Recipient)</FieldLabel>
            <TextInput
              value={config.to}
              onChange={(v) => updateConfig('to', v)}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>CC</FieldLabel>
            <TextInput
              value={config.cc}
              onChange={(v) => updateConfig('cc', v)}
              placeholder="cc@example.com (optional)"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>BCC</FieldLabel>
            <TextInput
              value={config.bcc}
              onChange={(v) => updateConfig('bcc', v)}
              placeholder="bcc@example.com (optional)"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>Subject</FieldLabel>
            <TextInput
              value={config.subject}
              onChange={(v) => updateConfig('subject', v)}
              placeholder="Email subject line"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel required>Body</FieldLabel>
              <BodyTypeToggle
                value={config.bodyType || 'plain'}
                onChange={(v) => updateConfig('bodyType', v)}
              />
            </div>
            <TextareaInput
              value={config.body}
              onChange={(v) => updateConfig('body', v)}
              placeholder={
                config.bodyType === 'html'
                  ? '<h1>Hello!</h1>\n<p>Your workflow message here.</p>'
                  : 'Write your email message here...'
              }
              rows={5}
            />
          </div>
        </>
      )}

      {/* ── Section: Search Query (for searchEmails) ─────────────────────── */}
      {operation === 'searchEmails' && (
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <FieldLabel>Search Query</FieldLabel>
          <TextInput
            value={config.searchQuery}
            onChange={(v) => updateConfig('searchQuery', v)}
            placeholder='is:unread from:someone@gmail.com subject:"Invoice"'
          />
          <p className="text-[10px] text-slate-500 font-mono">
            Uses Gmail search operators. Leave blank to get all unread.
          </p>
        </div>
      )}

      {/* ── Info Banner ──────────────────────────────────────────────────── */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-500 space-y-0.5">
        <p className="font-semibold text-slate-400">💡 Gmail Integration</p>
        <p>Uses Google OAuth 2.0. Emails are sent from your authenticated Gmail account via the Gmail REST API.</p>
      </div>
    </div>
  );
};
