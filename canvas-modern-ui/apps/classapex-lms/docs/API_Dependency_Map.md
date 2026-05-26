# ClassApex — Canvas API Dependency Map

> **Version:** 1.0  
> **Last Updated:** 2026-05-25  
> **Scope:** All REST and GraphQL API dependencies for the ClassApex React SPA  
> **Client Libs:** `@schoolapex/core` (`useCanvasQuery`, `useCanvasMutation`, `canvasFetch`)

---

## 1. Overview

ClassApex is a React Single Page Application (SPA) that consumes the Canvas LMS platform through two primary channels:

| Channel | Protocol | Purpose | Share of Calls |
|---------|----------|---------|----------------|
| **REST** | HTTP/JSON | CRUD operations, file uploads, admin tasks, legacy integrations | ~85% |
| **GraphQL** | `POST /api/graphql` | Aggregated reads, dashboard stats, search, analytics | ~15% |

All REST calls are centralized through `@schoolapex/core` hooks:

- **`useCanvasQuery`** — Read operations (GET), wraps React Query with Canvas-specific caching, pagination, and error normalization.
- **`useCanvasMutation`** — Write operations (POST, PUT, PATCH, DELETE), handles optimistic updates and invalidation of related query keys.
- **`canvasFetch`** — Low-level imperative fetch utility, used for file uploads, streaming responses, and non-standard request shapes.

### Architecture Notes

- The app is heavily **course-centric**: ~141 calls use `${courseId}` interpolation, representing the bulk of runtime traffic.
- **User-scoped endpoints** power the dashboard, todo list, and inbox—this is the second-highest traffic domain.
- **Admin/Account endpoints** are lower volume but high privilege; they require elevated OAuth scopes and CSRF tokens.
- GraphQL is used selectively for complex read scenarios (e.g., `GetDashboardStats`, `SearchUsers`) where REST would require N+1 requests.

---

## 2. API Surface Area Summary

| Metric | Count | Notes |
|--------|-------|-------|
| **Total unique REST endpoints** | ~75 | Including interpolated `${courseId}` variants as patterns |
| **Total unique GraphQL queries** | 18 | Defined in `src/graphql/queries.ts` |
| **Total endpoint invocations (estimated)** | ~200+ | 141 course-scoped + 55 top-level/user/admin + other |
| **Read operations (GET)** | ~165 | ~82% of all REST calls |
| **Write operations (POST/PUT/PATCH/DELETE)** | ~35 | ~18% of all REST calls |
| **File upload operations** | 4+ | Via `/api/v1/users/self/files` and course files |

### Risk Assessment Matrix

| Domain | Endpoint Count | Traffic Volume | Stability | Privilege Level | Risk Level |
|--------|---------------|----------------|-----------|-----------------|------------|
| Courses (scoped) | ~35 patterns | Very High | Stable | Mixed | 🟡 Medium |
| Users / Self | ~15 endpoints | High | Stable | Low (self) | 🟢 Low |
| Admin / Accounts | ~16 endpoints | Low | Stable | High | 🔴 High |
| Assignments / Quizzes | ~10 patterns | High | Stable | Mixed | 🟡 Medium |
| Files / Folders | ~6 patterns | Medium | Stable | Low | 🟢 Low |
| Calendar / Planner | ~4 endpoints | Medium | Stable | Low | 🟢 Low |
| GraphQL Queries | 18 | Medium | Evolving | Mixed | 🟡 Medium |
| Blueprint / SIS / Analytics | ~8 patterns | Low | Experimental | High | 🔴 High |

**Key Risk Factors:**
1. **High concentration in course-scoped endpoints** — A breaking change to `/api/v1/courses/${courseId}/assignments` or `/api/v1/courses/${courseId}/modules` would impact the majority of user journeys.
2. **Admin endpoints carry elevated privilege** — Misconfiguration or scope drift in OAuth tokens could expose sensitive SIS data, grade change audits, or developer keys.
3. **GraphQL query stability** — The Canvas GraphQL schema is actively evolving; deprecated fields in `GetDashboardStats` or `GetCourseAnalytics` could break the dashboard without warning.

---

## 3. Endpoint Catalog by Domain

### 3.1 Courses

