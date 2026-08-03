import React, { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import { Clock, Globe, Calendar, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

const PRESETS = [
  { label: 'Every Minute (* * * * *)', value: '* * * * *' },
  { label: 'Every 5 Minutes (*/5 * * * *)', value: '*/5 * * * *' },
  { label: 'Every 10 Minutes (*/10 * * * *)', value: '*/10 * * * *' },
  { label: 'Every 20 Minutes (*/20 * * * *)', value: '*/20 * * * *' },
  { label: 'Every Hour (0 * * * *)', value: '0 * * * *' },
  { label: 'Every Day at 9:00 AM (0 9 * * *)', value: '0 9 * * *' },
  { label: 'Every Monday at 9:00 AM (0 9 * * 1)', value: '0 9 * * 1' },
  { label: 'Custom Expression...', value: 'custom' },
];

const TIMEZONES = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'Asia/Kolkata (IST - Indian Standard Time)', value: 'Asia/Kolkata' },
  { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
  { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
];

export const CronProperties = ({ node, onUpdateNodeData }) => {
  const config = node?.data?.config || {};
  const cronExpression = (config.cronExpression || '0 9 * * *').trim();
  const timezone = config.timezone || 'UTC';
  const enabled = config.enabled !== false;

  const [preset, setPreset] = useState(() => {
    const found = PRESETS.find((p) => p.value === cronExpression);
    return found ? found.value : 'custom';
  });

  const [customCron, setCustomCron] = useState(cronExpression);

  // Compute human readable preview string using cronstrue
  const getPreview = (expr) => {
    try {
      if (!expr || !expr.trim()) return 'Invalid expression';
      return cronstrue.toString(expr.trim());
    } catch (e) {
      return 'Invalid Cron Expression syntax';
    }
  };

  const [previewText, setPreviewText] = useState(() => getPreview(cronExpression));
  const isValid = !previewText.startsWith('Invalid');

  const updateConfig = (newConfig) => {
    onUpdateNodeData(node.id, {
      config: {
        ...config,
        ...newConfig,
      },
      isValid: !getPreview(newConfig.cronExpression || cronExpression).startsWith('Invalid'),
    });
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== 'custom') {
      setCustomCron(val);
      setPreviewText(getPreview(val));
      updateConfig({ cronExpression: val });
    }
  };

  const handleCustomCronChange = (e) => {
    const val = e.target.value;
    setCustomCron(val);
    setPreviewText(getPreview(val));
    updateConfig({ cronExpression: val });
  };

  const handleTimezoneChange = (e) => {
    updateConfig({ timezone: e.target.value });
  };

  const handleToggleEnable = () => {
    updateConfig({ enabled: !enabled });
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Enable / Disable Toggle */}
      <button
        type="button"
        onClick={handleToggleEnable}
        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
          enabled
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-bold">Schedule Trigger State</span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-slate-950">
          {enabled ? 'ENABLED' : 'DISABLED'}
        </span>
      </button>

      {/* Preset Selector */}
      <div className="space-y-1">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Schedule Preset
        </label>
        <select
          value={preset}
          onChange={handlePresetChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cron Expression Input */}
      <div className="space-y-1">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" /> Cron Expression Syntax
        </label>
        <input
          type="text"
          value={customCron}
          onChange={handleCustomCronChange}
          placeholder="e.g. */20 * * * *"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
        />
        <p className="text-[10px] text-slate-500 font-mono">Format: minute hour day-of-month month day-of-week</p>
      </div>

      {/* Timezone Selector */}
      <div className="space-y-1">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Execution Timezone
        </label>
        <select
          value={timezone}
          onChange={handleTimezoneChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Human Readable Schedule Preview Card */}
      <div className={`p-3 rounded-xl border space-y-1 ${
        isValid
          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}>
        <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
          {isValid ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          Human Schedule Preview
        </div>
        <div className="text-xs font-semibold font-sans">{previewText}</div>
        <div className="text-[10px] opacity-75 font-mono">Timezone: {timezone}</div>
      </div>
    </div>
  );
};
