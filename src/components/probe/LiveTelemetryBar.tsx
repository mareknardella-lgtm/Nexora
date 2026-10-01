import React, { useState } from 'react';
import { ProbeExecutionResult } from '@/types';
import {
  AlertOctagon,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

interface LiveTelemetryBarProps {
  probeResult: ProbeExecutionResult | null;
  isProbing: boolean;
}

export const LiveTelemetryBar: React.FC<LiveTelemetryBarProps> = ({ probeResult, isProbing }) => {
  const [showLog, setShowLog] = useState(false);

  if (isProbing) {
    return (
      <div className="rounded-2xl border border-cyan-800/50 bg-slate-900/60 p-4 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono text-cyan-300">
            Dispatching probe & executing synthetic invariant fuzzing...
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">Measuring TTFB & AST differences</div>
      </div>
    );
  }

  if (!probeResult) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 text-center">
        <p className="text-xs text-slate-500 font-mono">
          Ready for probe. Select a scenario above or click &quot;DISPATCH PROBE&quot; to execute contract analysis.
        </p>
      </div>
    );
  }

  const criticalCount = probeResult.anomalies.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = probeResult.anomalies.filter((a) => a.severity === 'HIGH').length;

  const scoreColor =
    probeResult.resilienceScore >= 90
      ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'
      : probeResult.resilienceScore >= 60
      ? 'text-amber-400 border-amber-500/50 bg-amber-950/40'
      : 'text-rose-400 border-rose-500/50 bg-rose-950/40';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Metric 1: Status Code */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded-lg border font-bold ${
              probeResult.httpStatus >= 200 && probeResult.httpStatus < 300
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
          >
            {probeResult.httpStatus} {probeResult.httpStatus === 200 ? 'OK' : 'FAIL'}
          </span>
        </div>

        {/* Metric 2: Latency */}
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Latency:</span>
          <span className="font-mono text-xs font-semibold text-slate-200">
            {probeResult.latencyMs}ms
          </span>
        </div>

        {/* Metric 3: Anomalies */}
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-xs text-slate-400">Drift Anomalies:</span>
          <span className="font-mono text-xs font-bold text-rose-400">
            {probeResult.anomalies.length}
          </span>
          {criticalCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 rounded border border-rose-800">
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 rounded border border-amber-800">
              {highCount} High
            </span>
          )}
        </div>

        {/* Metric 4: Resilience Score Gauge */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-medium">Resilience Score:</span>
          <div className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-sm ${scoreColor}`}>
            {probeResult.resilienceScore}/100
          </div>
        </div>

        {/* Toggle Live Fuzzing Logs */}
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>{showLog ? 'Hide Telemetry Log' : 'View Telemetry Log'}</span>
          {showLog ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Collapsible Telemetry / Fuzzing Log */}
      {showLog && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-slate-500 pb-1 border-b border-slate-900">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span>Telemetry & Fuzzing Pipeline Log</span>
          </div>
          {probeResult.fuzzingLog.map((line, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-slate-600 mr-2">&gt;</span>
              <span
                className={
                  line.includes('[FUZZER]')
                    ? 'text-orange-400'
                    : line.includes('anomal')
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }
              >
                {line}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
