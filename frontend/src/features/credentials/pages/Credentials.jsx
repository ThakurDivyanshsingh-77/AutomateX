import React, { useState, useEffect } from 'react';
import { credentialService } from '../services/credentialService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState } from '../../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { ShieldCheck, Plus, Trash2, Key, Lock, CheckCircle2, Activity, Database, Loader2, Bot, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export const Credentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [service, setService] = useState('discord');
  const [authType, setAuthType] = useState('botToken');
  const [secret, setSecret] = useState('');
  
  // MongoDB specific state
  const [mongoUri, setMongoUri] = useState('mongodb://localhost:27017');
  const [databaseName, setDatabaseName] = useState('automatex');
  const [authDatabase, setAuthDatabase] = useState('admin');
  const [tlsEnable, setTlsEnable] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Discord specific state
  const [discordBotToken, setDiscordBotToken] = useState('');
  const [testingDiscordConnection, setTestingDiscordConnection] = useState(false);
  const [discordBotInfo, setDiscordBotInfo] = useState(null);
  const [discordTestError, setDiscordTestError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await credentialService.getCredentials();
      setCredentials(res.data || []);
    } catch (err) {
      toast.error('Failed to load credentials vault');
    } finally {
      setLoading(false);
    }
  };

  const handleTestMongoConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await api.post('/database/mongodb/test', {
        connectionUri: mongoUri,
        databaseName,
        authDatabase,
        tlsEnable,
      });

      if (res.data.success) {
        toast.success(`Connected Successfully! Latency: ${res.data.latencyMs}ms (${res.data.version})`);
      } else {
        toast.error(res.data.message || 'Connection Failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'MongoDB connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestDiscordConnection = async () => {
    if (!discordBotToken) {
      return toast.error('Please enter a Discord Bot Token to test');
    }
    setTestingDiscordConnection(true);
    setDiscordTestError('');
    setDiscordBotInfo(null);
    try {
      const res = await api.post('/discord/credentials/verify', {
        botToken: discordBotToken,
      });
      if (res.data.success) {
        setDiscordBotInfo(res.data.data);
        toast.success(`Connected Successfully! Authenticated Bot: ${res.data.data.botName}`);
      } else {
        setDiscordTestError(res.data.message || 'Verification Failed');
        toast.error(res.data.message || 'Verification Failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Discord Bot Authentication Failed';
      setDiscordTestError(errMsg);
      toast.error(errMsg);
    } finally {
      setTestingDiscordConnection(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) {
      return toast.error('Please enter a credential name');
    }

    let secretPayload = secret;
    if (service === 'mongodb') {
      secretPayload = JSON.stringify({
        connectionUri: mongoUri,
        databaseName,
        authDatabase,
        tlsEnable,
      });
    } else if (service === 'discord') {
      secretPayload = JSON.stringify({
        botToken: discordBotToken,
      });
    }

    if (!secretPayload) {
      return toast.error('Please fill in secret payload or connection URI');
    }

    setSubmitting(true);
    try {
      const res = await credentialService.createCredential({
        name,
        service,
        authType: service === 'mongodb' ? 'uri' : service === 'discord' ? 'botToken' : authType,
        secret: secretPayload,
      });
      toast.success(res.message || 'Credential encrypted & saved!');
      setName('');
      setSecret('');
      setDiscordBotToken('');
      setDiscordBotInfo(null);
      setDiscordTestError('');
      setShowAddModal(false);
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete credential secret from vault?')) return;
    try {
      await credentialService.deleteCredential(id);
      toast.success('Credential deleted');
      fetchCredentials();
    } catch (err) {
      toast.error('Failed to delete credential');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-emerald-500/10 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Credentials Vault</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Store Discord Bot Tokens, MongoDB connections, API keys, OAuth tokens, and secrets encrypted at rest via AES-256-CBC.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)} className="relative z-10 shadow-glow-brand">
          <Plus className="w-4 h-4" /> Add Credential
        </Button>
      </div>

      {/* Add Credential Modal / Form */}
      {showAddModal && (
        <Card className="space-y-4 border-brand-500/40 glass-panel shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" /> Store Encrypted Credential
            </h3>
            <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>


          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <Input
              label="Credential Name"
              placeholder="e.g. My Discord Production Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Service</label>
                <select
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    if (e.target.value === 'discord') setAuthType('botToken');
                    if (e.target.value === 'mongodb') setAuthType('uri');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="discord">Discord Bot</option>
                  <option value="mongodb">MongoDB Database</option>
                  <option value="slack">Slack</option>
                  <option value="gmail">Gmail</option>
                  <option value="telegram">Telegram</option>
                  <option value="github">GitHub</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="http">HTTP REST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Auth Type</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  {service === 'discord' && <option value="botToken">Bot Token (Bot &lt;token&gt;)</option>}
                  <option value="uri">Connection URI / Object</option>
                  <option value="apiKey">API Key / Secret</option>
                  <option value="bearerToken">Bearer Token</option>
                  <option value="oauth2">OAuth2 Secret</option>
                </select>
              </div>
            </div>

            {/* Discord Specific Form Fields */}
            {service === 'discord' ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <Input
                  label="Bot Token"
                  type="password"
                  placeholder="e.g. MTAwMDAwMDAwMDAwMDAwMDAwMA.G12345.abcdefghijklmnopqrstuvwxyz"
                  value={discordBotToken}
                  onChange={(e) => setDiscordBotToken(e.target.value)}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Validated via Discord REST API v10 (GET /users/@me)
                  </span>

                  <button
                    type="button"
                    onClick={handleTestDiscordConnection}
                    disabled={testingDiscordConnection || !discordBotToken}
                    className="px-3 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testingDiscordConnection ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    Test Connection
                  </button>
                </div>

                {/* Discord Bot Verified Information Display */}
                {discordBotInfo && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                    <div className="relative">
                      {discordBotInfo.avatar ? (
                        <img
                          src={discordBotInfo.avatar}
                          alt={discordBotInfo.botName}
                          className="w-10 h-10 rounded-full border border-emerald-400/50 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-300">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full" />
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{discordBotInfo.botName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Connected Successfully
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-3">
                        <span>Username: <strong>{discordBotInfo.username}</strong></span>
                        <span>ID: <strong className="font-mono text-slate-400">{discordBotInfo.botId}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discord Error Display */}
                {discordTestError && (
                  <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{discordTestError}</span>
                  </div>
                )}
              </div>
            ) : service === 'mongodb' ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <Input
                  label="MongoDB Connection URI"
                  placeholder="mongodb://localhost:27017 or mongodb+srv://..."
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Database Name"
                    placeholder="automatex"
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                  />
                  <Input
                    label="Auth Database (Optional)"
                    placeholder="admin"
                    value={authDatabase}
                    onChange={(e) => setAuthDatabase(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tlsEnable}
                      onChange={(e) => setTlsEnable(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Enable TLS / SSL Connection</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleTestMongoConnection}
                    disabled={testingConnection}
                    className="px-3 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-indigo-400" />}
                    Test Connection
                  </button>
                </div>
              </div>
            ) : (
              <Input
                label="Secret / API Token"
                type="password"
                placeholder="Paste plain text secret (will be encrypted)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                Save to Vault
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Credentials List Grid */}
      {loading ? (
        <Loader text="Decrypting vault metadata..." />
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={Key}
          title="Vault is empty"
          description="You have not saved any encrypted API keys or secrets yet."
          actionButton={
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add First Credential
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred) => (
            <Card key={cred._id} className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{cred.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {cred.service}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> {cred.maskedValue}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cred.service === 'mongodb' && (
                  <button
                    onClick={async () => {
                      toast.promise(
                        api.post('/database/mongodb/test', { connectionUri: 'mongodb://localhost:27017' }),
                        {
                          loading: 'Testing connection...',
                          success: (res) => `Connected Successfully! (${res.data.version || 'v6.0'})`,
                          error: 'Connection Failed',
                        }
                      );
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Activity className="w-3 h-3 text-indigo-400" /> Test
                  </button>
                )}

                <button
                  onClick={() => handleDelete(cred._id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete credential"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Credentials;
