# SALIS AUTO — W5 Certification Report

**Date:** 2026-08-29
**Project:** SALIS AUTO (tazamohd/SlClNe)
**Auditor:** W5 Certification Agent

---

## Executive Summary

SALIS AUTO is a multi-tenant automotive workshop management system covering the full vehicle service lifecycle — from customer intake and diagnostics through job execution, invoicing, and delivery — plus CRM, accounting, inventory, a B2B parts network, AI capabilities, and multiple external portals.

The project has completed four development waves (W0–W3) plus an integration phase (W4), producing **435 registered screens** across **13 domains**, supported by **14 RBAC roles**, **28 permission modules**, and a comprehensive backend API. All unit tests pass (1,563 total), TypeScript compiles cleanly, and the codebase has been hardened for security, accessibility, and internationalization.

**Certification result:** The project meets the criteria for W5 certification with two recommended follow-up items before production deployment.

---

## Project Metrics

| Metric | Value |
|--------|-------|
| Design screens (with `.dc.html` prototypes) | 200 |
| Spec/feature-map screens | 235 |
| **Total registered screens** | **435** |
| Screens with dedicated React components | 358 |
| Screens using `FeatureScreenView` template | ~131 |
| Screens on `PendingScreen` fallback | ~64 (roadmap items) |
| RBAC roles | 14 |
| RBAC permission modules | 28 |
| Separation-of-duty rules | 6 |
| Field-level redaction rules | 7 |
| Server API test suites | 4 (50 tests) |
| App unit/component tests | 148 files (1,513 tests) |
| E2E test specs | 11 files |
| TypeScript errors | 0 |
| Languages supported | English, Arabic (100%) |

---

## Waves Completed

### W0 — Foundation
Built the React application scaffold, design handoff system, and core screen infrastructure.

### W1 — Core Screens
Implemented the workshop loop (check-in → inspection → estimate → repair → QC → delivery), invoicing, customer/vehicle registries, and the feature-screen rendering kit.

### W2 — Administration & Workshop Expansion
Built 16 administration screens (settings, roles, branches, users, audit log), 10 workshop screens, the parts network, procurement portal, and accounting ledgers.

### W3 — Domains & Polish
Completed AI/automation screens, CRM, auth chain, portals (customer, supplier, technician, kiosk), public marketing website (10 pages), UI pattern library (25 screens), and 5 meta/reference screens.

### W4 — Integration & Hardening
Focused on cross-cutting concerns:
- Security hardening (CSP, HSTS, XSS prevention, dependency audit) — PR #27
- 69% bundle reduction via code splitting — PR #28
- Insurance, fleet, and towing screens — PR #29
- HR and payroll management — PR #30
- WCAG 2.1 AA accessibility audit — PR #31
- Documentation suite — PR #32
- Playwright E2E test infrastructure — PR #33
- Responsive mobile/tablet layouts — PR #34
- Arabic/RTL language support — PR #35
- AI/automation capabilities — PR #36
- SAHEL Command Deck — PR #37
- Live API wiring — PR #38
- i18n/CSS cleanup — PR #39
- Backend mutations (create/update/delete) — PR #40

---

## Merged Pull Requests

