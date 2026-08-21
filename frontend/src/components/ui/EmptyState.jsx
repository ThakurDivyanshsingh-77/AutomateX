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
    <div className={`py-14 px-6 text-center glass-panel-subtle border border-slate-800/80 rounded-2xl space-y-3.5 backdrop-blur-md ${className}`}>
      <div className="p-4 bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/60 rounded-2xl w-fit mx-auto text-brand-400 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};

