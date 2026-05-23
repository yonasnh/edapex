# ClassApex 2.0 — UI/UX Design Guideline

**Version:** 2.0  
**Status:** Production-ready system guide  
**Format:** Markdown  
**Theme:** Institutional Modernism (The "Apple of EdTech")

---

## 1. Purpose & Vision
ClassApex 2.0 is a **Headless Experience Layer** designed to bridge the gap between legacy data backends (Canvas, Blackboard, Moodle) and modern human needs. 

The system is engineered for:
- **Performance as a Feature:** Instantaneous interactions ($<500ms$ load goals).
- **AI-Native Workflows:** Seamless "Human-in-the-Loop" integration for grading and student nudges.
- **Frictionless Migration:** An interface so intuitive that legacy users feel upgraded, not displaced.
- **The "Shadow" Advantage:** UI states that reflect real-time sync status between ClassApex and the legacy provider.

---

## 2. Core Principles

### 2.1 Performance First (The "Shadow" Principle)
Because we utilize a **Shadow DB**, the UI should never wait for an upstream API to load. 
- Use optimistic UI updates for all mutations (grading, publishing).
- Provide immediate visual feedback, then sync to the legacy provider in the background.

### 2.2 AI as a Teammate, Not a Ghost
AI-generated content must be clearly distinguishable but not disruptive.
- **Disclosure:** Use a specific "AI-Spark" icon and subtle background tint for suggested feedback.
- **Deterministic Control:** Every AI action must have "Review/Approve" or "Regenerate" controls.

### 2.3 The "⌘K" Navigation Standard
The **Command Bar** is the heart of the system navigation.
- Every high-frequency task (grading a student, jumping to a module) must be accessible via keyboard in $<3$ keystrokes.

### 2.4 High-Density Clarity
Educational data is dense. We use a **"White Space over Lines"** approach.
- Use generous margins to separate modules rather than heavy borders.
- Use subtle shifts in surface color (`bg.surface.alt`) to define distinct zones.

---

## 3. Design System Architecture (ULS-Aligned)

Tokens are mapped to the **Universal Learning Schema (ULS)** to ensure engineering and design are speaking the same language.

| Tier | Category | Purpose |
| :--- | :--- | :--- |
| **P0** | **Primitives** | Raw hex/spacing values (e.g., `Indigo.600`). |
| **P1** | **Semantic** | Contextual usage (e.g., `text.primary`, `status.syncing`). |
| **P2** | **Component** | Specific element rules (e.g., `commandbar.bg`). |

---

## 4. Color System

### 4.1 Primary Brand: "Electric Indigo"
The palette signals **Modern Intelligence**. It is cleaner and more energetic than traditional "Academic Blue."

| Token | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| `brand.primary` | `#4F46E5` (Electric Indigo) | `#6366F1` (Vibrant Indigo) |
| `brand.accent` | `#0EA5E9` (Apex Blue) | `#38BDF8` (Sky) |
| `bg.canvas` | `#F8FAFC` | `#0F172A` |
| `bg.surface` | `#FFFFFF` | `#1E293B` |

### 4.2 Sync & AI Semantic Tokens
| Token | Purpose | Visual Representation |
| :--- | :--- | :--- |
| `status.syncing` | Pending upstream write | Subtle pulse or rotating spinner. |
| `status.synced` | Confirmed by Legacy API | Subtle green check or fade-out. |
| `ai.suggestion` | AI-drafted feedback | Tint: `Indigo.50` (Light) / `Indigo.900` (Dark). |

---

## 5. Typography

A dual-font strategy to balance **Instructional Clarity** with **Institutional Authority**.

- **Display/Headings:** `IBM Plex Sans` (Semibold). Provides a technical, engineered feel.
- **Body/UI Copy:** `Inter`. Optimized for readability at small sizes in dense grading tables.
- **Monospace:** `IBM Plex Mono`. Used for "Shadow Sync" logs and administrative technical data.

---

## 6. Layout & Interaction Patterns

### 6.1 The Split-Pane Grading Workspace
The primary "Instructor Workflow" component.
- **Left Pane (60%):** The artifact (Student PDF, Essay, or Quiz).
- **Right Pane (40%):** The "Apex Sidebar" containing Rubrics, AI-Drafted Feedback, and the "Push to Canvas" button.

### 6.2 The "Nudge" System
Visual indicators for "At-Risk" students.
- **Tier 1 (Urgent):** Solid `Red.500` dot + "Missing 3+ tasks."
- **Tier 2 (Warning):** Amber border on student avatar + "Low participation."
- **Tier 3 (AI Predicted):** Indigo Spark icon + "Engagement drop predicted."

---

## 7. Motion & Transitions

### 7.1 Meaningful Transitions
Motion must explain the **Headless** nature of the application.
- **Ingestion:** When data is pulled from Canvas, use a top-down "filling" transition.
- **Mutation:** When a grade is pushed back, use an "upward" slide animation to indicate data leaving ClassApex to the legacy provider.

### 7.2 Performance Cues
- **Skeleton States:** Mandatory for all data-fetching components.
- **Zero-Latency Switching:** When toggling between Student and Instructor views, the shell remains static; only the `bg.canvas` content shifts.

---

## 8. Implementation Guidelines (Engineering)

### 8.1 Next.js 15 Implementation
- **Server Components (RSC):** Default for all dashboards to ensure maximum speed.
- **Client Components:** Reserved for the Command Bar, Grade Input, and Interactive Charts.
- **Deterministic Logic:** No randomizing in the UI. If the AI drafts a grade, the UI must show the exact timestamp and "draft" status in the DB.

### 8.2 CSS Variable Mapping
```css
:root {
  --ca-brand-primary: #4F46E5;
  --ca-bg-canvas: #F8FAFC;
  --ca-ai-spark: #818CF8;
}

.dark {
  --ca-bg-canvas: #0F172A;
  --ca-brand-primary: #6366F1;
}