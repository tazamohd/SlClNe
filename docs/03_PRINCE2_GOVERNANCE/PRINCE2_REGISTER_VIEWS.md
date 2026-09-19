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

# PRINCE2 register views

**Status:** GENERATED · **Sources as of:** 2026-09-19

## How PRINCE2 is applied here

PRINCE2 asks for a risk register, an issue register, a quality register and a lessons log. This project keeps **one** register of each fact, under `project-control/`, and presents PRINCE2 views over them. A second copy formatted as a PRINCE2 register would diverge from the first within a fortnight, and the governance meeting would then be run off the stale one.

| PRINCE2 artefact | Canonical source | View |
| --- | --- | --- |
| Risk Register | `project-control/RISK_REGISTER.json` | This document, and the project dashboard |
| Issue Register | `project-control/FINDINGS.json` | This document |
| Quality Register | `project-control/RELEASE_GATES.json` + `TEST_REGISTRY.json` | This document, and the test catalogue |
| Product Register | `project-control/MASTER_REGISTRY.json` | The screen registry |
| Daily Log / blockers | `project-control/BLOCKERS.json` | The project dashboard |
| Project Plan / stages | `project-control/DEPENDENCIES.json` (waves) | The project dashboard |
| Business Case | `docs/project-management/prince2/business-case.md` | Authored, pre-existing — see the migration manifest |
| Project Initiation Documentation | `docs/project-management/prince2/project-initiation-document.md` | Authored, pre-existing |
| Product Descriptions | `docs/project-management/prince2/product-descriptions.md` | Authored, pre-existing |

## Risk register (PRINCE2 view)

| ID | Risk | Probability | Impact | Response status | Owner | Detail |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Divergent git histories between the cloud session and the local clone | occurred | high | mitigated | 01 | Five commits of screen work (registries, parts network, accounting, CRM, customer app) existed only in the cloud container and were never on GitHub. A reset to the pushed branch silently rewound the w |
| R-02 | This environment cannot push to the remote | occurred | medium | open | 01 | The sandbox proxy returns 403 on push; fetch works. Every handover therefore needs a patch file and a manual push, which is slow and loses commit authorship. |
| R-03 | Three GitHub PATs were pasted in chat | occurred | high | mitigated | 06 | Tokens appear in the transcript and possibly in provider logs. At least one was auto-revoked by GitHub secret scanning; the others are unconfirmed. |
| R-04 | The repository is public | certain | medium | open | 01 | It carries the design bundle, 235 production screenshots, the RBAC matrix, the API contract and now the full execution plan — a detailed map of a commercial product's internals. |
| R-05 | Shared-file contention across ten concurrent product agents | likely | high | open | 01 | routes/index.tsx, repository.ts, rbac.ts and the migrations are touched by every agent. Simultaneous edits are the specific failure that turns an 8-week parallel build back into a 25-week serial one. |
| R-06 | The design bundle violates its own brand rules | occurred | low | open | 04 | Dashboard.dc.html uses #06B6D4 (teal) in two gradients, which handoff/README.md §7 forbids. The port reproduced it faithfully, so the violation is now in Dashboard.tsx:73 and :398. |
| R-07 | Estimates assume no rework | likely | medium | open | 01 | 265 engineer-days assumes each capability is built once. Backend contract changes after W1 would force rework across W2's ten agents simultaneously. |
| R-08 | Feature-map screens have no design, only a screenshot and a templated spec | certain | medium | accepted | 02 | 175 of 402 capabilities are specified only by a screenshot and four templated fields. Fidelity expectations cannot be the same as for designed screens. |
| R-09 | Twelve capabilities depend on hardware or paid services we do not have | certain | low | accepted | 02 | Drone inspection, VR showroom, AR guides, wearables, security cameras, digital signage, blockchain, quantum, voice — all categorised EXTERNAL_DEPENDENCY in the registry. |
| R-10 | Mock-to-API swap could silently change behaviour | possible | high | open | 05 | 114 screens currently render from fixtures. Swapping the repository for HTTP touches every one of them at once. |
| R-11 | Agents claiming completion without evidence | likely | high | open | 03 | A subagent reporting 'done' is a claim, not a verification — and at ten concurrent agents the claims arrive faster than they can be read. |