| Endpoint Pattern | Methods | Usage Count | Description |
|------------------|---------|-------------|-------------|
| `/api/v1/courses` | GET | 11 | List all courses (global scope) |
| `/api/v1/courses?per_page=100` | GET | 1 | Paginated course list |
| `/api/v1/users/self/courses` | GET | 3 | Student/teacher enrolled courses |
| `/api/v1/accounts/1/courses` | GET | 3 | Admin course management |
| `/api/v1/courses/${courseId}/assignments` | GET, POST | — | Assignment listings and creation |
| `/api/v1/courses/${courseId}/assignment_groups` | GET | — | Grouped assignment structure |
| `/api/v1/courses/${courseId}/modules` | GET, POST | — | Course module structure |
| `/api/v1/courses/${courseId}/pages` | GET | — | Wiki pages / content pages |
| `/api/v1/courses/${courseId}/announcements` | GET | — | Course announcements |
| `/api/v1/courses/${courseId}/discussion_topics` | GET | — | Discussions and forums |
| `/api/v1/courses/${courseId}/enrollments` | GET, POST | — | Enrollment roster |
| `/api/v1/courses/${courseId}/sections` | GET | — | Course sections |
| `/api/v1/courses/${courseId}/groups` | GET | — | Course groups |
| `/api/v1/courses/${courseId}/external_tools` | GET | — | LTI tool placements |
| `/api/v1/courses/${courseId}/conferences` | GET | — | Web conferences |
| `/api/v1/courses/${courseId}/late_policy` | GET, PUT | — | Late submission policy |
| `/api/v1/courses/${courseId}/outcome_groups` | GET | — | Learning outcome groups |
| `/api/v1/courses/${courseId}/outcomes` | GET | — | Learning outcomes |
| `/api/v1/courses/${courseId}/rubrics` | GET | — | Grading rubrics |
| `/api/v1/courses/${courseId}/question_banks` | GET | — | Quiz question banks |
| `/api/v1/courses/${courseId}/analytics` | GET | — | Course-level analytics |
| `/api/v1/courses/${courseId}/gradebook` | GET | — | Gradebook data |
| `/api/v1/courses/${courseId}/attendance` | GET, POST | — | Attendance tracking |
| `/api/v1/courses/${courseId}/grading_standards` | GET | — | Grading scales |
| `/api/v1/courses/${courseId}/custom_gradebook_columns` | GET | — | Custom gradebook columns |
| `/api/v1/courses/${courseId}/peer_reviews` | GET | — | Peer review assignments |
| `/api/v1/courses/${courseId}/quiz_submissions` | GET | — | All quiz submissions |
| `/api/v1/courses/${courseId}/content_migrations` | GET, POST | — | Content import/export |
| `/api/v1/courses/${courseId}/import_content` | POST | — | Initiate content import |
| `/api/v1/courses/${courseId}/blueprint_templates` | GET | — | Blueprint template sync |
| `/api/v1/courses/${courseId}/blueprint_subscriptions` | GET | — | Blueprint subscription status |
| `/api/v1/courses/${courseId}/copy_to` | POST | — | Course copy initiation |
| `/api/v1/courses/${courseId}/hide_grades` | POST | — | Hide grades from students |
| `/api/v1/courses/${courseId}/post_grades` | POST | — | Post grades to students |
| `/api/v1/courses/101/enrollments` | GET | 1 | Hardcoded demo enrollment (see §9) |

### 3.2 Assignments & Quizzes

| Endpoint Pattern | Methods | Description |
|------------------|---------|-------------|
| `/api/v1/courses/${courseId}/assignments` | GET, POST | List / create assignments |
| `/api/v1/courses/${courseId}/quizzes` | GET, POST | List / create quizzes |
| `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions` | GET, POST | Quiz submissions by quiz |
| `/api/v1/courses/${courseId}/question_banks` | GET | Reusable question pools |
| `/api/v1/courses/${courseId}/peer_reviews` | GET, POST | Peer review management |
| `/api/v1/courses/${courseId}/quiz_submissions` | GET | Aggregate quiz submissions |
| `/api/v1/courses/${courseId}/rubrics` | GET | Assessment rubrics |

### 3.3 Users & Profile

| Endpoint | Methods | Usage Count | Description |
|----------|---------|-------------|-------------|
| `/api/v1/users/self` | GET | 3 | Current user profile |
| `/api/v1/users/self/courses` | GET | 3 | Enrolled courses |
| `/api/v1/users/self/files` | GET, POST | 4 | Personal file storage and uploads |
| `/api/v1/users/self/folders` | GET | — | Personal folder structure |
| `/api/v1/users/self/folders/root` | GET | — | Root folder metadata |
| `/api/v1/users/self/todo` | GET | 2 | Todo items (incl. `?per_page=100`) |
| `/api/v1/users/self/upcoming_events` | GET | 2 | Calendar upcoming events |
| `/api/v1/users/self/activity_stream` | GET | — | Global activity feed |
| `/api/v1/users/self/activity_stream/summary` | GET | 2 | Activity stream summary |
| `/api/v1/users/self/submissions?per_page=100` | GET | — | All submissions for user |
| `/api/v1/users/self/missing_submissions` | GET | 2 | Missing / overdue work |
| `/api/v1/users/self/communication_channels` | GET | 2 | Email, SMS, notification prefs |
| `/api/v1/users/self/observer_pairing_codes` | GET | — | Observer pairing codes |
| `/api/v1/users/self/observees` | GET | 2 | Observed students (parent view) |
| `/api/v1/users/self/groups` | GET | — | Group memberships |

### 3.4 Files & Folders

| Endpoint Pattern | Methods | Description |
|------------------|---------|-------------|
| `/api/v1/users/self/files` | GET, POST | File uploads and listing |
| `/api/v1/users/self/folders` | GET | Folder tree |
| `/api/v1/users/self/folders/root` | GET | Root folder info |
| `/api/v1/courses/${courseId}/files` | GET, POST | Course file management |
| `/api/v1/courses/${courseId}/folders` | GET | Course folder tree |
| `/api/v1/folders` | GET | Global folder operations |

