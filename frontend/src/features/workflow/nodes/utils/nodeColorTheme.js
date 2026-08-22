/**
 * Dynamic Node Color & Theme Resolver
 * Maps node types, categories, and providers to distinctive, high-contrast, vibrant visual themes.
 */

export const getNodeColorTheme = (type = '', category = '', provider = '') => {
  const t = String(type).toLowerCase();
  const c = String(category).toLowerCase();
  const p = String(provider).toLowerCase();

  // 1. Google Sheets (Forest Green)
  if (t.includes('googlesheets') || t.includes('sheets') || p.includes('google sheets')) {
    return {
      primaryColor: '#059669',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      iconFill: 'text-emerald-700',
      cardHover: 'hover:border-emerald-400 hover:bg-emerald-50/40',
      tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ringColor: 'ring-emerald-500/25 border-emerald-500 shadow-emerald-500/15',
      handleColor: '#059669',
      textHover: 'group-hover:text-emerald-700',
      stripeBg: 'bg-emerald-500',
    };
  }

  // 2. Start Trigger / Triggers (Emerald Green)
  if (t === 'start' || t === 'trigger' || (c === 'trigger' && !t.includes('webhook') && !t.includes('cron') && !t.includes('discord'))) {
    return {
      primaryColor: '#10b981',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconFill: 'text-emerald-600',
      cardHover: 'hover:border-emerald-400 hover:bg-emerald-50/40',
      tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ringColor: 'ring-emerald-500/25 border-emerald-500 shadow-emerald-500/15',
      handleColor: '#10b981',
      textHover: 'group-hover:text-emerald-600',
      stripeBg: 'bg-emerald-500',
    };
  }

  // 3. Webhook (Sky Blue / Cyan)
  if (t.includes('webhook')) {
    return {
      primaryColor: '#0284c7',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      iconFill: 'text-sky-600',
      cardHover: 'hover:border-sky-400 hover:bg-sky-50/40',
      tagBg: 'bg-sky-50 text-sky-700 border-sky-200',
      ringColor: 'ring-sky-500/25 border-sky-500 shadow-sky-500/15',
      handleColor: '#0284c7',
      textHover: 'group-hover:text-sky-600',
      stripeBg: 'bg-sky-500',
    };
  }

  // 4. Cron / Scheduler (Royal Blue)
  if (t.includes('cron') || t.includes('schedule')) {
    return {
      primaryColor: '#2563eb',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      iconFill: 'text-blue-600',
      cardHover: 'hover:border-blue-400 hover:bg-blue-50/40',
      tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
      ringColor: 'ring-blue-500/25 border-blue-500 shadow-blue-500/15',
      handleColor: '#2563eb',
      textHover: 'group-hover:text-blue-600',
      stripeBg: 'bg-blue-500',
    };
  }

  // 5. Discord (Blurple)
  if (t.includes('discord') || p.includes('discord')) {
    return {
      primaryColor: '#5865F2',
      iconBg: 'bg-indigo-50 text-[#5865F2] border-indigo-200',
      iconFill: 'text-[#5865F2]',
      cardHover: 'hover:border-indigo-400 hover:bg-indigo-50/40',
      tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      ringColor: 'ring-[#5865F2]/25 border-[#5865F2] shadow-[#5865F2]/15',
      handleColor: '#5865F2',
      textHover: 'group-hover:text-[#5865F2]',
      stripeBg: 'bg-[#5865F2]',
    };
  }

  // 6. Gmail (Coral Red)
  if (t.includes('gmail') || p.includes('gmail') || p.includes('google mail')) {
    return {
      primaryColor: '#ea4335',
      iconBg: 'bg-red-50 text-[#ea4335] border-red-200',
      iconFill: 'text-[#ea4335]',
      cardHover: 'hover:border-red-400 hover:bg-red-50/40',
      tagBg: 'bg-red-50 text-red-700 border-red-200',
      ringColor: 'ring-red-500/25 border-red-500 shadow-red-500/15',
      handleColor: '#ea4335',
      textHover: 'group-hover:text-red-600',
      stripeBg: 'bg-red-500',
    };
  }

  // 7. AI & Gemini Reasoning (Radiant Amber / Gold)
  if (t.includes('gemini') || t.includes('ai') || t.includes('openai') || c.includes('ai')) {
    return {
      primaryColor: '#d97706',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      iconFill: 'text-amber-600',
      cardHover: 'hover:border-amber-400 hover:bg-amber-50/40',
      tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
      ringColor: 'ring-amber-500/25 border-amber-500 shadow-amber-500/15',
      handleColor: '#d97706',
      textHover: 'group-hover:text-amber-600',
      stripeBg: 'bg-amber-500',
    };
  }

  // 8. File Upload / Document Content (Sky / Cyan Blue)
  if (t.includes('file') || t.includes('document')) {
    return {
      primaryColor: '#0284c7',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      iconFill: 'text-sky-600',
      cardHover: 'hover:border-sky-400 hover:bg-sky-50/40',
      tagBg: 'bg-sky-50 text-sky-700 border-sky-200',
      ringColor: 'ring-sky-500/25 border-sky-500 shadow-sky-500/15',
      handleColor: '#0284c7',
      textHover: 'group-hover:text-sky-600',
      stripeBg: 'bg-sky-500',
    };
  }

  // 9. Website Connect / HTTP Node (Teal)
  if (t.includes('websiteconnect') || t === 'http' || t.includes('http')) {
    return {
      primaryColor: '#0d9488',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
      iconFill: 'text-teal-600',
      cardHover: 'hover:border-teal-400 hover:bg-teal-50/40',
      tagBg: 'bg-teal-50 text-teal-700 border-teal-200',
      ringColor: 'ring-teal-500/25 border-teal-500 shadow-teal-500/15',
      handleColor: '#0d9488',
      textHover: 'group-hover:text-teal-600',
      stripeBg: 'bg-teal-600',
    };
  }

  // 10. Website Tournament / Product (Purple / Violet)
  if (t.includes('websitecreate') || t.includes('tournament') || t.includes('product')) {
    return {
      primaryColor: '#8b5cf6',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      iconFill: 'text-purple-600',
      cardHover: 'hover:border-purple-400 hover:bg-purple-50/40',
      tagBg: 'bg-purple-50 text-purple-700 border-purple-200',
      ringColor: 'ring-purple-500/25 border-purple-500 shadow-purple-500/15',
      handleColor: '#8b5cf6',
      textHover: 'group-hover:text-purple-600',
      stripeBg: 'bg-purple-600',
    };
  }

  // 11. Condition (IF/ELSE) / Logic (Fuchsia / Violet)
  if (t.includes('condition') || c.includes('logic')) {
    return {
      primaryColor: '#a855f7',
      iconBg: 'bg-violet-50 text-violet-600 border-violet-200',
      iconFill: 'text-violet-600',
      cardHover: 'hover:border-violet-400 hover:bg-violet-50/40',
      tagBg: 'bg-violet-50 text-violet-700 border-violet-200',
      ringColor: 'ring-violet-500/25 border-violet-500 shadow-violet-500/15',
      handleColor: '#a855f7',
      textHover: 'group-hover:text-violet-600',
      stripeBg: 'bg-violet-500',
    };
  }

  // 12. ForEach / Loop (Cyan)
  if (t.includes('foreach') || t.includes('loop')) {
    return {
      primaryColor: '#06b6d4',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      iconFill: 'text-cyan-600',
      cardHover: 'hover:border-cyan-400 hover:bg-cyan-50/40',
      tagBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      ringColor: 'ring-cyan-500/25 border-cyan-500 shadow-cyan-500/15',
      handleColor: '#06b6d4',
      textHover: 'group-hover:text-cyan-600',
      stripeBg: 'bg-cyan-500',
    };
  }

  // 13. TryCatch / Reliability (Indigo)
  if (t.includes('trycatch')) {
    return {
      primaryColor: '#4f46e5',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      iconFill: 'text-indigo-600',
      cardHover: 'hover:border-indigo-400 hover:bg-indigo-50/40',
      tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      ringColor: 'ring-indigo-500/25 border-indigo-500 shadow-indigo-500/15',
      handleColor: '#4f46e5',
      textHover: 'group-hover:text-indigo-600',
      stripeBg: 'bg-indigo-500',
    };
  }

  // 14. Delay / Timer (Warm Orange)
  if (t.includes('delay')) {
    return {
      primaryColor: '#f59e0b',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      iconFill: 'text-amber-600',
      cardHover: 'hover:border-amber-400 hover:bg-amber-50/40',
      tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
      ringColor: 'ring-amber-500/25 border-amber-500 shadow-amber-500/15',
      handleColor: '#f59e0b',
      textHover: 'group-hover:text-amber-600',
      stripeBg: 'bg-amber-500',
    };
  }

  // 15. Log / Console (Slate / Steel)
  if (t.includes('log')) {
    return {
      primaryColor: '#64748b',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
      iconFill: 'text-slate-700',
      cardHover: 'hover:border-slate-400 hover:bg-slate-100/50',
      tagBg: 'bg-slate-100 text-slate-700 border-slate-200',
      ringColor: 'ring-slate-500/25 border-slate-500 shadow-slate-500/15',
      handleColor: '#64748b',
      textHover: 'group-hover:text-slate-800',
      stripeBg: 'bg-slate-600',
    };
  }

  // 16. End Completion (Rose / Crimson)
  if (t.includes('end')) {
    return {
      primaryColor: '#e11d48',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      iconFill: 'text-rose-600',
      cardHover: 'hover:border-rose-400 hover:bg-rose-50/40',
      tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
      ringColor: 'ring-rose-500/25 border-rose-500 shadow-rose-500/15',
      handleColor: '#e11d48',
      textHover: 'group-hover:text-rose-600',
      stripeBg: 'bg-rose-500',
    };
  }

  // 17. Databases (Emerald / Teal)
  if (t.includes('mongo') || t.includes('sql') || t.includes('postgres') || c.includes('database')) {
    return {
      primaryColor: '#0d9488',
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
      iconFill: 'text-teal-700',
      cardHover: 'hover:border-teal-400 hover:bg-teal-50/40',
      tagBg: 'bg-teal-50 text-teal-800 border-teal-200',
      ringColor: 'ring-teal-500/25 border-teal-500 shadow-teal-500/15',
      handleColor: '#0d9488',
      textHover: 'group-hover:text-teal-700',
      stripeBg: 'bg-teal-600',
    };
  }

  // 18. PDF Generator (Orange)
  if (t.includes('pdf')) {
    return {
      primaryColor: '#ea580c',
      iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
      iconFill: 'text-orange-600',
      cardHover: 'hover:border-orange-400 hover:bg-orange-50/40',
      tagBg: 'bg-orange-50 text-orange-700 border-orange-200',
      ringColor: 'ring-orange-500/25 border-orange-500 shadow-orange-500/15',
      handleColor: '#ea580c',
      textHover: 'group-hover:text-orange-600',
      stripeBg: 'bg-orange-500',
    };
  }

  // Default fallback (Brand Electric Orange)
  return {
    primaryColor: '#ff4f00',
    iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
    iconFill: 'text-orange-600',
    cardHover: 'hover:border-orange-400 hover:bg-orange-50/40',
    tagBg: 'bg-orange-50 text-orange-700 border-orange-200',
    ringColor: 'ring-brand-500/25 border-brand-500 shadow-brand-500/15',
    handleColor: '#ff4f00',
    textHover: 'group-hover:text-brand-600',
    stripeBg: 'bg-brand-500',
  };
};
