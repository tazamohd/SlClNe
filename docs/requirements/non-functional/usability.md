# Usability — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-USB-005                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Usability                                |

## 1. Overview

This document defines the usability requirements for SALIS AUTO, covering responsive design, dual-layout rendering, RTL-first design principles, theme management, component library consistency, and Saudi-specific UX patterns. The platform serves workshop staff across desktops, tablets, and mobile devices in both English and Arabic.

## 2. Responsive Design

### 2.1 Primary Breakpoint

The platform uses a single primary breakpoint at **860px**:

```css
@media (max-width: 860px) { /* mobile layout */ }
```

Defined in `app/src/lib/useMediaQuery.ts` as `MOBILE_QUERY = '(max-width: 860px)'`.

### 2.2 Layout Behavior

| Viewport         | Layout                                         |
|------------------|-------------------------------------------------|
| > 860px (desktop)| Sidebar navigation + full DataTable             |
| <= 860px (mobile)| Bottom drawer navigation + stacked MobileCard   |

### 2.3 Shell Components

| Component     | Desktop              | Mobile (<=860px)                      |
|---------------|----------------------|---------------------------------------|
| AppShell      | Fixed sidebar + main | Overlay drawer sidebar                |
| Topbar        | Full top bar         | MobileHeader (compact)                |
| Sidebar       | Always visible       | Toggled overlay drawer                |
| DataTable     | Full table           | MobileCard stacked list               |
| PublicShell   | Centered nav         | Hamburger menu                        |

## 3. Dual-Layout Rendering

### 3.1 DataTable Component

The `DataTable` component renders two genuinely different layouts, not a narrowed table:

**Desktop (>860px):**
- Bordered HTML table with column headers
- Sortable columns with click-to-sort headers
- Hover state on rows with cursor pointer
- Footer with pagination controls

**Mobile (<=860px):**
- `MobileCard` stacked list via `MobileList` wrapper
- Each row renders as a card with configurable content
- Cards are keyboard-accessible (`tabIndex={0}`, Enter/Space handlers)
- No horizontal scrolling

### 3.2 Mobile Card Configuration

Each screen provides a `mobileCard` render function to the `DataTable`, describing how a row should appear as a card. Without `mobileCard`, the table falls back to horizontal scrolling (not the designed experience).

### 3.3 Column Definition

```typescript
interface Column<TRow> {
  header: string        // English source, translated at render
  cell: (row: TRow) => ReactNode  // Cell content
  code?: boolean        // Pins cell LTR + monospace for IDs, plates, SKUs
  className?: string
}
```

The `code` flag is critical for RTL layouts — it prevents Arabic character reordering on Latin-only content like vehicle plates, SKU codes, and VINs.

## 4. RTL-First Design

### 4.1 CSS Logical Properties

All layout CSS uses logical properties instead of physical:

| Physical (Avoid) | Logical (Use)            | Direction Behavior      |
|-------------------|--------------------------|-------------------------|
| `margin-left`     | `margin-inline-start`    | Left in LTR, right in RTL |
| `margin-right`    | `margin-inline-end`      | Right in LTR, left in RTL |
| `padding-left`    | `padding-inline-start`   | Follows direction       |
| `text-align: left`| `text-align: start`      | Follows direction       |
| `float: right`    | `float: inline-end`      | Follows direction       |
| `border-left`     | `border-inline-start`    | Follows direction       |

### 4.2 Direction Toggle

- `dir="rtl"` attribute set on the root element when Arabic is selected
- `dir="ltr"` for English
- All components inherit direction from the document root
- Mixed-content elements (e.g., English brand names in Arabic context) use inline `dir` overrides

### 4.3 Icon Mirroring

Directional icons (arrows, chevrons, back buttons) are mirrored in RTL mode using CSS `transform: scaleX(-1)` or logical direction-aware icon selection.

## 5. Theme Management

### 5.1 Dark Mode Default

The platform defaults to dark mode, matching the automotive industry preference and the original design system.

### 5.2 Theme Toggle

- Toggle component (`Toggle` with `role="radiogroup"`) switches between light and dark
- System preference detection via `prefers-color-scheme` media query
- User preference persisted locally

### 5.3 Theme Implementation

- CSS custom properties (variables) define all theme colors
- Component backgrounds, text colors, and borders all reference theme tokens
- Both themes tested for WCAG AA contrast compliance

## 6. Component Library

### 6.1 Button Variants

The `Button` component provides consistent action patterns:

