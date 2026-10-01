import React, { useState } from 'react';
import { HttpMethod, FuzzingOptions, EndpointPreset } from '@/types';
import { FuzzingController } from './FuzzingController';
import { Play, Loader2, Code2, Globe, FileJson, Settings2 } from 'lucide-react';
import { formatJson } from '@/lib/utils';

interface EndpointConfigPanelProps {
  method: HttpMethod;
  setMethod: (method: HttpMethod) => void;
  url: string;
  setUrl: (url: string) => void;
  expectedSchema: Record<string, any>;
  setExpectedSchema: (schema: Record<string, any>) => void;
  headers: Record<string, string>;
  setHeaders: (headers: Record<string, string>) => void;
  customPayload: any;
  setCustomPayload: (payload: any) => void;
  fuzzing: FuzzingOptions;
  setFuzzing: (options: FuzzingOptions) => void;
  onDispatchProbe: () => void;
  isProbing: boolean;
  activePreset?: EndpointPreset;
}

export const EndpointConfigPanel: React.FC<EndpointConfigPanelProps> = ({
  method,
  setMethod,
  url,
  setUrl,
  expectedSchema,
  setExpectedSchema,
  headers,
  setHeaders,
  customPayload,
  setCustomPayload,
  fuzzing,
  setFuzzing,
  onDispatchProbe,
  isProbing,
  activePreset: _activePreset
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'headers' | 'payload'>('schema');
  const [schemaText, setSchemaText] = useState(formatJson(expectedSchema));
  const [payloadText, setPayloadText] = useState(formatJson(customPayload || {}));
  const [headersText, setHeadersText] = useState(formatJson(headers));
  const [jsonError, setJsonError] = useState<string | null>(null);


  const handleHeadersChange = (text: string) => {
    setHeadersText(text);
    try {
      const parsed = JSON.parse(text);
      setHeaders(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Invalid Headers JSON: ${e.message}`);
    }
  };

  const handleSchemaChange = (text: string) => {
    setSchemaText(text);
    try {
      const parsed = JSON.parse(text);
      setExpectedSchema(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Invalid Schema JSON: ${e.message}`);
    }
  };

  const handlePayloadChange = (text: string) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setCustomPayload(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Invalid Payload JSON: ${e.message}`);
    }
  };

  const methodColors: Record<HttpMethod, string> = {
    GET: 'bg-blue-950/80 text-blue-400 border-blue-800',
    POST: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    PUT: 'bg-amber-950/80 text-amber-400 border-amber-800',
    DELETE: 'bg-rose-950/80 text-rose-400 border-rose-800',
    PATCH: 'bg-purple-950/80 text-purple-400 border-purple-800'
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Target URL Bar */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            Target Endpoint Contract URL
          </span>
          <span className="text-[11px] text-slate-400 lowercase font-sans">
            (Probes active runtime response against schema)
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {/* Method selector */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer bg-slate-900 ${methodColors[method]}`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          {/* URL input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.domain.com/v1/resource"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          {/* Run Probe CTA */}
          <button
            onClick={onDispatchProbe}
            disabled={isProbing}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isProbing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>PROBING...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>DISPATCH PROBE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs: Schema / Headers / Payload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'schema'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Declared Contract (OpenAPI / JSON Schema)</span>
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'headers'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>HTTP Headers</span>
            </button>
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <button
                onClick={() => setActiveTab('payload')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'payload'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileJson className="h-3.5 w-3.5" />
                <span>Request Payload</span>
              </button>
            )}
          </div>

          {jsonError && <span className="text-[11px] text-rose-400 font-mono">{jsonError}</span>}
        </div>

        {/* Tab Content */}
        {activeTab === 'schema' && (
          <textarea
            value={schemaText}
            onChange={(e) => handleSchemaChange(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Paste OpenAPI 3.x schema or JSON Schema here..."
          />
        )}

        {activeTab === 'headers' && (
          <textarea
            value={headersText}
            onChange={(e) => handleHeadersChange(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder='{"Authorization": "Bearer ...", "Content-Type": "application/json"}'
          />
        )}

        {activeTab === 'payload' && (
          <textarea
            value={payloadText}
            onChange={(e) => handlePayloadChange(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder='{"key": "value"}'
          />
        )}
      </div>

      {/* Synthetic Chaos & Fuzzing Knob */}
      <FuzzingController options={fuzzing} onChange={setFuzzing} />
    </div>
  );
};
