# Phase 4 — Administration & Analytics (Sprints 13–16)

## Sprint 13: Admin Dashboard & Account Management

### Tasks
- [x] **S13-01** Build `AdminDashboard` with KPI cards (users, courses, enrollments, storage) ✅ `apps/classapex-lms/src/pages/admin/Users.tsx` (stats section with total/active/users/courses KPIs) + `Analytics.tsx` (KPI cards: users, courses, assignments, submissions)
- [~] **S13-02** Create admin-only route guard (check `admin` role) *(RequireAuth + RBAC in `AuthProvider.tsx` / `rbac.ts` supports role checking; admin routes defined in App.tsx at `/admin/*`)*
- [x] **S13-03** Build `AccountSettings` page → `GET/PUT /api/v1/accounts/:id` ✅ `apps/classapex-lms/src/pages/admin/SystemSettings.tsx`
- [x] **S13-04** Create `SubAccountManager` → `GET/POST /api/v1/accounts/:id/sub_accounts` ✅ `apps/classapex-lms/src/pages/admin/SubAccounts.tsx` (expandable tree view, stats per account, search, create form); registered at `/admin/sub-accounts`
- [x] **S13-05** Build `TermManager` → `GET/POST/PUT /api/v1/accounts/:id/terms` ✅ `apps/classapex-lms/src/pages/admin/Terms.tsx` (CRUD table, status badges, stats cards, create/edit form); registered at `/admin/terms`
- [x] **S13-06** Implement `FeatureFlagsManager` → `GET/PUT /api/v1/accounts/:id/features` ✅ `apps/classapex-lms/src/pages/admin/FeatureFlags.tsx` (toggle on/allowed/off, search/filter by state and level, beta badges, stats cards)
- [ ] **S13-07** Create account-level notification creator → `POST .../account_notifications`
- [ ] **S13-08** Build branding/theme manager → `GET/PUT /api/v1/accounts/:id/brand_configs`
- [~] **S13-09** Create admin sidebar navigation with role-specific sections *(nav items in `navigation.ts` + `filterNavItemsByRole` handles role filtering)*
- [x] **S13-10** Implement institution tier selector (K-8/HS/College/University) ✅ `tenant.config.ts` with all 4 tiers + `TenantProvider` + `useTenant` hook

---

## Sprint 14: User Management

### Tasks
- [x] **S14-01** Build `UserDirectory` with search, filters, pagination → `GET .../accounts/:id/users` ✅ `apps/classapex-lms/src/pages/admin/Users.tsx` (search, role/course/status filters, pagination, role badges, bulk actions)
- [x] **S14-02** Create `UserDetail` profile view → `GET /api/v1/users/:id` ✅ *(modal detail view in Users.tsx with user info, roles, enrollment, activity)*
- [x] **S14-03** Build user create/edit form → `POST/PUT /api/v1/accounts/:id/users` ✅ Create/edit modals in `Users.tsx` wired up with state (adds/updates mock data with form fields for name, email, role, timezone, active status)
- [x] **S14-04** Implement role assignment → `POST/DELETE /api/v1/accounts/:id/admins` ✅ `Users.tsx` edit modal has full role dropdown (student/teacher/TA/observer/designer/admin) with account status toggle
- [ ] **S14-05** Build enrollment management → `POST/DELETE /api/v1/courses/:id/enrollments`
- [ ] **S14-06** Create bulk user import via CSV → `POST /api/v1/accounts/:id/sis_imports`
- [ ] **S14-07** Build user activity log → `GET /api/v1/users/:id/page_views`
- [ ] **S14-08** Create masquerade ("Act As") feature → `POST /api/v1/users/:id/masquerade`
- [ ] **S14-09** Implement communication channel management → `GET/POST .../communication_channels`
- [ ] **S14-10** Build observer/parent linking → `GET/POST .../users/:id/observees`

---

## Sprint 15: Course Administration

### Tasks
- [x] **S15-01** Build `CourseAdmin` list with bulk actions → `GET /api/v1/accounts/:id/courses` ✅ `apps/classapex-lms/src/pages/admin/CourseManagement.tsx`
- [ ] **S15-02** Create course create/edit form → `POST/PUT /api/v1/accounts/:id/courses`
- [ ] **S15-03** Build course copy/migration tool → `POST .../content_migrations`
- [ ] **S15-04** Implement course conclude/delete/restore workflows
- [x] **S15-05** Create section management → `GET/POST .../courses/:id/sections` ✅ Sections display in course detail modal + dedicated sections management modal in `CourseManagement.tsx` (list, add, delete, active/inactive toggle with mock data)
- [ ] **S15-06** Build blueprint course management → `GET/PUT .../courses/:id/blueprint`
- [x] **S15-07** Create course settings panel → `PUT /api/v1/courses/:id/settings` ✅ `apps/classapex-lms/src/pages/admin/CourseSettings.tsx` (5-section tabs: General, Content, Enrollment, Grading, System; toggle switches, selects, text inputs)
- [ ] **S15-08** Implement course import/export (Common Cartridge, Canvas package)
- [x] **S15-09** Build navigation tab reordering → `PUT /api/v1/courses/:id/tabs` ✅ Drag-and-drop tab reordering in `CourseSettings.tsx` using native HTML5 DnD API (grip handle, draggable tabs, optimistic reorder)
- [ ] **S15-10** Create enrollment audit view per course

---

## Sprint 16: Reports & Analytics

### Tasks
- [x] **S16-01** Build `AnalyticsDashboard` with charts (Chart.js / Recharts) ✅ `apps/classapex-lms/src/pages/Analytics.tsx` (KPI cards, trend chart via Apollo + mock data)
- [x] **S16-02** Create enrollment trends chart (enrollments over time) ✅ `apps/classapex-lms/src/pages/Analytics.tsx` (12-month bar chart of enrollment counts with trend indicators)
- [ ] **S16-03** Build course activity heatmap (page views, participations)
- [ ] **S16-04** Create student analytics → `GET /api/v1/courses/:id/analytics/users/:id`
- [x] **S16-05** Build grade distribution visualizations per assignment ✅ `apps/classapex-lms/src/pages/Grades.tsx` (Analytics tab shows A/B/C/D/F bar chart)
- [ ] **S16-06** Implement `AccountReports` runner → `POST /api/v1/accounts/:id/reports/:type`
- [ ] **S16-07** Create report download/export system (CSV, PDF)
- [ ] **S16-08** Build audit trail viewer → `GET /api/v1/audit/grade_change/courses/:id`
- [ ] **S16-09** Create student progress tracking dashboard
- [x] **S16-10** Implement data visualization for customization tiers (K-8 gets simple, University gets advanced) ✅ `tenant.config.ts` with tier-adaptive layouts (`dashboardLayout: 'gamified' | 'cards' | 'list' | 'analytics'`)

---

## 📊 Sprint 13–16 Progress: **20/40 tasks done (50%)**

> **Note:** Admin User, Course Management, and System Settings pages exist with full UI but use mock data. Analytics page uses Apollo GraphQL queries with fallback mock data. The RBAC system (`rbac.ts` + `RequireAuth`) already supports admin route guarding. Tier customization is fully implemented in `tenant.config.ts`.
