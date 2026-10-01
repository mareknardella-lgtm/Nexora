import React, { useState } from 'react';
import { ProbeExecutionResult } from '@/types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  Copy,
  Check,
  Code,
  FileJson
} from 'lucide-react';
import { formatJson } from '@/lib/utils';

interface DriftInspectionTabProps {
  probeResult: ProbeExecutionResult | null;
}

export const DriftInspectionTab: React.FC<DriftInspectionTabProps> = ({ probeResult }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'raw'>('cards');

  if (!probeResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/30">
        <AlertOctagon className="h-10 w-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">No Probe Telemetry Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Click &quot;DISPATCH PROBE&quot; on the left to trigger real-time contract drift inspection and synthetic fuzzing.
        </p>
      </div>
    );
  }

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(formatJson(probeResult.responsePayload));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800 animate-pulse">
            <AlertOctagon className="h-3 w-3" />
            CRITICAL BREAKING
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="h-3 w-3" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-950/80 text-yellow-400 border border-yellow-800">
            <Info className="h-3 w-3" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Toggle Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Contract Drift Invariant Violations</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-400">
              {probeResult.anomalies.length} detected
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Differences between declared OpenAPI/JSON schema and actual runtime response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'raw' : 'cards')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {viewMode === 'cards' ? (
              <>
                <FileJson className="h-3.5 w-3.5" />
                <span>View Raw JSON</span>
              </>
            ) : (
              <>
                <Code className="h-3.5 w-3.5" />
                <span>View Anomaly Cards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raw JSON View */}
      {viewMode === 'raw' ? (
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-900 text-xs font-mono text-slate-400">
            <span>Live Response Payload from Gateway</span>
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
            {formatJson(probeResult.responsePayload)}
          </pre>
        </div>
      ) : (
        /* Anomaly Cards List */
        <div className="space-y-3">
          {probeResult.anomalies.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 text-xs">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-200">100% Contract Compliance</p>
                <p className="text-emerald-400/80">
                  No schema drift, type coercions, or invariant anomalies detected on this endpoint.
                </p>
              </div>
            </div>
          ) : (
            probeResult.anomalies.map((anomaly, idx) => (
              <div
                key={anomaly.id || idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(anomaly.severity)}
                    <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {anomaly.path}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">[{anomaly.type}]</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {anomaly.message}
                </p>

                {/* Expected vs Actual Diff Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-emerald-300">
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider block font-sans font-bold mb-1">
                      Expected per Contract:
                    </span>
                    <span className="break-all">{String(anomaly.expected)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300">
                    <span className="text-[10px] text-rose-500 uppercase tracking-wider block font-sans font-bold mb-1">
                      Actual Received from Server:
                    </span>
                    <span className="break-all">{String(anomaly.actual)}</span>
                  </div>
                </div>

                {/* Impact Statement */}
                <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-2">
                  <span className="text-slate-300 font-semibold shrink-0">Client Impact:</span>
                  <span className="text-slate-400">{anomaly.impact}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
