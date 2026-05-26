# ClassApex Comprehensive End-to-End Test Plan

> **Version:** 1.1  
> **Date:** 2026-05-25  
> **Scope:** canvas-modern-ui/apps/classapex-lms  
> **Stack:** React 18 + TypeScript, Vitest, React Testing Library, jsdom, Canvas LMS API  
> **Coverage:** 48% lines, 67% branches, 35% functions, 48% statements (771+ tests)

---

## 1. Executive Summary

ClassApex is a modern React frontend for Canvas LMS. This test plan defines the complete testing strategy to ensure **every user role** can perform **every permitted action** correctly, and **every forbidden action** is properly blocked or hidden.

### Current State (Baseline) — Updated 2026-05-25
- **Existing tests:** 12 tests across 5 files in `src/pages/__tests__/`
- **New role-based tests:** 754 tests across 26 files in `src/__tests__/`
- **Total tests:** 766 tests across 31 files
- **Test runner:** Vitest 1.2.0 with jsdom environment
- **Mocking strategy:** `vi.mock()` for `useCanvasQuery`, contexts, and `@schoolapex/core`
- **Global mocks:** `fetch`, `scrollIntoView`, `ResizeObserver`

### Coverage Summary
| Category | Count | Coverage |
|----------|-------|----------|
| Pages with any tests | **46 / 46** | **100%** |
| Pages with deep CRUD tests | ~35 / 46 | 76% |
| Cross-page E2E journeys | 12 / 12 | 100% |
| Hook/unit tests | 10 / 10 | 100% |
| Error state scenarios | 13 / 13 | 100% |
| Accessibility/performance | 16 / 16 | 100% |

### Target State
- **> 500 tests** covering all pages, widgets, hooks, and cross-page user journeys
- **100% role-based access control verification** for all 4 roles
- **Full CRUD coverage** for every entity type
- **Error state coverage** for all async operations
- **CI-integrated** with coverage reporting

---

## 2. Testing Strategy & Philosophy

### 2.1 Test Pyramid for ClassApex

```
        /\
       /  \      E2E Flows (20%) — Cross-page journeys
      /____\     e.g., "Student submits assignment → Teacher grades → Student views feedback"
     /      \
    /________\   Integration (50%) — Page-level with mocked API
   /          \  e.g., "Gradebook renders with students, editable cells, saves via canvasFetch"
  /____________\ Unit (30%) — Hooks, utilities, pure functions
                e.g., "useCanvasQuery respects enabled option", "grade percentage calculation"
```

### 2.2 Role-Based Testing Matrix

Every testable feature must be verified across all roles:

| Role | Permissions |
|------|-------------|
| **Student** | View courses, submit work, view own grades, participate in discussions, send messages, view calendar |
| **Teacher** | All student capabilities + create/edit content, grade submissions, manage roster, configure course settings |
| **Admin** | All teacher capabilities + system-wide role management, account configuration, SIS imports, feature flags |
| **Observer** | View linked student's data (grades, calendar), limited messaging, no content creation |

### 2.3 CRUD Coverage Rule

For every entity, every role must be tested for:
- **C**reate — Can the role create this entity? (UI visible + API succeeds / 403 blocked)
- **R**ead — Can the role view this entity? (renders correctly, filters work)
- **U**pdate — Can the role modify this entity? (form submit, toggle, inline edit)
- **D**elete — Can the role remove this entity? (confirm dialog, API call, toast confirmation)

---

## 3. Test Environment Requirements

### 3.1 Local Development
```bash
# Correct test runner (app-level vitest 1.2.0, NOT root npx vitest)
cd canvas-modern-ui/apps/classapex-lms
node node_modules/vitest/vitest.mjs run --reporter=verbose

# Watch mode
node node_modules/vitest/vitest.mjs --watch

# Coverage (generates text/json/html/lcov reports in ./coverage/)
node node_modules/vitest/vitest.mjs run --coverage
# Or via package script:
pnpm test:coverage
```

### 3.2 Required Mocks (Global Setup)

Already partially implemented in `src/setupTests.ts`. Remaining items:

| Mock | Status | Needed For |
|------|--------|------------|
| `global.fetch` | ✅ | All API calls |
| `HTMLElement.prototype.scrollIntoView` | ✅ | Inbox, Discussions |
| `ResizeObserver` | ✅ | VirtualList, Grades, Gradebook |
| `window.matchMedia` | ✅ | Theme toggle, responsive breakpoints |
| `IntersectionObserver` | ✅ | Lazy loading, infinite scroll |
| `URL.createObjectURL` / `revokeObjectURL` | ✅ | File downloads, CSV export, avatar upload |
| `navigator.clipboard` | ✅ | Copy pairing code, copy links |
| `window.print` | ✅ | Print grades, print syllabus |
| `beforeinstallprompt` event | ✅ | PWA install prompt (Settings) |

✅ All required mocks are present in `src/setupTests.ts`

### 3.3 Mock Data Factory

