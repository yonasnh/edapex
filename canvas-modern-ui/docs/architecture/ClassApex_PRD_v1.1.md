
# ClassApex — Carbon Framework Theme for Canvas LMS (REVIEWED & EXTENDED)
**Document:** Product Requirement & Technical Specification (PRD)  
**Version:** 1.1 (Reviewed by: Full‑Stack Architect)  
**Date:** 2025-08-09  
**Author:** ClassApex Engineering (maintainers: UI Lead, Frontend Eng, Platform Eng)  
**Summary of changes vs v1.0:**  
- Expanded security, compliance, and operational requirements (SLOs, incident handling, secrets, key rotation).  
- Added concrete API endpoints, DB schema, ERD, and sample payloads for LTI endpoints.  
- Improved CI/CD, infrastructure, and deployment guidance (staging/prod, IaC recommendation, blue/green).  
- Detailed testing plan (load tests, integration, pen test), observability metrics, alert thresholds, and runbook.  
- Added legal/commercial pilot contract checklist and pricing/acceptance details.  
- Added explicit risk/mitigation matrix and escalation policies.

---

## Table of contents
1. Executive summary  
2. Scope & non-goals (unchanged)  
3. Constraints, assumptions & compliance (expanded)  
4. Architecture overview (logical & infra)  
5. Detailed technical design — Theme (ClassApex Carbon) (expanded)  
6. Detailed technical design — LTI Rubric Service (ClassApex LTI) (expanded)  
7. APIs, DB schema, and sample payloads (new)  
8. Security, privacy & compliance (new)  
9. Observability, SLOs, metrics and alerts (new)  
10. Build, CI/CD, IaC & release (expanded)  
11. QA, testing, and acceptance (expanded)  
12. Ops, runbook & incident response (expanded)  
13. Pricing / pilot commercial checklist (new)  
14. Roadmap & next steps (refined)  
15. Risks & mitigations (expanded)  
16. Implementation checklist & timeline (detailed)  
17. Deliverables (refined)  
18. Appendix (tools, references, commands)

---

# 1. Executive summary (kept, clarified)
ClassApex packages a Carbon-based Canvas Theme and a hosted LTI 1.3 Rubric Generator as the first paid offering. The goal is to prove value (teacher time saved, adoption) quickly with low legal/ops exposure. This document defines **how** to build, secure, deploy, test, and operate the MVP to professional industry standards and includes concrete engineering artifacts (APIs, schema, CI, runbooks).

**MVP success metrics (refined):**
- Functional: Theme + LTI installable and working on a Canvas test instance within 4 weeks; pilot onboarding complete in 6 weeks.  
- Adoption: ≥10 teachers in pilot used the LTI to create rubrics within 30 days of install.  
- Reliability: LTI uptime ≥ 99.5% during pilot; page-level performance: baseline FCP change <= +200 ms for representative pages (adjustable).  
- Cost control: AI spend per active teacher <= \$1/month during pilot (enforced by quotas).

---

# 2. Scope & non-goals
(As before — unchanged; keep explicit: no Canvas core edits, single-tenant pilot hosting only)

---

# 3. Constraints, assumptions & compliance (expanded)
**New additions:**
- **Data residency:** Pilot customers may require data residency (US-only). Architect LTI so that org data can be pinned to region-specific DB instances if necessary.  
- **Legal:** Prepare a lightweight DPA and template pilot agreement. Add an explicit clause in pilot contracts: "ClassApex provides theme + LTI services; core LMS is Canvas".  
- **Licensing Advisory:** Even though we won't modify core, maintainers must review third-party library licenses via SCA tooling (Dependabot/Snyk) to avoid incompatible license contamination.

---

# 4. Architecture overview (logical & infra)
## Logical components (refined)
- **Theme**: static assets uploaded to Canvas Theme Editor (CSS, JS). Minimal external domain calls.  
- **LTI Service**: Node.js (or Python) Web app, using LTI/OIDC for secure launch.  
- **AI Adapter**: abstraction layer for AI vendor with caching, cost control, and circuit-breaker.  
- **Auth & Provisioning**: per-org `deployments` table maps Canvas deployment_id to org config (quota, API tokens if used).  
- **Telemetry & Metrics**: events pipeline (PostHog/Amplitude or lightweight event DB + Prometheus metrics).  
- **Backup & DR**: nightly DB backups, weekly test restores, and documented RTO/RPO for pilot SLAs.

