import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, Search, ChevronDown, Folder, AlertCircle, Check } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const DiscordCategoryDropdown = ({
  credentialId,
  guildId,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select Category (Optional)...',
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (credentialId && guildId) {
      fetchCategories(false);
    } else {
      setCategories([]);
      setError('');
    }
  }, [credentialId, guildId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async (forceRefresh = false) => {
    if (!credentialId || !guildId) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await api.get(`/discord/channels`, {
        params: {
          credentialId,
          guildId,
          refresh: forceRefresh,
        },
      });

      if (res.data.success) {
        const rawChannels = res.data.channels || [];
        // Filter only categories (type === 4 or type === 'GUILD_CATEGORY')
        const filteredCats = rawChannels.filter(
          (c) => c.type === 4 || c.type === 'GUILD_CATEGORY' || c.typeId === 4
        );
        setCategories(filteredCats);

        if (forceRefresh) {
          toast.success(`Refreshed! Found ${filteredCats.length} category/categories`);
        }
      } else {
        setError(res.data.message || 'Failed to load categories');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch categories from Discord API';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

  const filteredCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-1 select-none font-sans" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Category (Optional)
        </label>
        {credentialId && guildId && (
          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={loading || refreshing || disabled}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Categories</span>
          </button>
        )}
      </div>

      {!credentialId || !guildId ? (
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
          Select Credential and Server first to load categories.
        </div>
      ) : (
        <div className="relative">
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
                  <span>Loading categories...</span>
                </div>
              ) : selectedCategory ? (
                <>
                  <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white truncate">📁 {selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {error && (
            <div className="mt-1.5 p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {isOpen && (
            <div className="absolute z-50 mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
              <div className="p-2 border-b border-slate-800 bg-slate-950/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                {/* None / No Category Option */}
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/15 transition-colors ${
                    !value ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span>(No Category - Root Level)</span>
                  {!value && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>

                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    {searchQuery ? 'No matching categories' : 'No Category channels found in this server.'}
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = cat.id === value;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onChange(cat.id);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/15 transition-colors ${
                          isSelected ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-white font-medium truncate">📁 {cat.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">ID: {cat.id}</div>
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

export default DiscordCategoryDropdown;
