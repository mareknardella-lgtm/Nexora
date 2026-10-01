import React from 'react';
import { EndpointPreset } from '@/types';
import { INCIDENT_PRESETS } from '@/lib/scenarios/incident-presets';
import { CreditCard, KeyRound, ServerCrash, Truck, Sliders, AlertTriangle } from 'lucide-react';

interface ScenarioSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: EndpointPreset) => void;
  onSelectCustom: () => void;
  isCustom: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  onSelectCustom,
  isCustom
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'stripe-payment-intent-drift':
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case 'auth0-user-profile-deletion':
        return <KeyRound className="h-4 w-4 text-blue-400" />;
      case 'gateway-silent-200-failure':
        return <ServerCrash className="h-4 w-4 text-rose-400" />;
      case 'logistics-coordinate-drift':
        return <Truck className="h-4 w-4 text-amber-400" />;
      default:
        return <Sliders className="h-4 w-4 text-cyan-400" />;
    }
  };

  const currentPreset = INCIDENT_PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="w-full space-y-3">
      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {INCIDENT_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id && !isCustom;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-900/20 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                  {getIcon(preset.id)}
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    preset.incidentCategory === 'Fintech Payment'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                      : preset.incidentCategory === 'Identity & Auth'
                      ? 'bg-blue-950/70 text-blue-400 border border-blue-800/50'
                      : preset.incidentCategory === 'Microservice Gateway'
                      ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                      : 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                  }`}
                >
                  {preset.badge}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {preset.service}
              </p>
            </button>
          );
        })}

        {/* Custom Target Tab */}
        <button
          onClick={onSelectCustom}
          className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
            isCustom
              ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-900/20 ring-1 ring-cyan-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
              <Sliders className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-purple-950/70 text-purple-400 border border-purple-800/50">
              Live Custom URL
            </span>
          </div>
          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
            Custom Endpoint
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            Test any live API / schema
          </p>
        </button>
      </div>

      {/* Real-World Context Callout */}
      {!isCustom && currentPreset && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 flex items-start gap-2.5 text-xs text-slate-300">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200">Incident Context: </span>
            <span className="text-slate-400">{currentPreset.realWorldContext}</span>
          </div>
        </div>
      )}
    </div>
  );
};
