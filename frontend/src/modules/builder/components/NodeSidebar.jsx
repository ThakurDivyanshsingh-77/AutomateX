import React, { useState } from 'react';
import { NODE_REGISTRY } from '../nodeRegistry';
import { Search, Plus, Layers } from 'lucide-react';

export const NodeSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const rawList = Object.values(NODE_REGISTRY);
  const uniqueNodesMap = new Map();
  rawList.forEach((n) => {
    if (n && n.type && !uniqueNodesMap.has(n.type)) {
      uniqueNodesMap.set(n.type, n);
    }
  });
  const nodesList = Array.from(uniqueNodesMap.values());

  const filteredNodes = nodesList.filter((n) => {
    const term = searchTerm.toLowerCase();
    const labelMatch = (n.label || '').toLowerCase().includes(term);
    const descMatch = (n.description || '').toLowerCase().includes(term);
    const typeMatch = (n.type || '').toLowerCase().includes(term);
    const subtitleMatch = (n.subtitle || '').toLowerCase().includes(term);
    const categoryMatch = (n.category || '').toLowerCase().includes(term);
    const formatMatch = term === 'file' || term === 'upload' || term === 'document' || term === 'docx' || term === 'doc' || term === 'pdf' || term === 'excel' || term === 'xlsx' || term === 'xls';
    
    return labelMatch || descMatch || typeMatch || subtitleMatch || categoryMatch || (formatMatch && (n.type === 'fileUpload' || n.category === 'INPUT'));
  });

  const triggers = filteredNodes.filter(
    (n) =>
      n.category === 'TRIGGER' ||
      n.category === 'Trigger' ||
      n.category === 'Triggers' ||
      (n.type && (n.type.toLowerCase().includes('trigger') || n.type === 'discordMessageReceived'))
  );
  const inputNodes = filteredNodes.filter(
    (n) => n.category === 'INPUT' || n.category === 'Input' || n.type === 'fileUpload'
  );
  const actions = filteredNodes.filter((n) => n.category === 'ACTION' || n.category === 'Action');
  const aiNodes = filteredNodes.filter((n) => n.category === 'AI / Artificial Intelligence' || n.category === 'AI');
  const communication = filteredNodes.filter(
    (n) =>
      n.category === 'Communication' ||
      n.category === 'COMMUNICATION' ||
      n.provider === 'Discord' ||
      (n.type && n.type.toLowerCase().includes('discord'))
  );
  const googleSheets = filteredNodes.filter((n) => n.category === 'Google Sheets');
  const logic = filteredNodes.filter((n) => n.category === 'LOGIC' || n.category === 'Logic');

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const renderCategoryGroup = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2 mb-4">
        <h4 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-1">
          {title} ({items.length})
        </h4>
        <div className="space-y-2">
          {items.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className="group flex items-start gap-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-brand-500/50 hover:bg-slate-850 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm"
              >
                <div className={`p-2 rounded-lg border ${node.badgeColor} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {node.label}
                    </h5>
                    <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-slate-200">Node Library</h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
          Drag & Drop
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Node Items List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {renderCategoryGroup('Triggers', triggers)}
        {renderCategoryGroup('Input / File', inputNodes)}
        {renderCategoryGroup('AI / Artificial Intelligence', aiNodes)}
        {renderCategoryGroup('Communication', communication)}
        {renderCategoryGroup('Actions', actions)}
        {renderCategoryGroup('Google Sheets', googleSheets)}
        {renderCategoryGroup('Logic & Control', logic)}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No matching nodes found
          </div>
        )}
      </div>
    </aside>
  );
};
