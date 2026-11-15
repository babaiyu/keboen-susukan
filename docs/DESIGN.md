---
name: Sistem Manajemen Kebun Desa
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for rural agricultural operators, cooperative leads, and village garden owners managing daily plantation workflows directly in the field. The operational reality demands instant utility under bright, harsh sunlight, high-glare environments, and one-handed mobile field operation.

The aesthetic philosophy merges **Modern Functional Minimalism** with **Tactile Field Usability**:
- **Clarity over ornamentation**: Elimination of non-essential decorative visual artifacts, drop-shadow clutter, and ambiguous iconography.
- **Sunlight Readability**: Piercing typographic contrast and saturated structural cues that remain discernible through screen glare.
- **Direct Tactile Feedback**: Substantial physical hit zones, crisp surface separations, and authoritative operational statuses that eliminate ambiguity during field audits, crop logging, and harvest weighing.

## Colors

The palette is tuned specifically for high-contrast mobile displays in agrarian settings, balancing clinical operational efficiency with botanical context.

- **Primary Teal (`#0D9488`)**: The dominant brand and action color. Provides unmistakable clarity for primary CTAs, active tab states, and key navigational landmarks. For deep text contrast and focused container borders, use dark teal (`#042F2E`). For lightweight chip backgrounds and active fills, use pale teal tints derived against white.
- **Secondary Leaf Green (`#16A34A`)**: Reserved strictly for healthy crop verification, prime maturity signals, successful sync states, and completed harvest yields.
- **Tertiary Harvest Amber (`#F59E0B`)**: Designates warnings, inspection schedules, pending batch deliveries, and nutrient deficit alerts.
- **Neutral Core (`#0F172A`)**: Deep slate for maximum legibility of data text against bright canvas grounds. 
- **Surface Foundations (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`)**: Clean, clinical white cards set atop zinc-slate backdrops provide crisp, glare-resistant structure without visual fatigue. Subtle separation borders utilize `#E2E8F0`.

## Typography

The design system relies on **Plus Jakarta Sans** across all typographic touchpoints. Its open counterforms, wide apertures, and balanced x-height ensure complete readability on smudged or sun-bleached mobile screens.

- Use semibold (`600`) and bold (`700`) weights generously for quantitative metrics (kilograms harvested, plot identifiers, moisture levels).
- Avoid ultra-light weights or hairline stroke variants. Minimum running body size is locked to `14px` (`body-md`) with `16px` (`body-lg`) preferred for input values to prevent automatic viewport zoom on iOS/Android PWA shells.
- Labels on operational badges and harvest status flags utilize uppercase styling with deliberate tracking (`0.05em`) in `label-sm` and `label-md`.

## Layout & Spacing

The layout model is mobile-first, targeting PWA installations on compact handheld devices while scaling gracefully to tablets used in plantation cooperative offices.

- **Mobile Viewport (< 600px)**: Single-column vertical stream, fixed outer margins of `1rem`, and column gutters of `0.75rem`. Bottom navigation is pinned above the safe-area inset.
- **Tablet / Co-op Tablet (600px - 1024px)**: 8-column layout with `1.5rem` margins and `1rem` gutters. Splits inventory and plot mapping side-by-side.
- **Desktop / Admin Hub (> 1024px)**: 12-column layout capped at `1200px` max container width with `2rem` margins.
- **Touch Target Principle**: Interactive triggers must meet or exceed a minimum bounding box of `48px × 48px`, enforced through layout padding even when visual icons are smaller.

## Elevation & Depth

Visual hierarchy is established strictly through **low-contrast outlines** and **subtle surface tiering**, avoiding soft, low-contrast shadows that wash out under bright natural outdoor daylight.

- **Base Canvas**: Surface background `#F8FAFC`.
- **Card Surfaces**: Crisp `#FFFFFF` containers bounded by a 1px border of `#E2E8F0`.
- **Selected or Active States**: Elevated purely via a 1.5px border colored in Primary Teal (`#0D9488`) paired with a tint fill of `#F0FDFA`.
- **Floating Modals & Bottom Sheets**: Subtle functional lift using a single grounded shadow: `0 4px 16px -2px rgba(15, 23, 42, 0.08)`, framed with a crisp boundary outline (`#E2E8F0`).

## Shapes

The interface balances modern approachability with crisp utility via controlled corner radii:

- Standard cards, sheet containers, and field panels use `rounded-lg` (16px / `1rem`) for smooth handheld framing.
- Buttons, text input fields, and selectors utilize `rounded` (12px / `0.75rem`) to feel distinct, durable, and easily tappable.
- Badges, status chips, and tag pills use fully rounded pills (`rounded-xl` or `rounded-full`) to immediately differentiate categorical tags from actionable square cards.

## Components

### Buttons
- **Primary Action**: Solid `#0D9488` background, `#FFFFFF` bold text, minimum height `48px`, border radius `12px`. Hover/Active state shifts to `#0F766E`.
- **Secondary Action**: `#FFFFFF` background, 1.5px border `#E2E8F0`, `#0F172A` text.
- **Destructive/Alert Action**: Solid `#DC2626` or 1.5px border `#DC2626` with red text for clearing field logs.

### Cards & Metric Panels
- Built on a `#FFFFFF` fill with a 1px border `#E2E8F0` and `16px` border radius.
- Padding locked to `space-md` (16px) or `space-lg` (24px).
- Internal layout anchors quantitative data (e.g., "1,240 kg") at `headline-md` weight above small `label-md` descriptive subtitles.

### Crop & Status Badges
- Pill-shaped tags (`height: 28px`, `px: 10px`, `font: label-sm`).
- **Optimal / Ready to Harvest**: `#DCFCE7` fill with `#15803D` bold text.
- **Attention / Pest Alert**: `#FEF3C7` fill with `#B45309` bold text.
- **Critical / Blight Issue**: `#FEE2E2` fill with `#B91C1C` bold text.
- **Scheduled / Dormant**: `#F1F5F9` fill with `#475569` bold text.

### Input Fields & Steppers
- Minimum touch container height of `50px`.
- Crisp `#FFFFFF` surface with `#CBD5E1` border, transitioning to a distinct 2px `#0D9488` ring on focus.
- Integrated high-contrast plus/minus steppers for rapid numerical entry (e.g., crate counts, fertilizer sacks) directly in field gloves.

### Checkboxes & Toggle Switches
- Checkbox footprint of `24px × 24px` inside a padded `48px × 48px` hit target.
- Checked state uses solid `#0D9488` with a white checkmark.
- Radio indicators employ an inner 10px `#0D9488` dot centered within a `#FFFFFF` disc.

### Lists & Activity Rows
- Clean border-bottom dividers using `#F1F5F9`.
- Row items possess a minimum height of `56px` with leading status icon indicators and trailing tabular numbers or navigation chevrons.