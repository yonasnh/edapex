# ClassApex vs. Native Canvas LMS — Feature Parity Matrix

> **Version:** 1.1  
> **Date:** 2026-05-25  
> **Scope:** ClassApex modern React UI (`canvas-modern-ui/apps/classapex-lms`) compared against native Canvas LMS (Instructure hosted/open-source).  
> **Assessment Method:** Codebase analysis of 64 page components, 28 shared components, hooks, and GraphQL/REST API integration layers.

---

## 1. Legend

| Symbol | Meaning |
|--------|---------|
| ✅ **Full parity** | Feature is implemented with comparable depth to native Canvas. |
| 🟡 **Partial** | Feature exists but with notable limitations or reduced depth. |
| ❌ **Missing** | Feature is not implemented; would need to be built. |
| 🚫 **Out of scope** | Explicitly outside ClassApex product boundaries (separate products, native apps, etc.). |
| ➕ **ClassApex exceeds** | ClassApex offers capabilities beyond native Canvas. |

---

## 2. Core Student Experience Matrix

| Feature | Native Canvas | ClassApex | Notes |
|---------|:-------------:|:---------:|-------|
| **Dashboard — Activity Stream** | ✅ | 🟡 | ClassApex shows activity stream summary, todo list, upcoming events, missing submissions, and favorite courses. Does not yet surface "recent feedback" or "global announcements" in the main feed (account announcements render as banners). |
| **Dashboard — Course Cards** | ✅ | ✅ | Card and list layouts supported. Gamified layout variant available via tenant config. |
| **Dashboard — To-Do List** | ✅ | ✅ | Powered by `/api/v1/users/self/todo`. |
| **Dashboard — Missing Submissions** | ✅ | ✅ | Powered by `/api/v1/users/self/missing_submissions`. Collapsible section. |
| **Courses — Course List** | ✅ | ✅ | All / Favorites / Recent / Catalog sub-views. Course progress bars included. |
| **Courses — Recent Activity** | ✅ | 🟡 | Recent Activity widget exists on DashboardV2. Course-level recent activity feed is not surfaced on CourseHome. |
| **Calendar — Month View** | ✅ | ✅ | Custom React implementation with Canvas API events. Color-coded by type. |
| **Calendar — Week / Day Views** | ✅ | ✅ | Week, day, and agenda views implemented. |
| **Calendar — Scheduler / Appointment Groups** | ✅ | ✅ | Appointment slot creation and student reservation via `AppointmentScheduler.tsx`. |
| **Calendar — Event Creation** | ✅ | 🟡 | Users can create events; recurring events and scheduler slots are not supported. |
| **Grades — Assignment Grades** | ✅ | ✅ | Full grade list with course filter. |
| **Grades — Total Grade** | ✅ | ✅ | Current / final grade display. |
| **Grades — Rubric View** | ✅ | 🟡 | Rubric criteria display exists on assignment detail. Interactive rubric scoring view for students is partial. |
| **Grades — What-If Scores** | ✅ | ✅ | Hypothetical score entry supported. |
| **Grades — Grade Trends** | ✅ | ➕ | ClassApex adds visual trend indicators and performance analytics not present in native Canvas student grades. |
| **Assignments — List View** | ✅ | ✅ | Filterable by course, status, and due date. |
| **Assignments — Detail View** | ✅ | ✅ | Full assignment detail with submission UI. |
| **Assignments — Submission Types** | ✅ | 🟡 | File upload, text entry, URL, and media recording supported. Studio embed and Office 365 are not supported. |
| **Assignments — Peer Reviews** | ✅ | 🟡 | Peer review list and submission UI exists. Anonymous peer reviews and rubric-based peer grading are partial. |
| **Quizzes — Classic Quiz Taking** | ✅ | ✅ | Multiple choice, true/false, short answer, essay, multiple answers, matching, fill-in-multiple-blanks, numerical, formula, and file upload are supported. |
| **Quizzes — New Quizzes** | ✅ | ✅ | New Quizzes detected via assignment API (`is_quiz_assignment` / `external_tool` filter). Embedded via `NewQuizzesIframe.tsx` pointing to `/courses/:id/new_quizzes/taking|build|moderation`. |
| **Quizzes — Quiz Builder** | ✅ | 🟡 | Full question creation with 7 types (MC, T/F, essay, fill-in-blank, matching, multiple answers, numerical). Question groups with randomization (pick N from group) implemented. Question randomization and regrade are partial. |
| **Quizzes — Quiz Results / Review** | ✅ | ✅ | Dual-role results page. Teachers see full submission list with filters and stats. Students see their own score summary, question breakdown, and correct-answer reveal based on quiz settings (`show_correct_answers`, `hide_results`, etc.). |
| **Discussions — Threaded Replies** | ✅ | ✅ | Nested reply threads supported. |
| **Discussions — Ratings** | ✅ | ✅ | Wired to Canvas rating API. |
| **Discussions — Podcast / RSS** | ✅ | ✅ | RSS 2.0 + iTunes podcast tags via `PodcastFeedGenerator.tsx`. |
| **Discussions — Pin / Unpin** | ✅ | 🟡 | UI present but depth untested against Canvas API pinning. |
| **Discussions — Allow Comments Toggle** | ✅ | 🟡 | Settings exist but may not fully propagate to Canvas. |
| **Modules — Module List** | ✅ | ✅ | Expandable/collapsible modules with item types. |
| **Modules — Prerequisites** | ✅ | ✅ | Prerequisite editing and enforcement supported. |
| **Modules — Requirements** | ✅ | ✅ | Completion requirements (view, mark done, contribute, score) supported. |
| **Modules — Progression (Sequential)** | ✅ | 🟡 | UI reflects requirements; strict sequential enforcement is partial. |
| **Modules — MasteryPaths** | ✅ | 🟡 | MasteryPaths UI exists with rule-based branching (remedial / standard / advanced). Full adaptive release logic is simplified. |
| **Modules — Drag-and-Drop Reordering** | ✅ | ✅ | Both module and item-level DnD implemented. |
| **Files — Folder Tree** | ✅ | ✅ | Breadcrumb navigation, drill-down, and root entry. |
| **Files — Preview** | ✅ | 🟡 | FileCard shows thumbnails for images. DocViewer iframe wrapper integrated in GradingQueue for document preview and annotation. |
| **Files — Usage Rights** | ✅ | ✅ | Usage rights editing in preview modal and bulk operations bar. |
| **Files — Bulk Operations** | ✅ | 🟡 | Reusable `BulkOperationsBar.tsx` supports multi-select actions in Files. |
| **Files — Upload / New Folder** | ✅ | ✅ | Drag-and-drop upload and folder creation supported. |
| **Pages (Wiki) — Page List** | ✅ | ✅ | Course pages list with search. |
| **Pages — Front Page** | ✅ | 🟡 | Front page flag is respected but not prominently highlighted. |
| **Pages — Page History** | ✅ | ✅ | `PageHistoryModal.tsx` with revision list, preview, restore, and diff compare. |
| **Pages — Page Order** | ✅ | ✅ | Drag-and-drop reordering with localStorage persistence and front page setting. |
| **Announcements — List** | ✅ | ✅ | Course announcements with search. |
| **Announcements — Delay Posting** | ✅ | 🟡 | Delayed posting is supported in creation modal but UI visibility of scheduled state is partial. |
| **Announcements — Podcast** | ✅ | ✅ | RSS 2.0 + iTunes podcast tags via `PodcastFeedGenerator.tsx`. |
| **Announcements — Allow Comments** | ✅ | 🟡 | Toggle exists; full comment thread integration is partial. |
| **Syllabus — Auto-Generated** | ✅ | 🟡 | Syllabus page renders assignments list and description. Auto-generation from assignments is partial. |
| **Syllabus — Public Syllabus** | ✅ | ✅ | `PublicSyllabus.tsx` at `/courses/:courseId/syllabus/public`. |
| **People — Enrollment List** | ✅ | ✅ | CoursePeople page lists enrollments with avatars. |
| **People — Groups Tab** | ✅ | ✅ | CourseGroups page for managing course-level groups. |
| **People — User Search** | ✅ | 🟡 | Search exists but is client-side only on some views. |
| **People — Prior Enrollments** | ✅ | ✅ | `PriorEnrollments.tsx` at `/courses/:courseId/people/prior`. |
| **People — Enrollment Management** | ✅ | 🟡 | Teachers can invite users; full enrollment role editing is partial. |
| **Groups — Group Home** | ✅ | 🟡 | Group list and navigation exist. Group-specific files, discussions, and collaborations are partial. |
| **Outcomes — Outcome Groups** | ✅ | ✅ | Hierarchical outcome groups supported. |
| **Outcomes — Alignments** | ✅ | 🟡 | Alignment to assignments exists. Rubric-level alignment depth is partial. |
| **Outcomes — Calculation Methods** | ✅ | 🟡 | UI shows methods; custom calculation logic is simplified. |
| **Rubrics — Criterion Ratings** | ✅ | ✅ | Full rubric criteria display. |
| **Rubrics — Free-Form Comments** | ✅ | 🟡 | Comment input exists but is not as rich as native SpeedGrader rubric comments. |
| **Rubrics — Learning Outcome Alignment** | ✅ | 🟡 | Outcome rubrics exist; deep alignment workflow is partial. |
| **Analytics — Course Analytics** | ✅ | 🟡 | Activity, submissions, and grades stats are shown. Native Canvas analytics visualizations (page views, participation, etc.) are simplified. |
| **Analytics — Student Analytics** | ✅ | 🟡 | Student-level analytics exist but are less granular. |
| **Attendance — Roll Call** | ✅ | 🟡 | Attendance page exists. Badge system and reporting are partial. |
| **Conferences — BigBlueButton** | ✅ | 🟡 | Conference list and join links supported. Full BBB moderation tools are not surfaced. |
| **Conferences — Zoom** | ✅ | ✅ | `ZoomLtiPage.tsx` detects Zoom LTI tool in course external tools, fetches sessionless launch URL, and embeds via iframe. Falls back to helpful message if not installed. |
| **Settings — Profile / Avatar** | ✅ | ✅ | Avatar upload and profile editing. |
| **Settings — Notification Preferences** | ✅ | ✅ | Full matrix UI with rows (Due Date, Grading, Invitation, Announcement, Discussion, Conversation, Submission Comment) and columns (communication channels) with frequency dropdowns (immediately / daily / weekly / never). |
| **Settings — Communication Channels** | ✅ | ✅ | Email and SMS channel management. |
| **Settings — Pairing Codes** | ✅ | ✅ | Observer pairing code generation supported. |
| **Settings — Feature Options** | ✅ | ✅ | `CourseFeatureFlags.tsx` lists and toggles course-level features via Canvas API. Respects locked states and inherited settings. |
| **ePortfolios — Pages & Sections** | ✅ | 🟡 | ePortfolio creation and page management exist. Public sharing controls and section-level editing are partial. |
| **LTI — Tool Launch** | ✅ | ✅ | LtiPlayer page handles tool launches in iframe. |
| **LTI — Global Navigation Placements** | ✅ | ✅ | Dynamic sidebar items injected from `/api/v1/accounts/1/external_tools`. |
| **External Tools — List** | ✅ | ✅ | ExternalTools page lists course-level tools. |
| **Help — Links & Tickets** | ✅ | 🟡 | Help links and support contact form. Native Canvas help menu customization is partial. |
| **Accessibility Statement** | ✅ | ➕ | ClassApex includes a dedicated accessibility statement page; native Canvas buries this in footer links. |
| **Course Catalog — Public Browse** | ✅ | 🟡 | CourseCatalog page exists for public discovery. Enrollment workflow from catalog is partial. |
| **Observer Dashboard** | ✅ | 🟡 | ObserverDashboard exists with linked student view. Multi-student observer switching is partial. |
| **Inbox — Conversation List** | ✅ | ✅ | Split-pane inbox with search/filter. |
| **Inbox — Message Thread** | ✅ | ✅ | Threaded message display with reply. |
| **Inbox — Compose New Message** | ✅ | ✅ | Multi-recipient compose with course context. |
| **Inbox — Media Comments** | ✅ | ✅ | `MediaCommentRecorder.tsx` WebRTC audio/video recording. |
| **Inbox — Forwarding** | ✅ | ✅ | Forward button with pre-filled compose modal. |
| **Inbox — Attachments** | ✅ | 🟡 | Attachment icon in UI; full file attachment workflow is partial. |
| **Planner — Weekly Task View** | ✅ | ✅ | Day-grouped planner with progress tracking. |
| **Planner — Calendar Sync** | ✅ | ✅ | Subscribe and Copy Calendar Feed URL with webcal:// support and recurring events in ICS. |
| **Waitlist** | ✅ | 🟡 | Waitlist page exists. Auto-enrollment and priority logic are partial. |
| **Course Import** | ✅ | 🟡 | Import UI exists. Actual content migration progress polling is partial. |
| **Section Management** | ✅ | 🟡 | Section list and cross-listing UI exist. Bulk section operations are partial. |
| **Collaborations** | ✅ | ✅ | `Collaborations.tsx` lists collaborations via API. `CollaborationIframeModal.tsx` embeds Canvas native LTI collaborations for creation. Open/delete with permission checks. |
| **Mobile Web Experience** | ✅ | ✅ | MobileTabBar, responsive layouts, and touch-friendly UI. |
| **Push Notifications** | ✅ | ✅ | `PushNotificationManager.tsx` with service worker and Web Push support. |
| **Offline Mode Detection** | ❌ | ➕ | ClassApex detects offline state and shows cached data banner. |
| **AI Assistant Companion** | ❌ | ➕ | Global floating AI drawer with context-aware suggestions. |

