import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Save, CheckCircle2, Loader2, AlertCircle, Play } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const CanvasControls = ({ saveStatus, onSave, onRun, isRunning }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const getSaveBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-medium">
            ● Unsaved changes
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-mono font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Save Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        );
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl select-none">
      <div className="px-3 border-r border-slate-800">{getSaveBadge()}</div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onSave}
        isLoading={saveStatus === 'saving'}
      >
        <Save className="w-3.5 h-3.5" /> Save
      </Button>

      <Button
        variant="primary"
        size="sm"
        onClick={onRun}
        isLoading={isRunning}
        className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
      >
        <Play className="w-3.5 h-3.5 fill-white" /> Run Workflow
      </Button>

      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
        <button
          onClick={() => zoomIn()}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => fitView()}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
