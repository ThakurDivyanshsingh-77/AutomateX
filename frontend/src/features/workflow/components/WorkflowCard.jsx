import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitFork,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Globe,
  Archive,
  ExternalLink,
  Webhook,
  Tag,
  History
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export const WorkflowCard = ({ workflow, onDuplicate, onPublish, onArchive, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyWebhookUrl = (e) => {
    e.stopPropagation();
    const token = workflow.webhookToken || workflow._id;
    const apiBase = (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost'))
      ? 'https://automatex-a839.onrender.com/api/v1'
      : (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api/v1`);
    const url = `${apiBase}/webhooks/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Published
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <Archive className="w-3 h-3" /> Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            Draft
          </span>
        );
    }
  };

  const formattedCreated = new Date(workflow.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group bg-white border border-slate-200 hover:border-orange-300 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md relative text-slate-900">
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-brand-600 group-hover:scale-105 transition-transform">
              <GitFork className="w-4 h-4" />
            </div>
            {getStatusBadge(workflow.status)}
            {/* Version badge */}
            {workflow.currentVersion && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {workflow.currentVersion}
              </span>
            )}
          </div>

          {/* Action Dropdown Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Actions Menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 font-sans text-xs text-slate-700">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/builder/${workflow._id}`);
                  }}
                  className="w-full px-3 py-2 text-left text-brand-600 hover:bg-orange-50 flex items-center gap-2 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-600" /> Open Builder
                </button>

                <button
                  onClick={handleCopyWebhookUrl}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Webhook className="w-3.5 h-3.5 text-cyan-600" /> Copy Webhook URL
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/workflows/edit/${workflow._id}`);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Metadata
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(workflow._id);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Duplicate
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onPublish(workflow._id);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  {workflow.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                {workflow.status !== 'archived' && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onArchive(workflow._id);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-600" /> Archive
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(workflow._id);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div>
          <h3
            onClick={() => navigate(`/builder/${workflow._id}`)}
            className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {workflow.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {workflow.description || 'No description provided.'}
          </p>
        </div>

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {workflow.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-mono font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Buttons & Timestamps */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 font-mono">Created {formattedCreated}</span>
          {workflow.totalVersions > 0 && (
            <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
              <History className="w-2.5 h-2.5" /> {workflow.totalVersions} version{workflow.totalVersions !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWebhookUrl}
            title="Copy Public Webhook URL"
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-cyan-700 rounded-lg border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1 shadow-sm"
          >
            <Webhook className="w-3.5 h-3.5" />
          </button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/builder/${workflow._id}`)}
            className="text-xs font-semibold hover:border-brand-500/40"
          >
            Open Builder <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};