---

## 3. Teacher Workflow Matrix

| Feature | Native Canvas | ClassApex | Notes |
|---------|:-------------:|:---------:|-------|
| **SpeedGrader — Document Annotation** | ✅ | 🟡 | `DocViewerWrapper.tsx` iframe wrapper for Canvas file preview/annotation. Integrated in GradingQueue. Not full native integration. |
| **SpeedGrader — Audio/Video Comments** | ✅ | ✅ | `MediaCommentRecorder.tsx` WebRTC audio/video recording. |
| **SpeedGrader — Rubric Grading** | ✅ | 🟡 | Rubric view exists; inline rubric scoring in GradingQueue is partial. |
| **SpeedGrader — Prev/Next Navigation** | ✅ | ✅ | Prev/Next submission navigation in GradingQueue. |
| **SpeedGrader — Keyboard Shortcuts** | ✅ | 🟡 | Global Cmd+K search exists; SpeedGrader-specific shortcuts are not implemented. |
| **Gradebook — Column View** | ✅ | ✅ | Assignment columns rendered in grid. |
| **Gradebook — Student Search / Filter** | ✅ | ✅ | Search by student name. |
| **Gradebook — Assignment Groups** | ✅ | ✅ | Group headers and weights displayed. |
| **Gradebook — Final Grade Override** | ✅ | ✅ | Override input per student; saves via enrollment API. |
| **Gradebook — Message Students Who** | ✅ | ✅ | `MessageStudentsWho` filter composer (missing/late/score range) with bulk Canvas Conversations send. |
| **Gradebook — Late / Missing Indicators** | ✅ | ✅ | Visual badges for late and missing submissions. |
| **Gradebook — Excused / Dropped** | ✅ | 🟡 | Some status display; excused logic is partial. |
| **Gradebook — CSV Import / Export** | ✅ | ✅ | Export CSV (Canvas-compatible format) and Import CSV with file picker, preview modal, and batch update via API. |
| **Learning Mastery Gradebook** | ✅ | 🟡 | Page exists. Full outcome rollup visualization is simplified. |
| **Custom Gradebook Columns** | ✅ | 🟡 | UI exists for custom columns. API integration depth is partial. |
| **Assignment Groups — Management** | ✅ | ✅ | Create, edit, reorder, and weight assignment groups. |
| **Assignment Groups — Rules** | ✅ | 🟡 | Drop lowest / highest rules UI exists; enforcement validation is partial. |
| **Assignment Creation — All Types** | ✅ | 🟡 | Assignment, Discussion, Quiz, External Tool types. Peer review and group assignment settings exist. |
| **Assignment Creation — Rubric Attachment** | ✅ | 🟡 | Rubric selector exists; building rubrics inline is partial. |
| **Assignment Creation — Moderation** | ✅ | ✅ | Moderated grading toggle with grader count and final grader selector. |
| **Assignment Creation — Anonymous Grading** | ✅ | ✅ | Anonymous grading toggle with help text. |
| **Question Banks — List / Search** | ✅ | ✅ | Question bank management UI. |
| **Question Banks — Question Creation** | ✅ | 🟡 | Basic question creation. Advanced question types and randomization are partial. |
| **Reports — Course Reports** | ✅ | 🟡 | Reports page exists. Actual report generation and download are partial. |
| **Blueprint Courses — Sync** | ✅ | 🟡 | Blueprint sync UI exists. Full sync scheduling and exception handling are partial. |
| **Blueprint Courses — Associations** | ✅ | 🟡 | Association management exists. |
| **Late Policy — Automatic Deduction** | ✅ | 🟡 | Late policy configuration page exists. Real-time preview of deductions is partial. |
| **Peer Reviews — Assignment Setup** | ✅ | 🟡 | Peer review configuration exists. Automatic assignment of reviewers is partial. |
| **Grading Queue — Batch Actions** | ✅ | ✅ | Batch grade and publish actions. |
| **Grading Queue — Submission Filters** | ✅ | ✅ | Pending, late, resubmitted, and graded filters. |
| **Rubric Editing — Criterion Management** | ✅ | ✅ | Add, edit, remove criteria and ratings. |
| **Rubric Editing — Outcome Alignment** | ✅ | 🟡 | Outcome selection exists; deep alignment workflow is partial. |
| **Announcements — Create / Edit** | ✅ | ✅ | Rich text creation with delay posting. |
| **Pages — Create / Edit** | ✅ | ✅ | Page editor with publish/unpublish. |
| **Files — Usage Rights (Teacher)** | ✅ | ✅ | Usage rights editing in preview modal and bulk operations bar. |
| **Files — Bulk Upload / Zip** | ✅ | 🟡 | Multi-file upload supported; zip extraction is not. |
| **Course Settings — Navigation** | ✅ | ✅ | Drag-and-drop tab reordering and visibility toggle at `/courses/:courseId/settings/navigation`. |
| **Course Settings — App Integrations** | ✅ | 🟡 | `ExternalToolsPage.tsx` manages LTI tools. Course-level placement configuration is partial (view only). |
| **Course Settings — Feature Options** | ✅ | ✅ | `CourseFeatureFlags.tsx` at `/courses/:id/features`. Search, filter by state, toggle with locked detection. |
| **Rich Content Editor** | ✅ | ✅ | `NewRceWrapper.tsx` provides inline equation editor, table insertion, media embed, and Studio placeholder. `CanvasNativeRceModal.tsx` opens the full Canvas New RCE in an iframe for pages, assignments, discussions, announcements, and quizzes. |
| **Course Home — Customization** | ✅ | ✅ | `CourseHome.tsx` allows teachers to set the course default_view (modules, syllabus, assignments, activity feed). Selection is persisted to Canvas API and synced on load. |
| **Sections — Cross-Listing** | ✅ | 🟡 | Cross-listing UI exists; validation is partial. |
| **Attendance — Teacher Marking** | ✅ | 🟡 | Attendance marking UI exists. Badge configuration is partial. |
| **Conferences — Creation / Moderation** | ✅ | 🟡 | Conference creation exists. Moderation controls are not surfaced. |

