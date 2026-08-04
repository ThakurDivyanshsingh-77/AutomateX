import React, { useState, useEffect } from 'react';
import { credentialService } from '../../../credentials/services/credentialService';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { Database, Activity, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const MongoDBConnectionProperties = ({ nodeData, onUpdateNodeConfig }) => {
  const config = nodeData?.config || {};
  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    fetchMongoCredentials();
  }, []);

  const fetchMongoCredentials = async () => {
    setLoadingCreds(true);
    try {
      const list = await credentialService.getCredentialsByService('mongodb');
      setCredentials(list);
    } catch {
      // fallback
    } finally {
      setLoadingCreds(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await api.post('/database/mongodb/test', {
        credentialId: config.credentialId,
        databaseName: config.database || 'automatex',
      });

      if (res.data.success) {
        setConnectionStatus({
          connected: true,
          version: res.data.version,
          latencyMs: res.data.latencyMs,
        });
        toast.success(`Connected Successfully! Latency: ${res.data.latencyMs}ms (${res.data.version})`);
      } else {
        setConnectionStatus({ connected: false, error: res.data.message });
        toast.error('Connection Failed');
      }
    } catch (err) {
      setConnectionStatus({ connected: false, error: err.response?.data?.message || 'Connection test failed' });
      toast.error('MongoDB Connection Failed');
    } finally {
      setTesting(false);
    }
  };

  const handleConfigChange = (key, value) => {
    onUpdateNodeConfig({
      ...config,
      [key]: value,
    });
  };

  const isMissingCredential = !config.credentialId;
  const isMissingDatabase = !config.database;
  const isMissingCollection = !config.collection;

  return (
    <div className="space-y-4 text-xs font-sans text-slate-100">
      {/* Header */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">MongoDB Connection Setup</span>
        </div>
        {connectionStatus?.connected ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
            Idle
          </span>
        )}
      </div>

      {/* Credential Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          MongoDB Credential Vault <span className="text-amber-400">*</span>
        </label>
        <select
          value={config.credentialId || ''}
          onChange={(e) => handleConfigChange('credentialId', e.target.value)}
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none transition-colors ${
            isMissingCredential ? 'border-amber-500/50' : 'border-slate-800 focus:border-indigo-500'
          }`}
        >
          <option value="">-- Select MongoDB Credential --</option>
          {credentials.map((cred) => (
            <option key={cred._id} value={cred._id}>
              {cred.name} ({cred.maskedValue})
            </option>
          ))}
        </select>
        {isMissingCredential && (
          <p className="text-[10px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Credential is required for workflow publication.
          </p>
        )}
      </div>

      {/* Database Name Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          Database Name <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          value={config.database || ''}
          onChange={(e) => handleConfigChange('database', e.target.value)}
          placeholder="e.g. automatex"
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors ${
            isMissingDatabase ? 'border-amber-500/50' : 'border-slate-800 focus:border-indigo-500'
          }`}
        />
        {isMissingDatabase && (
          <p className="text-[10px] text-amber-400">Database name is required.</p>
        )}
      </div>

      {/* Collection Name Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          Collection Name <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          value={config.collection || ''}
          onChange={(e) => handleConfigChange('collection', e.target.value)}
          placeholder="e.g. users or orders"
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors ${
            isMissingCollection ? 'border-amber-500/50' : 'border-slate-800 focus:border-indigo-500'
          }`}
        />
        {isMissingCollection && (
          <p className="text-[10px] text-amber-400">Collection name is required.</p>
        )}
      </div>

      {/* Test Connection Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing || isMissingCredential}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Testing MongoDB Connection...</span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 text-white" />
              <span>Test MongoDB Connection</span>
            </>
          )}
        </button>
      </div>

      {/* Connection Status Details */}
      {connectionStatus && (
        <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
          connectionStatus.connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="font-bold flex items-center gap-1.5">
            {connectionStatus.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {connectionStatus.connected ? 'Connected Successfully' : 'Connection Failed'}
          </div>
          {connectionStatus.connected && (
            <div className="text-[10px] opacity-80">
              Latency: {connectionStatus.latencyMs}ms • Version: {connectionStatus.version}
            </div>
          )}
          {connectionStatus.error && (
            <div className="text-[10px] opacity-80">{connectionStatus.error}</div>
          )}
        </div>
      )}
    </div>
  );
};