| PR | Title | Scope |
|----|-------|-------|
| #2 | ECC bundle (agent configs) | Tooling |
| #3 | W2 workshop agent | Workshop screens |
| #4 | W2 admin | Administration screens |
| #5 | W3 accounting | Accounting & reports |
| #6 | W4 AI | AI/automation screens |
| #7 | W5 auth chain | Auth screens (13) |
| #8 | W6 mixed domains | CRM calendar, fleet contract, HR, inventory reports, customer feedback, lead detail |
| #9 | W7 portals | Customer, supplier, technician portals + kiosk |
| #10 | W8 website | Public marketing site (10 pages) |
| #11 | W9 domain screens | Call center, customer detail, vehicle detail, purchase order |
| #12 | W10 UI | 25 UI pattern-library screens |
| #13 | W11 meta | Flow spec, RBAC spec, screen index, native shells |
| #14 | API client | HTTP repository behind the data seam |
| #15 | Icon registry fix | Fix deprecated Lucide icon aliases |
| #16 | RTL polish | Mirror physical-direction CSS to logical |
| #17 | Repository provider | Wire RepositoryProvider + useCollection |
| #21 | TypeScript fix | Use `tsc --noEmit` instead of `tsc -b --noEmit` |
| #24 | Frontend completion | 100% Arabic, all feature screens, code-splitting |
| #25 | Backend API | Express server with auth, collections, security |
| #26 | SAHEL Command Deck | Chat interface and request pipeline |
| #27 | Security hardening | XSS, CSRF, headers, dependency audit |
| #28 | Performance | 69% bundle reduction, lazy loading |
| #29 | Insurance/fleet/towing | 7 new dedicated screens |
| #30 | HR & payroll | 9 HR management screens |
| #31 | Accessibility | WCAG 2.1 AA audit |
| #32 | Documentation | Architecture, domains, components, API, dev guide |
| #33 | E2E tests | Playwright infrastructure + 11 spec files |
| #34 | Responsive layouts | Mobile/tablet breakpoints |
| #35 | Arabic/RTL | Full Arabic language support |
| #36 | AI capabilities | AI/automation screens |
| #37 | Command Deck W4 | Integration phase updates |
| #38 | Live API | Wire login + session to live API |
| #39 | i18n/CSS cleanup | Fix RTL logical CSS + complete Arabic |
| #40 | Backend mutations | Write endpoints + frontend write seam |

---

## Test Coverage

### Server Tests (50 passing)

| Suite | Tests | Coverage |
|-------|-------|----------|
| `auth.test.ts` | 6 | Login, JWT, token validation, protected routes |
| `collections.test.ts` | 16 | CRUD operations, pagination, filtering, search |
| `writes.test.ts` | 16 | Create, update, delete mutations |
| `security.test.ts` | 12 | Headers, tenant isolation, injection prevention |

### App Tests (1,513 passing)

- 148 test files covering component rendering, data transformations, RBAC logic, routing, i18n, and screen-level smoke tests.

### E2E Tests (not run, infrastructure ready)

- 11 Playwright spec files: estimates, navigation, customers, workshop, invoices, RBAC, auth, accounting, responsive, dashboard, inventory.

---

## Security Posture

