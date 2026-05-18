# ClassApex LMS — Design System

## Theme
Dark-first app UI. Assumes students and teachers working in varied lighting (classrooms, dorms, libraries, late-night study sessions). Dark reduces glare during extended use. Light mode available for accessibility.

## Color Palette
- **Neutrals (OKLCH)**: Tinted slightly warm (0.008 chroma toward orange) to avoid clinical gray. Surface hierarchy: app bg → surface → raised → sunken, stepped in 10% lightness deltas.
- **Brand accent**: Blue-600 (#2563eb) for primary actions, links, active states. Not used decoratively.
- **Semantic**: Red (error/missing), amber (warning), green (success), blue (info). Used only for state indication, never decoration.
- **Pure black/white**: Never used. Lightest surfaces stop at #f4f4f4, darkest at #161616.

## Typography
- **Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` — system stack for native feel across platforms. No Inter or custom fonts — avoids the SaaS-template look.
- **Scale**: 1.25 ratio. Base 14px for dense UIs. Headings step up: sm (12px), base (14px), md (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px).
- **Weights**: Normal (400), medium (500), semibold (600), bold (700).
- **Line length**: 65–75ch for prose. Denser for data (tables, widgets).

## Spacing
8px baseline grid. Gaps in 4px increments: 4, 8, 12, 16, 24, 32, 40, 48, 64. Not all values used everywhere — rhythm over uniformity.

## Elevation & Borders
- **Shadows**: Subtle. Sm (1px), md (4px), lg (10px blur). Dark mode shadows are lower-opacity than light.
- **Borders**: 1px solid, using the `--cx-border-*` scale. Never thicker. Never as colored side-stripe accents.
- **Radius**: Sm (4px) for interactive elements, md (8px) for cards, lg (12px) for dialogs. Consistent per element type.

## Components
- **Buttons**: Rounded (8px), clear hover/focus/active/disabled states. Ghost variant for secondary actions.
- **Cards**: Minimal — border + subtle shadow + hover lift (translateY -2px). No nested cards. No gradient banners or decorative elements.
- **Sidebar**: Dark surface, light text. Collapsible. Role-filtered navigation.
- **Widgets**: Bordered containers with uppercase label. Compact, information-dense. No extraneous padding.

## Motion
- **Duration**: 150ms for micro-interactions (hover, focus), 250ms for transitions (panels, modals).
- **Easing**: `cubic-bezier(0, 0, 0.2, 1)` — ease-out quadratic. No bounce, no elastic.
- **What moves**: State indicators, reveal/hide, hover lifts. Layout properties never animate.
- **Reduced motion**: Respects `prefers-reduced-motion`. All durations → 0ms.

## Empty & Loading States
- **Skeleton loading**: Shimmer animation matching card/grid shapes. Not spinners.
- **Empty states**: Brief message + actionable hint. No illustrations.
- **Error states**: Inline below relevant content. Toast for non-blocking errors.
