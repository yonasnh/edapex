
# ClassApex — Carbon Framework Theme for Canvas LMS
**Document:** Product Requirement & Technical Specification (PRD)  
**Version:** 1.0  
**Date:** 2025-08-09  
**Author:** ClassApex Engineering (recommended maintainers: UI Lead, Frontend Eng, Platform Eng)  

---

# 1. Executive summary
ClassApex is a branded product package that delivers a modern, Carbon-based visual design system theme and a set of low-friction LTI add-ons for Canvas LMS. This PRD describes a *non-invasive* implementation approach: ship a **Canvas Theme** (CSS + safe JavaScript) built on Carbon design tokens and a hosted **LTI 1.3** rubric-generator tool. The deliverable is a testable MVP that can be installed into an existing Canvas instance (self-hosted or Instructure-hosted) without forking Canvas core.

**Primary goals for MVP (one-shot implementable):**
- Release a branded Carbon-based theme package that installs via Canvas Theme Editor.
- Deliver a hosted LTI 1.3 Rubric Generator that launches inside Canvas (iframe), generates rubric JSON (AI or template-driven), and pushes rubrics into the Canvas Rubrics API.
- Instrument activation and AI usage metrics for pilot acceptance testing.

**Success criteria (MVP):**
- Theme + LTI are installed and functional in a Canvas Free-for-Teacher test instance within 4–6 weeks.
- Pilot school (first customer) completes onboarding, and 10 teachers create course rubrics using the LTI tool in the pilot window (acceptance threshold).
- Demonstrable performance: Theme resources load on Canvas pages within ≤1s (first contentful paint on pilot infra) and do not break core Canvas flows (speedgrader, mobile view, course navigation).

---

# 2. Scope & non-goals
**In-scope for MVP:**
- Carbon-based CSS theme (SCSS → compiled CSS), minimal JS for UI niceties.
- Theme packaging: `dist/theme.min.css`, `dist/theme.js` and assets (icons, webfonts).
- LTI 1.3 app (hosted): OAuth/OIDC launch, teacher-role checks, rubric generation endpoint, push to Canvas Rubrics API, basic admin settings (per-org API mapping, AI quota).
- CI pipeline to build artifacts and produce theme zip for Canvas Theme Editor upload.
- Documentation: install guide for Canvas Admin, LTI install JSON, onboarding guide for teachers (Loom videos / Notion docs).
- Basic observability: logs, minimal analytics events (activation, rubric_generated, rubric_pushed, ai_tokens_consumed).

**Out-of-scope for MVP:**
- Forking or modifying Canvas core (no core changes).
- Multi-tenant Canvas hosting of entire LMS — single-tenant pilot hosting or LTI-hosting only.
- Advanced analytics platform, SOC2 compliance, enterprise SLA, or heavy legal deliverables — budget for these later.

---

# 3. Constraints, assumptions & compliance
**Constraints:**
- Budget: lean (founder-run). Use free-tier and low-cost managed services for early pilots.
- Legal: Canvas is AGPL-3.0. We do **not** modify core Canvas; theme and LTI are distinct artifacts to avoid network-copyleft obligations.
- CSP: Canvas instances may impose Content Security Policy — theme assets and LTI iframe must respect CSP and require allowlisting host domains by the admin.

**Assumptions:**
- Pilot customers will allow the theme and LTI installation via Canvas Admin console or Developer Keys.
- Canvas admin will permit adding a Developer Key / LTI tool and uploading theme CSS/JS files.
- OpenAI / external AI provider will be used for MVP rubric generation (metered, capped per-org); alternative: template-based generator as fallback.
- Pilot will use Canvas Free-for-Teacher or an existing Canvas instance for testing.

**Compliance & privacy:**
- Student PII minimization: LTI will avoid storing identifiable student data; scoped token usage will be teacher-focused. For any stored data, a simple DPA & retention policy will be prepared for pilot customers.

---

