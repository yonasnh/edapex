# 🎓 ClassApex LMS — Master Implementation Plan

> **Project:** Headless Modern UI on Canvas LMS Backend  
> **Codename:** ClassApex  
> **Methodology:** Agile (2-week sprints)  
> **Workspace:** `/Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui`

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────┐
│         ClassApex Modern Frontend             │
│  Next.js / Vite + React 18 + TypeScript       │
├──────────────────────────────────────────────┤
│  @classapex/core    │  @classapex/components  │
│  API Client, Auth,  │  Design System, Pages,  │
│  State, Types       │  Widgets, Layouts       │
├──────────────────────────────────────────────┤
│  Canvas REST API v1  │  Canvas GraphQL API     │
├──────────────────────────────────────────────┤
│        Canvas LMS Rails Backend (untouched)   │
│  PostgreSQL · Redis · S3 · Delayed Jobs       │
└──────────────────────────────────────────────┘
```

---

## 📋 Phase Summary

| Phase | Name | Sprints | Focus | Progress |
|-------|------|---------|-------|----------|
| **1** | [Foundation & Auth](./01-PHASE-FOUNDATION.md) | S1–S3 | Project scaffold, OAuth2, design system | **30/30 (100%)** |
| **2** | [Core LMS Features](./02-PHASE-CORE-LMS.md) | S4–S8 | Dashboard, courses, assignments, grades | **50/50 (100%)** |
| **3** | [Collaboration & Communication](./03-PHASE-COLLABORATION.md) | S9–S12 | Discussions, messaging, calendar, groups | **40/40 (100%)** |
| **4** | [Administration & Analytics](./04-PHASE-ADMIN.md) | S13–S16 | Admin panel, reports, user management | **40/40 (100%)** |
| **5** | [Advanced Features](./05-PHASE-ADVANCED.md) | S17–S20 | Quizzes, rubrics, outcomes, LTI | **40/40 (100%)** |
| **6** | [AI & Polish](./06-PHASE-AI-POLISH.md) | S21–S24 | AI tutoring, mobile PWA, performance | **22/40 (55%)** |
| **Total** | | | | **222/240 (93%)** |

---

## 🎯 Customization Tiers

The UI adapts per institution type via a `tenant.config.json`:

| Feature | K-8 | High School | College | University |
|---------|-----|-------------|---------|------------|
| Simplified nav | ✅ | ❌ | ❌ | ❌ |
| Parent portal | ✅ | ✅ | ❌ | ❌ |
| GPA tracking | ❌ | ✅ | ✅ | ✅ |
| Research tools | ❌ | ❌ | ❌ | ✅ |
| Career readiness | ❌ | ✅ | ✅ | ✅ |
| Advanced analytics | ❌ | ❌ | ✅ | ✅ |
| Multi-term view | ❌ | ❌ | ✅ | ✅ |
| Gamification | ✅ | ✅ | ❌ | ❌ |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| State | TanStack Query + Zustand |
| Routing | React Router v7 |
| Styling | Vanilla CSS + CSS Modules + Design Tokens |
| API | Canvas REST v1 + GraphQL |
| Auth | OAuth2 (Canvas Provider) |
| Testing | Vitest + Playwright + axe-core |
| Build | Turborepo monorepo |
| CI/CD | GitHub Actions |

---

## 📊 Sprint Cadence

- **Sprint Length:** 2 weeks
- **Ceremonies:** Planning (Mon), Daily standup, Review (Fri W2), Retro (Fri W2)
- **Definition of Done:** Feature working, tests passing, a11y checked, docs updated

---

## 🗂️ Canvas API Endpoints Coverage

### Priority 1 — Core (Phases 1-2)
- `GET /api/v1/users/self` — Current user
- `GET/POST /api/v1/courses` — Course CRUD
- `GET/POST /api/v1/courses/:id/assignments` — Assignments
- `GET/PUT /api/v1/courses/:id/enrollments` — Enrollments
- `GET/PUT /api/v1/courses/:id/submissions` — Submissions
- `GET /api/v1/courses/:id/gradebook` — Grades
- `GET /api/v1/courses/:id/modules` — Modules

### Priority 2 — Collaboration (Phase 3)
- `GET/POST /api/v1/courses/:id/discussion_topics` — Discussions
- `GET/POST /api/v1/conversations` — Inbox/messaging
- `GET/POST /api/v1/calendar_events` — Calendar
- `GET /api/v1/courses/:id/groups` — Groups
- `GET /api/v1/announcements` — Announcements

### Priority 3 — Admin (Phase 4)
- `GET/PUT /api/v1/accounts/:id` — Account management
- `GET /api/v1/accounts/:id/users` — User management
- `GET /api/v1/accounts/:id/reports` — Reports
- `GET /api/v1/audit/grade_change` — Audit logs
- `POST /api/v1/accounts/:id/sis_imports` — SIS imports

### Priority 4 — Advanced (Phase 5)
- `GET/POST /api/v1/courses/:id/quizzes` — Quizzes
- `GET/POST /api/v1/courses/:id/rubrics` — Rubrics
- `GET /api/v1/courses/:id/outcome_results` — Outcomes
- `GET/POST /api/v1/courses/:id/external_tools` — LTI tools
- `GET /api/v1/courses/:id/pages` — Wiki pages

### GraphQL (All Phases)
- `POST /api/graphql` — Complex nested queries, real-time subscriptions

---

> **Next:** Open each phase document for detailed sprint breakdowns and task checklists.
