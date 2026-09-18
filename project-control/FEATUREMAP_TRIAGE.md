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

## Wave 4 — Purchase Agent / Technician Portal-App / Client Portal / Portal misc (2026-09-18)

Verified the four remaining groups file-by-file. One correction to this
document's own count: the actual scope was 36 screens, not the ~28
estimated in wave 2 — every one of them already resolves to its own
dedicated component in `app/src/screens/domains/portals.ts`'s
`SCREEN_ENTRIES` (the same "already real, not a spec-renderer duplicate"
situation wave 3 found for the accounting-statements group), so this was
never actually a duplicate-reconciliation problem in the wave-3 sense.
What it turned out to be instead: 28 of the 36 fabricate hardcoded fixture
data (invented names, IDs, dates, costs) with no honest hedging — a
straightforward BLK-004 violation, just mislabeled "duplicate" from a
route-name guess.

Fixed all 28, using two treatments depending on whether a real collection
exists for the concept:

- **Honest GAP state (17 screens)** — no collection backs the content at
  all (time clock, attendance, parts requests, documentation, repair
  guides, diagnostic software licenses, purchasing tasks, quotations,
  deliveries/shipment tracking, price comparison, procurement reports,
  service reminders, reviews/chat, a cross-portal activity feed and a
  messages inbox). Converted to the same `EmptyState` + "Connect the API"
  pattern `CallCenterLogs.tsx` established in wave 1:
  `TechnicianPortalTimeClock/Documentation/Attendance/Guides/Software/Parts.tsx`,
  `TechnicianAppClock.tsx`,
  `ClientPortalReminders/ReviewChat.tsx`,
  `PurchaseAgentTasks/Quotations/Delivery/PriceCompare/Tracking/Reports.tsx`,
  `PortalDashboard.tsx`, `PortalCommunications.tsx`.
- **Wired to real data (11 screens)** — a real collection or the
  signed-in session already carries this. `TechnicianPortalProfile.tsx`
  and `TechnicianAppProfile.tsx` now show the technician's own real name/
  role/email from `useSession()` (gap-noted for employee ID, certs,
  performance stats — none of which exist anywhere). `TechnicianAppHome.tsx`
  reuses `TechnicianPortal.tsx`'s own real jobs/appointments stats (and
  drops the exact invented "6.5h logged" figure that screen's own comment
  says was deliberately excluded). `TechnicianAppLookup.tsx` and
  `PurchaseAgentInventory.tsx` now read the real `parts` collection
  `Inventory.tsx` already reads. `PurchaseAgentDashboard.tsx` and
  `PurchaseAgentOrders.tsx` read the real `purchaseOrders`/`suppliers`/
  `requisitions` collections `ProcurementPortal` and `PurchaseOrdersList.tsx`
  already read, using the server's real status vocabulary rather than the
  design's invented one. `ClientPortalDashboard.tsx`,
  `ClientPortalServiceHistory.tsx` and `ClientPortalLiveTracking.tsx` read
  the real `vehicles`/`appointments`/`invoices`/`jobs` collections
  `CustomerPortal.tsx` already reads (`LiveTracking` reuses the hub's own
  `railIndexFor` stage-progress calculation instead of two invented
  percentages). `ClientPortalProfile.tsx` shows the real signed-in
  customer's name/email, gap-noted for the rest (no national ID, loyalty
  tier or visit-count field or collection exists).

