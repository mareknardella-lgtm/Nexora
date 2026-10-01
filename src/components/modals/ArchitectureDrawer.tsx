import React, { useEffect } from 'react';
import { X, Layers, Lock } from 'lucide-react';
import { playTick } from '@/lib/sound';

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDrawer: React.FC<ArchitectureDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-950 border-l border-slate-800 p-6 sm:p-8 space-y-6 overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">System Architecture</h3>
                <p className="text-xs text-slate-400">Dual-Engine Invariant Verification Pipeline</p>
              </div>
            </div>

            <button
              onClick={() => {
                playTick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Architecture Pipeline Stages */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">
              5-Stage Verification Pipeline
            </h4>

            {/* Stage 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stage 1: Active Probe & Telemetry</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  HTTP Client
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dispatches HTTP requests directly from the client or through a server-side proxy route, measuring DNS resolution, TTFB, round-trip latency, and response headers.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stage 2: Synthetic Invariant Chaos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                  Chaos Fuzzer
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Perturbs boundary conditions in real time: type coercion (numbers to strings), null injection into optional fields, unexpected shadow field injection, and simulated network jitter.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stage 3: Deterministic AST Validator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  AST Schema Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Validates runtime response payloads against declared OpenAPI 3.1 specifications. Flags missing required properties, type mismatches, enum violations, and status code anti-patterns.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stage 4: AI Semantic Reasoning Loop</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Non-Hallucinatory LLM
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests structural AST diffs and evaluates business logic invariants (e.g. currency order-of-magnitude scale shifts, claim renaming). Computes objective Resilience Score (0–100).
              </p>
            </div>

            {/* Stage 5 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">Stage 5: Autonomous Sandbox Verification</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Execution Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthesizes backward-compatible TypeScript & Python client adapters and RFC 6902 OpenAPI patches. Executes automated invariant assertions in an isolated browser sandbox with &lt;2ms proof.
              </p>
            </div>
          </div>

          {/* Mathematical Invariant Guarantees */}
          <div className="space-y-3 pt-2 border-t border-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400">
              Guaranteed Contract Invariants
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-cyan-400 font-bold mb-0.5">I1: Currency Scale Invariant</div>
                <div>AmountDollars * 100 === AmountCents</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-purple-400 font-bold mb-0.5">I2: Null Safety Invariant</div>
                <div>&forall; prop &isin; RequiredClaims: prop &ne; undefined &and; prop &ne; null</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-rose-400 font-bold mb-0.5">I3: Status Purity Invariant</div>
                <div>Payload.isError === true &rArr; HttpStatus &ge; 400</div>
              </div>
            </div>
          </div>

          {/* Security Model */}
          <div className="rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono">
              <Lock className="h-4 w-4" />
              <span>Zero-Trust Security & Privacy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Nexora Sentinel requires zero cloud API keys to evaluate. The built-in deterministic AST engine runs 100% locally in your browser. Any custom API keys provided are stored strictly in client memory and are never transmitted to external telemetry servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
