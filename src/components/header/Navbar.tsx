import React from 'react';
import {
  ShieldAlert,
  PlayCircle,
  Key,
  Zap,
  Radio,
  Server
} from 'lucide-react';

interface NavbarProps {
  onOpenDemoWalkthrough: () => void;
  onOpenApiKeyModal: () => void;
  onOpenSnifferModal: () => void;
  hasCustomKey: boolean;
  totalProbesRun: number;
  environment: string;
  setEnvironment: (env: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemoWalkthrough,
  onOpenApiKeyModal,
  onOpenSnifferModal,
  hasCustomKey,
  totalProbesRun,
  environment,
  setEnvironment
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Track Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg font-mono">
                NEXORA<span className="text-cyan-400">.SENTINEL</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-300 uppercase">
                v1.1 STUDIO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
              Autonomous API Incident Triage & Contract Drift Intelligence
            </p>
          </div>
        </div>

        {/* Center Environment Selector & EurekaDEV Track Tag (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Environment Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-xs">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Cluster:</span>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="bg-transparent font-mono font-semibold text-cyan-300 border-none outline-none cursor-pointer text-xs"
            >
              <option value="Production Edge Gateway" className="bg-slate-900 text-slate-200">
                Production Edge Gateway
              </option>
              <option value="Staging K8s Cluster" className="bg-slate-900 text-slate-200">
                Staging K8s Cluster
              </option>
              <option value="Local Sandbox Engine" className="bg-slate-900 text-slate-200">
                Local Sandbox Engine
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">EurekaDEV 2026</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Coding Track</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* eBPF Passive Sniffer Trigger */}
          <button
            onClick={onOpenSnifferModal}
            title="Open eBPF Kernel Traffic Sniffer"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-purple-800/60 bg-purple-950/40 px-2.5 py-1.5 text-xs font-mono font-semibold text-purple-300 hover:border-purple-500 hover:text-white transition-all shadow-sm"
          >
            <Radio className="h-3.5 w-3.5 text-purple-400" />
            <span>eBPF Sniffer</span>
          </button>

          {/* Quick 4-Min Demo Walkthrough Guide */}
          <button
            onClick={onOpenDemoWalkthrough}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/50 hover:text-white shadow-sm"
          >
            <PlayCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span>Judge Guide</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure AI API Key"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {hasCustomKey ? 'Custom Key' : 'AI Active'}
            </span>
          </button>

          {/* Probes Counter Badge */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5 text-xs text-slate-400 font-mono">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>{totalProbesRun}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
