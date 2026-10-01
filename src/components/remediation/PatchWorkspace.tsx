import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, FileCode } from 'lucide-react';

interface PatchWorkspaceProps {
  clientPatch: string;
  openapiPatch: string;
  testSuite: string;
}

export const PatchWorkspace: React.FC<PatchWorkspaceProps> = ({
  clientPatch,
  openapiPatch,
  testSuite
}) => {
  const [activeTab, setActiveTab] = useState<'adapter' | 'openapi' | 'tests'>('adapter');
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    switch (activeTab) {
      case 'adapter':
        return clientPatch;
      case 'openapi':
        return openapiPatch;
      case 'tests':
        return testSuite;
    }
  };

  const getLanguage = () => {
    switch (activeTab) {
      case 'adapter':
      case 'tests':
        return 'typescript';
      case 'openapi':
        return 'json';
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'adapter':
        return 'resilient-adapter.ts';
      case 'openapi':
        return 'openapi.patch.json';
      case 'tests':
        return 'contract-regression.test.ts';
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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-0">
      {/* Top Bar with Tabs and Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('adapter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'adapter'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>TypeScript Adapter</span>
          </button>

          <button
            onClick={() => setActiveTab('openapi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'openapi'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>OpenAPI 3.1 Patch</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Vitest Test Suite</span>
          </button>
        </div>

        {/* Copy & Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
      <div className="h-[420px] w-full bg-[#1e1e1e]">
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
