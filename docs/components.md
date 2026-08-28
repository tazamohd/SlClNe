# SALIS AUTO — Component Reference

## Design System Foundations

The design system originated from Claude Design handoff prototypes in `project/`. It enforces:

- **Color palette**: Blue (#0A5ED7), orange (#F97316), light blue (#0BB3FF), dark navy (#0B1F3B), slate (#64748B). No green, red, or yellow.
- **Typography**: `font-ui` (interface text), `font-display` (headings), `font-action` (buttons), `font-mono` (JetBrains Mono for amounts/codes).
- **RTL support**: Logical CSS properties throughout (`start-`, `end-`, `ps-`, `pe-`, `inset-inline-start`).
- **Dark mode**: Default theme. Toggles the `dark` class on `<html>`.

---

## UI Primitives

All primitives live in `app/src/components/ui/`.

### Button

**Path:** `Button.tsx`
**Props:** extends `ButtonHTMLAttributes<HTMLButtonElement>` with `variant` and `size`.

| Variant | Purpose | Style |
|---------|---------|-------|
| `primary` | Main action (one per view) | Brand gradient bg, white text, hover lift + shadow |
| `outline` | Secondary action | 1.5px blue border, transparent fill, blue text |
| `ghost` | Tertiary / inline action | Text-only, transparent until hovered |
| `subtle` | Toolbar controls | Bordered chip, fills with gradient on hover |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | 12px | 13px |
| `md` | 36px | 14px | 13px |
| `lg` | 48px | 16px | 15px |

### Card / CardHeader

**Path:** `Card.tsx`

- `Card` — `<div>` with `rounded-xl border bg-card shadow-sm`.
- `CardHeader` — Flex row with optional gradient icon chip, bold title (`<h3>`), and right-aligned action slot.

### Input

**Path:** `Input.tsx`
**Props:** extends `InputHTMLAttributes` with `icon`, `trailing`, `invalid`, `inputSize`.

| Size | Height |
|------|--------|
| `sm` | 36px |
| `md` | 44px |
| `lg` | 48px |

Features: leading icon (RTL-aware), trailing slot (e.g. password toggle), invalid state (orange border), focus state transitions from `bg-inset` to `bg-card` with blue ring.

### Badge

**Path:** `Badge.tsx`

Four badge components with color lookups from generated palettes (`app/src/data/generated/badges.ts`):

| Component | Use | Palette |
|-----------|-----|---------|
| `Badge` | Generic status pill | Inline `background` + `color` props |
| `StatusBadge` | Job statuses (pending, in_progress, completed, etc.) | `ST_BADGE` |
| `ServiceBadge` | Service types (maintenance, repair, diagnostic, etc.) | `SVC_BADGE` |
| `PriorityBadge` | Priorities (urgent, high, medium, low) | `PR_BADGE` |

Fallback color: `['rgba(100,116,139,.1)', '#64748B']` (slate).

### DataTable

**Path:** `DataTable.tsx`

Generic `DataTable<TRow>` with dual-layout rendering.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Column<TRow>[]` | Header + cell renderer per column |
| `rows` | `TRow[]` | Data rows |
| `rowKey` | `(row: TRow) => string` | Unique key extractor |
| `onRowClick` | `(row: TRow) => void` | Row click handler |
| `loading` | `boolean` | Shows 5 skeleton rows |
| `empty` | `ReactNode` | Custom empty state |
| `footer` | `ReactNode` | Footer slot |
| `mobileCard` | `(row: TRow) => ReactNode` | Mobile card renderer |

**Column interface:**

```ts
interface Column<TRow> {
  header: string       // Translated at render
  cell: (row: TRow) => ReactNode
  code?: boolean       // LTR pinned, monospace (IDs, plates, SKUs)
  className?: string
}
```

On mobile (below 860px), if `mobileCard` is provided, the table renders as `MobileList` with `MobileCard` components instead of `<table>`.

Sub-components: `EmptyState`, `TableFooter` (pagination summary + buttons), `SkeletonRows`.

### Icon

**Path:** `Icon.tsx`
**Registry:** `icon-registry.ts` (generated, 260 icons from `lucide-react`)

Looks up icons by string name from the `ICONS` registry. Defaults: `size=16`, `strokeWidth=2`. Unknown names warn in dev and render `null`.

### Toast

**Path:** `Toast.tsx`

One-at-a-time toast notification system. Renders at `bottom-6 end-6 z-[100]` with `animate-fade-up`. Auto-dismisses after 3200ms.

- `ToastProvider` — Context provider, wraps the app
- `useToast()` — Returns `{ show(toast, duration?), dismiss() }`
- Error toasts: orange accent. Success toasts: blue accent.

### Money

**Path:** `Money.tsx`

Currency display for Saudi Riyals.

- `Money` component — Renders `SAR 12,450.75` in JetBrains Mono, always LTR. `bare` prop drops the "SAR" prefix.
- `formatSar(sar)` — Returns formatted string with 2 decimal places.
- `parseSar(value)` — Parses display strings back to numbers.

### Timeline

**Path:** `Timeline.tsx`

Vertical progress rail for workshop stages.

- `TimelineStep` — `{ icon, label, time?, done }`
- Done steps: gradient dot with white icon. Pending steps: outlined dot. Connector lines between steps.

### Chip / ChipGroup

**Path:** `Chip.tsx`

Selectable pills for single-choice (radio) or multi-select (checkbox) controls.

- `Chip` — `<button>` with `role="radio"` or `role="checkbox"`, `aria-checked`. Selected: blue border/bg/text.
- `ChipGroup` — Wrapper with `role="radiogroup"` or `role="group"`, `aria-label`.

### CodeInput

**Path:** `CodeInput.tsx`

Six-box OTP / verification code entry. Features: auto-advance on digit entry, backspace steps back, arrow key navigation, paste distribution across boxes. Always LTR.

### FieldGrid / Panel / ReadField

**Path:** `FieldGrid.tsx`

Detail screen layout primitives.

- `Panel` — Titled card section with blue icon chip. Used for "Customer Info", "Vehicle Info", etc.
- `FieldGrid` — 1 or 2-column label/value grid inside a Panel.
- `ReadField` — Single label/value pair. `code` prop pins LTR (plates, VINs, phones). `redacted` renders em-dash with "Hidden for your role" title (RBAC field-level visibility).

### Checklist

**Path:** `Checklist.tsx`

Tick-list for QC and delivery gates. Real `<input type="checkbox">` with visually hidden native control. Checked: gradient fill. Labels translated via `t()`.

- `countChecked(items, checked)` — Utility returning count of ticked items.

### WorkflowStepper

**Path:** `WorkflowStepper.tsx`

Horizontal stage rail for the workshop flow.

**Stages:** `Check-In → Inspection → Estimate → Repair → Quality Check → Delivery`

Done stages: blue circle with check. Current stage: gradient circle with shadow. Future stages: outlined with number. Uses `aria-current="step"`.

---

## Shell Components

All shells live in `app/src/components/shell/`.

### AppShell

**Path:** `AppShell.tsx`

The primary shell wrapping every operational screen.

- Desktop: `Sidebar` + `Topbar` side-by-side, full `h-screen` flex layout.
- Mobile (below 860px): Sidebar becomes overlay drawer with backdrop (`bg-black/50`), animated slide. `MobileHeader` replaces `Topbar`.
- Drawer auto-closes on route change.
- Main content: `overflow-auto`, `animate-fade-up`, padded (`gap-8 p-6` desktop, `gap-5 p-4` mobile).
- `PageBackdrop` — Two faint brand orbs (blue top-end, cyan bottom-start) with `blur-[64px]`.
- `PageHeader` — Gradient icon tile, gradient-text heading (48px), subtitle, right-aligned actions.

### Sidebar

**Path:** `Sidebar.tsx`

Role-filtered navigation.

- User card: gradient avatar circle, username, role badge (blue chip), "PRO" badge.
- Nav groups from `useSession().nav`: collapsible sections with chevron. Groups start expanded. Chevron direction respects RTL.
- Active item: `bg-salis-gradient-r text-white shadow`. Uses `NavLink` from react-router-dom.
- Bottom: Language toggle (English/عربي) and logout link (orange text).

### Topbar

**Path:** `Topbar.tsx`

56px desktop header. Contains: search input (260px, navigates to `/global-search`), Quick Actions (`Cmd+K`), theme toggle, notifications bell (orange unread dot), chat button (navigates to `/aiassistant`).

### ListPage

**Path:** `ListPage.tsx`

- `ListPageHeader` — Header for list/registry screens. Quieter than `PageHeader`. Props: `title` (30px), `subtitle` (uppercase module name), `search` (inline filter 220px), `actions`.

### FeatureScreen

**Path:** `FeatureScreen.tsx`

Data-driven screen shell rendering ~155 feature definitions without custom designs.

- `FeatureHeader` — Icon tile + title + subtitle. Responsive sizing.
- `TabBar` — Pill tab bar in a Card. Active: gradient fill, white text. Uses `role="tablist"`.
- `StatRow` / `StatCard` — Responsive grid of KPI metric cards. Highlighted cards get gradient bg. Tones: `warning` (orange), `info` (blue).
- `Section` — Titled content panel with optional subtitle and toolbar.
- `SearchField` — Inline search with icon.
- `ScopeSelect` — Branch/garage picker select.

### MobileShell

**Path:** `MobileShell.tsx`

Mobile-specific components:

| Component | Purpose |
|-----------|---------|
| `MobileHeader` | 56px header with hamburger, avatar, theme toggle, notification bell |
| `MobileCard` | Tappable summary card replacing desktop table rows |
| `MobileCardHeader` | Title line with optional code styling |
| `MobileCardRow` | Label/value detail line |
| `MobileList` | Vertical stack for mobile list body |
| `MobilePageHeader` | Compact page title for mobile |

All interactive mobile cards are keyboard-accessible (`role="button"`, `tabIndex={0}`, Enter/Space handlers).

### CustomerAppShell

**Path:** `CustomerAppShell.tsx`

Phone app frame for customer-facing screens. No sidebar, no RBAC nav.

- 430px max-width frame, centered on desktop.
- Header: Logo (Wrench icon in gradient square), "SALIS AUTO", theme toggle, notification bell.
- Bottom tab bar (5 tabs):

| Tab | Route | Icon |
|-----|-------|------|
| Home | `/customer-app/home` | Home |
| Garage | `/customer-app/garage` | Car |
| Bookings | `/customer-app/appointments` | Calendar |
| Tracking | `/customer-app/service-tracking` | Radio |
| Profile | `/customer-app/profile` | User |

Active tab: `text-salis-blue`. Labels at 10px.

Sub-components:
- `AppHeroCard` — Gradient hero card for active-service and wallet-balance blocks.
- `AppListRow` — List row with configurable icon chip.
- `AppSection` — Section heading with optional action.

### AuthCard / AuthLayout

**Path:** `AuthCard.tsx`, `AuthLayout.tsx`

Authentication screen frame.

- `AuthLayout` — Full-viewport centered layout with `AuthBackdrop` (three blurred brand orbs: blue, cyan, faint orange) and optional `AuthControls` (language + theme toggles pinned top-right).
- `AuthCard` — Bordered card with optional logo (`/assets/logo-blue-orange.png`, 120px) or icon chip, title, description, children, footer.
- `Field` — Form field label + input wrapper. Label at 12px bold.
- `BrandMark` — Logo image with blurred gradient halo.

---

## Shared Dependencies

All components rely on:

| Dependency | Import | Purpose |
|------------|--------|---------|
| `cn()` | `@/lib/cn` | Class name merging (clsx + tailwind-merge) |
| `useIsMobile()` | `@/lib/useMediaQuery` | Breakpoint at 860px |
| `usePreferences()` | `@/providers/PreferencesProvider` | `t()` translator, `rtl`, `theme`, `toggleTheme`, `toggleLanguage` |
| `useSession()` | `@/providers/SessionProvider` | `nav`, `userName`, `roleLabel`, `signOut`, `can()`, `canScreen()` |
| `Icon` | `@/components/ui/Icon` | Data-driven icon rendering from 260-icon registry |
| `NavLink` | `react-router-dom` | Active-state navigation links |