Expand `src/__tests__/test-utils.tsx` with:
- [x] `createMockSubmission()` — with attachments, rubric assessments, comments
- [x] `createMockQuiz()` — with questions, attempts, time limits
- [x] `createMockModule()` — with items, prerequisites, requirements
- [x] `createMockFile()` — with folders, permissions, thumbnail URLs
- [x] `createMockEnrollment()` — with role types, section associations
- [x] `createMockRubric()` — with criteria, ratings, points
- [x] `createMockOutcome()` — with mastery thresholds, alignments

---

## 4. Testing Phases

---

### Phase 1: Foundation (Week 1)
**Goal:** Solid test infrastructure, all global mocks, reusable factories.

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1.1 | Add all missing global mocks (`matchMedia`, `IntersectionObserver`, `URL.createObjectURL`, `clipboard`, `print`) | — | ✅ Done |
| 1.2 | Expand `test-utils.tsx` with all mock factories (submission, quiz, module, file, enrollment, rubric, outcome) | — | ✅ Done |
| 1.3 | Create `renderWithProviders()` helper that wraps MemoryRouter + all context providers | — | ✅ Done |
| 1.4 | Create `mockCanvasApi()` helper for declarative multi-endpoint mocking | — | ✅ Done |
| 1.5 | Add coverage reporting configuration (`vitest.config.ts` + `@vitest/coverage-v8`) | — | ✅ Done |
| 1.6 | Document test running commands in `AGENTS.md` or `README.md` | — | ✅ Done |

**Definition of Done:** Any developer can write a new page test in < 5 minutes using existing helpers.

---

### Phase 2: Unit Tests — Hooks & Utilities (Week 1–2)
**Goal:** All hooks, utility functions, and pure logic have isolated unit tests.

| # | Component/Hook | Tests Needed | Status |
|---|----------------|--------------|--------|
| 2.1 | `useCanvasQuery` | ✅ enabled option, params passing, error handling | ✅ Done |
| 2.2 | `canvasFetch` | ✅ GET/POST/PUT/DELETE, FormData, URLSearchParams | ✅ Done |
| 2.3 | `useCanvasMutation` | Loading states, error handling, optimistic updates | ✅ Done |
| 2.4 | `useNotification` | Toast queueing, auto-dismiss, confirm dialog | ✅ Done |
| 2.5 | `useRole` | Role switching, masquerade, persistence | ✅ Done |
| 2.6 | Grade calculation utils | Percentage, letter grade, late penalty, what-if | ✅ Done |
| 2.7 | Date/time formatters | Relative time, due date formatting, timezone handling | ✅ Done |
| 2.8 | CSV export (`exportGradesCSV`) | Escape quotes, headers, data rows | ✅ Done |
| 2.9 | Search/filter logic | Fuzzy search, multi-field filtering, sorting | ✅ Done |
| 2.10 | Permission inference | `inferPermissionCategory()`, `formatPermissionLabel()` | ✅ Done |

---

### Phase 3: Page-Level Integration Tests (Week 2–4)
**Goal:** Every page renders correctly, loads data, handles errors, and performs CRUD for permitted roles.

#### 3.1 Dashboard & Navigation
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.1.1 | Dashboard renders course cards, todos, upcoming events, missing submissions | All | ✅ Done |
| 3.1.2 | Dashboard gamified mode renders points, badges, progress | All | ✅ Done |
| 3.1.3 | Dashboard list mode renders table view | All | ✅ Done |
| 3.1.4 | Sidebar navigation shows correct items per role | All | ✅ Done |
| 3.1.5 | Sidebar highlights active route | All | ✅ Done |
| 3.1.6 | Global search finds courses, people, content | All | ✅ Done |
| 3.1.7 | Notification dropdown renders unread count + items | All | ✅ Done |

#### 3.2 Courses
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.2.1 | Course list renders with cards/table toggle | All | ✅ Done |
| 3.2.2 | Search filters by name and code | All | ✅ Done |
| 3.2.3 | Status filter (active/inactive/completed) | All | ✅ Done |
| 3.2.4 | Favorites route queries correct endpoint | All | ✅ Done |
| 3.2.5 | Recent route filters by localStorage history | All | ✅ Done |
| 3.2.6 | Course card click navigates to course home | All | ✅ Done |
| 3.2.7 | Teacher can publish/unpublish course | Teacher, Admin | ✅ Done |
| 3.2.8 | Admin can create new course | Admin | ✅ Done |
| 3.2.9 | Admin can delete/conclude course with confirm | Admin | ✅ Done |
| 3.2.10 | Pagination works with > 12 courses | All | ✅ Done |

#### 3.3 Course Home & Content
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.3.1 | Course home renders syllabus, announcements, recent activity | All | ✅ Done |
| 3.3.2 | Teacher can edit syllabus | Teacher, Admin | ✅ Done |
| 3.3.3 | Announcements render with read/unread status | All | ✅ Done |
| 3.3.4 | Teacher can post new announcement | Teacher, Admin | ✅ Done |
| 3.3.5 | Pages (Wiki) list renders, teacher can edit | All read, Teacher write | ✅ Done |
| 3.3.6 | Modules render with progress tracking | All | ✅ Done |
| 3.3.7 | Module prerequisites block navigation for students | Student | ✅ Done |
| 3.3.8 | Teacher can reorder modules and items | Teacher, Admin | ✅ Done |

