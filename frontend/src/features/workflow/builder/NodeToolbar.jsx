import React, { useState } from 'react';
import { NODE_REGISTRY } from '../nodes/registry/nodeRegistry';
import { GripVertical, Layers, Search } from 'lucide-react';

export const NodeToolbar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Deduplicate node definitions by id/type
  const uniqueNodesMap = new Map();
  Object.values(NODE_REGISTRY).forEach((node) => {
    if (node && node.type && !uniqueNodesMap.has(node.type)) {
      uniqueNodesMap.set(node.type, node);
    }
  });
  const allNodes = Array.from(uniqueNodesMap.values());

  const searchLower = searchTerm.toLowerCase().trim();

  // Filter nodes based on search term
  const filteredNodes = allNodes.filter((node) => {
    if (!searchLower) return true;
    const labelMatch = (node.label || '').toLowerCase().includes(searchLower);
    const descMatch = (node.description || '').toLowerCase().includes(searchLower);
    const catMatch = (node.category || '').toLowerCase().includes(searchLower);
    const provMatch = (node.provider || '').toLowerCase().includes(searchLower);
    const typeMatch = (node.type || '').toLowerCase().includes(searchLower);
    const kwMatch = Array.isArray(node.searchKeywords) && node.searchKeywords.some((k) => (k || '').toLowerCase().includes(searchLower));
    return labelMatch || descMatch || catMatch || provMatch || typeMatch || kwMatch;
  });

  // Group filtered nodes by category
  const baseCategories = ['Triggers', 'Communication', 'Database', 'Logic', 'Action', 'Utility', 'Output', 'Google'];
  const extraCategories = Array.from(new Set(filteredNodes.map((n) => n.category))).filter((c) => c && !baseCategories.includes(c));
  const categories = [...baseCategories, ...extraCategories];

  const groupedNodes = categories.reduce((acc, cat) => {
    acc[cat] = filteredNodes.filter((n) => {
      if (n.category === cat) return true;
      if (cat === 'Triggers' && (n.category === 'Trigger' || (n.type && n.type.toLowerCase().includes('trigger')))) return true;
      if (cat === 'Communication' && (n.provider === 'Discord' || n.category === 'Discord')) return true;
      return false;
    });
    return acc;
  }, {});


  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Node Palette
          </h3>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes (e.g. http, delay)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Nodes List grouped by Category */}
      <div className="p-3 overflow-y-auto space-y-4 flex-1">
        {filteredNodes.length === 0 ? (
          <p className="text-[11px] text-slate-500 font-mono text-center py-6">
            No node matching "{searchTerm}"
          </p>
        ) : (
          categories.map((cat) => {
            const catNodes = groupedNodes[cat];
            if (!catNodes || catNodes.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                  {cat}
                </h4>
                <div className="space-y-2">
                  {catNodes.map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        className="group p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 cursor-grab active:cursor-grabbing transition-all duration-150 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg border ${node.badgeColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                              {node.label}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {node.description}
                            </p>
                          </div>
                        </div>

                        <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
        💡 Drag node onto canvas or select node to edit config.
      </div>
    </aside>
  );
};
