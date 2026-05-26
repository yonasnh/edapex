# ClassApex Production Readiness Checklist

**Application:** ClassApex LMS Modern UI
**Repository:** `canvas-modern-ui/apps/classapex-lms/`
**Stack:** React 18 + TypeScript + Vite 5 + Vitest + Playwright
**Target Platform:** Static SPA with Canvas LMS Backend Proxy
**Last Updated:** 2026-05-25

## 1. Executive Summary

This document provides the definitive go/no-go criteria, deployment procedures, and operational runbooks for deploying ClassApex to staging and production environments.

### Go / No-Go Decision Matrix

| Criteria | Status Gate | Owner | Go Threshold |
|----------|-------------|-------|--------------|
| All unit/integration tests passing | `Required` | QA / Eng | 100% pass rate (757+ tests) |
| Code coverage above baseline | `Required` | Eng | ≥48% statements, ≥66.6% branches, ≥35.3% functions |
| Build artifacts generated cleanly | `Required` | Eng | `vite build` exits 0 with zero warnings |
| Lighthouse score | `Required` | Eng | Performance ≥90, Accessibility ≥95, Best Practices ≥95 |
| Core Web Vitals | `Required` | Eng | LCP <2.5s, INP <200ms, CLS <0.1 |
| Security scan (CSP, headers, deps) | `Required` | Security | Zero critical/high vulnerabilities |
| Bundle size budget | `Required` | Eng | Main chunk <200KB gzipped; Total <800KB gzipped |
| OAuth flow validated end-to-end | `Required` | QA | Login → Token refresh → Logout flows pass |
| PWA service worker registered | `Required` | Eng | SW installs, offline page serves, no console errors |
| i18n smoke test (EN/ES/AR) | `Required` | QA | All three languages render without fallback errors |
| Canvas API proxy connectivity | `Required` | SRE | `/api/*` and `/login` proxy to Canvas without 5xx |
| Playbook reviewed by on-call | `Required` | SRE | On-call engineer acknowledges and has access to rollback |

**No-Go Conditions:** Any `Required` gate failing blocks deployment. Address the failure, re-run the gate, and re-convene before proceeding.

## 2. Pre-Deployment Checklist

### 2.1 Infrastructure Prerequisites

- [ ] **Node.js** runtime matches `.nvmrc` (or documented LTS) on build hosts
- [ ] **pnpm** workspace enabled; `canvas-modern-ui` root dependencies installed
- [ ] Static file host (CDN / S3 / nginx) provisioned with gzip/brotli support
- [ ] SSL/TLS certificate valid and auto-renewing for all public domains
- [ ] Canvas LMS backend (`localhost:3000` in dev; production Canvas instance) reachable from ClassApex origin
- [ ] Reverse proxy / load balancer configured for `/api` and `/login` passthrough
- [ ] DNS records point to the static host / CDN distribution
- [ ] PWA manifest and service worker served with `Cache-Control: no-cache` (or short TTL)

### 2.2 Build & Artifact Verification

- [ ] Workspace packages `@schoolapex/core` and `@schoolapex/components` are built and version-locked
- [ ] `pnpm install --frozen-lockfile` succeeds at workspace root
- [ ] `pnpm --filter classapex-lms build` produces `dist/` with no errors or unexpected warnings
- [ ] `dist/` contains:
  - `index.html`
  - `assets/` (hashed JS/CSS chunks)
  - `manifest.json`
  - `sw.js` (or equivalent service worker output)
  - Locale JSON files for `en`, `es`, `ar`
- [ ] Source maps generated for staging; **disabled** for production (or uploaded to error tracker only)
- [ ] Integrity hashes verified if host supports SRI

### 2.3 Environment Variables & Secrets

- [ ] No secrets committed to repository (scan with `git-secrets` or `truffleHog`)
- [ ] `.env.production` file present on build host or injected by CI/CD vault
- [ ] All `VITE_*` build-time variables documented in Section 4
- [ ] Canvas OAuth `client_secret` stored in secrets manager, never in `vite-env.d.ts`
- [ ] Preview/staging environments use distinct Canvas OAuth app credentials
- [ ] Token encryption key (if used) rotated per environment and stored in HSM/vault

