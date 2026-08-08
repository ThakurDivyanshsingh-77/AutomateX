import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { ShieldPlus, Loader2, AlertCircle, CheckCircle2, Palette, FileText } from 'lucide-react';

export const DiscordCreateRoleProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [name, setName] = useState(config.name || config.roleName || '');
  const [color, setColor] = useState(config.color || '#5865F2');
  const [hoist, setHoist] = useState(Boolean(config.hoist));
  const [mentionable, setMentionable] = useState(Boolean(config.mentionable));
  const [reason, setReason] = useState(config.reason || '');

  useEffect(() => {
    fetchDiscordCredentials();
  }, []);

  const fetchDiscordCredentials = async () => {
    setLoadingCreds(true);
    setCredError('');
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      const discordCreds = allCreds.filter(
        (c) => c.service === 'discord' || c.authType === 'botToken'
      );
      setCredentials(discordCreds);

      if (discordCreds.length > 0) {
        const exists = discordCreds.some((c) => c._id === credentialId);
        if (!credentialId || !exists) {
          const firstId = discordCreds[0]._id;
          setCredentialId(firstId);
          updateConfigField('credentialId', firstId);
        }
      }
    } catch (err) {
      console.warn('[DiscordCreateRoleProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load Discord credentials');
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    const updated = {
      ...config,
      credentialId,
      guildId,
      name,
      color,
      hoist,
      mentionable,
      reason,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestCreateRole = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!guildId) return toast.error('Please select a Discord Server (Guild)');
    if (!name.trim()) return toast.error('Role Name is required');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/discord/create-role', {
        credentialId,
        guildId,
        name: name.trim(),
        color,
        hoist,
        mentionable,
        reason: reason.trim() || undefined,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Role "${res.data.role?.name || name}" Created Successfully!`);
      } else {
        toast.error(res.data.message || 'Failed to create role');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create Discord role';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  const formattedHex = color.startsWith('#') ? color : `#${color}`;

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner */}
      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldPlus className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white text-xs">Discord → Create Role</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          REST API v10
        </span>
      </div>

      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. Credential Picker */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Credential (Bot Token) <span className="text-rose-400">*</span>
        </label>
        {loadingCreds ? (
          <div className="flex items-center gap-2 text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Loading credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p>No Discord Bot credentials found in vault.</p>
            <p className="text-[11px] text-indigo-400">Add a credential under the Credentials page first.</p>
          </div>
        ) : (
          <select
            value={credentialId}
            onChange={(e) => {
              const val = e.target.value;
              setCredentialId(val);
              setGuildId('');
              updateConfigField('credentialId', val);
              updateConfigField('guildId', '');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- Select Discord Bot Credential --</option>
            {credentials.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.maskedValue})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Server (Guild) Dropdown */}
      <DiscordServerDropdown
        credentialId={credentialId}
        value={guildId}
        onChange={(selectedGuildId) => {
          setGuildId(selectedGuildId);
          updateConfigField('guildId', selectedGuildId);
        }}
      />

      {/* 3. Role Name Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Role Name <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {name.length}/100
          </span>
        </div>
        <input
          type="text"
          placeholder="e.g. Moderator, VIP, AutomateX Bot"
          value={name}
          maxLength={100}
          onChange={(e) => {
            const val = e.target.value;
            setName(val);
            updateConfigField('name', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* 4. Role Color Picker & HEX Input */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Role Color (HEX)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="color"
              value={formattedHex}
              onChange={(e) => {
                const val = e.target.value;
                setColor(val);
                updateConfigField('color', val);
              }}
              className="w-9 h-9 p-0.5 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer"
            />
          </div>
          <input
            type="text"
            placeholder="#5865F2"
            value={color}
            onChange={(e) => {
              const val = e.target.value;
              setColor(val);
              updateConfigField('color', val);
            }}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <div
            className="px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-white shadow-sm flex items-center gap-1.5"
            style={{ backgroundColor: formattedHex, borderColor: formattedHex }}
          >
            <Palette className="w-3.5 h-3.5 opacity-80" />
            <span>Preview</span>
          </div>
        </div>
      </div>

      {/* 5. Toggles (Hoist & Mentionable) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hoist}
            onChange={(e) => {
              const val = e.target.checked;
              setHoist(val);
              updateConfigField('hoist', val);
            }}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
          />
          <div className="leading-tight">
            <span className="block text-[11px] font-semibold text-slate-200">Display separately</span>
            <span className="block text-[10px] text-slate-500">Hoist role in sidebar</span>
          </div>
        </label>

        <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mentionable}
            onChange={(e) => {
              const val = e.target.checked;
              setMentionable(val);
              updateConfigField('mentionable', val);
            }}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
          />
          <div className="leading-tight">
            <span className="block text-[11px] font-semibold text-slate-200">Allow @mention</span>
            <span className="block text-[10px] text-slate-500">Mentionable by anyone</span>
          </div>
        </label>
      </div>

      {/* 6. Reason (X-Audit-Log-Reason Header) */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <label className="block text-xs font-semibold text-slate-300">
            Audit Log Reason <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
        </div>
        <input
          type="text"
          placeholder="e.g. Created via AutomateX Workflow Engine"
          value={reason}
          onChange={(e) => {
            const val = e.target.value;
            setReason(val);
            updateConfigField('reason', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Create Role Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestCreateRole}
          disabled={testing || !credentialId || !guildId || !name.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Role on Discord...</span>
            </>
          ) : (
            <>
              <ShieldPlus className="w-4 h-4" />
              <span>Create Role</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Result Display */}
      {testResult && testResult.role && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role Created Successfully!</span>
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Role Name: <strong className="text-white">{testResult.role.name}</strong></div>
            <div>Role ID: <strong className="text-slate-400">{testResult.role.id}</strong></div>
            <div>Color Int: <strong className="text-indigo-300">{testResult.role.color}</strong></div>
            <div>Hoist / Mentionable: <strong className="text-emerald-400">{String(testResult.role.hoist)} / {String(testResult.role.mentionable)}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordCreateRoleProperties;
