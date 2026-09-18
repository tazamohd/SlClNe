# Feature-map triage — wave 2

**Date:** 2026-09-18
**Scope:** the 169 `featuremap`-domain screens flagged `MOCK_ONLY` in
`project-control/BLOCKERS.json`'s BLK-004, per the plan in
`project-control/SOURCE_RECONCILIATION.md`.

## What these screens actually are (the important finding)

Before triaging individual screens, it's worth recording what changed the
plan: **the featuremap bucket is not fabricating data.**

Every one of the 169 screens renders through one of two paths:

- `FEATURE_DEF_BY_ROUTE` (`app/src/screens/feature/definitions.ts`, 48
  entries covering routes in this bucket) — renders real zeros and honest
  empty states (`{ value: 0 }`, `"SAR 0.00"`, `"No VINs decoded yet"`, etc).
  The file's own header comment states the rule: *"Where the reference app
  shows an empty state..., the empty state is reproduced honestly rather
  than filled with invented rows."* Checked every `value:` in that file —
  the only non-`0` entries are unit-formatted zeros (`'0%'`, `'SAR 0.00'`,
  `'0h'`) and one static config number (`'30d'` forecast horizon, not a
  data value).
- `PendingScreen` (`app/src/screens/PendingScreen.tsx`), for any route
  without a `FEATURE_DEF` — an explicit "Designed, not yet rebuilt" card
  naming the route and the design source. Also honest, also zero
  fabrication.

