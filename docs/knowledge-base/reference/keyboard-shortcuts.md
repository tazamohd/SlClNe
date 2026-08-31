# Keyboard Shortcuts & Interactions

Complete reference for all keyboard interactions in SALIS AUTO. The platform follows web accessibility standards with full keyboard navigability.

---

## Global Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open Quick Actions | Available from the Topbar on any authenticated screen |
| `Tab` | Move focus forward | All interactive elements are focusable |
| `Shift+Tab` | Move focus backward | Reverse tab navigation |
| `Escape` | Close modal/drawer/overlay | Closes the topmost overlay |
| `Enter` | Activate focused element | Buttons, links, interactive cards |
| `Space` | Activate focused element | Buttons, checkboxes, toggles |

---

## Navigation

### Sidebar Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between sidebar items |
| `Enter` | Navigate to the focused screen |
| `Enter` on group header | Toggle group expansion (collapse/expand) |
| `Escape` | Close the mobile sidebar drawer |

### Mobile Drawer

| Key | Action |
|-----|--------|
| `Escape` | Close the sidebar overlay |
| Focus trap | Focus stays within the drawer when open |
| Route change | Auto-closes the drawer |

---

## DataTable Interactions

### Desktop Table

| Key | Action |
|-----|--------|
| `Tab` | Move between interactive cells and rows |
| `Enter` on row | Trigger `onRowClick` handler (navigate to detail) |

### Mobile Cards

| Key | Action |
|-----|--------|
| `Tab` | Move between cards |
| `Enter` | Activate the focused card (`role="button"`) |
| `Space` | Activate the focused card |

All `MobileCard` components have `role="button"`, `tabIndex={0}`, and keyboard event handlers for `Enter` and `Space`.

### Table Footer Pagination

| Key | Action |
|-----|--------|
| `Tab` to pagination buttons | Focus previous/next page buttons |
| `Enter` / `Space` | Activate the focused pagination button |

---

## Form Interactions

### Input Fields

| Key | Action |
|-----|--------|
| `Tab` | Move to next input field |
| `Shift+Tab` | Move to previous input field |
| Focus | Input transitions from `bg-inset` to `bg-card` with blue ring |

### CodeInput (OTP Entry)

The 6-box OTP input has specialized keyboard handling:

| Key | Action |
|-----|--------|
| `0-9` | Enter digit in current box, auto-advance to next box |
| `Backspace` | Clear current box, step back to previous box |
| `ArrowRight` | Move focus to next box |
| `ArrowLeft` | Move focus to previous box |
| `Ctrl+V` / `Cmd+V` | Paste distributes digits across all boxes (e.g., pasting "123456" fills all 6 boxes) |
| `Delete` | Clear current box |

CodeInput is always LTR regardless of the current language setting.

---

## Chip & ChipGroup Selection

### Radio Mode (Single Selection)

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowDown` | Select next chip |
| `ArrowLeft` / `ArrowUp` | Select previous chip |
| `Enter` / `Space` | Select the focused chip |
| `Tab` | Move focus to the chip group, then to the next element outside |

Chips use `role="radio"` and the group uses `role="radiogroup"` with `aria-checked`.

### Checkbox Mode (Multi-Selection)

| Key | Action |
|-----|--------|
| `Space` | Toggle the focused chip on/off |
| `ArrowRight` / `ArrowDown` | Move focus to next chip |
| `ArrowLeft` / `ArrowUp` | Move focus to previous chip |
| `Tab` | Move focus into the group, then out |

Chips use `role="checkbox"` and the group uses `role="group"`.

---

## Checklist (QC & Delivery Gates)

| Key | Action |
|-----|--------|
| `Tab` | Move between checklist items |
| `Space` | Toggle the focused checkbox (checked/unchecked) |
| `Enter` | Toggle the focused checkbox |

Checklists use real `<input type="checkbox">` elements with visually hidden native controls. Checked items show a gradient fill.

---

## WorkflowStepper

The horizontal stage rail is informational (not directly interactive), but:

| Key | Action |
|-----|--------|
| `Tab` | Focus moves through any action buttons associated with stage transitions |
| Current stage | Marked with `aria-current="step"` for screen readers |

---

## Modal & Drawer Interactions

| Key | Action |
|-----|--------|
| `Escape` | Close the modal or drawer |
| `Tab` | Cycle through focusable elements within the modal (focus trap) |
| `Shift+Tab` | Reverse focus cycle within the modal |
| `Enter` on action button | Trigger the modal's primary or secondary action |

### Focus Management

- When a modal opens, focus moves to the first focusable element inside.
- When a modal closes, focus returns to the element that triggered it.
- Background scrolling is prevented while a modal is open.

---

## Topbar Interactions

| Key | Action |
|-----|--------|
| `Tab` | Navigate between Topbar controls (search, Quick Actions, theme, notifications, chat) |
| `Cmd+K` / `Ctrl+K` | Quick Actions shortcut — opens from anywhere |
| `Enter` on search | Submit search query (navigates to `/global-search`) |
| `Enter` on theme toggle | Toggle dark/light mode |
| `Enter` on notification bell | Open notifications panel |
| `Enter` on chat button | Navigate to `/aiassistant` |

---

## Customer App (Bottom Tab Bar)

| Key | Action |
|-----|--------|
| `Tab` | Move between tab bar items |
| `Enter` / `Space` | Navigate to the tab's route |

Active tab is indicated by `text-salis-blue` color.

---

## Authentication Screens

### Login Form

| Key | Action |
|-----|--------|
| `Tab` | Move between email, password fields, and login button |
| `Enter` | Submit the login form (from any field) |
| `Tab` to "Forgot Password" | Focus the forgot password link |

### OTP Screen

Uses `CodeInput` with the specialized keyboard handling described above.

---

## Accessibility Attributes

The platform uses these ARIA attributes for keyboard and screen reader support:

| Attribute | Component | Purpose |
|-----------|-----------|---------|
| `role="button"` | MobileCard | Identifies tappable cards as interactive |
| `role="radio"` / `role="radiogroup"` | Chip / ChipGroup | Single-selection semantics |
| `role="checkbox"` / `role="group"` | Chip / ChipGroup | Multi-selection semantics |
| `role="tablist"` / `role="tab"` | TabBar | Tab navigation semantics |
| `aria-current="step"` | WorkflowStepper | Identifies the current workflow stage |
| `aria-checked` | Chip, Checklist | Selection state |
| `aria-label` | ChipGroup, navigation | Descriptive labels for groups |
| `tabIndex={0}` | MobileCard, interactive elements | Makes elements focusable |

---

## Focus Indicators

All focusable elements have visible focus indicators:

| Element | Focus Style |
|---------|-------------|
| Buttons | Blue ring outline |
| Inputs | Blue ring + background transition |
| Links | Blue ring outline |
| Cards (mobile) | Blue ring outline |
| Sidebar items | Blue ring outline |
| Checkboxes | Blue ring on the checkbox container |

Focus indicators are visible in both light and dark modes.

---

## See Also

- [Design System](./design-system.md) — Component visual reference
- [Screen Catalog](./screen-catalog.md) — Screen listing
- [FAQ](./faq.md) — Common interaction questions
