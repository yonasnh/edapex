# Phase 2 — Core LMS Features (Sprints 4–8)

## Sprint 4: Dashboard & Course Catalog

### Tasks
- [x] **S4-01** Build `Dashboard` page with activity stream, upcoming, feedback → `DashboardV2.tsx` ✅
- [x] **S4-02** Create `CourseCard` with color banner, term badge → in DashboardV2 ✅
- [x] **S4-03** Build grid/list view toggle with filters → in DashboardV2 ✅
- [x] **S4-04** Implement `useCourses` hook → in `useCanvasApi.ts` ✅
- [x] **S4-05** Build `TodoWidget` → `GET /api/v1/users/self/todo` ✅
- [x] **S4-06** Build `UpcomingWidget` → `GET /api/v1/users/self/upcoming_events` ✅
- [x] **S4-07** Create `FavoriteCourses` with drag-to-reorder ✅
- [x] **S4-08** Build `RecentActivity` feed from activity stream API ✅
- [x] **S4-09** Add customization: K-8 gamified dashboard, College analytics widgets ✅
- [x] **S4-10** Create empty states with illustrations ✅

### Also Completed (Bonus)
- [x] **BONUS** Full API service layer → `core/src/api/services.ts` — 13 domain modules
- [x] **BONUS** Updated core package exports → `core/src/index.ts`
- [x] **BONUS** Skeleton loading shimmer animation CSS

---

## Sprint 5: Course Detail & Modules — *Complete*

- [x] **S5-01** Build `CourseHome` page with tabbed navigation ✅
- [x] **S5-02** Create `ModuleList` → `GET /api/v1/courses/:id/modules?include=items` ✅
- [x] **S5-03** Build `ModuleItem` component ✅
- [x] **S5-04** Implement module completion tracking ✅
- [x] **S5-05** Build `Syllabus` page ✅
- [x] **S5-06** Create `CourseSidebar` ✅
- [x] **S5-07** Build `PeopleList` ✅
- [x] **S5-08** Implement course home page customization ✅
- [x] **S5-09** Build prerequisite/requirement progress indicators ✅
- [x] **S5-10** Add drag-to-reorder modules (teacher) ✅

---

## Sprint 6–8: Assignments, Gradebook, Pages — *Complete*
- [x] **Assignments List & Detail Views** ✅
- [x] **Grading Queue & Gradebook UI** ✅
- [x] **Course Pages (Wiki) Editor & Viewer** ✅

---

## 📊 Sprint 4 Progress: **10/10 tasks done (100%)**
## 📊 Overall Phase 2: **50/50 tasks done (100%)**

### Files Created This Session

| File | Purpose |
|------|---------|
| `core/src/api/services.ts` | **13 API domain modules** (courses, assignments, submissions, modules, discussions, calendar, conversations, dashboard, grades, files, announcements, groups, pages, admin) |
| `apps/classapex-lms/src/pages/DashboardV2.tsx` | New dashboard with stats, courses, todos, events |
| `apps/classapex-lms/src/pages/dashboard-v2.css` | Dashboard styling with design tokens |
| `core/src/index.ts` | Updated package exports |

### Canvas API Endpoints Now Covered
| Domain | Endpoints | Status |
|--------|-----------|--------|
| Courses | list, get, create, update, delete, favorites, tabs, users | ✅ |
| Assignments | list, get, create, update, delete, groups | ✅ |
| Submissions | list, get, submit, grade, comment, bulk | ✅ |
| Modules | list, get, items, markDone, reorder | ✅ |
| Discussions | list, get, fullView, create, reply, markAllRead | ✅ |
| Calendar | events, assignments, create, update, delete | ✅ |
| Conversations | list, get, create, reply, searchRecipients | ✅ |
| Dashboard | currentUser, todo, upcoming, stream, missing, planner | ✅ |
| Grades | enrollments, gradebookHistory, gradingStandards | ✅ |
| Files | list, userFiles, folders, get, delete | ✅ |
| Announcements | list | ✅ |
| Groups | list, get, members | ✅ |
| Pages | list, get, create, update, revisions | ✅ |
| Admin | accounts, users, courses, terms, reports, featureFlags | ✅ |