## Infra choices (recommendations)
- **MVP:** Hetzner VPS or Oracle Ampere + managed Postgres (Aiven). Docker Compose for process orchestration. Cloudflare for DNS, TLS, WAF.  
- **Stage/Prod:** use IaC (Terraform) and a managed Kubernetes solution (EKS/GKE or Hetzner K8s) for multi-pilot scale.  
- **Secrets:** GitHub Actions encrypted secrets + central secret manager (AWS Secrets Manager / HashiCorp Vault) for production.  
- **Storage:** Cloudflare R2 or S3-compatible for file assets; theme assets ideally served by Canvas (avoid cross-domain dependencies where possible).

### Diagram (ASCII)
```
[Canvas (platform) ] --(iframe)--> [ClassApex LTI Service] --> [AI Vendor]
       ^                                     |
       |                                     v
  Theme assets (CSS/JS) <--- GitHub Actions ---> Docker Image (GHCR)
```

---

# 5. Detailed technical design — Theme (ClassApex Carbon) (expanded best practices)
## 5.1 Robust mapping & upgrade resilience
- **Avoid brittle selectors:** use limited set of stable root selectors; maintain a `selectors.md` documenting each targeted Canvas selector with rationale and graceful fallback.  
- **Visual regression:** integrate Percy/Chromatic or open-source visual regression (Reg-snapshots) into CI to detect upstream Canvas changes that break theme. Run weekly against the latest Canvas markup snapshot.  
- **Feature flags:** support opt-in per-account tweaks via CSS custom properties; use a single JSON config file that admins can upload to Canvas or LTI to drive theme presets.

## 5.2 Accessibility and internationalization
- Add i18n scaffolding for theme labels and admin texts (en.json default). Include RTL support (mirror CSS). Provide accessible color palettes; implement a high-contrast toggle.

## 5.3 Packaging & distribution
- Build ZIP with `manifest.json` including metadata: name, version, author, supported Canvas versions, CSP host allowlist instructions. Provide SHA256 signature for releases.

---

# 6. Detailed technical design — LTI Rubric Service (ClassApex LTI) (expanded best practices)
## 6.1 LTI security & best practices
- **LTI 1.3** uses OAuth2 + OIDC. Implement these safeguards:
  - Validate JWT `iss`, `aud`, `exp`, `kid` against platform JWKS.  
  - Validate `nonce` and ensure `deployment_id` mapping exists.  
  - Enforce HTTPS, set `Secure` and `HttpOnly` on session cookies.  
- **Least-privilege scopes:** request only `url:POST|/api/v1/courses/*/rubrics` and optionally `url:GET|/api/v1/courses/*/users` if needed. Canvas scope string format varies; admin config JSON will be provided.

## 6.2 API resiliency
- Implement **circuit-breaker** (e.g., `opossum` for Node) around AI calls.  
- Use **exponential backoff** for Canvas API calls; retry at most 3 times on 429/5xx with jitter.  
- Implement **idempotency keys** for rubric create to prevent duplicates: derive key from deployment_id + course_id + timestamp + teacher_id and store in `rubrics_cache` table.

## 6.3 Cost controls & quota enforcement
- Per-org token counters in DB; admin API to top-up or pause. Quota checks before AI call and preflight to avoid surprises.  
- Alerts when org consumption >= 70% of quota; auto-suspend AI generation at 100% with informative UI.

## 6.4 Audit & traceability
- Store an **audit log** for every push to Canvas (user_id, course_id, action, timestamp, LTI launch id). Provide admin UI to export CSV.

---

# 7. APIs, DB schema, and sample payloads (new)
## 7.1 REST endpoints (public)
- `GET /.well-known/jwks.json` — JWKS for JWT verification of tool's signing keys (if ClassApex acts as OIDC).  
- `POST /lti/launch` — LTI launch endpoint (handled by ltijs). (public: POST from Canvas)  
- `GET /app` — LTI app UI (iframe) for teacher interaction.  
- `POST /api/v1/rubric/generate` — generate rubric (body: `{ "course_id": "...", "template": "...", "input": {...} }`) responds with `{ "rubric": {...}, "tokens_used": 123 }`.  
- `POST /api/v1/rubric/push` — push to Canvas: body `{ "course_id": "...", "rubric": { ... }, "idempotency_key": "..." }` returns `{ "status": "ok", "canvas_rubric_id": 98765 }`.  
- `GET /admin/orgs/:orgId/usage` — admin usage dashboard (auth required).  
- `POST /admin/orgs/:orgId/quota` — update quotas (admin only).  
- `GET /metrics` — Prometheus metrics (exposed on internal port only).

## 7.2 DB schema (simplified)
- `orgs` (id, name, canvas_deployment_id, ai_quota_tokens, ai_tokens_used, created_at, region)  
- `deployments` (id, org_id, client_id, public_jwk, platform_url, created_at)  
- `users` (id, org_id, canvas_user_id, role, last_launch_at)  
- `rubrics_cache` (idempotency_key, org_id, course_id, teacher_id, rubric_json, status, created_at)  
- `ai_usage` (id, org_id, tokens, cost_estimate, timestamp)  
- `audit_logs` (id, event_type, payload, user_id, org_id, created_at)

