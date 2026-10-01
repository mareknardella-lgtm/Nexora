import React, { useState, useEffect, useCallback } from 'react';
import {
  HttpMethod,
  FuzzingOptions,
  EndpointPreset,
  ProbeExecutionResult,
  AiDiagnosticReport,
  IncidentAuditRecord
} from '@/types';
import { INCIDENT_PRESETS } from '@/lib/scenarios/incident-presets';
import { executeProbe } from '@/lib/engine/probe-runner';
import { runAiDiagnostics } from '@/lib/ai/diagnostic-service';

import { Navbar } from '@/components/header/Navbar';
import { ScenarioSelector } from '@/components/header/ScenarioSelector';
import { EndpointConfigPanel } from '@/components/probe/EndpointConfigPanel';
import { LiveTelemetryBar } from '@/components/probe/LiveTelemetryBar';
import { DriftInspectionTab } from '@/components/inspection/DriftInspectionTab';
import { AiDiagnosticCard } from '@/components/diagnostics/AiDiagnosticCard';
import { PatchWorkspace } from '@/components/remediation/PatchWorkspace';
import { SandboxVerification } from '@/components/remediation/SandboxVerification';
import { AuditHistoryTab } from '@/components/inspection/AuditHistoryTab';
import { TrafficSnifferModal } from '@/components/probe/TrafficSnifferModal';
import { DemoWalkthroughModal } from '@/components/common/DemoWalkthroughModal';
import { ApiKeyModal } from '@/components/common/ApiKeyModal';
import { ToastContainer, ToastMessage } from '@/components/common/Toast';

import {
  AlertOctagon,
  Sparkles,
  Code2,
  ShieldCheck,
  Zap,
  Info,
  Award,
  History,
  Radio
} from 'lucide-react';

