import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileOutput, FileText, Award, BarChart2, ShoppingCart, Briefcase,
  DollarSign, User, Code, File, Monitor, Palette, Settings2, ChevronRight,
  RefreshCw, Download, QrCode, Eye, EyeOff, AlertTriangle, CheckCircle2,
  Zap, Image, Layout
} from 'lucide-react';

// ─── Template Definitions ─────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'blank',      label: 'Blank',          icon: File,         color: '#64748b' },
  { id: 'invoice',    label: 'Invoice',         icon: FileText,     color: '#10b981' },
  { id: 'certificate',label: 'Certificate',     icon: Award,        color: '#f59e0b' },
  { id: 'report',     label: 'Report',          icon: BarChart2,    color: '#3b82f6' },
  { id: 'receipt',    label: 'Receipt',         icon: ShoppingCart, color: '#06b6d4' },
  { id: 'offer_letter',label: 'Offer Letter',   icon: Briefcase,    color: '#8b5cf6' },
  { id: 'salary_slip',label: 'Salary Slip',     icon: DollarSign,   color: '#ec4899' },
  { id: 'resume',     label: 'Resume',          icon: User,         color: '#6366f1' },
  { id: 'custom',     label: 'Custom HTML',     icon: Code,         color: '#f97316' },
];

const PAGE_SIZES = ['A4', 'A3', 'Letter', 'Legal'];
const OUTPUT_MODES = [
  { value: 'base64', label: 'Base64 String' },
  { value: 'binary', label: 'Binary Buffer' },
  { value: 'url',    label: 'Download URL' },
];

const DEFAULT_CONTENT = {
  blank:       '<h1 style="color:#6366f1;">Hello {{trigger.body.name}}</h1>\n<p>Generated on {{now}}</p>',
  invoice:     '',
  certificate: '',
  report:      '',
  receipt:     '',
  offer_letter:'',
  salary_slip: '',
  resume:      '',
  custom:      '<!DOCTYPE html>\n<html>\n<head><style>body { font-family: sans-serif; padding: 40px; }</style></head>\n<body>\n  <h1>{{title}}</h1>\n  <p>{{body}}</p>\n</body>\n</html>',
};

// ─── Tab Pill ─────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
      active ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {children}
  </button>
);

