import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordMemberDropdown } from './DiscordMemberDropdown';
import { DiscordRoleDropdown } from './DiscordRoleDropdown';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { UserMinus, Loader2, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export const DiscordRemoveRoleFromMemberProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [userId, setUserId] = useState(config.userId || config.memberId || config.member || '');
  const [roleId, setRoleId] = useState(config.roleId || config.role || '');
  const [reason, setReason] = useState(config.reason || '');

  const [isManualUserInput, setIsManualUserInput] = useState(
    Boolean(userId && (userId.includes('{{') || userId.includes('$')))
  );
  const [isManualRoleInput, setIsManualRoleInput] = useState(
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
      console.warn('[DiscordRemoveRoleFromMemberProperties] Failed to load credentials:', err);
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
      userId,
      roleId,
      reason,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestRemoveRole = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!userId) return toast.error('Please select a Member or enter a dynamic Member/User ID');
    if (!roleId) return toast.error('Please select a Role or enter a dynamic Role ID');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/discord/remove-role-from-member', {
        credentialId,
        guildId,
        userId,
        roleId,
        reason: reason.trim() || undefined,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Role removed from member successfully!`);
      } else {
        toast.error(res.data.message || 'Failed to remove role');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to remove Discord role from member';
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
          <UserMinus className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-white text-xs">Discord → Remove Role from Member</span>
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
              setUserId('');
              setRoleId('');
              updateConfigField('credentialId', val);
              updateConfigField('guildId', '');
              updateConfigField('userId', '');
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
          if (!isManualUserInput) setUserId('');
          if (!isManualRoleInput) setRoleId('');
          updateConfigField('guildId', selectedGuildId);
          if (!isManualUserInput) updateConfigField('userId', '');
          if (!isManualRoleInput) updateConfigField('roleId', '');
        }}
      />

      {/* 3. Member Selector (Dropdown or Variable Expression Input) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Discord Member / User <span className="text-rose-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              const nextState = !isManualUserInput;
              setIsManualUserInput(nextState);
              if (nextState) setUserId('');
            }}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors cursor-pointer"
          >
            {isManualUserInput ? 'Switch to Member Picker' : 'Use Dynamic Variable Expression'}
          </button>
        </div>

        {isManualUserInput ? (
          <input
            type="text"
            placeholder="e.g. {{steps['Discord → Add Role to Member'].userId}} or {{steps['Previous Node'].user.id}}"
            value={userId}
            onChange={(e) => {
              const val = e.target.value;
              setUserId(val);
              updateConfigField('userId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <DiscordMemberDropdown
            credentialId={credentialId}
            guildId={guildId}
            value={userId}
            onChange={(selectedUserId) => {
              setUserId(selectedUserId);
              updateConfigField('userId', selectedUserId);
            }}
          />
        )}
      </div>

      {/* 4. Role Selector (Dropdown or Variable Expression Input) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Discord Role <span className="text-rose-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              const nextState = !isManualRoleInput;
              setIsManualRoleInput(nextState);
              if (nextState) setRoleId('');
            }}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors cursor-pointer"
          >
            {isManualRoleInput ? 'Switch to Role Picker' : 'Use Dynamic Variable Expression'}
          </button>
        </div>

        {isManualRoleInput ? (
          <input
            type="text"
            placeholder="e.g. {{steps['Discord → Add Role to Member'].roleId}} or {{steps['Previous Node'].role.id}}"
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

      {/* 5. Reason (X-Audit-Log-Reason Header) */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <label className="block text-xs font-semibold text-slate-300">
            Audit Log Reason <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
        </div>
        <input
          type="text"
          placeholder="e.g. Role revoked via AutomateX Workflow Engine"
          value={reason}
          onChange={(e) => {
            const val = e.target.value;
            setReason(val);
            updateConfigField('reason', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Remove Role Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestRemoveRole}
          disabled={testing || !credentialId || !userId || !roleId}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Removing Role on Discord...</span>
            </>
          ) : (
            <>
              <UserMinus className="w-4 h-4" />
              <span>Remove Role from Member</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Result Display */}
      {testResult && testResult.success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role Removed Successfully!</span>
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Member ID: <strong className="text-white">{testResult.userId}</strong></div>
            <div>Role ID: <strong className="text-rose-300">{testResult.roleId}</strong></div>
            <div>Guild ID: <strong className="text-slate-400">{testResult.guildId}</strong></div>
            <div>HTTP Status: <strong className="text-emerald-400">204 No Content</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordRemoveRoleFromMemberProperties;
