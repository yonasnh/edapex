Below is a production-ready style guide for light and dark mode that you can hand to design and engineering. It targets AA contrast in both themes, treats dark mode as a complementary experience rather than an accessibility shortcut, and uses dark gray surfaces instead of pure black to preserve depth and readability.

Principles
Dark mode should not be implemented as a simple color inversion, because accessibility still depends on verified contrast, visible focus states, and readable component boundaries in both themes. Apple and Material both recommend adaptive, system-aware colors and testing every screen in both appearances so custom UI elements remain legible and consistent.

Use dark gray as the base dark surface instead of pure black; Material guidance notes that smoky grays preserve elevation, texture, and a less fatiguing contrast profile. Keep the semantic meaning of colors stable across themes, but shift tone values so brand, success, warning, and danger colors stay expressive without vibrating against dark backgrounds.

Design tokens
Use semantic tokens instead of hard-coded colors so the same component can swap themes without rewriting styles.

Color tokens
Token	Light	Dark	Usage
bg.app	#F7F8FA	#111315	App/page background
bg.surface	#FFFFFF	#181B1F	Cards, panels, sheets
bg.surfaceAlt	#F1F3F6	#20242A	Nested panels, sidebars
bg.elevated	#FFFFFF	#242932	Menus, popovers, modals
bg.brandSoft	#EAF2FF	#13233D	Selected nav, info banners
border.subtle	#E5E7EB	#2E3440	Dividers, input borders
border.strong	#CBD5E1	#4B5563	Active containers
text.primary	#111827	#F3F4F6	Main copy
text.secondary	#4B5563	#C7CED8	Secondary copy
text.tertiary	#6B7280	#9AA4B2	Metadata, hints
text.inverse	#FFFFFF	#0F1115	Text on bright fills
brand.primary	#2563EB	#7AA2FF	Primary actions, links
brand.hover	#1D4ED8	#93B4FF	Hover state
success	#15803D	#4ADE80	Success states
warning	#B45309	#FBBF24	Warning states
danger	#B91C1C	#F87171	Error/destructive states
info	#0369A1	#38BDF8	Informational states
focus.ring	#3B82F6	#93C5FD	Keyboard focus outline
overlay.scrim	rgba(17,24,39,.52)	rgba(0,0,0,.64)	Modal/backdrop
shadow.color	rgba(15,23,42,.14)	rgba(0,0,0,.36)	Elevation shadow
Typography, spacing, and shape
Token	Value	Notes
font.family	Inter, ui-sans-serif, system-ui, sans-serif	Neutral, dense UI
font.size.xs	12px	Labels, metadata
font.size.sm	14px	Inputs, compact UI
font.size.md	16px	Default body
font.size.lg	20px	Section titles
font.size.xl	28px	Page titles
line.body	1.5	Reading comfort
line.ui	1.25	Buttons, tabs
radius.sm	8px	Inputs, chips
radius.md	12px	Cards, buttons
radius.lg	16px	Modals, larger panels
space.base	4px scale	Use 4/8/12/16/24/32
stroke.base	1px	Borders/dividers
shadow.1	0 1px 2px var(--shadow.color)	Low elevation
shadow.2	0 8px 24px var(--shadow.color)	Menus, sticky bars
Components
Every component should map to semantic tokens, not raw hex values. Keep interaction states identical across themes so users do not relearn behavior when switching modes.