// ─── Field Row ────────────────────────────────────────────────────────────────
const FieldRow = ({ label, required, children, hint }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
      {label}{required && <span className="text-amber-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
  </div>
);

// ─── Main Properties Component ────────────────────────────────────────────────
export const PdfGeneratorProperties = ({ node, onUpdateNodeData }) => {
  const config = node?.data?.config || {};
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  const previewRef = useRef(null);
  const debounceRef = useRef(null);

  const updateConfig = useCallback((updates) => {
    const nextConfig = { ...config, ...updates };
    onUpdateNodeData(node.id, { config: nextConfig });
  }, [config, node?.id, onUpdateNodeData]);

  // ─── Build live preview HTML ───────────────────────────────────────────────
  const buildPreviewHtml = useCallback((cfg) => {
    const content = cfg.content || DEFAULT_CONTENT[cfg.template] || '<p>Select a template to preview.</p>';
    const brandColor = cfg.brandColor || '#6366f1';
    const resolved = content
      .replace(/\{\{now\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{([^}]+)\}\}/g, (_, k) => `<span style="background:${brandColor}20;color:${brandColor};padding:0 3px;border-radius:3px;font-size:0.85em;">{{${k}}}</span>`);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin:0; padding:0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 32px; }
  h1, h2, h3 { color: ${brandColor}; margin-bottom: 8px; }
  p, li { line-height: 1.7; color: #334155; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th { background: ${brandColor}; color: #fff; padding: 8px; text-align: left; font-size: 11px; }
  td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
  tr:nth-child(even) { background: #f8fafc; }
  ${cfg.customCSS || ''}
</style>
</head>
<body>${resolved}</body>
</html>`;
  }, []);

  // Debounce preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(buildPreviewHtml(config));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [config.content, config.template, config.brandColor, config.customCSS, buildPreviewHtml]);

  const inputClass = 'w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono transition-colors';
  const selectClass = 'w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors';

  return (
    <div className="flex flex-col h-full space-y-0 text-xs text-slate-100 select-none">
      {/* Header */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mx-0 mb-3">
        <div className="flex items-center gap-2">
          <FileOutput className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-white">PDF Generator</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold">
            Puppeteer Engine
          </span>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="p-1 text-slate-400 hover:text-violet-400 rounded-lg hover:bg-slate-800 transition-colors"
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {['general', 'content', 'branding', 'advanced'].map((t) => (
          <Tab key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Tab>
        ))}
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="mb-3 rounded-xl overflow-hidden border border-violet-500/20 bg-white" style={{ height: 180 }}>
          <div className="flex items-center justify-between px-2 py-1 bg-slate-900 border-b border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
              <Monitor className="w-3 h-3" /> Live Preview
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Updates in real-time</span>
          </div>
          <iframe
            ref={previewRef}
            srcDoc={previewHtml}
            sandbox="allow-same-origin"
            className="w-full bg-white"
            style={{ height: 152, border: 'none' }}
            title="PDF Preview"
          />
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">

        {/* ── GENERAL TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <>
            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Template</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  const isActive = (config.template || 'blank') === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        updateConfig({
                          template: t.id,
                          content: config.content || DEFAULT_CONTENT[t.id] || '',
                        });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center gap-1 ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? t.color : undefined }} />
                      <span className="text-[10px] font-bold text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filename */}
            <FieldRow label="Filename" required hint="Supports {{variables}} — e.g. invoice_{{order.id}}.pdf">
              <input
                type="text"
                value={config.fileName || ''}
                onChange={(e) => updateConfig({ fileName: e.target.value })}
                placeholder="document_{{now}}.pdf"
                className={inputClass}
              />
            </FieldRow>

            {/* Page Size + Orientation */}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Page Size">
                <select value={config.pageSize || 'A4'} onChange={(e) => updateConfig({ pageSize: e.target.value })} className={selectClass}>
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Orientation">
                <select value={config.orientation || 'portrait'} onChange={(e) => updateConfig({ orientation: e.target.value })} className={selectClass}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </FieldRow>
            </div>

            {/* Output Mode */}
            <FieldRow label="Output Mode">
              <select value={config.outputMode || 'base64'} onChange={(e) => updateConfig({ outputMode: e.target.value })} className={selectClass}>
                {OUTPUT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </FieldRow>

            {/* Info box */}
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1"><Zap className="w-3 h-3" /> Execution Output</div>
              <p className="text-[10px] opacity-80 font-mono">
                {`{ success, fileName, mimeType, size, base64, attachment }`}
              </p>
              <p className="text-[10px] opacity-70">The <code>attachment</code> object is ready for Gmail "Attach PDF" action.</p>
            </div>
          </>
        )}

        {/* ── CONTENT TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">HTML Content / Template Body</label>
              <span className="text-[10px] text-violet-400 font-mono">Supports {'{{vars}}'}</span>
            </div>
            <textarea
              value={config.content || DEFAULT_CONTENT[config.template || 'blank'] || ''}
              onChange={(e) => updateConfig({ content: e.target.value })}
              rows={14}
              spellCheck={false}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 resize-y transition-colors leading-relaxed"
              placeholder="<h1>{{trigger.body.name}}</h1>&#10;<p>Invoice for {{trigger.body.email}}</p>"
            />
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
              <p className="font-bold text-slate-300">Quick Variables</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500 font-mono text-[10px]">
                <span>{'{{trigger.body.name}}'}</span>
                <span>{'{{http.data.field}}'}</span>
                <span>{'{{mongodb.document.email}}'}</span>
                <span>{'{{now}}'}</span>
                <span>{'{{workflow.id}}'}</span>
                <span>{'{{execution.id}}'}</span>
              </div>
            </div>

            {/* Custom CSS */}
            <FieldRow label="Custom CSS (injected into <style>)" hint="Add custom styles to override template defaults">
              <textarea
                value={config.customCSS || ''}
                onChange={(e) => updateConfig({ customCSS: e.target.value })}
                rows={4}
                spellCheck={false}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 resize-y"
                placeholder=".my-class { color: red; }"
              />
            </FieldRow>
          </>
        )}

        {/* ── BRANDING TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'branding' && (
          <>
            <FieldRow label="Company Name">
              <input type="text" value={config.companyName || ''} onChange={(e) => updateConfig({ companyName: e.target.value })} placeholder="Acme Corp" className={inputClass} />
            </FieldRow>
            <FieldRow label="Company Address">
              <input type="text" value={config.companyAddress || ''} onChange={(e) => updateConfig({ companyAddress: e.target.value })} placeholder="123 Main St, City" className={inputClass} />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Email">
                <input type="text" value={config.companyEmail || ''} onChange={(e) => updateConfig({ companyEmail: e.target.value })} placeholder="info@company.com" className={inputClass} />
              </FieldRow>
              <FieldRow label="Phone">
                <input type="text" value={config.companyPhone || ''} onChange={(e) => updateConfig({ companyPhone: e.target.value })} placeholder="+91 98000 00000" className={inputClass} />
              </FieldRow>
            </div>
            <FieldRow label="Website">
              <input type="text" value={config.companyWebsite || ''} onChange={(e) => updateConfig({ companyWebsite: e.target.value })} placeholder="https://company.com" className={inputClass} />
            </FieldRow>
            <FieldRow label="Logo URL" hint="Public image URL or Base64 string">
              <input type="text" value={config.logoUrl || ''} onChange={(e) => updateConfig({ logoUrl: e.target.value })} placeholder="https://..." className={inputClass} />
            </FieldRow>

            {/* Brand Color */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-violet-400" /> Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.brandColor || '#6366f1'}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="w-10 h-8 rounded-lg border border-slate-800 cursor-pointer bg-slate-950"
                />
                <input type="text" value={config.brandColor || '#6366f1'} onChange={(e) => updateConfig({ brandColor: e.target.value })} className={`${inputClass} flex-1`} placeholder="#6366f1" />
              </div>
            </div>

            {/* Watermark */}
            <FieldRow label="Watermark Text" hint="e.g. DRAFT, CONFIDENTIAL, PAID">
              <input type="text" value={config.watermark || ''} onChange={(e) => updateConfig({ watermark: e.target.value })} placeholder="CONFIDENTIAL" className={inputClass} />
            </FieldRow>

            {/* Header / Footer toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <input type="checkbox" checked={Boolean(config.showHeader)} onChange={(e) => updateConfig({ showHeader: e.target.checked })} className="accent-violet-500" id="show-header" />
                <label htmlFor="show-header" className="text-xs text-slate-300 cursor-pointer">Show Header</label>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <input type="checkbox" checked={config.showFooter !== false} onChange={(e) => updateConfig({ showFooter: e.target.checked })} className="accent-violet-500" id="show-footer" />
                <label htmlFor="show-footer" className="text-xs text-slate-300 cursor-pointer">Show Footer</label>
              </div>
            </div>

            {/* Custom Header HTML */}
            {config.showHeader && (
              <FieldRow label="Custom Header HTML" hint="Supports {{pageNumber}}, {{totalPages}}, {{generatedDate}}">
                <textarea value={config.headerHtml || ''} onChange={(e) => updateConfig({ headerHtml: e.target.value })} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500 resize-y" />
              </FieldRow>
            )}
          </>
        )}

        {/* ── ADVANCED TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'advanced' && (
          <>
            {/* PDF Metadata */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-violet-400" /> PDF Metadata</p>
              <FieldRow label="PDF Title">
                <input type="text" value={config.pdfTitle || ''} onChange={(e) => updateConfig({ pdfTitle: e.target.value })} placeholder="Invoice #102" className={inputClass} />
              </FieldRow>
              <FieldRow label="Author">
                <input type="text" value={config.pdfAuthor || ''} onChange={(e) => updateConfig({ pdfAuthor: e.target.value })} placeholder="AutomateX" className={inputClass} />
              </FieldRow>
              <FieldRow label="Subject">
                <input type="text" value={config.pdfSubject || ''} onChange={(e) => updateConfig({ pdfSubject: e.target.value })} placeholder="Payment Invoice" className={inputClass} />
              </FieldRow>
              <FieldRow label="Keywords">
                <input type="text" value={config.pdfKeywords || ''} onChange={(e) => updateConfig({ pdfKeywords: e.target.value })} placeholder="invoice, payment, order" className={inputClass} />
              </FieldRow>
            </div>

            {/* Margins */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Layout className="w-3.5 h-3.5 text-violet-400" /> Page Margins</p>
              <div className="grid grid-cols-2 gap-2">
                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                  <FieldRow key={side} label={`Margin ${side}`}>
                    <input
                      type="text"
                      value={config[`margin${side}`] || '15mm'}
                      onChange={(e) => updateConfig({ [`margin${side}`]: e.target.value })}
                      placeholder="15mm"
                      className={inputClass}
                    />
                  </FieldRow>
                ))}
              </div>
            </div>

            {/* Password Protection */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5 text-violet-400" /> Password Protection</p>
              <p className="text-[10px] text-slate-500">Coming in Phase 15.2 via pdf-lib encryption layer.</p>
              <FieldRow label="User Password (view)" hint="Leave blank for no password">
                <input type="password" value={config.userPassword || ''} onChange={(e) => updateConfig({ userPassword: e.target.value })} placeholder="••••••••" className={inputClass} disabled />
              </FieldRow>
              <FieldRow label="Owner Password (edit)">
                <input type="password" value={config.ownerPassword || ''} onChange={(e) => updateConfig({ ownerPassword: e.target.value })} placeholder="••••••••" className={inputClass} disabled />
              </FieldRow>
            </div>

            {/* QR Code data */}
            <FieldRow label="QR Code Data" hint="Generates a QR code embedded in invoice/receipt templates. Supports {{variables}}.">
              <input type="text" value={config.qrData || ''} onChange={(e) => updateConfig({ qrData: e.target.value })} placeholder="{{trigger.body.paymentUrl}}" className={inputClass} />
            </FieldRow>
          </>
        )}
      </div>
    </div>
  );
};
