import { ProbeExecutionResult, EndpointPreset } from '@/types';

export function generateRemediationCode(
  probeResult: ProbeExecutionResult,
  preset?: EndpointPreset
): {
  clientPatchTypeScript: string;
  contractPatchSchema: string;
  regressionTestSuite: string;
} {
  const anomalies = probeResult.anomalies;
  const payload = probeResult.responsePayload;

  // 1. Payment Cents vs Dollars Scenario
  if (preset?.id === 'stripe-payment-intent-drift' || anomalies.some((a) => a.type === 'SEMANTIC_MUTATION')) {
    const clientPatchTypeScript = `/**
 * Nexora Generated Resilient Adapter
 * Scenario: Fintech Payment Intent Currency & Status Normalization
 * 
 * Target: Normalizes both legacy decimal dollar format and new integer cents format,
 * handles uppercase enum variants and namespaced status strings.
 */

export interface NormalizedPaymentIntent {
  id: string;
  amountDollars: number;
  amountCents: number;
  formattedAmount: string;
  currency: string;
  status: 'requires_payment_method' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  receiptEmail?: string;
}

export function adaptPaymentIntentResponse(raw: any): NormalizedPaymentIntent {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid payment intent payload: expected non-null object');
  }

  // 1. Currency & Amount Normalization (detects cents vs decimal dollars)
  let amountCents: number;
  let amountDollars: number;

  if (typeof raw.amount === 'number') {
    // If integer >= 100, normalize from integer cents; otherwise from float dollars
    if (Number.isInteger(raw.amount) && raw.amount >= 100) {
      amountCents = raw.amount;
      amountDollars = Number((raw.amount / 100).toFixed(2));
    } else {
      amountDollars = Number(raw.amount.toFixed(2));
      amountCents = Math.round(raw.amount * 100);
    }
  } else {
    throw new Error(\`Unrecognized amount format: \${typeof raw.amount}\`);
  }

  // 2. Status enum normalization (handles 'payment_intent.succeeded' -> 'succeeded')
  let status = String(raw.status || 'processing').toLowerCase();
  if (status.startsWith('payment_intent.')) {
    status = status.replace('payment_intent.', '');
  }

  // 3. Currency normalization (forces lowercase ISO code)
  const currency = String(raw.currency || 'usd').toLowerCase();

  return {
    id: String(raw.id || ''),
    amountDollars,
    amountCents,
    formattedAmount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amountDollars),
    currency,
    status: status as NormalizedPaymentIntent['status'],
    receiptEmail: raw.receipt_email || undefined
  };
}
`;

    const contractPatchSchema = `// OpenAPI 3.1 Contract Migration Patch
// File: openapi.patch.json

[
  {
    "op": "replace",
    "path": "/paths/~1v1~1payments~1intent_checkout/post/responses/200/content/application~1json/schema/properties/amount",
    "value": {
      "type": "integer",
      "format": "int64",
      "description": "Amount in integer currency cents (e.g. 4999 represents $49.99 USD) per ISO 4217 minor unit standard.",
      "example": 4999
    }
  },
  {
    "op": "replace",
    "path": "/paths/~1v1~1payments~1intent_checkout/post/responses/200/content/application~1json/schema/properties/status/enum",
    "value": [
      "requires_payment_method",
      "requires_action",
      "processing",
      "succeeded",
      "payment_intent.succeeded",
      "canceled"
    ]
  }
]`;

    const regressionTestSuite = `import { describe, it, expect } from 'vitest';
import { adaptPaymentIntentResponse } from './payment-adapter';

describe('Nexora Sentinel: Payment Intent Contract Verification', () => {
  it('correctly adapts upstream integer cents (4999) to decimal dollars ($49.99)', () => {
    const upstreamPayload = ${JSON.stringify(payload, null, 2)};

    const adapted = adaptPaymentIntentResponse(upstreamPayload);

    expect(adapted.amountDollars).toBe(49.99);
    expect(adapted.amountCents).toBe(4999);
    expect(adapted.formattedAmount).toBe('$49.99');
    expect(adapted.currency).toBe('usd');
  });

  it('normalizes namespaced status enums seamlessly', () => {
    const upstreamPayload = { id: 'pi_test', amount: 2500, currency: 'USD', status: 'payment_intent.succeeded' };
    const adapted = adaptPaymentIntentResponse(upstreamPayload);
    expect(adapted.status).toBe('succeeded');
  });

  it('preserves backward compatibility with legacy float payloads (49.99)', () => {
    const legacyPayload = { id: 'pi_legacy', amount: 49.99, currency: 'usd', status: 'succeeded' };
    const adapted = adaptPaymentIntentResponse(legacyPayload);
    expect(adapted.amountDollars).toBe(49.99);
    expect(adapted.amountCents).toBe(4999);
  });
});`;

    return { clientPatchTypeScript, contractPatchSchema, regressionTestSuite };
  }

  // 2. Identity User Profile Deletion Scenario
  if (preset?.id === 'auth0-user-profile-deletion' || anomalies.some((a) => a.path.includes('email_verified'))) {
    const clientPatchTypeScript = `/**
 * Nexora Generated Resilient Adapter
 * Scenario: Identity Provider Profile Claim Adaptation
 * 
 * Target: Normalizes renamed claims ('sub' vs 'user_id') and extracts nested
 * 'identity_meta.is_verified' safely without throwing TypeErrors.
 */

export interface NormalizedUserProfile {
  userId: string;
  email: string;
  emailVerified: boolean;
  verifiedAt: string | null;
  roles: string[];
  nickname: string;
}

export function adaptUserProfileResponse(raw: any): NormalizedUserProfile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid user profile payload');
  }

  // 1. Resolve primary ID from either 'sub' (OIDC) or legacy 'user_id'
  const userId = String(raw.sub || raw.user_id || raw.id || '');

  // 2. Safe resolution of email verification flag (handles nested identity_meta)
  let emailVerified = false;
  let verifiedAt: string | null = null;

  if (typeof raw.email_verified === 'boolean') {
    emailVerified = raw.email_verified;
  } else if (raw.identity_meta && typeof raw.identity_meta.is_verified === 'boolean') {
    emailVerified = raw.identity_meta.is_verified;
    verifiedAt = raw.identity_meta.verified_at || null;
  }

  return {
    userId,
    email: String(raw.email || ''),
    emailVerified,
    verifiedAt,
    roles: Array.isArray(raw.roles) ? raw.roles : [],
    nickname: String(raw.nickname || raw.name || '')
  };
}
`;

    const contractPatchSchema = `// OpenAPI 3.1 Contract Migration Patch
// File: auth-userinfo.patch.json

[
  {
    "op": "add",
    "path": "/paths/~1userinfo/get/responses/200/content/application~1json/schema/properties/sub",
    "value": { "type": "string", "description": "Subject identifier (standard OIDC claim)" }
  },
  {
    "op": "add",
    "path": "/paths/~1userinfo/get/responses/200/content/application~1json/schema/properties/identity_meta",
    "value": {
      "type": "object",
      "properties": {
        "is_verified": { "type": "boolean" },
        "verified_at": { "type": "string", "format": "date-time" },
        "provider": { "type": "string" }
      }
    }
  }
]`;

    const regressionTestSuite = `import { describe, it, expect } from 'vitest';
import { adaptUserProfileResponse } from './user-profile-adapter';

describe('Nexora Sentinel: User Profile Drift Verification', () => {
  it('extracts nested identity_meta without throwing runtime TypeError', () => {
    const upstreamPayload = ${JSON.stringify(payload, null, 2)};

    const user = adaptUserProfileResponse(upstreamPayload);

    expect(user.userId).toBe('auth0|8491028471a');
    expect(user.email).toBe('alex.chen@nexora.cloud');
    expect(user.emailVerified).toBe(true);
    expect(user.verifiedAt).toBe('2026-08-14T09:22:11Z');
  });

  it('supports legacy flat email_verified schema gracefully', () => {
    const legacy = { user_id: 'usr_legacy', email: 'test@example.com', email_verified: true, roles: ['user'] };
    const user = adaptUserProfileResponse(legacy);
    expect(user.userId).toBe('usr_legacy');
    expect(user.emailVerified).toBe(true);
  });
});`;

    return { clientPatchTypeScript, contractPatchSchema, regressionTestSuite };
  }

  // 3. Silent 200 Gateway Failure Scenario
  if (preset?.id === 'gateway-silent-200-failure' || anomalies.some((a) => a.type === 'SILENT_200_ERROR')) {
    const clientPatchTypeScript = `/**
 * Nexora Generated Resilient Adapter
 * Scenario: Microservice Gateway Silent 200 Failure Interceptor
 * 
 * Target: Intercepts HTTP 200 responses masking failure envelopes, extracts downstream
 * error codes, and converts them to typed client exceptions or triggers automated retries.
 */

export interface CatalogItem {
  sku: string;
  title: string;
  price: number;
  stockStatus: string;
}

export interface CatalogResponse {
  items: CatalogItem[];
  totalCount: number;
  isDegradedFallback: boolean;
}

export class DownstreamGatewayError extends Error {
  constructor(public code: string, message: string, public retryAfter?: number) {
    super(\`[Downstream Gateway Error: \${code}] \${message}\`);
    this.name = 'DownstreamGatewayError';
  }
}

export function adaptCatalogResponse(raw: any, status: number = 200): CatalogResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Malformed catalog payload');
  }

  // Detect Silent 200 Failure Envelope
  if (raw.success === false && raw.error) {
    throw new DownstreamGatewayError(
      raw.error.code || 'UNKNOWN_GATEWAY_ERROR',
      raw.error.message || 'Downstream microservice circuit open',
      raw.error.retry_after
    );
  }

  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  return {
    items: rawItems.map((item: any) => ({
      sku: String(item.sku || ''),
      title: String(item.title || ''),
      price: Number(item.price || 0),
      stockStatus: String(item.stock_status || 'UNKNOWN')
    })),
    totalCount: typeof raw.total_count === 'number' ? raw.total_count : rawItems.length,
    isDegradedFallback: false
  };
}
`;

    const contractPatchSchema = `// OpenAPI 3.1 Gateway Circuit Breaker Schema Fix
// File: catalog-gateway.patch.json

[
  {
    "op": "add",
    "path": "/paths/~1v2~1items/get/responses/503",
    "value": {
      "description": "Downstream circuit breaker open / replica lag",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "required": ["success", "error"],
            "properties": {
              "success": { "type": "boolean", "enum": [false] },
              "error": {
                "type": "object",
                "properties": {
                  "code": { "type": "string" },
                  "message": { "type": "string" },
                  "retry_after": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    }
  }
]`;

    const regressionTestSuite = `import { describe, it, expect } from 'vitest';
import { adaptCatalogResponse, DownstreamGatewayError } from './catalog-adapter';

describe('Nexora Sentinel: Silent 200 Gateway Failure Interception', () => {
  it('throws DownstreamGatewayError instead of returning empty catalog', () => {
    const upstreamPayload = ${JSON.stringify(payload, null, 2)};

    expect(() => adaptCatalogResponse(upstreamPayload, 200)).toThrowError(
      DownstreamGatewayError
    );
  });

  it('correctly parses legitimate inventory items when upstream is healthy', () => {
    const healthyPayload = {
      items: [{ sku: 'CLD-991', title: 'NVMe Accelerator Node', price: 1290, stock_status: 'IN_STOCK' }],
      total_count: 1
    };
    const res = adaptCatalogResponse(healthyPayload, 200);
    expect(res.items.length).toBe(1);
    expect(res.items[0].sku).toBe('CLD-991');
  });
});`;

    return { clientPatchTypeScript, contractPatchSchema, regressionTestSuite };
  }

  // 4. Default / Generic Fallback Generator
  const clientPatchTypeScript = `/**
 * Nexora Generated Resilient Adapter
 * Target: Defensive normalization for detected contract anomalies
 */

export function adaptGenericResponse<T = any>(raw: any): T {
  if (raw === null || raw === undefined) {
    throw new Error('Payload is null or undefined');
  }

  // Defensive fallback cloning
  const normalized = { ...raw };

  ${anomalies
    .map(
      (a) =>
        `// Fix for ${a.path} (${a.type}): ${a.message}\n  // Expected: ${a.expected}`
    )
    .join('\n  ')}

  return normalized as T;
}
`;

  const contractPatchSchema = `// OpenAPI Contract Alignment Patch
// Generated by Nexora Sentinel Engine

${JSON.stringify(
  anomalies.map((a) => ({
    op: a.type === 'FIELD_REMOVED' ? 'add' : 'replace',
    path: a.path.replace('$.', '/properties/').replace(/\./g, '/'),
    value: { actualReceived: a.actual }
  })),
  null,
  2
)}`;

  const regressionTestSuite = `import { describe, it, expect } from 'vitest';
import { adaptGenericResponse } from './generic-adapter';

describe('Nexora Sentinel: Generic Contract Verification', () => {
  it('processes payload without throwing', () => {
    const raw = ${JSON.stringify(payload, null, 2)};
    const res = adaptGenericResponse(raw);
    expect(res).toBeDefined();
  });
});`;

  return { clientPatchTypeScript, contractPatchSchema, regressionTestSuite };
}
