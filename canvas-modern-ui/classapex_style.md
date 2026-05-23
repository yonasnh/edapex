# ClassApex Design System

> A complete visual design specification for ClassApex — a Learning Management System.
> Derived from a refined dark-mode dashboard aesthetic, adapted for educational contexts.

---

## 1. Brand Identity

| Property | Value |
|----------|-------|
| **Name** | ClassApex |
| **Tagline** | Master Your Learning |
| **Personality** | Precise, calm, focused, modern |
| **Voice** | Clear, encouraging, direct |
| **Metaphor** | The apex of a learning curve — progress visualized |

### Logo Treatment
- **Primary mark**: A minimal upward-trending curve (apex parabola) in `--primary`
- **Wordmark**: "ClassApex" set in Inter, weight 900, letter-spacing -0.04em
- **Subtitle**: "LEARNING MANAGEMENT" in 0.6rem, uppercase, letter-spacing 2px, `--text-dim`

---

## 2. Color Palette

### Backgrounds & Surfaces (Dark Mode)
```
--bg:           #080c14    /* Deepest void — app background */
--bg-subtle:    #060a11    /* Subtle depth layer */
--surface-0:    #0c1018    /* Base card layer */
--surface-1:    #111827    /* Primary card background */
--surface-2:    #1a2234    /* Elevated card / hover */
--surface-3:    #243048    /* Borders, inputs, active states */
--surface-4:    #374151    /* Disabled, muted indicators */
```

### Text
```
--text-heading: #f8fafc    /* Headlines — near white */
--text:         #e2e8f0    /* Body text — soft white */
--text-muted:   #94a3b8    /* Labels, secondary — slate */
--text-dim:     #4b5563    /* Tertiary, placeholders */
```

### Primary (Amber — Knowledge/Focus)
```
--primary:      #f59e0b    /* Amber — energy, attention, progress */
--primary-h:    #fbbf24    /* Hover state */
--primary-d:    rgba(245, 158, 11, 0.1)   /* Subtle fill */
--primary-glow: rgba(245, 158, 11, 0.2)   /* Glow base */
--primary-glow-strong: rgba(245, 158, 11, 0.4)
--primary-rgb:  245, 158, 11
```

### Secondary (Indigo — Structure/Courses)
```
--secondary:    #6366f1
--secondary-h:  #818cf8
--secondary-d:  rgba(99, 102, 241, 0.1)
--secondary-rgb: 99, 102, 241
```

### Semantic Colors
```
--green:        #10b981    /* Complete / Pass */
--green-h:      #34d399
--green-d:      rgba(16, 185, 129, 0.1)
--red:          #ef4444    /* Overdue / Fail */
--red-h:        #f87171
--red-d:        rgba(239, 68, 68, 0.1)
--yellow:       #f59e0b    /* In Progress / Warning */
--yellow-d:     rgba(245, 158, 11, 0.1)
--cyan:         #06b6d4    /* Active / Live */
--cyan-d:       rgba(6, 182, 212, 0.1)
--purple:       #a855f7    /* Advanced / Mastery */
--purple-d:     rgba(168, 85, 247, 0.1)
--orange:       #f97316    /* Urgent / Review */
--blue:         #2563eb    /* Info / Resources */
--blue-rgb:     37, 99, 235
--purple-rgb:   168, 85, 247
```

### Borders
```
--border:       rgba(255, 255, 255, 0.06)   /* Default hairline */
--border-hover: rgba(255, 255, 255, 0.12)   /* Hover lift */
--border-focus: #f59e0b                      /* Focus ring */
--border-glow:  rgba(245, 158, 11, 0.3)     /* Glow focus */
```

---

## 3. Typography