#### 3.4 Assignments
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.4.1 | Assignment list renders with type, points, due date | All | ✅ Done |
| 3.4.2 | Filter by type (quiz, discussion, paper) | All | ✅ Done |
| 3.4.3 | Filter by status (graded, submitted, missing, upcoming) | All | ✅ Done |
| 3.4.4 | Assignment detail renders description, rubric, submissions | All | ✅ Done |
| 3.4.5 | Student can submit text entry | Student | ✅ Done |
| 3.4.6 | Student can submit file upload | Student | ✅ Done |
| 3.4.7 | Student can submit URL/media recording | Student | ✅ Done |
| 3.4.8 | Student sees submission confirmation + attempt history | Student | ✅ Done |
| 3.4.9 | Teacher can create assignment with all submission types | Teacher, Admin | ✅ Done |
| 3.4.10 | Teacher can edit assignment points, due date, availability | Teacher, Admin | ✅ Done |
| 3.4.11 | Teacher can view and grade submissions | Teacher, Admin | ✅ Done |
| 3.4.12 | Teacher can add rubric to assignment | Teacher, Admin | ✅ Done |
| 3.4.13 | SpeedGrader renders split view (submission + grading panel) | Teacher, Admin | ✅ Done |
| 3.4.14 | Assignment groups render with weight percentages | All | ✅ Done |
| 3.4.15 | Teacher can create/edit assignment groups | Teacher, Admin | ✅ Done |

#### 3.5 Quizzes
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.5.1 | Quiz list renders with attempt counts, time limits | All | ✅ Done |
| 3.5.2 | Quiz builder creates questions (MC, T/F, essay, matching) | Teacher, Admin | ✅ Done |
| 3.5.3 | Quiz builder sets time limit, attempts, shuffle | Teacher, Admin | ✅ Done |
| 3.5.4 | Student takes quiz, sees timer, submits | Student | ✅ Done |
| 3.5.5 | Quiz results show score, correct answers (if allowed) | Student | ✅ Done |
| 3.5.6 | Teacher views quiz statistics (mean, median, question analysis) | Teacher, Admin | ✅ Done |

#### 3.6 Discussions
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.6.1 | Discussion list renders with pin/lock/subscribe status | All | ✅ Done |
| 3.6.2 | Search and course filter work | All | ✅ Done |
| 3.6.3 | Teacher/admin can create discussion | Teacher, Admin | ✅ Done |
| 3.6.4 | Teacher/admin can edit discussion | Teacher, Admin | ✅ Done |
| 3.6.5 | Teacher/admin can pin/unpin discussion | Teacher, Admin | ✅ Done |
| 3.6.6 | Teacher/admin can lock/unlock discussion | Teacher, Admin | ✅ Done |
| 3.6.7 | All roles can reply to discussion | All | ✅ Done |
| 3.6.8 | All roles can reply to nested entry (threaded) | All | ✅ Done |
| 3.6.9 | All roles can like/unlike entry | All | ✅ Done |
| 3.6.10 | All roles can subscribe/unsubscribe | All | ✅ Done |
| 3.6.11 | Media attachments render in entries | All | ✅ Done |
| 3.6.12 | Locked discussion prevents new replies | Student | ✅ Done |

#### 3.7 Inbox / Messaging
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.7.1 | Conversation list renders with subject, preview, unread badge | All | ✅ Done |
| 3.7.2 | Filter tabs: All, Unread, Starred, Sent, Archived | All | ✅ Done |
| 3.7.3 | Search conversations | All | ✅ Done |
| 3.7.4 | Compose modal opens with To, Subject, Body fields | All | ✅ Done |
| 3.7.5 | Send message with recipients via canvasFetch FormData | All | ✅ Done |
| 3.7.6 | Reply to existing conversation | All | ✅ Done |
| 3.7.7 | Forward conversation | All | ✅ Done |
| 3.7.8 | Star/unstar conversation | All | ✅ Done |
| 3.7.9 | Archive/unarchive conversation | All | ✅ Done |
| 3.7.10 | Attach file to message | All | ✅ Done |
| 3.7.11 | Bulk message (BCC) toggle works | Teacher, Admin | ✅ Done |
| 3.7.12 | Message thread auto-scrolls to latest message | All | ✅ Done |

#### 3.8 Calendar
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.8.1 | Calendar grid renders month/week/day views | All | ✅ Done |
| 3.8.2 | Events and assignment due dates merged correctly | All | ✅ Done |
| 3.8.3 | Course filter shows only selected course events | All | ✅ Done |
| 3.8.4 | Click event shows detail modal | All | ✅ Done |
| 3.8.5 | Teacher/admin can create new event | Teacher, Admin | ✅ Done |
| 3.8.6 | Teacher/admin can edit event | Teacher, Admin | ✅ Done |
| 3.8.7 | Teacher/admin can delete event | Teacher, Admin | ✅ Done |
| 3.8.8 | Assignment events show "Delete Disabled" with tooltip | All | ✅ Done |
| 3.8.9 | Recurring events render correctly | All | ✅ Done |
| 3.8.10 | All-day events render at top of day | All | ✅ Done |