## 7.3 Sample rubric payload (simplified)
```json
{
  "rubric": {
    "title": "Essay Rubric - Thesis & Structure",
    "criteria": [
      {
        "description": "Thesis clarity",
        "points": 4,
        "ratings": [
          {"description": "Excellent", "points": 4},
          {"description": "Good", "points": 3},
          {"description": "Fair", "points": 2},
          {"description": "Poor", "points": 1}
        ]
      }
    ],
    "vendor_meta": { "generated_by": "classapex-ai-v1", "tokens": 184 }
  }
}
```
**Note:** adapt final shape to Canvas Rubrics API expected schema during implementation; include a translation layer.

---

# 8. Security, privacy & compliance (new detailed)
## 8.1 Security baseline (MUST)
- TLS 1.2+ enforced; HSTS header.  
- OWASP Top 10 mitigations: input validation, XSS protection, CSRF tokens for non-LTI endpoints, parameterized queries (avoid SQLi).  
- Use static code analysis (ESLint + security rules), and GitHub CodeQL. Run SCA (Dependabot / Snyk) in CI and fail on high CVEs.

## 8.2 Secrets & key rotation
- Private keys and API tokens stored in secrets manager. Rotate signing keys every 90 days or upon suspected compromise. Publish new JWKS and follow LTI rotation flow.

## 8.3 Data protection
- Default PII: store minimal teacher identifiers, no student PII in LTI logs. If a pilot requires teacher-student data, require a data-processing agreement and encrypt PII at rest with AES-256.

## 8.4 Compliance
- Prepare a pilot DPA template that covers GDPR articles and FERPA language. Keep data retention policy (default 90 days analytics; 365 days audit logs). Offer data export and deletion on request.

---

# 9. Observability, SLOs, metrics and alerts (new)
## 9.1 SLOs (pilot)
- Availability: 99.5% uptime (monthly).  
- API latency: 95th percentile rubric/generate <= 2s (without AI call; with AI call acceptable 95th <= 4s depending on vendor).  
- Error rate: <1% 5xx across endpoints.

## 9.2 Core metrics (Prometheus labels)
- `lti_launch_total{org_id="..."}`
- `rubric_generate_total{status="ok|error"}`
- `rubric_push_total{status="ok|error"}`
- `ai_tokens_consumed_total{org_id="..."}`
- `canvas_api_latency_seconds{endpoint="/rubrics",quantile="0.95"}`
- Host metrics: cpu_percent, mem_percent, disk_percent, db_connections.

## 9.3 Alerts (examples)
- Alert: ai_tokens_consumed_total increase > X in 1h → notify finance + ops.  
- Alert: error_rate > 2% in 15m → page on-call.  
- Alert: host_cpu > 85% for 10m → scale or investigate.

## 9.4 Logs & traces
- Send errors to Sentry with context (org_id, deployment_id, launch_id). Sample-rate high on pilot. Connect traces for slow AI calls.

---

# 10. Build, CI/CD, IaC & release (expanded)
## 10.1 Branching & promotion
- Branches: `main` (production), `staging`, `develop`. PRs require code review, passing tests, and security checks. Use semantic-release for releases.

## 10.2 GitHub Actions pipelines
- `PR` pipeline: lint, test, code-scan (CodeQL), build artifacts.  
- `merge to staging`: build docker image, push to GHCR, deploy to staging. Run integration smoke tests.  
- `release to main`: tag triggers production deployment with blue/green strategy and DB migration. Use feature flags for rollout.

## 10.3 IaC
- Provide Terraform modules for: DNS, VM/K8s cluster, managed Postgres, S3/R2 bucket, ACM certs, monitoring setup. Keep variables per environment.

## 10.4 Security in CI
- Secrets only via GH Encrypted secrets; ephemeral runners; SCA tools; require signed commits for release PRs.

---

# 11. QA, testing & acceptance (expanded)
## 11.1 Testing types & gates
- Unit tests coverage target >= 80% for LTI server code.  
- Integration tests: LTI launch, rubric push to mocked Canvas, AI stubbing.  
- E2E tests: Cypress for UI path (launch -> generate -> push -> verify).  
- Load tests: simulate 200 concurrent LTI launches and 50 concurrent AI requests; measure latencies. (Scale to higher targets if pilot demand indicates.)  
- Penetration test: contract 3rd party pen test before any broader deployment (post pilot). Fix critical issues within 30 days.

