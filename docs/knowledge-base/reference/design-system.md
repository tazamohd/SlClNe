# Design System Reference

Complete design system specification for SALIS AUTO. Originated from Claude Design handoff prototypes. Enforced across all components.

---

## Color Palette

The palette uses five brand colors. No green, red, or yellow in the system — status and priority are communicated through the brand palette and opacity variations.

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Blue | `#0A5ED7` | `--salis-blue` | Primary action, active states, links, gradients |
| Orange | `#F97316` | `--salis-orange` | Warning accents, error states, attention items |
| Light Blue | `#0BB3FF` | `--salis-light-blue` | Secondary accent, gradient endpoints, info states |
| Navy | `#0B1F3B` | `--salis-navy` | Dark backgrounds, card fills, sidebar |
| Slate | `#64748B` | `--salis-slate` | Muted text, borders, disabled states, fallback badge |

### Gradient Usage

| Gradient | From | To | Usage |
|----------|------|----|-------|
| Primary gradient | `#0A5ED7` | `#0BB3FF` | Button fills, active nav items, icon chips, avatar rings |
| Background orbs | Blue | Cyan | Page backdrop decorative blur (`PageBackdrop`) |
| Auth backdrop | Blue, Cyan, faint Orange | — | Login/register screens (`AuthBackdrop`) |

### Badge Palettes

Badge colors are looked up from generated palette maps, not hard-coded:

| Badge Type | Palette Source | Fallback |
|------------|---------------|----------|
| `StatusBadge` | `ST_BADGE` | `['rgba(100,116,139,.1)', '#64748B']` (slate) |
| `ServiceBadge` | `SVC_BADGE` | Same slate fallback |
| `PriorityBadge` | `PR_BADGE` | Same slate fallback |

Each palette entry is a `[background, textColor]` tuple.

---

## Typography

Four font families serve distinct purposes:

| Token | Purpose | Usage |
|-------|---------|-------|
| `font-ui` | Interface text | Body text, labels, descriptions, table cells |
| `font-display` | Headings | Page titles (48px gradient text), section headers |
| `font-action` | Buttons | Button labels, action text |
| `font-mono` | Amounts and codes | Money display (JetBrains Mono), IDs, plates, SKUs, OTP input |

### Type Scale

| Context | Size | Weight | Font |
|---------|------|--------|------|
| Page heading (`PageHeader`) | 48px | Bold | `font-display` |
| Section heading | 30px | Bold | `font-display` |
| List page title (`ListPageHeader`) | 30px | Bold | `font-display` |
| Card title (`CardHeader h3`) | — | Bold | `font-ui` |
| Body text | 14px | Normal | `font-ui` |
| Button label (sm) | 13px | — | `font-action` |
| Button label (lg) | 15px | — | `font-action` |
| Field label | 12px | Bold | `font-ui` |
| Subtitle (uppercase) | — | Uppercase | `font-ui` |
| Money amount | — | — | `font-mono` (JetBrains Mono) |
| Tab label (Customer App) | 10px | — | `font-ui` |

---

## Spacing Scale

Follows Tailwind's default spacing scale:

