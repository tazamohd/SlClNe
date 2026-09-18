<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/release.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/STATUS.json
       - project-control/BLOCKERS.json
       - the extractors
-->

# Production readiness

**Sources as of:** 2026-09-18 · **8 of 15 criteria met**

Each criterion names the evidence that decided it. No criterion is marked met on judgement alone.

| ID | Criterion | Met | Evidence |
| --- | --- | --- | --- |
| PR-01 | Every registered screen renders | yes | project-control/STATUS.json — placeholder: 0 |
| PR-02 | Every screen has an end-to-end assertion on its content | yes | contentAsserted: 428 of 428 |
| PR-03 | Golden paths pass | yes | 23 passing, 0 failing, 0 unwritten |
| PR-04 | Screens are wired to the live API rather than design fixtures | **no** | mockOnly: 277 of 428 |
| PR-05 | Tenant isolation covers every tenant-scoped table | yes | 66 tables with RLS, all FORCEd; 0 uncovered |
| PR-06 | The permission matrix is enforced server-side and the two copies are asserted identical | yes | server/tests/rbac-parity.test.ts |
| PR-07 | Segregation of duties is enforced, not advisory | yes | server/tests/authz-sod.test.ts |
| PR-08 | The audit log is append-only at the database level | yes | server/drizzle/0011_audit_log_statement_immutability.sql |
| PR-09 | RTL hazards are at zero | yes | rtlHazards: 0 |
| PR-10 | Arabic is verified on every screen | **no** | arabicVerified: 79 of 428 |
| PR-11 | Tablet layouts are verified | **no** | tabletVerified: 4 of 428 |
| PR-12 | Every endpoint has a test matched to it | **no** | 277 of 385 unmatched by path |
| PR-13 | No open release blocker | **no** | project-control/BLOCKERS.json |
| PR-14 | Every lifecycle that moves money or stock declares its legal transitions | **no** | 1 of 19 declared |
| PR-15 | A requirements baseline exists that traces to stated business need | **no** | Requirements in this set are IMPLEMENTATION_DERIVED. No elicited baseline exists in the workspace. |

## What the failing criteria mean together

The product is much further along than a 8-of-15 score suggests, and the score is still the right one to publish. Every screen exists, renders, and is asserted; isolation, authorization and audit are enforced by the database and the server rather than by convention. What is not done is the part that only shows up in production: **277 of 428 screens still read design fixtures**, so a large share of the product has never exchanged a byte with the API under real conditions.

That single fact is why the remaining criteria fail the way they do, and why a release decision should turn on it rather than on the overall count.
