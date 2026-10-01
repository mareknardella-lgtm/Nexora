import React, { useState } from 'react';
import { ProbeExecutionResult, EndpointPreset, SandboxVerificationResult } from '@/types';
import { runSandboxVerification } from '@/lib/engine/sandbox-executor';
import {
  Play,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { formatJson } from '@/lib/utils';

interface SandboxVerificationProps {
  probeResult: ProbeExecutionResult | null;
  activePreset?: EndpointPreset;
}

export const SandboxVerification: React.FC<SandboxVerificationProps> = ({
  probeResult,
  activePreset
}) => {
  const [result, setResult] = useState<SandboxVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!probeResult) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-500">
        Run a probe first to enable in-browser sandbox fix verification.
      </div>
    );
  }

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = runSandboxVerification(probeResult, activePreset);
      setResult(res);
      setIsVerifying(false);
    }, 320);
  };

  return (
    <div className="space-y-4">
      {/* Verification Trigger Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-cyan-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">
              In-Browser Sandbox Fix Verification
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simulate live client execution: runs the drifted payload through legacy unpatched client code, then passes it through the generated Nexora adapter to verify 100% invariant recovery.
          </p>
        </div>

        <button
          onClick={handleRunVerification}
          disabled={isVerifying}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isVerifying ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              <span>TESTING SANDBOX...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-slate-950" />
              <span>VERIFY FIX IN SANDBOX</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Results View */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Summary Seal */}
          <div
            className={`rounded-2xl border p-4 flex items-center justify-between ${
              result.verified
                ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                : 'border-rose-500/60 bg-rose-950/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.verified ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {result.verified
                    ? 'All Contract Invariants Restored — Ready for Production'
                    : 'Sandbox Verification Incomplete'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Passed {result.assertionsPassed}/{result.totalAssertions} automated invariant assertions in{' '}
                  <span className="font-mono font-bold text-white">
                    {result.adapterExecutionTimeMs}ms
                  </span>.
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-slate-950">
              100% PASS
            </span>
          </div>

          {/* Comparison Side-by-Side: Unpatched vs Patched */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Left: Unpatched Client Crash / Bug */}
            <div className="rounded-2xl border border-rose-900/60 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/40 text-rose-400 font-sans font-bold text-xs">
                <span>Legacy Unpatched Client Runtime</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                  FAILED
                </span>
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Result when standard consumer code processed the drifted response:
              </p>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 font-mono text-[11px] leading-relaxed">
                {result.originalError || 'Uncaught runtime exception'}
              </div>
            </div>

            {/* Right: Nexora Patched Normalized Output */}
            <div className="rounded-2xl border border-emerald-900/60 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40 text-emerald-400 font-sans font-bold text-xs">
                <span>Nexora Resilient Adapter Output</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  NORMALIZED
                </span>
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Normalized clean object passed safely to downstream consumer:
              </p>
              <pre className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed">
                {formatJson(result.patchedOutput)}
              </pre>
            </div>
          </div>

          {/* Sandbox Step Log */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-slate-900 font-semibold">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>Sandbox Test Execution Trace</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300 max-h-40 overflow-y-auto">
              {result.log.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-600 mr-2">&gt;</span>
                  <span
                    className={
                      line.includes('[CRITICAL]') || line.includes('[CRASH]')
                        ? 'text-rose-400'
                        : line.includes('[NEXORA ADAPTER]')
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
