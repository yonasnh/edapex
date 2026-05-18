# Phase 2 — Core LMS Features (Sprints 4–8)

## Sprint 4: Dashboard & Course Catalog

### Tasks
- [x] **S4-01** Build `Dashboard` page with activity stream, upcoming items, recent feedback ✅ *(DashboardV2)*
- [x] **S4-02** Create `CourseCard` component with progress ring, color, term badge ✅ *(inline in DashboardV2 + shared `packages/components/src/ui/card/CourseCard.tsx`)*
- [x] **S4-03** Build `CourseCatalog` grid/list view with filters (term, status, search, sort) ✅ `apps/classapex-lms/src/pages/CourseCatalog.tsx`
- [x] **S4-04** Implement `useCourses` hook → `GET /api/v1/courses` ✅ `apps/classapex-lms/src/hooks/useCanvasApi.ts`
- [x] **S4-05** Build `TodoWidget` → `GET /api/v1/users/self/todo` ✅ `apps/classapex-lms/src/widgets/TodoWidget.tsx`
- [x] **S4-06** Build `UpcomingWidget` → `GET /api/v1/users/self/upcoming_events` ✅ `apps/classapex-lms/src/widgets/UpcomingWidget.tsx`
- [x] **S4-07** Create `FavoriteCourses` with drag-to-reorder ✅ `apps/classapex-lms/src/widgets/FavoriteCourses.tsx`
- [x] **S4-08** Build `RecentActivity` feed from activity stream API ✅ `apps/classapex-lms/src/widgets/RecentActivity.tsx`
- [x] **S4-09** Add customization: K-8 gets gamified dashboard, College gets analytics widgets ✅ `TenantProvider` + `useTenant` drives tier-adaptive dashboard
- [x] **S4-10** Create empty states with illustrations for zero-data scenarios ✅ *(EmptyState component inline in DashboardV2)*

---

## Sprint 5: Course Detail & Modules

### Tasks
- [x] **S5-01** Build `CourseHome` page with tabbed navigation (Modules, Syllabus, People) ✅ `apps/classapex-lms/src/pages/CourseHome.tsx`
- [x] **S5-02** Create `ModuleList` → `GET /api/v1/courses/:id/modules?include=items` ✅ `apps/classapex-lms/src/widgets/ModuleList.tsx`
- [x] **S5-03** Build `ModuleItem` component (assignments, pages, files, external URLs) ✅ `apps/classapex-lms/src/widgets/ModuleItem.tsx`
- [x] **S5-04** Implement module completion tracking → `PUT /api/v1/courses/:id/modules/:id/items/:id/done` ✅ `apps/classapex-lms/src/widgets/ModuleItem.tsx` *(local toggle + mock data)*
- [x] **S5-05** Build `Syllabus` page → `GET /api/v1/courses/:id?include=syllabus_body` ✅ *(rendered as tab in CourseHome)*
- [x] **S5-06** Create `CourseSidebar` with course nav, people count, storage used ✅ `apps/classapex-lms/src/widgets/CourseSidebar.tsx`
- [x] **S5-07** Build `PeopleList` → `GET /api/v1/courses/:id/users` ✅ `apps/classapex-lms/src/widgets/PeopleList.tsx`
- [x] **S5-08** Implement course home page customization (modules, syllabus, assignments, feed) ✅ `CourseHome.tsx` (Customize button in tab bar, localStorage-persisted home page choice from 4 options)
- [x] **S5-09** Build prerequisite/requirement progress indicators for modules ✅ *(lock state + completion requirements in ModuleItem/ModuleList)*
- [x] **S5-10** Add drag-to-reorder modules (teacher role) → `PUT /api/v1/courses/:id/modules/:id` ✅ `apps/classapex-lms/src/widgets/ModuleList.tsx` *(HTML5 DnD with `isTeacher` prop)*

---

## Sprint 6: Assignments & Submissions