### 2.4 Dependency & Security Audit

```bash
# Run before every production build
pnpm audit --audit-level high
pnpm outdated --filter classapex-lms
```

- [ ] `pnpm audit` reports zero critical or high severity vulnerabilities
- [ ] `outdated` report reviewed; breaking changes assessed
- [ ] License scan passed (no GPL/viral licenses in bundled dependencies)

## 3. Deployment Runbook

### 3.1 Staging Deployment

| Step | Command / Action | Validation |
|------|------------------|------------|
| 1. Pull latest | `git pull origin main` | Commit hash matches release tag |
| 2. Install deps | `pnpm install --frozen-lockfile` | Lockfile unchanged |
| 3. Build workspace deps | `pnpm --filter "@schoolapex/*" build` | Core + Components build OK |
| 4. Build ClassApex | `pnpm --filter classapex-lms build` | `dist/` created, exit code 0 |
| 5. Sync to staging host | `aws s3 sync dist/ s3://classapex-staging-bucket/ --delete` (or rsync/scp) | All files transferred |
| 6. Invalidate CDN | `aws cloudfront create-invalidation --distribution-id EXXX --paths "/*"` | Invalidation status `InProgress` |
| 7. Verify proxy | `curl -I https://staging.classapex.example.com/api/v1/courses` | Returns `200` via Canvas backend |
| 8. Run smoke tests | See Section 11 | All checks pass |

### 3.2 Production Deployment

| Step | Command / Action | Validation |
|------|------------------|------------|
| 1. Confirm staging pass | Staging smoke tests and QA sign-off complete | Signed release ticket |
| 2. Tag release | `git tag -a v$(date +%Y.%m.%d)-$(git rev-parse --short HEAD) -m "Release ..."` | Tag pushed to remote |
| 3. Build production | `NODE_ENV=production pnpm --filter classapex-lms build` | No source maps emitted |
| 4. Upload artifacts | Sync `dist/` to production static host / CDN | Verify file count matches staging |
| 5. Set cache headers | `Cache-Control: public, max-age=31536000, immutable` on `assets/*` | Headers confirmed via curl |
| 6. Set HTML cache | `Cache-Control: no-cache` on `index.html` and `sw.js` | Prevents stale shell caching |
| 7. Invalidate CDN | CloudFront / Fastly / Cloudflare purge | Global TTL <5 minutes |
| 8. Enable feature flags | Set ClassApex features to `true` in Canvas feature flags (if applicable) | UI reflects toggled features |
| 9. Run smoke tests | See Section 11 | All checks pass |
| 10. Monitor for 30 min | Watch Sentry, error logs, and Canvas API metrics | Error rate <0.1% |

### 3.3 Canvas Proxy Configuration

ClassApex proxies `/api/*` and `/login` to the Canvas backend. Ensure your reverse proxy (nginx, Caddy, or CDN worker) is configured:

```nginx
# Example: nginx reverse proxy snippet
server {
  listen 443 ssl http2;
  server_name classapex.example.com;

  root /var/www/classapex/dist;
  index index.html;

  # API proxy to Canvas LMS
  location /api/ {
    proxy_pass https://canvas-backend.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 10s;
    proxy_read_timeout 30s;
  }

  # OAuth login proxy
  location /login/ {
    proxy_pass https://canvas-backend.example.com/login/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 4. Environment Configuration

### Required Environment Variables

| Variable | Scope | Example | Description |
|----------|-------|---------|-------------|
| `VITE_CANVAS_API_URL` | Build | `https://canvas.example.com` | Canvas LMS base URL (no trailing slash) |
| `VITE_CANVAS_CLIENT_ID` | Build | `1234567890` | OAuth2 client ID registered in Canvas |
| `VITE_APP_BASE_URL` | Build | `https://classapex.example.com` | Public origin of ClassApex SPA |
| `VITE_SENTRY_DSN` | Build | `https://...@sentry.io/...` | Sentry project DSN (optional but recommended) |
| `VITE_SENTRY_ENVIRONMENT` | Build | `production` | Sentry environment tag |
| `VITE_ENABLE_PWA` | Build | `true` | Toggle service worker registration |
| `VITE_OFFLINE_TIMEOUT_MS` | Build | `10000` | Offline detection threshold in milliseconds |
| `VITE_DEFAULT_LOCALE` | Build | `en` | Fallback locale code |
| `CANVAS_CLIENT_SECRET` | Runtime / Server | — | OAuth2 client secret (server-side only, never bundled) |
| `CANVAS_API_TOKEN` | Runtime / Server | — | Machine-user API token (server proxy only) |

