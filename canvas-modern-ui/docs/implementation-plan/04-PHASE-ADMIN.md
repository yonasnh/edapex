# Phase 4 — Administration & Analytics (Sprints 13–16)

## Sprint 13: Admin Dashboard & Account Management

### Tasks
- [x] **S13-01** Build `AdminDashboard` with KPI cards (users, courses, enrollments, storage) ✅
- [x] **S13-02** Create admin-only route guard (check `admin` role) ✅
- [x] **S13-03** Build `AccountSettings` page → `GET/PUT /api/v1/accounts/:id` ✅
- [x] **S13-04** Create `SubAccountManager` → `GET/POST /api/v1/accounts/:id/sub_accounts` ✅
- [x] **S13-05** Build `TermManager` → `GET/POST/PUT /api/v1/accounts/:id/terms` ✅
- [x] **S13-06** Implement `FeatureFlagsManager` → `GET/PUT /api/v1/accounts/:id/features` ✅
- [x] **S13-07** Create account-level notification creator → `POST .../account_notifications` ✅
- [x] **S13-08** Build branding/theme manager → `GET/PUT /api/v1/accounts/:id/brand_configs` ✅
- [x] **S13-09** Create admin sidebar navigation with role-specific sections ✅
- [x] **S13-10** Implement institution tier selector (K-8/HS/College/University) ✅

---

## Sprint 14: User Management

### Tasks
- [x] **S14-01** Build `UserDirectory` with search, filters, pagination → `GET .../accounts/:id/users` ✅
- [x] **S14-02** Create `UserDetail` profile view → `GET /api/v1/users/:id` ✅
- [x] **S14-03** Build user create/edit form → `POST/PUT /api/v1/accounts/:id/users` ✅
- [x] **S14-04** Implement role assignment → `POST/DELETE /api/v1/accounts/:id/admins` ✅
- [x] **S14-05** Build enrollment management → `POST/DELETE /api/v1/courses/:id/enrollments` ✅
- [x] **S14-06** Create bulk user import via CSV → `POST /api/v1/accounts/:id/sis_imports` ✅
- [x] **S14-07** Build user activity log → `GET /api/v1/users/:id/page_views` ✅
- [x] **S14-08** Create masquerade ("Act As") feature → `POST /api/v1/users/:id/masquerade` ✅
- [x] **S14-09** Implement communication channel management → `GET/POST .../communication_channels` ✅
- [x] **S14-10** Build observer/parent linking → `GET/POST .../users/:id/observees` ✅

---

## Sprint 15: Course Administration

### Tasks
- [x] **S15-01** Build `CourseAdmin` list with bulk actions → `GET /api/v1/accounts/:id/courses` ✅
- [x] **S15-02** Create course create/edit form → `POST/PUT /api/v1/accounts/:id/courses` ✅
- [x] **S15-03** Build course copy/migration tool → `POST .../content_migrations` ✅
- [x] **S15-04** Implement course conclude/delete/restore workflows ✅
- [x] **S15-05** Create section management → `GET/POST .../courses/:id/sections` ✅
- [x] **S15-06** Build blueprint course management → `GET/PUT .../courses/:id/blueprint` ✅
- [x] **S15-07** Create course settings panel → `PUT /api/v1/courses/:id/settings` ✅
- [x] **S15-08** Implement course import/export (Common Cartridge, Canvas package) ✅
- [x] **S15-09** Build navigation tab reordering → `PUT /api/v1/courses/:id/tabs` ✅
- [x] **S15-10** Create enrollment audit view per course ✅

---

## Sprint 16: Reports & Analytics

### Tasks
- [x] **S16-01** Build `AnalyticsDashboard` with charts (Chart.js / Recharts) ✅
- [x] **S16-02** Create enrollment trends chart (enrollments over time) ✅
- [x] **S16-03** Build course activity heatmap (page views, participations) ✅
- [x] **S16-04** Create student analytics → `GET /api/v1/courses/:id/analytics/users/:id` ✅
- [x] **S16-05** Build grade distribution visualizations per assignment ✅
- [x] **S16-06** Implement `AccountReports` runner → `POST /api/v1/accounts/:id/reports/:type` ✅
- [x] **S16-07** Create report download/export system (CSV, PDF) ✅
- [x] **S16-08** Build audit trail viewer → `GET /api/v1/audit/grade_change/courses/:id` ✅
- [x] **S16-09** Create student progress tracking dashboard ✅
- [x] **S16-10** Implement data visualization for customization tiers ✅

---

## 📊 Phase 4 Progress: **40/40 tasks done (100%)**
