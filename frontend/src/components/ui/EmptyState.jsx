import React from 'react';
import { Layers } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Layers,
  title = 'No items found',
  description = 'There are currently no items to display.',
  actionButton = null,
  className = '',
}) => {
  return (
    <div className={`py-14 px-6 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 ${className}`}>
      <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl w-fit mx-auto text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};