# 4. Architecture overview (logical)
**High-level components:**
1. **ClassApex Theme (frontend)** — SCSS + JS → compiled CSS/JS uploaded to Canvas Theme Editor; uses Carbon tokens mapped to Canvas selectors.
2. **ClassApex LTI Rubric Service (backend)** — Node.js/Express + `ltijs` (or Python equivalent), Dockerized, hosted on a secure domain (HTTPS). Offers endpoints for LTI launch, rubric generation, and push-to-Canvas.
3. **AI Service** — OpenAI or vendor API used by LTI to provide rubric drafts (metered).
4. **Managed DB** — Postgres for LTI sessions, deployment info, and admin settings (Aiven Hobby or managed provider for pilots).
5. **Observability** — Logging (Sentry), usage metrics (events to PostHog/Amplitude or simple DB events), and cost alarms for AI usage.
6. **CI/CD** — GitHub Actions to build and publish artifacts and push docker images to registry.

**Data flows (short):**
1. Teacher in Canvas clicks LTI launch → OIDC flow → LTI tool receives launch with context and scoped Canvas access info.  
2. Teacher uses LTI UI to “Generate Rubric” → LTI calls AI API (optional) → receives rubric JSON → LTI calls Canvas Rubrics API to create rubric in course context.  
3. LTI logs events, increments AI usage counters, and returns success to teacher (UI inside iframe).

---

# 5. Detailed technical design — Theme (ClassApex Carbon)
## 5.1 Design principles & mapping strategy
- **Non-invasive:** avoid DOM mutations that rely on internal Canvas markup beyond stable high-level class names. Prefer CSS variables and component-scoped overrides.  
- **Token-driven:** implement Carbon design tokens as CSS variables and map them to Canvas semantic tokens (primary, secondary, signals, typography scales).  
- **Accessibility-first:** aim for WCAG 2.1 AA contrast; all interactive elements keyboard-focusable; test with screenreaders.  
- **Performance:** CSS must be minified; JavaScript only for progressive enhancements; lazy-load large assets; host fonts on allowed domains or require admin allowlist.

## 5.2 SCSS architecture (recommended file layout)
```
/classapex-theme
├─ src/
│  ├─ scss/
│  │  ├─ _tokens.scss      // Carbon tokens as CSS variables
│  │  ├─ _variables.scss   // Canvas semantic mapping
│  │  ├─ _mixins.scss
│  │  ├─ _base.scss
│  │  ├─ _components/
│  │  │  ├─ _nav.scss
│  │  │  ├─ _button.scss
│  │  │  └─ _forms.scss
│  │  └─ theme.scss        // imports above and outputs compiled CSS
│  └─ js/
│     ├─ theme.js
│     └─ helpers.js
└─ package.json
```
**_tokens.scss** (sample):
```scss
:root {
  --ca-primary-100: #0f62fe;
  --ca-primary-90:  #0b5cff;
  --ca-gray-100:   #161616;
  --ca-bg:         #ffffff;
  --ca-surface:    #f4f4f4;
  --ca-gap:        1rem;
  --ca-font-stack: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  --ca-type-scale-1: 1rem; // 16px
  --ca-type-scale-2: 1.125rem; // 18px
}
```
**_variables.scss** (map to Canvas):
```scss
// Canvas semantic variables override
$canvas-body-bg: var(--ca-bg);
$canvas-text-color: var(--ca-gray-100);
$canvas-link-color: var(--ca-primary-100);
```
Use `postcss` to fallback CSS variables for older browsers if needed.

## 5.3 Component strategy & safe selectors
- Target high-level Canvas classes (e.g., `.ic-app-header`, `.ic-app-main`, `.ic-Nav`, `.speedgrader`), avoid relying on deeply nested markup or internal IDs.  
- Prefer adding CSS classes via Theme Editor custom JS only where Canvas supports `body` class injection or admin-provided per-account options.  
- Provide a small `data-` prefix (e.g., `data-classapex`) for your JS to scope behavior.

## 5.4 JavaScript patterns
- Keep JS minimal and unobtrusive. Use vanilla or tiny utility libs (no React in injected theme JS).  
- Use `defer` and small bundles (<30 KB gzipped). Avoid network calls except for progressive enhancement resources.  
- Example feature: color-palette picker that writes a small per-session `localStorage` override and publishes `--ca-primary` CSS variable on root.