export function App() {
  // Scenario & Target State
  const [activePreset, setActivePreset] = useState<EndpointPreset>(INCIDENT_PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [method, setMethod] = useState<HttpMethod>(INCIDENT_PRESETS[0].method);
  const [url, setUrl] = useState<string>(INCIDENT_PRESETS[0].url);
  const [expectedSchema, setExpectedSchema] = useState<Record<string, any>>(
    INCIDENT_PRESETS[0].expectedSchema
  );
  const [headers, setHeaders] = useState<Record<string, string>>(INCIDENT_PRESETS[0].headers);
  const [customPayload, setCustomPayload] = useState<any>({ amount: 4999 });
  const [environment, setEnvironment] = useState('Production Edge Gateway');

  // Fuzzing & Execution State
  const [fuzzing, setFuzzing] = useState<FuzzingOptions>({
    injectTypeCoercion: false,
    injectNulls: false,
    injectUnexpectedFields: false,
    simulateLatencyMs: 0,
    enforceStrictEnums: true
  });
  const [isProbing, setIsProbing] = useState(false);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [probeResult, setProbeResult] = useState<ProbeExecutionResult | null>(null);
  const [aiReport, setAiReport] = useState<AiDiagnosticReport | null>(null);
  const [totalProbesRun, setTotalProbesRun] = useState(0);
  const [auditRecords, setAuditRecords] = useState<IncidentAuditRecord[]>([]);

  // Active Viewport Tab on Right Column
  const [activeTab, setActiveTab] = useState<'anomalies' | 'ai' | 'remediation' | 'sandbox' | 'audit'>('anomalies');

  // Modals & Notifications
  const [isDemoWalkthroughOpen, setIsDemoWalkthroughOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSnifferModalOpen, setIsSnifferModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('nexora_ai_api_key') || '' : '';
  });

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexora_ai_api_key', key);
    }
    addToast('success', 'AI Configuration Saved', key ? 'Custom API key active' : 'Default deterministic engine restored');
  };

  // Run Probe Execution Workflow
  const handleDispatchProbe = useCallback(async () => {
    setIsProbing(true);
    setIsAiDiagnosing(true);

    try {
      // 1. Dispatch active probe and synthetic invariant fuzzing
      const result = await executeProbe(
        {
          url,
          method,
          headers,
          expectedSchema,
          customPayload,
          preset: isCustom ? undefined : activePreset
        },
        fuzzing
      );

      setProbeResult(result);
      setTotalProbesRun((prev) => prev + 1);

      // Record in historical audit log
      const auditRec: IncidentAuditRecord = {
        id: result.id,
        timestamp: result.timestamp,
        scenarioTitle: isCustom ? 'Custom Live Endpoint' : activePreset.title,
        url: result.url,
        method: result.method,
        httpStatus: result.httpStatus,
        resilienceScore: result.resilienceScore,
        anomaliesCount: result.anomalies.length,
        criticalCount: result.anomalies.filter((a) => a.severity === 'CRITICAL').length,
        remediated: true
      };
      setAuditRecords((prev) => [auditRec, ...prev]);

      // 2. Synthesize AI Semantic Diagnostic Report
      const report = await runAiDiagnostics(result, isCustom ? undefined : activePreset, userApiKey);
      setAiReport(report);

      addToast(
        result.passed ? 'success' : 'info',
        result.passed ? 'Contract 100% Compliant' : `Probe Complete: ${result.anomalies.length} Anomaly Detected`,
        `Resilience Score: ${result.resilienceScore}/100 in ${result.latencyMs}ms`
      );
    } catch (err) {
      console.error('Probe execution failure:', err);
      addToast('error', 'Probe Dispatch Failed', 'Network error or host unreachable');
    } finally {
      setIsProbing(false);
      setIsAiDiagnosing(false);
    }
  }, [url, method, headers, expectedSchema, customPayload, isCustom, activePreset, fuzzing, userApiKey, addToast]);

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to trigger probe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleDispatchProbe();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDispatchProbe]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: EndpointPreset) => {
    setIsCustom(false);
    setActivePreset(preset);
    setMethod(preset.method);
    setUrl(preset.url);
    setExpectedSchema(preset.expectedSchema);
    setHeaders(preset.headers);
    setCustomPayload({ amount: 4999 });
    addToast('info', 'Loaded Incident Scenario', preset.title);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setUrl('https://api.github.com/users/octocat');
    setMethod('GET');
    setExpectedSchema({
      type: 'object',
      required: ['login', 'id', 'node_id', 'avatar_url'],
      properties: {
        login: { type: 'string' },
        id: { type: 'number' },
        node_id: { type: 'string' },
        avatar_url: { type: 'string' }
      }
    });
    addToast('info', 'Switched to Custom Endpoint Mode', 'Enter any live API URL and JSON Schema');
  };

  // Auto-run initial probe on mount so judge immediately has interactive results
  useEffect(() => {
    const timer = setTimeout(() => {
      void handleDispatchProbe();
    }, 0);
    return () => clearTimeout(timer);
  }, [handleDispatchProbe]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        onOpenDemoWalkthrough={() => setIsDemoWalkthroughOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenSnifferModal={() => setIsSnifferModalOpen(true)}
        hasCustomKey={!!userApiKey}
        totalProbesRun={totalProbesRun}
        environment={environment}
        setEnvironment={setEnvironment}
      />

      {/* Main Content Workbench */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hackathon Hero Banner & Scenario Bar */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-900">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>Autonomous Contract Drift & Resilience Studio</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  <Award className="h-3 w-3 text-cyan-400" />
                  EurekaDEV 2026
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Actively probe APIs, detect silent payload mutations, isolate root causes with AI, and synthesize verified client patches with in-browser proof.
              </p>
            </div>

            {/* Quick Demo Play Button for Judges */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSnifferModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 border border-purple-800/70 text-purple-300 hover:border-purple-500 hover:text-white transition-all shadow-md cursor-pointer"
              >
                <Radio className="h-4 w-4 text-purple-400" />
                <span>eBPF Sniffer</span>
              </button>

              <button
                onClick={() => setIsDemoWalkthroughOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/70 text-cyan-300 hover:border-cyan-500 hover:text-white transition-all shadow-md cursor-pointer"
              >
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>4-Minute Demo Pitch Guide</span>
              </button>
            </div>
          </div>

          {/* Scenario Selector */}
          <ScenarioSelector
            activePresetId={activePreset.id}
            onSelectPreset={handleSelectPreset}
            onSelectCustom={handleSelectCustom}
            isCustom={isCustom}
          />
        </section>

        {/* Live Telemetry Bar */}
        <section>
          <LiveTelemetryBar probeResult={probeResult} isProbing={isProbing} />
        </section>

        {/* 2-Column Split Workbench */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Endpoint Config & Fuzzing Controls */}
          <div className="lg:col-span-5 space-y-4">
            <EndpointConfigPanel
              key={isCustom ? 'custom' : activePreset.id}
              method={method}
              setMethod={setMethod}
              url={url}
              setUrl={setUrl}
              expectedSchema={expectedSchema}
              setExpectedSchema={setExpectedSchema}
              headers={headers}
              setHeaders={setHeaders}
              customPayload={customPayload}
              setCustomPayload={setCustomPayload}
              fuzzing={fuzzing}
              setFuzzing={setFuzzing}
              onDispatchProbe={handleDispatchProbe}
              isProbing={isProbing}
              activePreset={isCustom ? undefined : activePreset}
            />

            {/* Quick Keyboard Shortcut & Evaluation Info Box */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between pb-1 border-b border-slate-900">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold font-mono">
                  <Info className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Pro-tip: Keyboard Shortcut</span>
                </div>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                  Ctrl + Enter
                </kbd>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed text-[11.5px]">
                <li>Select any incident scenario above (e.g. Fintech Payment).</li>
                <li>Observe the detected <strong className="text-rose-400">Critical Anomaly</strong> in the right pane.</li>
                <li>Inspect the <strong className="text-cyan-400">AI Diagnostic</strong> tab for root-cause reasoning.</li>
                <li>Click <strong className="text-emerald-400">Sandbox Verification</strong> to test and confirm 100% fix.</li>
              </ol>
            </div>
          </div>

          {/* Right Column (7 Cols): Inspection, AI, Remediation, Sandbox, Audit */}
          <div className="lg:col-span-7 space-y-4">
            {/* Viewport Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
              <button
                onClick={() => setActiveTab('anomalies')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'anomalies'
                    ? 'bg-slate-800 text-rose-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                <span>Drift Anomalies</span>
                {probeResult && probeResult.anomalies.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-400 font-mono font-bold">
                    {probeResult.anomalies.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>AI Root-Cause</span>
              </button>

              <button
                onClick={() => setActiveTab('remediation')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'remediation'
                    ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Synthesized Patches</span>
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'sandbox'
                    ? 'bg-emerald-950/80 text-emerald-300 shadow-sm border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sandbox Verification</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-slate-800 text-slate-200 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span>Audit Log</span>
                {auditRecords.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-slate-400 font-mono font-bold">
                    {auditRecords.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Viewport Contents */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 min-h-[520px] shadow-xl">
              {activeTab === 'anomalies' && (
                <DriftInspectionTab probeResult={probeResult} />
              )}

              {activeTab === 'ai' && (
                <AiDiagnosticCard report={aiReport} isLoading={isAiDiagnosing} />
              )}

              {activeTab === 'remediation' && aiReport && (
                <PatchWorkspace
                  clientPatch={aiReport.generatedClientPatch}
                  pythonAdapter={aiReport.generatedPythonAdapter}
                  openapiPatch={aiReport.generatedOpenApiDiff}
                  testSuite={aiReport.generatedVitestSuite}
                  githubWorkflow={aiReport.generatedGitHubActionWorkflow}
                />
              )}

              {activeTab === 'sandbox' && (
                <SandboxVerification
                  probeResult={probeResult}
                  activePreset={isCustom ? undefined : activePreset}
                />
              )}

              {activeTab === 'audit' && (
                <AuditHistoryTab
                  records={auditRecords}
                  onClearHistory={() => setAuditRecords([])}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-white font-bold">NEXORA SENTINEL</span>
            <span>•</span>
            <span>EurekaDEV 2026 Submission</span>
          </div>

          <div className="text-slate-400">
            Computer Science + AI (Technology) Track • Innovation Without Limits
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsSnifferModalOpen(true)}
              className="hover:text-purple-400 transition-colors"
            >
              eBPF Sniffer
            </button>
            <button
              onClick={() => setIsDemoWalkthroughOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Demo Walkthrough
            </button>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              AI Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Guided Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoWalkthroughOpen}
        onClose={() => setIsDemoWalkthroughOpen(false)}
        onSelectPresetAndRun={(presetId) => {
          const found = INCIDENT_PRESETS.find((p) => p.id === presetId);
          if (found) {
            handleSelectPreset(found);
            setActiveTab('sandbox');
          }
        }}
      />

      {/* eBPF Traffic Sniffer Modal */}
      <TrafficSnifferModal
        isOpen={isSnifferModalOpen}
        onClose={() => setIsSnifferModalOpen(false)}
        onSelectPacketToInspect={() => {
          setIsSnifferModalOpen(false);
          setActiveTab('anomalies');
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
