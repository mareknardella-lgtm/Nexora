import React, { useState } from 'react';
import { X, Flame, ShieldAlert, CheckCircle2, AlertOctagon, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { playTick, playSuccessChime } from '@/lib/sound';

interface TrapPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

interface TrapSpecimen {
  id: string;
  title: string;
  category: string;
  severity: 'Critical' | 'High';
  hint: string;
  trapSnippet: string;
  whyLintersFail: string;
  whyLlmsFail: string;
  nexoraDefense: string;
}

const TRAP_SPECIMENS: TrapSpecimen[] = [
  {
    id: 'stripe-payment-intent-drift',
    title: 'The Cents vs Decimal Dollars Mutation',
    category: 'Fintech Billing Invariant',
    severity: 'Critical',
    hint: 'Upstream payment engine updates to ISO 4217 minor units: 49.99 float -> 4999 integer cents.',
    trapSnippet: `// UPSTREAM RUNTIME DRIFT:
{
  "id": "pi_3MtwL24xY2mp",
  "amount": 4999, // THE TRAP: Was 49.99, now 4999 integer cents!
  "currency": "USD",
  "status": "payment_intent.succeeded" // Namespaced enum variant
}`,
    whyLintersFail:
      'Standard OpenAPI schema linters (Spectral, Swagger-CLI) only check if `amount` is of type `number`. Since 4999 is a valid number, the linter reports 0 errors and CI passes with green status!',
    whyLlmsFail:
      'Naive LLM chatbots assume `amount` is in dollars, generating formatting code like `$4999.00` and charging end customers 100x their order total.',
    nexoraDefense:
      'Nexora Sentinel checks numerical order-of-magnitude invariants and semantic descriptions, detecting the 100x scale jump and synthesizing an adapter that normalizes both formats seamlessly.'
  },
  {
    id: 'auth0-user-profile-deletion',
    title: 'The Nested Claim Migration Crash',
    category: 'Identity & Auth OIDC Invariant',
    severity: 'Critical',
    hint: 'Identity provider drops top-level email_verified and moves it to nested identity_meta.is_verified.',
    trapSnippet: `// CLIENT UNPATCHED CONSUMER CODE:
const isVerified = user.email_verified; 
// THE TRAP: email_verified was moved to user.identity_meta.is_verified!
// Throws TypeError: Cannot read properties of undefined in browser!`,
    whyLintersFail:
      'Static schema linters do not inspect production runtime responses. If an upstream deployment diverges from the repository spec, linters are completely unaware.',
    whyLlmsFail:
      'Generic AI code generators frequently write flat lookups (`user.email_verified || false`) which fails to locate the nested object, leaving verified users locked out.',
    nexoraDefense:
      'Nexora flags the critical `FIELD_REMOVED` breaking mutation and generates defensive deep-property accessors with fallback optional-chaining.'
  },
  {
    id: 'gateway-silent-200-failure',
    title: 'The "Fake Success" Circuit Breaker Trap',
    category: 'Microservice Gateway Invariant',
    severity: 'Critical',
    hint: 'Gateway returns HTTP 200 OK carrying an error envelope instead of catalog records.',
    trapSnippet: `// GATEWAY RUNTIME RESPONSE (HTTP 200 OK):
{
  "success": false,
  "error": {
    "code": "DOWNSTREAM_TIMEOUT",
    "message": "Database replica lag exceeded threshold"
  }
}
// THE TRAP: items array is missing! Frontend renders "0 items found" during an outage!`,
    whyLintersFail:
      'Synthetic uptime monitors (Pingdom, Datadog basic pings) check for HTTP 200 OK. Since the gateway returns 200, synthetic monitors stay 100% green while customers see an empty catalog.',
    whyLlmsFail:
      'Standard AI wrappers do not inspect gateway error envelopes, treating the missing items as an empty array and failing to alert oncall engineers.',
    nexoraDefense:
      'Nexora\'s invariant engine checks response payload semantics against expected resource properties, piercing through HTTP 200 headers to expose silent outages.'
  },
  {
    id: 'logistics-coordinate-drift',
    title: 'The Coordinates Tuple-to-String Mutation',
    category: 'Logistics Telemetry Invariant',
    severity: 'High',
    hint: 'Geolocation tuple [37.7749, -122.4194] converted to single comma-delimited string.',
    trapSnippet: `// UPSTREAM WEBHOOK PAYLOAD:
{
  "tracking_number": "NEX-9921",
  "coordinates": "37.7749,-122.4194", // THE TRAP: was [37.7749, -122.4194]!
  "status": "IN_TRANSIT"
}
// Client code calling coordinates[0] receives "3" instead of latitude!`,
    whyLintersFail:
      'Traditional schema linters only run when a human updates the OpenAPI spec, not when external third-party webhooks alter their serialization format in production.',
    whyLlmsFail:
      'AI models assume coordinates are numeric arrays, resulting in corrupted map pins at lat 3.0 instead of 37.77.',
    nexoraDefense:
      'Nexora detects the tuple-to-string type coercion and generates dual-mode array/string parsers with automated regression tests.'
  }
];

export const TrapPlaygroundModal: React.FC<TrapPlaygroundModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  const [expandedTrap, setExpandedTrap] = useState<string | null>(TRAP_SPECIMENS[0].id);

  if (!isOpen) return null;

  const toggleTrap = (id: string) => {
    playTick();
    setExpandedTrap(expandedTrap === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-800/60">
              Interactive Stress-Test Lab
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            Contract Drift & Anti-Pattern Traps Playground
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Why traditional OpenAPI linters stay green, why generic AI chatbots fail, and how Nexora Sentinel catches silent production breakages.
          </p>
        </div>

        {/* Traps Accordion List */}
        <div className="space-y-3">
          {TRAP_SPECIMENS.map((trap) => {
            const isExpanded = expandedTrap === trap.id;
            return (
              <div
                key={trap.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-orange-500/50 bg-slate-900/80 shadow-lg shadow-orange-950/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {/* Trap Header Row */}
                <div
                  onClick={() => toggleTrap(trap.id)}
                  className="flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-950/60 border border-orange-800/80 text-orange-400">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{trap.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {trap.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{trap.hint}</p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 border-t border-slate-800/60 mt-2">
                    {/* Code Snippet Box */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-orange-300">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-sans font-bold">
                        Vulnerable Code & Payload Mutation:
                      </div>
                      <pre className="overflow-x-auto leading-relaxed">{trap.trapSnippet}</pre>
                    </div>

                    {/* 3-Column Comparison: Linters vs LLMs vs Nexora */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Column 1: Linters */}
                      <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-400">
                          <AlertOctagon className="h-3.5 w-3.5" />
                          <span>Why Linters Fail:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11.5px]">
                          {trap.whyLintersFail}
                        </p>
                      </div>

                      {/* Column 2: Standard LLMs */}
                      <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Why Naive AI Fails:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11.5px]">
                          {trap.whyLlmsFail}
                        </p>
                      </div>

                      {/* Column 3: Nexora Sentinel */}
                      <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Nexora Defense:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11.5px]">
                          {trap.nexoraDefense}
                        </p>
                      </div>
                    </div>

                    {/* Test CTA */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          playSuccessChime();
                          onClose();
                          onSelectScenario(trap.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-orange-500 hover:bg-orange-400 text-slate-950 transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-slate-950" />
                        <span>Load & Probe This Trap Now</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