### Environment File Templates

```bash
# .env.staging
VITE_CANVAS_API_URL=https://canvas-staging.example.com
VITE_CANVAS_CLIENT_ID=12345-staging
VITE_APP_BASE_URL=https://staging.classapex.example.com
VITE_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0000000
VITE_SENTRY_ENVIRONMENT=staging
VITE_ENABLE_PWA=true
VITE_OFFLINE_TIMEOUT_MS=10000
VITE_DEFAULT_LOCALE=en
```

```bash
# .env.production
VITE_CANVAS_API_URL=https://canvas.example.com
VITE_CANVAS_CLIENT_ID=12345-prod
VITE_APP_BASE_URL=https://classapex.example.com
VITE_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0000000
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_PWA=true
VITE_OFFLINE_TIMEOUT_MS=10000
VITE_DEFAULT_LOCALE=en
```

**Important:** Vite only exposes env vars prefixed with `VITE_` to the client bundle. Keep all secrets server-side.

## 5. Health Checks & Monitoring

### 5.1 What to Monitor

| Layer | Metric | Tool | Alert If |
|-------|--------|------|----------|
| CDN / Static Host | 5xx rate | CDN dashboard / nginx logs | >0.1% for 2 min |
| CDN / Static Host | Cache hit ratio | CDN analytics | <95% for 10 min |
| Application | JS error rate | Sentry | >0.5% of sessions in 5 min |
| Application | Failed API requests | `canvasFetch` telemetry / Sentry | >1% of total requests in 5 min |
| Application | PWA SW registration failures | Custom metric | Any spike >10/min |
| Application | Offline detection false positives | Custom metric | >5% of healthy users flagged offline |
| Canvas Proxy | Upstream latency (p95) | APM / nginx | >2s for 5 min |
| Canvas Proxy | 502/504 rate | nginx / load balancer | >0.5% for 2 min |
| OAuth | Token refresh failures | Sentry / logs | >1% of refresh attempts |

### 5.2 Service Level Objectives (SLOs)

| SLO | Target | Measurement Window |
|-----|--------|--------------------|
| Availability | 99.9% | 30-day rolling |
| Page Load (LCP) | <2.5s (p75) | 7-day rolling |
| Interaction (INP) | <200ms (p75) | 7-day rolling |
| API Response (p95) | <1.5s | 7-day rolling |
| Error Rate | <0.1% of requests | 1-day rolling |
| Successful Deploy | <15 min from build to smoke pass | Per deployment |

### 5.3 Alert Thresholds

```yaml
# Example Prometheus Alertmanager rules (conceptual)
groups:
  - name: classapex
    rules:
      - alert: ClassApexHighErrorRate
        expr: rate(sentry_errors_total[5m]) > 0.005
        for: 2m
        labels:
          severity: page
        annotations:
          summary: "ClassApex error rate elevated"

      - alert: ClassApexCanvasProxyDown
        expr: rate(nginx_upstream_5xx[2m]) > 0.001
        for: 2m
        labels:
          severity: page
        annotations:
          summary: "Canvas proxy returning 5xx"

      - alert: ClassApexBundleRegression
        expr: bundle_main_js_gzipped > 204800
        labels:
          severity: warning
        annotations:
          summary: "Main bundle exceeds 200KB budget"
```

## 6. Observability Stack

### 6.1 Recommended Tooling

| Concern | Recommended Tool | Integration Point |
|---------|------------------|-------------------|
| Error Tracking | Sentry | `Sentry.init()` in app entry; `canvasFetch` error wrapper |
| Real User Monitoring | Sentry Performance / Web Vitals | `@sentry/react` routing instrumentation |
| Logging | Structured JSON logs → Datadog / CloudWatch | Server-side proxy logs; client `console.error` forwarded sparingly |
| Synthetic Uptime | Pingdom / Grafana | HEAD request to `/index.html` every 60s |
| Bundle Analysis | `vite-bundle-visualizer` | CI artifact on every build |

