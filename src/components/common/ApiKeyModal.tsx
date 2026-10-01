import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputVal.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80">
            <Key className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Diagnostic Engine Settings</h3>
            <p className="text-xs text-slate-400">Optional custom LLM API configuration</p>
          </div>
        </div>

        {/* Built-in Status Pill */}
        <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">
              Built-in Deterministic AI Reasoning Active
            </span>
            <p className="text-emerald-400/80 mt-0.5 leading-relaxed">
              No API key is required to evaluate the demo. Nexora Sentinel includes a local deterministic AST semantic engine that runs offline and with 0 latency.
            </p>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Custom OpenAI or Gemini API Key (Optional)
          </label>
          <input
            type="password"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-500">
            Keys are stored strictly in your local browser sessionStorage/localStorage and are never logged or committed.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-900">
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
