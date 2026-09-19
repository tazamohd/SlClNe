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

**Status:** GENERATED · **Sources as of:** 2026-09-19

A view over the canonical registers. Nothing here is entered by hand; if a number looks wrong, the register is wrong.

## Where the project is

| Measure | Value | Source |
| --- | --- | --- |
| Registered capabilities | 436 | `STATUS.json` |
| Rendering | 436 of 436 | `STATUS.json` |
| Wired to the API | 161 of 436 | `STATUS.json` |
| Reading design fixtures | 37 of 436 | `STATUS.json` |
| End-to-end covered | 436 of 436 | `STATUS.json` |
| Golden paths passing | 23 of 23 | `GOLDEN_PATHS.json` |
| Arabic verified | 118 of 436 | `STATUS.json` |
| Tablet verified | 4 of 436 | `STATUS.json` |
| API endpoints | 508 | the route files |
| Test cases | 2440 | the spec files |
| Open risks | 9 of 11 | `RISK_REGISTER.json` |
| Open blockers | 2 | `BLOCKERS.json` |
| Unresolved findings | 0 of 43 | `FINDINGS.json` |
| Release gates passing | 11 of 14 | `RELEASE_GATES.json` |

## The one number that matters most

**37 of 436 screens still read design fixtures rather than the API.** Everything else on this dashboard looks healthier than the project is, because "renders and is asserted" is a genuine achievement that is not the same as "works against the server". Read every other row against that one.

## Open blockers

| ID | Severity | Title | What to do | Owner |
| --- | --- | --- | --- | --- |
| BLK-004 | CRITICAL | 37 rendered capabilities are mock-only | They render, but read fixtures rather than an API. Auth and public pages read no collection by design, and honest gap states (NO_BACKEND) are counted under BLK-013, not here. Cleared per capability as G4+ lands. | 05 |
| BLK-013 | HIGH | 117 rendered capabilities have no backend collection yet | They show an honest empty state naming the missing collection rather than fixture data. Cleared per capability as the API grows to serve it. | 05 |

## Open risks

| ID | Risk | Likelihood | Impact | Status | Owner |
| --- | --- | --- | --- | --- | --- |
| R-02 | This environment cannot push to the remote | occurred | medium | open | 01 |
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
| RB-01 — No P0 defect open | _uncheckable_ | No defect tracker exists in this repository, and no artefact in it uses P0 severity. The nearest two are project-control/BLOCKERS.json (2 open: 1 CRITICAL, 1 HIGH) and project-control/FINDINGS.json (0 unresolved: none).  |
| RB-02 — No P1 defect open | _uncheckable_ | No defect tracker exists in this repository, and no artefact in it uses P1 severity. The nearest two are project-control/BLOCKERS.json (2 open: 1 CRITICAL, 1 HIGH) and project-control/FINDINGS.json (0 unresolved: none).  |
| RB-03 — No critical golden-path failure | pass | project-control/GOLDEN_PATHS.json reports all 23 golden paths PASSING. |
| RB-04 — No cross-tenant access in the RBAC lab | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 36 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/estimate-money.test.ts, tests/export.test.t |
| RB-05 — No unauthorized financial operation | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 59 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/authz-matrix.test.ts, tests/authz-sod.test. |
| RB-06 — No financial calculation corruption | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 33 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/estimate-money.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts |
| RB-07 — No inventory corruption | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/inventory-enforcement.test.ts, tests/procurement.test.ts, tests/rules.test |
| RB-08 — No authentication bypass | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 48 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/auth.test.ts, tests/isolation.test.ts, tests/security.test.ts); whole run  |
| RB-09 — No critical security vulnerability | pass | `npm audit --json` in app/, server/ and packages/contract/ — app: 0 critical, 0 high, 8 moderate, 0 low; server: 0 critical, 0 high, 4 moderate, 0 low; packages/contract: 0 critical, 0 high, 0 moderate, 0 low. No critica |
| RB-10 — No exposed secret (three chat-exposed PATs rotated) | pass | built-in prefix rules (gitleaks is not installed here) over the working tree only, not git history (2660 files, 31.5 MB, rules: github-pat, github-fine-grained-pat, aws-access-key-id, private-key-block, slack-token, goog |
| RB-11 — No major data loss path | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 7 mapped assertion(s) passed across 3 suite file(s) (tests/api.test.ts, tests/authz-matrix.test.ts, tests/writes.test.ts); whole run 726/726 passed, 0 fa |
| RB-12 — Backup restore drill passed | _uncheckable_ | A restore drill is an operation against real infrastructure — take a backup of the production database, restore it into a clean instance, and verify the restored data — and no part of it can be decided from source. No dr |
| RB-13 — No broken critical mobile workflow | pass | All 6 phone- and kiosk-facing golden path(s) pass in the mobile project (390x840) of the Playwright suite, per project-control/GOLDEN_PATHS.json (projects: desktop, mobile). Note this covers workflow completion at a phon |
| RB-14 — Invoice and payment workflows intact | pass | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 25 mapped assertion(s) passed across 5 suite file(s) (tests/api.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts, t |

**3 gates are uncheckable**, which is not the same as passing. A gate with no artefact to check against cannot be evidence for a release decision, and treating it as a pass is how a gate becomes ceremony.

## Delivery waves

_No wave plan recorded._
