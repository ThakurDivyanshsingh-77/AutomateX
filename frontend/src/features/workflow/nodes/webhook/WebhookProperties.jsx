import React from 'react';
import { WebhookURL } from './WebhookURL';
import { WebhookTester } from './WebhookTester';
import { ExpressionInput } from '../../../../components/expression/ExpressionInput';
import { HelpCircle } from 'lucide-react';

export const WebhookProperties = ({ node, onUpdateNodeData }) => {
  const config = node?.data?.config || {};
  const method = config.method || 'ANY';
  const authType = config.authType || 'none';
  const authSecret = config.authSecret || '';
  const headerName = config.headerName || 'x-webhook-secret';
  const customPath = config.path || node.id || 'user-signup';

  const apiBase = (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost'))
    ? 'https://automatex-a839.onrender.com/api/v1'
    : (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api/v1`);
  const baseUrl = `${apiBase}/webhooks/${customPath}`;

  const updateConfig = (field, value) => {
    const nextConfig = { ...config, [field]: value };
    onUpdateNodeData(node.id, { config: nextConfig });
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Generated Webhook URL Banner */}
      <WebhookURL webhookUrl={baseUrl} />

      {/* Custom Path Slug */}
      <ExpressionInput
        label="Webhook Path Slug / Endpoint ID"
        value={customPath}
        onChange={(val) => updateConfig('path', val)}
        placeholder="user-signup"
        description="Unique endpoint path for external HTTP triggers."
      />

      {/* HTTP Method Selector */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          HTTP Method Allowed
        </label>
        <select
          value={method}
          onChange={(e) => updateConfig('method', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
        >
          <option value="ANY">ANY (All Methods)</option>
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Authentication Mode Selector */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Authentication Mode
        </label>
        <select
          value={authType}
          onChange={(e) => updateConfig('authType', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
        >
          <option value="none">None (Public Endpoint)</option>
          <option value="bearer">Bearer Token</option>
          <option value="apiKey">API Key (Query / Header)</option>
          <option value="secret">Custom Secret Header</option>
        </select>
      </div>

      {/* Auth Secret Key Input (if authType !== 'none') */}
      {authType !== 'none' && (
        <>
          <ExpressionInput
            label="Secret Key / Token"
            value={authSecret}
            onChange={(val) => updateConfig('authSecret', val)}
            placeholder="my_super_secret_token_123"
            description="Requests with invalid secret will return HTTP 401 Unauthorized."
            required
          />

          {(authType === 'secret' || authType === 'apiKey') && (
            <ExpressionInput
              label="Header Name"
              value={headerName}
              onChange={(val) => updateConfig('headerName', val)}
              placeholder="x-webhook-secret"
              description="Header key sent by the external website."
            />
          )}
        </>
      )}

      {/* Webhook Tester Section */}
      <WebhookTester identifier={customPath} />

      {/* Information Banner */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Webhook Expressions</span>
        </div>
        <p>Use variables in subsequent nodes like:</p>
        <code className="block font-mono text-blue-400 bg-slate-900 p-1.5 rounded border border-slate-800 mt-1">
          {"{{trigger.body.name}}"} or {"{{trigger.body.email}}"}
        </code>
      </div>
    </div>
  );
};
