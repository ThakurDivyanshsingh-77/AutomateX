import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordCategoryDropdown } from './DiscordCategoryDropdown';
import { Input } from '../../../components/ui/Input';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { FolderPlus, Loader2, AlertCircle, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DiscordCreateChannelProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [channelType, setChannelType] = useState(
    config.channelType !== undefined ? Number(config.channelType) : 0
  );
  const [name, setName] = useState(config.name || config.channelName || '');
  const [topic, setTopic] = useState(config.topic || '');
  const [nsfw, setNsfw] = useState(Boolean(config.nsfw));
  const [slowmode, setSlowmode] = useState(config.slowmode !== undefined ? config.slowmode : 0);
  const [parentId, setParentId] = useState(config.parentId || config.category || '');
  const [bitrate, setBitrate] = useState(config.bitrate !== undefined ? config.bitrate : 64000);
  const [userLimit, setUserLimit] = useState(config.userLimit !== undefined ? config.userLimit : 0);

  // Validation state
  const [nameError, setNameError] = useState('');

  // Fetch Discord Credentials on mount
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
      console.warn('[DiscordCreateChannelProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load Discord credentials');
    } finally {
      setLoadingCreds(false);
    }
  };

  const validateNameInput = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      setNameError('Channel Name is required.');
      return false;
    }
    if (trimmed.length > 100) {
      setNameError(`Channel Name exceeds maximum length of 100 characters (${trimmed.length}/100).`);
      return false;
    }
    setNameError('');
    return true;
  };

  const updateConfigField = (field, val) => {
    const updated = {
      ...config,
      credentialId,
      guildId,
      channelType,
      name,
      topic,
      nsfw,
      slowmode,
      parentId,
      bitrate,
      userLimit,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestCreateChannel = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!guildId) return toast.error('Please select a Discord Server (Guild)');
    if (!validateNameInput(name)) return toast.error(nameError || 'Please provide a valid Channel Name');

    setTesting(true);
    setTestResult(null);

    const payload = {
      credentialId,
      guildId,
      channelType,
      name: name.trim(),
    };

    if (channelType === 0) {
      if (topic.trim()) payload.topic = topic.trim();
      payload.nsfw = Boolean(nsfw);
      payload.slowmode = Number(slowmode) || 0;
      if (parentId) payload.parentId = parentId;
    } else if (channelType === 2) {
      payload.bitrate = Number(bitrate) || 64000;
      payload.userLimit = Number(userLimit) || 0;
      if (parentId) payload.parentId = parentId;
    }

    try {
      const res = await api.post('/discord/create-channel', payload);

      if (res.data.success) {
        setTestResult(res.data);
        const createdName = res.data.channel?.name || name;
        toast.success(`Channel "${createdName}" Created Successfully!`);
      } else {
        toast.error(res.data.message || 'Failed to create channel');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create Discord channel';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner */}
      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white text-xs">Discord → Create Channel</span>
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

      {/* 3. Channel Type Dropdown */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Channel Type <span className="text-rose-400">*</span>
        </label>
        <select
          value={channelType}
          onChange={(e) => {
            const val = Number(e.target.value);
            setChannelType(val);
            updateConfigField('channelType', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
        >
          <option value={0}>1. Text Channel</option>
          <option value={2}>2. Voice Channel</option>
          <option value={4}>3. Category</option>
        </select>
      </div>

      {/* 4. Channel Name Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Channel Name <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] text-slate-400">
            {name.length}/100 chars
          </span>
        </div>
        <input
          type="text"
          placeholder={
            channelType === 0
              ? 'e.g. general, announcements'
              : channelType === 2
              ? 'e.g. Lounge, Gaming Voice'
              : 'e.g. Community, Support'
          }
          value={name}
          onChange={(e) => {
            const val = e.target.value;
            setName(val);
            validateNameInput(val);
            updateConfigField('name', val);
          }}
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-medium ${
            nameError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
          }`}
        />
        {nameError && (
          <p className="text-[11px] text-rose-400 font-medium">{nameError}</p>
        )}
      </div>

      {/* 5. Dynamic Configuration per Channel Type */}
      {channelType === 0 && (
        /* Text Channel Specific Fields */
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Text Channel Options
          </h4>

          {/* Topic */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-300">
                Topic (Optional)
              </label>
              <span className="text-[10px] text-slate-500">{topic.length}/1024</span>
            </div>
            <textarea
              rows={2}
              placeholder="Set channel topic or description..."
              value={topic}
              onChange={(e) => {
                const val = e.target.value;
                setTopic(val);
                updateConfigField('topic', val);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* NSFW Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-0.5">
            <input
              type="checkbox"
              checked={nsfw}
              onChange={(e) => {
                const val = e.target.checked;
                setNsfw(val);
                updateConfigField('nsfw', val);
              }}
              className="rounded border-slate-800 text-indigo-600 focus:ring-0"
            />
            <span>NSFW Channel (Age-Restricted 18+)</span>
          </label>

          {/* Slowmode */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              Slowmode (Rate Limit Per User)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={21600}
                placeholder="0"
                value={slowmode}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSlowmode(val);
                  updateConfigField('slowmode', val);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-xs text-slate-400 shrink-0">seconds</span>
            </div>
            <p className="text-[10px] text-slate-500">Allowed range: 0 (disabled) to 21600 (6 hours)</p>
          </div>

          {/* Category Picker */}
          <DiscordCategoryDropdown
            credentialId={credentialId}
            guildId={guildId}
            value={parentId}
            onChange={(selectedCatId) => {
              setParentId(selectedCatId);
              updateConfigField('parentId', selectedCatId);
            }}
          />
        </div>
      )}

      {channelType === 2 && (
        /* Voice Channel Specific Fields */
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Voice Channel Options
          </h4>

          {/* Category Picker */}
          <DiscordCategoryDropdown
            credentialId={credentialId}
            guildId={guildId}
            value={parentId}
            onChange={(selectedCatId) => {
              setParentId(selectedCatId);
              updateConfigField('parentId', selectedCatId);
            }}
          />

          {/* Bitrate */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              Bitrate (bps)
            </label>
            <select
              value={bitrate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBitrate(val);
                updateConfigField('bitrate', val);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={8000}>8,000 bps (Low audio quality)</option>
              <option value={32000}>32,000 bps (Speech quality)</option>
              <option value={64000}>64,000 bps (Standard Quality - Default)</option>
              <option value={96000}>96,000 bps (High Quality)</option>
              <option value={128000}>128,000 bps (Server Boost Tier 1)</option>
              <option value={256000}>256,000 bps (Server Boost Tier 2)</option>
              <option value={384000}>384,000 bps (Server Boost Tier 3)</option>
            </select>
          </div>

          {/* User Limit */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              User Limit (0 = Unlimited)
            </label>
            <input
              type="number"
              min={0}
              max={99}
              placeholder="0"
              value={userLimit}
              onChange={(e) => {
                const val = Number(e.target.value);
                setUserLimit(val);
                updateConfigField('userLimit', val);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">Maximum users allowed in voice channel (0 to 99)</p>
          </div>
        </div>
      )}

      {channelType === 4 && (
        /* Category Info Notice */
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Category Channel</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Categories group text and voice channels together. Only Channel Name is required.
          </p>
        </div>
      )}

      {/* Create Channel Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestCreateChannel}
          disabled={testing || !credentialId || !guildId || !name.trim() || Boolean(nameError)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Channel on Discord...</span>
            </>
          ) : (
            <>
              <FolderPlus className="w-4 h-4" />
              <span>Create Channel</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && testResult.channel && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Channel Created Successfully!</span>
            </div>
            {testResult.channelUrl && (
              <a
                href={testResult.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <span>Open Discord</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Channel Name: <strong className="text-white">#{testResult.channel.name}</strong></div>
            <div>Channel ID: <strong className="text-white">{testResult.channel.id}</strong></div>
            <div>Channel Type: <strong className="text-slate-400">{channelType === 0 ? 'Text (0)' : channelType === 2 ? 'Voice (2)' : 'Category (4)'}</strong></div>
            {testResult.channel.parentId && (
              <div>Parent Category ID: <strong className="text-slate-400">{testResult.channel.parentId}</strong></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordCreateChannelProperties;
