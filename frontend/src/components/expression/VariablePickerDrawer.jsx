import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Star,
  Clock,
  Zap,
  Terminal,
  Code,
  Sparkles,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { VariableEngine } from '../../engine/variable/VariableEngine';
import { JSONTreeExplorer } from './JSONTreeExplorer';
import { VariablePreviewModal } from './VariablePreviewModal';

export const VariablePickerDrawer = ({
  isOpen,
  onClose,
  onInsert,
  workflowNodes = [],
  executionSnapshot = null,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // all | favorites | recents | nodes | system | functions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState(null);
  const [favorites, setFavorites] = useState(() => VariableEngine.getFavorites());

  // Discover and build structured variables
  const data = useMemo(() => {
    return VariableEngine.list(workflowNodes, executionSnapshot);
  }, [workflowNodes, executionSnapshot]);

  // Handle starring/unstarring favorites
  const handleToggleFavorite = (path) => {
    const updated = VariableEngine.toggleFavorite(path);
    setFavorites(updated);
  };

  // Filter based on active tab and search query
  const filteredNodes = useMemo(() => {
    let nodesList = data.nodes;

    if (searchQuery.trim()) {
      nodesList = VariableEngine.search(searchQuery, nodesList);
    }

    if (activeTab === 'favorites') {
      return nodesList.map((n) => ({
        ...n,
        outputs: VariableEngine.filterTreeNodes(n.outputs, (item) => favorites.includes(item.path)),
      })).filter((n) => n.outputs.length > 0);
    }

    return nodesList;
  }, [data.nodes, searchQuery, activeTab, favorites]);

  if (!isOpen) return null;

  return (
    <>
      {/* Drawer Overlay Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Right Side Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-slideLeft select-none">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Variables & Data Explorer</h3>
              <span className="text-[10px] text-slate-400">Browse & insert dynamic variables</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search variables (temp, email, id, user)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Category Tabs Header */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-900/50 overflow-x-auto text-[11px] font-medium no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3 h-3" /> All
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star className="w-3 h-3 fill-current" /> Starred ({favorites.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recents')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'recents'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3 h-3" /> Recents
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3 h-3" /> System
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('functions')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'functions'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3 h-3" /> Functions
          </button>
        </div>

        {/* Drawer Body - Variable Tree & Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Recents View */}
          {activeTab === 'recents' && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Recently Inserted Variables
              </h4>
              {data.recents.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No recent variables yet.</p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {data.recents.map((path) => (
                    <div
                      key={path}
                      onClick={() => {
                        onInsert(`{{${path}}}`);
                        VariableEngine.addRecent(path);
                      }}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between cursor-pointer text-purple-300 hover:text-white"
                    >
                      <span>{`{{${path}}}`}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Variables View */}
          {activeTab === 'system' && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                System & Environment Variables
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {data.system.map((sysItem) => (
                  <div
                    key={sysItem.path}
                    onClick={() => {
                      onInsert(`{{${sysItem.path}}}`);
                      VariableEngine.addRecent(sysItem.path);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-400">{`{{${sysItem.path}}}`}</span>
                      <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        {sysItem.type}
                      </span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400">{sysItem.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transformation Functions View */}
          {activeTab === 'functions' && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Transformation Functions Library
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {data.functions.map((fn) => (
                  <div
                    key={fn.name}
                    onClick={() => {
                      onInsert(`{{${fn.syntax}}}`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">{`{{${fn.syntax}}}`}</span>
                      <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        {fn.category}
                      </span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-400">{fn.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Node Execution Output Trees (Default & Favorites View) */}
          {(activeTab === 'all' || activeTab === 'favorites') && (
            <div className="space-y-4">
              {filteredNodes.map((node) => (
                <div key={node.id} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  {/* Node Header */}
                  <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{node.nodeName}</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {node.nodeType}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {node.status}
                    </span>
                  </div>

                  {/* Node JSON Tree */}
                  <div className="p-2">
                    <JSONTreeExplorer
                      data={node.outputs}
                      onInsert={(expr) => {
                        onInsert(expr);
                        const cleanPath = expr.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '');
                        VariableEngine.addRecent(cleanPath);
                      }}
                      onPreview={setSelectedPreviewItem}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Variable Detail Inspector Modal */}
      <VariablePreviewModal
        isOpen={Boolean(selectedPreviewItem)}
        onClose={() => setSelectedPreviewItem(null)}
        variableItem={selectedPreviewItem}
        onInsert={(expr) => {
          onInsert(expr);
          setSelectedPreviewItem(null);
        }}
      />
    </>
  );
};
