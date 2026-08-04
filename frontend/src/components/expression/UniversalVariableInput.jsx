import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, Terminal, AlertTriangle, CheckCircle2, Code } from 'lucide-react';
import { VariableEngine } from '../../engine/variable/VariableEngine';
import { VariablePickerDrawer } from './VariablePickerDrawer';

export const UniversalVariableInput = ({
  label,
  value = '',
  onChange,
  placeholder,
  isTextarea = false,
  rows = 3,
  error,
  description,
  required = false,
  workflowNodes = [],
  executionSnapshot = null,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Discover nodes for autocomplete
  const data = useMemo(() => {
    return VariableEngine.list(workflowNodes, executionSnapshot);
  }, [workflowNodes, executionSnapshot]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!autocompleteVisible) return [];
    return VariableEngine.getAutocompleteSuggestions(autocompleteQuery, data.nodes);
  }, [autocompleteVisible, autocompleteQuery, data.nodes]);

  // Validation
  const validation = useMemo(() => {
    return VariableEngine.validate(value, {
      'http.statusCode': 200,
      'http.statusText': 'OK',
      'http.data.id': 101,
      'http.data.name': 'Divyansh',
      'http.data.email': 'divyansh@example.com',
      'http.data.temp': 28.5,
      'gmail.messageId': '18ab4d8d90ef',
      'gmail.status': 'SENT',
    });
  }, [value]);

  // Live preview text
  const livePreviewText = useMemo(() => {
    if (!value || typeof value !== 'string' || !value.includes('{{')) return '';
    return VariableEngine.resolve(value, {
      'http.statusCode': 200,
      'http.data.name': 'Divyansh',
      'http.data.temp': 28.5,
      'user.name': 'Divyansh',
      'user.age': 25,
      'email': 'divyansh@example.com',
    });
  }, [value]);

  // Insert variable string at exact cursor position
  const handleInsertExpression = (exprText) => {
    const el = inputRef.current;
    if (!el) {
      onChange((value || '') + exprText);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';

    const nextVal = currentVal.substring(0, start) + exprText + currentVal.substring(end);
    onChange(nextVal);
    setAutocompleteVisible(false);

    setTimeout(() => {
      el.focus();
      const newPos = start + exprText.length;
      el.setSelectionRange(newPos, newPos);
    }, 50);
  };

  // Keyboard navigation & trigger check
  const handleKeyDown = (e) => {
    // Ctrl + Space -> Open Variable Drawer
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      setIsDrawerOpen(true);
      return;
    }

    // Autocomplete popup navigation
    if (autocompleteVisible && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        if (selected) {
          applyAutocomplete(selected.path);
        }
        return;
      }
      if (e.key === 'Escape') {
        setAutocompleteVisible(false);
        return;
      }
    }
  };

  // Handle Input Changes & detect typing `{{`
  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

    if (lastOpenBrace !== -1 && !textBeforeCursor.substring(lastOpenBrace).includes('}}')) {
      const query = textBeforeCursor.substring(lastOpenBrace + 2);
      setAutocompleteQuery(query);
      setAutocompleteVisible(true);
      setSelectedIndex(0);
    } else {
      setAutocompleteVisible(false);
    }
  };

  // Apply selected autocomplete item
  const applyAutocomplete = (itemPath) => {
    const el = inputRef.current;
    const val = value || '';
    const cursorPos = el?.selectionStart || val.length;
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

    if (lastOpenBrace !== -1) {
      const beforeBrace = val.substring(0, lastOpenBrace);
      const afterCursor = val.substring(cursorPos);
      const nextVal = `${beforeBrace}{{${itemPath}}}${afterCursor}`;
      onChange(nextVal);
      setAutocompleteVisible(false);

      setTimeout(() => {
        el.focus();
        const newPos = lastOpenBrace + itemPath.length + 4;
        el.setSelectionRange(newPos, newPos);
      }, 50);
    }
  };

  // Drag and Drop Handling
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      handleInsertExpression(droppedText);
    }
  };

  const InputTag = isTextarea ? 'textarea' : 'input';

  return (
    <div className="space-y-1.5 font-sans relative">
      {/* Label and Drawer Trigger Button */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-slate-300">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
          title="Click or press Ctrl + Space to browse variables"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Insert Variable</span>
        </button>
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {/* Input / Textarea Target with Drop Zone */}
      <div className="relative">
        <InputTag
          ref={inputRef}
          type={isTextarea ? undefined : 'text'}
          rows={isTextarea ? rows : undefined}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          placeholder={placeholder || 'Type variable e.g. {{http.data.temp}}'}
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors ${
            !validation.isValid
              ? 'border-rose-500/80 focus:border-rose-500'
              : value?.includes('{{')
              ? 'border-purple-500/60 focus:border-purple-500 text-purple-200'
              : error
              ? 'border-rose-500/80'
              : 'border-slate-800 focus:border-indigo-500'
          }`}
        />

        {/* Inline Unknown Variable Warning Badge */}
        {!validation.isValid && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md" title={`Unknown variables: ${validation.unknownVars.join(', ')}`}>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Unknown Variable</span>
          </div>
        )}
      </div>

      {/* Inline Autocomplete Suggestions Popup */}
      {autocompleteVisible && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800 font-mono text-xs animate-fadeIn">
          {suggestions.map((item, idx) => (
            <div
              key={item.path + idx}
              onClick={() => applyAutocomplete(item.path)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`p-2 cursor-pointer flex items-center justify-between transition-colors ${
                idx === selectedIndex ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={item.isFunction ? 'text-emerald-400 font-bold' : 'text-purple-300 font-bold'}>
                  {item.label}
                </span>
                {item.nodeName && <span className="text-[9px] font-sans text-slate-400 uppercase">[{item.nodeName}]</span>}
              </div>
              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-slate-950/50 text-slate-400">
                {item.type || 'String'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Live Resolved Preview Banner */}
      {livePreviewText && (
        <div className="p-2 px-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono flex items-center gap-2 text-purple-300">
          <Terminal className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
          <div className="truncate">
            <span className="font-bold uppercase tracking-wider text-purple-400 mr-1.5">Live Preview:</span>
            <span>{livePreviewText}</span>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}

      {/* Variable Picker Drawer */}
      <VariablePickerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onInsert={handleInsertExpression}
        workflowNodes={workflowNodes}
        executionSnapshot={executionSnapshot}
      />
    </div>
  );
};