### 6.2 Sentry Setup Guide

1. **Install SDK**

```bash
pnpm add @sentry/react @sentry/vite-plugin
```

2. **Configure Vite Plugin** (`vite.config.ts`)

```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true, // Upload maps to Sentry; do not serve to users
  },
  plugins: [
    // ... other plugins
    sentryVitePlugin({
      org: 'your-org',
      project: 'classapex-lms',
      authToken: process.env.SENTRY_AUTH_TOKEN, // CI-only
      release: process.env.VITE_APP_VERSION,
    }),
  ],
})
```

3. **Initialize in App Entry** (`src/main.tsx`)

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: __APP_VERSION__,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false }),
  ],
  tracesSampleRate: 1.0, // Staging: 1.0; Production: 0.1 after burn-in
  replaysSessionSampleRate: 0.0, // Enable selectively for user research
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Sanitize PII before transmission
    if (event.request?.headers?.Authorization) {
      delete event.request.headers.Authorization
    }
    return event
  },
})
```

4. **Instrument `canvasFetch`**

```typescript
// In your canvasFetch wrapper
import * as Sentry from '@sentry/react'

export async function canvasFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${import.meta.env.VITE_CANVAS_API_URL}${endpoint}`
  const span = Sentry.startSpan({ op: 'http.client', name: `GET ${endpoint}` }, async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    if (!response.ok) {
      Sentry.captureException(new Error(`Canvas API ${response.status}: ${endpoint}`))
    }
    return response.json()
  })
  return span
}
```

### 6.3 Web Vitals Reporting

```typescript
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  // Send to your analytics endpoint or Sentry
  Sentry.metrics.distribution(metric.name, metric.value, {
    unit: metric.name === 'CLS' ? 'none' : 'millisecond',
  })
}

onLCP(sendToAnalytics)
onINP(sendToAnalytics)
onCLS(sendToAnalytics)
onTTFB(sendToAnalytics)
```

## 7. Incident Response

### 7.1 Canvas API Down or Degraded

**Symptoms:** Users see loading spinners indefinitely; `canvasFetch` throws; Sentry shows `TypeError: Failed to fetch` or 502/504.

**Runbook:**

1. Confirm Canvas backend status via direct `curl` to `VITE_CANVAS_API_URL`
2. Check reverse proxy logs for 502/504 vs. timeouts
3. If Canvas is down:
   - Enable maintenance mode banner (feature flag or CDN error page)
   - Display cached offline content where possible (PWA cache)
   - Post status page update
4. If Canvas is slow (not down):
   - Increase request timeouts temporarily (do not exceed 30s)
   - Enable request coalescing / caching at proxy layer
   - Alert Canvas infrastructure team if external dependency
5. Communicate in `#incidents` with ETA from Canvas team

### 7.2 OAuth Token Expired / Auth Loop

**Symptoms:** Users redirected to `/login` repeatedly; `401 Unauthorized` on `/api/v1/users/self`.

**Runbook:**

1. Verify Canvas OAuth app `client_id` and redirect URI match `VITE_APP_BASE_URL`
2. Check if refresh token flow is implemented; if not, implement or reduce `access_token` TTL expectations
3. Clear affected users' `localStorage` / `sessionStorage` tokens as temporary remediation
4. If widespread, deploy emergency patch to force re-authentication with clear messaging
5. Rotate `client_secret` only if compromise suspected; coordinate with Canvas admin

### 7.3 429 Rate Limit from Canvas

**Symptoms:** API responses return `429 Too Many Requests`; Sentry shows rate limit errors.

**Runbook:**

1. Inspect response headers: `X-Rate-Limit-Remaining` and `X-Request-Cost`
2. Identify high-volume endpoint (likely paginated list or polling loop)
3. Implement / tune request throttling in `canvasFetch`:

```typescript
// Exponential backoff with jitter
async function fetchWithBackoff(url: string, options: RequestInit, retries = 3): Promise<Response> {
  const response = await fetch(url, options)
  if (response.status === 429 && retries > 0) {
    const delay = Math.pow(2, 3 - retries) * 1000 + Math.random() * 1000
    await new Promise(r => setTimeout(r, delay))
    return fetchWithBackoff(url, options, retries - 1)
  }
  return response
}
```