**Deliberately left alone (8 screens)** — already real and honest, no
fabrication to fix: `TechnicianPortalDashboard/MyJobs.tsx`,
`TechnicianAppJobs.tsx` (real `jobs` data, honestly drops unbacked
columns), `ClientPortalVehicles/Appointments/Invoices.tsx` (real
collections, `derived()` for genuinely unprojected fields, an explicit
`UNKNOWN` rather than a dishonest client-side sum on Invoices),
`PurchaseAgentPayments.tsx` and `PurchaseAgentSuppliers.tsx` (real
`purchaseOrders`/`suppliers` data with an explicit gap notice for columns
the collection doesn't carry). Several of these duplicate a hub screen's
*concept* (e.g. `PurchaseAgentSuppliers.tsx` and
`app/src/screens/parts/SuppliersList.tsx` both show the real supplier
list) — matching this project's own precedent from earlier in this wave
and from wave 3, duplication of concept across personas is not itself a
violation as long as every copy is honestly wired; only fabricated
duplicates get fixed.

`npm run registry`: BLK-004 mock-only 249 → 241 (the 8 screens that
gained a direct `useCollection` call the generator's `dataBackedScreens`
detector recognises; the 17 GAP-state and 3 session-only conversions stay
flagged `MOCK_ONLY` — correctly, since "not wired to a live collection" is
still true for an honest empty state).

Verified: `npm run typecheck`, `npm run gates` (8/8), `npx vitest run`
(111 files / 3918 tests), a full local `smoke.mjs` run (429/429 routes)
and a manual Playwright spot-check of 13 of the rewired routes (real data
rendering, zero console errors) all clean. `node tools/docs/check.mjs`:
passes, no drift.

This closes the duplicate-reconciliation backlog opened in wave 2 — all
four flagged groups (accounting statements in wave 3; Suppliers/Purchase-
Orders/Parts-Network in wave 3; Purchase Agent/Technician Portal-App/
Client Portal/Portal misc here) have now been verified file-by-file.

## Recommended next steps (not done here)

1. ~~**Duplicate reconciliation**~~ — done as of wave 4: every group this
   document flagged has been verified file-by-file (waves 3 and 4).
2. **Registry `dataBackedScreens` blind spot** — flagged in wave 3, still
   open: the generator only recognises a screen calling
   `useCollection`/`useEntity` directly, not through a custom hook
   (`useTrialBalance()` et al.) the way it already follows one level of
   component delegation. A shared, generator-level fix, not a per-screen
   one — needs its own validated pass across the whole registry.
3. ~~**Admin domain ownership gap**~~ — resolved in wave 5
   (2026-09-18): the 20-screen `admin` domain (`AuditLog`, `Settings`,
   `RolesPermissions`, `UsersTeams`, `Organizations`, etc. — the count
   above was itself an undercount) had no owner anywhere. Two places
   needed the same fix: `project-control/OWNERSHIP.json`'s product-agent
   list (no entry claimed `app/src/screens/admin/**`) and, independently,
   `app/scripts/build-registry.mjs`'s own `DOMAIN_AGENT` map, which had a
   hardcoded `admin: '—'` that both `docs/MASTER_SCOPE_REGISTRY.md`'s
   by-domain table and `docs/MASTER_AGENT_OWNERSHIP.md` render from —
   this second map is what the registry actually reads, not
   `OWNERSHIP.json`'s presence alone. Added agent 25 ("System
   Administration") to both, owning `app/src/screens/admin/**` and
   `app/src/screens/domains/admin.ts`. Verified: `npm run typecheck`,
   `npm run gates` (8/8), `npx vitest run` (111 files / 3918 tests),
   `node tools/docs/check.mjs` — all clean, and the "Administration" row
   in `MASTER_SCOPE_REGISTRY.md`'s by-domain table now reads agent `25`
   instead of `—`.
4. ~~**Admin domain BLK-004 fixing**~~ — done in wave 6 (2026-09-18).
   Triaged all 14 `MOCK_ONLY` admin screens file-by-file. One correction
   first: `CookiePolicy` was never actually an admin screen — it's a
   static legal document at `app/src/screens/public/CookiePolicy.tsx`,
   caught by `build-registry.mjs`'s `classify()` falling through to its
   `admin` default because `CookiePolicy` was missing from the same
   regex its siblings `PrivacyPolicy`/`TermsConditions` already match.
   Added it to that regex; it now classifies as `auth`, matching its
   siblings (all three still carry the same pre-existing `MOCK_ONLY`
   false-positive for having no `useCollection` call — static legal
   prose needs none — left alone, same as `RolesPermissions.tsx` below).

   Of the real 13:
   - **Honest GAP state (10 screens)** — no collection exists for the
     concept at all: `AdvancedSettings`, `Backup`, `NotificationCenter`,
     `Organizations`, `Settings`, `Subscription`, `SuperAdmin`,
     `Templates`, `UsersTeams` (system *user accounts* — logins, roles,
     sessions — have no `users` collection; the adjacent *employment*
     data is real and already honestly covered by
     `app/src/screens/hr/StaffDirectory.tsx`, so this screen was left a
     gap rather than becoming a second, drifting copy of that one), and
     `AuditLog` (already had an honest offline branch, but its "live"
     branch still rendered `FIXTURE_ENTRIES` — now an unconditional gap,
     since no general audit-log collection exists either way;
     `history` is a per-record trail only).
   - **Wired to real data (1 screen)** — `GlobalSearch.tsx`: a genuine
     cross-entity search across the real `customers`/`vehicles`/`jobs`/
     `invoices`/`parts` collections, using the same `{ q }` substring
     filter (`Repository`'s `matchesSearch`) every other screen's list
     view already supports. The fabricated "Recent searches" list was
     dropped rather than kept (no query-history collection exists).
   - **Already honest, left alone (2 screens)** — `Profile.tsx` (real
     session identity via `useSession()`) and `RolesPermissions.tsx`
     (the real, generated RBAC config, not fixture data).

   A regression surfaced mid-wave and was caught before commit: the
   first honest-gap pass for the 9 screens above dropped their
   `useIsMobile()`/`MobilePageHeader` branch along with the fabricated
   content, which `npm run gates` caught as a fresh `BLK-006` ("9 built
   screens owe their designed mobile layout") — each of those 9 has a
   real `.Mobile.dc.html` design file on record, so the mobile branch is
   a real requirement, not leftover cruft. Re-added a lightweight mobile
   header branch (same `EmptyState` content, `MobilePageHeader` instead
   of the desktop header) to all 9; `BLK-006` cleared back to 0 mobile
   owed.

   `npm run registry`: BLK-004 mock-only 241 → 240 (GlobalSearch is the
   only one that gained a real `useCollection` call the generator
   recognises; the 10 GAP-state screens correctly stay flagged
   `MOCK_ONLY` — "not wired to a live collection" is still true of an
   honest empty state).

   Verified: `npm run typecheck`, `npm run gates` (8/8, including the
   `BLK-006` regression check), `npx vitest run` (111 files / 3918
   tests), a full local `smoke.mjs` run (429/429 routes), a manual
   Playwright check of `GlobalSearch.tsx`'s live cross-entity results
   (real grouped matches across all 5 collections) and three of the
   GAP-state screens at a 390px mobile viewport — all clean, zero
   console errors. `node tools/docs/check.mjs`: passes, no drift.
5. ~~**`website` domain (34)**~~ — triaged in wave 7 (2026-09-18, PR
   #148). ~~**`auth` domain (29)**~~ — triaged in wave 8 (2026-09-18,
   PR #150), same judgment call. ~~**`ai` domain (6, plus 2 related
   screens registered under `admin`)**~~ — triaged in wave 9
   (2026-09-18), see below.

## Wave 9 — ai domain (2026-09-18)

Triaged the 6 `MOCK_ONLY` screens under `app/src/screens/ai/`
(`AIAnalytics`, `AIAssistant`, `ModelSettings`, `PromptLibrary`) plus
two screens the registry groups into the same "AI Platform" surface
despite living under `app/src/screens/admin/`
(`AutomationRules`, `WorkflowBuilder`). Confirmed no AI/chat, automation,
workflow, settings-persistence or usage-tracking endpoint exists
anywhere in `packages/contract/src/entities/` — the one AI-adjacent
collection that does exist, `aiAgents`, backs an unrelated screen
(`Crm.tsx`'s agent-monitoring panel), not any of these six.

Of the 6:
- **Honest GAP state (4 screens)** — content presented as real with no
  backing collection:
  - `AIAnalytics.tsx`: fabricated KPIs ("4,821" queries, "96.4%"
    satisfaction, "2.4M" tokens), a fabricated topic breakdown and a
    fabricated usage-over-time chart, all replaced with an honest
    `EmptyState` naming the missing `aiAnalytics` collection.
  - `AutomationRules.tsx`: five fixture rules ("Low Stock Alert", "Auto
    Invoice", ...) with hardcoded active/inactive state, replaced the
    same way, naming `automationRules`.
  - `WorkflowBuilder.tsx`: four fixture workflows ("Job Card
    Lifecycle", ...) with invented run counts ("1,248 runs", "2 min
    ago"), replaced the same way, naming `workflows`.
  - `PromptLibrary.tsx`: nine fabricated saved prompts with invented
    usage counts and favorited state, replaced the same way, naming
    `promptLibrary`.
- **Fake-success/silent-failure fixes (2 screens)**:
  - `AIAssistant.tsx`: previously, sending a message while `isLive`
    added the user's own chat bubble and then silently did nothing —
    no assistant reply was ever generated, with no error or
    explanation shown, and messages/transcript state that could never
    actually hold a real reply. Simplified to never add a message it
    can't answer: sending now always shows an honest "AI Assistant is
    not available on this deployment yet" toast, and the dead
    transcript-rendering branch (which could only ever be reached by
    fabricating an assistant reply) was removed along with it.
  - `ModelSettings.tsx`: two separate issues on one screen. Its "Usage"
    card showed fabricated token/cost figures ("2.4M / 5M", "SAR
    1,840") with no backing collection — replaced with an `EmptyState`
    naming the missing usage-tracking data. Its "Save Changes" button
    fired a fake "Settings saved" toast whenever `isLive` with no API
    call at all — no settings-persistence endpoint exists, live or
    not — now shows the same honest "not available" message
    unconditionally. The model/parameter/behavior controls above stay
    locally editable, since they're real form state with nowhere to
    persist to yet, not fabricated data.

`npm run registry`: BLK-004 mock-only count unchanged at 228 (measured
before this wave's own commit; the count moves only on a real
`useCollection` wire, and none of these six screens had a plausible
collection to wire to) — same expected blind spot as every wave-6/7/8
GAP screen. `node tools/docs/check.mjs` also surfaced that
`project-control/BLOCKERS.json` now holds only 1 open blocker (BLK-004)
— BLK-010 (the 10 orphan landing-page files) was resolved separately by
PR #147 while this wave was in progress, unrelated to this wave's own
work.

Verified: `npm run typecheck`, `npm run gates` (8/8, 0 mobile owed — no
`.Mobile.dc.html` regression risk on this domain), `npx vitest run`
(111 files / 3918 tests, no existing test referenced the fabricated AI
content), `npm run check-i18n` (3900/3900 covered, 8 new keys), a full
local `smoke.mjs` run (429/429 routes), and a manual Playwright check
of all 6 changed screens (seeding `salis-role` in `localStorage`, since
these are gated internal-app screens unlike waves 7/8's public/auth
surfaces) — the 4 GAP screens render their honest content with the old
fabricated strings gone, `AIAssistant.tsx`'s suggestion click shows the
honest toast with no fake transcript entry added, and
`ModelSettings.tsx` shows its honest Usage gap and honest Save message
instead of the old fabricated numbers and fake success — zero console
errors throughout. `node tools/docs/generate.mjs` + `check.mjs`: clean,
no drift.