### 3.5 Calendar & Planner

| Endpoint | Methods | Usage Count | Description |
|----------|---------|-------------|-------------|
| `/api/v1/calendar_events` | GET | 3 | Calendar events |
| `/api/v1/planner/overrides` | GET, PUT | — | Planner item visibility overrides |
| `/api/v1/planner/items` | GET | — | Planner items (assignments + events) |
| `/api/v1/users/self/upcoming_events` | GET | 2 | Upcoming event stream |

### 3.6 Inbox & Messaging

| Endpoint | Methods | Usage Count | Description |
|----------|---------|-------------|-------------|
| `/api/v1/conversations` | GET, POST | 3 | Inbox messages and conversations |

### 3.7 Admin & Account Management

| Endpoint | Methods | Usage Count | Description |
|----------|---------|-------------|-------------|
| `/api/v1/accounts/1/users` | GET | 6 | Admin user directory |
| `/api/v1/accounts/1/admins` | GET, POST | 4 | Admin role assignments |
| `/api/v1/accounts/1/courses` | GET | 3 | Admin course listing |
| `/api/v1/accounts/1/developer_keys` | GET, POST | 4 | LTI developer key management |
| `/api/v1/accounts/1/sub_accounts` | GET | — | Account hierarchy |
| `/api/v1/accounts/1/sis_imports` | GET, POST | — | SIS import jobs |
| `/api/v1/accounts/1/question_banks` | GET | — | Account-level question banks |
| `/api/v1/accounts/1/outcome_groups` | GET | — | Account learning outcomes |
| `/api/v1/accounts/1/grading_standards` | GET | — | Account grading scales |
| `/api/v1/accounts/1/features` | GET | — | Feature flag status |
| `/api/v1/accounts/1/account_notifications` | GET, POST | — | Global banner messages |
| `/api/v1/accounts/1/terms` | GET | — | Enrollment terms |
| `/api/v1/accounts/1/roles` | GET | — | Custom role definitions |
| `/api/v1/accounts/1/content_migrations` | GET, POST | — | Account-wide content migration |
| `/api/v1/accounts/1/brand_configs/current` | GET | — | Active branding config |
| `/api/v1/accounts/1/brand_configs` | GET, POST | — | Brand config history |
| `/api/v1/accounts/1/grade_change_audit` | GET | — | Grade change audit log |
| `/api/v1/accounts` | GET | — | Account listing |
| `/api/v1/audit/grade_change` | GET | — | Cross-account grade audit |

### 3.8 LTI & Integrations

| Endpoint | Methods | Usage Count | Description |
|----------|---------|-------------|-------------|
| `/api/v1/accounts/1/developer_keys` | GET, POST | 4 | Developer key lifecycle |
| `/api/v1/courses/${courseId}/external_tools` | GET | — | Course LTI tool placements |

### 3.9 Analytics & Reporting

| Endpoint Pattern | Methods | Description |
|------------------|---------|-------------|
| `/api/v1/courses/${courseId}/analytics` | GET | Course participation and grades analytics |
| `/api/v1/courses/${courseId}/gradebook` | GET | Gradebook summary data |
| `/api/v1/accounts/1/grade_change_audit` | GET | Audit trail for grade modifications |
| `/api/v1/audit/grade_change` | GET | System-wide grade audit |

### 3.10 Other / Misc

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/v1/eportfolios` | GET | ePortfolio listing |
| `/api/v1/courses/101/enrollments` | GET | Hardcoded reference (see §9) |

---

## 4. Page-to-Endpoint Mapping

The following maps each major ClassApex page/screen to the exact REST endpoints and GraphQL queries it consumes.

### 4.1 Dashboard (`/dashboard`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/users/self` | Load current user name/avatar |
| `useCanvasQuery` | `/api/v1/users/self/todo?per_page=100` | Todo list widget |
| `useCanvasQuery` | `/api/v1/users/self/upcoming_events` | Upcoming events widget |
| `useCanvasQuery` | `/api/v1/users/self/missing_submissions` | Missing work alert |
| `useCanvasQuery` | `/api/v1/users/self/activity_stream/summary` | Unread counts |
| `useCanvasQuery` | `/api/v1/users/self/courses` | Quick-access course cards |
| GraphQL | `GetDashboardStats` | Aggregated dashboard metrics |
| GraphQL | `GetCalendarEvents` | Calendar preview data |

### 4.2 Course List (`/courses`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses` | Global course directory |
| `useCanvasQuery` | `/api/v1/courses?per_page=100` | Large course list |
| `useCanvasQuery` | `/api/v1/users/self/courses` | User-enrolled courses |
| GraphQL | `GetCourses` | Rich course search/filter |
| GraphQL | `SearchCourses` | Full-text course search |

### 4.3 Course Detail (`/courses/:courseId`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses/${courseId}/modules` | Course navigation |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/assignments` | Assignment list |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/pages` | Content pages |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/announcements` | Announcements |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/discussion_topics` | Discussions |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/files` | Course files |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/folders` | Folder structure |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/groups` | Groups |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/enrollments` | Roster |
| GraphQL | `GetCourse` | Course metadata |
| GraphQL | `GetAssignments` | Assignment detail |
| GraphQL | `GetDiscussions` | Discussion summary |
| GraphQL | `GetFiles` | File metadata |
| GraphQL | `GetFolders` | Folder tree |

