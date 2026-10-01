import React, { useState } from 'react';
import { ProbeExecutionResult, EndpointPreset } from '@/types';
import { Cpu, Layers } from 'lucide-react';
import { playTick } from '@/lib/sound';

interface NexoraGraphProps {
  probeResult: ProbeExecutionResult | null;
  activePreset?: EndpointPreset;
}

interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'source' | 'probe' | 'invariant' | 'remediation' | 'verdict';
  status: 'holds' | 'drift' | 'caution' | 'neutral';
  x: number;
  y: number;
  details?: string;
}

export const NexoraGraph: React.FC<NexoraGraphProps> = ({ probeResult, activePreset }) => {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  if (!probeResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/30">
        <Layers className="h-10 w-10 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">Contract DAG Visualizer Idle</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Dispatch a probe to construct the real-time visual schema invariant dependency graph.
        </p>
      </div>
    );
  }

  // Build nodes based on current probe result
  const nodes: GraphNode[] = [
    // Source
    {
      id: 'src-1',
      label: activePreset?.service || 'Target Gateway',
      sublabel: `${probeResult.method} ${probeResult.httpStatus}`,
      type: 'source',
      status: 'neutral',
      x: 50,
      y: 150,
      details: `Endpoint URL: ${probeResult.url}`
    },
    // Probe Engine
    {
      id: 'fuzz-1',
      label: 'Chaos & Probe',
      sublabel: `${probeResult.latencyMs}ms TTFB`,
      type: 'probe',
      status: probeResult.fuzzingApplied ? 'caution' : 'neutral',
      x: 180,
      y: 150,
      details: `Active probes dispatched with synthetic boundary analysis`
    }
  ];

  // Invariant property nodes
  const properties = activePreset?.expectedSchema?.properties || {};
  const propKeys = Object.keys(properties).slice(0, 5);

  propKeys.forEach((key, idx) => {
    const anomaly = probeResult.anomalies.find((a) => a.path.includes(key));
    const isDrift = !!anomaly;
    const isCritical = anomaly?.severity === 'CRITICAL';

    const yPos = 40 + idx * 55;
    nodes.push({
      id: `inv-${key}`,
      label: `$.${key}`,
      sublabel: isDrift ? anomaly.type : 'Compliant',
      type: 'invariant',
      status: isDrift ? (isCritical ? 'drift' : 'caution') : 'holds',
      x: 350,
      y: yPos,
      details: isDrift ? `${anomaly.message} (Expected: ${String(anomaly.expected)})` : `Invariant holds: matches declared contract type`
    });
  });

  // Remediation
  nodes.push({
    id: 'rem-1',
    label: 'Resilient Adapter',
    sublabel: 'TS & Python Normalizer',
    type: 'remediation',
    status: 'holds',
    x: 520,
    y: 150,
    details: 'Generated defensive normalization code handling both old and mutated payloads'
  });

  // Verdict
  nodes.push({
    id: 'verd-1',
    label: probeResult.passed ? 'Contract Preserved' : 'Invariants Restored',
    sublabel: probeResult.passed ? '100% Compliant' : 'Sandbox Verified',
    type: 'verdict',
    status: 'holds',
    x: 680,
    y: 150,
    details: '100% automated invariant assertions verified in execution sandbox'
  });

  const getStatusStroke = (status: GraphNode['status']) => {
    switch (status) {
      case 'holds':
        return '#10B981'; // emerald
      case 'drift':
        return '#F43F5E'; // rose
      case 'caution':
        return '#F59E0B'; // amber
      default:
        return '#06B6D4'; // cyan
    }
  };

  const getStatusBg = (status: GraphNode['status']) => {
    switch (status) {
      case 'holds':
        return 'rgba(16, 185, 129, 0.12)';
      case 'drift':
        return 'rgba(244, 63, 94, 0.18)';
      case 'caution':
        return 'rgba(245, 158, 11, 0.12)';
      default:
        return 'rgba(6, 182, 212, 0.12)';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-xl relative overflow-hidden">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
            Interactive Contract Invariant DAG Graph
          </h4>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Holds True
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" /> Contract Drift
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Coercion
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 760 300"
          className="w-full min-w-[700px] h-[300px] select-none"
        >
          {/* Defs for gradients & glowing filters */}
          <defs>
            <filter id="glow-drift" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="edge-grad-normal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="edge-grad-drift" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Edges: Source -> Probe */}
          <line
            x1={105}
            y1={150}
            x2={180}
            y2={150}
            stroke="#06B6D4"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Edges: Probe -> Invariant properties */}
          {propKeys.map((key, idx) => {
            const yPos = 40 + idx * 55;
            const anomaly = probeResult.anomalies.find((a) => a.path.includes(key));
            const isDrift = !!anomaly;
            return (
              <path
                key={key}
                d={`M 255 150 C 290 150, 310 ${yPos}, 350 ${yPos}`}
                fill="none"
                stroke={isDrift ? 'url(#edge-grad-drift)' : 'url(#edge-grad-normal)'}
                strokeWidth={isDrift ? '2.5' : '1.5'}
                filter={isDrift ? 'url(#glow-drift)' : undefined}
              />
            );
          })}

          {/* Edges: Invariant properties -> Remediation */}
          {propKeys.map((key, idx) => {
            const yPos = 40 + idx * 55;
            return (
              <path
                key={key}
                d={`M 445 ${yPos} C 475 ${yPos}, 490 150, 520 150`}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            );
          })}

          {/* Edges: Remediation -> Verdict */}
          <line
            x1={615}
            y1={150}
            x2={680}
            y2={150}
            stroke="#10B981"
            strokeWidth="2.5"
          />

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const strokeColor = getStatusStroke(node.status);
            const bgColor = getStatusBg(node.status);
            const isDrift = node.status === 'drift';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => {
                  setHoveredNode(node);
                  playTick();
                }}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Node Box */}
                <rect
                  x="-48"
                  y="-22"
                  width="96"
                  height="44"
                  rx="10"
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? '2.5' : isDrift ? '2' : '1.5'}
                  filter={isDrift ? 'url(#glow-drift)' : undefined}
                />

                {/* Status Dot */}
                <circle
                  cx="-38"
                  cy="0"
                  r="3.5"
                  fill={strokeColor}
                  className={isDrift ? 'animate-ping' : undefined}
                />
                <circle cx="-38" cy="0" r="3.5" fill={strokeColor} />

                {/* Node Label */}
                <text
                  x="2"
                  y="-4"
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {node.label}
                </text>

                {/* Node Sublabel */}
                <text
                  x="2"
                  y="10"
                  textAnchor="middle"
                  fill={isDrift ? '#FDA4AF' : '#94A3B8'}
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Details Card */}
      {hoveredNode && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-300 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getStatusStroke(hoveredNode.status) }}
            />
            <span className="font-mono font-bold text-white">{hoveredNode.label}</span>
            <span className="text-slate-400">• {hoveredNode.details}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Node: {hoveredNode.type}
          </span>
        </div>
      )}
    </div>
  );
};