## 11.2 Acceptance gating
- All blocking issues resolved on staging; security scan passes; pilot acceptance criteria met.

---

# 12. Ops, runbook & incident response (expanded)
## 12.1 Incident severity definitions & SLAs
- Sev 1 (Critical): Production down for all users — page founders & on-call, full response within 30 mins.  
- Sev 2 (High): Major feature broken for many users — response within 2 hours.  
- Sev 3 (Medium): Single user or minor bug — response within 24 hours.

## 12.2 Runbook examples
- AI vendor outage: switch to template generator and show banner explaining degraded mode. Notify customers + incident postmortem.  
- Canvas API 401: verify deployment credentials, refresh tokens, check audit logs, escalate to platform.

## 12.3 On-call expectations
- Rotating guard among founders/engineers during pilot; documented on-call runbook with escalation matrix.

---

# 13. Pricing / pilot commercial checklist (new)
- **Pilot pricing example:** Setup fee \$2,000 (one-time), Pilot license \$500 for 6 months, AI Pack optional \$99/yr. Quotas: 10,000 tokens included, bill overages at \$0.02/100 tokens.  
- **Contract items:** scope, acceptance criteria, DPA, support hours (email support M-F 9-5 for pilot), escalation contacts, billing terms.

---

# 14. Roadmap & next steps (refined)
- Month 0–1: finalize theme + LTI core, infra & CI.  
- Month 1–2: internal QA, visual regression, start pilot onboarding.  
- Month 2–4: pilot run & iterate; sign 1–3 paid pilots.  
- Month 4–9: add features (AI Pack, analytics), commence multi-tenant planning if MRR and pilots justify.

---

# 15. Risks & mitigations (expanded table)
- **Licensing confusion**: publish clear customer-facing docs; involve counsel for DPA and trademark.  
- **AI abuse/cost**: quota enforcement, rate limits, billing, circuit-breaker.  
- **Ops debt**: maintain small surface area, document all infra steps, commit to runbook.

---

# 16. Implementation checklist & timeline (detailed with owners and estimates)
**Week 0 (Planning, 16–24 hrs)**
- Owners: PM + Tech Lead  
- Tasks: finalize PRD, procurement of test Canvas, domain, TLS.

**Week 1 (Theme skeleton, 40–60 hrs)**
- Owners: Frontend (+UI Lead)  
- Tasks: implement tokens, base components, build pipeline, initial upload.

**Week 2 (Theme polish & visual regression, 40–60 hrs)**
- Owners: Frontend + QA  
- Tasks: accessibility, mobile checks, add tests, document CSP allowlist.

**Week 3 (LTI scaffolding, 60–80 hrs)**
- Owners: Backend + Full-stack  
- Tasks: ltijs integration, DB models, JWKS endpoint, OIDC.

**Week 4 (Rubric generation & Canvas integration, 80–120 hrs)**
- Owners: Backend + Frontend + QA  
- Tasks: AI integration, caching, Canvas Rubrics API integration, idempotency.

**Week 5 (Security & QA, 40–80 hrs)**
- Owners: All engineers + QA  
- Tasks: SCA, CodeQL, lint, unit and e2e tests, load tests.

**Week 6 (Pilot prep & launch, 20–40 hrs)**
- Owners: PM + Tech Lead + Support  
- Tasks: onboarding docs, install, monitoring, first-day support.

Estimates assume two engineers + UI lead and part-time QA and can be adjusted.

---

# 17. Deliverables (refined)
- Repos with CI, release artifacts, theme zip, LTI docker image, infra templates (Terraform), runbooks, pilot contract + DPA, pilot acceptance report.

---

# 18. Appendix (commands, snippets & references)
- SCA: `npm audit`, Dependabot; CodeQL setup; `docker-compose` snippets; `ngrok` usage; `curl` examples for LTI launch simulation. (Detailed snippets available on request.)

---

## Final notes (architect's recommendations)
1. **Start narrow.** Ship theme + single high-value LTI (rubric generation). Keep surface area small.  
2. **Enforce cost control early.** AI quotas + alerts before any paid pilot.  
3. **Invest in observability.** You will iterate fast; good metrics and visual regression catch regressions early.  
4. **Legal minimalism.** Lightweight DPA and pilot contract protects you and accelerates sales.  
5. **Make automation first-class.** IaC, CI gating, automated releases and rollback save time and risk.

---

If you’d like, I will:
- (A) generate the **Canvas Developer Key JSON** and a sample `lti_config.json` ready for admin paste (with recommended scopes), **and**  
- (B) create a downloadable **starter repo skeleton** (Dockerfile, server skeleton with ltijs, package.json, CI workflow, Terraform stub) zipped and ready to run.

Which do you want me to produce next?  
