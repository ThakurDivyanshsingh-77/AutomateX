import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const KeyValueEditor = ({ label, value = [], onChange, description }) => {
  // Normalize array if stored as string JSON or object
  const items = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null
    ? Object.entries(value).map(([k, v]) => ({ key: k, value: String(v) }))
    : [];

  const handleAdd = () => {
    onChange([...items, { key: '', value: '' }]);
  };

  const handleRemove = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleChange = (index, field, val) => {
    const next = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange(next);
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {items.length === 0 ? (
        <p className="text-[11px] text-slate-600 font-mono italic">No key-value pairs added.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Key (e.g. Header)"
                value={item.key || ''}
                onChange={(e) => handleChange(idx, 'key', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Value"
                value={item.value || ''}
                onChange={(e) => handleChange(idx, 'value', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