## 5.5 Fonts & icons
- Use Inter or Carbon recommended type stack; supply WOFF2 files hosted on a trusted CDN. Because Canvas CSP may block remote fonts, document allowlist steps for admins. Offer a fallback system stack to avoid layout shifts if fonts are blocked.

---

# 6. Detailed technical design — LTI Rubric Generator (ClassApex LTI)
## 6.1 Requirements (MVP)
- LTI 1.3 / Advantage compliant and installable in Canvas via Developer Keys.  
- Authentication: OIDC for launch; support verifying `roles` claim to ensure only teachers can create rubrics.  
- Generate rubric JSON from (A) AI prompt (OpenAI), or (B) template presets.  
- Push rubric to Canvas Rubrics API for the launched `course_id`.  
- Admin dashboard (simple): show per-org usage, AI quota, API key placeholders.  

## 6.2 Technology stack (recommended)
- **Runtime:** Node.js 18+ (or Python 3.10+ if preferred).  
- **Framework:** Express (Node) + `ltijs` for LTI flows.  
- **DB:** Postgres (Aiven Hobby / managed), or SQLite for dev.  
- **Cache / session:** Redis optional (for scaling), local in-memory for MVP acceptable.  
- **Hosting:** Hetzner VPS, Oracle Ampere (dev), or small AWS EC2/GCP instance. Use managed TLS (Cloudflare/letsencrypt).  
- **AI:** OpenAI (GPT-4o-mini or cheaper variant) with conservative token usage. Cache generated templates to reduce repeated calls.  
- **Observability:** Sentry, log rotation, and usage events exported to a lightweight analytics (PostHog self-hosted or simple DB metrics).

## 6.3 LTI flow outline (technical)
1. Admin registers LTI tool using JSON or manual fields (provide both). Canvas generates `deployment_id`.  
2. Teacher launches tool from course (LTI OIDC). Canvas sends JWT-signed launch with `context` (course_id), `roles`, and `platform` info.  
3. LTI app validates launch (verify JWT signature, deployment).  
4. LTI app displays UI inside iframe (rubric draft UI).  
5. Teacher clicks "Generate" → LTI server calls AI, returns rubric preview.  
6. Teacher approves → LTI server calls Canvas Rubrics API `POST /api/v1/courses/:course_id/rubrics` using server-side Canvas access token (acquired via LTI scopes or saved API token).  
7. LTI returns success to iframe and optionally objects to the Canvas UI.  

**Important:** Request only minimum required scopes from Canvas (least privilege). Example scopes: `url:POST|/api/v1/courses/:id/rubrics` or generic LTI provisioning scopes as Canvas requires.

## 6.4 Security & privacy
- Use short-lived tokens from LTI launch; avoid storing user PII. If storing, encrypt at rest and keep retention policy.  
- Rate-limit AI calls per org and add per-org quotas in admin panel. Set alerts if cost thresholds are exceeded.  
- Serve only over TLS, validate JWKS on startup and on rotation, and rotate private keys when necessary.  
- Sanitize any content before pushing to Canvas APIs (avoid injection or malformed payloads).

---

# 7. Build, CI/CD & release
## 7.1 Local development
- Developer prerequisites: Node 18+, npm/yarn, Docker (for LTI local), ngrok (for Canvas to reach local LTI), Git.  
- Commands (examples):
```bash
# Theme
cd classapex-theme
npm install
npm run dev       # watch + sass compile
npm run build     # outputs dist/theme.min.css and dist/theme.js

# LTI (dev)
cd classapex-lti
cp .env.example .env
docker compose up --build
# expose public URL using ngrok: ngrok http 443
```
## 7.2 Continuous integration (GitHub Actions example)
- Workflow: on push to `main` build theme artifacts, run stylelint, run unit tests, build docker image, push to GHCR, and create release artifact (theme zip).  
- Example `ci.yml` tasks:
  - lint:sass, lint:js, test, build:theme, build:docker, push-image, upload-theme-zip.

