import { describe, it, expect } from 'vitest';
import { runSandboxVerification } from '../lib/engine/sandbox-executor';
import { INCIDENT_PRESETS } from '../lib/scenarios/incident-presets';
import { ProbeExecutionResult } from '../types';

describe('Nexora Sentinel: In-Browser Sandbox Fix Verification', () => {
  it('verifies resolution of payment intent cents drift', () => {
    const preset = INCIDENT_PRESETS[0];
    const probeResult: ProbeExecutionResult = {
      id: 'probe_test',
      timestamp: new Date().toISOString(),
      url: preset.url,
      method: preset.method,
      httpStatus: 200,
      latencyMs: 42,
      responseHeaders: {},
      responsePayload: preset.liveSimulatedPayload,
      anomalies: [
        {
          id: 'a1',
          path: '$.amount',
          severity: 'CRITICAL',
          type: 'SEMANTIC_MUTATION',
          expected: '49.99',
          actual: 4999,
          message: 'Cents shift',
          impact: 'Financial calculation error',
          breaking: true
        }
      ],
      resilienceScore: 65,
      passed: false,
      fuzzingApplied: false,
      fuzzingLog: []
    };

    const verification = runSandboxVerification(probeResult, preset);

    expect(verification.verified).toBe(true);
    expect(verification.assertionsPassed).toBe(verification.totalAssertions);
    expect(verification.patchedOutput.amountDollars).toBe(49.99);
    expect(verification.patchedOutput.amountCents).toBe(4999);
    expect(verification.patchedOutput.status).toBe('succeeded');
    expect(verification.originalError).toContain('Silent Calculation Error');
  });

  it('verifies resolution of Auth0 user profile breaking deletion', () => {
    const preset = INCIDENT_PRESETS[1];
    const probeResult: ProbeExecutionResult = {
      id: 'probe_test_auth',
      timestamp: new Date().toISOString(),
      url: preset.url,
      method: preset.method,
      httpStatus: 200,
      latencyMs: 38,
      responseHeaders: {},
      responsePayload: preset.liveSimulatedPayload,
      anomalies: [
        {
          id: 'a2',
          path: '$.email_verified',
          severity: 'CRITICAL',
          type: 'FIELD_REMOVED',
          expected: 'boolean',
          actual: 'undefined',
          message: 'Missing field',
          impact: 'TypeError',
          breaking: true
        }
      ],
      resilienceScore: 50,
      passed: false,
      fuzzingApplied: false,
      fuzzingLog: []
    };

    const verification = runSandboxVerification(probeResult, preset);

    expect(verification.verified).toBe(true);
    expect(verification.patchedOutput.userId).toBe('auth0|8491028471a');
    expect(verification.patchedOutput.emailVerified).toBe(true);
    expect(verification.originalError).toContain('TypeError');
  });
});
