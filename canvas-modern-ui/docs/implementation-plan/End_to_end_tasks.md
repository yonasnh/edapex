# ClassApex End-to-End Implementation Tasks

## Phase 1: API Foundation & Administrative Shell
- `[x]` Set up Hybrid API Client
  - `[x]` Create API service layer for Canvas REST API v1 fallback
  - `[x]` Implement token management and masquerading functions
- `[x]` Build Admin Dashboard Layout
  - `[x]` Create navigation for Admin context
  - `[x]` Implement Account & Sub-Account hierarchy view
- `[x]` App Configuration UI
  - `[x]` Build Developer Keys management UI
  - `[x]` Build App Configuration Store UI
- `[x]` Global Announcements Tool

## Phase 2: Roster, SIS & Onboarding Workflows
- `[x]` SIS & User Provisioning
  - `[x]` Build SIS Import/Sync UI (CSV focus initially)
  - `[x]` Develop Role & Permissions Editor
- `[x]` Parent & Observer Portal
  - `[x]` Build pairing code generation/consumption workflow
  - `[x]` Create Observer Dashboard
- `[x]` Enrollment Management
  - `[x]` Build Self-Enrollment / Course Catalog
  - `[x]` Build Section Cross-Listing and Waitlist UI

## Phase 3: The LTI Player & Extensibility
- `[x]` LTI 1.3 Launch Wrapper
  - `[x]` Build `/pages/LtiPlayer.tsx` to handle OAuth2 OIDC flow
  - `[x]` Secure `iframe` communication & sizing logic
- `[x]` LTI Placements
  - `[x]` Integrate course-level placements
  - `[x]` Map account-level tools
  - `[x]` Update Admin UI for API token generation

## Phase 4: Advanced Course Configuration & Assessment
- `[x]` Course Portability
  - `[x]` Blueprint Courses Management (Push to associated courses)
  - `[x]` Course Export/Import via Canvas API
- `[x]` Implement Granular Grading Schemes UI
- `[x]` Institutional Assessment
  - `[x]` Build Global Question Bank UI
  - `[x]` Implement Outcome/Rubric alignment
  - `[x]` Add advanced quiz settings (time limits, proctoring hooks)

## Phase 5: Instructional Design Core & Advanced SIS Features
- `[x]` Course Modules & Mastery Paths (`Modules.tsx`)
  - `[x]` Drag-and-drop module builder interface
  - `[x]` Prerequisite and requirement locks
  - `[x]` Mastery Paths logic integration
- `[x]` Syllabus & Course Summary (`Syllabus.tsx`)
  - `[x]` Auto-aggregating assignment and event view
- `[x]` Attendance & Roll Call (`Attendance.tsx`)
  - `[x]` Seating chart and status toggles
- `[x]` Student Accommodations
  - `[x]` Global UI for IEP/504 overrides (timer multipliers, extensions)

## Phase 6: Advanced Communication, Analytics & Integrations
- `[x]` Conferences & Virtual Classrooms (`Conferences.tsx`)
  - `[x]` Native UI for scheduling/launching BigBlueButton/Zoom
- `[x]` Advanced Inbox & Threaded Messaging
  - `[x]` Support for BCC, media comments, and attachments
- `[x]` Early Alert Systems & New Analytics
  - `[x]` Predictive "at-risk" flagging and intervention workflow

## Phase 7: Real-world Integration & Parity Enforcement
- `[x]` Modules API Integration (`Modules.tsx`)
  - `[x]` Load module items from GET `/api/v1/courses/:courseId/modules`
  - `[x]` Implement add/delete/publish actions via POST/PUT
  - `[x]` Implement drag-and-drop order updates synced with backend API (module-level + item-level)
- `[x]` Attendance API Sync (`Attendance.tsx`)
  - `[x]` Load real student roster from enrollments API
  - `[x]` Link to "Roll Call Attendance" assignment on the backend
  - `[x]` Persist attendance cycles to Gradebook via submissions endpoint
- `[x]` Conferences Live Integration (`Conferences.tsx`)
  - `[x]` Fetch conferences using Canvas Web Conferences API
  - `[x]` Hook up Join/End buttons to live Canvas conferences
- `[x]` Syllabus Dynamics (`Syllabus.tsx`)
  - `[x]` Load and save `syllabus_body` via course endpoints
  - `[x]` Fetch active assignments and events to construct dynamic Course Summary (chronologically sorted)
- `[x]` Admin Integrations (`DeveloperKeys.tsx`, `Assessment.tsx`)
  - `[x]` Fetch Developer Keys from accounts API
  - `[x]` Fetch Question Banks and Outcomes from accounts API
- `[x]` IEP/504 Student Accommodations (`Users.tsx`)
  - `[x]` Persist user accommodations into Canvas custom metadata (`custom_data`)
  - `[x]` Dynamically apply student multipliers to Quiz Extensions API
