import React, { useState, useEffect } from 'react';
import { credentialService } from '../../credentials/services/credentialService';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordChannelDropdown } from './DiscordChannelDropdown';
import { MessageSquare, AlertCircle, Loader2, ShieldCheck, Check } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const DiscordMessageReceivedProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || 'all');
  const [channelId, setChannelId] = useState(config.channelId || 'all');
  const [ignoreBotMessages, setIgnoreBotMessages] = useState(
    config.ignoreBotMessages !== undefined ? config.ignoreBotMessages : true
  );
  const [responseMode, setResponseMode] = useState(
    config.responseMode || (config.onlyBotMentioned ? 'mention' : 'all')
  );
  const [onlyBotMentioned, setOnlyBotMentioned] = useState(
    config.onlyBotMentioned !== undefined ? config.onlyBotMentioned : (responseMode === 'mention')
  );

  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoadingCreds(true);
    setCredError('');
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      const discordCreds = allCreds.filter((c) => c.service === 'discord');
      setCredentials(discordCreds);

      if (discordCreds.length > 0 && !credentialId) {
        const firstId = discordCreds[0]._id;
        setCredentialId(firstId);
        updateConfigField('credentialId', firstId);
      }
    } catch (err) {
      console.warn('[DiscordMessageReceivedProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load Discord credentials from vault');
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    let nextCred = credentialId;
    let nextGuild = guildId;
    let nextChannel = channelId;
    let nextIgnoreBot = ignoreBotMessages;
    let nextMode = responseMode;
    let nextOnlyMentioned = onlyBotMentioned;

    if (field === 'credentialId') nextCred = val;
    else if (field === 'guildId') nextGuild = val;
    else if (field === 'channelId') nextChannel = val;
    else if (field === 'ignoreBotMessages') nextIgnoreBot = val;
    else if (field === 'responseMode') {
      nextMode = val;
      nextOnlyMentioned = val === 'mention';
    } else if (field === 'onlyBotMentioned') {
      nextOnlyMentioned = val;
      nextMode = val ? 'mention' : 'all';
    }

    const updated = {
      ...config,
      credentialId: nextCred,
      provider: 'discord',
      triggerType: 'discordMessageReceived',
      guildId: nextGuild,
      channelId: nextChannel,
      ignoreBotMessages: nextIgnoreBot,
      responseMode: nextMode,
      onlyBotMentioned: nextOnlyMentioned,
    };

    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner */}
      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs leading-none">Discord → Message Received</h4>
            <p className="text-[10px] text-indigo-300 mt-0.5">Real-Time Gateway Trigger</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          TRIGGER
        </span>
      </div>

      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. Credential Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Credential <span className="text-rose-400">*</span>
        </label>
        {loadingCreds ? (
          <div className="flex items-center gap-2 text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Loading credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p className="text-slate-300 font-medium">No Discord credentials found.</p>
            <p className="text-[11px] text-indigo-400">Add a Discord Bot credential under Credentials first.</p>
          </div>
        ) : (
          <select
            value={credentialId}
            onChange={(e) => {
              const val = e.target.value;
              setCredentialId(val);
              updateConfigField('credentialId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="">[ Select Discord Credential ]</option>
            {credentials.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.maskedValue})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Server Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Server (Guild)
        </label>
        <div className="space-y-1.5">
          <select
            value={guildId === 'all' || !guildId ? 'all' : 'specific'}
            onChange={(e) => {
              const mode = e.target.value;
              const nextVal = mode === 'all' ? 'all' : '';
              setGuildId(nextVal);
              updateConfigField('guildId', nextVal);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Servers accessible to bot</option>
            <option value="specific">Select Specific Server...</option>
          </select>

          {guildId !== 'all' && (
            <DiscordServerDropdown
              credentialId={credentialId}
              value={guildId}
              onChange={(val) => {
                setGuildId(val);
                updateConfigField('guildId', val);
              }}
              placeholder="Search / Select Guild..."
            />
          )}
        </div>
      </div>

      {/* 3. Channel Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Channel
        </label>
        <div className="space-y-1.5">
          <select
            value={channelId === 'all' || !channelId ? 'all' : 'specific'}
            onChange={(e) => {
              const mode = e.target.value;
              const nextVal = mode === 'all' ? 'all' : '';
              setChannelId(nextVal);
              updateConfigField('channelId', nextVal);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="specific">Select Specific Channel...</option>
          </select>

          {channelId !== 'all' && (
            <DiscordChannelDropdown
              credentialId={credentialId}
              guildId={guildId !== 'all' ? guildId : ''}
              value={channelId}
              onChange={(val) => {
                setChannelId(val);
                updateConfigField('channelId', val);
              }}
              placeholder="Search / Select Channel..."
            />
          )}
        </div>
      </div>

      {/* 4. Response Mode Section */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <label className="block text-xs font-semibold text-slate-300">
          Response Mode
        </label>
        <p className="text-[10px] text-slate-400 leading-tight">
          Choose whether the bot replies to every message or only when it is mentioned.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setResponseMode('all');
              setOnlyBotMentioned(false);
              updateConfigField('responseMode', 'all');
            }}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              responseMode === 'all'
                ? 'bg-indigo-500/10 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-xs">All Messages</span>
              {responseMode === 'all' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Reply to every user message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setResponseMode('mention');
              setOnlyBotMentioned(true);
              updateConfigField('responseMode', 'mention');
            }}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              responseMode === 'mention'
                ? 'bg-indigo-500/10 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-xs">Only When Mentioned</span>
              {responseMode === 'mention' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Only reply when @bot mentioned</span>
          </button>
        </div>
      </div>

      {/* 5. Options & Filtering Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
          <input
            type="checkbox"
            id="ignoreBotMessages"
            checked={ignoreBotMessages}
            onChange={(e) => {
              const checked = e.target.checked;
              setIgnoreBotMessages(checked);
              updateConfigField('ignoreBotMessages', checked);
            }}
            className="w-3.5 h-3.5 text-indigo-500 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="ignoreBotMessages" className="text-xs text-slate-300 font-medium cursor-pointer flex-1">
            Ignore Bot Messages <span className="text-[10px] text-emerald-400 font-mono">(Prevents Infinite Loops)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DiscordMessageReceivedProperties;
