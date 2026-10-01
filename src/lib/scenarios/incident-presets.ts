import { EndpointPreset } from '@/types';

export const INCIDENT_PRESETS: EndpointPreset[] = [
  {
    id: 'stripe-payment-intent-drift',
    title: 'Fintech Payment Intent Currency Shift',
    subtitle: 'Silent unit mutation: Decimal dollars -> Integer cents',
    service: 'Payment Gateway API',
    badge: 'Critical Financial Bug',
    method: 'POST',
    url: 'https://api.gateway.internal/v1/payments/intent_checkout_99a',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk_live_449102941094',
      'X-Idempotency-Key': '7f8a9b2c-e1f2-43d9-9302-39f82d1c0b3a'
    },
    incidentCategory: 'Fintech Payment',
    realWorldContext:
      'Upstream billing engine upgraded to ISO 4217 standard representation without incrementing major API version. It changed decimal dollar floats (49.99) to integer cents (4999), and changed the status enum format. Client apps silently charge or display 100x values to end-users.',
    description:
      'Upstream service changed "amount" field from decimal dollars (e.g. 49.99) to integer cents (e.g. 4999), and shifted "status" enum from "succeeded" to "payment_intent.succeeded".',
    expectedSchema: {
      type: 'object',
      required: ['id', 'amount', 'currency', 'status'],
      properties: {
        id: { type: 'string', pattern: '^pi_[a-zA-Z0-9]+$' },
        amount: {
          type: 'number',
          description: 'Transaction amount in standard decimal currency (e.g., 49.99)'
        },
        currency: { type: 'string', enum: ['usd', 'eur', 'gbp', 'cad'] },
        status: {
          type: 'string',
          enum: ['requires_payment_method', 'requires_action', 'processing', 'succeeded', 'canceled']
        },
        receipt_email: { type: 'string', format: 'email' }
      }
    },
    liveSimulatedStatus: 200,
    liveSimulatedHeaders: {
      'content-type': 'application/json; charset=utf-8',
      'x-api-version': '2026-09-15',
      'x-ratelimit-remaining': '984',
      'server': 'cloudflare'
    },
    liveSimulatedPayload: {
      id: 'pi_3MtwL24xY2mpLq72',
      amount: 4999, // MUTATION: Was 49.99, now integer cents!
      currency: 'USD', // MUTATION: Uppercase instead of lowercase enum
      status: 'payment_intent.succeeded', // MUTATION: Unexpected namespaced enum
      receipt_email: 'customer@enterprise.org',
      charges: {
        total_count: 1,
        data: [{ id: 'ch_8912', fee: 145, net: 4854 }]
      }
    }
  },
  {
    id: 'auth0-user-profile-deletion',
    title: 'Identity Provider Schema Breaking Deletion',
    subtitle: 'Required field dropped and nested under new structure',
    service: 'Okta / Auth0 Identity Core',
    badge: 'Breaking Null Pointer',
    method: 'GET',
    url: 'https://auth.company-cloud.net/userinfo',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIs...'
    },
    incidentCategory: 'Identity & Auth',
    realWorldContext:
      'The identity provider revised its OpenID Connect claims spec. It replaced root-level "email_verified" with a nested "identity_meta.is_verified" object and migrated "user_id" to the standard "sub" claim without backward compatibility headers.',
    description:
      'Required field "email_verified" was removed from top-level payload, causing client code (user.email_verified) to throw TypeError. "user_id" was renamed to "sub".',
    expectedSchema: {
      type: 'object',
      required: ['user_id', 'email', 'email_verified'],
      properties: {
        user_id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        email_verified: { type: 'boolean' },
        roles: { type: 'array', items: { type: 'string' } },
        nickname: { type: 'string' }
      }
    },
    liveSimulatedStatus: 200,
    liveSimulatedHeaders: {
      'content-type': 'application/json',
      'x-oauth-provider': 'Auth-V3-Edge',
      'cache-control': 'no-store'
    },
    liveSimulatedPayload: {
      sub: 'auth0|8491028471a', // MUTATION: user_id renamed to sub
      email: 'alex.chen@nexora.cloud',
      // MUTATION: email_verified missing!
      identity_meta: {
        is_verified: true, // Moved here!
        verified_at: '2026-08-14T09:22:11Z',
        provider: 'google-oauth2'
      },
      roles: ['team_admin', 'billing_manager'],
      nickname: 'Alex Chen'
    }
  },
  {
    id: 'gateway-silent-200-failure',
    title: 'Microservice Silent 200 Error Anti-Pattern',
    subtitle: 'HTTP 200 returned with error body instead of catalog items',
    service: 'Inventory Catalog Microservice',
    badge: 'Silent Data Loss',
    method: 'GET',
    url: 'https://catalog.retail-cluster.internal/v2/items?category=cloud-hardware',
    headers: {
      'Accept': 'application/json',
      'X-Tenant-Id': 'tenant_us_east_primary'
    },
    incidentCategory: 'Microservice Gateway',
    realWorldContext:
      'An internal API gateway proxy had a catch-all middleware configured to return 200 OK for circuit breaker fallbacks. When the downstream database degraded, the gateway serialized a failure envelope with HTTP 200 OK. Frontend and mobile clients treated it as 0 items found, misleading end customers.',
    description:
      'Gateway returns HTTP 200 OK but the payload contains an error envelope ({"success": false, "error": {...}}) instead of the expected catalog array ({"items": [...], "total_count": 48}).',
    expectedSchema: {
      type: 'object',
      required: ['items', 'total_count'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              title: { type: 'string' },
              price: { type: 'number' },
              stock_status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'BACKORDER'] }
            }
          }
        },
        total_count: { type: 'number' },
        page: { type: 'number' }
      }
    },
    liveSimulatedStatus: 200, // Anti-pattern: HTTP 200 with error payload!
    liveSimulatedHeaders: {
      'content-type': 'application/json',
      'x-circuit-state': 'half-open',
      'x-proxy-duration': '412ms'
    },
    liveSimulatedPayload: {
      success: false,
      error: {
        code: 'DOWNSTREAM_CIRCUIT_OPEN',
        message: 'Database replica synchronization lag exceeded 5000ms threshold',
        retry_after: 10
      },
      cached_fallback_available: false
    }
  },
  {
    id: 'logistics-coordinate-drift',
    title: 'Logistics Webhook Geo-Coordinates & Field Deprecation',
    subtitle: 'Coordinate array serialized as string & timestamp format changed',
    service: 'Global Fleet Tracking Webhook',
    badge: 'Type Coercion Failure',
    method: 'POST',
    url: 'https://telemetry.logistics.io/webhooks/v1/shipment_status',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': 'sha256=9f201bfa...'
    },
    incidentCategory: 'E-Commerce Logistics',
    realWorldContext:
      'A third-party freight API changed their geolocation telemetry export. Geocoordinates previously sent as numeric tuples [37.7749, -122.4194] were changed to a single comma-separated string "37.7749,-122.4194" to save egress bandwidth. Also, "estimated_days" integer was deleted in favor of a string date.',
    description:
      '"coordinates" changed from array of numbers to comma-separated string. "estimated_days" removed, breaking map visualization and delivery countdowns.',
    expectedSchema: {
      type: 'object',
      required: ['tracking_number', 'coordinates', 'estimated_days', 'status'],
      properties: {
        tracking_number: { type: 'string' },
        coordinates: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        },
        estimated_days: { type: 'number' },
        status: { type: 'string', enum: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'] }
      }
    },
    liveSimulatedStatus: 200,
    liveSimulatedHeaders: {
      'content-type': 'application/json',
      'x-fleet-carrier': 'AeroFreight-Express'
    },
    liveSimulatedPayload: {
      tracking_number: 'NEX-9921-XCA',
      coordinates: '37.7749,-122.4194', // MUTATION: string instead of [lat, lng] array
      // estimated_days is removed!
      estimated_delivery_iso: '2026-10-04T18:00:00Z',
      status: 'IN_TRANSIT',
      carrier_notes: 'Customs cleared at SFO logistics hub'
    }
  }
];
