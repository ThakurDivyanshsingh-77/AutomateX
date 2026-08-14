import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Globe, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Code, 
  Layers, 
  Clock, 
  Copy, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../../../../services/api';

const DEFAULT_MAPPINGS = [
  { sourceKey: 'title', targetKey: 'title' },
  { sourceKey: 'game', targetKey: 'game' },
  { sourceKey: 'mode', targetKey: 'mode' },
  { sourceKey: 'entryFee', targetKey: 'entryFee' },
  { sourceKey: 'prizePool', targetKey: 'prizePool' },
  { sourceKey: 'winnerCount', targetKey: 'winnerCount' },
  { sourceKey: 'prizeBreakdown.first', targetKey: 'prizeBreakdown.first' },
  { sourceKey: 'prizeBreakdown.second', targetKey: 'prizeBreakdown.second' },
  { sourceKey: 'prizeBreakdown.third', targetKey: 'prizeBreakdown.third' },
  { sourceKey: 'slots', targetKey: 'slots' },
  { sourceKey: 'date', targetKey: 'date' },
  { sourceKey: 'time', targetKey: 'time' },
  { sourceKey: 'map', targetKey: 'map' },
  { sourceKey: 'bannerImage', targetKey: 'bannerImage' },
  { sourceKey: 'description', targetKey: 'description' },
];

