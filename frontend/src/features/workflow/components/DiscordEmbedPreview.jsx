import React from 'react';
import { ExternalLink, Calendar, Bot } from 'lucide-react';

export const DiscordEmbedPreview = ({ embed }) => {
  const {
    title,
    description,
    color = '#5865F2',
    url,
    authorName,
    authorUrl,
    authorIconUrl,
    thumbnailUrl,
    imageUrl,
    footerText,
    footerIconUrl,
    timestamp,
    fields = [],
  } = embed || {};

  const borderAccentColor = color ? (color.startsWith('#') ? color : `#${color}`) : '#5865F2';

  const formattedTimestamp = timestamp
    ? typeof timestamp === 'string' && timestamp.length > 5
      ? timestamp
      : new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
    : null;

  return (
    <div className="space-y-1.5 select-none font-sans text-xs">
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>Live Discord Embed Preview</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Simulated Discord Client</span>
      </div>

      {/* Discord Client Message Container */}
      <div className="p-3 bg-[#36393f] rounded-xl border border-slate-800 shadow-xl space-y-2">
        {/* Bot Header Row */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            BOT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs">AutomateX Bot</span>
              <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-[#5865f2] text-white uppercase tracking-wider">
                BOT
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Today at 12:00 PM</span>
          </div>
        </div>

        {/* Discord Embed Card */}
        <div
          className="bg-[#2f3136] rounded-lg p-3 relative border-l-4 shadow-md overflow-hidden space-y-2"
          style={{ borderLeftColor: borderAccentColor }}
        >
          {/* Top-Right Floating Thumbnail */}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-16 h-16 rounded-md object-cover absolute top-3 right-3 border border-slate-700 shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Author Header */}
          {authorName && (
            <div className="flex items-center gap-2">
              {authorIconUrl && (
                <img
                  src={authorIconUrl}
                  alt="Author Icon"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              {authorUrl ? (
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-xs text-white hover:underline flex items-center gap-1"
                >
                  <span>{authorName}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              ) : (
                <span className="font-bold text-xs text-white">{authorName}</span>
              )}
            </div>
          )}

          {/* Title */}
          {title && (
            <div>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-sm text-[#00b0f4] hover:underline flex items-center gap-1"
                >
                  <span>{title}</span>
                  <ExternalLink className="w-3 h-3 text-[#00b0f4]" />
                </a>
              ) : (
                <h4 className="font-bold text-sm text-white">{title}</h4>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
              {description}
            </div>
          )}

          {/* Fields Grid */}
          {fields && fields.length > 0 && (
            <div className="grid grid-cols-12 gap-2 pt-1">
              {fields.map((field, idx) => {
                const colSpan = field.inline ? 'col-span-6' : 'col-span-12';
                return (
                  <div key={idx} className={`${colSpan} space-y-0.5 bg-[#202225]/40 p-1.5 rounded border border-slate-800/40`}>
                    <div className="font-bold text-[11px] text-slate-200">{field.name || 'Untitled Field'}</div>
                    <div className="text-xs text-slate-300 whitespace-pre-wrap">{field.value || 'No value'}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hero Image */}
          {imageUrl && (
            <div className="pt-1">
              <img
                src={imageUrl}
                alt="Embed Image"
                className="w-full max-h-48 object-cover rounded-lg border border-slate-700 shadow"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Footer & Timestamp */}
          {(footerText || footerIconUrl || formattedTimestamp) && (
            <div className="pt-2 border-t border-slate-700/50 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              {footerIconUrl && (
                <img
                  src={footerIconUrl}
                  alt="Footer Icon"
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              {footerText && <span>{footerText}</span>}
              {footerText && formattedTimestamp && <span>•</span>}
              {formattedTimestamp && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-slate-500" />
                  <span>{formattedTimestamp}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscordEmbedPreview;
