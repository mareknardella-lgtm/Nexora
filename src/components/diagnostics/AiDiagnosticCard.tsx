import React from 'react';
import { AiDiagnosticReport } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  TrendingDown,
  ArrowRight,
  Brain
} from 'lucide-react';

interface AiDiagnosticCardProps {
  report: AiDiagnosticReport | null;
  isLoading: boolean;
}

export const AiDiagnosticCard: React.FC<AiDiagnosticCardProps> = ({ report, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-cyan-800/40 bg-slate-900/40 p-8 text-center space-y-3 animate-pulse">
        <Brain className="h-8 w-8 text-cyan-400 mx-auto animate-bounce" />
        <h4 className="text-sm font-semibold text-slate-200">
          Synthesizing AI Semantic Root Cause & Impact Assessment...
        </h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Correlating detected AST schema anomalies with upstream release patterns and business logic invariants.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">AI Diagnostic Idle</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Run a probe to trigger automated AI root cause diagnosis and impact assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Root Cause Box */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/70 to-blue-950/20 p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800/80">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              AI Root-Cause Diagnosis
            </span>
          </div>

          {/* Confidence Meter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">Confidence:</span>
            <span className="text-emerald-400 font-bold">
              {(report.confidenceScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-100 leading-snug">
          {report.rootCause}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          {report.summary}
        </p>

        {/* Suggested Action Bar */}
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30 p-3 flex items-start gap-2.5 text-xs text-cyan-200">
          <ArrowRight className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Recommended Remediation: </span>
            <span>{report.suggestedAction}</span>
          </div>
        </div>
      </div>

      {/* Grid: Affected Components & Business Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Affected Components */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-mono">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Affected Architectural Components</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {report.affectedComponents.map((comp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <span className="font-mono text-slate-300">{comp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Business Impact */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-mono">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <span>Quantified Business & User Impact</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.businessImpact}
          </p>
        </div>
      </div>

      {/* Technical Depth Rationale */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-semibold font-mono">
          <Cpu className="h-3.5 w-3.5 text-purple-400" />
          <span>Why Static Schema Validation Missed This (AI Depth Rationale):</span>
        </div>
        <p className="leading-relaxed pl-5 border-l-2 border-purple-500/40 text-slate-300">
          {report.technicalDepth}
        </p>
      </div>
    </div>
  );
};
