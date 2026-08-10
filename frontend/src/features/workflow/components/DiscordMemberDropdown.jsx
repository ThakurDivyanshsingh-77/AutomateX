import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, Search, ChevronDown, User, AlertCircle, Check, Bot } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const DiscordMemberDropdown = ({
  credentialId,
  guildId,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a Discord Server Member...',
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Automatically fetch members when guildId or credentialId changes
  useEffect(() => {
    if (credentialId && guildId) {
      fetchMembers(false);
    } else {
      setMembers([]);
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

  const fetchMembers = async (forceRefresh = false) => {
    if (!credentialId || !guildId) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    setWarningMessage('');

    try {
      const res = await api.get(`/discord/members`, {
        params: {
          credentialId,
          guildId,
          limit: 1000,
          refresh: forceRefresh,
        },
      });

      if (res.data.success) {
        const fetchedMembers = res.data.members || [];
        setMembers(fetchedMembers);

        // Validation check: if a value was selected but no longer exists in fetched list
        if (value && fetchedMembers.length > 0) {
          const exists = fetchedMembers.some((m) => m.id === value || m.userId === value);
          if (!exists) {
            setWarningMessage('Selected member no longer exists or left the server.');
          }
        }

        if (forceRefresh) {
          toast.success(`Refreshed! Loaded ${fetchedMembers.length} member(s)`);
        }
      } else {
        setError(res.data.message || 'Failed to load members');
      }
    } catch (err) {
      const statusCode = err.response?.status;
      let msg = err.response?.data?.message || 'Failed to fetch members from Discord API';

      if (statusCode === 401) {
        msg = '401 Unauthorized: Invalid Bot Token provided.';
      } else if (statusCode === 403) {
        msg = '403 Forbidden: Bot lacks permission to view server members (check Server Members Intent).';
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

  const selectedMember = members.find((m) => m.id === value || m.userId === value);

  const filteredMembers = members.filter((m) =>
    (m.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.id || '').includes(searchQuery)
  );

  return (
    <div className="space-y-1 select-none font-sans" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Discord Member / User
        </label>
        {credentialId && guildId && (
          <button
            type="button"
            onClick={() => fetchMembers(true)}
            disabled={loading || refreshing || disabled}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
            title="Reload members"
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
            : 'Select a Discord Server (Guild) above to load members.'}
        </div>
      ) : (
        <div className="relative">
          {/* Main Dropdown Button */}
          <button
            type="button"
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 flex items-center justify-between transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading members...</span>
                </div>
              ) : selectedMember ? (
                <>
                  {selectedMember.avatarUrl ? (
                    <img
                      src={selectedMember.avatarUrl}
                      alt={selectedMember.displayName}
                      className="w-4 h-4 rounded-full shrink-0 object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span className="font-semibold text-white truncate">
                    {selectedMember.displayName}
                  </span>
                  {selectedMember.username && (
                    <span className="text-slate-400 font-mono text-[11px] truncate">
                      (@{selectedMember.username})
                    </span>
                  )}
                  {selectedMember.isBot && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      BOT
                    </span>
                  )}
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
                    placeholder="Search member by username, nickname, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Members Items List */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                {filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    {searchQuery ? 'No matching members found' : 'No members found in this server.'}
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = member.id === value || member.userId === value;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          onChange(member.id);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/15 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.displayName}
                              className="w-5 h-5 rounded-full shrink-0 object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
                              {member.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-white font-medium">{member.displayName}</span>
                              {member.username && (
                                <span className="text-slate-400 text-[11px] font-mono">
                                  (@{member.username})
                                </span>
                              )}
                              {member.isBot && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-0.5">
                                  <Bot className="w-2.5 h-2.5 text-indigo-400" />
                                  <span>BOT</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">ID: {member.id}</div>
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

export default DiscordMemberDropdown;
