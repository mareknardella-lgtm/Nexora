import {
  EndpointPreset,
  FuzzingOptions,
  ProbeExecutionResult,
  HttpMethod
} from '@/types';
import { validateAgainstSchema } from './schema-validator';

export async function executeProbe(
  target: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    expectedSchema: Record<string, any>;
    customPayload?: any;
    preset?: EndpointPreset;
  },
  fuzzing: FuzzingOptions
): Promise<ProbeExecutionResult> {
  const startTime = performance.now();
  const fuzzingLog: string[] = [];

  let httpStatus = 200;
  let responseHeaders: Record<string, string> = {};
  let rawPayload: any = null;

  // Check if target is a known preset or external live URL
  const isPreset = !!target.preset && target.url === target.preset.url;

  if (isPreset && target.preset) {
    // High-fidelity simulation for pre-loaded battle-tested scenarios
    // Introduce optional latency if configured
    const latency = fuzzing.simulateLatencyMs > 0 ? fuzzing.simulateLatencyMs : Math.floor(Math.random() * 45) + 38;
    await new Promise((resolve) => setTimeout(resolve, latency));

    httpStatus = target.preset.liveSimulatedStatus;
    responseHeaders = { ...target.preset.liveSimulatedHeaders };
    rawPayload = JSON.parse(JSON.stringify(target.preset.liveSimulatedPayload));

    fuzzingLog.push(`Probing scenario endpoint: ${target.url}`);
    fuzzingLog.push(`Simulated gateway response: HTTP ${httpStatus}`);
  } else {
    // Attempt real network call
    fuzzingLog.push(`Dispatching HTTP ${target.method} request to: ${target.url}`);
    try {
      const fetchOptions: RequestInit = {
        method: target.method,
        headers: target.headers,
        mode: 'cors'
      };

      if (['POST', 'PUT', 'PATCH'].includes(target.method) && target.customPayload) {
        fetchOptions.body = JSON.stringify(target.customPayload);
      }

      const response = await fetch(target.url, fetchOptions);
      httpStatus = response.status;

      // Extract response headers
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        rawPayload = await response.json();
      } else {
        const text = await response.text();
        try {
          rawPayload = JSON.parse(text);
        } catch {
          rawPayload = { raw_body: text };
        }
      }
      fuzzingLog.push(`Network response received: HTTP ${httpStatus} [${contentType}]`);
    } catch (err: any) {
      fuzzingLog.push(`Network error (CORS or unreachable): ${err?.message || 'Failed to fetch'}`);
      // Graceful fallback for demo when user enters an external URL blocked by CORS
      httpStatus = 502;
      responseHeaders = {
        'x-nexora-fallback': 'active',
        'content-type': 'application/json'
      };
      rawPayload = {
        error: true,
        message: `Direct browser probe failed due to CORS or host resolution: ${err?.message || 'Network request failed'}. Tip: Use one of the curated incident presets or an endpoint with CORS enabled.`
      };
    }
  }

  // Apply Synthetic Invariant Fuzzing mutations if active
  if (rawPayload && typeof rawPayload === 'object') {
    if (fuzzing.injectNulls) {
      const keys = Object.keys(rawPayload);
      if (keys.length > 0) {
        const targetKey = keys[0];
        rawPayload[targetKey] = null;
        fuzzingLog.push(`[FUZZER] Mutated '${targetKey}' to null (testing nullability guard)`);
      }
    }

    if (fuzzing.injectTypeCoercion) {
      for (const [key, val] of Object.entries(rawPayload)) {
        if (typeof val === 'number') {
          rawPayload[key] = String(val);
          fuzzingLog.push(`[FUZZER] Coerced number '${key}' (${val}) to string "${val}"`);
          break;
        }
      }
    }

    if (fuzzing.injectUnexpectedFields) {
      rawPayload.__nexora_shadow_field = 'synthetic_upstream_drift_v3';
      rawPayload.__proto_leak_probe = 99120;
      fuzzingLog.push(`[FUZZER] Injected shadow fields to test schema strictness & unhandled keys`);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Validate payload against expected schema
  const validation = validateAgainstSchema(rawPayload, target.expectedSchema, httpStatus);

  fuzzingLog.push(
    `Validation completed: ${validation.anomalies.length} anomal${validation.anomalies.length === 1 ? 'y' : 'ies'} found.`
  );
  fuzzingLog.push(`Computed Resilience Score: ${validation.resilienceScore}/100`);

  return {
    id: `probe_${Date.now()}`,
    timestamp: new Date().toISOString(),
    url: target.url,
    method: target.method,
    httpStatus,
    latencyMs: durationMs,
    responseHeaders,
    responsePayload: rawPayload,
    anomalies: validation.anomalies,
    resilienceScore: validation.resilienceScore,
    passed: validation.passed,
    fuzzingApplied:
      fuzzing.injectNulls ||
      fuzzing.injectTypeCoercion ||
      fuzzing.injectUnexpectedFields ||
      fuzzing.simulateLatencyMs > 0,
    fuzzingLog
  };
}
