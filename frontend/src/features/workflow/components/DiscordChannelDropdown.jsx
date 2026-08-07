import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, Search, ChevronDown, Hash, AlertCircle, Check, Megaphone, MessageSquare } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const DiscordChannelDropdown = ({
  credentialId,
  guildId,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a Discord Channel...',
}) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Automatically fetch channels when guildId or credentialId changes
  useEffect(() => {
    if (credentialId && guildId) {
      fetchChannels(false);
    } else {
      setChannels([]);
      setError('');
      setWarningMessage('');
    }
  }, [credentialId, guildId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchChannels = async (forceRefresh = false) => {
    if (!credentialId || !guildId) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    setWarningMessage('');

    try {
      const res = await api.get(`/discord/channels`, {
        params: {
          credentialId,
          guildId,
          refresh: forceRefresh,
        },
      });

      if (res.data.success) {
        const fetchedChannels = res.data.channels || [];
        setChannels(fetchedChannels);

        // Validation check: if a value was selected but no longer exists in fetched list
        if (value && fetchedChannels.length > 0) {
          const exists = fetchedChannels.some((c) => c.id === value);
          if (!exists) {
            onChange(''); // Clear selection
            setWarningMessage('Selected channel no longer exists.');
            toast.error('Selected channel no longer exists in this server.');
          }
        }

        if (forceRefresh) {
          toast.success(`Refreshed! Loaded ${fetchedChannels.length} supported channel(s)`);
        }
      } else {
        setError(res.data.message || 'Failed to load channels');
      }
    } catch (err) {
      const statusCode = err.response?.status;
      let msg = err.response?.data?.message || 'Failed to fetch channels from Discord API';

      if (statusCode === 401) {
        msg = '401 Unauthorized: Invalid Bot Token provided.';
      } else if (statusCode === 403) {
        msg = '403 Forbidden: Bot lacks permission to view channels in this server.';
      } else if (statusCode === 404) {
        msg = '404 Guild Not Found: Selected Discord server could not be located.';
      } else if (statusCode === 429) {
        msg = '429 Rate Limited: Discord API rate limit hit. Please retry shortly.';
      }

      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectedChannel = channels.find((c) => c.id === value);

  const filteredChannels = channels.filter((c) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChannelIcon = (type) => {
    switch (type) {
      case 'GUILD_ANNOUNCEMENT':
        return <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'GUILD_FORUM':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'GUILD_TEXT':
      default:
        return <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
  };

  const renderBadge = (type) => {
    switch (type) {
      case 'GUILD_ANNOUNCEMENT':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ANNOUNCEMENT
          </span>
        );
      case 'GUILD_FORUM':
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            FORUM
          </span>
        );
      case 'GUILD_TEXT':
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            TEXT
          </span>
        );
    }
  };

  return (
    <div className="space-y-1 select-none font-sans" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Channel
        </label>
        {credentialId && guildId && (
          <button
            type="button"
            onClick={() => fetchChannels(true)}
            disabled={loading || refreshing || disabled}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Reload channels"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!credentialId || !guildId ? (
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
          {!credentialId
            ? 'Select a valid Discord Credential first.'
            : 'Select a Discord Server (Guild) above to load channels.'}
        </div>
      ) : (
        <div className="relative">
          {/* Main Dropdown Button */}
          <button
            type="button"
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 flex items-center justify-between transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 truncate">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading channels...</span>
                </div>
              ) : selectedChannel ? (
                <>
                  {renderChannelIcon(selectedChannel.type)}
                  <span className="font-semibold text-white truncate">#{selectedChannel.name}</span>
                  {renderBadge(selectedChannel.type)}
                </>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Warning Message */}
          {warningMessage && (
            <div className="mt-1.5 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-1.5 p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Searchable Dropdown Overlay */}
          {isOpen && (
            <div className="absolute z-50 mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-800 bg-slate-950/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Channel Items List */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                {filteredChannels.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    {searchQuery ? 'No matching channels found' : 'No supported channels found in this server.'}
                  </div>
                ) : (
                  filteredChannels.map((channel) => {
                    const isSelected = channel.id === value;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          onChange(channel.id);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/15 transition-colors ${
                          isSelected ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {renderChannelIcon(channel.type)}
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-white font-medium">#{channel.name}</span>
                              {renderBadge(channel.type)}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">ID: {channel.id}</div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscordChannelDropdown;