## 7.3 Release & deploying theme to Canvas
- Build release: `npm run build` → create `classapex-theme-vX.Y.Z.zip` containing `theme.min.css`, `theme.js`, `manifest.json`, `assets/`.  
- Admin install (Canvas): Admin → Themes → Upload → select zip → apply to test account. Document that Canvas caches theme assets; admins might need to purge caches / logout to see changes. (Note: some Canvas admin UIs vary by host; include screenshots in pilot docs.)

## 7.4 Deploying LTI app
- Docker image push to registry; deploy to host, configure reverse proxy (nginx) for TLS termination (or use Cloudflare).  
- Health endpoint: `/healthz` returns 200; readiness checks for DB and JWKS.  
- Configure environment: DATABASE_URL, PRIVATE_KEY, JWKS_URL, AI_API_KEY, SENTRY_DSN, ORG_ADMIN_EMAIL.  

---

# 8. QA, testing & acceptance criteria
## 8.1 Automated tests
- Unit tests: SASS compile smoke test, JS linter, Node unit tests for LTI handlers, mocks for Canvas API.  
- Integration tests: simulate LTI launch with mock JWT and test rubric push flow against a staging Canvas API (or mock).  
- Accessibility testing: run `pa11y` and `axe` for representative pages in the LTI UI and theme sample pages.

## 8.2 Manual QA checklist (for pilot)
- Theme: test Course Home, Module view, Assignment page, SpeedGrader, Gradebook, Mobile view (Canvas mobile wrappers), and Instructor Dashboard. No visual breaks or hidden controls.  
- LTI: test launch as Teacher, verify role check, generate+push rubric, verify rubric appears in Course > Rubrics.  
- Performance: run Lighthouse for representative pages; ensure CSS/JS payloads are < 150 KB gzipped where possible.  
- Security: verify only teacher roles can create rubrics; JS does not leak tokens; CSP-compatible.  

## 8.3 Pilot acceptance criteria
- Pilot school signs acceptance if:
  - ≥10 teachers used LTI to create rubrics at least once.
  - No Severity-1 bugs (breaks login or grading).
  - Theme loads successfully across major pages and does not materially degrade performance (<10% FCP slowdown vs baseline).
- Provide pilot report with usage metrics and NPS/qualitative feedback.

---

# 9. Ops & runbook (incident handling)
- **Incident staging:** triage contacts, escalate to founders/SRE.  
- **Common incidents:** LTI launch failures (invalid JWT), Canvas API 401/403 (invalid token), AI vendor outage (fallback to template generator), theme visual regression on Canvas upgrade (roll back theme).  
- **Rollback plan:** keep previous theme zip available in releases; admin can re-upload and apply older theme; LTI: deploy previous docker tag.

---

# 10. Roadmap & next steps after MVP
**Short term (0–3 months):** Theme + LTI release; 1 pilot; collect case study.  
**Mid term (3–9 months):** Expand LTI library (grade analytics, auto-summaries), add paid AI Pack features, create reseller docs.  
**Long term (9–18 months):** Evaluate multi-tenant hosting when MRR ≥ \$10k or 2–3 enterprise pilots request hosting and SLA.

---

# 11. Risks & mitigations (summary)
- **Risk:** Canvas upstream layout changes break theme styles → *mitigation:* keep small, well-scoped selectors and automated visual regression tests.  
- **Risk:** AI costs escalate → *mitigation:* per-org quotas, caching, and paid AI Pack gating.  
- **Risk:** Legal/license (AGPL) confusion → *mitigation:* do not modify Canvas core; document that ClassApex is a theme & LTI stack and publish theme source or disclose dependencies per customer agreements.  

---

# 12. Implementation checklist (step-by-step)
This checklist is intended to be used by devs to implement MVP in ~4–6 weeks.

**Week 0 — Setup & scaffolding**
- [ ] Create GitHub org and two repositories `classapex-theme` and `classapex-lti`.  
- [ ] Create base `README.md`, CODEOWNERS, and issue templates.  
- [ ] Provision staging domain and TLS (Cloudflare or direct cert).  
- [ ] Create Canvas Free-for-Teacher account for testing; set up admin access.  

