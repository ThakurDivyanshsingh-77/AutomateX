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
    <div className="space-y-4 select-none font-sans text-slate-900">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workflows by name or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-sm"
          />
        </div>

        {/* Sort & Stats */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 font-medium shadow-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="updated">Sort: Last Updated</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-mono hidden md:inline">
            Total: <strong className="text-slate-900">{total}</strong>
          </span>
        </div>
      </div>

      {/* Bottom Filter Tabs & Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-b border-slate-200 pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === tab.value
                  ? 'bg-brand-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Page <strong className="text-slate-900">{page}</strong> of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
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