So none of these 169 screens are the false-success problem BLK-004 exists
to catch (mock rows standing in for real ones, as CallCenter/PartsNetwork/
CustomerApp's Wallet were before wave 1). They're an accurately-labelled
backlog of features that haven't been built yet. `MOCK_ONLY` here means
"not wired to a live collection," which is true and not evidence of
dishonesty — the registry generator's flag conflates the two, which is the
same finding wave 1 made about the honest GAP-state conversions not moving
this counter. Confirmed via `app/scripts/check-no-fake.mjs` too: 0
placeholder routes, 0 source markers — the existing gate that specifically
checks for fabricated/placeholder content has nothing to say about this
bucket.

This means the triage's job was never "stop these screens from lying" —
it was "figure out which of these are real product work still to do, and
which were never buildable in this codebase to begin with."

## What this pass changed

Extended `EXTERNAL` in `app/scripts/build-registry.mjs` (previously 12
entries: Drone Inspection, VR Showroom, Quantum Computing, Wearable
Integration, Security Cameras, Digital Signage, Blockchain Service
History, Smart Contracts, Voice Commands, Voice Command Interface, AR
Repair Guide, AR Overlay — the existing, already-established mechanism
for a screen that names a specific dependency this deployment doesn't
have) with 23 more, using the same bar: a *named* external system, not
"the title says AI/smart" and not "this hasn't been built yet."

| Screen | Missing dependency |
|---|---|
| Vehicle Tracking | GPS/telematics device |
| Fleet Tracking | GPS/telematics device fleet |
| Telematics Integration | telematics provider integration |
| License Plate Recognition | camera + LPR vision service |
| Computer Vision QC | computer-vision model service |
| Video Consultations | video-calling provider (SDK + credentials) |
| Stripe Payment Processing | Stripe API credentials |
| Smart Damage Assessment | computer-vision damage-assessment model |
| ML Fraud Detection | trained fraud-detection model service |
| Neural Network Prediction | trained model-serving infrastructure |
| IoT Dashboard | IoT device fleet + telemetry ingestion |
| Edge Computing | edge compute infrastructure |
| Digital Twin Viewer | 3D twin model + live sensor feed |
| Sustainable Energy Monitoring | energy-monitoring hardware/sensors |
| Mobile Device Management | MDM platform integration |
| Document OCR | OCR provider credential |
| SMS Integration | SMS gateway credential |
| Social Media Integration | social platform API credentials |
| Social Media Monitoring | social listening provider credential |
| Google My Business | Google Business Profile API credential |
| AI Chatbot | LLM provider credential |
| AI Chatbot Assistant | LLM provider credential |
| AI Service Advisor | LLM provider credential |

Result (`npm run registry`): BLK-004's mock-only count 274 → 251;
`externalDependency` in `project-control/STATUS.json` 12 → 35; `product`
388 → 365. Verified: `npm run typecheck`, `npm run gates` (all 8 checks),
`npx vitest run` (107 files / 3905 tests) all clean.

## Deliberately left alone, and why

**Ambiguous "AI/smart" naming without a named dependency** — left as
`PRODUCT` backlog, not reclassified. Examples: AI Scheduling, Smart
Assignment, Routing Optimizer, Predictive Diagnostics ("predictions need
OBD history to work from" — needs more of *this app's own* data, not an
external service), Predictive Maintenance, Smart Parts Recommender/
Recommendations, Smart Inventory Forecasting, Automated Reordering,
Dynamic Pricing, Intelligent Price Optimizer, AI Automation, VIN Decoder
(a standard, commonly-free lookup, not the kind of dependency this list
is for), Barcode Scanner (a browser camera + a client-side decoding
library, no vendor credential needed). Calling every screen with "AI" or
"smart" in its name `EXTERNAL_DEPENDENCY` would have been the same error
this pack's `REFERENCE_MASTER_PLAN.md` already warned against for a
different list ("Historical model names described as free, with fixed
token budgets... Do not assume current pricing, access") — inverted:
assuming *no* access is just as much a guess as assuming free access.
These are real, buildable features against this app's own data; they're
just not built yet.

**Two vague roadmap-style entries** — Emerging Technologies, Next-Gen
Technologies — named nothing specific enough to point `EXTERNAL` at, and
nothing in this codebase's category system fits "marketing/roadmap page"
cleanly. Left as `PRODUCT` backlog rather than force a category that
doesn't really apply.

**Likely duplicates of already-built functionality** — found by route
name, not yet verified file-by-file, so *not* acted on this pass. Each
needs the same individual check `project-control/SUPERSEDED_SCREENS.md`
did for the last orphan-screen reconciliation before any redirect or
deletion:

- General Ledger, Trial Balance, Balance Sheet, Income Statement, Cash
  Flow Statement, Accounts Receivable, Accounts Payable — commit `daf5d2c`
  ("Wire GeneralLedger/TrialBalance/BalanceSheet/IncomeStatement to the
  real trial-balance endpoint") already built these, reachable today under
  `/financial-reports` and `/chart-of-accounts`, not under these featuremap
  routes. `grep` confirms none of these exact paths are registered in
  `app/src/routes/index.tsx` — they're live only through
  `SpecScreenResolver`, rendering the generic, unbuilt kit view alongside
  the real screen that already does this.
- Suppliers, Purchase Orders — real, wired screens already exist under
  procurement (`app/src/screens/network/Procurement.tsx`).
- Parts Network Dashboard/My Requests/Incoming Requests — same concept
  `app/src/screens/network/PartsNetwork.tsx` already covers (converted to
  an honest gap state in wave 1); these featuremap duplicates should
  probably redirect there rather than exist as a second, unbuilt copy.
- Purchase Agent Dashboard/Tasks/Quotations/Delivery/Orders/Inventory/
  Price Compare/Tracking/Reports (9 screens) — likely the same procurement
  workflow from a different persona's routes; needs a decision on whether
  "purchase agent" is a distinct role view or the same screens Procurement
  already serves.
- Technician Portal (7) and Technician App (4) screens — `TechnicianPortal`
  and `TechnicianMobile` already exist and are real (see `cec778f`, "Wire
  the technician mobile workflow to real job-card data"); several of these
  routes likely duplicate them under a different path.
- Client Portal Dashboard/Profile/Service History/Live Tracking/Reminders/
  Review-Chat (6) — `CustomerPortal.tsx` already covers this territory.
- Portal Dashboard, Portal Communications — generic, unclear which real
  portal (customer/technician/supplier/procurement) they'd duplicate.

**Everything else** (the remaining ~110) — genuinely unbuilt, no evidence
of a duplicate or an external dependency, honestly categorized as `PRODUCT`
backlog already. No action needed to make them honest; building them is
real, un-shortcut-able feature work for a future wave; each would need
its own scoped design/backend/UI pass, not a registry classification
change.

## Wave 3 — duplicate reconciliation (2026-09-18)

Verified each "likely duplicate" group above file-by-file, per the
recommended next step below. Two corrections to this document's own
earlier claims, found in the process — recorded rather than silently
edited away:

- **General Ledger / Trial Balance / Balance Sheet / Income Statement /
  Cash Flow Statement / Accounts Receivable / Accounts Payable were never
  duplicates.** The claim above ("none of these exact paths are
  registered in `app/src/routes/index.tsx`") was true but the conclusion
  drawn from it was wrong — these routes ARE registered, dynamically,
  through the `SPEC_SCREENS.filter((spec) => !spec.designScreen).map(...)`
  loop in `routes/index.tsx`, which a literal grep for the route string
  doesn't find. Their components (`app/src/screens/accounting/
  GeneralLedger.tsx` etc.) are real, already correctly wired to
  `useTrialBalance()` and the other repository-aggregate hooks in
  `useFinanceReports.ts`, and already registered by exact name in
  `app/src/screens/domains/accounting.ts`'s `SCREEN_ENTRIES`. They still
  show `MOCK_ONLY`/`dataBacked: false` in the registry — but that's a
  registry-generator blind spot, not a missing feature: `dataBackedScreens`
  in `build-registry.mjs` only recognises a screen calling
  `useCollection`/`useEntity`/etc. directly by name; it doesn't follow into
  a custom hook (`useTrialBalance()`) defined in a sibling file, the same
  way it already follows one level of *component* delegation
  (`WRAPPER_TARGET`) but not *hook* delegation. Not fixed in this pass —
  it's a shared, generator-level change that needs its own careful,
  validated pass across the whole registry, not a duplicate cleanup. Left
  as a follow-up.
- **Suppliers and Purchase Orders were genuine duplicates, and were fixed.**
  `app/src/screens/parts/SuppliersList.tsx` and `PurchaseOrdersList.tsx`
  had their own hardcoded fixture rows (eight invented suppliers with a
  Rating/Category/Orders-count no schema field backs; seven invented
  purchase orders with an invented item count) — real BLK-004 violations,
  sitting beside `app/src/screens/portals/purchase/
  PurchaseAgentSuppliers.tsx`, which already reads the same real
  `suppliers` collection and is honest about exactly those same missing
  columns. Rewired both to `useCollection('suppliers')` /
  `useCollection('purchaseOrders')`, dropped the columns/stats with no
  real field behind them, and matched the server's own status vocabulary
  (`draft/approved/sent/receiving/received/closed`) instead of the
  design's unrelated one. `npm run registry`: BLK-004 251 → 249.
- **Parts Network Dashboard / My Requests / Incoming Requests were
  genuine duplicates, and were fixed** the simpler way: they had their own
  second copy of the exact fixture rows `PartsNetwork.tsx` already had
  (converted to an honest gap state in wave 1). Deleted
  `app/src/screens/parts/PartsNetworkDashboardSpec.tsx`, `PartsNetworkMyRequests.tsx`, `PartsNetworkIncomingRequests.tsx`
  and pointed `app/src/screens/domains/parts.ts`'s `SCREEN_ENTRIES` at
  `PartsNetwork.tsx`'s own `PartsNetworkDashboard`/`PartsNetworkRequests`/
  `PartsNetworkIncoming` exports instead of maintaining two copies.

Verified: `npm run typecheck`, `npm run gates` (8/8), `npx vitest run`
(107 files / 3905 tests), a full local `smoke.mjs` run (428/428 routes)
and the `parts-procurement` e2e spec (10/10) all clean.

**Not yet done** — Purchase Agent (9), Technician Portal/App (11), Client
Portal (6) and Portal Dashboard/Communications (2) still need the same
file-by-file check; nothing about them was verified beyond a route-name
guess.

## Recommended next steps (not done here)

1. **Duplicate reconciliation** — verify each "likely duplicate" above
   file-by-file (does a real screen already cover it? does the featuremap
   route need to redirect, or does the persona genuinely differ?) and
   apply the same wire-or-delete treatment `SUPERSEDED_SCREENS.md` used
   for the BLK-010 orphan-file pass. This is the highest-value remaining
   slice of the featuremap bucket — it could close 20+ more without
   building anything new, just pointing at what already exists.
2. **Admin domain ownership gap** — 14 screens (`AuditLog`, `Settings`,
   `RolesPermissions`, etc.) have no owner in `project-control/
   OWNERSHIP.json`'s product-agent list at all; needs an ownership
   decision before further wiring.
3. **`website` (34) and `auth` (28) domains** — need the same "is
   `dataBacked` even the right bar for this screen" judgment call
   `SOURCE_RECONCILIATION.md` flagged; many are legitimately static
   marketing pages or terminal/status screens.
