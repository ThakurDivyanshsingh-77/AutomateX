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
    <div className={`py-14 px-6 text-center bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-sm ${className}`}>
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl w-fit mx-auto text-brand-600 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};


