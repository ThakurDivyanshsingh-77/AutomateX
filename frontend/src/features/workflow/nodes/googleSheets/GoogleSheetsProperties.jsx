import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Play,
  Table,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AuthContext } from '../../../../context/AuthContext';
import { credentialService } from '../../../../services/credentialService';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

export const GoogleSheetsProperties = ({ node, nodeType, nodeData, onUpdateNodeConfig, onUpdateNodeData, onChange }) => {
  const currentNode = node || { data: nodeData };
  const currentType = nodeType || currentNode?.type || 'googleSheetsAppendRow';
  const config = currentNode?.data?.config || nodeData?.config || {};

  // Form State
  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || '');
  const [worksheet, setWorksheet] = useState(config.worksheet || 'Sheet1');
  const [operation, setOperation] = useState(config.operation || currentType || 'appendRow');
  const [range, setRange] = useState(config.range || 'A1:Z100');
  const [headerRow, setHeaderRow] = useState(config.headerRow || 1);

  // Auto-detected Columns & Data Mappings
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState(config.mappings || []);
  
  // Pickers Data
  const [credentials, setCredentials] = useState([]);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  // Loaders
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [loadingWorksheets, setLoadingWorksheets] = useState(false);
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Sync internal state if node changes externally
  useEffect(() => {
    if (config.credentialId !== undefined) setCredentialId(config.credentialId);
    if (config.spreadsheetId !== undefined) setSpreadsheetId(config.spreadsheetId);
    if (config.worksheet !== undefined) setWorksheet(config.worksheet);
    if (config.operation !== undefined) setOperation(config.operation);
    if (config.range !== undefined) setRange(config.range);
    if (config.headerRow !== undefined) setHeaderRow(config.headerRow);
    if (config.mappings !== undefined) setMappings(config.mappings);
  }, [currentNode?.id, config.credentialId, config.spreadsheetId, config.worksheet]);

  // 1. Fetch User Google Credentials on mount
  useEffect(() => {
    fetchCredentials();
  }, []);

  // 2. Fetch Spreadsheets when Credential Changes
  useEffect(() => {
    if (credentialId) {
      fetchSpreadsheets(credentialId);
    }
  }, [credentialId]);

  // 3. Fetch Worksheets when Spreadsheet or Credential Changes
  useEffect(() => {
    if (spreadsheetId && credentialId) {
      fetchWorksheets(spreadsheetId, credentialId);
    }
  }, [spreadsheetId, credentialId]);

  // 4. Auto Detect Headers when Worksheet Changes
  useEffect(() => {
    if (spreadsheetId && worksheet) {
      fetchHeaders(spreadsheetId, worksheet);
    }
  }, [spreadsheetId, worksheet]);

  const updateConfig = (newFields) => {
    const nextConfig = {
      ...config,
      credentialId,
      spreadsheetId,
      worksheet,
      operation,
      range,
      headerRow,
      mappings,
      ...newFields,
    };

    if (onUpdateNodeConfig) {
      onUpdateNodeConfig(nextConfig);
    } else if (onUpdateNodeData && currentNode?.id) {
      onUpdateNodeData(currentNode.id, { config: nextConfig });
    } else if (onChange) {
      onChange(nextConfig);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await api.get('/credentials');
      if (res.data.success) {
        const googleCreds = (res.data.data || []).filter((c) => c.service === 'gmail' || c.service === 'googleSheets' || c.service === 'google');
        setCredentials(googleCreds);
        if (!credentialId && googleCreds.length > 0) {
          setCredentialId(googleCreds[0]._id);
          updateConfig({ credentialId: googleCreds[0]._id });
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchSpreadsheets = async (credId) => {
    setLoadingSpreadsheets(true);
    try {
      const res = await api.get(`/google/sheets?credentialId=${credId}`);
      if (res.data.success) {
        setSpreadsheets(res.data.spreadsheets || []);
        if (res.data.spreadsheets.length > 0 && !spreadsheetId) {
          setSpreadsheetId(res.data.spreadsheets[0].id);
          updateConfig({ credentialId: credId, spreadsheetId: res.data.spreadsheets[0].id });
        }
      }
    } catch (err) {
      toast.error('Failed to load spreadsheets from Google Drive');
    } finally {
      setLoadingSpreadsheets(false);
    }
  };

  const fetchWorksheets = async (spId, credId = credentialId) => {
    if (!spId) return;
    setLoadingWorksheets(true);
    try {
      const targetCred = credId || credentialId;
      const res = await api.get(`/google/sheets/${spId}/worksheets?credentialId=${targetCred}`);
      if (res.data.success) {
        const fetchedWorksheets = res.data.worksheets || [];
        setWorksheets(fetchedWorksheets);
        if (fetchedWorksheets.length > 0) {
          const firstTitle = fetchedWorksheets[0].title;
          if (!worksheet) {
            setWorksheet(firstTitle);
            updateConfig({ worksheet: firstTitle });
          }
        }
      }
    } catch (err) {
      // Set default fallback Sheet1 tab on any network error so user can continue without blocking
      const fallbackWorksheets = [{ id: 0, sheetId: 0, title: 'Sheet1', index: 0 }];
      setWorksheets(fallbackWorksheets);
      if (!worksheet) {
        setWorksheet('Sheet1');
        updateConfig({ worksheet: 'Sheet1' });
      }
    } finally {
      setLoadingWorksheets(false);
    }
  };

  const fetchHeaders = async (spId, wsTitle) => {
    setLoadingHeaders(true);
    try {
      const res = await api.get(`/google/sheets/${spId}/headers?credentialId=${credentialId}&worksheet=${encodeURIComponent(wsTitle)}&headerRow=${headerRow}`);
      if (res.data.success && res.data.headers) {
        setHeaders(res.data.headers);
        // Pre-populate empty mappings if none exist
        if (!config.mappings || config.mappings.length === 0) {
          const autoMappings = res.data.headers.map((h) => ({
            column: h,
            value: `{{item.${h.toLowerCase().replace(/\s+/g, '_')}}}`,
          }));
          setMappings(autoMappings);
          updateConfig({ mappings: autoMappings });
        }
      }
    } catch (err) {
      toast.error('Failed to auto-detect headers');
    } finally {
      setLoadingHeaders(false);
    }
  };

  const { user } = React.useContext(AuthContext);

  const handleConnectOAuth = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error('You must be logged in to connect Google Account.');
      return;
    }
    try {
      const result = await credentialService.connectGmail(userId, `Google Account – ${user.name || user.email}`);
      toast.success(`✅ Connected: ${result.email}`);
      await fetchCredentials();
      if (result.credentialId) {
        setCredentialId(result.credentialId);
        updateConfig({ credentialId: result.credentialId });
      }
    } catch (err) {
      toast.error(err.message || 'OAuth connection failed');
    }
  };

  const handleMappingChange = (idx, field, val) => {
    const updated = [...mappings];
    updated[idx][field] = val;
    setMappings(updated);
    updateConfig({ mappings: updated });
  };

  const handleAddMapping = () => {
    const updated = [...mappings, { column: '', value: '' }];
    setMappings(updated);
    updateConfig({ mappings: updated });
  };

  const handleRemoveMapping = (idx) => {
    const updated = mappings.filter((_, i) => i !== idx);
    setMappings(updated);
    updateConfig({ mappings: updated });
  };

  const handleTestOperation = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/google/sheets/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId,
          spreadsheetId,
          worksheet,
          limit: 3,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success(`Test Successful! Read ${data.rows?.length || 0} rows.`);
      } else {
        toast.error('Test operation failed');
      }
    } catch (err) {
      toast.error('Test execution error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-200">
      {/* 1. Google Account Credential */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Google Account</span>
          <button
            type="button"
            onClick={handleConnectOAuth}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 lowercase"
          >
            + Connect Google Account
          </button>
        </label>

        <select
          value={credentialId}
          onChange={(e) => {
            setCredentialId(e.target.value);
            updateConfig({ credentialId: e.target.value });
          }}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Connected Google Account...</option>
          {credentials.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Spreadsheet Picker */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Spreadsheet
          </span>
          {loadingSpreadsheets && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
        </label>

        <div className="flex items-center gap-2">
          <select
            value={spreadsheetId}
            onChange={(e) => {
              setSpreadsheetId(e.target.value);
              updateConfig({ spreadsheetId: e.target.value });
            }}
            disabled={loadingSpreadsheets || !credentialId}
            className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="">Select Spreadsheet...</option>
            {spreadsheets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id.slice(0, 8)}...)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => credentialId && fetchSpreadsheets(credentialId)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Worksheet Picker */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Worksheet (Tab)
          </span>
          {loadingWorksheets && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
        </label>

        <div className="flex items-center gap-2">
          <select
            value={worksheet}
            onChange={(e) => {
              setWorksheet(e.target.value);
              updateConfig({ worksheet: e.target.value });
            }}
            disabled={loadingWorksheets || !spreadsheetId}
            className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="">Select Worksheet Tab...</option>
            {worksheets.map((w, idx) => (
              <option key={w.sheetId || w.id || idx} value={w.title}>
                {w.title} {w.rowCount ? `(${w.rowCount} rows)` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => spreadsheetId && fetchWorksheets(spreadsheetId, credentialId)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Visual Column Mapper */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            Column Auto-Mapper ({headers.length} Columns Detected)
          </label>
          <button
            type="button"
            onClick={handleAddMapping}
            className="p-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30 transition-colors"
          >
            <Plus className="w-3 h-3" /> Map Column
          </button>
        </div>

        {loadingHeaders ? (
          <div className="p-3 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Auto-detecting sheet headers...
          </div>
        ) : (
          <div className="space-y-2">
            {mappings.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Column Header"
                  value={item.column}
                  onChange={(e) => handleMappingChange(idx, 'column', e.target.value)}
                  className="w-1/3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="{{item.value}}"
                  value={item.value}
                  onChange={(e) => handleMappingChange(idx, 'value', e.target.value)}
                  className="flex-1 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMapping(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Live Test & Preview Button */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <button
          type="button"
          onClick={handleTestOperation}
          disabled={testing || !spreadsheetId}
          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          Test Connection & Read Preview Rows
        </button>

        {testResult && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1">
            <div className="text-emerald-400 font-bold flex items-center justify-between">
              <span>Status: {testResult.success ? 'Success 200 OK' : 'Failed'}</span>
              <span>Rows Read: {testResult.rows?.length || 0}</span>
            </div>
            <pre className="max-h-32 overflow-y-auto text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
              {JSON.stringify(testResult.rows || testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
