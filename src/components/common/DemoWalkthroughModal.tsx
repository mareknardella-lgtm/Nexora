import React, { useState } from 'react';
import { X, Play, ArrowRight, ShieldCheck, CheckCircle2, Flame, Brain, Code2 } from 'lucide-react';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPresetAndRun: (presetId: string) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onSelectPresetAndRun
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: '0:00 - 0:30 • The Problem',
      title: 'Silent API Drift & The Chaos of Production Breakages',
      description:
        'Modern cloud backends integrate dozens of external APIs and internal microservices. When upstream services update without bumping major versions, payloads silently drift: status 200 OK masking errors, integer cents mutating from dollar floats, or fields getting nested. Linters only check static files, and production crashes cost engineering teams hours of emergency triage.',
      highlight:
        'Nexora Sentinel actively probes endpoints, tests contract invariants, and automatically generates verified client adapters.',
      icon: <ShieldCheck className="h-6 w-6 text-rose-400" />
    },
    {
      badge: '0:30 - 1:15 • The Solution & Invariant Probing',
      title: 'Active Invariant Probes & Synthetic Fuzzing',
      description:
        'Instead of waiting for customer bug reports, Nexora Sentinel dispatches synthetic probes against declared contracts. It mutates boundaries—injecting nulls, coercing numbers to strings, and testing namespaced enums—measuring network latency and AST schema variance in real time.',
      highlight:
        'Catches subtle semantic mutations that standard JSON schema validators allow because they are technically "valid numbers".',
      icon: <Flame className="h-6 w-6 text-orange-400" />
    },
    {
      badge: '1:15 - 2:30 • AI Semantic Root Cause',
      title: 'Non-Hallucinatory AI Diagnostic Loop',
      description:
        'Nexora combines deterministic JSON schema validation with an intelligent semantic reasoning engine. It explains WHY the breakage occurred, pinpoints the affected architectural components (e.g. checkout modal, billing engine), and grades the risk with an objective resilience score.',
      highlight:
        'Structured outputs with verified confidence scores—no generic text generation.',
      icon: <Brain className="h-6 w-6 text-cyan-400" />
    },
    {
      badge: '2:30 - 3:30 • Autonomous Remediation',
      title: 'Synthesized TypeScript Adapters & OpenAPI Patches',
      description:
        'Nexora writes the fix for you. In seconds, it produces a dual-mode TypeScript adapter that seamlessly handles both old and new payload formats, emits an RFC-compliant OpenAPI 3.1 JSON Patch, and generates an executable Vitest contract regression suite.',
      highlight:
        'Zero manual copy-pasting required: ready to export or commit directly to git.',
      icon: <Code2 className="h-6 w-6 text-emerald-400" />
    },
    {
      badge: '3:30 - 4:00 • In-Browser Sandbox Verification',
      title: '1-Click Proof in the Browser Sandbox',
      description:
        'The judge or developer clicks "VERIFY FIX IN SANDBOX". Nexora passes the drifted payload through legacy unpatched code (displaying the exact crash/miscalculation), then passes it through the generated adapter—proving all contract assertions pass in 2 milliseconds!',
      highlight:
        'Irrefutable, demonstrable proof of value within 4 minutes.',
      icon: <CheckCircle2 className="h-6 w-6 text-blue-400" />
    }
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/60">
              {step.badge}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
              {step.icon}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-3.5 text-xs text-cyan-200 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{step.highlight}</span>
          </div>
        </div>

        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-900">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Previous
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onSelectPresetAndRun('stripe-payment-intent-drift');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Launch Live Demo Workflow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
