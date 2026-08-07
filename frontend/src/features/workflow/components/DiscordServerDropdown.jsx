import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, Search, ChevronDown, Server, AlertCircle, Check } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const DiscordServerDropdown = ({
  credentialId,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a Discord Server (Guild)...',
}) => {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (credentialId) {
      fetchGuilds(false);
    } else {
      setGuilds([]);
      setError('');
    }
  }, [credentialId]);

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

  const fetchGuilds = async (forceRefresh = false) => {
    if (!credentialId) return;
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await api.get(`/discord/guilds`, {
        params: {
          credentialId,
          refresh: forceRefresh,
        },
      });

      if (res.data.success) {
        const fetchedGuilds = res.data.guilds || [];
        setGuilds(fetchedGuilds);
        if (forceRefresh) {
          toast.success(`Refreshed! Found ${fetchedGuilds.length} server(s)`);
        }
      } else {
        setError(res.data.message || 'Failed to load servers');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect to Discord API';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectedGuild = guilds.find((g) => g.id === value || g.value === value);

  const filteredGuilds = guilds.filter((g) =>
    (g.name || g.label || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-1 select-none font-sans" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Server (Guild)
        </label>
        {credentialId && (
          <button
            type="button"
            onClick={() => fetchGuilds(true)}
            disabled={loading || refreshing || disabled}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Refresh server list"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!credentialId ? (
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
          Select a valid Discord Credential above to load available servers.
        </div>
      ) : (
        <div className="relative">
          {/* Main Dropdown Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 flex items-center justify-between transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <div className="flex items-center gap-2 truncate">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading servers...</span>
                </div>
              ) : selectedGuild ? (
                <>
                  {selectedGuild.iconUrl || selectedGuild.icon ? (
                    <img
                      src={selectedGuild.iconUrl || selectedGuild.icon}
                      alt={selectedGuild.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Server className="w-3 h-3" />
                    </div>
                  )}
                  <span className="font-semibold text-white truncate">{selectedGuild.name || selectedGuild.label}</span>
                </>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Error Banner */}
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
                    placeholder="Search servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Server Items List */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                {filteredGuilds.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    {searchQuery ? 'No matching servers found' : 'No Discord servers found for this bot.'}
                  </div>
                ) : (
                  filteredGuilds.map((guild) => {
                    const isSelected = guild.id === value || guild.value === value;
                    return (
                      <button
                        key={guild.id || guild.value}
                        type="button"
                        onClick={() => {
                          onChange(guild.id || guild.value);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/15 transition-colors ${
                          isSelected ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {guild.iconUrl || guild.icon ? (
                            <img
                              src={guild.iconUrl || guild.icon}
                              alt={guild.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 font-bold border border-slate-700">
                              <Server className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="truncate">
                            <div className="truncate text-white">{guild.name || guild.label}</div>
                            <div className="text-[10px] font-mono text-slate-500">ID: {guild.id || guild.value}</div>
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

export default DiscordServerDropdown;
