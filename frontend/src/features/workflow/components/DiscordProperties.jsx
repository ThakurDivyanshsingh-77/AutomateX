import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordChannelDropdown } from './DiscordChannelDropdown';
import { Input } from '../../../components/ui/Input';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Send, Loader2, Bot, ShieldCheck, ExternalLink, Code2, MessageSquare, AlertCircle } from 'lucide-react';

export const DiscordProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [channelId, setChannelId] = useState(config.channelId || '');
  const [content, setContent] = useState(config.content || config.message || '');
  const [embeds, setEmbeds] = useState(
    typeof config.embeds === 'object' ? JSON.stringify(config.embeds, null, 2) : config.embeds || ''
  );
  const [tts, setTts] = useState(Boolean(config.tts));
  const [replyToMessageId, setReplyToMessageId] = useState(config.replyToMessageId || '');
  const [suppressEmbeds, setSuppressEmbeds] = useState(Boolean(config.suppressEmbeds));
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      // Auto-select first credential if none selected
      if (!credentialId && discordCreds.length > 0) {
        const firstId = discordCreds[0]._id;
        setCredentialId(firstId);
        updateField('credentialId', firstId);
      }
    } catch (err) {
      console.warn('[DiscordProperties] ⚠️ Failed to load credentials inline:', err);
      const msg = err.response?.data?.message || 'Failed to load Discord credentials';
      setCredError(msg);
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateField = (field, val) => {
    const updated = {
      ...config,
      credentialId,
      guildId,
      channelId,
      content,
      embeds,
      tts,
      replyToMessageId,
      suppressEmbeds,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestSendMessage = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!guildId) return toast.error('Please select a Discord Server (Guild)');
    if (!channelId) return toast.error('Please select a Discord Channel');
    if (!content && !embeds) return toast.error('Please enter message content or embed payload');

    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/discord/send-message', {
        credentialId,
        guildId,
        channelId,
        content,
        embeds,
        tts,
        replyToMessageId,
        suppressEmbeds,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Message Sent Successfully! ID: ${res.data.messageId}`);
      } else {
        toast.error(res.data.message || 'Failed to send message');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send Discord message';
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
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white text-xs">Discord → Send Message</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          REST API v10
        </span>
      </div>

      {/* Inline Credential Fetch Error Alert */}
      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. Credential Picker */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Credential (Bot Token)
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
              setChannelId('');
              updateField('credentialId', val);
              updateField('guildId', '');
              updateField('channelId', '');
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
          setChannelId('');
          updateField('guildId', selectedGuildId);
          updateField('channelId', '');
        }}
      />

      {/* 3. Channel Dropdown */}
      <DiscordChannelDropdown
        credentialId={credentialId}
        guildId={guildId}
        value={channelId}
        onChange={(selectedChannelId) => {
          setChannelId(selectedChannelId);
          updateField('channelId', selectedChannelId);
        }}
      />

      {/* 4. Message Content Textarea */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Message Content
          </label>
          <span className="text-[10px] text-slate-400">
            {content.length}/2000 chars
          </span>
        </div>
        <textarea
          rows={4}
          placeholder="Type message content (supports Markdown, **bold**, @mentions, {{variables}})..."
          value={content}
          onChange={(e) => {
            const val = e.target.value;
            setContent(val);
            updateField('content', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* Advanced Optional Settings Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Embeds, TTS, Reply)'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            {/* Embeds JSON Payload */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Embeds JSON (Optional)
              </label>
              <textarea
                rows={4}
                placeholder={'[\n  {\n    "title": "AutomateX Alert",\n    "description": "Workflow executed successfully!",\n    "color": 5814783\n  }\n]'}
                value={embeds}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmbeds(val);
                  updateField('embeds', val);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Reply To Message ID */}
            <Input
              label="Reply To Message ID (Optional)"
              placeholder="e.g. 123456789012345678"
              value={replyToMessageId}
              onChange={(e) => {
                const val = e.target.value;
                setReplyToMessageId(val);
                updateField('replyToMessageId', val);
              }}
            />

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tts}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setTts(val);
                    updateField('tts', val);
                  }}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Text-To-Speech (TTS Message)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suppressEmbeds}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setSuppressEmbeds(val);
                    updateField('suppressEmbeds', val);
                  }}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Suppress Embeds (Hide link previews)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Test Send Message Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestSendMessage}
          disabled={testing || !credentialId || !guildId || !channelId || (!content && !embeds)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Message to Discord...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Test Message</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
            <span>Message Sent Successfully!</span>
            <a
              href={testResult.messageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
            >
              <span>View in Discord</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Message ID: <strong className="text-white">{testResult.messageId}</strong></div>
            <div>Channel ID: <strong className="text-slate-400">{testResult.channelId}</strong></div>
            <div>Timestamp: <strong className="text-slate-400">{testResult.timestamp}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordProperties;