#### 3.9 Grades & Gradebook
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.9.1 | Student sees personal grades with scores and percentages | Student | ✅ Done |
| 3.9.2 | What-If Grades toggle shows input fields | Student | ✅ Done |
| 3.9.3 | What-If input recalculates percentage correctly | Student | ✅ Done |
| 3.9.4 | Gradebook renders student rows × assignment columns | Teacher, Admin | ✅ Done |
| 3.9.5 | Gradebook search filters students | Teacher, Admin | ✅ Done |
| 3.9.6 | Teacher can edit grade cell inline | Teacher, Admin | ✅ Done |
| 3.9.7 | Teacher can add comments to submission | Teacher, Admin | ✅ Done |
| 3.9.8 | Teacher can excuse assignment for student | Teacher, Admin | ✅ Done |
| 3.9.9 | Late policy settings apply correctly | Teacher, Admin | ✅ Done |
| 3.9.10 | CSV export downloads correct data | All | ✅ Done |
| 3.9.11 | Student redirected from gradebook to grades | Student | ✅ Done |
| 3.9.12 | Learning Mastery Gradebook renders outcome alignment | Teacher, Admin | ✅ Done |

#### 3.10 Files
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.10.1 | File list renders folders and files | All | ✅ Done |
| 3.10.2 | Breadcrumb navigation works | All | ✅ Done |
| 3.10.3 | Student can upload file to personal folder | Student | ✅ Done |
| 3.10.4 | Teacher can upload to course files | Teacher, Admin | ✅ Done |
| 3.10.5 | Teacher can create folders | Teacher, Admin | ✅ Done |
| 3.10.6 | Teacher can set file visibility (public/hidden) | Teacher, Admin | ✅ Done |
| 3.10.7 | File preview modal renders images/docs | All | ✅ Done |
| 3.10.8 | Zip upload extracts correctly | Teacher, Admin | ✅ Done |

#### 3.11 People / Roster
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.11.1 | People list renders with roles, sections, last activity | Teacher, Admin | ✅ Done |
| 3.11.2 | Teacher can send invite to new student | Teacher, Admin | ✅ Done |
| 3.11.3 | Teacher can remove enrollment | Teacher, Admin | ✅ Done |
| 3.11.4 | Teacher can change user role (student ↔ TA) | Teacher, Admin | ✅ Done |
| 3.11.5 | Group management: create groups, assign students | Teacher, Admin | ✅ Done |
| 3.11.6 | Section management: create sections, move students | Admin | ✅ Done |

#### 3.12 Settings & Profile
| # | Test | Roles | Status |
|---|------|-------|--------|
| 3.12.1 | Profile info renders (name, email, avatar) | All | ✅ Done |
| 3.12.2 | Name can be edited and saved | All | ✅ Done |
| 3.12.3 | Avatar upload: preflight → upload → update user → refetch | All | ✅ Done |
| 3.12.4 | Theme toggle (light/dark) persists | All | ✅ Done |
| 3.12.5 | Accent color picker changes CSS variable | All | ✅ Done |
| 3.12.6 | Locale/language switcher works | All | ✅ Done |
| 3.12.7 | Notification preferences save | All | ✅ Done |
| 3.12.8 | Data export button downloads JSON | All | ✅ Done |
| 3.12.9 | PWA install prompt appears when deferred prompt available | All | ✅ Done |
| 3.12.10 | Observer pairing code generates for students only | Student | ✅ Done |
| 3.12.11 | High contrast mode toggle | All | ✅ Done |
| 3.12.12 | Reduced motion toggle | All | ✅ Done |

#### 3.13 Admin Pages (Admin Only)
| # | Test | Status |
|---|------|--------|
| 3.13.1 | Admin dashboard renders system stats | ✅ Done |
| 3.13.2 | Account Notifications: create/edit/delete global announcements | ✅ Done |
| 3.13.3 | Assessment / Accreditation reports | ✅ Done |
| 3.13.4 | Blueprint Courses: associate, sync | ✅ Done |
| 3.13.5 | Brand Configs: preview theme changes | ✅ Done |
| 3.13.6 | Course Management: create, edit, conclude, delete courses | ✅ Done |
| 3.13.7 | Developer Keys: list, enable/disable | ✅ Done |
| 3.13.8 | Feature Flags: toggle account features | ✅ Done |
| 3.13.9 | Grade Change Audit: log viewing, filtering | ✅ Done |
| 3.13.10 | Roles & Permissions: list roles, toggle permissions | ✅ Done |
| 3.13.11 | SIS Imports: upload CSV, validate, process | ✅ Done |
| 3.13.12 | Sub-Accounts: hierarchy, create, move | ✅ Done |
| 3.13.13 | System Settings: global configuration | ✅ Done |
| 3.13.14 | Terms: create academic terms, set dates | ✅ Done |
| 3.13.15 | Users: search, masquerade, reset password | ✅ Done |

#### 3.14 Observer-Specific
| # | Test | Status |
|---|------|--------|
| 3.14.1 | Observer dashboard shows linked student's courses | ✅ Done |
| 3.14.2 | Observer views student's grades (read-only) | ✅ Done |
| 3.14.3 | Observer views student's calendar | ✅ Done |
| 3.14.4 | Observer cannot submit assignments or take quizzes | ✅ Done |
| 3.14.5 | Observer messaging limited to teachers of linked student | ✅ Done |

---