**Week 1 — Theme basics**
- [ ] Implement `_tokens.scss` with Carbon tokens; implement `_variables.scss` mapping to Canvas semantic variables.  
- [ ] Scaffold components `_nav.scss`, `_button.scss`, `_forms.scss`.  
- [ ] Create SASS build (npm scripts): `build`, `watch`, `lint`.  
- [ ] Create `theme.min.css` and simple `theme.js` with color switcher.  
- [ ] Upload initial CSS/JS to Canvas Theme Editor and test on Course Home.

**Week 2 — Theme polish & accessibility**
- [ ] Finish component styles; ensure WCAG AA contrast for primary colors (color check).  
- [ ] Add responsive adjustments and mobile checks; test Canvas Mobile wrapper pages.  
- [ ] Run `pa11y`/`axe` and remediate top issues.  
- [ ] Create admin guide for theme upload and CSP host allowlist instructions.

**Week 3 — LTI basic scaffolding**
- [ ] Implement `ltijs` server skeleton with OIDC and launch endpoint.  
- [ ] Create DB models for `deployments`, `org_settings`, `ai_usage`.  
- [ ] Implement simple UI inside iframe (React or plain JS) to accept rubric inputs.  
- [ ] Expose JWKS and public endpoints for Developer Key registration (or provide config JSON).

**Week 4 — Rubric generation & Canvas integration**
- [ ] Implement AI generator with safe prompt templates and caching.  
- [ ] Implement API call to Canvas Rubrics endpoint (POST to course rubrics).  
- [ ] Implement RBAC so only teacher roles can push rubrics.  
- [ ] Instrument `rubric_generated`, `rubric_pushed`, `ai_tokens` events.

**Week 5 — QA & pilot prep**
- [ ] Run integration LTI tests with mock and staging Canvas.  
- [ ] Create pilot onboarding pack (setup steps, admin checklists, Loom videos).  
- [ ] Conduct internal pilot with 3–5 testers and fix critical defects.

**Week 6 — Pilot launch**
- [ ] Install theme + register LTI in pilot Canvas account.  
- [ ] Onboard pilot school's admin/tech lead; run 60–90 minute training session.  
- [ ] Monitor usage and AI cost first 72 hours; address issues quickly.  
- [ ] Gather feedback and finalize pilot report.

---

# 13. Appendix — sample package.json, build script snippets, and GitHub Actions workflow
**package.json (theme example)**
```json
{
  "name": "classapex-theme",
  "version": "0.1.0",
  "scripts": {
    "build": "sass src/scss/theme.scss dist/theme.min.css --style=compressed && postcss dist/theme.min.css -o dist/theme.min.css",
    "dev": "sass --watch src/scss:dist"
  },
  "devDependencies": {
    "sass": "^1.66.1",
    "postcss": "^8.4.21",
    "autoprefixer": "^10.4.14",
    "cssnano": "^5.1.15"
  }
}
```
**Minimal LTI Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 443
CMD ["node", "server.js"]
```
**GitHub Action (theme build & release artifact) — skeleton**
```yaml
name: CI
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install deps
        run: npm ci
      - name: Build theme
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: theme-dist
          path: dist/*
```

---

# 14. Deliverables (what you'll hand over at the end of MVP)
- GitHub repos `classapex-theme` and `classapex-lti` with README and CI configured.  
- `dist/classapex-theme-vX.Y.Z.zip` with CSS/JS and assets.  
- LTI Docker image published to registry and deployed to pilot host.  
- Pilot onboarding docs + admin install JSON.  
- Pilot acceptance report with metrics and recommended next steps.

---

# 15. Next actions I can perform for you (pick one)
- Produce the **Canvas Developer Key JSON** & LTI config file (ready for admin paste).  
- Generate a **starter repo skeleton** (Dockerfile, package.json, minimal `ltijs` app, GitHub Actions workflow) and place it in a downloadable archive.  
- Create a **pilot onboarding packet** (checklists, Loom script, admin step-by-step docs).

---

*End of document.*
