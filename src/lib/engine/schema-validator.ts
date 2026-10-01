import { ContractDriftAnomaly } from '@/types';

export interface ValidationReport {
  anomalies: ContractDriftAnomaly[];
  resilienceScore: number;
  passed: boolean;
}

export function validateAgainstSchema(
  payload: any,
  schema: Record<string, any>,
  httpStatus: number = 200
): ValidationReport {
  const anomalies: ContractDriftAnomaly[] = [];

  // 1. Silent 200 Error Anti-Pattern Detection
  if (httpStatus >= 200 && httpStatus < 300 && payload && typeof payload === 'object') {
    const isErrorEnvelope =
      (payload.success === false && payload.error) ||
      (payload.error && typeof payload.error === 'object' && (payload.error.code || payload.error.message)) ||
      (typeof payload.error === 'string' && payload.items === undefined);

    const schemaExpectsSuccess =
      schema.properties &&
      (schema.properties.items || schema.properties.data || schema.properties.id) &&
      !schema.properties.error;

    if (isErrorEnvelope && schemaExpectsSuccess) {
      anomalies.push({
        id: `anomaly-silent-200-${Date.now()}`,
        path: '$',
        severity: 'CRITICAL',
        type: 'SILENT_200_ERROR',
        expected: 'HTTP 200 with standard resource payload',
        actual: JSON.stringify(payload.error || payload),
        message: 'Endpoint returned HTTP 200 OK but body contains an unhandled error envelope.',
        impact: 'Client parsers treat this as an empty dataset, concealing an active upstream outage from monitoring.',
        breaking: true
      });
    }
  }

  // 2. Schema Object Property Inspection
  if (schema && schema.type === 'object' && schema.properties && payload && typeof payload === 'object') {
    const properties = schema.properties;
    const requiredFields: string[] = Array.isArray(schema.required) ? schema.required : [];

    // Check required fields
    for (const field of requiredFields) {
      if (payload[field] === undefined) {
        anomalies.push({
          id: `anomaly-missing-${field}`,
          path: `$.${field}`,
          severity: 'CRITICAL',
          type: 'FIELD_REMOVED',
          expected: `Required field '${field}' (type: ${properties[field]?.type || 'any'})`,
          actual: 'undefined (field deleted or renamed)',
          message: `Required field '${field}' was removed from the response root.`,
          impact: `Client dereferencing (response.${field}) triggers TypeError: Cannot read property of undefined.`,
          breaking: true
        });
      }
    }

    // Inspect existing properties in payload against schema expectations
    for (const [key, propRule] of Object.entries<any>(properties)) {
      const val = payload[key];
      if (val === undefined) continue;

      // Nullability check
      if (val === null && propRule.nullable !== true) {
        anomalies.push({
          id: `anomaly-null-${key}`,
          path: `$.${key}`,
          severity: 'HIGH',
          type: 'NULLABILITY_VIOLATION',
          expected: `Non-null ${propRule.type}`,
          actual: null,
          message: `Field '${key}' is null, but contract does not permit null values.`,
          impact: 'Unchecked null values cause downstream formatting/math errors.',
          breaking: true
        });
        continue;
      }

      // Type check
      const expectedType = propRule.type;
      if (expectedType) {
        const actualType = Array.isArray(val) ? 'array' : typeof val;

        if (expectedType === 'number' && actualType !== 'number') {
          anomalies.push({
            id: `anomaly-type-${key}`,
            path: `$.${key}`,
            severity: 'CRITICAL',
            type: 'TYPE_MISMATCH',
            expected: 'number',
            actual: `${actualType} (${JSON.stringify(val)})`,
            message: `Field '${key}' expected number, received ${actualType}.`,
            impact: 'Mathematical calculations or chart renderings will yield NaN or crash.',
            breaking: true
          });
        } else if (expectedType === 'array' && !Array.isArray(val)) {
          anomalies.push({
            id: `anomaly-type-${key}`,
            path: `$.${key}`,
            severity: 'CRITICAL',
            type: 'TYPE_MISMATCH',
            expected: 'array',
            actual: `${actualType} (${JSON.stringify(val)})`,
            message: `Field '${key}' expected array, received ${actualType}.`,
            impact: 'Calls to .map(), .filter(), or .length will immediately throw runtime exceptions.',
            breaking: true
          });
        } else if (expectedType === 'string' && actualType !== 'string') {
          anomalies.push({
            id: `anomaly-type-${key}`,
            path: `$.${key}`,
            severity: 'HIGH',
            type: 'TYPE_MISMATCH',
            expected: 'string',
            actual: `${actualType} (${JSON.stringify(val)})`,
            message: `Field '${key}' expected string, received ${actualType}.`,
            impact: 'String manipulation routines (e.g. .toLowerCase(), regex) will fail.',
            breaking: true
          });
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          anomalies.push({
            id: `anomaly-type-${key}`,
            path: `$.${key}`,
            severity: 'HIGH',
            type: 'TYPE_MISMATCH',
            expected: 'boolean',
            actual: `${actualType} (${JSON.stringify(val)})`,
            message: `Field '${key}' expected boolean, received ${actualType}.`,
            impact: 'Falsy evaluation bugs may cause security or permission bypasses.',
            breaking: true
          });
        }
      }

      // Enum violation check
      if (Array.isArray(propRule.enum) && val !== null) {
        if (!propRule.enum.includes(val)) {
          anomalies.push({
            id: `anomaly-enum-${key}`,
            path: `$.${key}`,
            severity: 'HIGH',
            type: 'ENUM_VIOLATION',
            expected: `One of: [${propRule.enum.map((e: any) => `'${e}'`).join(', ')}]`,
            actual: `'${val}'`,
            message: `Value '${val}' is not in declared enum set.`,
            impact: 'Switch-case handlers or state machine transitions will fall through to unhandled default states.',
            breaking: true
          });
        }
      }

      // Semantic unit mutation detection (e.g., currency cents vs dollars)
      if (key === 'amount' || key === 'price' || key === 'total') {
        if (typeof val === 'number' && Number.isInteger(val) && val >= 100) {
          // If description mentions decimal currency and value is large integer
          const isDecimalSpec = propRule.description && propRule.description.toLowerCase().includes('decimal');
          if (isDecimalSpec || (val % 100 === 0 && val >= 1000)) {
            anomalies.push({
              id: `anomaly-semantic-${key}`,
              path: `$.${key}`,
              severity: 'CRITICAL',
              type: 'SEMANTIC_MUTATION',
              expected: 'Decimal currency representation (e.g. 49.99)',
              actual: val,
              message: `Suspected currency representation shift: value appears to be in integer cents (${val}) instead of decimal dollars (${(val / 100).toFixed(2)}).`,
              impact: 'Financial calculations or invoice rendering will overcharge/display values 100x larger than intended.',
              breaking: true
            });
          }
        }
      }
    }
  }

  // Calculate Resilience Score (0 to 100)
  let penalty = 0;
  for (const anomaly of anomalies) {
    switch (anomaly.severity) {
      case 'CRITICAL':
        penalty += 35;
        break;
      case 'HIGH':
        penalty += 20;
        break;
      case 'MEDIUM':
        penalty += 10;
        break;
      case 'LOW':
        penalty += 5;
        break;
    }
  }

  const resilienceScore = Math.max(0, 100 - penalty);
  const passed = anomalies.length === 0;

  return {
    anomalies,
    resilienceScore,
    passed
  };
}