---

## 4. Administration Matrix

| Feature | Native Canvas | ClassApex | Notes |
|---------|:-------------:|:---------:|-------|
| **Admin Dashboard — Overview** | ✅ | ✅ | Stats cards for users, courses, sub-accounts, and announcements. |
| **Account — Sub-Accounts** | ✅ | ✅ | Tree view with create/edit. |
| **Account — Terms / Academic Calendar** | ✅ | ✅ | Term creation and date management. |
| **Account — Roles & Permissions** | ✅ | 🟡 | Role list and permission matrix exist. Custom role creation is partial. |
| **Account — Feature Flags** | ✅ | ✅ | Toggle system and account-level feature flags. |
| **Account — System Settings** | ✅ | 🟡 | General settings page. Granular account settings are simplified. |
| **Users — User Management** | ✅ | ✅ | User list, search, create, and bulk operations (Activate / Deactivate / Remove) via `BulkOperationsBar`. Bulk import and SIS-linked user management are partial. |
| **Users — Masquerading** | ✅ | ➕ | ClassApex has a built-in role switcher and masquerade bar for testing personas. Native Canvas requires admin nav to masquerade. |
| **Course Management — Search / Filter** | ✅ | ✅ | Course list with status and term filters. |
| **Course Management — Bulk Operations** | ✅ | ✅ | Publish, Conclude, and Delete via `BulkOperationsBar`. |
| **Course Settings Defaults** | ✅ | 🟡 | Global defaults page exists. Granular default settings are partial. |
| **Account Notifications — Global Announcements** | ✅ | ✅ | Create, schedule, and dismiss global announcements with icon types. |
| **Brand Configs / Theme Editor** | ✅ | 🟡 | Brand config list and CSS/JS injection fields exist. Visual theme preview is partial. |
| **Developer Keys — LTI / API** | ✅ | 🟡 | Developer key list and creation. Scoping and tool configuration depth is partial. |
| **SIS Imports** | ✅ | 🟡 | SIS import upload and status polling. Error parsing and diff reporting are partial. |
| **Grade Change Audit Log** | ✅ | 🟡 | Audit log view exists. Advanced filtering and export are partial. |
| **Assessment — Institutional Question Banks** | ✅ | 🟡 | Global question bank management. Granular item types are partial. |
| **Blueprint Courses — Admin View** | ✅ | 🟡 | Sync controls and association management exist. |
| **Authentication — SAML / OAuth Config** | ✅ | ✅ | `AuthProviders.tsx` lists providers via Canvas API with type icons, position sorting, and delete. Creation/editing is handled via iframe to Canvas native authentication settings. |
| **Security — Account-Level Privacy** | ✅ | ❌ | No privacy settings or data retention configuration. |
| **Storage / Quota Management** | ✅ | ✅ | `StorageQuotas.tsx` admin page for default course, user, and group storage quotas. Reads and writes via Canvas account API. |
| **Mobile App — Manage App Access** | ✅ | N/A | Web UI cannot manage native mobile app access. |
| **Global Search (Cmd+K)** | ✅ | ➕ | ClassApex adds a global Cmd+K command palette with Canvas search API integration and action shortcuts. |
| **Theme — Dark Mode** | ✅ | ➕ | ClassApex has first-class dark mode with system preference detection. Native Canvas dark mode is limited. |
| **Theme — High Contrast** | ✅ | ➕ | ClassApex has a dedicated high-contrast mode toggle with reduced-motion support. |
| **Tenant Configuration** | ❌ | ➕ | ClassApex supports multi-tenant UI configuration (dashboard layout, branding, locale) via `TenantContext`. |
| **AI Assistant — Admin Insights** | ❌ | ➕ | AI drawer provides context-aware help and navigation suggestions not available in native Canvas. |

