DD# New UI/UX Design Guideline

Version: 1.0  
Format: Production-ready markdown system guide  
Scope: Light mode, dark mode, responsive web app, accessibility, component architecture, and implementation best practices for a modern LMS-style product.

---

## 1. Purpose

This guideline defines the visual, interaction, and implementation standards for the new UI/UX. It is designed to support a modern, scalable, professional product experience comparable to top-tier design systems while remaining practical for engineering delivery.

The system is built around these goals:

- Fast comprehension for students, instructors, admins, and advisors.
- Strong accessibility by default.
- Consistent behavior across light and dark themes.
- Token-driven implementation for maintainability.
- Enterprise-grade polish without unnecessary visual complexity.

---

## 2. Core principles

### 2.1 Role-first UX
The interface must adapt to the user’s job to be done.

- Students should see tasks, deadlines, progress, and communication first.
- Instructors should see grading, publishing, class activity, and student risk first.
- Admins should see system status, reporting, enrollment, permissions, and configuration first.
- Advisors/support staff should see student health, intervention signals, and communication tools first.

### 2.2 Reduce navigation depth
Favor fewer hops, stronger hierarchy, and contextual actions.

- Put high-frequency actions near the object they affect.
- Prefer drawers, inline editing, and side panels over full page jumps when appropriate.
- Use a command/search layer for fast navigation to courses, people, assignments, and settings.

### 2.3 Clarity over decoration
Visual styling should improve comprehension, not compete with content.

- Use restrained color.
- Use spacing and typography to create hierarchy.
- Use motion to explain changes, not to impress.

### 2.4 Accessible by default
Accessibility is a system requirement, not a QA step.

- Keyboard access is required for all interactive controls.
- Visible focus is required for all interactive states.
- Color cannot be the only indicator of state.
- Motion must respect reduced-motion preferences.

### 2.5 Token-driven implementation
Design decisions must be encoded as reusable tokens and component rules.

- No raw hex values in product UI code.
- No component-specific spacing guesses.
- No theme-specific one-off overrides unless formally approved.

---

## 3. Design system architecture

Use a **three-tier token model**.

### 3.1 Primitive tokens
These are raw values.

Examples:

- `color.blue.50`
- `color.blue.600`
- `color.gray.100`
- `color.gray.950`
- `space.4`
- `radius.md`
- `duration.fast`

### 3.2 Semantic tokens
These express purpose.

Examples:

- `bg.canvas`
- `bg.surface`
- `bg.surface.raised`
- `text.primary`
- `text.secondary`
- `border.subtle`
- `action.primary.bg`
- `focus.ring`
- `status.success.text`

### 3.3 Component tokens
These define component-specific behavior.

Examples:

- `button.primary.bg`
- `button.primary.bg.hover`
- `input.border.default`
- `nav.item.bg.selected`
- `table.row.bg.hover`

### 3.4 Token rules

- Primitive tokens may never reference semantic tokens.
- Semantic tokens may reference primitives.
- Component tokens may reference semantic or primitive tokens.
- Themes should swap token values, not component structure.
- Components should consume component tokens first, semantic tokens second.

---

## 4. Color system

### 4.1 Light theme palette

#### Base neutrals
- `color.gray.0: #FFFFFF`
- `color.gray.25: #FCFCFD`
- `color.gray.50: #F7F8FA`
- `color.gray.100: #F1F3F6`
- `color.gray.200: #E5E7EB`
- `color.gray.300: #CBD5E1`
- `color.gray.500: #6B7280`
- `color.gray.700: #374151`
- `color.gray.900: #111827`

#### Brand
- `color.blue.50: #EAF2FF`
- `color.blue.100: #DBEAFE`
- `color.blue.500: #3B82F6`
- `color.blue.600: #2563EB`
- `color.blue.700: #1D4ED8`

#### Status
- `color.green.50: #ECFDF5`
- `color.green.700: #15803D`
- `color.amber.50: #FEF3C7`
- `color.amber.700: #B45309`
- `color.red.50: #FEF2F2`
- `color.red.700: #B91C1C`
- `color.sky.50: #E0F2FE`
- `color.sky.700: #0369A1`

