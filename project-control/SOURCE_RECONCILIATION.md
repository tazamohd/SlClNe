# Source reconciliation — SALISAUTO_AGENT_EXECUTION_PACK vs. repository reality

**Date:** 2026-09-18
**Author:** Claude (session A00 role, per the uploaded execution pack)

## What was supplied

A 26-role execution pack (`00_START_HERE_CLAUDE.md`, `AGENT_MANIFEST.json`,
`TASK_OWNERSHIP.csv`, `REFERENCE_MASTER_PLAN.md`, per-agent packets `A00`–`A25`)
describing 73 master tasks to build SALIS AUTO from auth/session primitives
through customers, bookings, workshop, finance, fleet, insurance, HR, CRM and
release gating, dispatched across one coordinator and 25 specialists.

## What the repository actually contains

This is not a greenfield build. The repository already has:

- A working Fastify API (`server/`) and React SPA (`app/`) with 385 documented
  endpoints, 428 registered/mapped screens, and 192 test suites (2,244 cases).
- Its own multi-agent build history, tracked in `project-control/OWNERSHIP.json`
  (numbered agents 01–24, path-scoped ownership) and `project-control/AGENTS_LIVE.json`
  (wave status through at least W5 "certification", per commit history).
- An active, ongoing incremental process *after* W5 — individual PRs each
  closing a small slice (e.g. `76e0aa1 fix: wire 5 real operational screens to
  live APIs (partial BLK-004)`, `cec778f Wire the technician mobile workflow to
  real job-card data`) — i.e. exactly the kind of work this pack asks for,
  already in motion using this repo's own conventions.
- A generated, self-checking documentation/registry system
  (`tools/docs/generate.mjs`, `app/scripts/build-registry.mjs`,
  `project-control/*.json`) that is current as of today and that
  `docs/00_DOCUMENT_CONTROL/DOCUMENTATION_GAP_REPORT.md` explicitly warns must
  be read before trusting any other document.

The pack's own `REFERENCE_MASTER_PLAN.md` §3 anticipates this: "Create or
extend the repository's existing project-control system without creating
competing sources of truth." That existing system is authoritative for
current state; the pack's task list (`TASK_OWNERSHIP.csv`, 1.1–12.7) is
historical planning input, not a current backlog.

## Actual current backlog (from `project-control/BLOCKERS.json`,
`FINDINGS.json`, `RELEASE_GATES.json`, `MASTER_REGISTRY.json`, all generated
2026-09-18)

- **BLK-004 (CRITICAL)** — 277 of 428 screens (`category: PRODUCT`,
  `flags: MOCK_ONLY`) render fixture/hardcoded data instead of calling the
  real API. Broken down by `MASTER_REGISTRY.json` owner/domain:
  - `featuremap` domain, owner `08–17` (ambiguous, spans multiple product
    agents) — 169 screens. Needs a triage/reclassification pass before it can
    be dispatched to a single owner.
  - `website` (owner 17) — 34 screens. Largely static marketing content;
    needs per-screen judgement on whether "data-backed" is even the right
    bar before wiring effort is spent here.
  - `auth` (owner 06) — 28 screens. Many are terminal/status pages
    (e.g. `AccountLocked`) that may not need live data; needs the same
    per-screen judgement as `website`.
  - `admin` (14 screens) — **no owner assigned** in `OWNERSHIP.json`'s
    product-agent list (01–24 covers command/foundation/product/cross-cutting,
    but nothing maps admin/settings/audit-log/backup/etc.). Ownership gap,
    not just a wiring gap.
  - `customerapp` (owner 16) — 8 screens, one file
    (`app/src/screens/customer-app/CustomerApp.tsx`).
  - `parts` (owner 10) — 8 screens
    (`app/src/screens/network/PartsNetwork.tsx`,
    `PartsSupplyNetwork.tsx`) — no matching backend endpoint found in
    `API_REGISTRY.json` (no `parts-network`/marketplace routes exist yet).
  - `ai` (owner 15) — 6 screens, currently rendering fabricated metrics
    (hardcoded KPI numbers) with no backing usage-tracking endpoint —
    same "no backend concept yet" situation as `parts` network.
  - `portals` (owner 16) — 5 screens
    (`app/src/screens/call-center/CallCenter.tsx`, native app info pages).
  - `accounting` (owner 12) — 4 screens, one file
    (`app/src/screens/accounting/Reports.tsx`). Two of the four
    (Financial Reports/Statements) already call `useCollection` but have a
    real aggregation bug (totals computed from one fetched page, not a true
    aggregate); the other two (Insurance/Loan reports) read `jobs`/
    `appointments`/`technicians` collections instead of the real
    `insurance-*`/`loan-*` collections that exist server-side — i.e. wired,
    but wired to the wrong data.
  - `workshop` (owner 08) — 1 screen.
- **BLK-010 (MEDIUM)** — 10 screen files unreachable from any route.
- **13 open findings** (`FINDINGS.json`), mostly LOW/MEDIUM: missing Arabic
  translation keys (~300 strings across F-021/F-026), RBAC matrix gaps for
  insurance/loans (F-034), an unbalanced seeded chart of accounts (F-008),
  icon/shell inconsistencies (F-010/F-024), a client `RepositoryErrorCode`
  gap (F-032), unmapped feature-map screens defaulting open then 403'ing on
  data (F-033).
- Release gates: 8 PASS / 3 FAIL / 3 UNCHECKABLE, not certifiable.

## Decision

Work the **real, current backlog** above rather than the pack's literal
73-task list. The pack's per-domain ownership table is used only as a
cross-check against this repo's own `OWNERSHIP.json`, which is authoritative
for file ownership going forward. No fixture/mock data is replaced with
fabricated "real" data: a screen with no real backend concept behind it
(parts network marketplace, AI usage analytics, wallet/marketplace in the
customer app) is converted to an honest, tested GAP/unavailable state and the
missing backend is recorded as a named blocker, not invented.

**Wave 1** (this session, 4 disjoint-file workers, no shared-file writes
until integration): accounting reports aggregation + insurance/loan report
wiring; customer-app insurance/loans (and honest gap-state for
wallet/marketplace where ungrounded); call center; parts network
(verify-then-honest-gap if ungrounded). Registry regeneration
(`npm run registry`) and gate checks run once, centrally, after integrating
all four diffs — not per-agent, since `project-control/**` is a shared
single-writer path per `OWNERSHIP.json`.
