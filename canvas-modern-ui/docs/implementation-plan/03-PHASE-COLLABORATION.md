# Phase 3 — Collaboration & Communication (Sprints 9–12)

## Sprint 9: Discussions

### Tasks
- [x] **S9-01** Build `DiscussionList` with filters (unread, pinned, locked) → `GET .../discussion_topics` ✅
- [x] **S9-02** Create `DiscussionDetail` with threaded replies → `GET .../discussion_topics/:id/view` ✅
- [x] **S9-03** Build `ReplyEditor` with rich text, attachments, @mentions ✅
- [x] **S9-04** Implement reply threading (nested replies with expand/collapse) ✅
- [x] **S9-05** Create `DiscussionCreate/Edit` form (teacher) → `POST/PUT .../discussion_topics` ✅
- [x] **S9-06** Build like/rating system → `POST .../discussion_topics/:id/entries/:id/rating` ✅
- [x] **S9-07** Implement mark-as-read tracking → `PUT .../discussion_topics/:id/read_all` ✅
- [x] **S9-08** Add pinning, locking, subscribing actions ✅
- [x] **S9-09** Build graded discussion integration (links to gradebook) ✅
- [x] **S9-10** Create discussion search and filter within a topic ✅

---

## Sprint 10: Inbox & Messaging

### Tasks
- [x] **S10-01** Build `Inbox` page with conversation list → `GET /api/v1/conversations` ✅
- [x] **S10-02** Create `ConversationThread` detail view → `GET /api/v1/conversations/:id` ✅
- [x] **S10-03** Build `ComposeMessage` modal with recipient picker → `POST /api/v1/conversations` ✅
- [x] **S10-04** Implement recipient search → `GET /api/v1/search/recipients` ✅
- [x] **S10-05** Build message actions: reply, reply-all, forward, archive, delete, star ✅
- [x] **S10-06** Create conversation filters (inbox, sent, starred, archived, unread) ✅
- [x] **S10-07** Implement batch operations (select multiple, archive, delete) ✅
- [x] **S10-08** Build `NotificationPreferences` page → `GET/PUT .../notification_preferences` ✅
- [x] **S10-09** Add attachment support in messages ✅
- [x] **S10-10** Create unread count badge in sidebar navigation ✅

---

## Sprint 11: Calendar & Planner

### Tasks
- [x] **S11-01** Build `Calendar` page with month/week/day/agenda views ✅
- [x] **S11-02** Implement event fetching → `GET /api/v1/calendar_events` + `GET .../assignments` ✅
- [x] **S11-03** Create `EventCreate/Edit` modal → `POST/PUT /api/v1/calendar_events` ✅
- [x] **S11-04** Build color-coded course overlays (toggle per course) ✅
- [x] **S11-05** Create `PlannerView` (student) → `GET /api/v1/planner/items` ✅
- [x] **S11-06** Build `PlannerNote` create/edit → `POST/PUT /api/v1/planner_notes` ✅
- [x] **S11-07** Implement drag-to-reschedule events on calendar ✅
- [x] **S11-08** Add appointment scheduler (office hours) → `GET/POST .../appointment_groups` ✅
- [x] **S11-09** Build iCal feed export link ✅
- [x] **S11-10** Create today widget with agenda view for dashboard ✅

---

## Sprint 12: Groups & Conferences

### Tasks
- [x] **S12-01** Build `GroupList` page → `GET /api/v1/users/self/groups` ✅
- [x] **S12-02** Create `GroupDetail` page with members, discussions, files ✅
- [x] **S12-03** Build group file sharing → `GET /api/v1/groups/:id/files` ✅
- [x] **S12-04** Create group discussions → `GET /api/v1/groups/:id/discussion_topics` ✅
- [x] **S12-05** Build `GroupCategoryManager` (teacher) → `POST/PUT .../group_categories` ✅
- [x] **S12-06** Implement self-signup groups and auto-assign groups ✅
- [x] **S12-07** Build `ConferenceList` → `GET /api/v1/courses/:id/conferences` ✅
- [x] **S12-08** Create conference launch/join UI (BigBlueButton/Zoom integration) ✅
- [x] **S12-09** Build `Collaborations` page → `GET /api/v1/courses/:id/collaborations` ✅
- [x] **S12-10** Add group announcement and messaging capabilities ✅

---

## 📊 Phase 3 Progress: **40/40 tasks done (100%)**
