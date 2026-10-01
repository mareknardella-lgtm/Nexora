import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, FileCode, Archive, GitBranch } from 'lucide-react';

interface PatchWorkspaceProps {
  clientPatch: string;
  pythonAdapter?: string;
  openapiPatch: string;
  testSuite: string;
  githubWorkflow?: string;
}

export const PatchWorkspace: React.FC<PatchWorkspaceProps> = ({
  clientPatch,
  pythonAdapter = '# Python adapter generating...',
  openapiPatch,
  testSuite,
  githubWorkflow = '# GitHub Actions CI/CD workflow...'
}) => {
  const [activeTab, setActiveTab] = useState<'ts' | 'py' | 'openapi' | 'tests' | 'workflow'>('ts');
  const [copied, setCopied] = useState(false);
  const [bundleDownloaded, setBundleDownloaded] = useState(false);

  const getCode = () => {
    switch (activeTab) {
      case 'ts':
        return clientPatch;
      case 'py':
        return pythonAdapter;
      case 'openapi':
        return openapiPatch;
      case 'tests':
        return testSuite;
      case 'workflow':
        return githubWorkflow;
    }
  };

  const getLanguage = () => {
    switch (activeTab) {
      case 'ts':
      case 'tests':
        return 'typescript';
      case 'py':
        return 'python';
      case 'openapi':
        return 'json';
      case 'workflow':
        return 'yaml';
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'ts':
        return 'resilient-adapter.ts';
      case 'py':
        return 'resilient_adapter.py';
      case 'openapi':
        return 'openapi.patch.json';
      case 'tests':
        return 'contract-regression.test.ts';
      case 'workflow':
        return 'api-contract-sentinel.yml';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getCode()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFilename();
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBundle = () => {
    const bundle = {
      meta: {
        generator: 'Nexora Sentinel v1.0.0 (EurekaDEV 2026)',
        timestamp: new Date().toISOString(),
        description: 'Complete autonomous API contract drift remediation bundle'
      },
      files: {
        'resilient-adapter.ts': clientPatch,
        'resilient_adapter.py': pythonAdapter,
        'openapi.patch.json': openapiPatch,
        'contract-regression.test.ts': testSuite,
        '.github/workflows/api-contract-sentinel.yml': githubWorkflow
      }
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexora-remediation-bundle-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setBundleDownloaded(true);
    setTimeout(() => setBundleDownloaded(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-0">
      {/* Top Bar with Language Tabs & Export Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950 px-3 sm:px-4 py-2.5 gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* TypeScript Tab */}
          <button
            onClick={() => setActiveTab('ts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'ts'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>TypeScript</span>
          </button>

          {/* Python Tab */}
          <button
            onClick={() => setActiveTab('py')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'py'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>Python (Pydantic v2)</span>
          </button>

          {/* OpenAPI JSON Patch Tab */}
          <button
            onClick={() => setActiveTab('openapi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'openapi'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>OpenAPI 3.1 Patch</span>
          </button>

          {/* Vitest Tests Tab */}
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Vitest Suite</span>
          </button>

          {/* GitHub Actions CI Workflow Tab */}
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'workflow'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-blue-400" />
            <span>GitHub Action</span>
          </button>
        </div>

        {/* Copy, Single Download, and Bundle Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Download active file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">File</span>
          </button>

          <button
            onClick={handleExportBundle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 transition-all font-semibold shadow-sm"
            title="Export complete remediation bundle with all 5 files"
          >
            {bundleDownloaded ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Archive className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span>{bundleDownloaded ? 'Bundle Saved!' : 'Export Bundle'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
      <div className="h-[430px] w-full bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={getLanguage()}
          value={getCode()}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};
