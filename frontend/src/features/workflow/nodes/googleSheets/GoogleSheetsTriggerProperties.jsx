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
  Clock,
  Filter,
  Save,
  Zap,
} from 'lucide-react';
import { credentialService } from '../../../../services/credentialService';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

export const GoogleSheetsTriggerProperties = ({ node, nodeType, nodeData, workflowId, onUpdateNodeConfig, onUpdateNodeData, onChange }) => {
  const currentNode = node || { data: nodeData };
  const config = currentNode?.data?.config || nodeData?.config || {};

  // Form State
  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || '');
  const [worksheetTitle, setWorksheetTitle] = useState(config.worksheetTitle || config.worksheet || 'Sheet1');
  const [triggerEvent, setTriggerEvent] = useState(config.triggerEvent || 'newRow');
  const [pollingInterval, setPollingInterval] = useState(config.pollingInterval || '30s');
  const [ignoreExistingRows, setIgnoreExistingRows] = useState(config.ignoreExistingRows !== false);
  const [maxRows, setMaxRows] = useState(config.maxRows || 100);

  // Pickers & Data state
  const [credentials, setCredentials] = useState([]);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  // Loaders
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [loadingWorksheets, setLoadingWorksheets] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Sync internal state when node updates
  useEffect(() => {
    if (config.credentialId !== undefined) setCredentialId(config.credentialId);
    if (config.spreadsheetId !== undefined) setSpreadsheetId(config.spreadsheetId);
    if (config.worksheetTitle !== undefined) setWorksheetTitle(config.worksheetTitle);
    if (config.triggerEvent !== undefined) setTriggerEvent(config.triggerEvent);
    if (config.pollingInterval !== undefined) setPollingInterval(config.pollingInterval);
    if (config.ignoreExistingRows !== undefined) setIgnoreExistingRows(config.ignoreExistingRows);
    if (config.maxRows !== undefined) setMaxRows(config.maxRows);
  }, [currentNode?.id]);

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    if (credentialId) {
      fetchSpreadsheets(credentialId);
    }
  }, [credentialId]);

  useEffect(() => {
    if (spreadsheetId && credentialId) {
      fetchWorksheets(spreadsheetId, credentialId);
    }
  }, [spreadsheetId, credentialId]);

  const updateConfig = (newFields) => {
    const nextConfig = {
      ...config,
      credentialId,
      spreadsheetId,
      worksheetTitle,
      worksheet: worksheetTitle,
      triggerEvent,
      pollingInterval,
      ignoreExistingRows,
      maxRows,
      ...newFields,
    };

    if (typeof onUpdateNodeConfig === 'function') {
      onUpdateNodeConfig(nextConfig);
    } else if (typeof onChange === 'function') {
      onChange(nextConfig);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await credentialService.getAllCredentials();
      const list = Array.isArray(res) ? res : res?.credentials || res?.data || [];
      const googleCreds = list.filter((c) => c.type === 'google' || c.type === 'google_oauth' || c.type === 'google_sheets');
      setCredentials(googleCreds);
      if (googleCreds.length > 0 && !credentialId) {
        setCredentialId(googleCreds[0]._id);
        updateConfig({ credentialId: googleCreds[0]._id });
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    }
  };

  const fetchSpreadsheets = async (credId) => {
    setLoadingSpreadsheets(true);
    try {
      const res = await api.get(`/google/sheets?credentialId=${credId}`);
      const sheetsList = res.data?.spreadsheets || [];
      setSpreadsheets(sheetsList);
      if (sheetsList.length > 0 && !spreadsheetId) {
        setSpreadsheetId(sheetsList[0].id);
        updateConfig({ spreadsheetId: sheetsList[0].id });
      }
    } catch (err) {
      console.error('Failed to fetch spreadsheets:', err);
      toast.error('Could not load spreadsheets');
    } finally {
      setLoadingSpreadsheets(false);
    }
  };

  const fetchWorksheets = async (sheetId, credId) => {
    setLoadingWorksheets(true);
    try {
      const res = await api.get(`/google/sheets/${sheetId}/worksheets?credentialId=${credId}`);
      const tabs = res.data?.worksheets || [];
      setWorksheets(tabs);
      if (tabs.length > 0 && (!worksheetTitle || !tabs.some((t) => t.title === worksheetTitle))) {
        setWorksheetTitle(tabs[0].title);
        updateConfig({ worksheetTitle: tabs[0].title, worksheet: tabs[0].title });
      }
    } catch (err) {
      console.error('Failed to fetch worksheets:', err);
    } finally {
      setLoadingWorksheets(false);
    }
  };

  const handleTestTrigger = async () => {
    if (!spreadsheetId) {
      toast.error('Please select a Spreadsheet first');
      return;
    }

    setTesting(true);
    setTestResult(null);
    const toastId = toast.loading('Testing trigger configuration...');

    // Ensure workflowId is a valid Mongo ObjectId if provided, never node.id
    const validWorkflowId = workflowId || currentNode?.workflowId;
    const nodeId = currentNode?.id;

    try {
      const res = await api.post('/google-sheets/trigger/test', {
        credentialId,
        spreadsheetId,
        worksheetTitle,
        worksheet: worksheetTitle,
        workflowId: validWorkflowId && validWorkflowId !== nodeId ? validWorkflowId : undefined,
        nodeId,
      });

      if (res.data?.success) {
        setTestResult(res.data);
        toast.success(`Trigger verified! Baseline snapshot saved (${res.data.rows} rows found)`, { id: toastId });
      } else {
        toast.error(res.data?.message || 'Test Trigger failed', { id: toastId });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Test Trigger error';
      toast.error(`Error: ${msg}`, { id: toastId });
      setTestResult({ success: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveTrigger = () => {
    updateConfig({
      credentialId,
      spreadsheetId,
      worksheetTitle,
      worksheet: worksheetTitle,
      triggerEvent,
      pollingInterval,
      ignoreExistingRows,
      maxRows,
    });
    toast.success('Google Sheets Trigger configuration saved!');
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none text-slate-200">
      {/* Node Header Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Google Sheets Trigger</h4>
            <p className="text-[10px] text-slate-400">Monitors spreadsheet changes & fires workflow automatically</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
          TRIGGER
        </span>
      </div>

      {/* 1. Google Account Credential Dropdown */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Google Account
        </label>
        <select
          value={credentialId}
          onChange={(e) => {
            setCredentialId(e.target.value);
            updateConfig({ credentialId: e.target.value });
          }}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="">Select Google OAuth Account...</option>
          {credentials.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name || `Google Account (${c._id.slice(-4)})`}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Spreadsheet Selector */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Spreadsheet
          </label>
          <button
            type="button"
            onClick={() => credentialId && fetchSpreadsheets(credentialId)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loadingSpreadsheets ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <select
          value={spreadsheetId}
          onChange={(e) => {
            setSpreadsheetId(e.target.value);
            updateConfig({ spreadsheetId: e.target.value });
          }}
          disabled={loadingSpreadsheets || !credentialId}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
        >
          <option value="">
            {loadingSpreadsheets ? 'Loading spreadsheets...' : 'Select Google Spreadsheet...'}
          </option>
          {spreadsheets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Worksheet (Tab) Selector */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Worksheet
          </label>
          <button
            type="button"
            onClick={() => spreadsheetId && credentialId && fetchWorksheets(spreadsheetId, credentialId)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loadingWorksheets ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <select
          value={worksheetTitle}
          onChange={(e) => {
            setWorksheetTitle(e.target.value);
            updateConfig({ worksheetTitle: e.target.value, worksheet: e.target.value });
          }}
          disabled={loadingWorksheets || !spreadsheetId}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
        >
          <option value="">{loadingWorksheets ? 'Loading worksheet tabs...' : 'Select Sheet Tab...'}</option>
          {worksheets.map((w) => (
            <option key={w.sheetId || w.title} value={w.title}>
              {w.title} ({w.rowCount} rows)
            </option>
          ))}
        </select>
      </div>

      {/* 4. Trigger Event */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Trigger Event
        </label>
        <select
          value={triggerEvent}
          onChange={(e) => {
            setTriggerEvent(e.target.value);
            updateConfig({ triggerEvent: e.target.value });
          }}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
        >
          <option value="newRow">New Row</option>
          <option value="updatedRow">Existing Row Updated</option>
          <option value="anyChange">Any Change (New, Updated, Deleted)</option>
        </select>
      </div>

      {/* 5. Polling Interval */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Polling Interval
        </label>
        <select
          value={pollingInterval}
          onChange={(e) => {
            setPollingInterval(e.target.value);
            updateConfig({ pollingInterval: e.target.value });
          }}
          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="30s">30 Seconds</option>
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
        </select>
      </div>

      {/* 6. Controls: Ignore Existing Rows & Max Rows */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1 flex flex-col justify-end">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              checked={ignoreExistingRows}
              onChange={(e) => {
                setIgnoreExistingRows(e.target.checked);
                updateConfig({ ignoreExistingRows: e.target.checked });
              }}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-[10px] font-semibold">Ignore Existing Rows</span>
          </label>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Max Rows Per Poll</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={maxRows}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 100;
              setMaxRows(val);
              updateConfig({ maxRows: val });
            }}
            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>
      </div>

      {/* Test Result Box */}
      {testResult && (
        <div
          className={`p-3 rounded-xl border text-xs ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{testResult.success ? 'Trigger Verified & Baseline Snapshot Saved' : 'Trigger Test Failed'}</span>
          </div>
          {testResult.success && (
            <div className="text-[10px] font-mono space-y-0.5 mt-1 text-slate-300">
              <div>Total Rows Detected: <strong className="text-emerald-400">{testResult.rows}</strong></div>
              <div>Snapshot Status: <span className="text-emerald-400 font-semibold">Saved to DB</span></div>
              {testResult.sampleData && testResult.sampleData.length > 0 && (
                <div className="mt-1.5 p-1.5 rounded bg-slate-950 border border-slate-800 overflow-x-auto text-[9px]">
                  Sample Row 1: {JSON.stringify(testResult.sampleData[0])}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Save Trigger & Test Trigger */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleTestTrigger}
          disabled={testing || !spreadsheetId}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Test Trigger
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSaveTrigger}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
        >
          <Save className="w-3.5 h-3.5" />
          Save Trigger
        </button>
      </div>
    </div>
  );
};

export default GoogleSheetsTriggerProperties;