4. Reduce polling frequency; prefer server-sent events or webhooks if Canvas supports them
5. If limit is per-user and unavoidable, request limit increase from Canvas admin

### 7.4 New Deployment Causing Errors

**Symptoms:** Error spike correlates with deployment timestamp; specific routes broken.

**Runbook:**

1. Immediately execute rollback (Section 8)
2. Pin the broken release in Sentry; create issue with commit range
3. If rollback fails, serve previous `dist/` artifact from backup bucket
4. Post-mortem within 24 hours

## 8. Rollback Procedures

### 8.1 Fast Rollback (Preferred)

ClassApex is a static SPA — the fastest rollback is reverting the CDN to the previous artifact set.

```bash
# 1. Identify last known good artifact
LAST_GOOD=$(cat /deploy/classapex-prod-last-known-good.txt)

# 2. Re-sync from versioned artifact bucket
aws s3 sync s3://classapex-artifacts/$LAST_GOOD/ s3://classapex-prod-bucket/ --delete

# 3. Invalidate CDN
aws cloudfront create-invalidation --distribution-id EXXX --paths "/*"

# 4. Verify smoke tests (Section 11)
```

### 8.2 Git-Based Rollback

If artifact versioning is unavailable, rebuild from last good tag:

```bash
git fetch --tags
git checkout $(git describe --tags --abbrev=0 --exclude="$(git describe --tags --abbrev=0)")
pnpm install --frozen-lockfile
pnpm --filter "@schoolapex/*" build
pnpm --filter classapex-lms build
# Deploy dist/ as in Section 3
```

### 8.3 Emergency Toggle

If the issue is feature-specific and not a total outage:

- Use Canvas feature flags (if integrated) to disable the affected feature
- Or use a runtime config flag served from `/config.json` (cached short-TTL) to disable routes

### 8.4 Rollback Checklist

- [ ] Previous artifact hash or tag identified and verified
- [ ] CDN invalidation issued
- [ ] Smoke tests pass within 10 minutes
- [ ] Error rate returns to baseline in Sentry
- [ ] Incident timeline documented
- [ ] Post-mortem scheduled

## 9. Security Checklist

### 9.1 Content Security Policy (CSP)

Serve the following CSP via response header or `<meta>` tag (header preferred):

```http
Content-Security-Policy:
  default-src 'self';
  connect-src 'self' https://canvas.example.com https://sentry.io;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  font-src 'self';
  manifest-src 'self';
  worker-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self' https://canvas.example.com;
```

- [ ] `unsafe-inline` for scripts is minimized (use nonces if hosting supports dynamic injection)
- [ ] `frame-ancestors 'none'` prevents clickjacking
- [ ] No `*` wildcards in `connect-src`

### 9.2 CORS Configuration

- [ ] Canvas LMS CORS settings allow `VITE_APP_BASE_URL` for OAuth and API requests
- [ ] ClassApex static host does not send permissive `Access-Control-Allow-Origin: *`
- [ ] Credentials mode (`include`) only used with explicit origin, never `*`

### 9.3 Token Handling

- [ ] OAuth `access_token` stored in `memory` preferred; `localStorage` only if refresh token strategy requires it
- [ ] `refresh_token` never exposed to client bundle; handled by server proxy if possible
- [ ] Token expiry checked before every `canvasFetch` call
- [ ] On logout, tokens cleared from all storage and Canvas session invalidated via `/api/v1/logout`
- [ ] `Secure`, `HttpOnly`, and `SameSite=Strict` flags on all cookies set by proxy layer

### 9.4 XSS Prevention

- [ ] React's automatic escaping relied upon; no `dangerouslySetInnerHTML` without DOMPurify
- [ ] User-generated content from Canvas (assignments, announcements) sanitized before rendering if HTML is injected
- [ ] All URL parameters validated with Zod or similar schema before use
- [ ] No eval or `new Function()` usage in dependencies (verify with `pnpm why` if found)

### 9.5 Dependency Supply Chain

