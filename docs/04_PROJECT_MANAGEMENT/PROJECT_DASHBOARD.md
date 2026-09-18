<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/governance.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/RISK_REGISTER.json
       - project-control/BLOCKERS.json
       - project-control/FINDINGS.json
       - project-control/RELEASE_GATES.json
       - project-control/DEPENDENCIES.json
       - project-control/OWNERSHIP.json
       - project-control/STATUS.json
-->

# Project dashboard

**Status:** GENERATED · **Sources as of:** 2026-09-18

A view over the canonical registers. Nothing here is entered by hand; if a number looks wrong, the register is wrong.

## Where the project is

| Measure | Value | Source |
| --- | --- | --- |
| Registered capabilities | 428 | `STATUS.json` |
| Rendering | 428 of 428 | `STATUS.json` |
| Wired to the API | 115 of 428 | `STATUS.json` |
| Reading design fixtures | 273 of 428 | `STATUS.json` |
| End-to-end covered | 428 of 428 | `STATUS.json` |
| Golden paths passing | 23 of 23 | `GOLDEN_PATHS.json` |
| Arabic verified | 79 of 428 | `STATUS.json` |
| Tablet verified | 4 of 428 | `STATUS.json` |
| API endpoints | 385 | the route files |
| Test cases | 2209 | the spec files |
| Open risks | 10 of 11 | `RISK_REGISTER.json` |
| Open blockers | 2 | `BLOCKERS.json` |
| Unresolved findings | 11 of 36 | `FINDINGS.json` |
| Release gates passing | 8 of 14 | `RELEASE_GATES.json` |

## The one number that matters most

**273 of 428 screens still read design fixtures rather than the API.** Everything else on this dashboard looks healthier than the project is, because "renders and is asserted" is a genuine achievement that is not the same as "works against the server". Read every other row against that one.

## Open blockers

| ID | Severity | Title | What to do | Owner |
| --- | --- | --- | --- | --- |
| BLK-004 | CRITICAL | 273 rendered capabilities are mock-only | They render, but read fixtures rather than an API. Cleared per capability as G4+ lands. | 05 |
| BLK-010 | MEDIUM | 10 screen files are unreachable from any route | src/screens/public/landing/CommandDeck.tsx, src/screens/public/landing/PageNav.tsx, src/screens/public/landing/homepage/SocialProofBand.tsx, src/screens/public/landing/pages/AccessPage.tsx, src/screens/public/landing/pages/ChannelPage.tsx, src/screens/public/landing/pages/GridPage.tsx, src/screens/public/landing/pages/IndexPage.tsx, src/screens/public/landing/pages/OriginPage.tsx, src/screens/public/landing/pages/SystemPage.tsx, src/screens/public/landing/useLandingMotion.ts | 02 |

## Open risks

| ID | Risk | Likelihood | Impact | Status | Owner |
| --- | --- | --- | --- | --- | --- |
| R-02 | This environment cannot push to the remote | occurred | medium | open | 01 |
| R-03 | Three GitHub PATs were pasted in chat | occurred | high | open | 06 |
| R-04 | The repository is public | certain | medium | open | 01 |
| R-05 | Shared-file contention across ten concurrent product agents | likely | high | open | 01 |
| R-06 | The design bundle violates its own brand rules | occurred | low | open | 04 |
| R-07 | Estimates assume no rework | likely | medium | open | 01 |
| R-08 | Feature-map screens have no design, only a screenshot and a templated spec | certain | medium | accepted | 02 |
| R-09 | Twelve capabilities depend on hardware or paid services we do not have | certain | low | accepted | 02 |
| R-10 | Mock-to-API swap could silently change behaviour | possible | high | open | 05 |
| R-11 | Agents claiming completion without evidence | likely | high | open | 03 |

## Release gates

| Gate | Status | Evidence |
| --- | --- | --- |
| RB-01 — No P0 defect open | _uncheckable_ | No defect tracker exists in this repository, and no artefact in it uses P0 severity. The nearest two are project-control/BLOCKERS.json (5 open: 2 BLOCKER, 1 CRITICAL, 1 HIGH, 1 MEDIUM) and project-control/FINDINGS.json ( |
| RB-02 — No P1 defect open | _uncheckable_ | No defect tracker exists in this repository, and no artefact in it uses P1 severity. The nearest two are project-control/BLOCKERS.json (5 open: 2 BLOCKER, 1 CRITICAL, 1 HIGH, 1 MEDIUM) and project-control/FINDINGS.json ( |
| RB-03 — No critical golden-path failure | **FAIL** | project-control/GOLDEN_PATHS.json (written by the golden-path runner, not by this checker) reports 16 of 23 named paths FAILING: New customer to paid invoice, Existing customer service, Technician job completion, Parts p |
| RB-04 — No cross-tenant access in the RBAC lab | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 36 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/estimate-money.test.ts, tests/export.test.t |
| RB-05 — No unauthorized financial operation | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 51 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/authz-matrix.test.ts, tests/authz-sod.test. |
| RB-06 — No financial calculation corruption | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 29 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/estimate-money.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts |
| RB-07 — No inventory corruption | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/inventory-enforcement.test.ts, tests/procurement.test.ts, tests/rules.test |
| RB-08 — No authentication bypass | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/auth.test.ts, tests/isolation.test.ts, tests/security.test.ts); whole run  |
| RB-09 — No critical security vulnerability | pass | `npm audit --json` in app/, server/ and packages/contract/ — app: 0 critical, 0 high, 5 moderate, 0 low; server: 0 critical, 0 high, 4 moderate, 0 low; packages/contract: 0 critical, 0 high, 0 moderate, 0 low. No critica |
| RB-10 — No exposed secret (three chat-exposed PATs rotated) | **FAIL** | built-in prefix rules (gitleaks is not installed here) over the working tree only, not git history (2303 files, 26.3 MB, rules: github-pat, github-fine-grained-pat, aws-access-key-id, private-key-block, slack-token, goog |
| RB-11 — No major data loss path | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 7 mapped assertion(s) passed across 3 suite file(s) (tests/api.test.ts, tests/authz-matrix.test.ts, tests/writes.test.ts); whole run 2473/2473 passed, 0  |
| RB-12 — Backup restore drill passed | _uncheckable_ | A restore drill is an operation against real infrastructure — take a backup of the production database, restore it into a clean instance, and verify the restored data — and no part of it can be decided from source. No dr |
| RB-13 — No broken critical mobile workflow | **FAIL** | 4 of 7 phone- and kiosk-facing golden path(s) fail in the mobile project (390x840) of the Playwright suite, per project-control/GOLDEN_PATHS.json: Customer portal; Supplier portal; Kiosk; Inventory consumption. 1 fail on |
| RB-14 — Invoice and payment workflows intact | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 23 mapped assertion(s) passed across 5 suite file(s) (tests/api.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts, t |

**3 gates are uncheckable**, which is not the same as passing. A gate with no artefact to check against cannot be evidence for a release decision, and treating it as a pass is how a gate becomes ceremony.

## Delivery waves

_No wave plan recorded._
