import React, { useState } from 'react';
import { Table, Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const ColumnDataMapper = ({ mappings = [], onChange, availableVariables = [] }) => {
  const [cols, setCols] = useState(mappings.length > 0 ? mappings : [{ column: 'Name', value: '{{http.user.name}}' }, { column: 'Email', value: '{{http.user.email}}' }]);

  const handleAdd = () => {
    const updated = [...cols, { column: '', value: '' }];
    setCols(updated);
    if (onChange) onChange(updated);
  };

  const handleRemove = (idx) => {
    const updated = cols.filter((_, i) => i !== idx);
    setCols(updated);
    if (onChange) onChange(updated);
  };

  const handleChange = (idx, field, val) => {
    const updated = [...cols];
    updated[idx][field] = val;
    setCols(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          Google Sheet Column Mapper
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="p-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Column
        </button>
      </div>

      <div className="space-y-2">
        {cols.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            {/* Sheet Column Name */}
            <input
              type="text"
              placeholder="Column Name (e.g. Email)"
              value={item.column}
              onChange={(e) => handleChange(idx, 'column', e.target.value)}
              className="w-1/3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

            {/* Variable Value Input */}
            <input
              type="text"
              placeholder="{{item.email}}"
              value={item.value}
              onChange={(e) => handleChange(idx, 'value', e.target.value)}
              className="flex-1 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
