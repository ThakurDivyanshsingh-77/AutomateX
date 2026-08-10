import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordRoleDropdown } from './DiscordRoleDropdown';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { ShieldX, Loader2, AlertTriangle, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export const DiscordDeleteRoleProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [roleId, setRoleId] = useState(config.roleId || config.role || '');
  const [reason, setReason] = useState(config.reason || '');
  const [confirmDelete, setConfirmDelete] = useState(Boolean(config.confirmDelete));
  const [isManualInput, setIsManualInput] = useState(
    Boolean(roleId && (roleId.includes('{{') || roleId.includes('$')))
  );

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
      console.warn('[DiscordDeleteRoleProperties] Failed to load credentials:', err);
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
      roleId,
      reason,
      confirmDelete,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestDeleteRole = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!roleId) return toast.error('Please select a Discord Role or enter a dynamic Role ID expression');
    if (!confirmDelete) return toast.error('You must check the confirmation checkbox before deleting');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/discord/delete-role', {
        credentialId,
        guildId,
        roleId,
        reason: reason.trim() || undefined,
        confirmDelete,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Role ${res.data.role?.name || roleId} Deleted Successfully!`);
      } else {
        toast.error(res.data.message || 'Failed to delete role');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete Discord role';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner */}
      <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldX className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-white text-xs">Discord → Delete Role</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
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
              setRoleId('');
              updateConfigField('credentialId', val);
              updateConfigField('guildId', '');
              updateConfigField('roleId', '');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
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
          if (!isManualInput) setRoleId('');
          updateConfigField('guildId', selectedGuildId);
          if (!isManualInput) updateConfigField('roleId', '');
        }}
      />

      {/* 3. Role Selector (Dropdown or Variable Expression Input) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Discord Role <span className="text-rose-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              const nextState = !isManualInput;
              setIsManualInput(nextState);
              if (nextState) setRoleId('');
            }}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors cursor-pointer"
          >
            {isManualInput ? 'Switch to Dropdown Picker' : 'Use Dynamic Variable Expression'}
          </button>
        </div>

        {isManualInput ? (
          <input
            type="text"
            placeholder="e.g. {{steps['Discord → Create Role'].role.id}} or 1234567890"
            value={roleId}
            onChange={(e) => {
              const val = e.target.value;
              setRoleId(val);
              updateConfigField('roleId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <DiscordRoleDropdown
            credentialId={credentialId}
            guildId={guildId}
            value={roleId}
            onChange={(selectedRoleId) => {
              setRoleId(selectedRoleId);
              updateConfigField('roleId', selectedRoleId);
            }}
          />
        )}
      </div>

      {/* 4. Reason (X-Audit-Log-Reason Header) */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <label className="block text-xs font-semibold text-slate-300">
            Audit Log Reason <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
        </div>
        <input
          type="text"
          placeholder="e.g. Deleted via AutomateX Workflow Engine"
          value={reason}
          onChange={(e) => {
            const val = e.target.value;
            setReason(val);
            updateConfigField('reason', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* 5. Permanent Deletion Warning Banner */}
      <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2 text-rose-200">
        <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Permanent Deletion Warning</span>
        </div>
        <p className="text-[11px] text-rose-300/90 leading-relaxed">
          Deleting a Discord role is permanent and cannot be undone. Members with this role will lose its associated permissions.
        </p>

        {/* 6. Required Confirmation Checkbox */}
        <label className="flex items-start gap-2 pt-1 text-xs font-semibold text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmDelete}
            onChange={(e) => {
              const val = e.target.checked;
              setConfirmDelete(val);
              updateConfigField('confirmDelete', val);
            }}
            className="mt-0.5 rounded border-rose-800 bg-slate-900 text-rose-600 focus:ring-0 cursor-pointer"
          />
          <span className="leading-tight text-rose-200">
            I understand this role will be permanently deleted.
          </span>
        </label>
      </div>

      {/* Delete Role Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestDeleteRole}
          disabled={testing || !credentialId || !roleId || !confirmDelete}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting Role on Discord...</span>
            </>
          ) : (
            <>
              <ShieldX className="w-4 h-4" />
              <span>Delete Role</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Result Display */}
      {testResult && testResult.role && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role Deleted Successfully!</span>
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Deleted Role ID: <strong className="text-white">{testResult.role.id}</strong></div>
            <div>Role Name: <strong className="text-slate-400">{testResult.role.name}</strong></div>
            <div>Status: <strong className="text-emerald-400">Permanently Deleted</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordDeleteRoleProperties;