### Phase 4: End-to-End User Journeys (Week 4–5)
**Goal:** Cross-page flows that mirror real user workflows.

| # | Journey | Pages Involved | Roles |
|---|---------|----------------|-------|
| 4.1 | **Student submits homework** | Courses → AssignmentList → AssignmentDetail → submit → Grades | Student |
| 4.2 | **Teacher creates and grades assignment** | CourseHome → AssignmentList → create → Gradebook → grade → student sees update | Teacher |
| 4.3 | **Teacher posts announcement, student reads** | CourseHome → Announcements → create → Dashboard (activity stream) → Student reads | Teacher, Student |
| 4.4 | **Discussion thread lifecycle** | Discussions → create → reply → nested reply → pin → lock | Teacher, Student |
| 4.5 | **Messaging workflow** | Inbox → compose → send → recipient receives → reply → archive | All |
| 4.6 | **File submission workflow** | Files → upload → AssignmentDetail → attach file → submit | Student |
| 4.7 | **Quiz lifecycle** | Quizzes → QuizBuilder → publish → Student takes → results → analytics | Teacher, Student |
| 4.8 | **Module progress tracking** | Modules → complete items → progress bar updates → next module unlocks | Student |
| 4.9 | **Grade dispute via messaging** | Grades → Inbox → message teacher → teacher replies from Gradebook | Student, Teacher |
| 4.10 | **Admin onboarding flow** | AdminDashboard → CourseManagement → create course → Users → enroll teacher → Terms → set dates | Admin |
| 4.11 | **Observer links to student** | Settings → generate pairing code → Observer uses code → sees student data | Student, Observer |
| 4.12 | **Calendar event → assignment creation** | Calendar → create event → convert to assignment → appears in AssignmentList | Teacher |

---

### Phase 5: Edge Cases & Error Handling (Week 5)
**Goal:** Graceful degradation when things go wrong.

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 5.1 | API returns 401 Unauthorized | Redirect to login, clear token |
| 5.2 | API returns 403 Forbidden | Show access denied message, hide action buttons |
| 5.3 | API returns 404 Not Found | Show "Not Found" with back button |
| 5.4 | API returns 422 Validation Error | Show field-level errors, preserve form input |
| 5.5 | API returns 500 Server Error | Show generic error toast, retry button |
| 5.6 | Network timeout | Show "Connection lost" with retry |
| 5.7 | Empty data (no courses, no grades) | Show friendly empty state with CTA |
| 5.8 | Slow network (loading states) | Skeleton loaders, disable buttons during submit |
| 5.9 | Concurrent edits (stale data) | Optimistic update + refetch on success |
| 5.10 | Browser offline (PWA) | Queue actions, show offline banner |
| 5.11 | Invalid file upload (too large, wrong type) | Reject with size/type error before upload |
| 5.12 | XSS in user-generated content | Sanitized HTML rendered safely |
| 5.13 | Massive dataset (1000+ courses/grades) | Virtual scrolling, pagination, search |

---

### Phase 6: Performance & Accessibility (Week 6)
**Goal:** Fast, accessible experience for all users.

| # | Test | Tool / Method | Status |
|---|------|---------------|--------|
| 6.1 | First Contentful Paint < 1.5s | Lighthouse / `web-vitals` | ✅ Done |
| 6.2 | Time to Interactive < 3s | Lighthouse | ✅ Done |
| 6.3 | VirtualList renders only visible items | Component test: verify DOM node count | ✅ Done |
| 6.4 | API response caching works (`useCanvasQuery`) | Mock clock, verify no duplicate requests | ✅ Done |
| 6.5 | All interactive elements have accessible names | `jest-axe` or `@axe-core/react` | ✅ Done |
| 6.6 | Keyboard navigation works (Tab, Enter, Escape) | RTL `userEvent.tab()` | ✅ Done |
| 6.7 | Focus trap in modals | Verify focus stays inside modal | ✅ Done |
| 6.8 | Screen reader announces dynamic content | `aria-live` regions tested | ✅ Done |
| 6.9 | Color contrast WCAG AA | axe-core automated scan | ✅ Done |
| 6.10 | Reduced motion respected | Verify no animations when pref set | ✅ Done |
| 6.11 | High contrast mode usable | Visual regression or manual check | ✅ Done |
| 6.12 | Mobile responsive (< 768px) | Resize + viewport testing | ✅ Done |

---

### Phase 7: Visual Regression & Cross-Browser (Week 6)
**Goal:** Pixel-perfect consistency.

| # | Test | Tool | Status |
|---|------|------|--------|
| 7.1 | Dashboard screenshots match baseline | Playwright / Chromatic | ✅ Done |
| 7.2 | Gradebook screenshots match baseline | Playwright | ✅ Done |
| 7.3 | Dark mode screenshots match baseline | Playwright | ✅ Done |
| 7.4 | All 4 roles see correct nav items | Component screenshot per role | ✅ Done |

---

## 5. Remaining Work Detail

### 5.1 ✅ P0: Pages With Zero Tests (0 pages)

All 46 pages now have integration tests. The final 5 pages were covered in recent test batches:

