import React, { useState, useEffect } from 'react';
import { DiscordServerDropdown } from './DiscordServerDropdown';
import { DiscordChannelDropdown } from './DiscordChannelDropdown';
import { DiscordEmbedPreview } from './DiscordEmbedPreview';
import { Input } from '../../../components/ui/Input';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  Send,
  Loader2,
  Layout,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Palette,
  User,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';

export const DiscordEmbedProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [guildId, setGuildId] = useState(config.guildId || '');
  const [channelId, setChannelId] = useState(config.channelId || '');

  // Embed Fields State
  const [title, setTitle] = useState(config.title || 'AutomateX Notification');
  const [description, setDescription] = useState(config.description || 'Workflow step executed successfully!');
  const [color, setColor] = useState(config.color || '#5865F2');
  const [url, setUrl] = useState(config.url || '');
  const [authorName, setAuthorName] = useState(config.authorName || '');
  const [authorUrl, setAuthorUrl] = useState(config.authorUrl || '');
  const [authorIconUrl, setAuthorIconUrl] = useState(config.authorIconUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(config.thumbnailUrl || '');
  const [imageUrl, setImageUrl] = useState(config.imageUrl || '');
  const [footerText, setFooterText] = useState(config.footerText || 'AutomateX Workflow Engine');
  const [footerIconUrl, setFooterIconUrl] = useState(config.footerIconUrl || '');
  const [timestamp, setTimestamp] = useState(config.timestamp !== undefined ? Boolean(config.timestamp) : true);
  const [fields, setFields] = useState(Array.isArray(config.fields) ? config.fields : []);

  // Accordion Section States
  const [showAuthor, setShowAuthor] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Fetch Credentials on Mount
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
      console.warn('[DiscordEmbedProperties] ⚠️ Failed to load credentials inline:', err);
      const msg = err.response?.data?.message || 'Failed to load Discord credentials';
      setCredError(msg);
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    const updated = {
      ...config,
      credentialId,
      guildId,
      channelId,
      title,
      description,
      color,
      url,
      authorName,
      authorUrl,
      authorIconUrl,
      thumbnailUrl,
      imageUrl,
      footerText,
      footerIconUrl,
      timestamp,
      fields,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  // Add Field
  const handleAddField = () => {
    if (fields.length >= 25) {
      return toast.error('Maximum limit of 25 fields reached.');
    }
    const newField = { name: `Field #${fields.length + 1}`, value: 'Sample value', inline: true };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    updateConfigField('fields', updatedFields);
  };

  // Update Field Item
  const handleUpdateField = (index, key, val) => {
    const updatedFields = fields.map((f, i) => (i === index ? { ...f, [key]: val } : f));
    setFields(updatedFields);
    updateConfigField('fields', updatedFields);
  };

  // Remove Field Item
  const handleRemoveField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    updateConfigField('fields', updatedFields);
  };

  // Send Test Embed Action
  const handleTestSendEmbed = async () => {
    if (!credentialId) return toast.error('Please select a Discord Credential');
    if (!guildId) return toast.error('Please select a Discord Server (Guild)');
    if (!channelId) return toast.error('Please select a Discord Channel');

    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/discord/send-embed', {
        credentialId,
        guildId,
        channelId,
        title,
        description,
        color,
        url,
        authorName,
        authorUrl,
        authorIconUrl,
        thumbnailUrl,
        imageUrl,
        footerText,
        footerIconUrl,
        timestamp,
        fields,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Embed Sent Successfully! ID: ${res.data.messageId}`);
      } else {
        toast.error(res.data.message || 'Failed to send embed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send Discord embed';
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
          <Layout className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white text-xs">Discord → Send Embed</span>
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
              updateConfigField('credentialId', val);
              updateConfigField('guildId', '');
              updateConfigField('channelId', '');
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
          updateConfigField('guildId', selectedGuildId);
          updateConfigField('channelId', '');
        }}
      />

      {/* 3. Channel Dropdown */}
      <DiscordChannelDropdown
        credentialId={credentialId}
        guildId={guildId}
        value={channelId}
        onChange={(selectedChannelId) => {
          setChannelId(selectedChannelId);
          updateConfigField('channelId', selectedChannelId);
        }}
      />

      {/* 4. Embed Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">Embed Title</label>
          <span className="text-[10px] text-slate-500">{title.length}/256</span>
        </div>
        <input
          type="text"
          placeholder="e.g. Workflow Executed Successfully"
          value={title}
          maxLength={256}
          onChange={(e) => {
            const val = e.target.value;
            setTitle(val);
            updateConfigField('title', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* 5. Embed Description */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">Embed Description (Multiline)</label>
          <span className="text-[10px] text-slate-500">{description.length}/4096</span>
        </div>
        <textarea
          rows={3}
          placeholder="Enter rich markdown description, **bold**, code blocks, @mentions, {{variables}}..."
          value={description}
          maxLength={4096}
          onChange={(e) => {
            const val = e.target.value;
            setDescription(val);
            updateConfigField('description', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* 6. Color Picker & Hex Code */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">Embed Accent Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color.startsWith('#') ? color : `#${color}`}
            onChange={(e) => {
              const val = e.target.value;
              setColor(val);
              updateConfigField('color', val);
            }}
            className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
          />
          <div className="relative flex-1">
            <Palette className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="#5865F2"
              value={color}
              onChange={(e) => {
                const val = e.target.value;
                setColor(val);
                updateConfigField('color', val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 7. Embed Title URL */}
      <Input
        label="Embed Title URL (Optional Link)"
        placeholder="https://yourwebsite.com/details"
        value={url}
        onChange={(e) => {
          const val = e.target.value;
          setUrl(val);
          updateConfigField('url', val);
        }}
      />

      {/* Collapsible Accordion 1: Author Metadata */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => setShowAuthor(!showAuthor)}
          className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Author Details (Optional)</span>
          </div>
          {showAuthor ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showAuthor && (
          <div className="p-3 border-t border-slate-800/60 space-y-2 bg-slate-950">
            <Input
              label="Author Name"
              placeholder="e.g. AutomateX Deployment Bot"
              value={authorName}
              onChange={(e) => {
                const val = e.target.value;
                setAuthorName(val);
                updateConfigField('authorName', val);
              }}
            />
            <Input
              label="Author URL (Clickable Name Link)"
              placeholder="https://automatex.dev"
              value={authorUrl}
              onChange={(e) => {
                const val = e.target.value;
                setAuthorUrl(val);
                updateConfigField('authorUrl', val);
              }}
            />
            <Input
              label="Author Icon URL"
              placeholder="https://cdn.discordapp.com/icons/sample.png"
              value={authorIconUrl}
              onChange={(e) => {
                const val = e.target.value;
                setAuthorIconUrl(val);
                updateConfigField('authorIconUrl', val);
              }}
            />
          </div>
        )}
      </div>

      {/* Collapsible Accordion 2: Media Images */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => setShowMedia(!showMedia)}
          className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Media Images (Thumbnail & Hero Image)</span>
          </div>
          {showMedia ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showMedia && (
          <div className="p-3 border-t border-slate-800/60 space-y-2 bg-slate-950">
            <Input
              label="Thumbnail URL (Top Right Small Image)"
              placeholder="https://cdn.discordapp.com/attachments/logo.png"
              value={thumbnailUrl}
              onChange={(e) => {
                const val = e.target.value;
                setThumbnailUrl(val);
                updateConfigField('thumbnailUrl', val);
              }}
            />
            <Input
              label="Hero Image URL (Large Main Image)"
              placeholder="https://cdn.discordapp.com/attachments/banner.png"
              value={imageUrl}
              onChange={(e) => {
                const val = e.target.value;
                setImageUrl(val);
                updateConfigField('imageUrl', val);
              }}
            />
          </div>
        )}
      </div>

      {/* Collapsible Accordion 3: Footer & Timestamp */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
        <button
          type="button"
          onClick={() => setShowFooter(!showFooter)}
          className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Footer & Timestamp</span>
          </div>
          {showFooter ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showFooter && (
          <div className="p-3 border-t border-slate-800/60 space-y-2 bg-slate-950">
            <Input
              label="Footer Text"
              placeholder="e.g. AutomateX Workflow Engine • Version 1.0"
              value={footerText}
              onChange={(e) => {
                const val = e.target.value;
                setFooterText(val);
                updateConfigField('footerText', val);
              }}
            />
            <Input
              label="Footer Icon URL"
              placeholder="https://cdn.discordapp.com/icons/footer.png"
              value={footerIconUrl}
              onChange={(e) => {
                const val = e.target.value;
                setFooterIconUrl(val);
                updateConfigField('footerIconUrl', val);
              }}
            />
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={timestamp}
                onChange={(e) => {
                  const val = e.target.checked;
                  setTimestamp(val);
                  updateConfigField('timestamp', val);
                }}
                className="rounded border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Include ISO Timestamp in Embed</span>
            </label>
          </div>
        )}
      </div>

      {/* Dynamic Embed Fields Section */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-white">Embed Fields ({fields.length}/25)</span>
          </div>
          <button
            type="button"
            onClick={handleAddField}
            disabled={fields.length >= 25}
            className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            <span>Add Field</span>
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-lg text-center text-slate-500 text-[11px] italic">
            No fields added yet. Click "Add Field" to add custom name/value pairs.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400">Field #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40 transition-colors"
                    title="Remove field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Field Name (max 256)"
                    value={field.name}
                    onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer justify-end pr-1">
                    <input
                      type="checkbox"
                      checked={Boolean(field.inline)}
                      onChange={(e) => handleUpdateField(idx, 'inline', e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Inline Grid</span>
                  </label>
                </div>

                <textarea
                  rows={2}
                  placeholder="Field Value (max 1024)"
                  value={field.value}
                  onChange={(e) => handleUpdateField(idx, 'value', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Embed Preview */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors mb-2"
        >
          <span>{showPreview ? 'Hide Live Embed Preview' : 'Show Live Embed Preview'}</span>
        </button>

        {showPreview && (
          <DiscordEmbedPreview
            embed={{
              title,
              description,
              color,
              url,
              authorName,
              authorUrl,
              authorIconUrl,
              thumbnailUrl,
              imageUrl,
              footerText,
              footerIconUrl,
              timestamp,
              fields,
            }}
          />
        )}
      </div>

      {/* Send Test Embed Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestSendEmbed}
          disabled={testing || !credentialId || !guildId || !channelId}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Embed to Discord...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Test Embed Message</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
            <span>Embed Message Sent Successfully!</span>
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

export default DiscordEmbedProperties;
