# ClassApex End-to-End LMS/SIS Implementation Plan

## Goal Description

Expand ClassApex from a focused student/instructor experience layer into a full end-to-end LMS UI replacement. The primary goal is to guarantee that all user interactions—whether from a student, instructor, IT administrator, or parent—start and end entirely within ClassApex, while continuing to utilize Canvas LMS as the robust backend data engine. This involves building out modern UI components for administrative workflows, onboarding, and third-party LTI integrations.

> [!NOTE]
> This plan adopts a phased approach, ensuring high-frequency user workflows are protected while complex administrative capabilities are gradually introduced.

## User Review Required

> [!IMPORTANT]
> - **API Strategy:** Since the Canvas GraphQL API lacks full coverage for deep administrative mutations, we propose a hybrid API client. Please confirm this architectural approach.
> - **LTI Priorities:** Are there specific third-party LTI tools (e.g., Zoom, Turnitin, Pearson) that should be heavily tested?
> - **SIS Focus:** Should we focus on manual CSV imports first, or direct integrations like Clever/ClassLink?
> - **Phase 5/6 Scope:** We've identified critical missing pieces (Modules, Attendance, Accommodations). Are there any other legacy Canvas features you consider block-level requirements for moving completely off the native Canvas UI?

## Proposed Changes

We will divide the implementation into four sequential phases to ensure stable delivery.

---

### Phase 1: API Foundation & Administrative Shell

Establish the core administrative workspace and the necessary API bridges to interact with Canvas's system-level data.

#### [NEW] Hybrid API Client
- Implement an API service layer that dynamically routes requests to Canvas GraphQL (for speed) or Canvas REST API v1 (for administrative tasks).
- Build robust token management and masquerading capabilities (allowing admins to "view as" students) entirely via the REST API.

#### [NEW] Admin & Institutional Dashboard
- Build a dedicated `Admin Dashboard` interface separate from the instructor/student views.
- Implement the Account & Sub-Account hierarchy management UI.
- Implement Developer Keys and App Configuration Store UI for managing external integrations.
- Build the Global Announcements and cross-campus communication tool.

---

### Phase 2: Roster, SIS & Onboarding Workflows

Replace Canvas's legacy user management and course enrollment screens.

#### [NEW] SIS & User Provisioning
- Build the SIS Import/Sync UI, enabling IT admins to map and upload roster data directly in ClassApex.
- Develop the Role & Permissions Editor for granular access control.

#### [NEW] Parent & Observer Portal
- Build a seamless Parent/Observer pairing workflow (generating and consuming pairing codes).
- Create a distinct Observer Dashboard that aggregates data across multiple dependent students.

#### [NEW] Enrollment Management
- Build a Self-Enrollment and Course Catalog browsing interface for students.
- Implement Section Cross-Listing tools and waitlist management UI for instructors.

---

### Phase 3: The LTI Player & Extensibility

Enable third-party learning tools to operate natively within ClassApex without bouncing users back to Canvas.

#### [NEW] LTI 1.3 Launch Wrapper
- Build a secure component to handle LTI 1.3 Advantage handshakes.
- Implement iFrame sanitization, dynamic resizing, and cross-origin messaging handlers so third-party tools feel native.
- Map course-level and account-level LTI placements directly into the ClassApex navigation and Rich Content Editor.

---

### Phase 4: Advanced Course Configuration & Assessment

Bring all complex instructional design and testing capabilities into the modern interface.

#### [NEW] Course Portability Engine
- Build a modern, drag-and-drop UI for Course Import/Export (including `.imscc` Common Cartridge support and previous term content copying).
- Implement Granular Grading Schemes (custom GPA scales, weighted assignment groups).

#### [NEW] Institutional Assessment Tools
- Build the Global Question Bank and Outcome/Rubric alignment UI (mapping assignments to institutional standards).
- Implement advanced quiz settings, including time limits, IP-address filtering, and integration hooks for proctoring solutions.

---

### Phase 5: Instructional Design Core & Advanced SIS Features

While the administrative shell is complete, critical course-level instructional design and daily SIS tracking tools are still missing from the ClassApex native interface.

#### [NEW] Course Modules & Mastery Paths (`Modules.tsx`)
- **Gap:** Canvas courses rely heavily on Modules for organizing curriculum. We currently lack a `Modules` builder.
- **Action:** Build a drag-and-drop `Modules.tsx` interface. Support adding any item type (Pages, Quizzes, Files, LTI tools).
- **Action:** Implement Prerequisite and Requirement locks.
- **Action:** Add "Mastery Paths" to allow conditional release of assignments based on previous quiz scores.

#### [NEW] Syllabus & Course Summary (`Syllabus.tsx`)
- **Gap:** The dynamic chronological Syllabus page is missing.
- **Action:** Implement a dynamic syllabus view that automatically aggregates assignments and events from the calendar into a unified course summary.

#### [NEW] Attendance & Roll Call (`Attendance.tsx`)
- **Gap:** Native attendance tracking (critical for SIS integration and state reporting) is missing.
- **Action:** Create an instructor-facing Roll Call tool with seating charts, tardy/absent toggles, and direct integration into the Canvas gradebook as a configurable assignment.

#### [NEW] Student Accommodations & Accessibility Overrides
- **Gap:** No global UI to configure IEP/504 accommodations.
- **Action:** Build an admin/teacher UI to apply global timer multipliers (e.g., 1.5x time on all quizzes) and due date extensions for specific students across the entire institution.