- [ ] `.npmrc` / `.pnpmfile.cjs` prevents accidental registry substitution
- [ ] Lockfile (`pnpm-lock.yaml`) committed and `frozen-lockfile` enforced in CI
- [ ] Renovate / Dependabot configured for automated patch updates

## 10. Performance Budgets

### 10.1 Bundle Size Limits

| Chunk | Max Size (Gzipped) | Enforcement |
|-------|--------------------|-------------|
| `index.html` + entry | <50KB | CI check |
| Main JS chunk | <200KB | CI check (`vite-bundle-visualizer` + script) |
| Total initial JS | <500KB | Lighthouse audit |
| Total initial CSS | <50KB | Lighthouse audit |
| All lazy-loaded routes (combined) | <400KB | `rollup-plugin-analyzer` review |
| Runtime images / icons | <200KB | `imagemin` in build pipeline |
| **Total app budget** | **<800KB gzipped** | Deployment gate |

### 10.2 Lighthouse Targets

| Category | Staging | Production |
|----------|---------|------------|
| Performance | ≥90 | ≥90 |
| Accessibility | ≥95 | ≥98 |
| Best Practices | ≥95 | ≥100 |
| SEO | ≥90 | ≥95 (if public pages exist) |
| PWA | Pass | Pass |

### 10.3 Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor | Monitor |
|--------|------|-------------------|------|---------|
| LCP | ≤2.5s | 2.5s–4.0s | >4.0s | Real user data (p75) |
| INP | ≤200ms | 200ms–500ms | >500ms | Real user data (p75) |
| CLS | ≤0.1 | 0.1–0.25 | >0.25 | Real user data (p75) |
| TTFB | ≤600ms | 600ms–1.8s | >1.8s | Real user data (p75) |
| FCP | ≤1.8s | 1.8s–3.0s | >3.0s | Synthetic |

### 10.4 CI Enforcement Script

Add to `package.json` scripts or CI pipeline:

```json
{
  "scripts": {
    "build:analyze": "vite-bundle-visualizer --template treemap",
    "perf:budget": "node scripts/check-bundle-budget.js"
  }
}
```

```javascript
// scripts/check-bundle-budget.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { gzipSync } from 'zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '../dist/assets')
const MAX_MAIN = 200 * 1024

const files = fs.readdirSync(dist)
const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'))
const size = gzipSync(fs.readFileSync(path.join(dist, mainJs))).length

if (size > MAX_MAIN) {
  console.error(`Main bundle ${mainJs} is ${size}B (max ${MAX_MAIN}B)`)
  process.exit(1)
}
console.log(`Bundle budget OK: ${size}B / ${MAX_MAIN}B`)
```

## 11. Post-Deployment Validation

Run this checklist within 10 minutes of every staging and production deployment.

### 11.1 Smoke Test Checklist

- [ ] **Load SPA** — `GET /` returns `200` with `index.html`
- [ ] **Assets load** — No 404s on JS/CSS chunks in DevTools Network tab
- [ ] **Service Worker** — SW registers; "Add to Home Screen" prompt eligible (if PWA enabled)
- [ ] **Offline shell** — Enable airplane mode; reload app; offline fallback page renders
- [ ] **OAuth login** — Click login → redirected to Canvas → approve → returned with token → `/dashboard` loads
- [ ] **Token refresh** — Wait for token expiry (or force via devtools) → refresh succeeds silently
- [ ] **API connectivity** — Dashboard loads courses list from `/api/v1/courses`
- [ ] **Lazy routes** — Navigate to all 21 lazy-loaded routes; no chunk load errors
- [ ] **i18n switching** — Switch language to ES then AR; UI re-renders with correct translations
- [ ] **RTL layout** — Arabic (`ar`) layout renders right-to-left without visual regressions
- [ ] **Error boundary** — Trigger a JS error (e.g., invalid prop in console) → error boundary catches and shows friendly message
- [ ] **404 handling** — Visit `/nonexistent` → SPA router shows custom 404 page
- [ ] **Viewport responsiveness** — Spot-check mobile (375px), tablet (768px), desktop (1440px)

### 11.2 Automated Smoke Test Script

