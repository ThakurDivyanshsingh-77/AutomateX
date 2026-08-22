import React, { useState } from 'react';
import { Terminal, Code, Copy, Check, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/workflows/trigger/:workflowId',
    name: 'Trigger Workflow via Webhook',
    desc: 'Triggers an instantaneous execution of a published workflow with a JSON payload.',
    params: [
      { name: 'workflowId', type: 'string', required: true, desc: 'Unique UUID of the target workflow' }
    ],
    curl: `curl -X POST https://api.automatex.dev/v1/workflows/trigger/wf_883012 \\
  -H "Authorization: Bearer ax_live_99214a8" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "order.completed",
    "amount": 299.00,
    "customer": { "email": "dev@acme.ai" }
  }'`,
    js: `const response = await fetch('https://api.automatex.dev/v1/workflows/trigger/wf_883012', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ax_live_99214a8',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event: 'order.completed',
    amount: 299.00,
    customer: { email: 'dev@acme.ai' }
  })
});
const data = await response.json();
console.log('Execution ID:', data.executionId);`,
    python: `import requests

url = "https://api.automatex.dev/v1/workflows/trigger/wf_883012"
headers = {
    "Authorization": "Bearer ax_live_99214a8",
    "Content-Type": "application/json"
}
payload = {
    "event": "order.completed",
    "amount": 299.00,
    "customer": {"email": "dev@acme.ai"}
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    response: `{
  "success": true,
  "executionId": "exec_990142",
  "status": "QUEUED",
  "queuedAt": "2026-08-22T10:30:00Z"
}`
  },
  {
    method: 'GET',
    path: '/api/v1/executions/:executionId',
    name: 'Get Execution Status & Logs',
    desc: 'Retrieve real-time step outputs, error traces, and duration metrics for an execution.',
    params: [
      { name: 'executionId', type: 'string', required: true, desc: 'ID returned by trigger API' }
    ],
    curl: `curl -X GET https://api.automatex.dev/v1/executions/exec_990142 \\
  -H "Authorization: Bearer ax_live_99214a8"`,
    js: `const res = await fetch('https://api.automatex.dev/v1/executions/exec_990142', {
  headers: { 'Authorization': 'Bearer ax_live_99214a8' }
});
const status = await res.json();`,
    python: `import requests
res = requests.get('https://api.automatex.dev/v1/executions/exec_990142', 
                   headers={'Authorization': 'Bearer ax_live_99214a8'})
print(res.json())`,
    response: `{
  "executionId": "exec_990142",
  "status": "COMPLETED",
  "durationMs": 142,
  "stepsCompleted": 4,
  "errors": []
}`
  },
  {
    method: 'POST',
    path: '/api/v1/ai/synthesize',
    name: 'Synthesize Workflow Graph via AI',
    desc: 'Programmatically convert natural language into a validated JSON workflow node definition.',
    params: [
      { name: 'prompt', type: 'string', required: true, desc: 'Natural language description of the workflow' }
    ],
    curl: `curl -X POST https://api.automatex.dev/v1/ai/synthesize \\
  -H "Authorization: Bearer ax_live_99214a8" \\
  -H "Content-Type: application/json" \\
  -d '{ "prompt": "When Stripe payment fails, send Slack alert and retry 3 times" }'`,
    js: `const res = await fetch('https://api.automatex.dev/v1/ai/synthesize', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ax_live_99214a8', 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'When Stripe payment fails, send Slack alert and retry 3 times' })
});`,
    python: `import requests
res = requests.post('https://api.automatex.dev/v1/ai/synthesize', 
                    json={'prompt': 'When Stripe payment fails, send Slack alert'},
                    headers={'Authorization': 'Bearer ax_live_99214a8'})`,
    response: `{
  "workflow": {
    "name": "Stripe Failure Alert & Retry",
    "nodesCount": 3,
    "nodes": [ ... ]
  }
}`
  }
];

export function ApiReferencePage() {
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [lang, setLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const ep = ENDPOINTS[activeEndpoint];
  const codeSnippet = ep[lang];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success('Snippet copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 md:py-16 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Terminal className="w-3.5 h-3.5" /> REST API v1
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink mb-4" style={{ color: '#1A1012' }}>
          AutomateX API Reference
        </h1>
        <p className="text-base sm:text-lg text-ink-body" style={{ color: '#5C5050' }}>
          Trigger workflows, poll execution state, and synthesize pipelines programmatically from any backend application.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left endpoint list */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 px-3 mb-2">Available Endpoints</div>
          {ENDPOINTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveEndpoint(idx)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                activeEndpoint === idx
                  ? 'border-orange-500 bg-white shadow-xs'
                  : 'border-cream-border bg-cream-soft hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                  item.method === 'POST' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.method}
                </span>
                <span className="font-mono text-xs font-semibold text-ink truncate">{item.path}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{item.name}</p>
            </button>
          ))}
        </div>

        {/* Right Code & Response Explorer */}
        <div className="lg:col-span-8 bg-white border border-cream-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                  ep.method === 'POST' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-ink">{ep.path}</span>
              </div>
              <h3 className="text-xl font-bold text-ink mt-2">{ep.name}</h3>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-cream-soft p-1 rounded-xl border border-cream-border">
              {['curl', 'js', 'python'].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                    lang === l ? 'bg-ink text-white' : 'text-gray-600 hover:text-ink'
                  }`}
                >
                  {l === 'js' ? 'JavaScript' : l}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-ink-body mb-6">{ep.desc}</p>

          {/* Code Viewer */}
          <div className="rounded-2xl bg-ink text-white p-5 border border-white/10 mb-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-mono text-gray-400">Request Example</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/10 px-2.5 py-1 rounded-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs text-orange-200 overflow-x-auto leading-relaxed">
              <code>{codeSnippet}</code>
            </pre>
          </div>

          {/* Response Payload */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Response (200 OK)</div>
            <div className="rounded-2xl bg-gray-900 text-emerald-400 p-4 font-mono text-xs overflow-x-auto border border-gray-800">
              <pre><code>{ep.response}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiReferencePage;
