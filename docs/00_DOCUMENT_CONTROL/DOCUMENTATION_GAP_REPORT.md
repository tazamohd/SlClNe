<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/control.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - every extractor
       - the docs/ tree
-->

# Documentation gap report

**Sources as of:** 2026-09-18

This report exists to be read before anything else in the set is relied on. It is generated, so it cannot be quietly improved by editing it.

## Headline

| Measure | Value |
| --- | --- |
| Required documents | 35 present of 35 |
| Documents generated from source | 120 |
| Documents authored by hand | 289 |
| Documents marked VERIFIED | **0** — see "What is not verified" below |
| Entities documented | 75 of 75 |
| Relationships documented | 192 (68 FK-backed, 124 convention only) |
| Endpoints documented | 431 of 431 |
| Endpoints with a linked test | 116 of 431 |
| Business rules documented | 30, each naming its enforcing function |
| Lifecycles with a declared transition table | 1 of 20 |
| Screens registered and mapped to a capability | 430 of 430 |
| Screens wired to the live API | 142 of 430 |
| Test suites catalogued | 202 containing 2292 cases |
| Capabilities with no linked test suite | 5 |
| Canonical registers at least 3 days behind the newest | 5 of 9 |
| Direct contradictions between registers | 3 |

## What is not verified

**No document in this set is marked VERIFIED, and that is deliberate.**

VERIFIED would mean a person or a test run confirmed the document against the implementation on a stated date. This generator can confirm that a document was *derived* from source — which is why the generated ones cannot drift — but derivation is not verification. A generated document faithfully reproduces a parse of the code; whether that parse captures what the code *means* is a human judgement.

Marking documents VERIFIED because a generator wrote them is precisely the self-certification this system was built to avoid.

## Gaps in the implementation that the documentation records

### 1. Referential integrity is not in the database

124 of 192 relationships have no foreign key. Orphaned references are possible and the database will not refuse them. This is an architectural position, not an oversight, but it is load-bearing and undocumented elsewhere.

### 2. One lifecycle in eighteen declares its legal transitions

`jobCard.JOB_STAGE_TRANSITIONS` has a transition table a single guard enforces. The other 19 lifecycles declare a state enum only; their legal moves are whatever the route handlers check. Those are listed individually in `docs/12_UML_BPMN_MODELS/STATE_MACHINES.md`.

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

### 4. 315 endpoints have no test matched to them by path

Matching is by path string, so a test that reaches an endpoint through a helper or a golden path does not match. The number over-reports and is still the right one to drive down.

### 5. 226 screens read design fixtures rather than the API

Measured in `project-control/STATUS.json`, not asserted here. Every screen renders and every screen has a content assertion — and 226 of 430 are not yet connected to live data.

## Implementation findings surfaced by documenting the system

Documenting a system end to end is an unusually good way to find things wrong with it, because it forces someone to follow every chain to its end rather than to the point where it stops being interesting. Each of these was verified against the source before it was written down, and each names the command that confirms it.

They are recorded in `project-control/DOCUMENTATION_FINDINGS.json`, which this toolchain owns. They are deliberately **not** appended to `project-control/FINDINGS.json`: that register belongs to engineering, and a documentation generator writing into it would make its provenance unclear and its regeneration destructive.

_None._

The four findings that shared one shape — **a rule exists, is tested, and does not run** — are now closed. `checkInvoiceable` and `checkJournalBalanced` were both defined, both unit-tested, and called by no handler. A suite that exercises a rule function directly proves the function is correct and proves nothing about whether anything calls it; that is a gap no amount of coverage closes, and it is why the traceability matrix links endpoints to tests rather than rules to tests.

### Resolved

