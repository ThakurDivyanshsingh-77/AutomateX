import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Key,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Link,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../../services/api';

export const WebsiteConnectProperties = ({ node, onUpdateNodeData }) => {
  const config = node?.data?.config || {};

  // Form State
  const [selectedConnectionId, setSelectedConnectionId] = useState(config.connectionId || '');
  const [name, setName] = useState(config.name || 'My Website');
  const [websiteUrl, setWebsiteUrl] = useState(config.websiteUrl || '');
  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl || '');
  const [connectionMethod, setConnectionMethod] = useState(config.connectionMethod || 'restApi');
  const [authType, setAuthType] = useState(config.authType || 'bearerToken');

  // Credentials State (Client-Side only during input, never saved plaintext to workflow JSON)
  const [token, setToken] = useState(config.credentials?.token || '');
  const [apiKeyName, setApiKeyName] = useState(config.credentials?.headerName || 'X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState(config.credentials?.apiKey || '');
  const [username, setUsername] = useState(config.credentials?.username || '');
  const [password, setPassword] = useState(config.credentials?.password || '');
  const [loginUrl, setLoginUrl] = useState(config.credentials?.loginUrl || '');
  const [customHeaders, setCustomHeaders] = useState(config.customHeaders || []);

  // Saved Connections List
  const [savedConnections, setSavedConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Testing & Saving States
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch saved website connections on load
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await api.get('/connections/websites');
      if (response.data?.success) {
        setSavedConnections(response.data.connections || []);
      }
    } catch (err) {
      console.warn('[WebsiteConnectProperties] Fetch connections warning:', err.message);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleSelectExistingConnection = (connId) => {
    setSelectedConnectionId(connId);
    if (!connId) return;

    const found = savedConnections.find((c) => c.id === connId || c.connectionId === connId);
    if (found) {
      setName(found.name || '');
      setWebsiteUrl(found.websiteUrl || '');
      setApiBaseUrl(found.apiBaseUrl || '');
      setConnectionMethod(found.connectionMethod || 'restApi');
      setAuthType(found.authType || 'bearerToken');
      setCustomHeaders(found.customHeaders || []);

      // Update Node Data with connectionId (never store plaintext secrets in node config)
      onUpdateNodeData(node.id, {
        config: {
          ...config,
          connectionId: found.id || found.connectionId,
          name: found.name,
          websiteUrl: found.websiteUrl,
          apiBaseUrl: found.apiBaseUrl,
          connectionMethod: found.connectionMethod,
          authType: found.authType,
          status: found.status || 'connected',
          maskedCredentials: found.maskedCredentials || {},
        },
      });
    }
  };

  const normalizeUrl = (raw) => {
    if (!raw) return '';
    let val = raw.trim();
    if (!/^https?:\/\//i.test(val)) val = `https://${val}`;
    return val.replace(/\/+$/, '');
  };

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index, field, value) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  const handleRemoveHeader = (index) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const buildCurrentCredentials = () => {
    if (connectionMethod === 'bearerToken' || (connectionMethod === 'restApi' && authType === 'bearerToken')) {
      return { token };
    }
    if (connectionMethod === 'apiKey' || (connectionMethod === 'restApi' && authType === 'apiKey')) {
      return { headerName: apiKeyName, apiKey: apiKeyValue };
    }
    if (connectionMethod === 'basicAuth' || (connectionMethod === 'restApi' && authType === 'basicAuth')) {
      return { username, password };
    }
    if (connectionMethod === 'browserSession') {
      return { loginUrl: normalizeUrl(loginUrl), username, password };
    }
    return {};
  };

  const handleTestConnection = async () => {
    if (!websiteUrl) {
      setTestResult({ success: false, message: 'Please enter a valid Website URL.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const normalizedWeb = normalizeUrl(websiteUrl);
    const normalizedApi = apiBaseUrl ? normalizeUrl(apiBaseUrl) : '';

    try {
      if (selectedConnectionId) {
        // Test existing saved connection
        const res = await api.post(`/connections/websites/${selectedConnectionId}/test`);
        setTestResult(res.data?.result || res.data);
      } else {
        // Test raw / draft parameters
        const res = await api.post('/connections/websites/test-raw', {
          websiteUrl: normalizedWeb,
          apiBaseUrl: normalizedApi,
          connectionMethod,
          authType,
          credentials: buildCurrentCredentials(),
          customHeaders,
        });
        setTestResult(res.data?.result || res.data);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.error?.message || 'Connection test failed. Check URL and credentials.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!websiteUrl || !name) {
      setTestResult({ success: false, message: 'Connection Name and Website URL are required.' });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    const normalizedWeb = normalizeUrl(websiteUrl);
    const normalizedApi = apiBaseUrl ? normalizeUrl(apiBaseUrl) : '';

    try {
      const res = await api.post('/connections/websites', {
        name: name.trim(),
        websiteUrl: normalizedWeb,
        apiBaseUrl: normalizedApi,
        connectionMethod,
        authType,
        credentials: buildCurrentCredentials(),
        customHeaders,
      });

      if (res.data?.success && res.data?.connection) {
        const conn = res.data.connection;
        setSelectedConnectionId(conn.id || conn.connectionId);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Refresh list
        fetchConnections();

        // Update Node Config with unique connectionId (NEVER plaintext secrets)
        onUpdateNodeData(node.id, {
          config: {
            ...config,
            connectionId: conn.id || conn.connectionId,
            name: conn.name,
            websiteUrl: conn.websiteUrl,
            apiBaseUrl: conn.apiBaseUrl,
            connectionMethod: conn.connectionMethod,
            authType: conn.authType,
            status: 'connected',
            maskedCredentials: conn.maskedCredentials || {},
          },
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.error?.message || 'Failed to save connection.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-slate-200">
      {/* Saved Connection Dropdown */}
      <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Website Connection
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ID: {config.connectionId || 'None'}</span>
        </label>
        <select
          value={selectedConnectionId}
          onChange={(e) => handleSelectExistingConnection(e.target.value)}
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">-- Create New Connection --</option>
          {savedConnections.map((c) => (
            <option key={c.id || c.connectionId} value={c.id || c.connectionId}>
              {c.name} ({c.websiteUrl})
            </option>
          ))}
        </select>
      </div>

      {/* Connection Name & Website URL */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Connection Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chemtom Storefront API"
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Website URL *</label>
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[10px] text-slate-500">Trailing slashes will be automatically removed.</p>
        </div>

        {/* Connection Method Selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Connection Method *</label>
          <select
            value={connectionMethod}
            onChange={(e) => setConnectionMethod(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="restApi">REST API</option>
            <option value="apiKey">API Key</option>
            <option value="bearerToken">Bearer Token</option>
            <option value="basicAuth">Basic Authentication</option>
            <option value="browserSession">Browser Session</option>
          </select>
        </div>
      </div>

      {/* Dynamic Fields for REST API */}
      {connectionMethod === 'restApi' && (
        <div className="space-y-3 p-3 bg-slate-950/30 rounded-lg border border-slate-800/80">
          <h5 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">REST API Settings</h5>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">API Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://example.com/api/v1"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Authentication Type</label>
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="bearerToken">Bearer Token</option>
              <option value="apiKey">API Key</option>
              <option value="basicAuth">Basic Auth</option>
              <option value="none">No Auth (Public)</option>
            </select>
          </div>

          {authType === 'bearerToken' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Bearer Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Bearer ••••••••••••7F2A"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {authType === 'apiKey' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Header Name</label>
                <input
                  type="text"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  placeholder="X-API-Key"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">API Key</label>
                <input
                  type="password"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>
          )}

          {authType === 'basicAuth' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Custom Headers */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Custom Headers</label>
              <button
                type="button"
                onClick={handleAddHeader}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>
            {customHeaders.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={h.key}
                  onChange={(e) => handleUpdateHeader(i, 'key', e.target.value)}
                  placeholder="Header-Name"
                  className="w-1/2 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={(e) => handleUpdateHeader(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-1/2 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(i)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Fields for API Key */}
      {connectionMethod === 'apiKey' && (
        <div className="space-y-3 p-3 bg-slate-950/30 rounded-lg border border-slate-800/80">
          <h5 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">API Key Settings</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">API Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://example.com/api"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Key Name</label>
              <input
                type="text"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="X-API-Key"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 font-mono text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">API Key</label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Fields for Bearer Token */}
      {connectionMethod === 'bearerToken' && (
        <div className="space-y-3 p-3 bg-slate-950/30 rounded-lg border border-slate-800/80">
          <h5 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Bearer Token Settings</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">API Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://example.com/api"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Bearer Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Bearer ••••••••••••7F2A"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
        </div>
      )}

      {/* Dynamic Fields for Basic Authentication */}
      {connectionMethod === 'basicAuth' && (
        <div className="space-y-3 p-3 bg-slate-950/30 rounded-lg border border-slate-800/80">
          <h5 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Basic Authentication</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">API Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://example.com/api"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Fields for Browser Session */}
      {connectionMethod === 'browserSession' && (
        <div className="space-y-3 p-3 bg-slate-950/30 rounded-lg border border-slate-800/80">
          <h5 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Browser Session Auth</h5>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Login URL *</label>
            <input
              type="text"
              value={loginUrl}
              onChange={(e) => setLoginUrl(e.target.value)}
              placeholder="https://example.com/login"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user@example.com"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
              />
            </div>
          </div>

          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <span className="font-semibold block mb-0.5">MFA / CAPTCHA Verification:</span>
            If the website requires CAPTCHA or MFA, complete verification in the browser when prompted.
          </div>
        </div>
      )}

      {/* Action Buttons: Test Connection & Save */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting || !websiteUrl}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition disabled:opacity-50"
        >
          {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
          Test Connection
        </button>

        <button
          type="button"
          onClick={handleSaveConnection}
          disabled={isSaving || !websiteUrl || !name}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saveSuccess ? 'Saved!' : 'Save Connection'}
        </button>
      </div>

      {/* Test Feedback Banner */}
      {testResult && (
        <div
          className={`p-3 rounded-lg border text-xs space-y-1.5 ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {testResult.success ? '✓ Connection successful' : '✕ Connection failed'}
            </span>
            {testResult.responseTimeMs !== undefined && (
              <span className="font-mono text-[10px] opacity-80">{testResult.responseTimeMs}ms</span>
            )}
          </div>
          <p className="text-[11px] opacity-90">{testResult.message}</p>
        </div>
      )}

      {/* Downstream Variable Explorer Hints */}
      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 space-y-2">
        <h5 className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Available Output Variables
        </h5>
        <div className="space-y-1 font-mono text-[10px] text-slate-400">
          <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate">
            {`{{steps["${node.data?.label || 'Website → Connect'}"].connectionId}}`}
          </div>
          <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate">
            {`{{steps["${node.data?.label || 'Website → Connect'}"].website.url}}`}
          </div>
          <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate">
            {`{{steps["${node.data?.label || 'Website → Connect'}"].website.status}}`}
          </div>
        </div>
      </div>
    </div>
  );
};
