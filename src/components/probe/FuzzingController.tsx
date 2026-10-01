import React from 'react';
import { FuzzingOptions } from '@/types';
import { Flame, Clock, Hash, ShieldAlert, Sparkles } from 'lucide-react';

interface FuzzingControllerProps {
  options: FuzzingOptions;
  onChange: (options: FuzzingOptions) => void;
}

export const FuzzingController: React.FC<FuzzingControllerProps> = ({ options, onChange }) => {
  const toggle = (key: keyof Omit<FuzzingOptions, 'simulateLatencyMs'>) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Synthetic Invariant Fuzzing & Chaos Engine
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Actively perturb payload boundaries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Type Coercion Fuzzer */}
        <button
          type="button"
          onClick={() => toggle('injectTypeCoercion')}
          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
            options.injectTypeCoercion
              ? 'border-orange-500/60 bg-orange-950/30 text-orange-200'
              : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Type Coercion</span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${
              options.injectTypeCoercion ? 'bg-orange-400 shadow-sm shadow-orange-400' : 'bg-slate-700'
            }`}
          />
        </button>

        {/* Nullability Guard Probe */}
        <button
          type="button"
          onClick={() => toggle('injectNulls')}
          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
            options.injectNulls
              ? 'border-purple-500/60 bg-purple-950/30 text-purple-200'
              : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Null Injection</span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${
              options.injectNulls ? 'bg-purple-400 shadow-sm shadow-purple-400' : 'bg-slate-700'
            }`}
          />
        </button>

        {/* Shadow Field Probe */}
        <button
          type="button"
          onClick={() => toggle('injectUnexpectedFields')}
          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
            options.injectUnexpectedFields
              ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200'
              : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Shadow Keys</span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${
              options.injectUnexpectedFields ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-700'
            }`}
          />
        </button>
      </div>

      {/* Latency Simulator Slider */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-900">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>Simulated Jitter / Network Latency:</span>
          <span className="font-mono text-cyan-400 font-semibold">{options.simulateLatencyMs}ms</span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="25"
          value={options.simulateLatencyMs}
          onChange={(e) =>
            onChange({
              ...options,
              simulateLatencyMs: Number(e.target.value)
            })
          }
          className="w-36 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
