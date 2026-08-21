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
  const baseCategories = [
    'TRIGGER',
    'INTEGRATIONS',
    'AI / DOCUMENT PROCESSING',
    'CONTROL / FLOW',
    'COMMUNICATION',
    'DATABASE',
    'LOGIC',
    'ACTION',
    'UTILITY',
    'OUTPUT',
    'GOOGLE',
  ];
  const extraCategories = Array.from(
    new Set(filteredNodes.map((n) => (n.category || '').toUpperCase()))
  ).filter((c) => c && !baseCategories.includes(c));

  const categories = [...baseCategories, ...extraCategories];

  const groupedNodes = categories.reduce((acc, cat) => {
    acc[cat] = filteredNodes.filter((n) => {
      const nCat = (n.category || '').toUpperCase();
      if (nCat === cat) return true;
      if (
        cat === 'TRIGGER' &&
        (nCat.includes('TRIGGER') ||
          (n.type &&
            (n.type.toLowerCase().includes('trigger') ||
              n.type.toLowerCase().includes('messagereceived'))))
      )
        return true;
      if (
        cat === 'INTEGRATIONS' &&
        (nCat.includes('INTEGRATION') ||
          nCat.includes('WEBSITE') ||
          n.type === 'websiteConnect' ||
          n.type === 'websiteCreateProduct' ||
          n.type === 'websiteCreateTournament' ||
          (n.type && n.type.toLowerCase().includes('website')))
      )
        return true;
      if (
        cat === 'AI / DOCUMENT PROCESSING' &&
        (nCat.includes('DOCUMENT') ||
          nCat.includes('AI') ||
          n.type === 'geminiStructureProducts' ||
          n.type === 'geminiStructureTournament' ||
          n.type === 'documentExtractContent')
      )
        return true;
      if (
        cat === 'CONTROL / FLOW' &&
        (nCat.includes('CONTROL') ||
          nCat.includes('FLOW') ||
          nCat.includes('LOOP') ||
          n.type === 'forEachProduct' ||
          n.type === 'forEachTournament')
      )
        return true;
      if (
        cat === 'COMMUNICATION' &&
        (n.provider === 'Discord' ||
          nCat.includes('DISCORD') ||
          (n.type && n.type.toLowerCase().includes('discord')))
      )
        return true;
      return false;
    });
    return acc;
  }, {});


  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none shadow-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Node Palette
          </h3>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes (e.g. http, delay)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Nodes List grouped by Category */}
      <div className="p-3 overflow-y-auto space-y-4 flex-1">
        {filteredNodes.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-mono text-center py-6">
            No node matching "{searchTerm}"
          </p>
        ) : (
          categories.map((cat) => {
            const catNodes = groupedNodes[cat];
            if (!catNodes || catNodes.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  {cat}
                </h4>
                <div className="space-y-1.5">
                  {catNodes.map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        className="group p-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 cursor-grab active:cursor-grabbing transition-all duration-150 flex items-center justify-between shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg border ${node.badgeColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                              {node.label}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {node.description}
                            </p>
                          </div>
                        </div>

                        <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
        💡 Drag node onto canvas or select node to edit config.
      </div>
    </aside>
  );
};
