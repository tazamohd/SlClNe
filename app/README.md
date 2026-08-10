# SALIS AUTO — application

Production rebuild of the Claude Design handoff in `../project`. React 18 +
Vite + TypeScript + Tailwind, per `../project/handoff/README.md` §2.

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck
npm run build
npm run smoke        # needs `npx vite preview --port 4173` running
```

## How this maps to the design bundle

The design ships 304 `.dc.html` prototypes (191 desktop + 113 mobile). Each one
inlines its own sidebar, its own theme/language toggles and its own copy of the
data layer. This app collapses that into shared infrastructure and rebuilds the
screens against it.

| Design bundle | Here |
|---|---|
| `gms-data.js` (NAV, AR, ROLES, PERMS, mock tables) | `src/data/generated/*` — regenerate with `npm run port-design` |
| `_ds/.../tokens/*.css` | `src/styles/tokens/*` (copied verbatim) + `tailwind.config.js` |
| `salis-icon.js` web component | `src/components/ui/Icon.tsx` + generated `icon-registry.ts` |
| Per-screen sidebar + topbar markup | `src/components/shell/AppShell.tsx` |
| Per-screen `localStorage` theme/lang reads | `src/providers/PreferencesProvider.tsx` |
| `currentRole()` / `can()` / `navFor()` | `src/data/rbac.ts` + `src/providers/SessionProvider.tsx` |
| `<a href="Foo.dc.html">` navigation | `src/routes/index.tsx`, routes from `SCREEN_MAP.md` |

### Regenerating from the design

`npm run port-design` re-reads `../project` and rewrites everything under
`src/data/generated/` plus the icon registry. Hand-written files — `types.ts`,
`rbac.ts`, `repository.ts`, every screen — are never touched. Run it whenever a
refreshed design bundle lands.

## Architecture

- **`src/data/`** — generated tables and RBAC matrix, hand-written domain types,
  and `repository.ts`, the seam screens read through. Swapping `mockRepository`
  for an HTTP client per `API_ENDPOINTS.md` is a one-line change; no screen moves.
- **`src/providers/`** — `PreferencesProvider` (theme, language, RTL,
  notifications) and `SessionProvider` (signed-in role, permission helpers).
- **`src/components/shell/`** — `AppShell` for operational screens,
  `AuthLayout` for the unauthenticated chain.
- **`src/routes/`** — one route per entry in `SCREEN_MAP.md`, guarded by
  `RequireAccess`. Screens not yet rebuilt render `PendingScreen`, so the nav
  never dead-ends mid-port.

## Conventions

Carried over from `handoff/README.md` §7 — these are not style preferences:

- **Never** green, red, yellow, purple, pink or teal. Blue is
  success/active/progress; orange is warnings and critical CTAs only.
- **Never** `left`/`right` in CSS — use `start`/`end` logical utilities, so RTL
  works without a second stylesheet.
- Latin content inside Arabic text (plates, SKUs, invoice ids, VINs) must carry
  `dir="ltr"` or the bidi algorithm reorders the digits.
- Currency is SAR with comma thousands and 2 decimals, in `font-mono`.
- Icons are lucide only, 24×24, 2px stroke, round caps and joins.
- `fadeUp` animates transform only, never opacity — animating opacity risked
  invisible content on throttled tabs.

## Deliberate departures from the prototypes

- **Theme and language actually persist.** Every prototype computed
  `this.props.theme ?? localStorage.getItem(...)`; because the prop always
  resolved to that file's own default, the stored value was never read, and each
  `<a href>` full page load discarded the toggle anyway.
- **Logout routes through `LogoutConfirmation`.** The prototypes linked sidebar
  Logout straight to Login, orphaning the confirmation screen.
- **`localStorage` access is wrapped** (`src/lib/storage.ts`) — bare access
  throws in Safari private mode and took the whole screen down.
- **The lockout countdown on `AccountLocked` is live** rather than a static
  string that claims 15 minutes however long you wait.
- **Code entry handles focus and paste.** The prototypes rendered six loose
  inputs with no focus management, so you had to click each box and couldn't
  paste a code — which is how codes actually arrive.
- **`ResetPassword` says why it rejected you.** The prototype silently did
  nothing when the two fields disagreed.
- **OTP resend is throttled to 60s**, per README §6b, instead of an `href="#"`.
- **Segregation of duties is enforced, not just documented.** "Perform repair"
  and "Pass quality check" are a high-risk pair in the SOD table, so a
  technician cannot approve QC on `WorkshopQC` — the design let anyone through.
- **Estimate totals are computed from the line items** rather than hardcoded,
  so an edited line can't leave the footer disagreeing with the table. The
  design's figures (1,345 / 201.75 / 1,546.75) fall out of the arithmetic.
- **The estimate says up front when it exceeds your approval limit**, instead
  of letting you find out by pressing Approve.
- **Checklists and stage gates refuse to submit half-complete.** An inspection
  that recorded nothing is worse than none — the estimate is built on it.
- **`WorkshopSignature` captures a real signature** on a canvas; the design
  showed a "tap to sign" placeholder.
- **Table rows are keyboard-reachable.** The prototypes put the click handler
  on `<tr>`, so every list was mouse-only.
- **`InvoiceCreate` actually creates.** Its "Add Line" button was decorative and
  its totals were fixed strings, so it could only ever produce the one invoice
  it was mocked with. Lines are now editable and removable, and the summary
  recomputes.
- **`Payments` derives its headline figures.** See below — this one is a
  behaviour change worth knowing about.

### One number that changed

`Payments.dc.html` shows **SAR 8,090** outstanding and **SAR 61,420** collected.
The five invoices it renders directly underneath total **9,065** unpaid and
**1,005** paid. Those headlines were hardcoded and never reconciled against the
data below them.

This app computes both from the invoice rows, so the figures are self-consistent
but no longer match the mockup. If 8,090 and 61,420 are real numbers from
somewhere — a wider ledger, a different period — the fix is to source them from
that endpoint rather than to re-hardcode them.

## Port status

Foundation complete: tokens, data layer, RBAC, i18n/RTL, AppShell, routing,
UI primitives.

Rebuilt (70):

- **Auth chain** — Splash, Welcome, LanguageSelection, RegionSelection, Login,
  ForgotPassword, ResetPassword, OTPVerification, TwoFactorVerification,
  CreatePIN, BiometricSetup
- **Terminal states** — Unauthorized, SessionExpired, AccountLocked,
  LogoutConfirmation
- **Operations** — Dashboard, JobCards, JobDetail, and the six-stage workshop
  loop: WorkshopCheckIn, WorkshopInspection, WorkshopEstimate, WorkshopQC,
  WorkshopSignature, WorkshopDelivery
- **Finance** — Invoices, InvoiceDetail, InvoiceCreate, Payments
- **Registries** — Customers, Vehicles, Estimates, Technicians, FleetManagement,
  Appointments
- **Feature map** — Inventory plus 35 screens rendered through the feature kit

Everything else in `SCREEN_MAP.md` is routed and renders `PendingScreen`.
Build order follows `handoff/README.md` §8.

## Not yet built

Per `handoff/README.md` §10 — real database and migrations, real auth (JWT,
refresh, biometric, PIN, 2FA, SSO), the REST endpoints, workflow orchestration,
file storage, print/PDF, payment gateway, the OBD protocol bridge, and the
third-party integrations.

## Two sources of truth

This app is built from two overlapping inputs, and it's worth being clear which
governs what:

| | Screens | What it is | Authority |
|---|---|---|---|
| `project/*.dc.html` | 191 desktop + 113 mobile | The Claude Design bundle. Brand-compliant prototypes. | **Look and behaviour** for the screens it covers |
| `project/spec/` + `project/spec-shots/` | 235 | Specs and screenshots of an existing running app — a superset of the design. | **Feature scope**: which screens exist at all |

Only **24 names overlap**. The other 211 feature screens have a screenshot and a
templated spec but no design; they are routed and render `PendingScreen`, which
names the spec and screenshot to build each one from.

### Where the two disagree, the design system wins

The screenshots show the existing app using **green** (QC check marks) and
**purple** (metric icons). `handoff/README.md` §7 forbids both — blue is
success/active/progress, orange is warnings. So screens rebuilt from
screenshots reproduce their **structure and content**, not their palette.

The specs are templated: only title, purpose, roles and navigation path vary
per screen. The screenshots carry the real layout information.

A smoke check enforces this: it walks the computed styles of several rebuilt
screens and fails on any dominant green or purple. Copying a screenshot too
literally is a real way to reintroduce them.

### How the 211 undesigned screens get built

They share one shape across their screenshots — header, optional tabs, a stat
row, then panels — so `components/shell/FeatureScreen.tsx` provides that shape
once and `screens/feature/definitions.ts` describes each screen's content as
data. Consistency across 211 screens comes free, and any screen that grows real
behaviour graduates to its own component (`screens/feature/Inventory.tsx` is the
first, deriving stock status from each part's reorder point).

Where the reference app shows an empty state, the empty state is reproduced
honestly rather than filled with invented rows.