| Token | Value | Common Usage |
|-------|-------|-------------|
| `gap-4` / `p-4` | 16px | Mobile content padding |
| `gap-5` / `p-5` | 20px | Mobile content gap |
| `gap-6` / `p-6` | 24px | Desktop content padding |
| `gap-8` | 32px | Desktop content gap |
| `gap-3` | 12px | Between small elements |
| `gap-2` | 8px | Tight spacing (within cards) |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-xl` | 12px | Cards, panels, modals |
| `rounded-lg` | 8px | Buttons, inputs, badges |
| `rounded-full` | 9999px | Avatars, circular icons, pills |

---

## Shadows

| Level | Usage |
|-------|-------|
| `shadow-sm` | Cards, subtle elevation |
| `shadow` | Active navigation items, hover states |
| `shadow-lg` | Modals, drawers, elevated content |

---

## Component Inventory

### Button

4 variants, 3 sizes:

| Variant | Visual | Purpose |
|---------|--------|---------|
| `primary` | Gradient background, white text, hover lift + shadow | Main action (one per view) |
| `outline` | 1.5px blue border, transparent fill, blue text | Secondary action |
| `ghost` | Text-only, transparent until hover | Tertiary / inline action |
| `subtle` | Bordered chip, gradient fill on hover | Toolbar controls |

| Size | Height | Horizontal Padding | Font Size |
|------|--------|-------------------|-----------|
| `sm` | 32px | 12px | 13px |
| `md` | 36px | 14px | 13px |
| `lg` | 48px | 16px | 15px |

### Input

3 sizes with optional icon, trailing slot, and invalid state:

| Size | Height |
|------|--------|
| `sm` | 36px |
| `md` | 44px |
| `lg` | 48px |

- **Leading icon**: RTL-aware positioning
- **Trailing slot**: For toggles (e.g., password visibility)
- **Invalid state**: Orange border
- **Focus**: Transitions from `bg-inset` to `bg-card` with blue ring

### Badge

4 badge components:

| Component | Purpose | Color Source |
|-----------|---------|-------------|
| `Badge` | Generic status pill | Inline `background` + `color` props |
| `StatusBadge` | Job statuses | `ST_BADGE` palette lookup |
| `ServiceBadge` | Service types | `SVC_BADGE` palette lookup |
| `PriorityBadge` | Priority levels | `PR_BADGE` palette lookup |

### DataTable

Generic `DataTable<TRow>` with responsive dual-layout rendering:

| Feature | Desktop | Mobile (< 860px) |
|---------|---------|-------------------|
| Layout | `<table>` with columns | `MobileList` with `MobileCard` |
| Loading | 5 skeleton rows | 5 skeleton cards |
| Empty | Custom `empty` ReactNode | Same |
| Pagination | `TableFooter` with buttons | Same |
| Row click | `onRowClick` handler | Same via card tap |

Column interface supports `code?: boolean` for LTR-pinned monospace columns (IDs, plates, SKUs).

### Money

- Renders `SAR 12,450.75` in JetBrains Mono font
- Always LTR (even in RTL mode)
- `bare` prop drops the "SAR" prefix
- `formatSar(sar)` — Returns formatted string with 2 decimal places
- `parseSar(value)` — Parses display strings back to numbers

### Timeline

Vertical progress rail for workshop stages:
- Done steps: Gradient dot with white icon
- Pending steps: Outlined dot
- Connector lines between steps

### Chip / ChipGroup

Selectable pills for filter controls:
- **Radio mode**: `role="radio"`, `role="radiogroup"` (single selection)
- **Checkbox mode**: `role="checkbox"`, `role="group"` (multi-select)
- Selected: Blue border, background, and text
- Arrow key navigation between chips

### CodeInput

Six-box OTP / verification code entry:
- Auto-advance on digit entry
- Backspace steps back to previous box
- Arrow key navigation
- Paste distributes across all boxes
- Always LTR regardless of language setting

### FieldGrid / Panel / ReadField

Detail screen layout:
- **Panel**: Titled card section with blue icon chip
- **FieldGrid**: 1 or 2-column label/value grid
- **ReadField**: Single label/value pair
  - `code` prop: LTR-pinned monospace (for plates, VINs, phones)
  - `redacted` prop: Em-dash with "Hidden for your role" title

### Checklist

QC and delivery gate toggle lists:
- Real `<input type="checkbox">` with styled overlay
- Checked: Gradient fill
- Labels translated via `t()`
- `countChecked(items, checked)` utility

### WorkflowStepper

Horizontal stage rail:
- Stages: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery
- Done: Blue circle with check icon
- Current: Gradient circle with shadow, `aria-current="step"`
- Future: Outlined circle with step number

### Toast

Notification system:
- One toast at a time
- Position: `bottom-6 end-6 z-[100]`
- Animation: `animate-fade-up`
- Auto-dismiss: 3200ms
- Error: Orange accent; Success: Blue accent

---

## Icon System

- **Count**: 260 icons from `lucide-react`
- **Registry**: `icon-registry.ts` (generated, maps string names to components)
- **Component**: `<Icon name="wrench" size={16} strokeWidth={2} />`
- **Defaults**: `size=16`, `strokeWidth=2`
- **Unknown names**: Warn in development, render `null`
- **No network requests**: All icons are inline SVG bundled at build time

---

## RTL Considerations

Full bidirectional support for English and Arabic:

| CSS Property | LTR Equivalent | RTL Equivalent |
|-------------|----------------|----------------|
| `ps-*` (padding-inline-start) | `pl-*` | `pr-*` |
| `pe-*` (padding-inline-end) | `pr-*` | `pl-*` |
| `ms-*` (margin-inline-start) | `ml-*` | `mr-*` |
| `me-*` (margin-inline-end) | `mr-*` | `ml-*` |
| `start-*` (inset-inline-start) | `left-*` | `right-*` |
| `end-*` (inset-inline-end) | `right-*` | `left-*` |
| `text-start` | `text-left` | `text-right` |
| `text-end` | `text-right` | `text-left` |

### RTL Exceptions

Some elements are always LTR regardless of language:
- **Money** component (`Money.tsx`): Currency amounts always read left-to-right
- **CodeInput** (`CodeInput.tsx`): OTP boxes always left-to-right
- **Code columns**: Table columns with `code: true` are LTR-pinned
- **Plates, VINs, SKUs, phone numbers**: LTR via `ReadField` `code` prop

### Sidebar Chevron Direction

Collapsible nav group chevrons respect RTL:
- LTR: Points right when collapsed, down when expanded
- RTL: Points left when collapsed, down when expanded

---

## Dark Mode

- **Default theme**: Dark mode
- **Toggle mechanism**: `dark` class on `<html>` element
- **Storage**: `salis-theme` in localStorage (`dark` or `light`)
- **Toggle function**: `toggleTheme()` from `usePreferences()`
- **Tailwind usage**: All color values use `dark:` variants

### Dark Mode Palette

| Element | Light | Dark |
|---------|-------|------|
| Background | White/light gray | Navy/dark slate |
| Card | White | Dark card background |
| Text | Dark gray/black | White/light gray |
| Border | Light gray | Dark border |
| Input background | `bg-inset` (light) | `bg-inset` (dark) |
| Input focus | `bg-card` with blue ring | `bg-card` with blue ring |

---

## Responsive Breakpoints

| Breakpoint | Value | Behavior |
|------------|-------|----------|
| Mobile | < 860px | `useIsMobile()` returns `true`. Sidebar becomes overlay drawer. DataTable uses `mobileCard` renderer. |
| Desktop | >= 860px | Full sidebar + topbar layout. DataTable uses `<table>`. |

### Mobile-Specific Components

| Component | Purpose |
|-----------|---------|
| `MobileHeader` | 56px header with hamburger, avatar, theme toggle, notification bell |
| `MobileCard` | Tappable summary card replacing table rows |
| `MobileCardHeader` | Title line with optional code styling |
| `MobileCardRow` | Label/value detail line |
| `MobileList` | Vertical stack for mobile list body |
| `MobilePageHeader` | Compact page title |

All mobile cards support keyboard interaction: `role="button"`, `tabIndex={0}`, Enter/Space handlers.

---

## Shared Utilities

| Utility | Import | Purpose |
|---------|--------|---------|
| `cn()` | `@/lib/cn` | Class name merging (clsx + tailwind-merge) |
| `useIsMobile()` | `@/lib/useMediaQuery` | Mobile breakpoint detection at 860px |
| `usePreferences()` | `@/providers/PreferencesProvider` | `t()`, `rtl`, `theme`, `toggleTheme`, `toggleLanguage` |
| `useSession()` | `@/providers/SessionProvider` | `nav`, `userName`, `roleLabel`, `signOut`, `can()`, `canScreen()` |

---

## See Also

- [Screen Catalog](./screen-catalog.md) — Where components are used
- [Keyboard Shortcuts](./keyboard-shortcuts.md) — Interaction patterns
- [Glossary](./glossary.md) — Term definitions
