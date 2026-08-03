import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

export const WebhookTester = ({ identifier }) => {
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({ name: 'Divyansh', email: 'divyansh@gmail.com' }, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState(null);

  const handleSendTestPayload = async () => {
    setLoading(true);
    setResponseLog(null);

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(testPayload);
      } catch {
        toast.error('Invalid JSON payload');
        setLoading(false);
        return;
      }

      const res = await api.post(`/webhooks/${identifier}/test`, parsedBody);
      setResponseLog(res.data);
      toast.success('Test payload sent & workflow triggered!');
    } catch (err) {
      const errRes = err.response?.data || { message: err.message };
      setResponseLog(errRes);
      toast.error(errRes.message || 'Test trigger failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 font-sans border-t border-slate-800 pt-4">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Test Webhook Payload
        </label>
        <span className="text-[10px] font-mono text-blue-400">JSON Format</span>
      </div>

      <textarea
        rows={4}
        value={testPayload}
        onChange={(e) => setTestPayload(e.target.value)}
        placeholder='{ "name": "Divyansh", "email": "divyansh@gmail.com" }'
        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
      />

      <button
        type="button"
        onClick={handleSendTestPayload}
        disabled={loading}
        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        {loading ? 'Sending Payload...' : 'Send Test Payload'}
      </button>

      {/* Response Log Preview */}
      {responseLog && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-blue-400" /> Response Log
            </span>
            {responseLog.success ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 202 Accepted
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            )}
          </div>
          <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded-lg text-[10px]">
            {JSON.stringify(responseLog, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
