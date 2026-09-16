import React from 'react';

const baseProps = {
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
};

export function IntegrationLogo({ name, className = 'w-6 h-6' }) {
  if (name === 'sheets') return (
    <svg {...baseProps} className={className}>
      <path fill="#0F9D58" d="M5 2h9l5 5v15H5z" />
      <path fill="#87CEAC" d="M14 2v5h5z" />
      <path fill="#fff" d="M8 10h8v8H8zm1 1v2h2v-2zm3 0v2h3v-2zm-3 3v3h2v-3zm3 0v3h3v-3z" />
    </svg>
  );

  if (name === 'gmail') return (
    <svg {...baseProps} className={className}>
      <path fill="#4285F4" d="M3 6.5V19h4V9.4z" />
      <path fill="#34A853" d="M17 9.4V19h4V6.5z" />
      <path fill="#EA4335" d="M3.6 5.2A2 2 0 0 1 6 5l6 4.5L18 5a2 2 0 0 1 2.4.2L12 11.5z" />
      <path fill="#FBBC04" d="M3 6.5c0-.52.2-.98.6-1.3L7 7.75V9.4z" />
      <path fill="#C5221F" d="M21 6.5c0-.52-.2-.98-.6-1.3L17 7.75V9.4z" />
    </svg>
  );

  if (name === 'discord') return (
    <svg {...baseProps} className={className}>
      <path fill="#5865F2" d="M19.5 5.35A17.1 17.1 0 0 0 15.27 4l-.52 1.06a15.9 15.9 0 0 0-5.5 0L8.73 4A17.3 17.3 0 0 0 4.5 5.36C1.83 9.3 1.1 13.13 1.46 16.9a17 17 0 0 0 5.2 2.62l1.28-1.72a11 11 0 0 1-2.02-.97l.5-.38c3.9 1.8 8.14 1.8 12 0l.5.38c-.65.38-1.33.7-2.03.97l1.28 1.72a17 17 0 0 0 5.2-2.62c.43-4.36-.74-8.15-3.87-11.55ZM8.75 14.62c-1.18 0-2.14-1.08-2.14-2.4 0-1.33.94-2.4 2.14-2.4 1.2 0 2.16 1.08 2.14 2.4 0 1.32-.94 2.4-2.14 2.4Zm6.5 0c-1.18 0-2.14-1.08-2.14-2.4 0-1.33.94-2.4 2.14-2.4 1.2 0 2.16 1.08 2.14 2.4 0 1.32-.94 2.4-2.14 2.4Z" />
    </svg>
  );

  if (name === 'slack') return (
    <svg {...baseProps} className={className}>
      <path fill="#36C5F0" d="M9.4 2a2 2 0 0 1 2 2v5.4H9.4a2 2 0 0 1 0-4h.1V4a2 2 0 0 1 2-2Z" />
      <path fill="#2EB67D" d="M22 9.4a2 2 0 0 1-2 2h-5.4V9.4a2 2 0 0 1 4 0v.1H20a2 2 0 0 1 2 2Z" />
      <path fill="#ECB22E" d="M14.6 22a2 2 0 0 1-2-2v-5.4h2a2 2 0 0 1 0 4h-.1V20a2 2 0 0 1-2 2Z" />
      <path fill="#E01E5A" d="M2 14.6a2 2 0 0 1 2-2h5.4v2a2 2 0 0 1-4 0v-.1H4a2 2 0 0 1-2-2Z" />
    </svg>
  );

  if (name === 'mongodb') return (
    <svg {...baseProps} className={className}>
      <path fill="#47A248" d="M12.4 1.4c-.28-.46-.72-.46-1 0C9.73 4.1 7.3 6.3 7.3 11.35c0 3.53 1.9 6.03 4.2 7.12l.34 4.13h.64l.26-4.13c2.22-1.1 3.96-3.6 3.96-7.12 0-5.05-2.64-7.25-4.3-9.95Z" />
      <path fill="#A5D6A7" d="M12 3v15.7c-1.7-1.2-2.8-3.52-2.8-6.35C9.2 8.5 10.7 5.7 12 3Z" />
      <path fill="#2E7D32" d="M12 3c1.3 2.7 2.8 5.5 2.8 9.35 0 2.83-1.1 5.15-2.8 6.35Z" />
    </svg>
  );

  if (name === 'openai') return (
    <svg {...baseProps} className={className} fill="none"><path d="M12 3.2a4.3 4.3 0 0 1 7.25 3.13 4.31 4.31 0 0 1 1.3 7.72 4.3 4.3 0 0 1-5.95 5.62A4.31 4.31 0 0 1 7.35 17a4.31 4.31 0 0 1-1.3-7.72A4.3 4.3 0 0 1 12 3.2Zm0 0 3.75 2.16v4.33L12 11.85 8.25 9.69V5.36M6.05 9.28l3.75 2.16v4.33l-3.75 2.16m14.5-3.88-3.75-2.16-3.75 2.16v4.33" stroke="#111827" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  if (name === 'gemini') return (
    <svg {...baseProps} className={className}><defs><linearGradient id="geminiGradient" x1="3" y1="21" x2="21" y2="3"><stop stopColor="#1C7DFF" /><stop offset=".5" stopColor="#8B5CF6" /><stop offset="1" stopColor="#F472B6" /></linearGradient></defs><path fill="url(#geminiGradient)" d="M12 2c.55 5.65 4.35 9.45 10 10-5.65.55-9.45 4.35-10 10-.55-5.65-4.35-9.45-10-10 5.65-.55 9.45-4.35 10-10Z" /></svg>
  );
  if (name === 'github') return (
    <svg {...baseProps} className={className} fill="#181717"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
  );
  if (name === 'mysql') return (
    <svg {...baseProps} className={className} fill="none"><path d="M4 15c4.7-5.2 8.7-6.2 13.2-3.1M14.7 8.8c2.1-.2 3.9.75 5.3 2.85-1.9-.38-3.1-.08-3.6.9" stroke="#00758F" strokeWidth="2" strokeLinecap="round" /><path d="M6 16.5c2.1 1.2 4.3 1.6 6.7 1.15" stroke="#F29111" strokeWidth="2" strokeLinecap="round" /></svg>
  );
  if (name === 'postgres') return (
    <svg {...baseProps} className={className} fill="none"><path d="M7.1 18.5c-2.2-1.7-3-5.2-2.1-9.4.7-3.4 2.8-5 6.8-5.1 4.1-.1 6.5 1.35 7.2 4.5.8 3.5-.2 6.1-2.6 7.1-1.45.6-2.5-.2-2.3-1.7l.7-5.1c.15-1.1-.5-1.8-1.55-1.8-1 0-1.7.65-1.75 1.7l-.4 8.2c-.1 2.1-1.25 3.2-3.45 3.1" stroke="#336791" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M11.2 13.7c1.6 1 3.2 1.05 4.8.15" stroke="#336791" strokeWidth="1.5" strokeLinecap="round" /></svg>
  );

  return (
    <svg {...baseProps} className={className} fill="none">
      <path d="M8.5 12h7M6 8.5 2.5 12 6 15.5M18 8.5l3.5 3.5-3.5 3.5" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#06B6D4" />
    </svg>
  );
}

export function getNodeBrand(node = {}) {
  const identity = `${node.type || ''} ${node.label || ''} ${node.provider || ''} ${node.category || ''}`.toLowerCase();
  if (identity.includes('discord')) return 'discord';
  if (identity.includes('google sheet')) return 'sheets';
  if (identity.includes('gmail')) return 'gmail';
  if (identity.includes('openai') || identity.includes('open ai')) return 'openai';
  if (identity.includes('gemini')) return 'gemini';
  if (identity.includes('mongo')) return 'mongodb';
  if (identity.includes('github')) return 'github';
  if (identity.includes('mysql')) return 'mysql';
  if (identity.includes('postgres')) return 'postgres';
  return null;
}

export function NodeServiceIcon({ node, fallback: Fallback, className = 'w-4 h-4' }) {
  const brand = getNodeBrand(node);
  if (brand) return <IntegrationLogo name={brand} className={className} />;
  return Fallback ? <Fallback className={className} /> : null;
}
