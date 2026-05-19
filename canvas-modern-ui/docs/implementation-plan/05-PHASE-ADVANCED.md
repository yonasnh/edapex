# Phase 5 — Advanced Features (Sprints 17–20)

## Sprint 17: Quizzes

### Tasks
- [x] **S17-01** Build `QuizList` page → `GET /api/v1/courses/:id/quizzes` ✅
- [x] **S17-02** Create `QuizDetail` with instructions, time limit, attempts info ✅
- [x] **S17-03** Build `QuizTaker` — question-by-question or all-at-once view ✅
- [x] **S17-04** Implement question types: multiple choice, true/false, short answer, essay ✅
- [x] **S17-05** Implement question types: matching, fill-in-blank, numerical, file upload ✅
- [x] **S17-06** Build quiz timer with auto-submit → `POST .../quiz_submissions` ✅
- [x] **S17-07** Create `QuizResults` view with score, correct answers, feedback ✅
- [x] **S17-08** Build `QuizEditor` (teacher) → `POST/PUT .../quizzes` ✅
- [x] **S17-09** Create question bank management → `GET/POST .../question_banks` ✅
- [x] **S17-10** Implement quiz statistics view (teacher) → `GET .../quizzes/:id/statistics` ✅

---

## Sprint 18: Rubrics & SpeedGrader

### Tasks
- [x] **S18-01** Build `RubricDisplay` component → `GET /api/v1/courses/:id/rubrics` ✅
- [x] **S18-02** Create `RubricCreator` (teacher) → `POST /api/v1/courses/:id/rubrics` ✅
- [x] **S18-03** Build `RubricAssessment` inline grading UI ✅
- [x] **S18-04** Implement rubric association with assignments → `POST .../rubric_associations` ✅
- [x] **S18-05** Build `SpeedGrader`-style view: student selector + submission + rubric side-by-side ✅
- [x] **S18-06** Create inline annotation viewer for document submissions (DocViewer integration) ✅
- [x] **S18-07** Implement provisional/moderated grading workflow ✅
- [x] **S18-08** Build grade posting/hiding → `POST .../assignments/:id/submissions/update_grades` ✅
- [x] **S18-09** Create submission comment with media recording support ✅
- [x] **S18-10** Implement self and peer assessment rubric views ✅

---

## Sprint 19: Outcomes & Mastery

### Tasks
- [x] **S19-01** Build `OutcomeList` page → `GET /api/v1/courses/:id/outcome_groups` ✅
- [x] **S19-02** Create `OutcomeDetail` with mastery scale and calculation method ✅
- [x] **S19-03** Build `OutcomeCreate/Edit` form → `POST/PUT /api/v1/outcomes` ✅
- [x] **S19-04** Implement outcome alignment to assignments/rubrics ✅
- [x] **S19-05** Build `MasteryGradebook` view → `GET .../courses/:id/outcome_results` ✅
- [x] **S19-06** Create student mastery progress chart per outcome ✅
- [x] **S19-07** Build outcome import/export → `POST .../outcome_imports` ✅
- [x] **S19-08** Implement proficiency ratings display → `GET .../outcome_proficiency` ✅
- [x] **S19-09** Create outcome group hierarchy browser ✅
- [x] **S19-10** Build learning mastery comparison across sections ✅

---

## Sprint 20: LTI Tools & External Integrations

### Tasks
- [x] **S20-01** Build `ExternalToolList` → `GET /api/v1/courses/:id/external_tools` ✅
- [x] **S20-02** Create LTI launch iframe wrapper with postMessage handling ✅
- [x] **S20-03** Implement LTI 1.3 deep linking response handler ✅
- [x] **S20-04** Build tool placement rendering (navigation, editor button, assignment selection) ✅
- [x] **S20-05** Create `DeveloperKeyManager` (admin) → `GET/POST .../developer_keys` ✅
- [x] **S20-06** Build external tool configuration form → `POST .../external_tools` ✅
- [x] **S20-07** Implement content item / deep linking flow ✅
- [x] **S20-08** Create `ePortfolio` page → `GET /api/v1/eportfolios` ✅
- [x] **S20-09** Build ePortfolio editor with sections and entries ✅
- [x] **S20-10** Implement SCORM package launch wrapper ✅

---

## 📊 Phase 5 Progress: **40/40 tasks done (100% Complete) 🎉**