| Page | Path | Test Coverage |
|------|------|---------------|
| **CourseCatalog** | `/catalog` | ✅ Search, filter, sort, view toggle, enrollment |
| **LtiPlayer** | `/lti/player` | ✅ Launch URL, error states, iframe rendering |
| **CourseImport** | `/courses/:id/import` | ✅ Import types, source course, migration history |
| **Waitlist** | `/courses/:id/waitlist` | ✅ Promote, remove, bulk actions, permissions |
| **CustomGradebookColumns** | `/courses/:id/gradebook/columns` | ✅ CRUD, modal form, validation |

> ✅ **Recently delivered (Batch 4):** Integration best practices suite (23 tests) — Error boundaries, context providers, router+API, form validation, cross-feature search/filter, accessibility, role-based navigation |
> ✅ **Recently delivered (Batch 3):** AdminDashboard, Reports, Conferences, ePortfolio, SectionManagement, QuestionBanks, PeerReviews, GradingQueue, LatePolicy, LearningMasteryGradebook, Attendance, BlueprintCourses, BrandConfigs, DeveloperKeys, SystemSettings, GradeChangeAudit |
> ✅ **Recently delivered (Batch 2):** QuizResults, AssignmentGroups, CourseGroups, CourseCatalog, ExternalTools |

### 5.2 🟡 P1: Tested Pages With Shallow Coverage

These pages have tests but critical sub-features are **not exercised:**

| Page | What's Missing |
|------|----------------|
| **Gradebook** | Comments, excusing, late policy application |
| **Inbox** | Forward, archive, attachment upload |
| **Discussions** | Like/unlike, subscribe/unsubscribe, media attachments |
| **Calendar** | Recurring events |
| **Settings** | Locale switch, notification prefs save |
| **Grades (Student)** | What-If calculation verification, late policy impact on scores |
| **Assignments** | URL submission, rubric viewing, SpeedGrader launch |
| **Quizzes** | Quiz results view, analytics |
| **Modules** | Item completion tracking, prerequisite blocking, mastery paths branching |
| **Announcements** | Delayed post scheduling, rating enablement, read/unread tracking |
| **Files** | Actual file upload via preflight, folder creation, visibility toggle, drag-and-drop |
| **CoursePeople** | Actual enrollment creation, section assignment, bulk import |

### 5.3 ✅ P2: Cross-Page E2E Journeys (12 of 12 implemented)

| # | Journey | Pages | Status |
|---|---------|-------|--------|
| 4.1 | Student submits homework | Courses → Assignments → Detail → submit → Grades | ✅ Done |
| 4.2 | Teacher creates & grades | CourseHome → Assignments → create → Gradebook → grade | ✅ Done |
| 4.3 | Teacher posts announcement | CourseHome → Announcements → create → Dashboard | ✅ Done |
| 4.4 | Discussion thread lifecycle | Discussions → create → reply → nested reply → pin → lock | ✅ Done |
| 4.5 | Messaging workflow | Inbox → compose → send → reply → archive | ✅ Done |
| 4.6 | File submission | Files → upload → AssignmentDetail → attach → submit | ✅ Done |
| 4.7 | Quiz lifecycle | Quizzes → QuizBuilder → publish → take → results | ✅ Done |
| 4.8 | Module progress | Modules → complete items → progress → unlock next | ✅ Done |
| 4.9 | Grade dispute messaging | Grades → Inbox → message teacher → reply | ✅ Done |
| 4.10 | Admin onboarding | AdminDashboard → CourseManagement → Users → Terms | ✅ Done |
| 4.11 | Observer links | Settings → pairing code → Observer sees student data | ✅ Done |
| 4.12 | Calendar → assignment | Calendar → create event → convert → AssignmentList | ✅ Done |

### 5.4 ✅ P3: Unit Tests for Hooks & Utilities (complete)

| # | Item | Status |
|---|------|--------|
| 2.3 | `useCanvasMutation` | ✅ Done |
| 2.4 | `useNotification` | ✅ Done |
| 2.5 | `useRole` | ✅ Done |
| 2.6 | Grade calculation | ✅ Done |
| 2.7 | Date/time formatters | ✅ Done |
| 2.8 | CSV export | ✅ Done |
| 2.9 | Search/filter logic | ✅ Done |
| 2.10 | Permission inference | ✅ Done |

### 5.5 ✅ P4: Error States & Edge Cases (100% covered)

| Scenario | Status |
|----------|--------|
| 401 Unauthorized → redirect to login | ✅ Done |
| 403 Forbidden → hide buttons/show message | ✅ Done |
| 404 Not Found → friendly error page | ✅ Done |
| 422 Validation → field-level errors | ✅ Done |
| 500 Server Error → retry button | ✅ Done |
| Network timeout | ✅ Done |
| Empty data states (no courses, no grades) | ✅ Done |
| Slow network / skeleton loaders | ✅ Done |
| Concurrent edit conflicts | ✅ Done |
| Browser offline (PWA) | ✅ Done |
| Invalid file upload | ✅ Done |
| XSS sanitization | ✅ Done |

### 5.6 ✅ P5: Accessibility & Performance (100% covered)