| ID | Finding | How it was closed |
| --- | --- | --- |
| DF-001 | No API path writes to the general ledger | server/src/accounting/posting.ts posts through one function, and three events now call it: invoice issue (Dr receivables, Cr revenue, Cr VAT payable), payment capture (Dr cash, Cr receivables) and goods receipt (Dr inventory and operating expenses, Cr accounts payable). Account balances move with the lines, inside the same transaction as the business write. Migration 0015 adds the journal_lines table the ledger needed to be double-entry at all. Payroll posting is still absent — it has no route that completes a run. |
| DF-002 | checkInvoiceable is never called by the server | routes/invoices.ts calls it when an invoice names a job card, refusing one raised against a job that has not reached delivery. |
| DF-003 | checkJournalBalanced is never called by the server | postJournalEntry runs it over the lines before writing anything and fails the transaction when they do not balance. The rule needed lines to be called with at all, which is why migration 0015 had to come first. The misleading comment in routes/finance-reports.ts now states the narrower claim that is actually true: posted entries are checked, the seeded ones have no lines and are not. |
| DF-004 | Goods receipt does not move stock | Receiving now locks the part by SKU, raises on_hand and writes an inventory_movements row referencing the purchase order. The route header had recorded a deliberate decision not to do this, on the grounds that booking stock for the lines that resolve and silently skipping the rest would be half-wired — a fair objection. It is answered by making the skip loud rather than by leaving stock unmoved: every received line comes back as stocked, with the part and new on-hand, or notStocked, with the reason, in both the response and the audit row. |
| DF-005 | The approval inbox carries estimates only | routes/approvals.ts carries four sources: estimates ('sent'), requisitions ('submitted'), purchase orders ('draft') and insurance claims ('submitted'/'under_review') — every document with a ceiling-gated approve endpoint behind it. Each source folds in only when the caller holds view on that source's own module, each row carries the caller's standing computed server-side, and each names the endpoint that decides it (approvePath / rejectPath), so a mixed queue cannot post a requisition to /estimates/:id/approve. A byKind roll-up sits beside byModule, because requisitions and purchase orders share the procurement module. The ApprovalInbox screen renders the mixed queue and actions each row against its own path. |
| DF-006 | Bulk export is not audited | The export route writes an audit row with action 'export', inside the same transaction that gathered the rows, so there is no state in which the data left and the record of it did not. It records the actor, the collection, the row count that actually left, the total in scope, whether the egress cap truncated it, and the narrowing (q, sort, filter, includeDeleted) — because which rows left is as much the question as how many. entityId is null: an export acts on a set, not a record. A refused export writes nothing, which is correct — requirePermission throws before the transaction opens and nothing was disclosed. |
| DF-007 | The document chain is broken at three joins | All three joins are endpoints, and migration 0016 adds the columns they write. POST /estimates/:id/invoice raises a draft invoice from an approved estimate, copying the lines from the database rather than the request, recomputing the totals with the same function the estimate used and refusing when they no longer match what was approved; invoices.estimate_id carries a partial unique index, so one estimate bills once even under a race. POST /estimates/:id/verify-approval-otp now writes the verified signature back to the estimate (customer_signed_at, channel, challenge id). POST /appointments/:id/job-card opens a job card from a kept appointment, copying the customer, vehicle and booked technician across and closing the booking out; job_cards.appointment_id carries the same kind of partial unique index. |
| DF-008 | The API registry under-reported the surface by 69 endpoints | Fixed. Recorded because it is the failure mode this toolchain exists to prevent, and because it shows the limit of the approach: a parser reports what it can match, and what it cannot match is invisible rather than flagged. The Mermaid, capability-coverage and schema-completeness checks in docs:check exist for that reason. |

One of them is closed only in part, and says so rather than reading as finished:

| ID | What remains |
| --- | --- |
| DF-002 | Only half the rule. It cannot run when no job card is named, and jobCardId is optional in the contract and nullable in the schema. An invoice with no job card behind it — a parts-only sale, a fee — is a real case, so requiring one is a product decision rather than a bug fix, and is left open deliberately rather than closed quietly. |
| DF-005 | Payroll runs are deliberately not a source, and the finding named them. POST /payroll/runs/:id/post is gated on hr:e and documented in routes/payroll.ts as 'an edit of the run, not an approval against a ceiling'. There is no approve endpoint, no ceiling and no submitter check, so a payroll row would carry an approval standing the server does not enforce and an action the client could not take. Modelling payroll posting as an approval is a product decision, not a bug fix; a test pins the absence so it stays a decision. |
| DF-007 | The OTP verification deliberately does NOT move estimates.status to 'approved', which is what the finding's wording asked for. 'approved' means the shop authorised the spend, and POST /estimates/:id/approve gates that on the role's SAR ceiling and on segregation of duties. A code typed from a customer's phone must not route around either, so the customer's acceptance is persisted as its own first-class fact on the row beside the internal decision rather than as a substitute for it. That makes the signature readable without trawling audit_log, which was the gap, without weakening an approval gate. Separately, the CustomerApproval screen is still not wired to these endpoints. |

## The canonical registers disagree with each other

The registries under `project-control/` are each generated at their own time by their own tooling, and nothing makes them agree. The newest is `BLOCKERS.json` at 2026-09-18; 5 registers are at least 3 days behind it.

| Register | Generated | Days behind the newest |
| --- | --- | --- |
| `project-control/RISK_REGISTER.json` | 2026-08-11 | 38 |
| `project-control/DEPENDENCIES.json` | 2026-08-11 | 38 |
| `project-control/FINDINGS.json` | 2026-08-12 | 37 |
| `project-control/RELEASE_GATES.json` | 2026-09-02 | 16 |
| `project-control/BASELINE.json` | 2026-09-03 | 15 |

Staleness alone would be tolerable. These are direct contradictions — one register quoting another's numbers from an earlier state, and reading as authoritative while disagreeing with the register it cites:

| Claim | Current reality |
| --- | --- |
| RELEASE_GATES.json gate RB-01 quotes 5 open blockers | BLOCKERS.json currently holds 1 |
| RELEASE_GATES.json gate RB-02 quotes 5 open blockers | BLOCKERS.json currently holds 1 |
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
2. **Declare transition tables for the remaining 19 lifecycles**, or document in each domain document where the transition is guarded. An invoice or a purchase order moving between states unguarded is a financial-control gap, not a documentation one.
3. **Confirm the 21 endpoints with no stated guard.** Each is either guarded through a helper (fix the documentation) or genuinely open (fix the code).
4. **Drive the 315 path-unmatched endpoints down**, starting with the write endpoints that move money or stock.
5. **Decide the foreign-key position explicitly.** Either add constraints or record an ADR saying integrity is the application's job and why.
6. **Connect the remaining 226 screens to the API**, which is the bulk of the product work still outstanding.
7. **Complete the documentation migration** in `DOCUMENTATION_MIGRATION_MANIFEST.md`, one section per change so each move is reviewable.