export const WebsiteCreateTournamentProperties = ({ node, onUpdateNode }) => {
  const config = node?.data?.config || {};
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'failed'
  const [testResult, setTestResult] = useState(null);

  // Form states
  const connectionId = config.connectionId || '';
  const tournamentSource = config.tournamentSource || '{{steps["For Each Tournament"].currentItem}}';
  const endpoint = config.endpoint || '/api/v1/tournaments';
  const method = config.method || 'POST';
  const dryRun = Boolean(config.dryRun);
  const duplicateStrategy = config.duplicateStrategy || 'skip';
  const rateLimitMs = config.rateLimitMs !== undefined ? config.rateLimitMs : 0;
  
  const fieldMapping = useMemo(() => {
    if (Array.isArray(config.fieldMapping) && config.fieldMapping.length > 0) {
      return config.fieldMapping;
    }
    return DEFAULT_MAPPINGS;
  }, [config.fieldMapping]);

  // Load saved website connections
  useEffect(() => {
    let isMounted = true;
    const fetchConnections = async () => {
      try {
        setLoadingConnections(true);
        const res = await api.get('/connections/websites');
        if (isMounted && res?.data?.connections) {
          setConnections(res.data.connections);
        }
      } catch (err) {
        console.warn('Could not load website connections list:', err.message);
      } finally {
        if (isMounted) setLoadingConnections(false);
      }
    };
    fetchConnections();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (key, value) => {
    onUpdateNode({
      ...node,
      data: {
        ...node.data,
        config: {
          ...config,
          [key]: value,
        },
      },
    });
  };

  // Field mapping row modifiers
  const handleMappingChange = (index, field, value) => {
    const updated = [...fieldMapping];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('fieldMapping', updated);
  };

  const handleAddMappingRow = () => {
    const updated = [...fieldMapping, { sourceKey: '', targetKey: '' }];
    handleChange('fieldMapping', updated);
  };

  const handleRemoveMappingRow = (index) => {
    const updated = fieldMapping.filter((_, i) => i !== index);
    handleChange('fieldMapping', updated);
  };

  const handleResetDefaultMappings = () => {
    handleChange('fieldMapping', DEFAULT_MAPPINGS);
  };

  // Dynamic Request Preview Generator
  const requestPreviewJson = useMemo(() => {
    const preview = {};
    const sampleValues = {
      title: 'Apex Legends Global Series Qualifier',
      game: 'Apex Legends',
      mode: 'Battle Royale Trios',
      entryFee: 0,
      prizePool: 10000,
      winnerCount: 3,
      'prizeBreakdown.first': 5000,
      'prizeBreakdown.second': 3000,
      'prizeBreakdown.third': 2000,
      slots: 60,
      date: '2026-08-20',
      time: '18:00',
      map: "World's Edge",
      bannerImage: 'https://apex-esports.onrender.com/images/algs_banner.png',
      description: 'Official online qualifier for the seasonal apex esports championship.',
    };

    fieldMapping.forEach(({ sourceKey, targetKey }) => {
      if (!targetKey) return;
      let val = sampleValues[sourceKey] || sampleValues[targetKey] || (sourceKey.startsWith('{{') ? sourceKey : `[Value: ${sourceKey}]`);
      
      // Handle nested dot notation
      const parts = targetKey.split('.');
      let current = preview;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!current[p] || typeof current[p] !== 'object') current[p] = {};
        current = current[p];
      }
      current[parts[parts.length - 1]] = val;
    });

    return JSON.stringify(preview, null, 2);
  }, [fieldMapping]);

  // Test Tournament Creation
  const handleTestCreation = async () => {
    if (!connectionId) {
      setTestStatus('failed');
      setTestResult({ message: 'Please select a Website Connection first.' });
      return;
    }

    try {
      setTestStatus('testing');
      setTestResult(null);

      // Build payload for testing
      const parsedPayload = JSON.parse(requestPreviewJson);

      const res = await api.post(`/connections/websites/${connectionId}/test`, {
        endpoint,
        method,
        payload: parsedPayload,
        dryRun: true,
      });

      setTestStatus('success');
      setTestResult({
        message: 'Tournament payload validated successfully against target website connection.',
        response: res.data || { status: 'ok', payload: parsedPayload },
      });
    } catch (err) {
      setTestStatus('failed');
      setTestResult({
        message: err?.response?.data?.message || err.message || 'Validation request failed.',
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-300 text-xs">
      {/* Description Header */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-violet-950/30 to-purple-950/20 border border-violet-900/40 space-y-1">
        <div className="flex items-center gap-2 font-medium text-slate-100">
          <Trophy className="w-4 h-4 text-violet-400" />
          <span>Apex Esports REST Tournament Creator</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Create tournaments on connected websites with full schema mapping, nested prize pools, rate limiting, and zero token re-entry.
        </p>
      </div>

      {/* Website Connection Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-violet-400" />
            Website Connection <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] text-slate-400">Website → Connect Ref</span>
        </div>

        <select
          value={connectionId}
          onChange={(e) => handleChange('connectionId', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">-- Select Saved Website Connection --</option>
          {connections.map((c) => (
            <option key={c.connectionId || c.id} value={c.connectionId || c.id}>
              {c.name} ({c.websiteUrl || c.apiBaseUrl})
            </option>
          ))}
          {connectionId && !connections.some((c) => (c.connectionId || c.id) === connectionId) && (
            <option value={connectionId}>Custom / Expression: {connectionId}</option>
          )}
        </select>

        <p className="text-[10px] text-slate-400">
          Or bind to previous step: <code className="text-violet-300">{'{{steps["Website → Connect"].connectionId}}'}</code>
        </p>
      </div>

      {/* Tournament Source Expression */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200">
          Tournament Source Expression
        </label>
        <input
          type="text"
          value={tournamentSource}
          onChange={(e) => handleChange('tournamentSource', e.target.value)}
          placeholder='{{steps["For Each Tournament"].currentItem}}'
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
        />
        <p className="text-[10px] text-slate-400">
          Source tournament object or array passed into field mapping engine.
        </p>
      </div>

      {/* Endpoint and HTTP Method */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 space-y-1">
          <label className="text-[11px] font-semibold text-slate-200">Method</label>
          <select
            value={method}
            onChange={(e) => handleChange('method', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono font-semibold"
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-200">Endpoint Path</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => handleChange('endpoint', e.target.value)}
            placeholder="/api/v1/tournaments"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
          />
        </div>
      </div>

      {/* Tournament Field Mapping Table */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Tournament Field Mapping
            </span>
            <p className="text-[10px] text-slate-400">Map tournament source properties or expressions to API payload keys.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaultMappings}
              title="Reset to default Apex fields"
              className="px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded border border-slate-700 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleAddMappingRow}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-violet-300 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-800/50 rounded-md transition"
            >
              <Plus className="w-3 h-3" />
              Add Field
            </button>
          </div>
        </div>

        {/* Table rows */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <div className="grid grid-cols-12 gap-2 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Source Key / Expression</div>
            <div className="col-span-1 text-center">→</div>
            <div className="col-span-5">Target API Key</div>
            <div className="col-span-1"></div>
          </div>

          {fieldMapping.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 group hover:border-slate-700 transition">
              <div className="col-span-5">
                <input
                  type="text"
                  value={row.sourceKey}
                  onChange={(e) => handleMappingChange(idx, 'sourceKey', e.target.value)}
                  placeholder="source property"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="col-span-1 text-center text-slate-500 text-xs">→</div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={row.targetKey}
                  onChange={(e) => handleMappingChange(idx, 'targetKey', e.target.value)}
                  placeholder="target key (e.g. prizeBreakdown.first)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-[11px] font-mono text-violet-300 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveMappingRow(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Remove field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Request Preview */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-violet-400" />
            Request Preview
          </label>
          <span className="text-[10px] text-slate-400">Dynamic Payload Output</span>
        </div>
        <div className="relative">
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[160px] leading-relaxed">
            {requestPreviewJson}
          </pre>
        </div>
      </div>

      {/* Execution Options & Duplicate Strategy */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-200">Duplicate Strategy</label>
            <select
              value={duplicateStrategy}
              onChange={(e) => handleChange('duplicateStrategy', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="skip">Skip Duplicate</option>
              <option value="update">Update Existing</option>
              <option value="create">Create Anyway</option>
              <option value="stop">Stop Workflow</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Delay (ms)
            </label>
            <input
              type="number"
              min="0"
              max="5000"
              step="50"
              value={rateLimitMs}
              onChange={(e) => handleChange('rateLimitMs', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100"
            />
          </div>
        </div>

        {/* Dry Run Toggle */}
        <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-200">Dry Run Mode</div>
            <div className="text-[10px] text-slate-400">Validate payload without sending real HTTP requests.</div>
          </div>
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => handleChange('dryRun', e.target.checked)}
            className="w-4 h-4 rounded text-violet-500 bg-slate-950 border-slate-700 focus:ring-violet-500"
          />
        </label>
      </div>

      {/* Test Tournament Creation Button & Diagnostic Feedback */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleTestCreation}
          disabled={testStatus === 'testing'}
          className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
        >
          {testStatus === 'testing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Validating Connection & Payload...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Tournament Creation</span>
            </>
          )}
        </button>

        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs space-y-1 ${
              testStatus === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{testStatus === 'success' ? 'Validation Successful' : 'Validation Failed'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{testResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteCreateTournamentProperties;