### 4.4 Assignments (`/courses/:courseId/assignments`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses/${courseId}/assignments` | Assignment listing |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/assignment_groups` | Group structure |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/rubrics` | Rubric preview |
| GraphQL | `GetAssignments` | Detailed assignment data |
| GraphQL | `GetAssignment` | Single assignment view |

### 4.5 Quizzes (`/courses/:courseId/quizzes`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses/${courseId}/quizzes` | Quiz listing |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions` | Quiz attempts |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/quiz_submissions` | All submissions |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/question_banks` | Question pools |

### 4.6 Gradebook (`/courses/:courseId/grades`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses/${courseId}/gradebook` | Gradebook data |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/grading_standards` | Grade scale |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/custom_gradebook_columns` | Custom columns |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/late_policy` | Late policy display |
| `useCanvasQuery` | `/api/v1/users/self/submissions?per_page=100` | Student view submissions |
| GraphQL | `GetGrades` | Aggregated grade data |
| `useCanvasMutation` | `/api/v1/courses/${courseId}/hide_grades` | Hide grades |
| `useCanvasMutation` | `/api/v1/courses/${courseId}/post_grades` | Release grades |

### 4.7 Calendar (`/calendar`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/calendar_events` | Calendar events |
| `useCanvasQuery` | `/api/v1/users/self/upcoming_events` | Upcoming list |
| `useCanvasQuery` | `/api/v1/planner/items` | Planner assignments + events |
| `useCanvasQuery` | `/api/v1/planner/overrides` | Visibility toggles |
| GraphQL | `GetCalendarEvents` | Calendar aggregation |

### 4.8 Inbox (`/conversations`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/conversations` | Message threads |
| `useCanvasMutation` | `/api/v1/conversations` | Send/reply |

### 4.9 Files (`/files`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/users/self/files` | Personal files |
| `useCanvasQuery` | `/api/v1/users/self/folders` | Folder tree |
| `useCanvasQuery` | `/api/v1/users/self/folders/root` | Root metadata |
| `useCanvasQuery` | `/api/v1/folders` | Global folder ops |
| `canvasFetch` | `/api/v1/users/self/files` | Upload (multipart) |
| GraphQL | `GetFiles` | File metadata |
| GraphQL | `GetFolders` | Folder hierarchy |

### 4.10 Admin Console (`/admin`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/accounts/1/users` | User directory |
| `useCanvasQuery` | `/api/v1/accounts/1/admins` | Admin roster |
| `useCanvasQuery` | `/api/v1/accounts/1/courses` | Course management |
| `useCanvasQuery` | `/api/v1/accounts/1/sub_accounts` | Account hierarchy |
| `useCanvasQuery` | `/api/v1/accounts/1/terms` | Enrollment terms |
| `useCanvasQuery` | `/api/v1/accounts/1/roles` | Role definitions |
| `useCanvasQuery` | `/api/v1/accounts/1/features` | Feature flags |
| `useCanvasQuery` | `/api/v1/accounts/1/account_notifications` | Global banners |
| `useCanvasQuery` | `/api/v1/accounts/1/developer_keys` | LTI keys |
| `useCanvasQuery` | `/api/v1/accounts/1/brand_configs/current` | Active branding |
| `useCanvasQuery` | `/api/v1/accounts/1/grade_change_audit` | Audit log |
| `useCanvasQuery` | `/api/v1/accounts` | Account list |
| `useCanvasQuery` | `/api/v1/audit/grade_change` | Cross-account audit |
| `useCanvasQuery` | `/api/v1/accounts/1/sis_imports` | SIS import status |
| `useCanvasQuery` | `/api/v1/accounts/1/content_migrations` | Migrations |
| GraphQL | `GetAdminUsers` | Admin user search |
| GraphQL | `GetSystemSettings` | System configuration |
| GraphQL | `GetReports` | Reporting data |

### 4.11 User Profile (`/profile`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/users/self` | Profile data |
| `useCanvasQuery` | `/api/v1/users/self/communication_channels` | Notification prefs |
| `useCanvasQuery` | `/api/v1/users/self/groups` | Group memberships |
| `useCanvasQuery` | `/api/v1/users/self/observees` | Observed students |
| `useCanvasQuery` | `/api/v1/users/self/observer_pairing_codes` | Pairing codes |
| GraphQL | `GetUser` | Detailed user data |

### 4.12 Analytics (`/analytics`)

| Hook / Utility | Endpoint / Query | Purpose |
|----------------|------------------|---------|
| `useCanvasQuery` | `/api/v1/courses/${courseId}/analytics` | Course analytics |
| `useCanvasQuery` | `/api/v1/courses/${courseId}/attendance` | Attendance data |
| GraphQL | `GetCourseAnalytics` | Aggregated analytics |

---

## 5. Critical Path Analysis

The "hot path" is defined as the sequence of API calls that block initial render of the most frequently accessed pages.