### Font Families
```
--font-sans:  'Inter', system-ui, -apple-system, sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 1.25rem | 800 | 1.2 | -0.03em | Page titles |
| **H1** | 1.05rem | 900 | 1.1 | -0.04em | Sidebar brand |
| **H2** | 1.0rem | 700 | 1.2 | -0.02em | Section headers |
| **H3** | 0.9rem | 800 | 1.2 | — | Card titles |
| **H4** | 0.8rem | 800 | 1.3 | 0.05em uppercase | Panel labels, tabs |
| **Body** | 0.875rem | 400 | 1.6 | — | Paragraphs |
| **Body Small** | 0.8rem | 400 | 1.5 | — | Card descriptions |
| **Label** | 0.75rem | 700 | 1.2 | 0.05em uppercase | Form labels, badges |
| **Caption** | 0.7rem | 600 | 1.3 | — | Metadata, hints |
| **Micro** | 0.6rem | 700 | 1.2 | 1.5px uppercase | Subtitles, nav labels |
| **Data** | 0.95rem | 900 | 1.2 | — | Numbers, stats (mono) |

### Heading Defaults
```css
h1, h2, h3, h4, h5, h6 {
  color: var(--text-heading);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

---

## 4. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Tight gaps, icon padding |
| **sm** | 8px | Inline spacing, button gap |
| **md** | 12px | Card internal padding |
| **lg** | 16px | Card padding, section gap |
| **xl** | 20px | Component gap |
| **2xl** | 24px | Section margin |
| **3xl** | 32px | Page padding bottom |

### Layout
```
--sidebar-width:       224px
--sidebar-collapsed:   66px
--page-padding-x:      32px
--page-padding-y:      24px
--page-padding-bottom: 64px
--card-padding:        12px - 16px
--section-gap:         32px
--grid-gap:            12px - 16px
```

---

## 5. Shape & Elevation

### Border Radius
```
--radius-sm:   6px   /* Buttons, inputs, small pills */
--radius-md:   10px  /* Medium cards, modals */
--radius-lg:   14px  /* Primary cards, panels */
--radius-xl:   20px  /* Large containers, dialogs */
--radius-full: 9999px /* Pills, avatars, badges */
```

### Shadows
```
--shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
--shadow-lg: 0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4);
--shadow-glow: 0 0 40px var(--primary-glow), 0 0 80px rgba(245,158,11,0.06);
```

### Glass & Border Utilities
```css
.glass-panel {
  background: linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(8,12,20,0.9) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.hairline-border {
  border: 1px solid rgba(255,255,255,0.06);
  border-top: 1px solid rgba(255,255,255,0.1);
}

.layered-shadow {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 10px 20px -3px rgba(0,0,0,0.5);
}
```

---

## 6. Motion & Animation

### Transitions
```
--dur:         180ms
--ease:        cubic-bezier(0.4, 0, 0.2, 1)       /* Standard */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)      /* Bouncy enter */
```

### Animation Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--primary); }
  50%      { opacity: 0.6; box-shadow: 0 0 10px var(--primary); }
}

@keyframes mesh {
  0%   { transform: translate(0,0) rotate(0deg); }
  33%  { transform: translate(5%, 5%) rotate(5deg); }
  66%  { transform: translate(-5%, 2%) rotate(-2deg); }
  100% { transform: translate(0,0) rotate(0deg); }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 8px var(--primary-glow); }
  50%      { box-shadow: 0 0 20px var(--primary-glow-strong); }
}
```

### Animation Utilities
```css
.fade-in  { animation: fadeIn 0.4s var(--ease) both; }
.slide-up { animation: slideUp 0.5s var(--ease-spring) both; }
.spin     { animation: spin 1s linear infinite; }

.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 200ms; }
.stagger-5 { animation-delay: 250ms; }
```

---

## 7. Components

### 7.1 Buttons

#### Primary Button
```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 0.8rem; font-weight: 600;
  background: var(--primary); border-color: var(--primary);
  color: white; cursor: pointer;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  background: var(--primary-h); border-color: var(--primary-h);
}
.btn-primary:active {
  transform: scale(0.97);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-muted);
}
.btn-ghost:hover {
  background: var(--surface-2);
  color: var(--text);
}
```

#### Danger Button
```css
.btn-danger {
  background: var(--red-d);
  border-color: rgba(239,68,68,0.3);
  color: var(--red);
}
.btn-danger:hover {
  background: var(--red); color: white;
}
```

#### Icon Button
```css
.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; padding: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 180ms var(--ease);
}
.btn-icon:hover {
  background: var(--surface-3);
  color: var(--text);
  border-color: var(--border);
}
```

#### Toggle Chip
```css
.toggle-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: var(--radius-full);
  font-size: 0.7rem; font-weight: 700;
  cursor: pointer; border: 1px solid var(--border);
  background: var(--surface-1); color: var(--text-dim);
  transition: all 180ms var(--ease);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.toggle-chip.active {
  background: var(--cyan-d);
  border-color: rgba(6,182,212,0.3);
  color: var(--cyan);
}
```

---

### 7.2 Cards

#### Standard Card
```css
.card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.card:hover {
  border-color: var(--border-hover);
}
```

#### Stat Card
```css
.stat-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.25s var(--ease-spring);
}
.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
```

#### Glass Card (Premium)
```css
.card-glass {
  background: linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(8,12,20,0.9) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-top: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
}
```

---

### 7.3 Inputs

#### Text Input
```css
input[type="text"],
input[type="number"],
input[type="email"],
select {
  width: 100%;
  padding: 5px 8px;
  font-size: 0.7rem;
  font-family: var(--font-sans);
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  transition: all 180ms var(--ease);
}
input:focus, select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-d);
}
```

#### Filter Select
```css
.filter-select {
  padding: 7px 12px; font-size: 0.75rem; font-weight: 600;
  background: var(--surface-1); border: 1px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8'%3E%3Cpath d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
```

---

### 7.4 Badges & Pills

```css
.badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: var(--radius-full);
  font-size: 0.75rem; white-space: nowrap;
}