| Variant   | Usage                                         |
|-----------|-----------------------------------------------|
| primary   | Primary actions (Save, Create, Submit)        |
| secondary | Secondary actions (Cancel, Back)              |
| ghost     | Tertiary actions, inline links                |
| danger    | Destructive actions (Delete, Revoke)          |

### 6.2 Card and Panel Patterns

| Component | Usage                                         |
|-----------|-----------------------------------------------|
| Card      | Content container with optional header/footer |
| KpiCard   | Metric display with label, value, and trend   |
| MobileCard| Card layout for mobile DataTable rows         |

### 6.3 Form Components

| Component | Description                                   |
|-----------|-----------------------------------------------|
| Input     | Text input with label, error, and helper text |
| Select    | Dropdown selection                            |
| Textarea  | Multi-line text input                         |
| Form      | Form wrapper with validation state            |
| Toggle    | Boolean or multi-option toggle                |

### 6.4 Feedback Components

| Component     | Usage                                      |
|---------------|--------------------------------------------|
| Toast         | Temporary success/error notifications      |
| Alert         | Persistent warning/info banners            |
| Modal         | Confirmation dialogs and forms             |
| Drawer        | Slide-out detail panels                    |
| EmptyState    | No-data state with icon and message        |
| Skeleton      | Loading placeholder content                |
| ErrorBoundary | React error boundary with fallback UI      |

### 6.5 Data Display Components

| Component       | Usage                                     |
|-----------------|-------------------------------------------|
| Badge           | Status indicators (color + text)          |
| Chip            | Removable tag/filter indicators           |
| Avatar          | User/entity avatar                        |
| Timeline        | Chronological event display               |
| ActivityFeed    | Activity history                          |
| Charts          | Data visualization                        |
| CalendarView    | Date-based event display                  |
| KanbanView      | Column-based card board (lead pipeline)   |
| MapView         | Geographic visualization                  |

## 7. Progressive Disclosure

### 7.1 Information Hierarchy

- List screens show summary data; detail screens show full records
- `Popover` and `Tooltip` components provide contextual information on hover/focus
- `Drawer` component reveals additional details without full navigation
- `Tabs` component organizes related information within a detail view

### 7.2 Workflow Steps

The `WorkflowStepper` component visualizes multi-step processes:

- Current step highlighted with `aria-current="step"`
- Completed steps show check marks
- Future steps are visible but dimmed
- Steps are clickable for direct navigation (where permitted)

## 8. Saudi-Specific UX

### 8.1 Currency Display

- All amounts displayed in SAR (Saudi Riyal)
- Format: `SAR 1,234.56` (English) / `١٬٢٣٤٫٥٦ ر.س` (Arabic)
- Internal storage in halalas (integer); display divides by 100
- The `Money` component handles formatting and locale awareness

### 8.2 Arabic Names

- `name_ar` fields throughout the data model for Arabic name display
- Name display follows locale preference
- Arabic text renders correctly in RTL context

### 8.3 Phone Numbers

- Saudi phone format: `+966 5x xxx xxxx`
- Phone-based customer lookup is the primary search pattern
- `+966` prefix assumed for local numbers

### 8.4 Date Formatting

- Gregorian calendar as primary
- Date formatting follows locale (DD/MM/YYYY for Arabic, MM/DD/YYYY for English)
- Relative dates ("2 weeks ago") stored as display labels (`last_visit_label`)

### 8.5 Vehicle Registration

- Saudi license plate format supported
- Plate numbers display in LTR regardless of page direction (`code: true` on columns)
- VIN (17-character) validated and displayed in monospace

## 9. Navigation Patterns

### 9.1 Sidebar Navigation

- Module-based navigation grouped by domain
- Modules with empty RBAC grants are hidden from the sidebar
- Active module highlighted with visual indicator
- Collapsible groups for domain organization

### 9.2 Breadcrumbs and Back Navigation

- `BackLink` component provides consistent back navigation
- Breadcrumb trail on detail screens
- Browser back button supported via React Router history

### 9.3 Global Search

The `GlobalSearch` screen (gated on `dashboard` module) provides:

- Cross-entity search across customers, vehicles, job cards, invoices
- Keyboard shortcut for quick access
- Search results grouped by entity type

## 10. Cross-References

- [Accessibility](./accessibility.md) — WCAG compliance for all UI patterns
- [Localization](./localization.md) — Bilingual UI and RTL details
- [Performance](./performance.md) — Page load and navigation targets
- [Workshop Operations](../functional/workshop-operations.md) — Workshop UI workflow
- [Admin & Portals](../functional/admin-portals.md) — Portal UI requirements
