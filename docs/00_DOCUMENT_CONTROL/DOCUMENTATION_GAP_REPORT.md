<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/control.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - every extractor
       - the docs/ tree
-->

# Documentation gap report

**Sources as of:** 2026-09-16

This report exists to be read before anything else in the set is relied on. It is generated, so it cannot be quietly improved by editing it.

## Headline

| Measure | Value |
| --- | --- |
| Required documents | 35 present of 35 |
| Documents generated from source | 120 |
| Documents authored by hand | 288 |
| Documents marked VERIFIED | **0** — see "What is not verified" below |
| Entities documented | 68 of 68 |
| Relationships documented | 164 (61 FK-backed, 103 convention only) |
| Endpoints documented | 372 of 372 |
| Endpoints with a linked test | 90 of 372 |
| Business rules documented | 30, each naming its enforcing function |
| Lifecycles with a declared transition table | 1 of 18 |
| Screens registered and mapped to a capability | 425 of 425 |
| Screens wired to the live API | 99 of 425 |
| Test suites catalogued | 180 containing 2111 cases |
| Capabilities with no linked test suite | 6 |
| Canonical registers at least 3 days behind the newest | 6 of 9 |
| Direct contradictions between registers | 3 |

## What is not verified

**No document in this set is marked VERIFIED, and that is deliberate.**

VERIFIED would mean a person or a test run confirmed the document against the implementation on a stated date. This generator can confirm that a document was *derived* from source — which is why the generated ones cannot drift — but derivation is not verification. A generated document faithfully reproduces a parse of the code; whether that parse captures what the code *means* is a human judgement.

Marking documents VERIFIED because a generator wrote them is precisely the self-certification this system was built to avoid.

## Gaps in the implementation that the documentation records

### 1. Referential integrity is not in the database

103 of 164 relationships have no foreign key. Orphaned references are possible and the database will not refuse them. This is an architectural position, not an oversight, but it is load-bearing and undocumented elsewhere.

### 2. One lifecycle in eighteen declares its legal transitions

`jobCard.JOB_STAGE_TRANSITIONS` has a transition table a single guard enforces. The other 17 lifecycles declare a state enum only; their legal moves are whatever the route handlers check. Those are listed individually in `docs/12_UML_BPMN_MODELS/STATE_MACHINES.md`.

### 3. 21 authenticated endpoints state no permission guard in the handler