### 4.2 Dark theme palette

#### Base neutrals
- `color.gray.950: #111315`
- `color.gray.900: #181B1F`
- `color.gray.850: #20242A`
- `color.gray.800: #242932`
- `color.gray.700: #2E3440`
- `color.gray.600: #4B5563`
- `color.gray.400: #9AA4B2`
- `color.gray.200: #C7CED8`
- `color.gray.100: #F3F4F6`

#### Brand
- `color.blue.dark.300: #93B4FF`
- `color.blue.dark.400: #7AA2FF`
- `color.blue.dark.500: #5D8FFF`

#### Status
- `color.green.dark.400: #4ADE80`
- `color.amber.dark.400: #FBBF24`
- `color.red.dark.400: #F87171`
- `color.sky.dark.400: #38BDF8`

### 4.3 Semantic color tokens

#### Light
- `bg.canvas: #F7F8FA`
- `bg.surface: #FFFFFF`
- `bg.surface.alt: #F1F3F6`
- `bg.surface.raised: #FFFFFF`
- `bg.selected: #EAF2FF`
- `border.subtle: #E5E7EB`
- `border.strong: #CBD5E1`
- `text.primary: #111827`
- `text.secondary: #4B5563`
- `text.tertiary: #6B7280`
- `text.inverse: #FFFFFF`
- `link.default: #2563EB`
- `focus.ring: #3B82F6`
- `overlay.scrim: rgba(17,24,39,0.52)`

#### Dark
- `bg.canvas: #111315`
- `bg.surface: #181B1F`
- `bg.surface.alt: #20242A`
- `bg.surface.raised: #242932`
- `bg.selected: #13233D`
- `border.subtle: #2E3440`
- `border.strong: #4B5563`
- `text.primary: #F3F4F6`
- `text.secondary: #C7CED8`
- `text.tertiary: #9AA4B2`
- `text.inverse: #0F1115`
- `link.default: #7AA2FF`
- `focus.ring: #93C5FD`
- `overlay.scrim: rgba(0,0,0,0.64)`

### 4.4 Status semantic tokens

Each status must define full usage roles in both themes.

#### Success
- `status.success.bg`
- `status.success.border`
- `status.success.text`
- `status.success.icon`

#### Warning
- `status.warning.bg`
- `status.warning.border`
- `status.warning.text`
- `status.warning.icon`

#### Danger
- `status.danger.bg`
- `status.danger.border`
- `status.danger.text`
- `status.danger.icon`

#### Info
- `status.info.bg`
- `status.info.border`
- `status.info.text`
- `status.info.icon`

### 4.5 Color rules

- Do not use pure black for dark surfaces.
- Do not use pure white for large light backgrounds unless required for contrast or print.
- Use brand color sparingly for priority and action.
- Use tinted backgrounds for passive status communication.
- Ensure text on colored surfaces has a dedicated “on-color” or inverse token.

---

## 5. Contrast and accessibility

### 5.1 Minimum requirements

- Normal text: minimum 4.5:1 contrast.
- Large text: minimum 3:1 contrast.
- Non-text UI elements and focus indicators: minimum 3:1 contrast.

### 5.2 Focus visibility

All interactive controls must have a visible focus treatment.

#### Required focus style
- 2px ring minimum.
- Offset or outer glow that is visible against adjacent surfaces.
- Must remain visible in light and dark mode.
- Cannot rely only on a subtle border color shift.

#### Example token usage
- `focus.ring.width: 2px`
- `focus.ring.offset: 2px`
- `focus.ring.color: var(--focus.ring)`

### 5.3 Keyboard rules

All interactive components must support keyboard operation.

- `Tab` moves focus.
- `Shift + Tab` reverses focus.
- `Enter` activates primary action.
- `Space` toggles checkbox/toggle/button where applicable.
- `Esc` closes modal, popover, tray, or menu.
- Arrow keys navigate composite widgets where appropriate.

### 5.4 State communication

Never use color alone to convey:

- error
- success
- selection
- required fields
- urgency
- active tabs

Add icon, border, label, shape, underline, or text.

### 5.5 Reduced motion

Respect `prefers-reduced-motion`.