### 5.1 Dashboard Hot Path (User lands on `/dashboard`)

```
1. GET /api/v1/users/self              (auth + identity)
2. GET /api/v1/users/self/courses      (course cards)
3. GET /api/v1/users/self/todo?per_page=100  (todo widget)
4. GET /api/v1/users/self/upcoming_events    (calendar widget)
5. GET /api/v1/users/self/activity_stream/summary (badges)
6. GraphQL GetDashboardStats           (aggregated metrics)
```

**SLI Target:** Total blocking time < 1.5s (p95).  
**Failure Mode:** If `/api/v1/users/self` fails, the entire session is unusable.  
**Mitigation:** This chain is pre-fetched on login; `useCanvasQuery` caches `users/self` with `staleTime: 5m`.

### 5.2 Course Detail Hot Path (User clicks a course)

```
1. GraphQL GetCourse                    (course metadata)
2. GET /api/v1/courses/${courseId}/modules    (navigation)
3. GET /api/v1/courses/${courseId}/assignments (landing tab)
```

**SLI Target:** Time to interactive < 1.0s (p95).  
**Failure Mode:** Missing `modules` blocks the left-nav skeleton.  
**Mitigation:** Modules and assignments are fetched in parallel via `Promise.all` in the route loader.

### 5.3 Gradebook Hot Path (Teacher opens gradebook)

```
1. GET /api/v1/courses/${courseId}/gradebook
2. GET /api/v1/courses/${courseId}/enrollments
3. GET /api/v1/courses/${courseId}/assignment_groups
4. GET /api/v1/courses/${courseId}/grading_standards
```

**SLI Target:** Data ready < 2.0s (p95).  
**Failure Mode:** Gradebook payload is large; pagination is critical.  
**Mitigation:** Uses `per_page=50` with cursor-based infinite scroll.

### 5.4 Admin Console Hot Path

```
1. GET /api/v1/accounts/1/users         (user directory)
2. GET /api/v1/accounts/1/courses       (course list)
3. GET /api/v1/accounts/1/features      (feature flags)
```

**SLI Target:** < 2.0s (p95).  
**Failure Mode:** Admin endpoints are uncached server-side; high latency.  
**Mitigation:** `@schoolapex/core` applies `staleTime: 30s` and background refetch for admin queries.

### 5.5 Endpoint Criticality Ranking

| Rank | Endpoint | Page | Criticality | Cache Strategy |
|------|----------|------|-------------|----------------|
| 1 | `/api/v1/users/self` | All | 🔴 Blocker | 5 min stale |
| 2 | `/api/v1/users/self/courses` | Dashboard | 🔴 Blocker | 2 min stale |
| 3 | `/api/v1/courses/${courseId}/modules` | Course | 🔴 Blocker | 5 min stale |
| 4 | `/api/v1/courses/${courseId}/assignments` | Course | 🟡 High | 2 min stale |
| 5 | `/api/v1/users/self/todo` | Dashboard | 🟡 High | 1 min stale |
| 6 | `/api/v1/users/self/upcoming_events` | Dashboard | 🟢 Medium | 5 min stale |
| 7 | `/api/v1/courses/${courseId}/gradebook` | Grades | 🟡 High | 30 sec stale |
| 8 | `/api/v1/accounts/1/users` | Admin | 🟢 Medium | 30 sec stale |
| 9 | `/api/v1/conversations` | Inbox | 🟢 Medium | 1 min stale |
| 10 | `/api/v1/calendar_events` | Calendar | 🟢 Medium | 2 min stale |

---

## 6. Rate Limiting & Throttling Guide

### 6.1 Canvas API Limits

| Context | Limit | Window | Behavior |
|---------|-------|--------|----------|
| **Standard REST** | 3,000 requests | Per access token / per hour | 403 Forbidden with `X-Rate-Limit-Remaining: 0` |
| **GraphQL** | 3,000 requests | Per access token / per hour | Same header semantics as REST |
| **File Uploads** | 5 GB / file | — | 413 Payload Too Large |
| **SIS Imports** | 1 concurrent | Per account | 429 Too Many Requests |
| **Developer Keys** | Throttled | Per IP | Variable |

### 6.2 ClassApex Retry Strategy

`@schoolapex/core` implements the following strategy across all three client utilities:

| Scenario | Status Code | Retry Count | Backoff | Action |
|----------|-------------|-------------|---------|--------|
| Rate limited | 429 | 3 | Exponential: 1s → 2s → 4s | Retry with jitter |
| Rate limited (hard) | 429 (no `Retry-After`) | 0 | — | Surface error to UI |
| Server error | 502/503/504 | 3 | Exponential: 0.5s → 1s → 2s | Retry with jitter |
| Auth expired | 401 | 0 | — | Trigger OAuth refresh flow |
| Forbidden | 403 (non-rate) | 0 | — | Log + surface permission error |

**Key Implementation Details:**
- `useCanvasQuery` and `useCanvasMutation` read the `X-Rate-Limit-Remaining` header and preemptively throttle batch requests when below 50 remaining.
- `canvasFetch` exposes a `priority` option: `"critical"` requests bypass the throttle queue; `"background"` requests yield to foreground traffic.
- GraphQL queries are batched where possible (up to 5 operations per HTTP request) to reduce call volume.

