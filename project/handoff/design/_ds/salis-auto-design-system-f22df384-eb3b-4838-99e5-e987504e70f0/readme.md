# SALIS AUTO Design System

**SALIS AUTO** is an automotive ERP / Garage Management System (GMS): appointments, job cards, customers & vehicles, spare-parts inventory, invoicing, accounting, HR, and analytics for workshops — from single garages to franchise networks. Strong Saudi-market focus (Arabic RTL, Hijri dates, 15% VAT/ZATCA e-invoicing, SAR currency). Sample data uses Saudi names, phones (+966), Riyadh locations.

**Sources** (mounted codebase, read-only): `SalisAuto GMS/` — React 18 + TypeScript + Vite app in `client/src/`, shadcn/ui (Radix) + Tailwind, lucide-react icons, Recharts. Ground truth files: `client/src/index.css` (token definitions), `docs/design-system.md` + `docs/SALIS_AUTO_UIUX_DESIGN_SYSTEM.md` (brand rules), `client/src/components/ui/*` (52 shadcn-style primitives), `client/src/components/Layout.tsx` (app shell), `client/src/pages/*` (314 screens). Logo: `attached_assets/Logo_blue_orange_1760743036292.png`.

**Products in the codebase**: (1) the main GMS admin web app (desktop, sidebar shell) — recreated in `ui_kits/gms-admin/`; (2) technician mobile portal; (3) customer portal/mobile; (4) kiosk check-in; (5) platform super-admin. Only (1) is recreated so far.

## Content fundamentals

- **Voice**: professional, direct, operational. Feature-first labels ("Job Cards", "Spare Parts", "Fleet Management"). No marketing fluff inside the app.
- **Casing**: Title Case for nav items, page titles, buttons ("New Job Card", "Add Vehicle", "Quick Actions"). Sentence case for descriptions and helper text ("Enter your credentials to access your account").
- **Person**: second person, warm but brief — "Welcome back, {name}", "Don't have an account?". The brand speaks as "we" in customer-facing copy ("Thank you for choosing SALIS AUTO!").
- **Brand name**: always ALL-CAPS two words: **SALIS AUTO** (never "SalisAuto" in UI copy; code identifiers use SalisAuto).
- **Tagline**: "Integrated automotive workshop management system".
- **i18n**: every string goes through translation keys (EN/AR/DE/ES/FR/HI/ZH); Arabic RTL is a first-class mode.
- **Emoji**: used sparingly as data-badge icons in legacy screens (🔧 ⏳ ✅) but the design docs push lucide icons instead — prefer lucide, treat emoji as legacy.
- **Numbers/metrics**: JetBrains Mono, tabular feel; currency `$` or SAR; big stat numerals are font-black Montserrat.
- **Microcopy patterns**: kbd hints ("⌘K"), count badges ("3 pending"), status pills with prettified snake_case ("in_progress" → "In Progress").

## Visual foundations

- **Palette is strict**: Blue `#0A5ED7`, Bright Blue `#0BB3FF`, Deep Navy `#0B1F3B`, Action Orange `#F97316`, plus neutrals. **Forbidden: green, red, yellow, purple, pink, teal.** Blue = success/active/progress/selected; Orange = warnings/decisions/risk/critical CTA ONLY; gray/navy/silver = structure.
- **Signature motif**: the 135° blue gradient (`#0A5ED7 → #0BB3FF`) on primary buttons, active nav items, icon capsules, progress fills, and gradient text (`.text-gradient-salis`).
- **Modes**: light (page `#F8FAFC`, white cards, borders `#E2E8F0`) and dark (page `#0E1117`, cards `#151A23`, sidebar navy `#0B1F3B`, borders `#232A36`). Dark mode swaps primary to Bright Blue.
- **Backgrounds**: clean flat page color + huge soft radial gradient blobs (600–800px, blue at 5–10% opacity, blur-3xl) pinned to corners; no imagery, no patterns.
- **Cards**: white/`#151A23` surface, 1px border, `radius 0.75rem` (stat cards 1rem–1.25rem), shadow-sm; hover = lift `-2px` + blue-tinted border/glow. Never colored-left-border cards.
- **Type**: Inter (UI), **Poppins** (buttons, nav labels, form labels), **Montserrat font-black** (hero titles + big stat numerals, often gradient-clipped), JetBrains Mono (metrics/kbd). Strict scale: H1 30/700/-0.03em, H2 22/500, H3 17/500, body 14/1.5, label 12/500/+0.025em.
- **Buttons**: primary = gradient blue, hover darkens gradient + lifts 1px + blue glow; secondary/outline = 1.5–2px blue or neutral border; danger = solid orange; heights 36/44/48px, radius 0.5rem.
- **Focus**: 2px blue ring (`--ring`), ring-offset 2. Touch targets ≥44px.
- **Motion**: 200ms ease transitions; hover lift; 300ms fade-in/slide-up page entries; charts reveal left→right (clip-path, 800ms); **loading = linear progress bars and pulse skeletons — never spinners**.
- **Status pills**: rounded-full, 12px medium; subtle tone = 12% tinted bg + colored text; strong tone = solid fill + white text.
- **Icon treatment**: icons sit in tinted 10–20% capsules (`radius 0.75rem`) or gradient circles with glow; page headers pair a gradient icon tile (blur halo behind) with the H1.
- **Tables**: 12px uppercase muted headers, 14px rows, row hover = accent tint, sticky headers, pagination "Showing X–Y of Z".
- **Transparency/blur**: backdrop-blur-xl + 80–90% surface opacity on auth cards and overlays only.
- **Radii**: inputs/buttons 0.5rem, cards 0.75rem, featured cards 1rem+, pills/avatars full.
- **Charts**: Recharts; blues + gray only, orange only for warning series; gradient area fills; no gridline clutter.

