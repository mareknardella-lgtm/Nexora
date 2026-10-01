import React, { useState, useEffect } from 'react';
import { PassiveSnifferPacket } from '@/types';
import {
  Radio,
  X,
  Play,
  Pause,
  AlertTriangle,
  Activity,
  Server,
  Network,
  RotateCcw
} from 'lucide-react';

interface TrafficSnifferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPacketToInspect?: (packet: PassiveSnifferPacket) => void;
}

const INITIAL_PACKETS: PassiveSnifferPacket[] = [
  {
    id: 'pkt-101',
    timestamp: '23:51:02.124',
    sourceService: 'edge-ingress-proxy',
    targetService: 'payment-gateway-v1',
    method: 'POST',
    path: '/v1/payments/intent_checkout',
    status: 200,
    latencyMs: 44,
    driftDetected: true,
    anomalyType: 'SEMANTIC_MUTATION'
  },
  {
    id: 'pkt-102',
    timestamp: '23:51:04.882',
    sourceService: 'web-frontend-cluster',
    targetService: 'auth-identity-core',
    method: 'GET',
    path: '/userinfo',
    status: 200,
    latencyMs: 29,
    driftDetected: true,
    anomalyType: 'FIELD_REMOVED'
  },
  {
    id: 'pkt-103',
    timestamp: '23:51:07.419',
    sourceService: 'storefront-mobile-api',
    targetService: 'catalog-inventory-svc',
    method: 'GET',
    path: '/v2/items?category=hardware',
    status: 200,
    latencyMs: 142,
    driftDetected: true,
    anomalyType: 'SILENT_200_ERROR'
  },
  {
    id: 'pkt-104',
    timestamp: '23:51:09.910',
    sourceService: 'billing-invoice-worker',
    targetService: 'notification-dispatcher',
    method: 'POST',
    path: '/v1/emails/send_receipt',
    status: 202,
    latencyMs: 38,
    driftDetected: false
  },
  {
    id: 'pkt-105',
    timestamp: '23:51:12.631',
    sourceService: 'fleet-iot-telemetry',
    targetService: 'logistics-tracker-svc',
    method: 'POST',
    path: '/webhooks/shipment_status',
    status: 200,
    latencyMs: 65,
    driftDetected: true,
    anomalyType: 'TYPE_MISMATCH'
  }
];

export const TrafficSnifferModal: React.FC<TrafficSnifferModalProps> = ({
  isOpen,
  onClose,
  onSelectPacketToInspect
}) => {
  const [isSniffing, setIsSniffing] = useState(true);
  const [packets, setPackets] = useState<PassiveSnifferPacket[]>(INITIAL_PACKETS);
  const [filterDriftOnly, setFilterDriftOnly] = useState(false);

  useEffect(() => {
    if (!isOpen || !isSniffing) return;

    const interval = setInterval(() => {
      const services = [
        { src: 'edge-ingress-proxy', dest: 'payment-gateway-v1', path: '/v1/payments/intent_checkout', method: 'POST' as const },
        { src: 'web-frontend-cluster', dest: 'auth-identity-core', path: '/userinfo', method: 'GET' as const },
        { src: 'storefront-mobile-api', dest: 'catalog-inventory-svc', path: '/v2/items?limit=25', method: 'GET' as const },
        { src: 'warehouse-dispatch', dest: 'logistics-tracker-svc', path: '/webhooks/shipment_status', method: 'POST' as const },
        { src: 'telemetry-collector', dest: 'metrics-aggregator', path: '/v1/health', method: 'GET' as const }
      ];

      const chosen = services[Math.floor(Math.random() * services.length)];
      const hasDrift = Math.random() > 0.45;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      const newPacket: PassiveSnifferPacket = {
        id: `pkt-${Date.now()}`,
        timestamp: timeStr,
        sourceService: chosen.src,
        targetService: chosen.dest,
        method: chosen.method,
        path: chosen.path,
        status: 200,
        latencyMs: Math.floor(Math.random() * 85) + 20,
        driftDetected: hasDrift,
        anomalyType: hasDrift ? (chosen.path.includes('payment') ? 'SEMANTIC_MUTATION' : chosen.path.includes('userinfo') ? 'FIELD_REMOVED' : 'SILENT_200_ERROR') : undefined
      };

      setPackets((prev) => [newPacket, ...prev.slice(0, 19)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen, isSniffing]);

  if (!isOpen) return null;

  const displayedPackets = filterDriftOnly
    ? packets.filter((p) => p.driftDetected)
    : packets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/80">
              <Network className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  eBPF Passive Traffic Sniffer Simulator
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 animate-pulse">
                  <Radio className="h-3 w-3 text-purple-400" />
                  KERNEL PROBE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Passive inter-service payload observation on Kubernetes cluster sidecars without active probing.
              </p>
            </div>
          </div>

          {/* Sniffer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSniffing(!isSniffing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                isSniffing
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
              }`}
            >
              {isSniffing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isSniffing ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>

            <button
              onClick={() => setFilterDriftOnly(!filterDriftOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                filterDriftOnly
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>{filterDriftOnly ? 'Showing Drifts Only' : 'Filter Drifted'}</span>
            </button>
          </div>
        </div>

        {/* Live Sniffer Packet Stream Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-inner">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-sans font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Packet Time</th>
                  <th className="py-2.5 px-3">Source Service</th>
                  <th className="py-2.5 px-3">Target Microservice</th>
                  <th className="py-2.5 px-3">Method & Path</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Contract Invariant Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedPackets.map((pkt) => (
                  <tr
                    key={pkt.id}
                    className={`transition-colors cursor-pointer ${
                      pkt.driftDetected
                        ? 'bg-rose-950/20 hover:bg-rose-950/30'
                        : 'hover:bg-slate-900/40'
                    }`}
                    onClick={() => onSelectPacketToInspect?.(pkt)}
                  >
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {pkt.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-slate-500" />
                        <span>{pkt.sourceService}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">→</span>
                        <span>{pkt.targetService}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-cyan-400 mr-2">{pkt.method}</span>
                      <span className="text-slate-300 font-sans">{pkt.path}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {pkt.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-3">
                      {pkt.driftDetected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                          DRIFT: {pkt.anomalyType}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-900">
                          PASS (100%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span>eBPF kernel probe observing TCP socket buffers on port 443/8080.</span>
          </div>

          <button
            onClick={() => setPackets(INITIAL_PACKETS)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
};
