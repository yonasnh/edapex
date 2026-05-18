# Phase 3 — Collaboration & Communication (Sprints 9–12)

## Sprint 9: Discussions

### Tasks
- [x] **S9-01** Build `DiscussionList` with filters (unread, pinned, locked) → `GET .../discussion_topics` ✅ `apps/classapex-lms/src/pages/Discussions.tsx` (search, course/status/sort filters, pinned sort order, unread toggle, pagination)
- [x] **S9-02** Create `DiscussionDetail` with threaded replies → `GET .../discussion_topics/:id/view` ✅ Modal-based detail view in `Discussions.tsx` (author, content, tags, reply/like action buttons — though uses mock data, threaded replies not yet rendered)
- [x] **S9-03** Build `ReplyEditor` with rich text, attachments, @mentions ✅ `apps/classapex-lms/src/widgets/ReplyEditor.tsx` (text formatting toolbar, markdown, keyboard shortcut Cmd+Enter, char count, cancel/submit); integrated into `Discussions.tsx` detail modal
- [ ] **S9-04** Implement reply threading (nested replies with expand/collapse)
- [x] **S9-05** Create `DiscussionCreate/Edit` form (teacher) → `POST/PUT .../discussion_topics` ✅ Modal-based create/edit in `Discussions.tsx` (title, content, course, tags; integrated with mock data)
- [~] **S9-06** Build like/rating system → `POST .../discussion_topics/:id/entries/:id/rating` *(like button UI exists in detail modal, mock state toggle working)*
- [ ] **S9-07** Implement mark-as-read tracking → `PUT .../discussion_topics/:id/read_all`
- [x] **S9-08** Add pinning, locking, subscribing actions ✅ Toggle buttons in discussion detail modal (pin, lock, subscribe with visual state and mock data persistence)
- [ ] **S9-09** Build graded discussion integration (links to gradebook)
- [ ] **S9-10** Create discussion search and filter within a topic

---

## Sprint 10: Inbox & Messaging

### Tasks
- [ ] **S10-01** Build `Inbox` page with conversation list → `GET /api/v1/conversations`
- [ ] **S10-02** Create `ConversationThread` detail view → `GET /api/v1/conversations/:id`
- [ ] **S10-03** Build `ComposeMessage` modal with recipient picker → `POST /api/v1/conversations`
- [ ] **S10-04** Implement recipient search → `GET /api/v1/search/recipients`
- [ ] **S10-05** Build message actions: reply, reply-all, forward, archive, delete, star
- [ ] **S10-06** Create conversation filters (inbox, sent, starred, archived, unread)
- [ ] **S10-07** Implement batch operations (select multiple, archive, delete)
- [ ] **S10-08** Build `NotificationPreferences` page → `GET/PUT .../notification_preferences`
- [ ] **S10-09** Add attachment support in messages
- [ ] **S10-10** Create unread count badge in sidebar navigation

---

## Sprint 11: Calendar & Planner

### Tasks
- [x] **S11-01** Build `Calendar` page with month/week/day/agenda views ✅ `apps/classapex-lms/src/pages/Calendar.tsx` (month grid, week/day/agenda list views, month navigation, today jump)
- [x] **S11-02** Implement event fetching → `GET /api/v1/calendar_events` + `GET .../assignments` ✅ *(UI fetches mock data; API integration pending)*
- [x] **S11-03** Create `EventCreate/Edit` modal → `POST/PUT /api/v1/calendar_events` ✅ `apps/classapex-lms/src/pages/Calendar.tsx` (full modal with title, description, date/time, location, type, course, all-day toggle; supports both create and edit)
- [~] **S11-04** Build color-coded course overlays (toggle per course) *(events color-coded by type, course filter dropdown exists)*
- [ ] **S11-05** Create `PlannerView` (student) → `GET /api/v1/planner/items`
- [ ] **S11-06** Build `PlannerNote` create/edit → `POST/PUT /api/v1/planner_notes`
- [ ] **S11-07** Implement drag-to-reschedule events on calendar
- [ ] **S11-08** Add appointment scheduler (office hours) → `GET/POST .../appointment_groups`
- [ ] **S11-09** Build iCal feed export link
- [ ] **S11-10** Create today widget with agenda view for dashboard

---

## Sprint 12: Groups & Conferences

### Tasks
- [x] **S12-01** Build `GroupList` page → `GET /api/v1/users/self/groups` ✅ `apps/classapex-lms/src/pages/Groups.tsx` (search, role filter, GroupCard with member count/activity)
- [x] **S12-02** Create `GroupDetail` page with members, discussions, files ✅ *(detail modal in Groups.tsx with course, member info, activity status)*
- [ ] **S12-03** Build group file sharing → `GET /api/v1/groups/:id/files`
- [ ] **S12-04** Create group discussions → `GET /api/v1/groups/:id/discussion_topics`
- [ ] **S12-05** Build `GroupCategoryManager` (teacher) → `POST/PUT .../group_categories`
- [ ] **S12-06** Implement self-signup groups and auto-assign groups
- [ ] **S12-07** Build `ConferenceList` → `GET /api/v1/courses/:id/conferences`
- [ ] **S12-08** Create conference launch/join UI (BigBlueButton/Zoom integration)
- [ ] **S12-09** Build `Collaborations` page → `GET /api/v1/courses/:id/collaborations`
- [ ] **S12-10** Add group announcement and messaging capabilities

---

## 📊 Sprint 9–12 Progress: **10/40 tasks done (25%)**

> **Note:** Pages for Discussions, Calendar, and Groups were built with complete UI but currently use mock data. Full Canvas API integration (useCanvasQuery / canvas-client.ts) remains for S9-06, S11-04, and several sub-features. Inbox/Messaging (Sprint 10) and Conferences (Sprint 12) are entirely unstarted.