## Iconography

- **System**: [lucide](https://lucide.dev) exclusively (`lucide-react` in source). ~120 icons used: Wrench, Car, Users, Calendar, Package, Receipt, FileText, BarChart3, Zap, Bell, Settings, DollarSign, TrendingUp, Shield, Truck, ClipboardList, Home, Search, Menu, X, ChevronDown/Right, Eye/EyeOff, Mail, Lock, Sparkles, Gauge, Target, Crown…
- **Stroke style**: 24×24, 2px stroke, round caps/joins. Sizes in app: 14px (nav), 16px (buttons), 20px (inputs/cards), 24–32px (page headers).
- **In this kit**: components inline the exact lucide paths they need; UI kits load lucide from CDN (`https://unpkg.com/lucide@0.462.0`) and render `<i data-lucide="name">`. No custom SVGs were drawn.
- **No icon font**; a few emoji in legacy badge helpers (see Content fundamentals).
- **Logo**: `assets/logo-blue-orange.png` — 3-D ribbon "S" in silver/blue/orange on transparent. Only raster provided (no SVG/wordmark lockup); wordmark is set in type: "SALIS AUTO" Montserrat 700+. Sidebar avatar fallback: gradient circle + initial.

## Index

- `styles.css` → `tokens/{fonts,colors,typography,spacing,effects,base}.css`
- `assets/` — logo (+ `reference/` palette & mark shots)
- `guidelines/` — specimen cards (Design System tab)
- `components/actions/` Button · `components/forms/` Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label · `components/feedback/` Badge, StatusBadge, Alert, Tooltip, Progress, LinearLoader, Skeleton, EmptyState, Toast · `components/surfaces/` Card family, StatCard, Dialog, Tabs, Accordion, Separator, Avatar · `components/data/` Table family, Pagination · `components/navigation/` PageHeader, Breadcrumb
- `ui_kits/gms-admin/` — interactive recreation: Login → Dashboard / Job Cards / Customers with sidebar shell, light/dark toggle
- `SKILL.md` — agent skill entry point

**Source component inventory** (`client/src/components/ui/`, 52 files): accordion, alert-dialog, alert, aspect-ratio, avatar, badge, brand-card, breadcrumb, button, calendar, card, carousel, chart-card, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty-state, form, hover-card, input-otp, input, label, linear-loader, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, status-badge, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip. The families above cover the brand-styled and high-traffic ones; pure-Radix behavioral wrappers (carousel, resizable, input-otp, command, menubar, drawer, hover-card, context-menu, calendar, slider, toggle-group…) are not yet recreated — flagged for iteration.

**Intentional additions**: none. StatCard/EmptyState/LinearLoader/StatusBadge/PageHeader exist in source as custom components.

**Caveats**: fonts load from Google Fonts CDN (source does the same; no font binaries in repo). Logo has no SVG/dark-mode variant. Semantic "success" is blue by brand law — don't "fix" it to green.