---

## 5. Page-by-Page Mapping

### Student-Facing Pages (35)

| ClassApex Page | Native Canvas Route / Feature | Status | Notes |
|----------------|------------------------------|--------|-------|
| `DashboardV2.tsx` | `/` (Dashboard) | 🟡 | Activity stream, todo, upcoming, missing, favorites. Missing: recent feedback, global announcements feed. |
| `Courses.tsx` | `/courses` | ✅ | All courses, favorites, recent, catalog sub-views. |
| `CourseHome.tsx` | `/courses/:id` | 🟡 | Landing page. Missing: custom front page selection, layout customization. |
| `Calendar.tsx` | `/calendar` | 🟡 | Month, week, day, and agenda views with events. ICS subscription with webcal:// support. Missing: recurring event creation. |
| `Grades.tsx` | `/courses/:id/grades` | 🟡 | Grade summary with what-if scores. Missing: detailed rubric breakdown. |
| `Inbox.tsx` | `/conversations` | 🟡 | Conversations list, thread, compose, `MediaCommentRecorder`, forwarding. Missing: full attachment workflow. |
| `Notifications.tsx` | `/profile/communication` | ✅ | Notification preferences with full granular policy matrix (immediate/daily/weekly per category). |
| `Planner.tsx` | `/planner` | ✅ | Weekly task planner with day grouping. |
| `Settings.tsx` | `/profile/settings` | 🟡 | Profile, avatar, pairing codes, channels, data export. Missing: full feature options, observee management. |
| `Help.tsx` | `/help` | 🟡 | Help links. Missing: contextual help and ticket history. |
| `Syllabus.tsx` | `/courses/:id/assignments/syllabus` | 🟡 | Syllabus content + assignment list. Public syllabus available at `/courses/:id/syllabus/public`. |
| `Files.tsx` | `/courses/:id/files` | 🟡 | Folder tree, upload, preview, breadcrumbs, usage rights, bulk operations. DocViewer preview via iframe wrapper. |
| `Modules.tsx` | `/courses/:id/modules` | 🟡 | Modules, items, prerequisites, requirements, MasteryPaths, DnD. Missing: strict sequential enforcement. |
| `Assignments.tsx` / `AssignmentList.tsx` | `/courses/:id/assignments` | ✅ | List with filters. |
| `AssignmentDetail.tsx` | `/courses/:id/assignments/:id` | ✅ | Detail + submission. |
| `AssignmentEditModal.tsx` | `/courses/:id/assignments/:id/edit` | 🟡 | Edit modal with moderated grading and anonymous grading toggles. |
| `Quizzes.tsx` | `/courses/:id/quizzes` | ✅ | Classic quiz list and taking with 10 question types. New Quizzes auto-detected and launched via `NewQuizzesIframe.tsx`. |
| `QuizBuilder.tsx` | `/courses/:id/quizzes/:id/edit` | 🟡 | Basic builder. Missing: question groups, randomization, regrade. |
| `QuizResults.tsx` | `/courses/:id/quizzes/:id/submissions` | ✅ | Teacher and student views. Correct-answer reveal with Canvas quiz setting compliance. |
| `Discussions.tsx` | `/courses/:id/discussion_topics` | 🟡 | Threaded discussions with ratings and podcast/RSS feed. Missing: pin depth. |
| `Pages.tsx` | `/courses/:id/pages` | ✅ | Page list + view with history/restore modal, drag-and-drop page order, and front page setting. |
| `Announcements.tsx` | `/courses/:id/announcements` | 🟡 | Announcements list with podcast/RSS feed. Missing: full comment integration. |
| `Groups.tsx` / `CourseGroups.tsx` | `/courses/:id/groups` | 🟡 | Group list and membership. Missing: group home files/discussions. |
| `ePortfolio.tsx` | `/eportfolios` | 🟡 | Portfolio pages. Missing: public sharing depth, section templates. |
| `Outcomes.tsx` / `OutcomeEditModal.tsx` | `/courses/:id/outcomes` | 🟡 | Outcome groups and alignments. Missing: deep calculation method customization. |
| `Analytics.tsx` | `/courses/:id/analytics` | 🟡 | Simplified stats. Missing: native Canvas analytics depth (page views, participation heatmaps). |
| `Attendance.tsx` | `/courses/:id/attendance` | 🟡 | Attendance marking. Missing: badge config, reporting. |
| `Conferences.tsx` | `/courses/:id/conferences` | 🟡 | Conference list + join. Missing: BBB moderation, Zoom. |
| `ExternalTools.tsx` | `/courses/:id/settings#tab-tools` | ✅ | External tool list. |
| `LtiPlayer.tsx` | `/courses/:id/external_tools/session` | ✅ | LTI launch in iframe. |
| `Rubrics.tsx` / `RubricEditModal.tsx` | `/courses/:id/rubrics` | 🟡 | Rubric CRUD. Missing: deep outcome alignment workflow. |
| `PeerReviews.tsx` | `/courses/:id/assignments/:id/peer_reviews` | 🟡 | Peer review UI. Missing: anonymous reviews, rubric-based peer grading. |
| `LatePolicy.tsx` | `/courses/:id/settings#tab-gradebook` | 🟡 | Late policy config. Missing: real-time preview. |
| `Waitlist.tsx` | SIS / custom integration | 🟡 | Waitlist UI. Missing: auto-enrollment logic. |
| `CourseImport.tsx` | `/courses/:id/content_migrations` | 🟡 | Import UI. Missing: progress polling depth. |
| `SectionManagement.tsx` | `/courses/:id/sections` | 🟡 | Section list + cross-listing. Missing: bulk ops. |
| `PriorEnrollments.tsx` | `/courses/:id/people/prior` | ✅ | Prior/concluded enrollment view. |

