import React from 'react';
import {
  ShieldAlert,
  PlayCircle,
  Key,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onOpenDemoWalkthrough: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
  totalProbesRun: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemoWalkthrough,
  onOpenApiKeyModal,
  hasCustomKey,
  totalProbesRun
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Track Badge */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg font-mono">
                NEXORA<span className="text-cyan-400">.SENTINEL</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-300 uppercase">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous API Incident Triage & Contract Drift Intelligence
            </p>
          </div>
        </div>

        {/* Hackathon Track Tag (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          <span className="font-medium text-slate-200">EurekaDEV 2026</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Coding Track (Computer Science + AI)</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick 4-Min Demo Walkthrough Guide */}
          <button
            onClick={onOpenDemoWalkthrough}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/50 hover:text-white"
          >
            <PlayCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Judge Demo Guide</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure AI API Key"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {hasCustomKey ? 'API Key Active' : 'AI Engine (Built-in)'}
            </span>
          </button>

          {/* Probes Counter Badge */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 text-xs text-slate-400">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>{totalProbesRun} probes</span>
          </div>
        </div>
      </div>
    </header>
  );
};
