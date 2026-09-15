<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/governance.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/RELEASE_GATES.json
-->

# Release gates

**Status:** GENERATED · **Sources as of:** 2026-09-15

14 gates: 8 passing, 3 failing, 3 uncheckable.

## Uncheckable is not passing

3 gates cannot be evaluated, because the artefact they check against does not exist in this repository — no defect tracker, no production telemetry, no signed acceptance record. A gate with nothing to check is not evidence for a release decision, and counting it as a pass is how a gate becomes ceremony. They are reported separately here for that reason.

## All gates

| ID | Gate | Status | Evidence |
| --- | --- | --- | --- |
| RB-01 | No P0 defect open | UNCHECKABLE | No defect tracker exists in this repository, and no artefact in it uses P0 severity. The nearest two are project-control/BLOCKERS.json (5 open: 2 BLOCKER, 1 CRITICAL, 1 HIGH, 1 MEDIUM) and project-control/FINDINGS.json (12 unresolved: 2 MEDIUM, 10 LOW). BLOCKERS.json is computed from the registry ra |
| RB-02 | No P1 defect open | UNCHECKABLE | No defect tracker exists in this repository, and no artefact in it uses P1 severity. The nearest two are project-control/BLOCKERS.json (5 open: 2 BLOCKER, 1 CRITICAL, 1 HIGH, 1 MEDIUM) and project-control/FINDINGS.json (12 unresolved: 2 MEDIUM, 10 LOW). BLOCKERS.json is computed from the registry ra |
| RB-03 | No critical golden-path failure | FAIL | project-control/GOLDEN_PATHS.json (written by the golden-path runner, not by this checker) reports 16 of 23 named paths FAILING: New customer to paid invoice, Existing customer service, Technician job completion, Parts procurement, Inventory receiving, Inventory consumption, Supplier order, CRM lead |
| RB-04 | No cross-tenant access in the RBAC lab | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 36 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/estimate-money.test.ts, tests/export.test.ts, tests/finance-reports.test.ts, tests/history-read.test.ts, tests/isolation.te |
| RB-05 | No unauthorized financial operation | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 51 mapped assertion(s) passed across 8 suite file(s) (tests/api.test.ts, tests/approvals-queue.test.ts, tests/authz-matrix.test.ts, tests/authz-sod.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.t |
| RB-06 | No financial calculation corruption | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 29 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/estimate-money.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts); whole run 2473/2473 passed, 0 failed, 0 skipped in 52.6s. Row-level security  |
| RB-07 | No inventory corruption | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/inventory-enforcement.test.ts, tests/procurement.test.ts, tests/rules.test.ts); whole run 2473/2473 passed, 0 failed, 0 skipped in 52.6s. Row-level securi |
| RB-08 | No authentication bypass | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 38 mapped assertion(s) passed across 4 suite file(s) (tests/api.test.ts, tests/auth.test.ts, tests/isolation.test.ts, tests/security.test.ts); whole run 2473/2473 passed, 0 failed, 0 skipped in 52.6s. Row-level security was in force: |
| RB-09 | No critical security vulnerability | PASS | `npm audit --json` in app/, server/ and packages/contract/ — app: 0 critical, 0 high, 5 moderate, 0 low; server: 0 critical, 0 high, 4 moderate, 0 low; packages/contract: 0 critical, 0 high, 0 moderate, 0 low. No critical advisory anywhere and no high advisory reaching a production dependency. Faili |
| RB-10 | No exposed secret (three chat-exposed PATs rotated) | FAIL | built-in prefix rules (gitleaks is not installed here) over the working tree only, not git history (2303 files, 26.3 MB, rules: github-pat, github-fine-grained-pat, aws-access-key-id, private-key-block, slack-token, google-api-key, stripe-live-key, npm-token) — 0 finding(s). CI secret scanning is co |
| RB-11 | No major data loss path | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 7 mapped assertion(s) passed across 3 suite file(s) (tests/api.test.ts, tests/authz-matrix.test.ts, tests/writes.test.ts); whole run 2473/2473 passed, 0 failed, 0 skipped in 52.6s. Row-level security was in force: DATABASE_URL connec |
| RB-12 | Backup restore drill passed | UNCHECKABLE | A restore drill is an operation against real infrastructure — take a backup of the production database, restore it into a clean instance, and verify the restored data — and no part of it can be decided from source. No drill record exists either: looked for project-control/BACKUP_RESTORE_DRILL.json,  |
| RB-13 | No broken critical mobile workflow | FAIL | 4 of 7 phone- and kiosk-facing golden path(s) fail in the mobile project (390x840) of the Playwright suite, per project-control/GOLDEN_PATHS.json: Customer portal; Supplier portal; Kiosk; Inventory consumption. 1 fail on mobile while passing on desktop, which is a phone-specific break rather than a  |
| RB-14 | Invoice and payment workflows intact | PASS | `npx vitest run --reporter=json --outputFile=<tmp> (in server/)` — 23 mapped assertion(s) passed across 5 suite file(s) (tests/api.test.ts, tests/collections.test.ts, tests/finance-reports.test.ts, tests/rules.test.ts, tests/writes.test.ts); whole run 2473/2473 passed, 0 failed, 0 skipped in 52.6s.  |