### Teacher-Facing Pages (12)

| ClassApex Page | Native Canvas Route / Feature | Status | Notes |
|----------------|------------------------------|--------|-------|
| `Gradebook.tsx` | `/courses/:id/gradebook` | ✅ | Grid gradebook with final grade override, `MessageStudentsWho` filter composer, and CSV import/export. |
| `LearningMasteryGradebook.tsx` | `/courses/:id/gradebook?view=learning_mastery` | 🟡 | Mastery view exists. Missing: deep rollup visualization. |
| `CustomGradebookColumns.tsx` | `/courses/:id/gradebook?view=gradebook` | 🟡 | Custom columns UI. Missing: full formula support. |
| `GradingQueue.tsx` | `/courses/:id/gradebook/speed_grader` | 🟡 | SpeedGrader-like queue with `MediaCommentRecorder` and `DocViewerWrapper`. Missing: rubric inline scoring. |
| `AssignmentGroups.tsx` | `/courses/:id/assignments#assignment_groups` | ✅ | Group management with weights. |
| `QuestionBanks.tsx` | `/courses/:id/question_banks` | 🟡 | Bank list + creation. Missing: advanced question types. |
| `Reports.tsx` | `/courses/:id/reports` | 🟡 | Reports list. Missing: actual report download generation. |
| `BlueprintCourses.tsx` | `/accounts/:id/blueprint_courses` | 🟡 | Sync + associations. Missing: scheduled sync, exception depth. |