- Remove non-essential animation.
- Replace animated transitions with opacity changes or instant state changes.
- Avoid parallax, bouncing, or spring-heavy motion in reduced mode.

---

## 6. Typography

### 6.1 Font families
- `font.family.base: Inter, ui-sans-serif, system-ui, sans-serif`
- `font.family.display: Inter, ui-sans-serif, system-ui, sans-serif`
- `font.family.mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

### 6.2 Font weights
- `font.weight.regular: 400`
- `font.weight.medium: 500`
- `font.weight.semibold: 600`
- `font.weight.bold: 700`

### 6.3 Type scale
- `text.xs: 12px`
- `text.sm: 14px`
- `text.md: 16px`
- `text.lg: 18px`
- `text.xl: 20px`
- `text.2xl: 24px`
- `text.3xl: 30px`
- `text.4xl: 36px`

### 6.4 Line heights
- `line.tight: 1.2`
- `line.snug: 1.35`
- `line.normal: 1.5`
- `line.relaxed: 1.7`

### 6.5 Letter spacing
- Display / page headings: `-0.02em`
- Section headings: `-0.01em`
- Body: `0`
- Overlines / all caps labels: `0.04em`

### 6.6 Usage guidance

- Use `text.md` for default UI body copy.
- Use `text.sm` for compact metadata and support text.
- Use `text.xl` or above for section/page structure.
- Avoid long body copy below 14px.
- Avoid bold for large content blocks; use weight for hierarchy, not density.

---

## 7. Spacing, radius, borders, and elevation

### 7.1 Spacing scale
Use a 4px base scale.

- `space.1: 4px`
- `space.2: 8px`
- `space.3: 12px`
- `space.4: 16px`
- `space.5: 20px`
- `space.6: 24px`
- `space.8: 32px`
- `space.10: 40px`
- `space.12: 48px`
- `space.16: 64px`

### 7.2 Radius
- `radius.xs: 6px`
- `radius.sm: 8px`
- `radius.md: 12px`
- `radius.lg: 16px`
- `radius.xl: 20px`
- `radius.full: 9999px`

### 7.3 Borders
- Standard stroke: `1px`
- Focus ring: `2px`
- Strong dividers only when required by dense data displays.

### 7.4 Elevation

#### Light mode
- `elevation.0`: no shadow
- `elevation.1`: `0 1px 2px rgba(15,23,42,.08)`
- `elevation.2`: `0 8px 24px rgba(15,23,42,.12)`
- `elevation.3`: `0 20px 48px rgba(15,23,42,.18)`

#### Dark mode
Use surface lightening plus restrained shadow.

- `elevation.0`: none
- `elevation.1`: raised surface + `0 1px 2px rgba(0,0,0,.22)`
- `elevation.2`: raised surface + `0 8px 24px rgba(0,0,0,.30)`
- `elevation.3`: raised surface + `0 20px 48px rgba(0,0,0,.36)`

---

## 8. Motion system

### 8.1 Motion tokens
- `duration.instant: 0ms`
- `duration.fast: 100ms`
- `duration.base: 180ms`
- `duration.slow: 280ms`
- `duration.slower: 420ms`

### 8.2 Easing tokens
- `ease.standard: cubic-bezier(.2,0,0,1)`
- `ease.enter: cubic-bezier(.05,.7,.1,1)`
- `ease.exit: cubic-bezier(.3,0,1,1)`
- `ease.emphasized: cubic-bezier(.2,.8,.2,1)`

### 8.3 Motion rules

- Use motion to clarify state change, hierarchy, and continuity.
- Keep most UI transitions between 100ms and 200ms.
- Use opacity + slight transform for overlays and drawers.
- Do not animate large layouts unnecessarily.
- Theme switching should use a subtle 120–180ms cross-fade only if performance is stable.

---

## 9. Layout and responsive rules

### 9.1 Layout model
Use a flexible shell.

- Primary nav
- Secondary workspace rail when required
- Main content canvas
- Optional contextual side panel

### 9.2 Breakpoints
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

### 9.3 Responsive behavior

- Below `md`, prioritize a single-column workflow.
- Persistent sidebars collapse into drawer navigation on smaller screens.
- Tables should convert to stacked cards only when the data model still remains understandable.
- Critical actions must remain visible on mobile.

### 9.4 Content density
Provide three density modes where applicable.

- `comfortable` for student-facing and content-reading views.
- `default` for general app use.
- `compact` for instructor/admin tables, gradebooks, and analytics.

---

## 10. Navigation patterns

### 10.1 Primary navigation
Primary navigation should represent the most stable product areas.

Examples:
- Dashboard
- Courses
- Calendar
- Messages
- Analytics
- Admin
- Settings

### 10.2 Secondary navigation
Use for in-context areas, such as a specific course or admin section.

### 10.3 Navigation rules

- Show current location clearly.
- Do not rely only on color; use active indicators, shape, or typography.
- Keep labels short and literal.
- Avoid hiding critical areas behind ambiguous icons.
- Provide breadcrumbs on deep workflows.

### 10.4 Command/search layer
A universal command bar is recommended.

Users should be able to:
- jump to courses
- search users
- create assignments
- open settings
- send messages
- access recent items

---

## 11. Component standards

### 11.1 Buttons

#### Variants
- Primary
- Secondary
- Tertiary / ghost
- Destructive
- Icon-only

#### Sizes
- Small
- Medium
- Large

#### States
- default
- hover
- active
- focus-visible
- disabled
- loading

#### Rules
- Minimum touch target: 44x44px on touch contexts.
- Icon-only buttons require accessible labels.
- Loading buttons should preserve width and label context.

### 11.2 Inputs

#### Required coverage
- text input
- textarea
- select
- combobox
- checkbox
- radio
- switch
- date picker
- search input
- password input

#### States
- default
- hover
- focus
- filled
- invalid
- disabled
- read-only
- success

#### Rules
- Label every input.
- Placeholder is not a label.
- Required fields must use text or symbol plus accessible metadata.
- Validation must appear near the field and at form summary level when appropriate.

### 11.3 Cards

Cards may be informational or interactive.

#### Variants
- content card
- stat card
- interactive list card
- settings card
- summary card

#### Rules
- Interactive cards require hover, focus, and selected states.
- Avoid excessive shadow stacking.
- Do not place too many nested cards on one screen.

### 11.4 Tables

#### Required features
- sortable headers
- sticky header when appropriate
- row hover
- row selection
- empty state
- loading state
- pagination or virtualization for large sets

#### Rules
- Use compact density for data-heavy tables.
- Preserve alignment for numeric data.
- Keep actions discoverable without clutter.

### 11.5 Tabs

- Tabs switch between sibling sections, not unrelated destinations.
- Active tabs need underline or shape change in addition to color.
- Overflow tabs should collapse into a menu if space is constrained.

### 11.6 Alerts and toasts

#### Alert types
- info
- success
- warning
- danger

#### Rules
- Include icon, heading, and body when needed.
- Use toasts only for short-lived, non-blocking feedback.
- Critical errors should not rely on ephemeral toast only.

### 11.7 Modals, drawers, and popovers

#### Use modal when
- a task requires focused interruption.

#### Use drawer when
- contextual editing should preserve page context.

#### Use popover when
- actions are short and tightly anchored to a control.

#### Rules
- `Esc` closes unless the action is destructive and requires explicit confirmation.
- Focus must trap inside modal context.
- Restore focus to trigger when closed.

### 11.8 Empty states

Every empty state should define:
- title
- short explanation
- primary action
- optional secondary action
- helpful illustration or icon only if it improves comprehension

### 11.9 Loading states

Required loading patterns:
- skeleton for lists/cards/content blocks
- spinner for indeterminate compact actions
- progress bar for known-duration flows
- optimistic update where safe

### 11.10 Icons

#### Standard
- Base grid: 24x24
- Sizes: 16, 20, 24
- Stroke: 1.75–2px equivalent
- Default style: outline for neutral actions; filled only for high emphasis or status

#### Rules
- Pair icons with text when comprehension is not guaranteed.
- Do not rely on icon-only navigation for core product areas on desktop.
- Keep icon metaphors literal and familiar.

---

## 12. Theme implementation

### 12.1 Theme behavior

- Default to system preference on first load.
- Allow explicit user override.
- Persist override locally and, if applicable, at account level.
- Theme changes should apply through token swapping, not duplicated components.

### 12.2 CSS implementation example

```css
:root,
[data-theme="light"] {
  --bg-canvas: #F7F8FA;
  --bg-surface: #FFFFFF;
  --bg-surface-alt: #F1F3F6;
  --bg-surface-raised: #FFFFFF;
  --border-subtle: #E5E7EB;
  --border-strong: #CBD5E1;
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #6B7280;
  --text-inverse: #FFFFFF;
  --link-default: #2563EB;
  --focus-ring: #3B82F6;
  --overlay-scrim: rgba(17,24,39,.52);
}