## Issue register (PRINCE2 view)

| ID | Severity | Issue | Detail |
| --- | --- | --- | --- |
| F-001 | RESOLVED | PERMS uses six grant letters where the Action type declares five | The type documents v/c/e/x/a with x = delete. The matrix actually contains a-c-d-e-v-x, and 36 grants carry both `d` and `x`, so one of the two is really export. Under the declared reading, accountant |
| F-002 | RESOLVED | canApprove and PERMS.approvals disagree for superadmin | superadmin carries an unlimited approval ceiling (limit: null) but no `a` grant on the approvals module ("vx"). Note: with x now known to be export, superadmin's 'vx' on approvals means view and expor |
| F-003 | RESOLVED | Design-reference pages appear in every role's sidebar | RBACSpec, Index, FlowSpec, UI.EmptyStates, UI.LoadingStates and UI.FormValidation are RBAC-ungated and also present in NAV. |
| F-004 | RESOLVED | Four of six segregation-of-duties pairs are held by a single role | Purchase order raise + approve (owner, manager, procurement); supplier create + payment approve (owner, manager); journal post + approve (accountant); repair + QC (owner, manager, advisor). Only techn |
| F-005 | RESOLVED | A second field rule is unreachable | "Employee salary" joins Branch P&L as a dead rule: every role in its hidden list is already denied hr view by the module gate. The other five rules are live, and the split is now pinned by a test. |
| F-006 | RESOLVED | roleMeta fails open on an unknown role | An unrecognised role falls back to ROLES[0] — owner — inheriting an unlimited approval ceiling, while can() fails closed. Partially mitigated: canApprove now consults can() first, which fails closed,  |
| F-007 | RESOLVED | Money formatting edge cases | formatSar(-0.004) renders "SAR -0.00", so a reconciliation residue reads as a credit; formatSar(NaN) renders "SAR NaN"; parseSar("(1,200)") returns +1200, dropping the accounting-negative sign. |
| F-008 | RESOLVED | The seeded chart of accounts does not balance | Assets are out against liabilities plus equity by SAR 257,050. FinancialReports already says so on screen, and a test now pins that honesty. |
| F-009 | RESOLVED | Two implemented screens render a shell that does not exist yet | /procurement-portal and /procurement-portal/requisitions are PortalShell in the registry and render AppShell, because PortalShell is not built. The other 60 shell mismatches are placeholder screens co |
| F-010 | RESOLVED | 23 icon names resolve to no glyph | lucide renamed a family in v0.4xx (AlertTriangle to TriangleAlert, CheckCircle to CircleCheckBig, Home to House). The design bundle still asks for the old names and port-design-data.mjs intersects aga |
| F-011 | RESOLVED | DELETE routes checked the export permission, granting delete to view-plus-export roles | routes/collections.ts required 'x' for DELETE, bulk delete and includeDeleted. With x = export, that granted delete to roles holding 'vx' — accountant on audit, execreports, jobcards, estimates and in |
| F-012 | RESOLVED | A generic PATCH moved a job card's stage around the QC and SOD gates | POST /jobs/:id/transition runs the stage machine, the QC approval check and segregation of duties; PATCH /jobs/:id ran none of them and still accepted stage/status, because jobCardUpdate was jobCardCr |
| F-013 | RESOLVED | Customer phone and email leaked to a technician on the wire | FIELD_RULES hides 'Customer contact details' from technician, qc and supplier and the client hid the column, but REDACTIONS had no customers entry, so GET /customers shipped phone and email in every r |
| F-014 | RESOLVED | The qc role cannot operate the QC gate it is named for | server/src/routes/workshop.ts:41 requires jobcards:e before any transition; qc holds 'va', not 'e'. A qc user gets 403 'the qc role may not edit jobcards' on qc->delivery. Contradicts F-002's resoluti |
| F-015 | RESOLVED | assigned_tech_id is compared to a user id, so a technician sees none of their own jobs | assigned_tech_id holds a technicians.id; technicians.user_id is what would be comparable to a principal. (a) checkQcIndependence (workshop.ts:69) can never match, so the record-level QC check is dead  |
| F-016 | RESOLVED | Seed relationships and balances are internally inconsistent | Three separate seed defects, all pinned by tests rather than hidden: job cards carry no jobCardId onto estimates or invoices (seed.ts:127-207), so every job's cost summary is legitimately empty; three |
| F-017 | RESOLVED | Inventory prohibitions are unenforced or unexpressible on the server | Agent 10 proved the On Hand equation over a 500-case sequence but could not prove four prohibitions, because the server does not implement them: no endpoint writes parts.reserved (checkReservation is  |
| F-018 | RESOLVED | Server error mapping loses the field and downgrades 4xx to 500 | app.ts:145 returns the 23505 unique-violation without a `field`, so a duplicate phone/plate/VIN lands at form level instead of on the control that caused it (error.constraint carries the mapping). app |
| F-019 | RESOLVED | Two UI-foundation primitives have correctness gaps the wave leaned on | Form.tsx errorsFromZod assigns every issue to fields[path[0]]; an issue whose path matches no rendered Field silently refuses submit with no message and no focus move (hit for real with a non-ULID cus |
| F-020 | RESOLVED | The client Repository is typed against fixtures, not the contract | Repository row types come from data/generated/tables.ts, so contract fields the API really returns — email, type, vin, mileageKm, totalSpentHalalas, costHalalas, _createdAt — are invisible to TypeScri |
| F-021 | RESOLVED | Roughly 135 UI strings shipped this wave have no Arabic key | The four product agents added English source strings that fall back to English on an Arabic page: ~90 from inventory, ~31 from customers, 14 from workshop. t() never renders empty, so nothing is broke |
| F-022 | RESOLVED | No server collections for procurement — requisitions and purchase orders | server/src/registry.ts has no requisitions or purchase-orders collection, and no bespoke procurement router. Agent 11 built the requisition lifecycle and PurchaseOrder screen bounded to what the serve |
| F-023 | RESOLVED | The Inventory screen does not offer the return / adjust_down / reservation movements the server now enforces | F-017 added return, adjust_down and reservation endpoints and contract types, but Inventory.tsx's MOVEMENT_KINDS array and modal still describe the original five kinds. The server enforces the new mov |
| F-024 | RESOLVED | Two procurement-portal screens still render AppShell instead of PortalShell | F-009's root cause is fixed (PortalShell exists), but /procurement-portal and /procurement-portal/requisitions are declared in the legacy app map and render AppShell. Migrating them needs a PortalShel |
| F-025 | RESOLVED | No public lead endpoint, so the marketing Contact form cannot submit | Nothing under server/ accepts an anonymous contact/lead POST. Agent 17's Contact form validates then shows a role=alert failure naming direct channels (mailto/tel); there is deliberately no success pa |
| F-026 | RESOLVED | ~172 new UI strings across portals and the public site have no Arabic key | Agent 16 added ~47 and agent 17 ~125 English source strings that fall back to English on an Arabic page via t(). Nothing is broken; the Arabic UI shows English until the keys land in ar.ts. Full lists |
| F-027 | RESOLVED | CRM and fleet collections are read-only, and several endpoints do not exist | Agent 09 built LeadDetail, CRMCalendar, CustomerFeedback and FleetContract but the backend cannot persist their writes: leads/opportunities/crmTasks/fleets are not writable; there is no lead→opportuni |
| F-028 | RESOLVED | No financial aggregate endpoints, and four report-source collections are missing | Agent 12 refused to compute any cross-record money total in the browser (§A10: the server computes, the client displays) — and the server exposes none: no GET /invoices/summary, /accounting/tax/return |
| F-029 | RESOLVED | Workshop approval and diagnostics surfaces exceed what the server exposes | Agent 08 built nine screens; several need server capabilities that do not exist: no unified GET /approvals (ApprovalInbox operates on estimates alone); estimates present() omits submittedBy and there  |
| F-030 | RESOLVED | Seed appointments do not reconcile with the technician roster | app/src/data/generated/tables.ts: APPOINTMENTS[].tech names (Saeed Al-Zahrani, Majed Al-Otaibi, Yousef Al-Ghamdi) are not in TECHS (Yousef Al-Otaibi, Bandar Al-Qahtani, Faisal Al-Harbi, Nasser Al-Dosa |
| F-031 | RESOLVED | Four Tier C public pages have no registry route to build against | Agent 17 built Privacy and Terms, but Pricing, Request/Book Demo, Careers and Cookie Policy do not exist in the generated screen registry, and AppRoutes only renders registry entries. A website agent  |
| F-032 | RESOLVED | external_dependency_unavailable is not in the client RepositoryErrorCode union | The server sends error code external_dependency_unavailable with status 503 for an unconfigured integration (OBD bridge, SMS). repository.ts's RepositoryErrorCode union does not list it, so agent 08's |
| F-033 | RESOLVED | Feature-map screens with no SCREEN_MODULE mapping open for any role, then 403 on their data | Insurance-Claims (and other feature-map screens absent from the design bundle's SCREEN_MODULE) has no module mapping, so canScreen returns true and any authenticated role opens the workspace — but its |
| F-034 | RESOLVED | No real insurance or loans module in the RBAC matrix | Insurance/loans collections and the claim lifecycle are gated on `accounting` (the matrix has no insurance/loans module). accounting conflates ledger authority with claim adjudication. A dedicated ins |
| F-035 | RESOLVED | InsuranceReports/LoanReports still render the stale gap though their data now exists | GapReports.tsx (agent 12's boundary) still shows 'no data source yet' for insuranceClaims/loanContracts, but those collections and the productReports aggregates now exist. The two reports should gradu |
| F-036 | RESOLVED | Three generated files (nav.ts, rbac.ts, badges.ts) were hand-patched past what the generator now produces, so a routine `npm run port-design` silently reverts real fixes | Running port-design-data.mjs to fix F-008/F-010 also (a) dropped ~9 real AI/automation and voice nav entries from NAV that exist as routed screens in app/src but were never added to handoff/SCREEN_MAP |
| F-037 | RESOLVED | Ten public-website screen files were unreachable from any route (BLK-010) | The "SALIS AUTO 2030" design study shipped a six-page tour (Arrival, System, Grid, Access, Origin, Channel) plus its own nav shell (PageNav, CommandDeck) — complete, working React, never linked into t |
| F-038 | RESOLVED | Staff-Directory / HR-Management reads a collection gated to a narrower module than the screen itself | app/src/screens/hr/StaffDirectory.tsx (screens Staff-Directory and HR-Management) calls useCollection('departments'), whose server route is registered with module:'admin' (server/src/registry.ts:502)  |
| F-039 | RESOLVED | The departments collection has no write routes at all — Add Department 404s for every role | server/src/registry.ts's departments define() block carries no `writable: true` (unlike collections such as branches or suppliers that do), and server/src/routes/collections.ts:182 only registers crea |
| F-040 | RESOLVED | AuditLog (D-AuditLog) rendered its hardcoded fixture rows even when isLive — one of BLK-004's 280 mock-only capabilities | app/src/screens/admin/AuditLog.tsx's `isLive` branch existed only to swap an empty-state gap notice for the real screen; once past that check, the component filtered the same module-level `FIXTURE_ENT |

_1 further findings in `project-control/FINDINGS.json`._

## Quality register (PRINCE2 view)

| Quality criterion | Method | Result |
| --- | --- | --- |
| Every capability renders | Registry build + e2e | 436 of 436 |
| Content asserted, not just routed | e2e content assertions | 436 of 436 |
| Golden paths pass | Playwright | 23 of 23 |
| Permission matrix enforced server-side | `server/tests/authz-matrix.test.ts` | suite present |
| Frontend and server matrices identical | `server/tests/rbac-parity.test.ts` | suite present |
| Tenant isolation | `server/tests/isolation.test.ts` + RLS | suite present |
| Segregation of duties enforced | `server/tests/authz-sod.test.ts` | suite present |
| Accessibility contrast ratchet | `app/e2e/a11y.spec.ts` + `BASELINE.json` | ratcheted |
| Arabic and RTL | Registry verification | 120 verified, 0 hazards |

**Present is not passing.** The rows that say "suite present" mean the suite exists and was catalogued by reading it. Whether it passes is a dated statement made only after a run — see the test catalogue.