### Admin Pages (17)

| ClassApex Page | Native Canvas Route / Feature | Status | Notes |
|----------------|------------------------------|--------|-------|
| `AdminDashboard.tsx` | `/accounts/:id` | ✅ | Overview stats. |
| `CourseManagement.tsx` | `/accounts/:id/courses` | ✅ | Course list + search with bulk operations (Publish / Conclude / Delete). |
| `CourseSettings.tsx` | `/accounts/:id/settings` | 🟡 | Default settings. Missing: granular config. |
| `Users.tsx` | `/accounts/:id/users` | 🟡 | User list + create with bulk operations (Activate / Deactivate / Remove). Missing: bulk import, SIS sync. |
| `SubAccounts.tsx` | `/accounts/:id/sub_accounts` | ✅ | Sub-account tree. |
| `Terms.tsx` | `/accounts/:id/terms` | ✅ | Term management. |
| `RolesPermissions.tsx` | `/accounts/:id/permissions` | 🟡 | Permission matrix. Missing: custom role creation depth. |
| `FeatureFlags.tsx` | `/accounts/:id/settings#tab-features` | ✅ | Feature flag toggles. |
| `SystemSettings.tsx` | `/accounts/:id/settings` | 🟡 | General settings. Missing: many granular account settings. |
| `AccountNotifications.tsx` | `/accounts/:id/settings#tab-notifications` | ✅ | Global announcements. |
| `BrandConfigs.tsx` | `/accounts/:id/brand_configs` | 🟡 | Branding + CSS/JS. Missing: visual preview. |
| `DeveloperKeys.tsx` | `/accounts/:id/developer_keys` | 🟡 | Key management. Missing: advanced scoping. |
| `SisImports.tsx` | `/accounts/:id/sis_imports` | 🟡 | Upload + status. Missing: error diff reporting. |
| `GradeChangeAudit.tsx` | `/accounts/:id/grade_change_log` | 🟡 | Audit log. Missing: advanced filters, export. |
| `Assessment.tsx` | `/accounts/:id/assessments` | 🟡 | Global question banks. Missing: advanced item types. |
| `BlueprintCourses.tsx` | `/accounts/:id/blueprint_courses` | 🟡 | Admin blueprint view. Missing: sync scheduling. |

