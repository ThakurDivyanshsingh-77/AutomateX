import React from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const WorkflowFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  page,
  pages,
  total,
  onPageChange,
}) => {
  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-4 select-none font-sans">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows by name or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Sort & Stats */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="glass-panel-subtle border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">Sort: Newest</option>
              <option value="oldest" className="bg-slate-900 text-slate-200">Sort: Oldest</option>
              <option value="updated" className="bg-slate-900 text-slate-200">Sort: Last Updated</option>
              <option value="name" className="bg-slate-900 text-slate-200">Sort: Name (A-Z)</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Total: <strong className="text-white">{total}</strong>
          </span>
        </div>
      </div>

      {/* Bottom Filter Tabs & Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-b border-slate-800/80 pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === tab.value
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Page <strong className="text-white">{page}</strong> of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-1.5 glass-panel-subtle border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
                className="p-1.5 glass-panel-subtle border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

