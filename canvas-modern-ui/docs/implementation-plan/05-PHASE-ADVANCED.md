# Phase 5 — Advanced Features (Sprints 17–20)

## Sprint 17: Quizzes

### Tasks
- [ ] **S17-01** Build `QuizList` page → `GET /api/v1/courses/:id/quizzes`
- [ ] **S17-02** Create `QuizDetail` with instructions, time limit, attempts info
- [ ] **S17-03** Build `QuizTaker` — question-by-question or all-at-once view
- [ ] **S17-04** Implement question types: multiple choice, true/false, short answer, essay
- [ ] **S17-05** Implement question types: matching, fill-in-blank, numerical, file upload
- [ ] **S17-06** Build quiz timer with auto-submit → `POST .../quiz_submissions`
- [ ] **S17-07** Create `QuizResults` view with score, correct answers, feedback
- [ ] **S17-08** Build `QuizEditor` (teacher) → `POST/PUT .../quizzes`
- [ ] **S17-09** Create question bank management → `GET/POST .../question_banks`
- [ ] **S17-10** Implement quiz statistics view (teacher) → `GET .../quizzes/:id/statistics`

---

## Sprint 18: Rubrics & SpeedGrader

### Tasks
- [ ] **S18-01** Build `RubricDisplay` component → `GET /api/v1/courses/:id/rubrics`
- [ ] **S18-02** Create `RubricCreator` (teacher) → `POST /api/v1/courses/:id/rubrics`
- [ ] **S18-03** Build `RubricAssessment` inline grading UI
- [ ] **S18-04** Implement rubric association with assignments → `POST .../rubric_associations`
- [ ] **S18-05** Build `SpeedGrader`-style view: student selector + submission + rubric side-by-side
- [ ] **S18-06** Create inline annotation viewer for document submissions (DocViewer integration)
- [ ] **S18-07** Implement provisional/moderated grading workflow
- [ ] **S18-08** Build grade posting/hiding → `POST .../assignments/:id/submissions/update_grades`
- [ ] **S18-09** Create submission comment with media recording support
- [ ] **S18-10** Implement self and peer assessment rubric views

---

## Sprint 19: Outcomes & Mastery

### Tasks
- [ ] **S19-01** Build `OutcomeList` page → `GET /api/v1/courses/:id/outcome_groups`
- [ ] **S19-02** Create `OutcomeDetail` with mastery scale and calculation method
- [ ] **S19-03** Build `OutcomeCreate/Edit` form → `POST/PUT /api/v1/outcomes`
- [ ] **S19-04** Implement outcome alignment to assignments/rubrics
- [ ] **S19-05** Build `MasteryGradebook` view → `GET .../courses/:id/outcome_results`
- [ ] **S19-06** Create student mastery progress chart per outcome
- [ ] **S19-07** Build outcome import/export → `POST .../outcome_imports`
- [ ] **S19-08** Implement proficiency ratings display → `GET .../outcome_proficiency`
- [ ] **S19-09** Create outcome group hierarchy browser
- [ ] **S19-10** Build learning mastery comparison across sections

---

## Sprint 20: LTI Tools & External Integrations

### Tasks
- [ ] **S20-01** Build `ExternalToolList` → `GET /api/v1/courses/:id/external_tools`
- [ ] **S20-02** Create LTI launch iframe wrapper with postMessage handling
- [ ] **S20-03** Implement LTI 1.3 deep linking response handler
- [ ] **S20-04** Build tool placement rendering (navigation, editor button, assignment selection)
- [ ] **S20-05** Create `DeveloperKeyManager` (admin) → `GET/POST .../developer_keys`
- [ ] **S20-06** Build external tool configuration form → `POST .../external_tools`
- [ ] **S20-07** Implement content item / deep linking flow
- [ ] **S20-08** Create `ePortfolio` page → `GET /api/v1/eportfolios`
- [ ] **S20-09** Build ePortfolio editor with sections and entries
- [ ] **S20-10** Implement SCORM package launch wrapper

---

## 📊 Sprint 17–20 Progress: **0/40 tasks done (0%)**

> **Note:** An LTI 1.3 backend service exists at `packages/lti-service/` (Express.js with OAuth 1.3 launch, JWKS, login, bootstrap, Canvas API proxy). However, no frontend UI components have been built for any Phase 5 features — quizzes, rubrics, outcomes, and LTI tool management are entirely unstarted on the UI side.