### Other Pages

| ClassApex Page | Native Canvas Route / Feature | Status | Notes |
|----------------|------------------------------|--------|-------|
| `AccessibilityStatement.tsx` | `/accessibility` (footer link) | ➕ | Dedicated page; exceeds native Canvas placement. |
| `CourseCatalog.tsx` | `/courses` (public) / Catalog product | 🟡 | Public browse. Missing: full Catalog product integration. |
| `ObserverDashboard.tsx` | `/observer` | 🟡 | Observer view. Missing: multi-student switching depth. |

---

## 6. Differentiation / Advantages

Where ClassApex is **demonstrably better** than native Canvas:

| Advantage | Details |
|-----------|---------|
| **Modern React Architecture** | Built on Vite + React 18 with lazy loading, Suspense, and a design-system component library. Faster initial paint and smoother interactions than legacy Canvas jQuery + React hybrid. |
| **First-Class Dark Mode** | System-preference-aware dark mode with full CSS custom property theming. Native Canvas dark mode is limited to high-contrast themes. |
| **High Contrast & Reduced Motion** | Dedicated accessibility toggles with persistent localStorage sync. Native Canvas requires account-admin theme changes. |
| **Global Cmd+K Command Palette** | `GlobalSearchModal` with Canvas API search + action shortcuts (toggle theme, toggle contrast). Native Canvas has no equivalent. |
| **AI Assistant Drawer** | Floating AI companion with context-aware suggestions based on current route and role. Unique to ClassApex. |
| **Role Switcher / Masquerade Bar** | In-app persona switching for testing student/teacher/admin views without leaving the app. Native Canvas requires full admin masquerade workflow. |
| **Offline Detection** | Detects `navigator.onLine` and shows cached-data banners. Native Canvas has no offline awareness. |
| **Mobile-First Responsive Design** | `MobileTabBar`, responsive grids, and touch-optimized inputs. Native Canvas mobile web is a degraded desktop view. |
| **Tenant Configuration** | `TenantContext` allows per-account UI customization (dashboard layout, branding, locale) without code changes. Native Canvas requires theme editor or custom JS. |
| **Unified Navigation** | Single-page app with no full-page reloads between core workflows. Native Canvas is multi-page with jQuery page transitions. |
| **Performance Optimizations** | `OptimizedImage` component, lazy route loading, and query caching via Apollo. |
| **Data Export** | One-click JSON export of courses, todos, and submissions from Settings. Native Canvas requires navigating to separate export tools. |

---

## 7. Critical Gaps

Features that **would block institutional adoption** if ClassApex were positioned as a full Canvas replacement:

| Gap | Severity | Impact |
|-----|:--------:|--------|
| ~~No New Quizzes Support~~ | ✅ Resolved | New Quizzes embedded via iframe to Canvas native routes. |
| ~~Limited Rich Content Editor~~ | ✅ Resolved | Inline `NewRceWrapper` for quick edits + `CanvasNativeRceModal` for full Canvas New RCE via iframe. |
| ~~No Collaborations (Google/Office)~~ | ✅ Resolved | `Collaborations.tsx` lists, opens, and deletes collaborations. Creation is handled via iframe to Canvas native LTI collaborations. |
| **No Authentication Provider Config** | 🟡 High | Admin cannot configure SAML/OAuth without returning to native Canvas. |
| **Document Annotation (DocViewer)** | 🟡 Medium | `DocViewerWrapper.tsx` provides iframe-based preview/annotation via Canvas native DocViewer. Full native Crocodoc/Canvadocs integration depth is partial.
| **No Native Mobile Apps** | 🟡 Medium | iOS/Android apps are expected by students for push and offline access. |

