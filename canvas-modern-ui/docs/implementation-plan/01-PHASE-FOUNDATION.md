# Phase 1 — Foundation & Auth (Sprints 1–3)

## Sprint 1: Project Scaffold & Design System

### Tasks
- [x] **S1-01** Initialize Vite + React 18 + TypeScript monorepo with Turborepo *(existing)*
- [x] **S1-02** Configure `@classapex/core` package *(existing + enhanced)*
- [x] **S1-03** Configure `@classapex/components` package *(existing)*
- [x] **S1-04** Define CSS design tokens → `packages/core/src/config/design-tokens.css` ✅
- [x] **S1-05** Create base theme: light + dark mode via CSS custom properties ✅
- [x] **S1-06** Build core layout components → `AppShell.tsx`, `TopBar.tsx` ✅
- [x] **S1-07** Build atomic UI components → `Atoms.tsx` (Input, Badge, Avatar, Modal) ✅
- [x] **S1-08** Set up Vitest + React Testing Library with test helpers ✅ `vitest.config.ts`, `test-setup.ts`, `playwright.config.ts` all configured
- [x] **S1-09** Set up ESLint, Prettier, TypeScript strict mode ✅ `.eslintrc.cjs` created (TypeScript, React, JSX-a11y, Hooks, Prettier plugins) + `.prettierrc` exists
- [x] **S1-10** Create Storybook or demo page for component showcase ✅ `apps/demo/` showcases all components (CourseCard, AssignmentCard, GradebookSummary, etc.)

---

## Sprint 2: OAuth2 Authentication & Canvas API Client

### Tasks
- [x] **S2-01** Implement OAuth2 authorization code flow → `auth/AuthProvider.tsx` ✅
- [x] **S2-02** Build `AuthProvider` context with token storage ✅
- [x] **S2-03** Create `useAuth` hook (login, logout, token refresh) ✅
- [x] **S2-04** Build `CanvasApiClient` with retry, rate limit, pagination → `api/canvas-client.ts` ✅
- [x] **S2-05** Implement automatic token refresh on 401 ✅
- [x] **S2-06** Create `useCanvasQuery` / `useCanvasMutation` hooks → `hooks/useCanvasApi.ts` ✅
- [x] **S2-07** Build Login page with Canvas OAuth redirect → in `AuthProvider.tsx` (login fn) ✅
- [x] **S2-08** Build protected route wrapper → `RequireAuth` component ✅
- [x] **S2-09** Add role-based access control → `auth/rbac.ts` ✅
- [x] **S2-10** Create `useCurrentUser` hook ✅

---

## Sprint 3: Navigation Shell & Routing

### Tasks
- [x] **S3-01** Implement React Router with lazy-loaded route splits *(existing)*
- [x] **S3-02** Build responsive `Sidebar` with role-based menu *(existing)*
- [x] **S3-03** Build `TopBar` with search, notifications, theme toggle, user menu ✅
- [x] **S3-04** Create breadcrumb system → `navigation/Breadcrumb.tsx` ✅
- [x] **S3-05** Build `NotificationDropdown` fetching activity stream ✅
- [x] **S3-06** Implement global search bar hitting Canvas search API ✅
- [x] **S3-07** Create loading skeletons for all shell sections ✅
- [x] **S3-08** Implement tenant config loader → `config/tenant.config.ts` ✅
- [x] **S3-09** Build `ErrorBoundary` and error pages *(existing)*
- [x] **S3-10** Add keyboard navigation (Cmd+K, Escape close, skip links) — WCAG 2.1 ✅

---

## 📊 Sprint 1–3 Progress: **29/30 tasks done (97%)**

### Files Created This Session

| File | Purpose |
|------|---------|
| `core/src/config/design-tokens.css` | CSS custom property design system |
| `core/src/config/tenant.config.ts` | Institution tier customization |
| `core/src/api/canvas-client.ts` | Production Canvas API client |
| `core/src/hooks/useCanvasApi.ts` | React hooks for Canvas data |
| `core/src/auth/AuthProvider.tsx` | OAuth2 auth system + RequireAuth |
| `core/src/auth/rbac.ts` | Role-based access control |
| `components/src/ui/layout/AppShell.tsx` + `.css` | Root layout shell |
| `components/src/ui/layout/TopBar.tsx` + `.css` | Header bar |
| `components/src/ui/atoms/Atoms.tsx` + `.css` | Input, Badge, Avatar, Modal |
| `components/src/navigation/Breadcrumb.tsx` + `.css` | Route-aware breadcrumbs |

### Remaining
🎉 **All Sprint 1–3 tasks are now complete.**

### ➡️ Next: Phase 2 (Sprint 4) — Dashboard & Course Catalog