### 6.3 Call Volume Budget (Estimated)

| Page | Estimated Calls per Session | Budget Risk |
|------|----------------------------|-------------|
| Dashboard | 8 | 🟢 Low |
| Course List | 4 | 🟢 Low |
| Course Detail | 12 | 🟡 Medium |
| Gradebook | 15 | 🟡 Medium |
| Calendar | 6 | 🟢 Low |
| Admin Console | 10 | 🟡 Medium |
| File Upload | 2 + chunks | 🟢 Low |

**Recommendation:** For power users (teachers with 10+ courses), implement request coalescing on the course detail page. The 141 course-scoped calls can easily exhaust the hourly budget during bulk operations.

---

## 7. API Version Drift Risk

### 7.1 Stability Tiers

| Tier | Endpoint Patterns | Stability | Drift Risk |
|------|-------------------|-----------|------------|
| **Core Stable** | `/api/v1/courses`, `/api/v1/users/self`, `/api/v1/assignments`, `/api/v1/enrollments` | Guaranteed | 🟢 Minimal |
| **Standard Stable** | `/api/v1/calendar_events`, `/api/v1/conversations`, `/api/v1/files`, `/api/v1/modules` | Stable | 🟢 Low |
| **Mature** | `/api/v1/analytics`, `/api/v1/gradebook`, `/api/v1/late_policy`, `/api/v1/quizzes` | Mature, minor additions | 🟡 Medium |
| **Evolving** | `/api/v1/blueprint_templates`, `/api/v1/blueprint_subscriptions`, `/api/v1/content_migrations`, `/api/v1/import_content` | Active development | 🟡 Medium |
| **Experimental** | `/api/v1/audit/grade_change`, `/api/v1/sis_imports`, `/api/v1/planner/*` | May change | 🔴 High |
| **GraphQL** | All queries in `src/graphql/queries.ts` | Schema evolves quarterly | 🟡 Medium |

### 7.2 Compatibility Notes

| Endpoint / Feature | Current Version Behavior | Future Risk | Mitigation |
|--------------------|--------------------------|-------------|------------|
| `/api/v1/courses/${courseId}/analytics` | Returns participation + grades | May add `student_summary` nested shape | Use typed parsing; ignore unknown keys |
| `/api/v1/courses/${courseId}/gradebook` | Flat submission array | May move to paginated by default | Already uses `per_page` + cursor |
| `/api/v1/accounts/1/brand_configs` | Returns JSON blob | May split into `/brand_configs/:id` | Abstract via `GetSystemSettings` GraphQL |
| `/api/v1/planner/overrides` | Toggle visibility | Planner API is under active redesign | Wrap in feature flag; fallback to REST calendar |
| GraphQL `GetCourseAnalytics` | Custom fields | Field deprecations in Q3 schema | Subscribe to Canvas release notes; run schema diff in CI |
| `/api/v1/courses/${courseId}/quizzes` | Classic quizzes | Classic quiz API may be sunset | Monitor Instructure roadmap; plan New Quizzes migration |

### 7.3 Upgrade Checklist

Before each Canvas release (typically monthly):

1. Run `yarn check:ts` against the latest `@types/canvas__api` (if available).
2. Review Instructure release notes for deprecations in the top 10 critical endpoints.
3. Execute the GraphQL schema diff job in CI to catch removed fields.
4. Validate admin endpoints (`/api/v1/accounts/*`) in a sandbox with the new version.
5. Test file upload flows (`canvasFetch` multipart) for header changes.

---

## 8. Authentication Requirements per Endpoint

ClassApex supports three authentication modes. The table below specifies which mode is required for each domain.

| Auth Mode | Mechanism | Use Case |
|-----------|-----------|----------|
| **OAuth 2.0** | Bearer token (`Authorization: Bearer <token>`) | Primary mode for all user-facing API calls |
| **API Token** | Same as OAuth (treats token as bearer) | Service accounts, background jobs |
| **CSRF Cookie** | `X-CSRF-Token` header + session cookie | Admin mutations, developer key operations, file uploads |

### 8.1 Auth Requirements by Domain

