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

  return (
    <svg {...baseProps} className={className} fill="none">
      <path d="M8.5 12h7M6 8.5 2.5 12 6 15.5M18 8.5l3.5 3.5-3.5 3.5" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#06B6D4" />
    </svg>
  );
}

