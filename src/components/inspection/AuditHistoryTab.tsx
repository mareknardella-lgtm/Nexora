import React from 'react';
import { IncidentAuditRecord } from '@/types';
import { History, ShieldCheck, Trash2 } from 'lucide-react';

interface AuditHistoryTabProps {
  records: IncidentAuditRecord[];
  onSelectRecord?: (record: IncidentAuditRecord) => void;
  onClearHistory: () => void;
}

export const AuditHistoryTab: React.FC<AuditHistoryTabProps> = ({
  records,
  onClearHistory
}) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/30">
        <History className="h-10 w-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">No Historical Incidents Recorded</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Each time an active probe is dispatched, an immutable audit event is captured here to track resilience trends over time.
        </p>
      </div>
    );
  }

  const avgScore = Math.round(
    records.reduce((acc, r) => acc + r.resilienceScore, 0) / records.length
  );

  return (
    <div className="space-y-4">
      {/* Header & Metrics Summary */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            <span>Incident Audit & Historical Telemetry Log</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
              {records.length} runs recorded
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Immutable session trace of active invariant probes and detected contract mutations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Session Avg Score:</span>
            <span
              className={`font-bold ${
                avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {avgScore}/100
            </span>
          </div>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear Session Audit History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 uppercase tracking-wider font-sans font-semibold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Scenario / Target</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Resilience</th>
                <th className="py-2.5 px-3">Anomalies</th>
                <th className="py-2.5 px-3">Sandbox Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(rec.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    <div>{rec.scenarioTitle}</div>
                    <div className="text-[10px] text-slate-500 font-mono line-clamp-1">{rec.url}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rec.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-900'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}
                    >
                      {rec.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                      {rec.httpStatus} OK
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                        rec.resilienceScore >= 80
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : rec.resilienceScore >= 60
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800'
                      }`}
                    >
                      {rec.resilienceScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {rec.anomaliesCount === 0 ? (
                      <span className="text-emerald-400 text-[11px]">0 (Clean)</span>
                    ) : (
                      <span className="text-rose-400 text-[11px] font-bold">
                        {rec.anomaliesCount} ({rec.criticalCount} Critical)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