```bash
#!/bin/bash
# scripts/smoke-test.sh
set -e
BASE_URL=${1:-https://classapex.example.com}

echo "Smoke testing $BASE_URL..."

# 1. Health
curl -sf -o /dev/null "$BASE_URL" || { echo "FAIL: Root unreachable"; exit 1; }

# 2. Manifest
curl -sf -o /dev/null "$BASE_URL/manifest.json" || { echo "FAIL: manifest missing"; exit 1; }

# 3. API proxy
curl -sf -o /dev/null "$BASE_URL/api/v1/courses" -H "Authorization: Bearer $TEST_TOKEN" || { echo "WARN: API proxy may need auth"; }

# 4. No index.html caching issues
curl -sI "$BASE_URL" | grep -i "cache-control" | grep -q "no-cache" || echo "WARN: index.html may be cached too long"

echo "Smoke tests passed."
```

### 11.3 Sign-Off

| Role | Sign-Off Required | Check |
|------|-------------------|-------|
| Release Engineer | Build & deploy completed | [ ] |
| QA Lead | Smoke tests and exploratory pass | [ ] |
| SRE | Monitoring dashboards green | [ ] |
| Product Owner | Feature acceptance (if applicable) | [ ] |

## 12. Appendix: Docker Compose for Full Stack

Use this configuration to run Canvas LMS (backend) and ClassApex (frontend) together locally or in a demo environment.

```yaml
# docker-compose.classapex.yml
version: "3.9"

services:
  canvas:
    image: instructure/canvas-lms:stable
    container_name: canvas-lms
    ports:
      - "3000:3000"
    environment:
      - RAILS_ENV=development
      - DATABASE_URL=postgres://canvas:canvas@postgres:5432/canvas
      - REDIS_URL=redis://redis:6379/0
      - CANVAS_DOMAIN=localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - canvas-assets:/usr/src/app/public
    networks:
      - classapex-net

  postgres:
    image: postgres:15-alpine
    container_name: canvas-postgres
    environment:
      POSTGRES_USER: canvas
      POSTGRES_PASSWORD: canvas
      POSTGRES_DB: canvas
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U canvas"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - classapex-net

  redis:
    image: redis:7-alpine
    container_name: canvas-redis
    networks:
      - classapex-net

  classapex:
    build:
      context: ../../..  # canvas-modern-ui/
      dockerfile: apps/classapex-lms/Dockerfile
    container_name: classapex-ui
    ports:
      - "5173:80"
    environment:
      - VITE_CANVAS_API_URL=http://localhost:3000
      - VITE_CANVAS_CLIENT_ID=10000000000001
      - VITE_APP_BASE_URL=http://localhost:5173
      - VITE_ENABLE_PWA=true
    depends_on:
      - canvas
    networks:
      - classapex-net

  nginx:
    image: nginx:alpine
    container_name: classapex-proxy
    ports:
      - "80:80"
    volumes:
      - ./nginx.classapex.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - classapex
      - canvas
    networks:
      - classapex-net

volumes:
  canvas-assets:
  postgres-data:

networks:
  classapex-net:
    driver: bridge
```

### ClassApex Dockerfile

```dockerfile
# apps/classapex-lms/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/classapex-lms ./apps/classapex-lms
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@schoolapex/*" build
RUN pnpm --filter classapex-lms build

FROM nginx:alpine
COPY --from=builder /app/apps/classapex-lms/dist /usr/share/nginx/html
COPY apps/classapex-lms/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Quick Start Commands

```bash
# 1. Start the full stack
docker compose -f docker-compose.classapex.yml up -d

# 2. Seed Canvas (first time only)
docker compose -f docker-compose.classapex.yml exec canvas \
  bundle exec rails db:setup

# 3. Verify endpoints
curl http://localhost:3000/api/v1/courses  # Canvas API
curl http://localhost:5173                 # ClassApex SPA
curl http://localhost/api/v1/courses       # Proxied through nginx

# 4. View logs
docker compose -f docker-compose.classapex.yml logs -f classapex

# 5. Stop everything
docker compose -f docker-compose.classapex.yml down -v
```

---

**Document Owners:** SRE Team + ClassApex Engineering
**Review Cycle:** Quarterly or after every major incident
**Questions:** `#classapex-ops` on Slack / classapex-ops@example.com