Component	Light mode	Dark mode	Rules
Primary button	brand.primary bg, text.inverse text	brand.primary bg, text.inverse text	Hover = brand.hover; disabled uses 40% opacity plus no shadow
Secondary button	bg.surface, border.subtle, text.primary	bg.surfaceAlt, border.strong, text.primary	Keep border visible in both themes
Destructive button	danger bg, white text	danger bg, near-black text if needed for contrast	Reserve for irreversible actions
Inputs	bg.surface, border.subtle	bg.surfaceAlt, border.strong	Placeholder always uses text.tertiary
Input focus	Border + focus.ring outer ring	Border + focus.ring outer ring	Ring should be 2px outside stroke
Cards	bg.surface, subtle shadow	bg.surface, no heavy shadow, clearer border	Dark mode should rely more on borders than shadows
Navbar/sidebar	bg.surfaceAlt	bg.surfaceAlt	Active item uses bg.brandSoft
Tables	White row bg, subtle zebra optional	Surface row bg, 1px dividers	Use row hover tint, not only text color
Tabs	Neutral text, active underline/fill	Neutral text, active underline/fill	Selected state must be obvious without color alone
Alerts	Soft tinted bg + strong icon/text	Dark tinted bg + bright icon/text	Pair color with icon and label
Modals	bg.elevated, scrim overlay	bg.elevated, stronger scrim overlay	Keep close button and title high contrast
Links	brand.primary	brand.primary lighter tone	Always add underline on hover/focus
Charts	Light grid #E5E7EB	Dark grid #374151	Avoid relying on hue alone; use labels/tooltips
State colors
State	Light	Dark	Notes
Hover fill	rgba(37,99,235,.08)	rgba(122,162,255,.14)	Use on list rows, tabs, chips
Active fill	rgba(37,99,235,.14)	rgba(122,162,255,.22)	Stronger than hover
Selected fill	#DBEAFE	#1B335C	Persist selection
Disabled bg	#F3F4F6	#1A1D22	Combine with reduced emphasis
Disabled text	#9CA3AF	#6B7280	Still legible
Error bg	#FEF2F2	#3A1717	Pair with icon and message
Success bg	#ECFDF5	#14281A	Pair with icon and message
Accessibility rules
WCAG AA requires at least 4.5:1 contrast for normal text and 3:1 for large text, and that requirement applies in both light and dark themes. Non-text UI elements such as buttons, input outlines, icons, and focus indicators should also meet at least 3:1 contrast against adjacent colors.

Use visible focus styles in both themes, and do not assume that offering a dark-mode toggle fixes accessibility problems in the default interface. Test every theme for text, borders, icons, disabled states, charts, and imagery, because Apple and Material both emphasize validating custom elements across both appearances.

Accessibility checklist
Text: all body text targets AA minimum.

Focus: 2px ring plus shape change where possible.

Color meaning: never use color alone; add icon, label, underline, or border style.

Motion: reduce non-essential animation and respect reduced-motion settings.

Images: provide alternate assets when illustrations disappear or glow too strongly in dark mode.

Charts: use labels, patterns, markers, or direct annotations for series differentiation.

Implementation spec
The safest implementation model is semantic CSS variables with a theme attribute on html or body, while leaning on system colors where platform components support them. Keep one component library and swap tokens only; avoid maintaining separate light and dark components unless the layout genuinely changes.

css
:root,
[data-theme="light"] {
  --bg-app: #F7F8FA;
  --bg-surface: #FFFFFF;
  --bg-surface-alt: #F1F3F6;
  --bg-elevated: #FFFFFF;
  --bg-brand-soft: #EAF2FF;

  --border-subtle: #E5E7EB;
  --border-strong: #CBD5E1;

  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #6B7280;
  --text-inverse: #FFFFFF;

  --brand-primary: #2563EB;
  --brand-hover: #1D4ED8;
  --success: #15803D;
  --warning: #B45309;
  --danger: #B91C1C;
  --info: #0369A1;
  --focus-ring: #3B82F6;

  --overlay-scrim: rgba(17, 24, 39, 0.52);
  --shadow-color: rgba(15, 23, 42, 0.14);
}

[data-theme="dark"] {
  --bg-app: #111315;
  --bg-surface: #181B1F;
  --bg-surface-alt: #20242A;
  --bg-elevated: #242932;
  --bg-brand-soft: #13233D;

  --border-subtle: #2E3440;
  --border-strong: #4B5563;

  --text-primary: #F3F4F6;
  --text-secondary: #C7CED8;
  --text-tertiary: #9AA4B2;
  --text-inverse: #0F1115;

  --brand-primary: #7AA2FF;
  --brand-hover: #93B4FF;
  --success: #4ADE80;
  --warning: #FBBF24;
  --danger: #F87171;
  --info: #38BDF8;
  --focus-ring: #93C5FD;

  --overlay-scrim: rgba(0, 0, 0, 0.64);
  --shadow-color: rgba(0, 0, 0, 0.36);
}
