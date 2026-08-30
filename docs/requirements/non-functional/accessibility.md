# Accessibility — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-A11Y-004                             |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Accessibility                            |

## 1. Overview

This document defines the accessibility requirements for SALIS AUTO, targeting WCAG 2.1 Level AA conformance. The platform must be usable by people with visual, motor, and cognitive disabilities, across both English LTR and Arabic RTL layouts, in light and dark themes.

## 2. Conformance Target

### 2.1 Standard

WCAG 2.1 Level AA across all user-facing screens, with Level AAA as a stretch goal for critical workflows (check-in, payment, delivery).

### 2.2 Scope

All 191+ screens including:

- Workshop operations (job cards, inspections, estimates, QC, delivery)
- Administrative interfaces (user management, settings, audit)
- Self-service portals (customer app, technician, supplier, procurement)
- Kiosk check-in screen
- Authentication screens (login, register, password reset)

## 3. ARIA Patterns

### 3.1 Implemented ARIA Roles and Properties

The component library implements the following ARIA patterns:

| Component         | ARIA Pattern                              | Usage                          |
|-------------------|-------------------------------------------|--------------------------------|
| Tabs              | `role="tablist"`, `role="tab"`, `role="tabpanel"` | Module sub-navigation   |
| WorkflowStepper   | `aria-current="step"`                     | Job card lifecycle stepper     |
| Toggle            | `role="radiogroup"`, `aria-checked`       | Theme toggle, view switchers   |
| DataTable         | `role="table"` with proper row/cell roles | All list screens               |
| Modal             | `role="dialog"`, `aria-modal="true"`      | Create/edit dialogs            |
| Drawer            | `role="dialog"` with focus trap           | Mobile sidebar, detail panels  |
| Alert             | `role="alert"`, `aria-live="polite"`      | Notifications and errors       |
| Toast             | `role="status"`, `aria-live="polite"`     | Success/error feedback         |
| Search            | `role="searchbox"`                        | Global search, list search     |
| Pagination        | `aria-label="Pagination"`, `aria-current="page"` | All paginated lists |

### 3.2 Live Regions

- `aria-live="polite"` on Toast and Alert components for non-critical updates
- `aria-live="assertive"` for error states requiring immediate attention
- Status messages (loading, saving, success) announced via live regions

## 4. Keyboard Navigation

### 4.1 General Requirements

- All interactive elements are focusable via Tab key
- Focus order follows visual reading order (start-to-end in both LTR and RTL)
- Focus is never trapped in a non-modal context
- Skip links provided for main content navigation

### 4.2 Component-Specific Keyboard Support

| Component     | Keys                    | Behavior                            |
|---------------|-------------------------|-------------------------------------|
| DataTable     | Tab, Arrow keys         | Navigate between rows and cells     |
| MobileCard    | Enter, Space            | Activate card (click handler)       |
| Tabs          | Arrow Left/Right        | Switch between tabs                 |
| Modal         | Escape                  | Close modal                         |
| Drawer        | Escape                  | Close drawer                        |
| Dropdown      | Arrow Up/Down, Enter    | Navigate and select options         |
| Pagination    | Tab, Enter              | Navigate between pages              |
| KanbanView    | Arrow keys              | Navigate between columns and cards  |
| CalendarView  | Arrow keys              | Navigate between dates              |

### 4.3 Mobile Card Accessibility

The `DataTable` component's mobile card layout (below 860px breakpoint) renders interactive cards with:

- `tabIndex={0}` for keyboard reachability
- `onKeyDown` handler responding to Enter and Space
- `role="button"` when `onRowClick` is provided
- Full card clickable area instead of just the text

This addresses the original design's accessibility gap where `<tr>` click handlers made lists unusable without a mouse.

## 5. Screen Reader Support

### 5.1 Semantic Structure

- Proper heading hierarchy (h1-h6) maintained per page
- `PageHeader` component renders the page title as an h1
- Landmark regions: `<main>`, `<nav>`, `<aside>` for sidebar
- Form labels associated with inputs via `htmlFor`/`id` pairing