.badge-primary {
  background: var(--primary-d);
  border: 1px solid rgba(245,158,11,0.25);
  color: var(--primary-h);
}

.badge-success {
  background: var(--green-d);
  border: 1px solid rgba(16,185,129,0.25);
  color: var(--green);
}

.badge-warning {
  background: var(--yellow-d);
  border: 1px solid rgba(245,158,11,0.25);
  color: var(--yellow);
}

.badge-danger {
  background: var(--red-d);
  border: 1px solid rgba(239,68,68,0.25);
  color: var(--red);
}

.badge-info {
  background: var(--cyan-d);
  border: 1px solid rgba(6,182,212,0.25);
  color: var(--cyan);
}
```

---

### 7.5 Tables

```css
.table-container {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

table {
  width: 100%; min-width: 1100px;
  text-align: left; border-collapse: collapse;
}

thead th {
  padding: 12px 16px;
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
}

tbody td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
}

tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}
```

---

### 7.6 Tabs

```css
.tab-bar {
  display: flex; gap: 4px;
  padding: 4px;
  background: var(--surface-2);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.tab {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  font-size: 0.7rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-muted);
  background: transparent;
  border: none; border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s var(--ease);
  flex: 1; justify-content: center;
}

.tab:hover {
  color: var(--text-heading);
  background: rgba(255, 255, 255, 0.03);
}

.tab.active {
  color: var(--text-heading);
  background: var(--surface-1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
```

---

### 7.7 Sidebar Navigation

```css
.sidebar {
  width: 224px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: transparent;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: sticky; top: 0; height: 100vh;
}

.nav-section-label {
  font-size: 0.55rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: var(--text-dim);
  padding: 8px 12px 4px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-sm);
  background: transparent; border: none;
  color: var(--text-muted); cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.8rem; font-weight: 600;
  transition: all 0.25s var(--ease-spring);
  white-space: nowrap; width: 100%; text-align: left;
  position: relative;
}

.nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: var(--text);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%);
  color: var(--primary-h);
}

.nav-item.active::before {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: var(--primary);
}
```

---

## 8. LMS-Specific Components

### 8.1 Course Progress Card

```css
.course-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s var(--ease-spring);
}

.course-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.course-header {
  display: flex; align-items: center; gap: 10px;
}

.course-dot {
  width: 10px; height: 10px;
  border-radius: 50%; flex-shrink: 0;
}

.course-name {
  font-weight: 800; font-size: 0.8rem;
  color: var(--text-heading);
  flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.course-code {
  font-size: 0.65rem; font-weight: 700;
  color: var(--text-dim); font-family: var(--font-mono);
}

/* Progress Ring — replaces gauge rings */
.progress-ring {
  width: 36px; height: 36px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--surface-3);
  stroke-width: 3;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s var(--ease);
}

.progress-ring-text {
  position: absolute;
  font-size: 0.55rem; font-weight: 900;
  font-family: var(--font-mono);
  color: var(--text-heading);
}

/* Status Dots — for lesson/module completion */
.lesson-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  transition: all 0.3s var(--ease);
  cursor: pointer;
}

.lesson-dot:hover {
  transform: scale(1.2);
}

.lesson-dot.completed { background: var(--green); }
.lesson-dot.in-progress { background: var(--yellow); }
.lesson-dot.not-started { background: var(--surface-4); opacity: 0.35; }
.lesson-dot.overdue { background: var(--red); }
```

### 8.2 Assignment Status Pills

| Status | Background | Border | Text | Usage |
|--------|-----------|--------|------|-------|
| **Submitted** | `var(--green-d)` | `rgba(16,185,129,0.25)` | `var(--green)` | Turned in |
| **Late** | `var(--red-d)` | `rgba(239,68,68,0.25)` | `var(--red)` | Past due |
| **Pending** | `var(--yellow-d)` | `rgba(245,158,11,0.25)` | `var(--yellow)` | Not started |
| **Graded** | `var(--purple-d)` | `rgba(168,85,247,0.25)` | `var(--purple)` | Score ready |
| **Draft** | `var(--cyan-d)` | `rgba(6,182,212,0.25)` | `var(--cyan)` | In progress |

### 8.3 Grade Display

```css
.grade-display {
  font-size: 1.1rem; font-weight: 900;
  font-family: var(--font-mono);
}
.grade-a { color: var(--green); }
.grade-b { color: var(--cyan); }
.grade-c { color: var(--yellow); }
.grade-d { color: var(--orange); }
.grade-f { color: var(--red); }
```

### 8.4 Live Stats Bar (Dashboard Header)

```css
.live-stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.live-stat {
  display: flex; flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.live-stat-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.58rem; font-weight: 800;
  color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.05em;
}