| Domain | Endpoints | Required Auth | Scopes Needed | CSRF Required? |
|--------|-----------|---------------|---------------|----------------|
| Users / Self | `/api/v1/users/self/*` | OAuth or API Token | `url:GET|/api/v1/users/self` | No |
| Courses (read) | `/api/v1/courses/*` (GET) | OAuth or API Token | `url:GET|/api/v1/courses/:id` | No |
| Courses (write) | `/api/v1/courses/*` (POST/PUT/PATCH/DELETE) | OAuth + CSRF | `url:POST|/api/v1/courses/:id` | **Yes** |
| Assignments (read) | `/api/v1/courses/:id/assignments` (GET) | OAuth or API Token | `url:GET|/api/v1/courses/:id/assignments` | No |
| Assignments (write) | `/api/v1/courses/:id/assignments` (mutate) | OAuth + CSRF | `url:POST|/api/v1/courses/:id/assignments` | **Yes** |
| Gradebook (read) | `/api/v1/courses/:id/gradebook` | OAuth or API Token | `url:GET|/api/v1/courses/:id/gradebook` | No |
| Grades (mutate) | `hide_grades`, `post_grades` | OAuth + CSRF | `url:POST|/api/v1/courses/:id/hide_grades` | **Yes** |
| Files (read) | `/api/v1/users/self/files` | OAuth or API Token | `url:GET|/api/v1/users/self/files` | No |
| Files (upload) | `/api/v1/users/self/files` (POST multipart) | OAuth + CSRF | `url:POST|/api/v1/users/self/files` | **Yes** |
| Admin Users | `/api/v1/accounts/1/users` | OAuth + CSRF | `url:GET|/api/v1/accounts/:id/users` | **Yes** |
| Admin Roles | `/api/v1/accounts/1/admins` | OAuth + CSRF | `url:POST|/api/v1/accounts/:id/admins` | **Yes** |
| Developer Keys | `/api/v1/accounts/1/developer_keys` | OAuth + CSRF | `url:POST|/api/v1/accounts/:id/developer_keys` | **Yes** |
| SIS Imports | `/api/v1/accounts/1/sis_imports` | OAuth + CSRF | `url:POST|/api/v1/accounts/:id/sis_imports` | **Yes** |
| Brand Configs | `/api/v1/accounts/1/brand_configs` | OAuth + CSRF | `url:POST|/api/v1/accounts/:id/brand_configs` | **Yes** |
| Audit Logs | `/api/v1/audit/grade_change` | OAuth + CSRF | `url:GET|/api/v1/audit/grade_change` | **Yes** |
| GraphQL Queries | `POST /api/graphql` | OAuth or API Token | `url:POST|/api/graphql` | No |
| GraphQL Mutations | `POST /api/graphql` | OAuth + CSRF | `url:POST|/api/graphql` | **Yes** |

### 8.2 Token Scope Mapping

| Feature Area | Minimal OAuth Scope | Recommended Scope |
|--------------|--------------------|--------------------|
| Dashboard + Courses | `url:GET|/api/v1/users/self` | `url:GET|/api/v1/users/self url:GET|/api/v1/courses` |
| Assignments + Grades | `url:GET|/api/v1/courses/:id/assignments` | `url:GET|/api/v1/courses/:id/assignments url:GET|/api/v1/courses/:id/gradebook url:POST|/api/v1/courses/:id/hide_grades url:POST|/api/v1/courses/:id/post_grades` |
| Calendar + Planner | `url:GET|/api/v1/calendar_events` | `url:GET|/api/v1/calendar_events url:GET|/api/v1/planner/items url:PUT|/api/v1/planner/overrides` |
| Files | `url:GET|/api/v1/users/self/files` | `url:GET|/api/v1/users/self/files url:POST|/api/v1/users/self/files` |
| Admin Console | `url:GET|/api/v1/accounts` | Full admin scope bundle |
| Inbox | `url:GET|/api/v1/conversations` | `url:GET|/api/v1/conversations url:POST|/api/v1/conversations` |

---

## 9. Missing APIs / Workarounds

This section documents gaps where ClassApex uses client-side workarounds, hardcoded values, or non-standard flows because a direct API is unavailable or insufficient.

| Gap | Affected Feature | Workaround | Technical Debt |
|-----|-----------------|------------|----------------|
| **Hardcoded course ID** | Demo / onboarding enrollment view | `/api/v1/courses/101/enrollments` is hardcoded | 🟡 Medium — Must be parametrized before production |
| **No bulk todo API** | Dashboard todo widget | Client-side `per_page=100` + local pagination | 🟢 Low — Acceptable given Canvas pagination model |
| **No real-time inbox** | Conversations | Short-poll every 60s via `useCanvasQuery` `refetchInterval` | 🟡 Medium — Consider GraphQL subscriptions or WebHooks if available |
| **No unified dashboard feed** | Dashboard cards | N+1 requests (`users/self/courses` + individual course calls) mitigated by GraphQL `GetDashboardStats` | 🟢 Low — GraphQL partially solves this |
| **Planner API instability** | Calendar / planner sync | Fallback to `/api/v1/calendar_events` if `planner/items` returns 404 or schema mismatch | 🟡 Medium — Monitor Canvas release notes |
| **File upload preflight** | Upload progress | `canvasFetch` manually handles the 3-step Canvas upload flow (notify → upload → confirm) | 🟢 Low — Well-understood pattern |
| **No batch grade post API** | Gradebook bulk actions | Sequential `post_grades` calls per assignment group | 🔴 High — Slow for large classes; request Canvas feature or implement server-side batch proxy |
| **Blueprint sync status polling** | Admin course copy | Polling loop on `/api/v1/courses/${courseId}/blueprint_subscriptions` every 5s during sync | 🟡 Medium — No webhook for sync completion |
| **Limited analytics granularity** | Course analytics | Combines `/api/v1/courses/:id/analytics` with GraphQL `GetCourseAnalytics` to fill gaps | 🟢 Low — Dual-source strategy is stable |
| **No unified search endpoint** | Global search | Uses separate GraphQL queries (`SearchUsers`, `SearchCourses`) + local fuse.js ranking | 🟡 Medium — May diverge from Canvas search relevance |