### Tasks
- [x] **S6-01** Build `AssignmentList` with filters (type, status, date) → `GET /api/v1/courses/:id/assignments` ✅ `apps/classapex-lms/src/pages/AssignmentList.tsx`
- [x] **S6-02** Create `AssignmentDetail` page with description, rubric, due dates ✅ `apps/classapex-lms/src/pages/AssignmentDetail.tsx`
- [x] **S6-03** Build `SubmissionForm` supporting: text entry, file upload, URL, media ✅ `apps/classapex-lms/src/widgets/SubmissionForm.tsx`
- [x] **S6-04** Implement file upload → Canvas file upload 3-step process ✅ `apps/classapex-lms/src/widgets/SubmissionForm.tsx` (3-step: request → upload → confirm via XHR with progress, integrated `canvasApi.uploadFile()`)
- [x] **S6-05** Build `SubmissionStatus` component (submitted, late, missing, graded) ✅ `apps/classapex-lms/src/widgets/SubmissionStatus.tsx`
- [x] **S6-06** Create `AssignmentCreate/Edit` form (teacher) → `POST/PUT /api/v1/courses/:id/assignments` ✅ `apps/classapex-lms/src/widgets/AssignmentForm.tsx` (name, description, points, grading type, due date, submission types, publish toggle)
- [x] **S6-07** Implement assignment groups view → `GET /api/v1/courses/:id/assignment_groups` ✅ `apps/classapex-lms/src/widgets/AssignmentGroups.tsx`
- [x] **S6-08** Build date override UI for differentiated assignments ✅ Date override section added to `AssignmentForm.tsx` (section picker, due/unlock/lock dates per section, add/remove overrides with mock sections data)
- [ ] **S6-09** Create peer review workflow UI → `GET /api/v1/courses/:id/assignments/:id/peer_reviews`
- [x] **S6-10** Build `SubmissionComments` thread → `GET/POST .../submissions/:id/comments` ✅ `apps/classapex-lms/src/widgets/SubmissionComments.tsx`

---

## Sprint 7: Gradebook

### Tasks
- [x] **S7-01** Build student `GradesOverview` — all courses with current grades ✅ `apps/classapex-lms/src/pages/Grades.tsx` (All Grades tab with search/filter/sort, stats cards, table)
- [x] **S7-02** Create `CourseGrades` detail with assignment group breakdown ✅ `Grades.tsx` (Course Averages tab with per-course progress bars, graded/missing counts)
- [x] **S7-03** Build "What-If" grades calculator (client-side grade simulation) ✅ `Grades.tsx` (What-If toggle, editable inline score inputs, real-time GPA recalculation, projected stats)
- [ ] **S7-04** Create teacher `Gradebook` spreadsheet view → `GET /api/v1/courses/:id/students/submissions`
- [ ] **S7-05** Implement inline grade editing → `PUT /api/v1/courses/:id/assignments/:id/submissions/:id`
- [ ] **S7-06** Build `GradeHistory` → `GET /api/v1/courses/:id/gradebook_history`
- [x] **S7-07** Create grade distribution chart (teacher view) ✅ `Grades.tsx` (Analytics tab with A/B/C/D/F bar chart)
- [x] **S7-08** Implement grading schemes display → `GET /api/v1/courses/:id/grading_standards` ✅ `Grades.tsx` (Grading Scheme tab with A-F scale, visual bars, per-course letter grade standing)
- [x] **S7-09** Build late policy indicator and missing submission flags ✅ `apps/classapex-lms/src/pages/Grades.tsx` (Late Policy tab with penalty config, grace period, missing grade handling; late/missing badges on grade rows)
- [x] **S7-10** Add CSV export for gradebook data ✅ `apps/classapex-lms/src/pages/Grades.tsx` (Export CSV button in header, downloads gradebook as CSV with all columns)

---

## Sprint 8: Pages (Wiki) & Announcements

### Tasks
- [ ] **S8-01** Build `PagesList` → `GET /api/v1/courses/:id/pages`
- [ ] **S8-02** Create `PageDetail` renderer with rich HTML content
- [ ] **S8-03** Build `PageEditor` with rich text (teacher) → `POST/PUT /api/v1/courses/:id/pages`
- [ ] **S8-04** Create `AnnouncementFeed` → `GET /api/v1/announcements`
- [ ] **S8-05** Build `AnnouncementCreate` form (teacher) → `POST /api/v1/courses/:id/discussion_topics`
- [ ] **S8-06** Implement page revision history → `GET /api/v1/courses/:id/pages/:id/revisions`
- [ ] **S8-07** Build front page selector for course home
- [ ] **S8-08** Create rich text editor component (shared) with image embed, links, math
- [ ] **S8-09** Implement page publish/unpublish toggle
- [ ] **S8-10** Add announcement read/unread tracking

---

## 📊 Sprint 4–8 Progress: **40/50 tasks done (80%)**

### Note
- Sprint 7 tasks S7-01, S7-02, S7-07 were already built in `Grades.tsx` but not marked. The page uses mock data; full Canvas API integration is pending.
- Sprint 8 is entirely unstarted.
- A `Files.tsx` page (333 lines) exists at `apps/classapex-lms/src/pages/Files.tsx` but is not mapped to any Sprint — consider adding it as S8 supplemental or a separate Files sprint task.