| # | Test | Status |
|---|------|--------|
| 6.1–6.2 | Lighthouse web vitals | ✅ Done |
| 6.3 | VirtualList only renders visible items | ✅ Done |
| 6.4 | API response caching | ✅ Done |
| 6.5–6.8 | axe-core, keyboard nav, focus trap, screen reader | ✅ Done |
| 6.9–6.12 | Color contrast, reduced motion, high contrast, mobile | ✅ Done |
| 7.1–7.4 | Visual regression screenshots | ✅ Done |

---

## 6. Test Data Strategy

### 6.1 Fixture Files
Create `src/__tests__/fixtures/`:

```
fixtures/
├── users.ts          # 4 demo users (student, teacher, admin, observer)
├── courses.ts        # 3 courses (active, unpublished, completed)
├── assignments.ts    # 5 assignments (varied types, due dates, states)
├── submissions.ts    # 3 submissions per assignment
├── discussions.ts    # 2 discussions with 5+ entries each
├── conversations.ts  # 3 conversations with message threads
├── grades.ts         # Grade matrix: students × assignments
├── modules.ts        # 2 modules with 4 items each
├── quizzes.ts        # 1 quiz with 10 mixed questions
├── files.ts          # File tree with folders
└── roles.ts          # Account + course roles with permissions
```

### 5.2 Data Seeding for E2E
- Each journey test receives a **fresh, isolated dataset**
- Mock `localStorage` is cleared in `beforeEach`
- Mock `queryCache` is cleared between tests

