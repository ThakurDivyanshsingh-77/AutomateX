import React, { useState, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  MoreVertical, 
  StickyNote, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  Palette, 
  Tag as TagIcon,
  Clock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NOTE_THEMES, NOTE_TAGS, getNoteTheme, getNoteTag } from './noteThemes';

export const NodeNotesAction = ({ nodeId, note, noteColor, noteTag }) => {
  const { getNode, setNodes } = useReactFlow();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Retrieve latest node data fallback
  const currentNode = getNode ? getNode(nodeId) : null;
  const initialNote = note !== undefined ? note : (currentNode?.data?.note || '');
  const initialColor = noteColor || currentNode?.data?.noteColor || 'amber';
  const initialTag = noteTag || currentNode?.data?.noteTag || 'note';

  const [noteText, setNoteText] = useState(initialNote);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedTag, setSelectedTag] = useState(initialTag);

  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const currentTheme = getNoteTheme(selectedColor);
  const displayTheme = getNoteTheme(initialColor);
  const displayTagObj = getNoteTag(initialTag);
  const currentTagObj = getNoteTag(selectedTag);

  const hasNote = Boolean(initialNote && String(initialNote).trim().length > 0);

  // Sync internal state when external props/node change
  useEffect(() => {
    setNoteText(initialNote);
    setSelectedColor(initialColor);
    setSelectedTag(initialTag);
  }, [note, noteColor, noteTag, currentNode?.data?.note, currentNode?.data?.noteColor, currentNode?.data?.noteTag]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }, 60);
    }
  }, [isModalOpen]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };

    if (isMenuOpen || isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen, isModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsModalOpen(false);
      }
    };
    if (isMenuOpen || isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isModalOpen]);

  const handleSaveNote = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = (noteText || '').trim();

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              note: trimmed || undefined,
              noteColor: trimmed ? selectedColor : undefined,
              noteTag: trimmed ? selectedTag : undefined,
              noteUpdatedAt: trimmed ? new Date().toISOString() : undefined,
            },
          };
        }
        return node;
      })
    );

    setIsModalOpen(false);
    setIsMenuOpen(false);
    if (trimmed) {
      toast.success('Node note updated successfully', {
        icon: currentTagObj.emoji || '📝',
        duration: 2000,
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          fontSize: '12px',
        },
      });
    } else if (hasNote) {
      toast.success('Node note removed', { duration: 1500 });
    }
  };

  const handleDeleteNote = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              note: undefined,
              noteColor: undefined,
              noteTag: undefined,
              noteUpdatedAt: undefined,
            },
          };
        }
        return node;
      })
    );

    setNoteText('');
    setIsModalOpen(false);
    setIsMenuOpen(false);
    toast.success('Node note deleted', { duration: 1500 });
  };

  const openNoteModal = (e) => {
    if (e) e.stopPropagation();
    setNoteText(initialNote);
    setSelectedColor(initialColor);
    setSelectedTag(initialTag);
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div
      className="relative flex items-center gap-1 nodrag nopan z-30 font-sans"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 1. Colorful Note Indicator / Badge */}
      {hasNote && (
        <div className="relative">
          <button
            type="button"
            onClick={openNoteModal}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            title={`View note: ${displayTagObj.label}`}
            className={`group px-1.5 py-1 rounded-lg border transition-all duration-200 shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 ${displayTheme.badgeBg}`}
          >
            <span className="text-[11px] leading-none select-none">{displayTagObj.emoji}</span>
            <StickyNote className={`w-3 h-3 ${displayTheme.iconColor} ${displayTheme.fillColor}`} />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-xs" style={{ backgroundColor: displayTheme.colorHex }} />
          </button>

          {/* Hover Tooltip Preview Card */}
          {showTooltip && !isModalOpen && !isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10">
              {/* Tooltip Header */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{displayTagObj.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                    {displayTagObj.label}
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase border"
                  style={{
                    backgroundColor: `${displayTheme.colorHex}20`,
                    borderColor: `${displayTheme.colorHex}50`,
                    color: displayTheme.colorHex,
                  }}
                >
                  {displayTheme.label}
                </span>
              </div>

              {/* Tooltip Body */}
              <p className="text-xs font-sans text-slate-300 leading-relaxed line-clamp-5 whitespace-pre-wrap">
                {initialNote}
              </p>

              {/* Tooltip Footer */}
              <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>{initialNote.length} chars</span>
                <span className="text-slate-500 flex items-center gap-0.5">
                  Click icon to edit ✍️
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Three-Dots Menu Button */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          title="Node Note Options"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Node Actions
            </div>

            <div className="py-1">
              {!hasNote ? (
                <button
                  type="button"
                  onClick={openNoteModal}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer group font-medium"
                >
                  <div className="p-1 rounded-md bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                    <StickyNote className="w-3.5 h-3.5" />
                  </div>
                  <span>Add Colorful Note</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openNoteModal}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer group font-medium"
                  >
                    <div className="p-1 rounded-md bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <span>Edit Note & Color</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group font-medium"
                  >
                    <div className="p-1 rounded-md bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Delete Note</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Colorful Note Popover / Editor Dialog */}
      {isModalOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 top-full mt-2 z-50 w-80 bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/5 text-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Vibrant Top Header Gradient Bar */}
          <div className={`p-3 bg-gradient-to-r ${currentTheme.headerGradient} text-white flex items-center justify-between shadow-sm transition-all duration-300`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none drop-shadow-sm">{currentTagObj.emoji}</span>
              <div className="truncate">
                <h4 className="text-xs font-bold truncate drop-shadow-xs">
                  {hasNote ? 'Edit Node Note' : 'Add Vibrant Note'}
                </h4>
                <span className="text-[10px] opacity-90 font-medium">
                  {currentTheme.label} • {currentTagObj.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3.5">
            {/* Category / Tag Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <TagIcon className="w-3 h-3 text-slate-500" />
                  <span>Category Tag</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Select type</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {NOTE_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTag(tag.id)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                        isSelected
                          ? `${currentTheme.badgePill} shadow-xs scale-102`
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatch Palette */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-slate-500" />
                  <span>Color Theme</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {currentTheme.label}
                </span>
              </div>

              <div className="grid grid-cols-9 gap-1.5 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                {Object.values(NOTE_THEMES).map((theme) => {
                  const isSelected = selectedColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedColor(theme.id)}
                      title={`${theme.label} ${theme.emoji}`}
                      className={`relative aspect-square rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${theme.swatchBg} ${
                        isSelected
                          ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-md'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3] drop-shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Write your ${currentTagObj.label.toLowerCase()} or documentation here...`}
                  className={`w-full text-xs p-3 rounded-2xl border bg-slate-50/70 focus:bg-white transition-all duration-200 outline-none resize-none text-slate-800 leading-relaxed placeholder:text-slate-400 ${currentTheme.glowRing}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSaveNote(e);
                    }
                  }}
                />
              </div>

              {/* Character Count & Shortcut Hint */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Ctrl + Enter to save</span>
                <span className="font-mono">{noteText.length} chars</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div>
                {hasNote && (
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  style={{ backgroundColor: currentTheme.colorHex }}
                  className="px-3.5 py-1.5 text-xs text-white font-bold rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeNotesAction;