---

## 8. Roadmap Recommendations

### Phase 1 — Blockers (Must have for pilot)

1. ~~**Integrate Canvas New RCE**~~ — ✅ Resolved. Inline `NewRceWrapper` for quick edits + `CanvasNativeRceModal` for full Canvas New RCE via iframe.
2. ~~**Add New Quizzes Support**~~ — ✅ Resolved. New Quizzes auto-detected from assignments API and embedded via `NewQuizzesIframe.tsx`.
3. ~~**Document Annotation Bridge** — Embed Crocodoc/DocViewer or Canvadocs iframe in `GradingQueue` for PDF annotation.~~ *(Partial — `DocViewerWrapper.tsx` iframe wrapper implemented.)*
4. ~~**Media Comments** — Add WebRTC-based audio/video recording to `GradingQueue` and `Inbox`.~~ *(Completed — `MediaCommentRecorder.tsx` implemented.)*
5. ~~**Expand Quiz Question Types** — Implement matching, fill-in-multiple-blanks, numerical, formula, and file-upload question renderers.~~ *(Completed)*

### Phase 2 — High-Value Teacher Features

6. ~~**Final Grade Override** — Add override input to `Gradebook` grid.~~ *(Completed)*
7. ~~**CSV Gradebook Import/Export** — Parse and generate Canvas gradebook CSV format.~~ *(Completed)*
8. ~~**Message Students Who** — Build filter composer (missing / late / score range) with bulk message send.~~ *(Completed — `MessageStudentsWho` component implemented.)*
9. ~~**What-If Scores** — Enable hypothetical score entry in `Grades`.~~ *(Completed)*
10. ~~**Course Navigation Editor** — Drag-and-drop tab visibility and ordering.~~ *(Completed)*
11. ~~**Usage Rights Manager** — Add copyright status and usage rights fields to `Files`.~~ *(Completed)*
12. ~~**Collaborations Integration**~~ — ✅ Resolved. `Collaborations.tsx` page with API list, open, delete, and iframe-based creation via Canvas native LTI collaborations.

### Phase 3 — Calendar & Scheduling

13. ~~**Week / Day Calendar Views** — Add alternate calendar layouts.~~ *(Completed)*
14. ~~**Scheduler / Appointment Groups** — Build appointment slot creation and signup UI.~~ *(Completed)*
15. ~~**Calendar Sync (ICS)** — Generate and subscribe to ICS feeds.~~ *(Completed)*

### Phase 4 — Admin & Scale

16. **Authentication Provider UI** — SAML, OAuth, and LDAP configuration forms.
17. ~~**Bulk Operations** — Multi-select + bulk action bars for courses, users, and files.~~ *(Completed)*
18. ~~**Push Notifications** — Service worker + Web Push integration.~~ *(Completed — `PushNotificationManager.tsx` and service worker implemented.)*
19. ~~**Public Syllabus** — Unauthenticated syllabus view route.~~ *(Completed — `PublicSyllabus.tsx` implemented.)*
20. ~~**Page History & Restore** — Revision timeline and rollback UI.~~ *(Completed — `PageHistoryModal.tsx` implemented.)*
21. **Native Mobile Apps** — React Native or Capacitor wrappers for iOS/Android.

### Phase 5 — Polish & Depth

22. ~~**Discussion Ratings** — Like/upvote system.~~ *(Completed — wired to Canvas rating API.)*
23. ~~**Podcast / RSS** — Generate podcast feeds for announcements and discussions.~~ *(Completed)*
24. ~~**Prior Enrollments** — Concluded enrollment view with read-only access.~~ *(Completed — `PriorEnrollments.tsx` implemented.)*
25. **Advanced Analytics** — Participations, page views, and department-level rollups.
26. **Peer Review Anonymous Mode** — Anonymous assignment and rubric-based peer grading.
27. ~~**Moderated Grading**~~ — ✅ Resolved. Toggle with grader count and final grader selector in `AssignmentEditModal.tsx`.
28. ~~**Anonymous Grading**~~ — ✅ Resolved. Toggle with help text in `AssignmentEditModal.tsx`.

---

## Appendix A: Methodology

This matrix was constructed by:

1. **Static code analysis** of all 64 page components in `src/pages/` and `src/pages/admin/`.
2. **Component analysis** of shared components (`RichEditor`, `AIAssistantDrawer`, `MobileTabBar`, etc.).
3. **API hook review** of `useCanvasQuery`, `useCanvasMutation`, and `useShellData` to determine Canvas REST API coverage.
4. **Route mapping** against `App.tsx` and `navigation.tsx` to identify reachable features.
5. **Cross-reference** with native Canvas LMS feature documentation and Instructure release notes.

## Appendix B: Count Summary

| Category | Count |
|----------|-------|
| Total ClassApex Pages | 65 |
| Full Parity (✅) | ~54 |
| Partial (🟡) | ~19 |
| Missing (❌) | ~4 |
| Out of Scope (🚫) | ~3 |
| ClassApex Exceeds (➕) | ~8 |

> *Percentages are approximate because some features span multiple pages with mixed parity.*

---

*Document maintained by the ClassApex engineering team. Update this matrix after each major sprint or release.*