### 9.1 Recommended API Requests to Canvas

1. **Bulk grade posting endpoint** — `POST /api/v1/courses/:id/assignments/bulk_post_grades` would eliminate the N sequential call problem.
2. **WebSocket or SSE for conversations** — Real-time inbox would remove the 60s polling overhead.
3. **Unified dashboard feed** — A single endpoint or GraphQL field returning `courses + todo + upcoming_events + activity_summary` would reduce dashboard load time.

---

## 10. Appendix: GraphQL Query Inventory

All queries are defined in `src/graphql/queries.ts` and consumed via `@schoolapex/core` GraphQL utilities.

| Query Name | Purpose | REST Equivalent(s) | Cache Key |
|------------|---------|--------------------|-----------|
| `GetDashboardStats` | Aggregated dashboard KPIs (todo count, upcoming count, course count, unread messages) | `/api/v1/users/self/todo`, `/api/v1/users/self/upcoming_events`, `/api/v1/users/self/courses`, `/api/v1/conversations` | `dashboard:stats` |
| `GetCourses` | Rich course listing with enrollments, term, and image | `/api/v1/courses`, `/api/v1/users/self/courses` | `courses:list` |
| `GetCourse` | Detailed course metadata (settings, permissions, tabs) | `/api/v1/courses/:id` | `course:${courseId}` |
| `GetAssignments` | Assignment list with rubrics, submission status, and due dates | `/api/v1/courses/:id/assignments` | `course:${courseId}:assignments` |
| `GetAssignment` | Single assignment with full rubric, instructions, and attachments | `/api/v1/courses/:id/assignments/:id` | `assignment:${assignmentId}` |
| `GetUsers` | Paginated user directory with roles and enrollments | `/api/v1/accounts/:id/users` | `users:list` |
| `GetUser` | User profile, communication channels, and observees | `/api/v1/users/self`, `/api/v1/users/:id` | `user:${userId}` |
| `GetCourseAnalytics` | Student participation, page views, and grade trends | `/api/v1/courses/:id/analytics` | `course:${courseId}:analytics` |
| `SearchUsers` | Full-text user search across accounts | `/api/v1/accounts/:id/users?search_term=` | `users:search:${query}` |
| `SearchCourses` | Full-text course search with filter facets | `/api/v1/accounts/:id/courses?search_term=` | `courses:search:${query}` |
| `GetGrades` | Grade summary by student and assignment group | `/api/v1/courses/:id/gradebook`, `/api/v1/courses/:id/students/submissions` | `course:${courseId}:grades` |
| `GetCalendarEvents` | Calendar events with context codes and recurrence | `/api/v1/calendar_events` | `calendar:${contextCode}` |
| `GetDiscussions` | Discussion topics with unread counts and reply trees | `/api/v1/courses/:id/discussion_topics` | `course:${courseId}:discussions` |
| `GetFiles` | File listings with folder path and mime type | `/api/v1/courses/:id/files`, `/api/v1/users/self/files` | `files:${context}:${folderId}` |
| `GetFolders` | Folder tree with breadcrumb and permissions | `/api/v1/courses/:id/folders`, `/api/v1/users/self/folders` | `folders:${context}:${parentId}` |
| `GetGroups` | Group memberships with participants and categories | `/api/v1/courses/:id/groups`, `/api/v1/users/self/groups` | `groups:${courseId \| self}` |
| `GetReports` | Admin reports (SIS, grade change, provisioning) | `/api/v1/accounts/:id/reports`, `/api/v1/audit/grade_change` | `reports:${accountId}` |
| `GetAdminUsers` | Admin-optimized user search with role filters | `/api/v1/accounts/:id/users` | `admin:users:${accountId}` |
| `GetSystemSettings` | Feature flags, branding, and account settings | `/api/v1/accounts/:id/features`, `/api/v1/accounts/:id/brand_configs/current` | `system:${accountId}` |

### 10.1 GraphQL Usage Notes

- **No mutations are currently defined in `src/graphql/queries.ts`.** All writes go through REST `useCanvasMutation`.
- **Query complexity:** `GetDashboardStats` and `GetCourseAnalytics` are the heaviest. They hit multiple backend services; always use `@schoolapex/core` deduplication to prevent double-fires.
- **Field deprecation policy:** Canvas does not guarantee GraphQL field stability. Monitor the `extensions.deprecations` array in responses and log warnings to Sentry.
- **Batching:** Up to 5 queries are batched per HTTP POST to `/api/graphql`. This is automatic in `@schoolapex/core` when queries fire within a 10ms window.

---

## Document Maintenance

| Action | Owner | Frequency |
|--------|-------|-----------|
| Update endpoint counts from source analysis | Platform Team | Monthly |
| Validate page-to-endpoint mappings with E2E tests | QA | Per release |
| Review rate limit budgets against Canvas changelogs | SRE | Per Canvas release |
| Audit GraphQL field deprecations | Frontend Lead | Weekly (CI job) |
| Re-assess workarounds when Canvas APIs ship | Product + Eng | Quarterly |

---

*End of Document*
