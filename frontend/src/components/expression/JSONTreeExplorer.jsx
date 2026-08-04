import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Star,
  Check,
  Eye,
  PlusCircle,
  GripVertical,
} from 'lucide-react';
import { VariableEngine } from '../../engine/variable/VariableEngine';

const TYPE_COLORS = {
  String: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Number: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Boolean: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Array: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Object: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Date: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Binary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Null: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  JSON: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const JSONTreeItem = ({
  item,
  level = 0,
  onInsert,
  onPreview,
  favorites = [],
  onToggleFavorite,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const [copied, setCopied] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isStarred = favorites.includes(item.path);
  const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS.String;

  const tooltipTitle = `Name: ${item.name}\nPath: {{${item.path}}}\nType: ${item.type}\nSource Node: ${item.sourceNode || 'Output'}\nExample: ${typeof item.example === 'object' ? JSON.stringify(item.example) : String(item.example ?? '')}\nDescription: ${item.description || 'Variable output'}`;

  const handleCopyPath = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`{{${item.path}}}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', `{{${item.path}}}`);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="select-none font-mono text-xs">
      <div
        draggable
        onDragStart={handleDragStart}
        title={tooltipTitle}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          } else if (onInsert) {
            onInsert(`{{${item.path}}}`);
          }
        }}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className="group flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-700/50 transition-colors"
      >
        {/* Left Side: Drag handle, Expand Icon, Path Name, Type Badge */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <GripVertical className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" />

          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 text-slate-400 hover:text-white rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-3.5 h-3.5 flex-shrink-0" />
          )}

          <span className="font-semibold text-slate-200 truncate">{item.name}</span>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${typeStyle}`}
          >
            {item.type}
          </span>

          {/* Inline Example Value */}
          {!hasChildren && item.example !== undefined && (
            <span className="text-slate-500 truncate text-[11px] max-w-[140px] ml-1">
              : {typeof item.example === 'object' ? JSON.stringify(item.example) : String(item.example)}
            </span>
          )}
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Favorite Star Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.path);
              }}
              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700"
              title={isStarred ? 'Remove Favorite' : 'Star Favorite'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
          )}

          {/* Copy Path */}
          <button
            type="button"
            onClick={handleCopyPath}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
            title="Copy Variable {{path}}"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Preview Modal Trigger */}
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(item);
              }}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-700"
              title="Preview Variable Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Insert Variable */}
          {onInsert && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInsert(`{{${item.path}}}`);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
              title="Insert into text editor"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Insert</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Nested Children if Expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {item.children.map((child, idx) => (
            <JSONTreeItem
              key={child.path || idx}
              item={child}
              level={level + 1}
              onInsert={onInsert}
              onPreview={onPreview}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const JSONTreeExplorer = ({
  data = [],
  onInsert,
  onPreview,
  favorites = [],
  onToggleFavorite,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs font-sans">
        No variables available in this category.
      </div>
    );
  }

  return (
    <div className="space-y-0.5 py-1">
      {data.map((item, idx) => (
        <JSONTreeItem
          key={item.path || idx}
          item={item}
          level={0}
          onInsert={onInsert}
          onPreview={onPreview}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