### 5.2 Data Table Announcements

- Column headers associated with cells for screen reader context
- Sort state announced via `aria-sort` attribute
- Empty state uses `EmptyState` component with descriptive text
- Loading state uses `Skeleton` components with `aria-busy="true"`

### 5.3 Status and Feedback

- Badge components use `aria-label` for status meaning (not just color)
- KPI cards include `aria-label` describing the metric and value
- Chart components provide text alternatives via `<desc>` or `aria-label`

### 5.4 Bilingual Screen Reader Support

- `lang` attribute set correctly on the `<html>` element (en/ar)
- Mixed-language content uses `lang` attributes on inline elements
- Arabic text direction announced correctly via `dir="rtl"`

## 6. Color and Contrast

### 6.1 Contrast Requirements

| Element Type        | Minimum Ratio | Standard                |
|---------------------|---------------|-------------------------|
| Normal text         | 4.5:1         | WCAG AA                 |
| Large text (18pt+)  | 3:1           | WCAG AA                 |
| UI components       | 3:1           | WCAG 2.1 Level AA       |
| Focus indicators    | 3:1           | WCAG 2.1 Level AA       |

### 6.2 Color Independence

- Status indicators use icons and text labels in addition to color
- Badge component uses both background color and text label
- Chart data points are distinguishable by shape in addition to color
- Error states use both color (red) and icon (exclamation) indicators

### 6.3 Theme Support

Both light and dark themes must meet contrast requirements:

- Dark mode is the default theme
- Light mode available via theme toggle
- System preference detection via `prefers-color-scheme`
- All custom component colors tested in both themes

## 7. Focus Management

### 7.1 Focus Trapping

- Modal dialogs trap focus within the dialog
- Drawer components trap focus when open
- Focus returns to the trigger element when a modal/drawer closes

### 7.2 Focus Visibility

- Custom focus indicators using `outline` (not `box-shadow` which is clipped)
- Focus visible in both light and dark themes
- Minimum 2px focus outline width
- Focus indicators use high-contrast colors

### 7.3 Route Navigation

- Focus moves to the page heading when navigating between routes
- Screen reader announces the new page title
- Scroll position resets to top on route change

## 8. Form Accessibility

### 8.1 Form Controls

- All inputs have associated `<label>` elements
- Required fields marked with `required` attribute and visual indicator
- Error messages associated with fields via `aria-describedby`
- Form groups use `<fieldset>` and `<legend>` where appropriate

### 8.2 Validation Feedback

- Inline validation errors displayed below the field
- `aria-invalid="true"` set on fields with errors
- Error summary announced via live region on form submission
- Error messages are descriptive (not just "invalid")

## 9. Responsive Accessibility

### 9.1 Mobile Considerations

- Touch targets minimum 44x44 CSS pixels
- Sufficient spacing between interactive elements
- Pinch-to-zoom not disabled (`user-scalable=yes`)
- Content reflows without horizontal scrolling at 320px width

### 9.2 RTL Accessibility

- Tab order follows visual order in RTL layout
- ARIA patterns work correctly in RTL context
- `dir="rtl"` attribute propagated to all relevant elements
- Focus indicators follow logical (not physical) direction

## 10. Testing Requirements

### 10.1 Automated Testing

- axe-core integration for automated WCAG checks
- Component-level accessibility tests in test suite
- CI pipeline includes accessibility audit

### 10.2 Manual Testing

- Screen reader testing with NVDA (Windows), VoiceOver (macOS/iOS)
- Keyboard-only navigation testing for all workflows
- Color contrast verification in both themes

## 11. Cross-References

- [Usability](./usability.md) — Responsive design and RTL layout
- [Localization](./localization.md) — Bilingual content and RTL support
- [Admin & Portals](../functional/admin-portals.md) — Portal accessibility requirements
- [Workshop Operations](../functional/workshop-operations.md) — Critical workflow accessibility
