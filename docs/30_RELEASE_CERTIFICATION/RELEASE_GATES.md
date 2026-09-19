<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/governance.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/RELEASE_GATES.json
-->

# Release gates

**Status:** GENERATED · **Sources as of:** 2026-09-19

14 gates: 11 passing, 0 failing, 3 uncheckable.

## Uncheckable is not passing

3 gates cannot be evaluated, because the artefact they check against does not exist in this repository — no defect tracker, no production telemetry, no signed acceptance record. A gate with nothing to check is not evidence for a release decision, and counting it as a pass is how a gate becomes ceremony. They are reported separately here for that reason.

## All gates

| ID | Gate | Status | Evidence |
| --- | --- | --- | --- |
| RB-01 | No P0 defect open | UNCHECKABLE | No defect tracker exists in this repository, and no artefact in it uses P0 severity. The nearest two are project-control/BLOCKERS.json (2 open: 1 CRITICAL, 1 HIGH) and project-control/FINDINGS.json (0 unresolved: none). BLOCKERS.json is computed from the registry rather than being a defect log, and  |
| RB-02 | No P1 defect open | UNCHECKABLE | No defect tracker exists in this repository, and no artefact in it uses P1 severity. The nearest two are project-control/BLOCKERS.json (2 open: 1 CRITICAL, 1 HIGH) and project-control/FINDINGS.json (0 unresolved: none). BLOCKERS.json is computed from the registry rather than being a defect log, and  |
| RB-03 | No critical golden-path failure | PASS | project-control/GOLDEN_PATHS.json reports all 23 golden paths PASSING. |
| RB-04 | No cross-tenant access in the RBAC lab | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 36 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/estimate-money.test.ts, tests/export.test.ts, tests/finance-reports.test.ts, tests/history-read.test.ts, tests/isolation.te |
| RB-05 | No unauthorized financial operation | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 59 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/authz-matrix.test.ts, tests/authz-sod.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.t |
| RB-06 | No financial calculation corruption | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 33 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/estimate-money.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts); whole run 726/726 passed, 0 failed, 0 skipped in 99.8s. Row-level security wa |
| RB-07 | No inventory corruption | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/inventory-enforcement.test.ts, tests/procurement.test.ts, tests/rules.test.ts); whole run 726/726 passed, 0 failed, 0 skipped in 99.8s. Row-level security |
| RB-08 | No authentication bypass | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 48 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/auth.test.ts, tests/isolation.test.ts, tests/security.test.ts); whole run 726/726 passed, 0 failed, 0 skipped in 99.8s. Row-level security was in force: D |
| RB-09 | No critical security vulnerability | PASS | `npm audit --json` in app/, server/ and packages/contract/ — app: 0 critical, 0 high, 8 moderate, 0 low; server: 0 critical, 0 high, 4 moderate, 0 low; packages/contract: 0 critical, 0 high, 0 moderate, 0 low. No critical advisory anywhere and no high advisory reaching a production dependency. Faili |
| RB-10 | No exposed secret (three chat-exposed PATs rotated) | PASS | built-in prefix rules (gitleaks is not installed here) over the working tree only, not git history (2660 files, 31.5 MB, rules: github-pat, github-fine-grained-pat, aws-access-key-id, private-key-block, slack-token, google-api-key, stripe-live-key, npm-token) — 0 finding(s). CI secret scanning is co |
| RB-11 | No major data loss path | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 7 mapped assertion(s) passed across 3 suite file(s) (tests/api.test.ts, tests/authz-matrix.test.ts, tests/writes.test.ts); whole run 726/726 passed, 0 failed, 0 skipped in 99.8s. Row-level security was in force: DATABASE_URL connects |
| RB-12 | Backup restore drill passed | UNCHECKABLE | A restore drill is an operation against real infrastructure — take a backup of the production database, restore it into a clean instance, and verify the restored data — and no part of it can be decided from source. No drill record exists either: looked for project-control/BACKUP_RESTORE_DRILL.json,  |
| RB-13 | No broken critical mobile workflow | PASS | All 6 phone- and kiosk-facing golden path(s) pass in the mobile project (390x840) of the Playwright suite, per project-control/GOLDEN_PATHS.json (projects: desktop, mobile). Note this covers workflow completion at a phone viewport, not layout quality: BLK-008 (tablet 768-1024) is a separate, still-o |
| RB-14 | Invoice and payment workflows intact | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 25 mapped assertion(s) passed across 5 suite file(s) (tests/api.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts, tests/writes.test.ts); whole run 726/726 passed, 0 failed, 0 skipped in 99.8s. Ro |