---

### Phase 6: Advanced Communication, Analytics & Integrations

#### [NEW] Conferences & Virtual Classrooms (`Conferences.tsx`)
- **Gap:** Native video conferencing integrations (BigBlueButton / Zoom LTI wrappers) are not fully represented in a dedicated `Conferences` tab.
- **Action:** Build a native UI for scheduling, launching, and viewing recordings for virtual meetings.

#### [NEW] Advanced Inbox & Threaded Messaging (`Inbox.tsx` Updates)
- **Gap:** The current Inbox needs parity with Canvas's broadcast (BCC), media comments, and attachment handling.
- **Action:** Upgrade the messaging composer to support rich media and bulk recipient selection (e.g., "Message students who... haven't submitted yet").

#### [NEW] Early Alert Systems & New Analytics
- **Gap:** We have basic analytics but lack predictive modeling and intervention workflows.
- **Action:** Enhance `Analytics.tsx` to flag "at-risk" students (e.g., missed 3 assignments in a row) and provide a one-click intervention workflow for advisors/teachers.

---

### Phase 7: Real-world Integration & Parity Enforcement

Convert the previously scaffolded mock features into fully-functional integrations that query and mutate the live Canvas LMS REST/GraphQL backend.

#### [MODIFY] Course Modules Integration ([Modules.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/Modules.tsx))
- **Action:** Replace `MOCK_MODULES` state with `useCanvasQuery` loading from `/api/v1/courses/:courseId/modules?include[]=items`.
- **Action:** Implement dynamic add/delete/publish/unpublish actions for modules calling Canvas REST endpoints (`POST /api/v1/courses/:courseId/modules`, `PUT /api/v1/courses/:courseId/modules/:id`).
- **Action:** Bind HTML5 Drag and Drop event handlers to the reorder handles and fire reordering requests (`PUT /api/v1/courses/:courseId/modules/:id` or `/api/v1/courses/:courseId/modules/:module_id/items/:item_id` with a `position` parameter) to sync order changes with the server.

#### [MODIFY] Course Attendance Integration ([Attendance.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/Attendance.tsx))
- **Action:** Query the active student roster dynamically using the enrollments endpoint (`GET /api/v1/courses/:courseId/users?enrollment_type[]=student`).
- **Action:** Fetch or dynamically initialize the standard Roll Call Attendance assignment on the backend (GET/POST `/api/v1/courses/:courseId/assignments`).
- **Action:** Persist status updates to the gradebook in real time using the submissions update API (`PUT /api/v1/courses/:courseId/assignments/:assignmentId/submissions/:studentId`).

#### [MODIFY] Virtual Conferences Integration ([Conferences.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/Conferences.tsx))
- **Action:** Replace mock records with live data from the Canvas Web Conferences API (`GET /api/v1/courses/:courseId/conferences`).
- **Action:** Bind the "Join" and "End" controls to active conference session URIs, and allow creating conferences via `POST /api/v1/courses/:courseId/conferences`.

#### [MODIFY] Course Syllabus & Event Summary ([Syllabus.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/Syllabus.tsx))
- **Action:** Retrieve the HTML syllabus content using course details (`GET /api/v1/courses/:courseId`) and save edits (`PUT /api/v1/courses/:courseId` with `course[syllabus_body]`).
- **Action:** Aggregate assignments (`GET /api/v1/courses/:courseId/assignments`) and course calendar events (`GET /api/v1/calendar_events?context_codes[]=course_:courseId`) to render a live, dynamic "Course Summary" feed.

#### [MODIFY] Developer Keys & Question Banks Admin ([DeveloperKeys.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/admin/DeveloperKeys.tsx) & [Assessment.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/admin/Assessment.tsx))
- **Action:** Update the Developer Keys dashboard to interact with the Canvas developer keys management endpoint (`GET /api/v1/accounts/:accountId/developer_keys`).
- **Action:** Connect question bank controls to `/api/v1/courses/:courseId/question_banks` or `/api/v1/accounts/:accountId/question_banks`, and Outcome lists to `/api/v1/accounts/:accountId/outcome_groups`.

#### [MODIFY] Global IEP/504 Student Accommodations ([Users.tsx](file:///Volumes/MacStorage/CascadeProjects/canvas-lms/canvas-modern-ui/apps/classapex-lms/src/pages/admin/Users.tsx))
- **Action:** Implement state persistence for the accommodations form fields (Quiz Time Multiplier and Due Date Extensions).
- **Action:** Save accommodations configurations using Canvas user custom data/metadata store (`PUT /api/v1/users/:userId/custom_data`), and automatically apply the time multipliers when launching a quiz via the Quiz Extensions API (`POST /api/v1/courses/:courseId/quizzes/:quizId/extensions`).

## Verification Plan

### Automated Tests
- **E2E User Flows:** Utilize Playwright to test full cross-role journeys (e.g., Admin creates account $\rightarrow$ Teacher cross-lists sections $\rightarrow$ Student takes LTI quiz).
- **API Contract Tests:** Ensure the hybrid GraphQL/REST API client strictly adheres to Canvas's expected request/response schemas.

### Manual Verification
- **LTI Sandboxing:** Deploy the LTI wrapper to a staging environment and launch real integrations (like Zoom) to verify that auth headers are passed correctly and no UI redirection to Canvas occurs.
- **SIS Import Validation:** Perform a complete manual SIS CSV import via the ClassApex UI and verify that the data accurately populates the underlying Canvas database.
