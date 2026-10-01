import { describe, it, expect } from 'vitest';
import { validateAgainstSchema } from '../lib/engine/schema-validator';

describe('Nexora Sentinel: Deterministic Schema & Invariant Validator', () => {
  const baseSchema = {
    type: 'object',
    required: ['id', 'amount', 'currency', 'status'],
    properties: {
      id: { type: 'string' },
      amount: { type: 'number', description: 'Transaction amount in decimal currency e.g. 49.99' },
      currency: { type: 'string', enum: ['usd', 'eur'] },
      status: { type: 'string', enum: ['succeeded', 'pending', 'failed'] }
    }
  };

  it('passes a 100% compliant payload with 100 resilience score', () => {
    const validPayload = {
      id: 'pi_valid_123',
      amount: 49.99,
      currency: 'usd',
      status: 'succeeded'
    };

    const report = validateAgainstSchema(validPayload, baseSchema, 200);

    expect(report.passed).toBe(true);
    expect(report.anomalies.length).toBe(0);
    expect(report.resilienceScore).toBe(100);
  });

  it('detects missing required fields and marks them CRITICAL breaking changes', () => {
    const brokenPayload = {
      id: 'pi_123',
      currency: 'usd'
      // missing amount and status!
    };

    const report = validateAgainstSchema(brokenPayload, baseSchema, 200);

    expect(report.passed).toBe(false);
    const missingAmount = report.anomalies.find((a) => a.path === '$.amount');
    const missingStatus = report.anomalies.find((a) => a.path === '$.status');

    expect(missingAmount).toBeDefined();
    expect(missingAmount?.type).toBe('FIELD_REMOVED');
    expect(missingAmount?.severity).toBe('CRITICAL');
    expect(missingStatus).toBeDefined();
  });

  it('detects semantic unit mutation (cents vs decimal dollars)', () => {
    const driftedPayload = {
      id: 'pi_drift_999',
      amount: 4999, // Integer cents instead of 49.99
      currency: 'usd',
      status: 'succeeded'
    };

    const report = validateAgainstSchema(driftedPayload, baseSchema, 200);

    const semanticAnomaly = report.anomalies.find((a) => a.type === 'SEMANTIC_MUTATION');
    expect(semanticAnomaly).toBeDefined();
    expect(semanticAnomaly?.severity).toBe('CRITICAL');
    expect(semanticAnomaly?.actual).toBe(4999);
  });

  it('catches Silent 200 OK Error Anti-Patterns', () => {
    const catalogSchema = {
      type: 'object',
      required: ['items'],
      properties: {
        items: { type: 'array' }
      }
    };

    const silentErrorPayload = {
      success: false,
      error: { code: 'GATEWAY_TIMEOUT', message: 'Downstream node unavailable' }
    };

    const report = validateAgainstSchema(silentErrorPayload, catalogSchema, 200);

    const silent200Anomaly = report.anomalies.find((a) => a.type === 'SILENT_200_ERROR');
    expect(silent200Anomaly).toBeDefined();
    expect(silent200Anomaly?.severity).toBe('CRITICAL');
  });

  it('detects type mismatches (number passed as string)', () => {
    const stringAmountPayload = {
      id: 'pi_test',
      amount: '49.99', // String instead of number
      currency: 'usd',
      status: 'succeeded'
    };

    const report = validateAgainstSchema(stringAmountPayload, baseSchema, 200);

    const typeAnomaly = report.anomalies.find((a) => a.path === '$.amount' && a.type === 'TYPE_MISMATCH');
    expect(typeAnomaly).toBeDefined();
    expect(typeAnomaly?.severity).toBe('CRITICAL');
  });
});
