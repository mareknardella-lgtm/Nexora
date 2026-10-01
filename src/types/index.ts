/**
 * Nexora Sentinel — Core Type Definitions
 * EurekaDEV 2026 (Coding Track: Computer Science + AI)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AnomalyType =
  | 'FIELD_REMOVED'
  | 'TYPE_MISMATCH'
  | 'ENUM_VIOLATION'
  | 'NULLABILITY_VIOLATION'
  | 'SEMANTIC_MUTATION'
  | 'SILENT_200_ERROR'
  | 'LATENCY_SPIKE'
  | 'HEADER_DEPRECATION';

export interface ContractDriftAnomaly {
  id: string;
  path: string; // JSONPath e.g. "$.data.amount"
  severity: AnomalySeverity;
  type: AnomalyType;
  expected: string | number | boolean | object | null;
  actual: string | number | boolean | object | null;
  message: string;
  impact: string;
  breaking: boolean;
}

export interface EndpointPreset {
  id: string;
  title: string;
  subtitle: string;
  service: string;
  badge: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  expectedSchema: Record<string, any>;
  liveSimulatedPayload: Record<string, any>;
  liveSimulatedStatus: number;
  liveSimulatedHeaders: Record<string, string>;
  description: string;
  realWorldContext: string;
  incidentCategory: 'Fintech Payment' | 'Identity & Auth' | 'Microservice Gateway' | 'E-Commerce Logistics';
}

export interface FuzzingOptions {
  injectTypeCoercion: boolean;
  injectNulls: boolean;
  injectUnexpectedFields: boolean;
  simulateLatencyMs: number;
  enforceStrictEnums: boolean;
}

export interface ProbeExecutionResult {
  id: string;
  timestamp: string;
  url: string;
  method: HttpMethod;
  httpStatus: number;
  latencyMs: number;
  responseHeaders: Record<string, string>;
  responsePayload: any;
  anomalies: ContractDriftAnomaly[];
  resilienceScore: number; // 0-100
  passed: boolean;
  fuzzingApplied: boolean;
  fuzzingLog: string[];
}

export interface AiDiagnosticReport {
  rootCause: string;
  summary: string;
  severity: AnomalySeverity;
  affectedComponents: string[];
  businessImpact: string;
  technicalDepth: string;
  confidenceScore: number; // 0.0 - 1.0
  suggestedAction: string;
  generatedClientPatch: string;
  generatedPythonAdapter: string;
  generatedOpenApiDiff: string;
  generatedVitestSuite: string;
  generatedGitHubActionWorkflow: string;
}

export interface SandboxVerificationResult {
  verified: boolean;
  originalError: string | null;
  patchedOutput: any;
  adapterExecutionTimeMs: number;
  assertionsPassed: number;
  totalAssertions: number;
  log: string[];
}

export interface IncidentAuditRecord {
  id: string;
  timestamp: string;
  scenarioTitle: string;
  url: string;
  method: HttpMethod;
  httpStatus: number;
  resilienceScore: number;
  anomaliesCount: number;
  criticalCount: number;
  remediated: boolean;
}

export interface PassiveSnifferPacket {
  id: string;
  timestamp: string;
  sourceService: string;
  targetService: string;
  method: HttpMethod;
  path: string;
  status: number;
  latencyMs: number;
  driftDetected: boolean;
  anomalyType?: AnomalyType;
}