.live-stat-value {
  font-size: 0.95rem; font-weight: 900;
  color: var(--text-heading);
  font-family: var(--font-mono);
  line-height: 1.2;
}

.live-stat-sub {
  font-size: 0.58rem; font-weight: 600;
  color: var(--text-muted);
}
```

### 8.5 Section Headers

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.125rem; font-weight: 800;
  color: var(--text-heading);
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.badge-outline {
  display: inline-flex; align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  white-space: nowrap;
  border: 1px solid var(--border);
  color: var(--text-muted);
}
```

---

## 9. Responsive Breakpoints

```
Mobile:   < 640px   /* Single column, stacked layout */
Tablet:   640px     /* 2-column grids */
Desktop:  1024px    /* Full multi-column grids */
Wide:     1280px+   /* Maximum content width */
```

### Grid Patterns
```css
/* 5-column grid (courses, modules) */
.grid-5 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}
@media (min-width: 640px)  { .grid-5 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid-5 { grid-template-columns: repeat(5, 1fr); } }

/* 4-column grid (stats, assignments) */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px)  { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }

/* 2-column grid (chart + panel) */
.grid-pair {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 900px) { .grid-pair { grid-template-columns: 1fr 1fr; } }
```

---

## 10. Scrollbar Styling

```css
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--surface-4); }
```

---

## 11. Full CSS Variable Reference

```css
:root {
  /* Surfaces */
  --bg: #080c14;
  --bg-subtle: #060a11;
  --surface-0: #0c1018;
  --surface-1: #111827;
  --surface-2: #1a2234;
  --surface-3: #243048;
  --surface-4: #374151;

  /* Borders */
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);
  --border-focus: #f59e0b;
  --border-glow: rgba(245, 158, 11, 0.3);

  /* Text */
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --text-dim: #4b5563;
  --text-heading: #f8fafc;

  /* Primary (Amber) */
  --primary: #f59e0b;
  --primary-h: #fbbf24;
  --primary-d: rgba(245, 158, 11, 0.1);
  --primary-glow: rgba(245, 158, 11, 0.2);
  --primary-glow-strong: rgba(245, 158, 11, 0.4);
  --primary-rgb: 245, 158, 11;

  /* Secondary (Indigo) */
  --secondary: #6366f1;
  --secondary-h: #818cf8;
  --secondary-d: rgba(99, 102, 241, 0.1);
  --secondary-rgb: 99, 102, 241;

  /* Semantic */
  --green: #10b981;
  --green-h: #34d399;
  --green-d: rgba(16, 185, 129, 0.1);
  --green-rgb: 16, 185, 129;
  --red: #ef4444;
  --red-h: #f87171;
  --red-d: rgba(239, 68, 68, 0.1);
  --yellow: #f59e0b;
  --yellow-d: rgba(245, 158, 11, 0.1);
  --cyan: #06b6d4;
  --cyan-d: rgba(6, 182, 212, 0.1);
  --purple: #a855f7;
  --purple-d: rgba(168, 85, 247, 0.1);
  --orange: #f97316;
  --blue: #2563eb;
  --blue-rgb: 37, 99, 235;
  --purple-rgb: 168, 85, 247;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 40px var(--primary-glow), 0 0 80px rgba(245,158,11,0.06);

  /* Motion */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --dur: 180ms;
}
```

---

## 12. Adaptation Notes (PrimeTick → ClassApex)

| Original | Adaptation | Rationale |
|----------|-----------|-----------|
| Emerald primary | **Amber primary** | Knowledge, energy, learning warmth |
| Trading/stats metaphor | **Progress/grades metaphor** | Education domain |
| Account gauges (SVG rings) | **Lesson dots + progress rings** | Course completion visualization |
| Payout/funded states | **Submitted/graded states** | Assignment lifecycle |
| Prop firm cost | **Course credit hours** | Academic context |
| Cash reserve | **GPA / Standing** | Student metrics |
| Revenue velocity chart | **Grade trend chart** | Performance over time |
| Inventory manager | **Course roster** | Student enrollment |

---

*Document generated from PrimeTick Dashboard Design System v2*
*Adapted for ClassApex Learning Management System*
