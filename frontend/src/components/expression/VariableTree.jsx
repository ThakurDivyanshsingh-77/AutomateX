import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Braces, Hash, Type, ToggleLeft, HelpCircle } from 'lucide-react';

const TypeBadge = ({ type }) => {
  switch (type) {
    case 'number':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          num
        </span>
      );
    case 'boolean':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          bool
        </span>
      );
    case 'array':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          arr
        </span>
      );
    case 'object':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          obj
        </span>
      );
    default:
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          str
        </span>
      );
  }
};

const TreeNode = ({
  keyName,
  value,
  parentPath = '',
  selectedPath,
  onSelectPath,
  onDoubleClickPath,
  searchTerm = '',
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const currentPath = parentPath ? `${parentPath}.${keyName}` : keyName;
  const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isComplex = isObject || isArray;

  let valueType = typeof value;
  if (isArray) valueType = 'array';
  if (isObject) valueType = 'object';

  const isSelected = selectedPath === currentPath;

  // Filter check for search matching
  const matchesSearch =
    !searchTerm ||
    currentPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(keyName).toLowerCase().includes(searchTerm.toLowerCase());

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelectPath(currentPath, value);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDoubleClickPath(currentPath, value);
  };

  if (!matchesSearch && !isComplex) {
    return null;
  }

  return (
    <div className="select-none font-mono text-xs">
      <div
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
          isSelected
            ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-200'
            : 'hover:bg-slate-800/60 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isComplex ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 text-slate-500 hover:text-white rounded"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <span className="font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
            {keyName}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isComplex && (
            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {String(value)}
            </span>
          )}
          <TypeBadge type={valueType} />
        </div>
      </div>

      {/* Render children for Objects and Arrays */}
      {isComplex && isOpen && (
        <div className="pl-4 border-l border-slate-800/80 ml-3 my-1 space-y-0.5">
          {isArray
            ? value.map((item, idx) => (
                <TreeNode
                  key={idx}
                  keyName={`[${idx}]`}
                  value={item}
                  parentPath={parentPath ? `${parentPath}.${keyName}` : keyName}
                  selectedPath={selectedPath}
                  onSelectPath={onSelectPath}
                  onDoubleClickPath={onDoubleClickPath}
                  searchTerm={searchTerm}
                />
              ))
            : Object.entries(value).map(([k, v]) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  parentPath={parentPath ? `${parentPath}.${keyName}` : keyName}
                  selectedPath={selectedPath}
                  onSelectPath={onSelectPath}
                  onDoubleClickPath={onDoubleClickPath}
                  searchTerm={searchTerm}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export const VariableTree = ({ data, rootPrefix = '', selectedPath, onSelectPath, onDoubleClickPath, searchTerm }) => {
  if (!data || typeof data !== 'object') {
    return (
      <p className="text-[11px] text-slate-500 italic p-3 font-mono">
        No output properties available for this node.
      </p>
    );
  }

  return (
    <div className="space-y-0.5 p-1">
      {Object.entries(data).map(([key, val]) => (
        <TreeNode
          key={key}
          keyName={key}
          value={val}
          parentPath={rootPrefix}
          selectedPath={selectedPath}
          onSelectPath={onSelectPath}
          onDoubleClickPath={onDoubleClickPath}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  );
};