| Method | Path | Declared in |
| --- | --- | --- |
| POST | `/api/v1/auth/2fa/enrol` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/2fa/verify` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/biometric/challenge` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/biometric/enrol` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/forgot-password` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/login` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/logout` | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/me` | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/providers` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/refresh` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/register` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/request-otp` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/reset-password` | `server/src/auth/routes.ts` |
| GET | `/api/v1/auth/sessions` | `server/src/auth/routes.ts` |
| DELETE | `/api/v1/auth/sessions/:id` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sessions/revoke-all` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/social/:provider` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sso/callback` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/sso/start` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/switch-role` | `server/src/auth/routes.ts` |
| POST | `/api/v1/auth/verify-otp` | `server/src/auth/routes.ts` |

Some of these guard through a shared helper or a `preHandler` this parser does not follow, so the number over-reports. Each still needs a human to confirm which.

### 4. 282 endpoints have no test matched to them by path

Matching is by path string, so a test that reaches an endpoint through a helper or a golden path does not match. The number over-reports and is still the right one to drive down.

### 5. 286 screens read design fixtures rather than the API

Measured in `project-control/STATUS.json`, not asserted here. Every screen renders and every screen has a content assertion — and 286 of 425 are not yet connected to live data.

## Implementation findings surfaced by documenting the system

Documenting a system end to end is an unusually good way to find things wrong with it, because it forces someone to follow every chain to its end rather than to the point where it stops being interesting. Each of these was verified against the source before it was written down, and each names the command that confirms it.

They are recorded in `project-control/DOCUMENTATION_FINDINGS.json`, which this toolchain owns. They are deliberately **not** appended to `project-control/FINDINGS.json`: that register belongs to engineering, and a documentation generator writing into it would make its provenance unclear and its regeneration destructive.

| ID | Severity | Area | Finding | Consequence |
| --- | --- | --- | --- | --- |
| DF-001 | HIGH | accounting | No API path writes to the general ledger | The accounting module presents figures that no business event has ever produced. A user reading a trial balance would reasonably assume it reflects their invoices; it does not. |
| DF-002 | HIGH | workshop / billing | checkInvoiceable is never called by the server | An invoice can be raised against a job card at any stage, or against no job card at all. The rule exists, is tested, and does not run in production. |
| DF-003 | HIGH | accounting | checkJournalBalanced is never called by the server | Nothing would refuse an unbalanced journal entry. The comment makes the gap harder to notice, not easier. |
| DF-004 | HIGH | inventory / procurement | Goods receipt does not move stock | Receiving a purchase order does not increase stock on hand. A storekeeper who receives goods still has to record a separate inventory movement, and nothing detects if they do not. |
| DF-005 | MEDIUM | governance | The approval inbox carries estimates only | An approver cannot see everything awaiting their decision in one place, so the approval ceiling is enforced per endpoint but not surfaced as a workload. |
| DF-006 | MEDIUM | audit / privacy | Bulk export is not audited | "Who exported the customer list, and when" cannot be answered from audit_log. For a system holding customer contact details under Saudi privacy expectations, export is the operation most worth recording. |
| DF-007 | MEDIUM | workshop | The document chain is broken at three joins | Each join is manual re-keying, which is where transcription errors enter a financial document chain. |

The four highest-severity findings share a shape worth naming: **a rule exists, is tested, and does not run.** `checkInvoiceable` and `checkJournalBalanced` are both defined, both unit-tested, and neither is called by any handler. A test suite that exercises a rule function directly proves the function is correct; it proves nothing about whether anything calls it. That is a gap no amount of test coverage closes, and it is why the traceability matrix links endpoints to tests rather than rules to tests.

### Resolved during this work

| ID | Finding | Note |
| --- | --- | --- |
| DF-008 | The API registry under-reported the surface by 69 endpoints | Fixed. Recorded because it is the failure mode this toolchain exists to prevent, and because it shows the limit of the approach: a parser reports what it can match, and what it cannot match is invisible rather than flagged. The Mermaid, capability-coverage and schema-completeness checks in docs:check exist for that reason. |

## The canonical registers disagree with each other

The registries under `project-control/` are each generated at their own time by their own tooling, and nothing makes them agree. The newest is `BLOCKERS.json` at 2026-09-12; 6 registers are at least 3 days behind it.

| Register | Generated | Days behind the newest |
| --- | --- | --- |
| `project-control/RISK_REGISTER.json` | 2026-08-11 | 32 |
| `project-control/DEPENDENCIES.json` | 2026-08-11 | 32 |
| `project-control/FINDINGS.json` | 2026-08-12 | 31 |
| `project-control/RELEASE_GATES.json` | 2026-09-02 | 10 |
| `project-control/BASELINE.json` | 2026-09-03 | 9 |
| `project-control/GOLDEN_PATHS.json` | 2026-09-06 | 5 |

Staleness alone would be tolerable. These are direct contradictions — one register quoting another's numbers from an earlier state, and reading as authoritative while disagreeing with the register it cites:

| Claim | Current reality |
| --- | --- |
| RELEASE_GATES.json gate RB-01 quotes 5 open blockers | BLOCKERS.json currently holds 3 |
| RELEASE_GATES.json gate RB-02 quotes 5 open blockers | BLOCKERS.json currently holds 3 |
| RELEASE_GATES.json gate RB-13 reports 4 failing golden paths | GOLDEN_PATHS.json records 23 of 23 passing and 0 failing |

A contradiction between two canonical registers is worse than a single stale document, because it carries the authority of two sources. It is reported rather than resolved here: picking a winner would hide the disagreement, which is the fact a reader most needs. Regenerating the stale registers is the fix, and it belongs to their owners rather than to the documentation toolchain.

## Gaps in the documentation itself

### Requirements are as-built, not as-elicited

The requirements catalogue is reverse-engineered from the implementation and says so on every row. There is no elicited, stakeholder-signed requirements baseline in this workspace, so the question "did we build what the business asked for" cannot be answered from these documents. Closing that needs a business analyst and a stakeholder, not a generator.

### Market and financial claims need evidence

Market sizing, competitor positioning, pricing and financial projections are business inputs, not properties of the code. Anything in `02_MARKET_BUSINESS_RESEARCH/` and `24_COMMERCIAL_FINANCIAL/` that is not sourced is marked `RESEARCH_REQUIRED`, and nothing in this set fabricates a figure to fill the space.

### Legal conclusions need a lawyer

ZATCA, VAT and privacy material states *system requirements* — what the software does and must do. Where the question is whether that satisfies a legal obligation, it is marked `LEGAL_REVIEW_REQUIRED` rather than answered.

### 31 documents are thin

Under 1.2 kB: a heading and a sentence or two. Some are legitimately short (an index, an ADR with a one-line decision); others are placeholders. They are listed so the difference can be judged rather than assumed.

| Document | Bytes |
| --- | --- |
| `docs/01_EXECUTIVE_STRATEGY/README.md` | 979 |
| `docs/02_MARKET_BUSINESS_RESEARCH/README.md` | 1040 |
| `docs/03_PRINCE2_GOVERNANCE/README.md` | 945 |
| `docs/04_PROJECT_MANAGEMENT/README.md` | 1071 |
| `docs/05_PLANNING/README.md` | 962 |
| `docs/06_AGILE_DELIVERY/README.md` | 901 |
| `docs/07_BUSINESS_ANALYSIS/README.md` | 564 |
| `docs/08_PRODUCT/README.md` | 913 |
| `docs/10_SCENARIOS_USE_CASES/README.md` | 669 |
| `docs/11_PROCESS_FLOW_MODELS/README.md` | 705 |
| `docs/12_UML_BPMN_MODELS/README.md` | 537 |
| `docs/13_DATA_MODELING/README.md` | 672 |
| `docs/14_SOLUTION_ARCHITECTURE/README.md` | 567 |
| `docs/15_C4_ARCHITECTURE_DIAGRAMS/README.md` | 531 |
| `docs/16_SYSTEM_DESIGN/README.md` | 1157 |
| `docs/17_API_INTEGRATION/endpoints/platform.md` | 948 |
| `docs/18_DATABASE/README.md` | 522 |
| `docs/19_SECURITY/README.md` | 1032 |
| `docs/20_UI_UX_EXPERIENCE/README.md` | 932 |
| `docs/22_PORTALS_CHANNELS/README.md` | 917 |
| `docs/23_BUSINESS_OPERATIONS/README.md` | 1003 |
| `docs/24_COMMERCIAL_FINANCIAL/README.md` | 966 |
| `docs/25_SALES_MARKETING_CUSTOMER_SUCCESS/README.md` | 984 |
| `docs/26_LEGAL_COMPLIANCE/README.md` | 1054 |
| `docs/27_TESTING_VALIDATION/README.md` | 989 |
| `docs/28_ITIL_SERVICE_MANAGEMENT/README.md` | 1066 |
| `docs/29_OPERATIONS_DEVOPS/README.md` | 1088 |
| `docs/30_RELEASE_CERTIFICATION/README.md` | 774 |
| `docs/31_ARCHITECTURE_DECISIONS/README.md` | 876 |
| `docs/32_METRICS_KPI_REPORTING/README.md` | 545 |
| `docs/33_MASTER_DIAGRAM_LIBRARY/ERD/INVENTORY_ERD.md` | 889 |


## Missing required documents

_None — every required document is present._

## Recommended next actions, in order

1. **Establish a requirements baseline.** Everything else in this set traces to the implementation; nothing traces to a stated business need. This is the largest structural gap.
2. **Declare transition tables for the remaining 17 lifecycles**, or document in each domain document where the transition is guarded. An invoice or a purchase order moving between states unguarded is a financial-control gap, not a documentation one.
3. **Confirm the 21 endpoints with no stated guard.** Each is either guarded through a helper (fix the documentation) or genuinely open (fix the code).
4. **Drive the 282 path-unmatched endpoints down**, starting with the write endpoints that move money or stock.
5. **Decide the foreign-key position explicitly.** Either add constraints or record an ADR saying integrity is the application's job and why.
6. **Connect the remaining 286 screens to the API**, which is the bulk of the product work still outstanding.
7. **Complete the documentation migration** in `DOCUMENTATION_MIGRATION_MANIFEST.md`, one section per change so each move is reviewable.
