import React, { useState, useEffect } from 'react';
import { credentialService } from '../../../credentials/credentialService';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { Database, Activity, CheckCircle2, AlertTriangle, Code, Play, Sparkles } from 'lucide-react';
import { ExpressionInput } from '../../../../components/expression/ExpressionInput';

export const MongoCrudProperties = ({ nodeType, nodeData, onUpdateNodeConfig }) => {
  const config = nodeData?.config || {};
  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

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

  const handleConfigChange = (key, value) => {
    onUpdateNodeConfig({
      ...config,
      [key]: value,
    });
  };

  const handleTestRun = async () => {
    setTesting(true);
    try {
      let queryPayload = config.filter || config.query || config.pipeline || {};
      if (typeof queryPayload === 'string') {
        try { queryPayload = JSON.parse(queryPayload); } catch { queryPayload = {}; }
      }

      const res = await api.post('/database/query', {
        provider: 'mongodb',
        credentialId: config.credentialId,
        database: config.database || 'automatex',
        collection: config.collection || 'users',
        query: queryPayload,
        limit: 10,
      });

      if (res.data.success) {
        setTestResult({
          success: true,
          totalReturned: res.data.totalReturned,
          previewRows: res.data.previewRows,
        });
        toast.success(`Query test succeeded! Returned ${res.data.totalReturned} document(s).`);
      } else {
        setTestResult({ success: false, error: res.data.message });
        toast.error('Query test failed');
      }
    } catch (err) {
      setTestResult({ success: false, error: err.response?.data?.message || 'Query test failed' });
      toast.error('MongoDB Query execution failed');
    } finally {
      setTesting(false);
    }
  };

  const isMissingCredential = !config.credentialId;
  const isMissingDatabase = !config.database;
  const isMissingCollection = !config.collection;

  return (
    <div className="space-y-4 text-xs font-sans text-slate-100 select-none">
      {/* Header Banner */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white capitalize">{nodeType.replace('mongo', 'MongoDB ')}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
          MongoDB Driver
        </span>
      </div>

      {/* Credential Vault Selector */}
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
          <option value="">-- Select Saved MongoDB Credential --</option>
          {credentials.map((cred) => (
            <option key={cred._id} value={cred._id}>
              {cred.name} ({cred.maskedValue})
            </option>
          ))}
        </select>
        {isMissingCredential && (
          <p className="text-[10px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Select a credential to publish this workflow.
          </p>
        )}
      </div>

      {/* Database & Collection Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Database Name *</label>
          <input
            type="text"
            value={config.database || ''}
            onChange={(e) => handleConfigChange('database', e.target.value)}
            placeholder="automatex"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Collection Name *</label>
          <input
            type="text"
            value={config.collection || ''}
            onChange={(e) => handleConfigChange('collection', e.target.value)}
            placeholder="users"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
          />
        </div>
      </div>

      {/* Dynamic Query / Document / Filter / Pipeline Editor */}
      {nodeType === 'mongoInsertOne' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Document Payload (JSON) *</span>
            <span className="text-[10px] text-indigo-400 font-mono">Supports {"{{vars}}"}</span>
          </label>
          <ExpressionInput
            value={config.document || '{\n  "name": "{{trigger.body.name}}"\n}'}
            onChange={(val) => handleConfigChange('document', val)}
            placeholder='{ "name": "{{trigger.body.name}}" }'
            isTextarea={true}
            rows={5}
          />
        </div>
      )}

      {(nodeType === 'mongoFind' || nodeType === 'mongoFindOne' || nodeType === 'mongoCount') && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Query Filter (JSON) *</span>
            <span className="text-[10px] text-indigo-400 font-mono">Supports {"{{vars}}"}</span>
          </label>
          <ExpressionInput
            value={config.filter || config.query || '{\n  "status": "active"\n}'}
            onChange={(val) => handleConfigChange('filter', val)}
            placeholder='{ "email": "{{trigger.body.email}}" }'
            isTextarea={true}
            rows={4}
          />
        </div>
      )}

      {nodeType === 'mongoUpdateOne' && (
        <>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Query Filter (JSON) *</label>
            <ExpressionInput
              value={config.filter || '{\n  "_id": "{{trigger.body.id}}"\n}'}
              onChange={(val) => handleConfigChange('filter', val)}
              isTextarea={true}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Update Payload ($set / $push) *</label>
            <ExpressionInput
              value={config.update || '{\n  "$set": {\n    "status": "verified"\n  }\n}'}
              onChange={(val) => handleConfigChange('update', val)}
              isTextarea={true}
              rows={4}
            />
          </div>
        </>
      )}

      {nodeType === 'mongoDeleteOne' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Delete Filter (JSON) *</label>
          <ExpressionInput
            value={config.filter || '{\n  "_id": "{{trigger.body.id}}"\n}'}
            onChange={(val) => handleConfigChange('filter', val)}
            isTextarea={true}
            rows={4}
          />
        </div>
      )}

      {nodeType === 'mongoAggregate' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Aggregation Pipeline (JSON Array) *</label>
          <ExpressionInput
            value={config.pipeline || '[\n  {\n    "$match": { "status": "active" }\n  }\n]'}
            onChange={(val) => handleConfigChange('pipeline', val)}
            isTextarea={true}
            rows={5}
          />
        </div>
      )}

      {/* Test Runner Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestRun}
          disabled={testing || isMissingCredential}
          className="w-full py-2 px-3 bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Test Configuration Execution</span>
        </button>
      </div>

      {/* Test Output Results */}
      {testResult && (
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px] space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
            {testResult.success ? `Execution Succeeded (${testResult.totalReturned} items)` : 'Execution Failed'}
          </div>
          {testResult.previewRows && (
            <pre className="p-2 bg-slate-900 rounded border border-slate-800 overflow-x-auto text-[10px] text-slate-300 max-h-40">
              {JSON.stringify(testResult.previewRows, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