| Control | Status |
|---------|--------|
| JWT authentication | Implemented |
| Tenant isolation (middleware) | Implemented |
| RBAC authorization (28 modules, 14 roles) | Implemented |
| Separation of duties (6 rules) | Defined in data |
| Field-level redaction (7 rules) | Defined in data |
| CSP headers | Configured |
| HSTS | Enabled |
| X-Frame-Options | Set |
| Input validation (Zod) | All API endpoints |
| React XSS prevention | Default JSX escaping |
| No hardcoded secrets | Verified |
| Dependency audit | Completed (PR #27) |

---

## Known Gaps

### Must-Fix Before Production

1. **Financial integrity tests** — No double-entry accounting invariant tests exist. Add tests verifying: invoice totals match line items, payment amounts don't exceed invoice balances, journal entries balance to zero.

2. **E2E test execution** — The Playwright infrastructure and 11 spec files exist but were not executed as part of this audit. A full E2E pass should be completed before production.

### Should-Fix

3. **~64 spec screens are PendingScreen placeholders** — These are roadmap items (emerging tech, detailed sub-portals) that show a name/purpose placeholder. Acceptable for MVP but should be prioritized for future waves.

4. **SSO and social login** — UI screens exist but are not wired to real identity providers. If these auth methods are needed for launch, IdP integration is required.

5. **Vitest config picks up node_modules tests** — The app's vitest configuration includes test files from `node_modules/pg-protocol` and `node_modules/zod`. While these don't affect project test results (all 1,513 project tests pass), the config should exclude `**/node_modules/**` more precisely.

6. **Duplicate `/logout-confirmation` route** — Defined both in the `SCREENS` array and as an explicit route. Dead code; safe to remove the explicit one.

### Nice-to-Have

7. **Automated DAST scan** — No dynamic security testing was performed. Consider adding OWASP ZAP or similar to CI.

8. **Lighthouse / axe automated a11y** — The WCAG audit (PR #31) was manual. Automated a11y checks in CI would prevent regressions.

9. **Production build verification** — `vite build` was not run. Should be verified in CI before deployment.

---

## Recommended Next Steps

1. Add accounting invariant tests (journal balance, invoice-payment consistency)
2. Run the full Playwright E2E suite and fix any failures
3. Run `vite build` and verify the production bundle
4. Wire SSO/social login to a real IdP if needed for launch
5. Run an automated DAST scan (OWASP ZAP)
6. Add Lighthouse a11y checks to CI
7. Prioritize the ~64 PendingScreen specs for W6 implementation

---

## Certification Decision

**W5 CERTIFICATION: APPROVED**

The SALIS AUTO project has successfully completed waves W0–W4, delivering a comprehensive automotive workshop management system with:
- 435 registered screens across 13 domains
- Full RBAC with 14 roles and 28 permission modules
- 1,563 passing unit tests and zero TypeScript errors
- Security hardening, accessibility audit, and full Arabic/RTL support
- Comprehensive documentation

Two follow-up items are recommended before production deployment (financial integrity tests, E2E test execution), but neither blocks certification of the completed development work.

---

## Addendum — 2026-09-03 follow-up

Status of the recommended next steps above, measured rather than restated:

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Accounting invariant tests | **Done** (landed with the server rewrite) | `server/tests/rules.test.ts` (journal debits = credits; payment ≤ balance to the halala; no payment on a draft or cancelled invoice), `api.test.ts` (total computed from lines, duplicate payment taken once, two simultaneous payments cannot both take the last of the balance), `seed-coherence.test.ts` and `finance-reports.test.ts` (the seeded ledger's SAR 257,050 imbalance is reported, not forced to balance). Server suite: 30 files, 2,473 tests, all passing against PostgreSQL 16. |
| 2 | Run the full Playwright E2E suite and fix failures | **Done** | 702 tests over desktop and mobile, all passing. 16 golden paths and 16 further tests were asserting fixture text from the deleted shadow copy of the app (`JC-A3F8B2C1`, `PO-2026-0087`, `AutoParts KSA`, `Report Categories`…); each now asserts what the data-backed screen renders, including the honest stops (no API: no purchase-order number, no claim decision, no bank feed). `project-control/GOLDEN_PATHS.json`: 23 passing, 0 failing. Two product defects found on the way are fixed: the Job Cards search shared its label with the topbar's global search, and every `TabBar` carried an `aria-controls` to a panel that did not exist. |
| 3 | `vite build` in CI | **Already done** | The `build` job runs `npm run build` on every push (`.github/workflows/ci.yml`). |
| 4 | SSO / social login to a real IdP | **Not done — external** | Needs an identity provider and its credentials; nothing in the repository can be wired without them. |
| 5 | Automated DAST (OWASP ZAP) | **Not done — external** | Needs a deployed target and a ZAP runner; not added as an unverified CI job. |
| 6 | Automated a11y checks in CI | **Done** | `app/e2e/a11y.spec.ts`: axe-core over twelve screens in both viewports, run as the `Accessibility (axe)` CI job. Zero serious/critical gate for every rule except colour contrast, which is ratcheted per screen in `project-control/BASELINE.json`; see `docs/A11Y_AUDIT.md` §6 for the four defects it found and fixed and the palette backlog it records. |
| 7 | PendingScreen specs | **Done earlier** | The registry reports 0 placeholder routes (`project-control/STATUS.json`). |

Also closed: the one built screen that still owed its designed mobile layout
(Dashboard, `project/Dashboard.Mobile.dc.html`) is implemented; BLK-006 and
BLK-013 no longer appear in `project-control/BLOCKERS.json`.

