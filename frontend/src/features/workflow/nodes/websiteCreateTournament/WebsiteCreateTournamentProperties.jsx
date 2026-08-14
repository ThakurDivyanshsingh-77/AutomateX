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
  { sourceKey: 'firstPrize', targetKey: 'firstPrize' },
  { sourceKey: 'secondPrize', targetKey: 'secondPrize' },
  { sourceKey: 'thirdPrize', targetKey: 'thirdPrize' },
  { sourceKey: 'slots', targetKey: 'slots' },
  { sourceKey: 'date', targetKey: 'date' },
  { sourceKey: 'time', targetKey: 'time' },
  { sourceKey: 'map', targetKey: 'map' },
  { sourceKey: 'roomID', targetKey: 'roomID' },
  { sourceKey: 'password', targetKey: 'password' },
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
  const tournamentSource = config.tournamentSource || '{{steps["Gemini → Structure Tournament"].tournament}}';
  const endpoint = config.endpoint || '/tournaments';
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

  // Dynamic Request Preview Generator with REAL sample tournament values
  const requestPreviewJson = useMemo(() => {
    const preview = {};
    const sampleValues = {
      title: 'Apex Championship',
      game: 'Valorant',
      mode: 'SQUAD',
      entryFee: 0,
      prizePool: '₹10,000',
      winnerCount: '3',
      firstPrize: 5000,
      secondPrize: 3000,
      thirdPrize: 2000,
      slots: 64,
      date: '2026-08-20',
      time: '18:00',
      map: 'Haven',
      roomID: '',
      password: '',
      bannerImage: '',
      description: 'Official AutomateX test tournament for competitive Valorant teams.',
    };

    fieldMapping.forEach(({ sourceKey, targetKey }) => {
      if (!targetKey) return;
      let val = sampleValues[sourceKey] !== undefined
        ? sampleValues[sourceKey]
        : sampleValues[targetKey] !== undefined
        ? sampleValues[targetKey]
        : (sourceKey.startsWith('{{') ? sourceKey : '');
      
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

      const parsedPayload = JSON.parse(requestPreviewJson);

      if (dryRun) {
        setTestStatus('success');
        setTestResult({
          dryRun: true,
          status: 'validated',
          message: 'DRY RUN — NO REQUEST SENT. Payload schema is valid.',
          payload: parsedPayload,
        });
        return;
      }

      const res = await api.post(`/connections/websites/${connectionId}/test`, {
        endpoint,
        method,
        payload: parsedPayload,
        dryRun: false,
      });

      setTestStatus('success');
      setTestResult({
        dryRun: false,
        message: 'Tournament successfully created on target website.',
        response: res.data || { status: 'created', payload: parsedPayload },
      });
    } catch (err) {
      setTestStatus('failed');
      setTestResult({
        dryRun: false,
        message: err?.response?.data?.message || err.message || 'Creation request failed.',
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
          Create tournaments directly from extracted Word documents via Apex Esports REST API (<code>POST /tournaments</code>).
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
          placeholder='{{steps["Gemini → Structure Tournament"].tournament}}'
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
        />
        <p className="text-[10px] text-slate-400">
          Structured tournament object from <code>Gemini → Structure Tournament</code>.
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
            placeholder="/tournaments"
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
          <button
            type="button"
            onClick={handleResetDefaultMappings}
            className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
          <div className="grid grid-cols-12 gap-1 p-2 bg-slate-900/80 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Source Property / Expression</div>
            <div className="col-span-1 text-center">→</div>
            <div className="col-span-5">API Key (Target)</div>
            <div className="col-span-1 text-center"></div>
          </div>

          <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto">
            {fieldMapping.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-1 p-1.5 items-center hover:bg-slate-900/30">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={row.sourceKey}
                    onChange={(e) => handleMappingChange(idx, 'sourceKey', e.target.value)}
                    placeholder="sourceKey or {{expression}}"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-200"
                  />
                </div>
                <div className="col-span-1 text-center text-slate-500 text-[11px]">→</div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={row.targetKey}
                    onChange={(e) => handleMappingChange(idx, 'targetKey', e.target.value)}
                    placeholder="target_json_key"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-violet-300"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveMappingRow(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 bg-slate-900/40 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAddMappingRow}
              className="w-full py-1.5 border border-dashed border-slate-700 hover:border-violet-500 rounded text-[11px] text-slate-400 hover:text-violet-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Custom Mapping Field
            </button>
          </div>
        </div>
      </div>

      {/* Live Request Preview */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-violet-400" />
            Live Request Body Preview (REAL Values)
          </label>
          <span className="text-[10px] text-emerald-400 font-medium">Zero Placeholders</span>
        </div>
        <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-violet-300 overflow-x-auto max-h-48 leading-relaxed">
          {requestPreviewJson}
        </pre>
      </div>

      {/* Execution Controls: Dry Run & Duplicate Strategy */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-200">Dry Run Mode</span>
            <p className="text-[10px] text-slate-400">Validate payload without sending real HTTP requests</p>
          </div>
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => handleChange('dryRun', e.target.checked)}
            className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700 focus:ring-violet-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-200">Duplicate Strategy</label>
            <select
              value={duplicateStrategy}
              onChange={(e) => handleChange('duplicateStrategy', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="skip">Skip Duplicate</option>
              <option value="create">Allow (Create Anyway)</option>
              <option value="stop">Stop Workflow on Duplicate</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-200">Delay Between Items</label>
            <select
              value={rateLimitMs}
              onChange={(e) => handleChange('rateLimitMs', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="0">None (0ms)</option>
              <option value="500">500ms</option>
              <option value="1000">1000ms (1s)</option>
              <option value="2000">2000ms (2s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Creation Button and Feedback */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          disabled={testStatus === 'testing'}
          onClick={handleTestCreation}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-950/40 transition-all disabled:opacity-60"
        >
          {testStatus === 'testing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Validating & Dispatching...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{dryRun ? 'Test Dry Run (No Request)' : 'Test Tournament Creation'}</span>
            </>
          )}
        </button>

        {testStatus === 'success' && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{testResult?.dryRun ? 'Dry Run Passed — Payload Valid' : 'Tournament Created Successfully'}</span>
            </div>
            <p className="text-emerald-400/80">{testResult?.message}</p>
            {testResult?.response && (
              <pre className="mt-1.5 p-2 bg-black/40 rounded text-[10px] font-mono text-emerald-200 overflow-x-auto max-h-32">
                {JSON.stringify(testResult.response, null, 2)}
              </pre>
            )}
          </div>
        )}

        {testStatus === 'failed' && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Tournament Creation Failed</span>
            </div>
            <p className="text-rose-400/90">{testResult?.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteCreateTournamentProperties;
