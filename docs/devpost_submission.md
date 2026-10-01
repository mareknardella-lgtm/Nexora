# Devpost Project Submission — EurekaDEV 2026

### Project Name
**Nexora Sentinel**

### One-line Description
An autonomous API resilience & contract drift intelligence platform that actively probes endpoints, diagnoses silent semantic payload mutations with AI, and synthesizes verified client patches with in-browser proof.

---

### Problem
Modern software applications are built on complex webs of third-party APIs and internal microservices. When upstream services update without bumping major versions, subtle breaking changes infiltrate production silently:
* Floating-point dollar amounts (`49.99`) convert to integer cents (`4999`) under ISO 4217 minor unit upgrades while returning HTTP `200 OK`.
* Edge gateways return HTTP `200 OK` carrying error envelopes (`{"success": false, "error": {...}}`) instead of expected datasets, fooling frontend clients into rendering "0 items found".
* Identity providers drop required root properties like `email_verified` in favor of nested objects, causing uncaught `TypeError` crashes in browser runtimes.

Conventional OpenAPI linters and static analysis tools only inspect static specification files during pull requests. They are completely blind to runtime payload mutations, scale shifts, and status code anti-patterns occurring in live environments.

---

### Why This Problem Matters
When an API contract silently drifts, traditional uptime monitors report 100% green health because the HTTP status is `200 OK`. Meanwhile, users experience checkout failures, incorrect charges, and crashes. Engineering teams lose hours of high-stress incident triage manually reading logs, reproducing payloads with `curl`, and writing fragile client monkey-patches.

---

### Solution
**Nexora Sentinel** bridges the gap between static design contracts and live runtime behavior. It provides an automated resilience studio where developers can:
1. Probe any API endpoint against its declared OpenAPI or JSON schema.
2. Apply synthetic invariant fuzzing (type coercion, nullability boundary tests, shadow fields, network jitter).
3. Detect runtime contract drift instantly with objective Resilience Scores (0–100).
4. Isolate root causes via a non-hallucinatory AI diagnostic engine that explains the architectural impact.
5. Generate production-ready TypeScript client adapters, OpenAPI 3.1 JSON patches, and Vitest test suites.
6. Verify the fix empirically in an in-browser sandbox that demonstrates 100% invariant recovery in 2 milliseconds.

---

### How It Works
1. **Active Probing & Fuzzing:** Nexora dispatches HTTP requests to the target endpoint, recording real response headers, payloads, and round-trip latency. It optionally injects synthetic boundary mutations to stress-test endpoint resilience.
2. **Deterministic AST Validation:** The response payload is diffed against the declared schema using strict structural rules, detecting removed required properties, type mismatches, and status code anti-patterns.
3. **AI Semantic Reasoning:** The anomaly report is ingested by an AI reasoning engine. Unlike naive LLM chatbots, Nexora performs structured inference: evaluating numerical scale shifts, identifying namespaced enum transitions, and estimating business impact.
4. **Autonomous Remediation Synthesis:** Nexora produces a resilient TypeScript client adapter that normalizes both old and new payload shapes, an RFC 6902 JSON Patch, and a Vitest regression test suite.
5. **Interactive In-Browser Sandbox Verification:** Developers click "VERIFY FIX IN SANDBOX" to see the unpatched client error alongside the normalized adapter output, with all automated assertions passing.

---

### Key Features
* **Dual-Engine Contract Analysis:** Combines strict AST schema diffing with semantic AI inference.
* **4 Curated Enterprise Incident Presets:** Immediate one-click testing of realistic production bugs (Fintech Payment Cents Drift, Auth0 Claim Deletion, Microservice Silent 200 Error, Logistics Coordinate Mutation).
* **Live Custom Endpoint Testing:** Test any external API or internal microservice with custom headers and schemas.
* **Synthetic Chaos & Invariant Fuzzer:** Interactive knobs for type coercion, null injection, shadow fields, and simulated network latency.
* **Objective Resilience Scoring (0–100):** Real-time weighted health grade penalizing breaking changes.
* **Embedded Monaco Code Workspace:** Full VS Code editor experience for inspecting and copying generated TypeScript adapters.
* **In-Browser Sandbox Proof:** Demonstrates the legacy client failure and verified adapter output side-by-side with zero manual setup.

---

### Technical Implementation
* **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Lucide Icons.
* **Code Editor:** `@monaco-editor/react`.
* **Testing:** Vitest, Playwright browser test suite.
* **Static Analysis:** Oxlint (0 warnings, 0 errors across all 24 source files).
* **Architecture:** Modular architecture dividing responsibilities across `src/types`, `src/lib/engine`, `src/lib/ai`, `src/lib/scenarios`, and `src/components`.

---

### Innovation
* **Semantic Contract Inference:** Catches numerical and semantic shifts that pass standard JSON schema validators because the mutated value is still technically a valid type.
* **Zero-Setup Judge Experience:** Includes a high-performance local deterministic reasoning engine alongside optional cloud LLM API support, ensuring 100% reliable evaluation even in offline or unauthenticated environments.
* **Closed-Loop Remediation:** Goes beyond reporting problems by synthesizing the executable adapter and verifying it in an interactive sandbox.

---

### Impact
Nexora Sentinel cuts API incident triage from hours to seconds. By catching contract drift early and synthesizing backward-compatible adapters automatically, development teams protect customers from silent outages and eliminate recurring emergency firefighting.

---

### Future Improvements
1. **GitHub Action & CI Bot:** Automatic PR comments with generated client patches whenever upstream OpenAPI specs change.
2. **eBPF Network Sniffer Agent:** Continuous passive observation of staging cluster API traffic to flag contract drift without synthetic probing.
3. **Automated SDK Publishing:** 1-click publishing of updated TypeScript / Python client SDK packages to npm and PyPI.