[data-theme="dark"] {
  --bg-canvas: #111315;
  --bg-surface: #181B1F;
  --bg-surface-alt: #20242A;
  --bg-surface-raised: #242932;
  --border-subtle: #2E3440;
  --border-strong: #4B5563;
  --text-primary: #F3F4F6;
  --text-secondary: #C7CED8;
  --text-tertiary: #9AA4B2;
  --text-inverse: #0F1115;
  --link-default: #7AA2FF;
  --focus-ring: #93C5FD;
  --overlay-scrim: rgba(0,0,0,.64);
}
```

### 12.3 Engineering rules

- Never hard-code theme colors inside components.
- Use semantic tokens in app code.
- Use component tokens inside design-system components.
- Test every component in both themes before release.
- Snapshot visual regression tests should run in light and dark.

---

## 13. LMS-specific UX guidance

### 13.1 Student dashboards
Prioritize:
- upcoming work
- progress by course
- unread messages
- calendar conflicts
- at-risk alerts
- recently accessed materials

### 13.2 Instructor dashboards
Prioritize:
- submissions to review
- grading queue
- recent class activity
- students needing outreach
- unpublished content
- course health metrics

### 13.3 Admin views
Prioritize:
- system health
- enrollment issues
- role/permission tasks
- integration status
- usage analytics
- support queue or exception states

### 13.4 Analytics UX

- Use direct labels where possible.
- Avoid overloading dashboards with decorative charts.
- Pair metrics with recommended actions.
- Show trend + current state + next step.

---

## 14. Documentation standard

Each component page in the design system must include:

- purpose
- when to use
- when not to use
- anatomy
- variants
- states
- content guidance
- accessibility rules
- keyboard behavior
- responsive behavior
- token mapping
- code examples
- dos and don'ts

### 14.1 Living documentation
The system should be maintained as living documentation through a source of truth such as Storybook, a token pipeline, and a design documentation layer.

---

## 15. QA checklist

### Visual QA
- Hierarchy is clear.
- Spacing follows the scale.
- Surfaces and borders are consistent.
- Dark mode preserves depth and readability.
- Brand color is not overused.

### Interaction QA
- Hover, active, focus, disabled, and loading states all exist.
- Keyboard flows are complete.
- Modals trap focus.
- Menus and popovers restore focus on close.

### Accessibility QA
- Contrast passes minimum requirements.
- Screen reader labels exist.
- Error states are announced where required.
- Reduced-motion behavior is respected.
- Touch targets are large enough.

### Implementation QA
- No raw hex values in feature code.
- All theme values resolve through tokens.
- No one-off shadow or radius values.
- Component states match design documentation.

---

## 16. Recommended next deliverables

To operationalize this guide, create these artifacts next:

1. Token JSON source of truth.
2. Figma variables and styles mapped to the same token names.
3. Component specification pages for forms, buttons, tables, nav, alerts, modal, and empty states.
4. Tailwind or CSS variable implementation package.
5. Storybook with light/dark theme switch and accessibility checks.
6. Visual regression tests for both themes.

---

## 17. Final standard

This UI/UX system should feel:

- calm, not bland
- modern, not trendy
- dense where productivity matters
- spacious where reading matters
- accessible without compromise
- enterprise-grade without appearing heavy

The final benchmark is not just visual quality. The benchmark is whether users can find, act, understand, and recover faster in every core workflow.
