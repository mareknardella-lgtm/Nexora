import React from 'react';
import {
  ShieldAlert,
  PlayCircle,
  Key,
  Radio,
  Server,
  Volume2,
  VolumeX,
  Flame,
  BarChart2,
  Layers,
  FileText
} from 'lucide-react';
import { playTick } from '@/lib/sound';

interface NavbarProps {
  onOpenDemoWalkthrough: () => void;
  onOpenApiKeyModal: () => void;
  onOpenSnifferModal: () => void;
  onOpenTrapModal: () => void;
  onOpenBenchmarksModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenDossierModal: () => void;
  hasCustomKey: boolean;
  totalProbesRun: number;
  environment: string;
  setEnvironment: (env: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemoWalkthrough,
  onOpenApiKeyModal,
  onOpenSnifferModal,
  onOpenTrapModal,
  onOpenBenchmarksModal,
  onOpenArchitectureModal,
  onOpenDossierModal,
  hasCustomKey,
  totalProbesRun,
  environment,
  setEnvironment,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand & Track Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 shrink-0">
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
                v2.0 PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
              Autonomous API Incident Triage & Contract Drift Intelligence
            </p>
          </div>
        </div>

        {/* Center Environment Selector & EurekaDEV Track Tag (Desktop) */}
        <div className="hidden xl:flex items-center gap-3">
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
            {totalProbesRun > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 font-mono text-[11px] font-bold">{totalProbesRun} probed</span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trap Lab Trigger */}
          <button
            onClick={() => {
              playTick();
              onOpenTrapModal();
            }}
            title="Open Invariant Traps Lab"
            className="flex items-center gap-1 rounded-xl border border-orange-800/60 bg-orange-950/40 px-2 py-1.5 text-xs font-mono font-semibold text-orange-300 hover:border-orange-500 hover:text-white transition-all shadow-sm"
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="hidden md:inline">Trap Lab</span>
          </button>

          {/* Benchmarks Trigger */}
          <button
            onClick={() => {
              playTick();
              onOpenBenchmarksModal();
            }}
            title="Open Empirical Benchmarks"
            className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5 text-xs font-mono text-slate-300 hover:border-slate-700 hover:text-white transition-all"
          >
            <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Benchmarks</span>
          </button>

          {/* Architecture Drawer Trigger */}
          <button
            onClick={() => {
              playTick();
              onOpenArchitectureModal();
            }}
            title="View Technical Architecture"
            className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5 text-xs font-mono text-slate-300 hover:border-slate-700 hover:text-white transition-all"
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Architecture</span>
          </button>

          {/* Certified Dossier Trigger */}
          <button
            onClick={() => {
              playTick();
              onOpenDossierModal();
            }}
            title="Export Certified Audit Dossier"
            className="flex items-center gap-1 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-2 py-1.5 text-xs font-mono font-semibold text-emerald-300 hover:border-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* eBPF Passive Sniffer Trigger */}
          <button
            onClick={() => {
              playTick();
              onOpenSnifferModal();
            }}
            title="Open eBPF Kernel Traffic Sniffer"
            className="hidden sm:flex items-center gap-1 rounded-xl border border-purple-800/60 bg-purple-950/40 px-2 py-1.5 text-xs font-mono font-semibold text-purple-300 hover:border-purple-500 hover:text-white transition-all shadow-sm"
          >
            <Radio className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden lg:inline">eBPF</span>
          </button>

          {/* Quick 4-Min Demo Walkthrough Guide */}
          <button
            onClick={() => {
              playTick();
              onOpenDemoWalkthrough();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/50 hover:text-white shadow-sm"
          >
            <PlayCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Judge Guide</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Procedural Sound' : 'Enable Procedural Sound'}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-cyan-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => {
              playTick();
              onOpenApiKeyModal();
            }}
            title="Configure AI API Key"
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden xl:inline">
              {hasCustomKey ? 'Custom Key' : 'AI Active'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
