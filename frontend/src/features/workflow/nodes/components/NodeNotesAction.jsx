import React, { useState, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { MoreVertical, StickyNote, Edit3, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const NodeNotesAction = ({ nodeId, note }) => {
  const { setNodes } = useReactFlow();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [noteText, setNoteText] = useState(note || '');

  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const hasNote = Boolean(note && String(note).trim().length > 0);

  // Sync internal text state when external prop changes
  useEffect(() => {
    setNoteText(note || '');
  }, [note]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isModalOpen]);

  // Close menu and modal on outside click
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

  // Close on Escape key
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
            },
          };
        }
        return node;
      })
    );

    setIsModalOpen(false);
    setIsMenuOpen(false);
    if (trimmed) {
      toast.success('Node note saved', { duration: 1500 });
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
    setNoteText(note || '');
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div
      className="relative flex items-center gap-1 nodrag nopan z-30"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 1. Note Indicator / Badge (Visible only when node has a note) */}
      {hasNote && (
        <div className="relative">
          <button
            type="button"
            onClick={openNoteModal}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            title="View / Edit Note"
            className="p-1 rounded-md text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            <StickyNote className="w-3.5 h-3.5 fill-amber-500/20" />
          </button>

          {/* Hover Tooltip Preview */}
          {showTooltip && !isModalOpen && !isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 w-52 p-2 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] leading-relaxed border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 border-b border-slate-800 pb-0.5">
                <StickyNote className="w-3 h-3" /> Note Preview
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap font-sans text-slate-200">{note}</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Three-Dots "⋮" More-Actions Menu Button */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          title="More Node Actions"
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-1 z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {!hasNote ? (
              <button
                type="button"
                onClick={openNoteModal}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                <span>Add Note</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openNoteModal}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Note</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Note</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Note Popover / Editor Dialog */}
      {isModalOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 text-slate-900 font-sans animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <StickyNote className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>{hasNote ? 'Edit Node Note' : 'Add Node Note'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body: Note Textarea */}
          <textarea
            ref={textareaRef}
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your private notes or documentation for this node..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-slate-800 font-sans leading-relaxed placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSaveNote(e);
              }
            }}
          />

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
            <div>
              {hasNote && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1 text-xs bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-sm shadow-brand-500/20 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeNotesAction;