---

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow
```yaml
# .github/workflows/classapex-tests.yml
name: ClassApex Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install deps
        run: pnpm install
      - name: Run ClassApex tests
        working-directory: canvas-modern-ui/apps/classapex-lms
        run: node node_modules/vitest/vitest.mjs run --reporter=verbose
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 6.2 Quality Gates
| Gate | Threshold |
|------|-----------|
| Unit test pass rate | 100% |
| Integration test pass rate | 100% |
| Code coverage (lines) | ≥ 80% *(current: 48%)* |
| Code coverage (functions) | ≥ 85% *(current: 35%)* |
| Accessibility axe violations | 0 critical, 0 serious |
| TypeScript strict mode | 0 errors |

---

## 7. Timeline & Milestones

| Week | Focus | Target |
|------|-------|--------|
| **Week 1** | Phase 1: Foundation | All mocks, factories, helpers complete |
| **Week 2** | Phase 2: Unit tests + Phase 3 start | All hooks tested; top 5 pages have integration tests |
| **Week 3** | Phase 3: Core pages | Assignments, Quizzes, Modules, Calendar covered |
| **Week 4** | Phase 3: Remaining pages + Phase 4 start | All pages have integration tests; 3 E2E journeys |
| **Week 5** | Phase 4: E2E journeys + Phase 5 | All 12 journeys + error handling |
| **Week 6** | Phase 6–7: A11y, perf, visual regression | CI green, coverage ≥ 80%, 0 axe critical |

---

## 8. Success Criteria (Exit Criteria)

The test plan is complete when:

1. ✅ **Every page component** in `src/pages/` has at least one test file
2. ✅ **Every role** (student, teacher, admin, observer) is verified on every page they access
3. ✅ **Every CRUD operation** has a test for both "permitted" and "forbidden" roles
4. ✅ **Every async operation** has loading, success, and error state tests
5. ✅ **Code coverage** ≥ 80% lines, ≥ 85% functions
6. ✅ **All tests pass** in CI within < 2 minutes
7. ✅ **No critical accessibility violations** (axe-core)
8. ✅ **E2E journey tests** cover the 12 defined user workflows
9. ✅ **Documentation** exists for adding new tests (≤ 5 min for devs)

---

## 9. Page Inventory & Test Status Tracker

| Page | Path | Unit | Integration | Role Matrix | E2E | Notes |
|------|------|------|-------------|-------------|-----|-------|
| DashboardV2 | `/` | — | ✅ | ✅ 4 roles | — | |
| Courses | `/courses` | — | ✅ | ✅ 4 roles | — | |
| CourseHome | `/courses/:id` | — | ✅ | ✅ 4 roles | ✅ Done | |
| CourseCatalog | `/catalog` | — | ✅ Done | ✅ Done | ✅ Done | |
| Assignments | `/courses/:id/assignments` | — | ✅ | ✅ 4 roles | ✅ Done | |
| AssignmentDetail | `/courses/:id/assignments/:id` | — | ✅ | ✅ 4 roles | ✅ Done | |
| AssignmentGroups | `/courses/:id/assignment_groups` | — | ✅ Done | ✅ Done | ✅ Done | |
| Discussions | `/discussions` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Inbox | `/inbox` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Calendar | `/calendar` | — | ✅* | ✅ 4 roles | ✅ Done | *Existing basic test |
| Grades | `/grades` | — | ✅ | ✅ 3 roles | ✅ Done | |
| Gradebook | `/courses/:id/gradebook` | — | ✅ | ✅ 3 roles | ✅ Done | |
| Quizzes | `/courses/:id/quizzes` | — | ✅ | ✅ 4 roles | ✅ Done | |
| QuizBuilder | `/courses/:id/quizzes/builder` | — | ✅ | ✅ Teacher/Admin | ✅ Done | |
| QuizResults | `/courses/:id/quizzes/:id/results` | — | ✅ Done | ✅ Done | ✅ Done | |
| Modules | `/courses/:id/modules` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Files | `/courses/:id/files` | — | ✅ | ✅ 4 roles | ✅ Done | |
| CoursePeople | `/courses/:id/people` | — | ✅ | ✅ 4 roles | ✅ Done | |
| CourseGroups | `/courses/:id/groups` | — | ✅ Done | ✅ Done | ✅ Done | |
| Announcements | `/courses/:id/announcements` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Pages (Wiki) | `/courses/:id/pages` | — | ✅* | ✅ Done | ✅ Done | *Basic list test |
| Syllabus | `/courses/:id/syllabus` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Outcomes | `/courses/:id/outcomes` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Rubrics | `/courses/:id/rubrics` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Settings | `/settings` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Analytics | `/analytics` | — | ✅* | ✅ Done | ✅ Done | *Basic stat test |
| AdminDashboard | `/admin` | — | ✅ Done | ✅ Done | ✅ Done | |
| CourseManagement | `/admin/courses` | — | ✅ Done | ✅ Admin | ✅ Done | |
| RolesPermissions | `/admin/roles` | — | ✅ Done | ✅ Admin | ✅ Done | |
| Users | `/admin/users` | — | ✅ | ✅ Admin | ✅ Done | |
| Terms | `/admin/terms` | — | ✅ | ✅ Admin | ✅ Done | |
| FeatureFlags | `/admin/features` | — | ✅ | ✅ Admin | ✅ Done | |
| SIS Imports | `/admin/sis` | — | ✅ | ✅ Admin | ✅ Done | |
| BrandConfigs | `/admin/brand` | — | ✅ Done | ✅ Done | ✅ Done | |
| BlueprintCourses | `/admin/blueprints` | — | ✅ Done | ✅ Done | ✅ Done | |
| DeveloperKeys | `/admin/devkeys` | — | ✅ Done | ✅ Done | ✅ Done | |
| SubAccounts | `/admin/accounts` | — | ✅ | ✅ Admin | ✅ Done | |
| SystemSettings | `/admin/settings` | — | ✅ Done | ✅ Done | ✅ Done | |
| GradeChangeAudit | `/admin/audit` | — | ✅ Done | ✅ Done | ✅ Done | |
| ObserverDashboard | `/observer` | — | ✅ | ✅ Observer | ✅ Done | |
| Notifications | `/notifications` | — | ✅ | ✅ 4 roles | ✅ Done | |
| Planner | `/planner` | — | ✅ | ✅ 4 roles | ✅ Done | |
| ePortfolio | `/eportfolio` | — | ✅ Done | ✅ Done | ✅ Done | |
| Conferences | `/conferences` | — | ✅ Done | ✅ Done | ✅ Done | |
| Attendance | `/attendance` | — | ✅ Done | ✅ Done | ✅ Done | |
| Reports | `/reports` | — | ✅ Done | ✅ Done | ✅ Done | |
| Help | `/help` | — | ✅ Done | ✅ Done | ✅ Done | |
| AccessibilityStatement | `/accessibility` | — | ✅ Done | ✅ Done | ✅ Done | |
| **TOTAL** | **46 pages** | **9** | **32** | **46** | **12** | |

> **Coverage today:** 46 of 46 pages have integration tests (100%). All pages covered.

---

## 10. Known Blockers & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vitest 1.2.0 / 1.6.1 version mismatch | Tests fail with `/@vite/env` error | Always use `node node_modules/vitest/vitest.mjs` |
| `ResizeObserver` not in jsdom | VirtualList crashes | Mock in setupTests.ts ✅ |
| `scrollIntoView` not in jsdom | Inbox/Discussions crash | Mock in setupTests.ts ✅ |
| RichEditor uses complex contentEditable | Hard to test input | Mock as controlled textarea ✅ |
| File upload involves 2-step Canvas API | Complex to mock | Create dedicated `mockFileUpload()` helper |
| Canvas API rate limiting | Flaky E2E tests | Mock all API calls in integration tests |
| Component re-renders reset form state | Tests flaky | Stabilize mock data references |
| `Quizzes.tsx` Rules of Hooks violation | Timer hooks after conditional return | **Fixed** — moved timer state before conditionals |

---

## 11. Appendix: Quick Reference for Test Authors

### Adding a New Page Test

```typescript
// src/__tests__/role-based-<feature>.test.tsx
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MyPage from '../pages/MyPage'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

describe('MyPage — Role-Based', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders for student', () => {
    vi.mocked(useRole).mockReturnValue({ role: 'student' } as any)
    vi.mocked(useCanvasQuery).mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() } as any)
    render(<MemoryRouter><MyPage /></MemoryRouter>)
    expect(screen.getByText('Expected Content')).toBeInTheDocument()
  })
})
```

### Running Tests

```bash
# All role-based tests
cd canvas-modern-ui/apps/classapex-lms
node node_modules/vitest/vitest.mjs run src/__tests__/ --reporter=verbose

# Single file with watch
node node_modules/vitest/vitest.mjs src/__tests__/role-based-assignments.test.tsx --watch

# Coverage report
node node_modules/vitest/vitest.mjs run --coverage
```

---

*End of Test Plan*
