**Status:** NORMATIVE · **Owner:** Process architect

# Process catalogue

This file catalogues the material business processes SALIS AUTO actually performs, one entry per process, each step tied to the endpoint or rule guard that implements it. Nothing here is aspirational: every endpoint named exists in `project-control/API_REGISTRY.json` or in the route file cited, every rule named exists in `packages/contract/src/rules/`, and every approval or segregation-of-duties control named is enforced by a function in `server/src/security/`. Where a step a workshop would expect has no implementation, it is written as a gap rather than described as if it worked. Read this with `docs/12_UML_BPMN_MODELS/STATE_MACHINES.md` for the lifecycles and `docs/17_API_INTEGRATION/API_OVERVIEW.md` for the surface.

## How to read an entry

- **Main flow** steps name the HTTP endpoint, the rule function, or both. A step with no named implementation is marked `NOT IMPLEMENTED`.
- **Business rules applied** cite `BR-` ids from `project-control/BUSINESS_RULES.json`.
- **Financial impact** and **Inventory impact** say what the process changes in money or stock terms, in integer halalas and integer units. Money is never a float anywhere in this system.
- **Audit events** name the `action` value written by `writeAudit` in `server/src/audit/audit.ts`, and the `entity` it is written against.
- Every authenticated step runs inside `withTenant` in `server/src/db/tenant.ts`, so the mutation and its audit row commit or roll back together. That is not repeated per process.

## Catalogue index

| ID | Process | Owner role | Primary module |
| --- | --- | --- | --- |
| PRC-001 | Customer self-registration over OTP | frontdesk | auth public plane |
| PRC-002 | Public lead capture | callcenter | none, unauthenticated |
| PRC-003 | Lead conversion to opportunity | callcenter | crm |
| PRC-004 | Appointment booking | frontdesk | appointments |
| PRC-005 | Job card opening | advisor | jobcards |
| PRC-006 | Job card stage progression and QC release | advisor and qc | jobcards |
| PRC-007 | Technician assignment | advisor | jobcards |
| PRC-008 | Estimate creation | advisor | estimates |
| PRC-009 | Estimate internal approval or rejection | manager | estimates |
| PRC-010 | Estimate customer approval over OTP | advisor | estimates |
| PRC-011 | Approval queue review | manager | approvals |
| PRC-012 | Parts reservation and release | parts | inventory |
| PRC-013 | Stock movement and branch transfer | parts | inventory |
| PRC-014 | Invoice creation | accountant | invoices |
| PRC-015 | Invoice issue with ZATCA hash chain | accountant | invoices |
| PRC-016 | Payment recording and receipt | accountant | payments |
| PRC-017 | Requisition raise, submit and approve | procurement | procurement |
| PRC-018 | Purchase order raise and approve | procurement | procurement |
| PRC-019 | Goods receipt against a purchase order | procurement | procurement |
| PRC-020 | Insurance claim lifecycle | accountant | accounting |
| PRC-021 | Leave request and decision | hr | hr |
| PRC-022 | Payroll run and posting | hr | hr |
| PRC-023 | Bank statement matching | accountant | accounting |
| PRC-024 | Fleet contract renewal | manager | customers |
| PRC-025 | OBD diagnostic rescan and code clearing | technician | jobcards |
| PRC-026 | Governed bulk export | varies by module | any module with `x` |

---

## PRC-001 — Customer self-registration over OTP

| Field | Content |
| --- | --- |
| Purpose | Let a customer create a portal account and prove they hold the phone number on it before the account can be used. |
| Owner role | frontdesk |
| Actors | Customer, SMS transport |
| Trigger | Customer submits the public registration form |
| Preconditions | The tenant is named in the request body; `publicCustomerRegister` in the contract bounds what may be named |
| Main flow | 1. `POST /api/v1/public/customers/register` — unauthenticated, on the very strict login rate budget; answers 202 with no id and no token. 2. The service issues an OTP challenge and hands it to the SMS transport. 3. `POST /api/v1/public/customers/verify-otp` — marks the account verified, 200 with `{verified:true}`. 4. `POST /api/v1/public/customers/resend-otp` — always 202, whether or not the number is awaiting verification. |
| Alternative flow | Resend on cooldown answers 429 with `retry-after`. |
| Exceptions | Address already taken answers 409. Weak password answers 400. No SMS provider configured answers 503 naming the missing dependency rather than claiming a code was sent. |
| Business rules applied | None from `BUSINESS_RULES.json`; the controls are the OTP module and the rate limiter |
| Approvals and SOD | None |
| Outputs | A pending, then verified, user row |
| Financial impact | None |
| Inventory impact | None |
| Audit events | Session and registration events written by the auth service |
| Systems and APIs | `POST /api/v1/public/customers/register`, `/verify-otp`, `/resend-otp` |
| Evidence | `server/src/auth/routes.ts`, `server/src/auth/otp.ts`, `server/src/auth/service.ts` |
| Known gaps | The SMS transport default refuses. Registration is therefore inert in any environment where `OTP_TRANSPORT` is unset — by design, but it means this process does not complete out of the box. |

## PRC-002 — Public lead capture

| Field | Content |
| --- | --- |
| Purpose | Accept a marketing contact-form submission from an anonymous visitor without exposing any tenant. |
| Owner role | callcenter |
| Actors | Website visitor |
| Trigger | Visitor submits the site contact form |
| Preconditions | `PUBLIC_LEAD_ORG_ID` is configured on the server |
| Main flow | 1. `POST /api/v1/public/leads` — listed in `PUBLIC_PATHS` in `server/src/app.ts`, so no token is required. 2. Body parsed by the strict `publicLeadCreate` schema; unknown keys are refused. 3. A synthetic principal carrying the configured org writes one `public_leads` row under RLS. 4. `writeAudit` records `create` on `public_lead` with the contact details as the business record. 5. Answers 202 with a bare acknowledgement. |
| Alternative flow | None |
| Exceptions | Schema failure answers 400 with schema text, never an echo of what the visitor typed. Over the per-IP budget answers 429. |
| Business rules applied | None |
| Approvals and SOD | None |
| Outputs | One `public_leads` row, status `new` |
| Financial impact | None |
| Inventory impact | None |
| Audit events | `create` on `public_lead` |
| Systems and APIs | `POST /api/v1/public/leads` |
| Evidence | `server/src/routes/public.ts`, `server/src/app.ts` |
| Known gaps | Nothing promotes a `public_leads` row into `leads`. NOT IMPLEMENTED — no endpoint exists that converts a public lead into a CRM lead, so PRC-003 cannot consume the output of this process. |

## PRC-003 — Lead conversion to opportunity

| Field | Content |
| --- | --- |
| Purpose | Turn a qualified CRM lead into an opportunity in one atomic step. |
| Owner role | callcenter |
| Actors | callcenter, manager, owner |
| Trigger | The lead is judged qualified |
| Preconditions | A `leads` row exists in the caller's tenant |
| Main flow | 1. `POST /api/v1/crm/leads/:id/convert` — `requirePermission` checks both `crm:c` and `crm:e` before the body is read. 2. `leadConvertBody` parsed. 3. The lead row is locked `FOR UPDATE`. 4. If `convertedOpportunityId` is already set, the existing opportunity is returned with 200 — the conversion is idempotent, not a 409. 5. Otherwise an `opportunities` row is inserted carrying the lead's name, company and `valueHalalas`. 6. The lead moves to stage `converted` with `convertedOpportunityId` set, under the optimistic `version` predicate. 7. `writeAudit` records `transition` on `lead`. 8. Answers 201. |
| Alternative flow | Already-converted lead returns its existing opportunity, 200. |
| Exceptions | Missing lead 404 under RLS, so a cross-tenant id is indistinguishable from a non-existent one. |
| Business rules applied | None from `BUSINESS_RULES.json` |
| Approvals and SOD | None |
| Outputs | One `opportunities` row; the `leads` row at stage `converted` |
| Financial impact | Pipeline value only. No ledger entry. |
| Inventory impact | None |
| Audit events | `transition` on `lead` |
| Systems and APIs | `POST /api/v1/crm/leads/:id/convert` |
| Evidence | `server/src/routes/crm.ts` |
| Known gaps | `SM-CRM-crmTaskStatus` and the lead stage set are `STATE_SET_ONLY`; no transition table constrains a lead's stage other than the conversion step itself. |

## PRC-004 — Appointment booking

| Field | Content |
| --- | --- |
| Purpose | Reserve a bay and a time slot for a customer visit without double-booking. |
| Owner role | frontdesk |
| Actors | frontdesk, advisor, callcenter, manager, owner, customer |
| Trigger | A customer asks for a slot, in person, by phone or through the portal |
| Preconditions | Caller holds `appointments:c` |
| Main flow | 1. `POST /api/v1/appointments` — the generated create route in `server/src/routes/collections.ts`; `requirePermission(principal, 'appointments', 'c')`. 2. `rejectServerOwnedKeys` refuses a body that tries to set `orgId`, `version` or `createdBy`. 3. `appointmentCreate` parsed. 4. The `appointments` writer derives `startMinute` from `timeLabel` when only the label is sent. 5. It reads the bay's existing bookings for that date inside the same transaction and calls `checkBayFree`, ignoring rows at status `cancelled` or `no-show`. 6. For a self-scoped principal, `selfColumns` writes `customerId` from the token, so a customer cannot file a booking against another customer. 7. Insert, then `writeAudit` records `create` on `appointment`. 8. Answers 201. |
| Alternative flow | A customer books through the portal on the same endpoint with the `customer` role's `appointments:vc` grant; the `r_self` RLS policy narrows what they can then read. |
| Exceptions | Bay collision answers 422 `rule_violated` naming the bay, field `bay`. |
| Business rules applied | BR-WORKSHOP-checkBayFree, BR-WORKSHOP-overlaps |
| Approvals and SOD | None |
| Outputs | One `appointments` row |
| Financial impact | None |
| Inventory impact | None |
| Audit events | `create` on `appointment` |
| Systems and APIs | `POST /api/v1/appointments`, `PATCH /api/v1/appointments/:id`, `DELETE /api/v1/appointments/:id` |
| Evidence | `server/src/routes/collections.ts`, `server/src/writers.ts`, `packages/contract/src/rules/workshop.ts` |
| Known gaps | Nothing turns a kept appointment into a job card. NOT IMPLEMENTED — no endpoint links `appointments` to `job_cards`, so the handover from booking to workshop is manual re-keying. `SM-APPOINTMENT-appointmentStatus` is `STATE_SET_ONLY`: `confirmed`, `awaiting`, `no-show`, `cancelled` and `completed` can each be written by a plain `PATCH` in any order. |

## PRC-005 — Job card opening

| Field | Content |
| --- | --- |
| Purpose | Open the workshop record that everything else in a repair hangs off. |
| Owner role | advisor |
| Actors | advisor, frontdesk, manager, owner |
| Trigger | A vehicle arrives for work |
| Preconditions | Caller holds `jobcards:c`; a customer and vehicle exist |
| Main flow | 1. `POST /api/v1/jobs` — the generated create route; `jobcards:c`. 2. `jobCardCreate` parsed. 3. The `jobs` writer assigns `code` through `jobCode()` on create only. 4. Insert under tenant columns from the principal. 5. `writeAudit` records `create` on `job_card`. 6. Answers 201. |
| Alternative flow | None |
| Exceptions | Duplicate business code answers 409 with the colliding field named, via the `23505` branch in `server/src/app.ts`. |
| Business rules applied | None on creation |
| Approvals and SOD | None |
| Outputs | One `job_cards` row |
| Financial impact | None |
| Inventory impact | None |
| Audit events | `create` on `job_card` |
| Systems and APIs | `POST /api/v1/jobs`, `GET /api/v1/jobs/:id`, `PATCH /api/v1/jobs/:id` |
| Evidence | `server/src/routes/collections.ts`, `server/src/writers.ts` |
| Known gaps | The create route sets no opening stage explicitly; the stage comes from whatever `jobCardCreate` accepts or the column default. The stage machine governs moves, not the entry point. |

## PRC-006 — Job card stage progression and QC release

| Field | Content |
| --- | --- |
| Purpose | Move a repair through its gates so that no stage is skipped and the person who did the work is not the person who signs it off. |
| Owner role | advisor for the working stages, qc for the release |
| Actors | advisor, technician, qc, manager, owner |
| Trigger | Work reaches the end of a stage |
| Preconditions | The job card exists; the caller holds `jobcards:e`, or `jobcards:a` for the release |
| Main flow | 1. `POST /api/v1/jobs/:id/transition`. 2. A caller holding neither `jobcards:e` nor `jobcards:a` is refused before the body is read. 3. `jobTransitionBody` parsed. 4. `requirePermission` then checks `jobcards:a` when the target is `delivery`, and `jobcards:e` for every other target. 5. The job row is locked `FOR UPDATE`. 6. `checkStageTransition` refuses a move not in `JOB_STAGE_TRANSITIONS`, and refuses a move to the stage the job is already at. 7. For `qc` to `delivery`: `checkQcIndependence` compares the actor against the assigned technician's `users` id, resolved through `technicians.user_id`. 8. `requireSodClear` then reads the audit trail for this job card and refuses if the actor themselves performed the repair, whoever is assigned now. 9. Stage and derived board `status` are written under the `version` predicate; `qcPassedBy` is stamped on the release. 10. `writeAudit` records `transition` on `job_card` with before and after stage. |
| Alternative flow | `qc` to `repair` is a legal rework move and needs only `jobcards:e`. `estimate` to `inspection` is the legal step back. |
| Exceptions | Illegal move answers 422 `rule_violated` on field `to`. QC by the performer answers 403. An SOD refusal answers 403 and is itself audited in a separate transaction so the refusal survives the caller's rollback. Concurrent edit answers 409. |
| Business rules applied | BR-WORKSHOP-checkStageTransition, BR-APPROVALS-checkQcIndependence |
| Approvals and SOD | SOD pair `Perform repair` and `Pass quality check`, enforced over the audit log by `requireSodClear` in `server/src/security/sod.ts`. This is one of the two pairs the system can actually observe. |
| Outputs | `job_cards.stage`, `job_cards.status`, `job_cards.qc_passed_by` |
| Financial impact | None directly |
| Inventory impact | None directly |
| Audit events | `transition` on `job_card`; `reject` on `job_card` with reason `sod_violation:...` when the control fires |
| Systems and APIs | `POST /api/v1/jobs/:id/transition` |
| Evidence | `server/src/routes/workshop.ts`, `server/src/security/sod.ts`, `packages/contract/src/rules/workshop.ts`, `packages/contract/src/entities/jobCard.ts` |
| Known gaps | `checkInvoiceable` exists in `packages/contract/src/rules/workshop.ts` but has no caller anywhere in `server/src`. NOT IMPLEMENTED — nothing prevents an invoice being created and issued for a job card that has not reached `delivery`. |

## PRC-007 — Technician assignment

| Field | Content |
| --- | --- |
| Purpose | Put a named technician on a job card so the QC independence control has something to compare against. |
| Owner role | advisor |
| Actors | advisor, manager, owner, technician |
| Trigger | Work is scheduled onto a person |
| Preconditions | Caller holds `jobcards:e`; the technician row is in the caller's tenant |
| Main flow | 1. `POST /api/v1/jobs/:id/assign` with `{techId}`. 2. `jobAssignBody` parsed. 3. The technician is looked up under the caller's own RLS context, so a technician in another organization is simply invisible. 4. `assignedTechId` written under the `version` predicate. 5. `writeAudit` records `assign` on `job_card`. |
| Alternative flow | None |
| Exceptions | Unknown technician 404. Concurrent edit 409. |
| Business rules applied | None; this step feeds BR-APPROVALS-checkQcIndependence at PRC-006 |
| Approvals and SOD | None at assignment |
| Outputs | `job_cards.assigned_tech_id` |
| Financial impact | None |
| Inventory impact | None |
| Audit events | `assign` on `job_card` |
| Systems and APIs | `POST /api/v1/jobs/:id/assign` |
| Evidence | `server/src/routes/workshop.ts` |
| Known gaps | A technician row with a null `user_id` makes the record half of the QC independence check inert; only the audit-trail half then fires. |

## PRC-008 — Estimate creation

| Field | Content |
| --- | --- |
| Purpose | Price a job from its lines, with the total decided by the server. |
| Owner role | advisor |
| Actors | advisor, manager, owner |
| Trigger | Inspection is complete and the work is priced |
| Preconditions | Caller holds `estimates:c` |
| Main flow | 1. `POST /api/v1/estimates`. 2. `requirePermission(principal, 'estimates', 'c')`. 3. `estimateCreate` parsed; a failure answers 400 with the failing path as `field`. 4. `computeInvoiceTotals` derives `subtotalHalalas`, `taxHalalas`, `discountHalalas` and `totalHalalas` from the lines. The client never sends a total. 5. `nextEstimateCode` assigns `EST-nnnn` by counting rows inside the tenant transaction. 6. The estimate is inserted at status `draft` with `submittedBy` set to the caller. 7. Lines are inserted with their sort order. 8. `writeAudit` records `create` on `estimate`. 9. Answers 201. |
| Alternative flow | `PATCH /api/v1/estimates/:id` re-prices by replacing all lines and recomputing totals, and is the route that moves status `draft` to `sent`. |
| Exceptions | Editing an approved estimate answers 409 telling the caller to raise a revision. Concurrent edit answers 409. |
| Business rules applied | BR-MONEY-computeInvoiceTotals, BR-MONEY-roundHalfUp, BR-MONEY-VAT_RATE_BPS |
| Approvals and SOD | None at creation. `submittedBy` is written here and is what the SOD check at PRC-009 reads. |
| Outputs | One `estimates` row plus its `estimate_lines` |
| Financial impact | A priced but uncommitted amount. No ledger entry. |
| Inventory impact | None. An estimate does not reserve parts. |
| Audit events | `create` on `estimate`, `update` on `estimate` |
| Systems and APIs | `POST /api/v1/estimates`, `PATCH /api/v1/estimates/:id`, `GET /api/v1/estimates/:id/lines` |
| Evidence | `server/src/routes/estimates.ts`, `packages/contract/src/rules/money.ts` |
| Known gaps | Status `sent` is reached by a plain `PATCH` carrying `status`, not by a named submit action, so nothing checks that an estimate put in front of an approver has lines or a valid-until date. `SM-ESTIMATE-estimateStatus` is `STATE_SET_ONLY`. |

## PRC-009 — Estimate internal approval or rejection

| Field | Content |
| --- | --- |
| Purpose | Commit the shop to the priced work, within the approver's authority and not by the person who raised it. |
| Owner role | manager |
| Actors | manager, owner |
| Trigger | An estimate sits at status `sent` |
| Preconditions | Caller holds `estimates:a` — only manager and owner hold it; advisor holds `estimates:vce` and cannot approve. `requireApproval` is called with its default module `approvals`, so the caller must also hold `approvals:a`. |
| Main flow | 1. `POST /api/v1/estimates/:id/approve`. 2. `requirePermission(principal, 'estimates', 'a')`. 3. `estimateApproveBody` parsed. 4. The estimate row is locked `FOR UPDATE`. 5. Already approved answers 409; already rejected answers 409. 6. `checkEstimateFresh` refuses an estimate past its `validUntil`. 7. `requireApproval` checks authority then ceiling against `totalHalalas`; above the ceiling the answer is escalate, not a flat refusal. 8. `requireDifferentApprover` calls `checkSelfApproval` against `submittedBy`. 9. Status, `approvedBy` and `approvedAt` are written under the `version` predicate. 10. `writeAudit` records `approve` on `estimate` with the reason. |
| Alternative flow | `POST /api/v1/estimates/:id/reject` requires a reason in the body and refuses to reject an already-approved estimate. |
| Exceptions | Expired estimate answers 422. Above ceiling answers the approval-required envelope. Self-approval answers 403. Concurrent change answers 409. |
| Business rules applied | BR-WORKSHOP-checkEstimateFresh, BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkSelfApproval |
| Approvals and SOD | Ceiling from `roleMeta`, checked on module `approvals`: manager 5000000 halalas, owner unlimited. Submitter may not approve. |
| Outputs | `estimates.status` = `approved`, `approved_by`, `approved_at` |
| Financial impact | Commits the shop to the amount. No ledger entry is written. |
| Inventory impact | None |
| Audit events | `approve` or `reject` on `estimate` |
| Systems and APIs | `POST /api/v1/estimates/:id/approve`, `POST /api/v1/estimates/:id/reject` |
| Evidence | `server/src/routes/estimates.ts`, `server/src/security/approvals.ts`, `packages/contract/src/rules/approvals.ts` |
| Known gaps | Approving an estimate does not create the invoice, reserve the parts, or move the job card stage. NOT IMPLEMENTED — there is no endpoint or job that propagates an approved estimate into `invoices`, `parts.reserved` or `job_cards.stage`. Each is a separate manual call. |

## PRC-010 — Estimate customer approval over OTP

| Field | Content |
| --- | --- |
| Purpose | Capture the customer's acceptance of a quote as an e-signature when they are not standing at the counter. |
| Owner role | advisor |
| Actors | advisor, customer, SMS transport |
| Trigger | An estimate needs the customer's yes |
| Preconditions | The estimate's customer has a phone on record; caller holds `estimates:e` |
| Main flow | 1. `POST /api/v1/estimates/:id/request-approval-otp` — `estimates:e`. 2. The customer's phone is resolved from the `customers` row under RLS; the caller cannot supply a number, so the endpoint cannot be used as an SMS cannon. 3. `issueChallenge` from the shared `server/src/auth/otp.ts` — hashed at rest, throttled, attempt-capped. 4. `app.auth.transport.send` delivers it; the default transport refuses. 5. `writeAudit` records `command` on `estimate` with the phone masked to its last three digits. Answers 202. 6. `POST /api/v1/estimates/:id/verify-approval-otp` with `{code}`. 7. `verifyChallenge` returns verified, wrong code, or expired. 8. On success `writeAudit` records `approve` on `estimate` with reason `customer_otp_signature`. The verified challenge row plus that audit row are the persisted signature. |
| Alternative flow | None |
| Exceptions | Wrong code answers 401 with `attemptsLeft`. Expired or consumed answers 410. Resend on cooldown answers 429 with `retry-after`. No SMS provider answers 503 naming the missing dependency. No customer phone answers 400 on field `customerId`. |
| Business rules applied | None from `BUSINESS_RULES.json`; the controls are the OTP module's hashing, throttling and attempt cap |
| Approvals and SOD | This is the customer saying yes. It is deliberately not the shop's internal approval, which stays at PRC-009. |
| Outputs | A verified `otp_challenges` row and an `approve` audit row against the estimate |
| Financial impact | None on its own |
| Inventory impact | None |
| Audit events | `command` then `approve` on `estimate` |
| Systems and APIs | `POST /api/v1/estimates/:id/request-approval-otp`, `POST /api/v1/estimates/:id/verify-approval-otp` |
| Evidence | `server/src/routes/estimate-otp.ts`, `server/src/auth/otp.ts` |
| Known gaps | A verified customer signature does not change `estimates.status`. The estimate stays at `sent` until someone calls PRC-009 separately, and nothing links the two — the internal approval does not check that a customer signature exists. |

## PRC-011 — Approval queue review

| Field | Content |
| --- | --- |
| Purpose | Give an approver one list of what is waiting, with the honest answer about whether they personally may decide each row. |
| Owner role | manager |
| Actors | advisor, manager, parts, accountant, hr, procurement, owner |
| Trigger | An approver opens the inbox |
| Preconditions | Caller holds `approvals:v` |
| Main flow | 1. `GET /api/v1/approvals`. 2. `requirePermission(principal, 'approvals', 'v')`. 3. Estimates at status `sent` are folded in only when the caller also holds `estimates:v`. 4. Each row carries `amountHalalas`, `module`, and an `approval` block computed per caller: `canApprove`, `ceilingHalalas`, `withinCeiling`, `isSubmitter`. `isSubmitter` forces `canApprove` false even for an owner. 5. A per-module roll-up gives counts and pending totals. |
| Alternative flow | An approver without `estimates:v` sees the queue and no estimate rows, rather than a leak. |
| Exceptions | No `approvals:v` answers 403. |
| Business rules applied | BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkSelfApproval, both through `mayApprove` |
| Approvals and SOD | Reports standing; does not decide |
| Outputs | Read only |
| Financial impact | None |
| Inventory impact | None |
| Audit events | None — the route is not audited |
| Systems and APIs | `GET /api/v1/approvals` |
| Evidence | `server/src/routes/approvals.ts`, `server/src/security/approvals.ts` |
| Known gaps | The queue carries estimates only. Purchase orders, requisitions, insurance claims, journal postings and payroll runs all have approval routes or approval semantics and none of them appear in the inbox. The `ApprovalItem.kind` discriminator is typed `'estimate'` and nothing else. |

## PRC-012 — Parts reservation and release

| Field | Content |
| --- | --- |
| Purpose | Hold stock against work that has not yet consumed it, so two jobs cannot both count on the same last unit. |
| Owner role | parts |
| Actors | parts, procurement, manager, owner |
| Trigger | Work is committed and the parts must be held |
| Preconditions | Caller holds `inventory:e` |
| Main flow | 1. `POST /api/v1/inventory/:id/reservation` with `{qty, ref?, reason?}`. 2. `requirePermission(principal, 'inventory', 'e')`. 3. `reservationBody` parsed. 4. `lockPart` selects the part `FOR UPDATE` by id or SKU. 5. `checkReservation` refuses `reserved + qty > onHand`. 6. `parts.reserved` is written to the new figure. 7. `writeAudit` records `reserve` on `part`. |
| Alternative flow | `DELETE /api/v1/inventory/:id/reservation` with the same body; `checkReservationRelease` refuses releasing more than is held; `writeAudit` records `release`. |
| Exceptions | Over-reservation and over-release both answer 422 `rule_violated` on field `qty`. |
| Business rules applied | BR-INVENTORY-checkReservation, BR-INVENTORY-checkReservationRelease |
| Approvals and SOD | None. Reservation is not on a declared SOD pair. |
| Outputs | `parts.reserved` |
| Financial impact | None |
| Inventory impact | Changes `reserved`; leaves `on_hand` untouched |
| Audit events | `reserve` or `release` on `part` |
| Systems and APIs | `POST /api/v1/inventory/:id/reservation`, `DELETE /api/v1/inventory/:id/reservation` |
| Evidence | `server/src/routes/inventory.ts`, `packages/contract/src/rules/inventory.ts` |
| Known gaps | Reservations are not linked to the job card or estimate that caused them beyond an optional free-text `ref`; there is no table of reservation rows, only the running total on the part. The registry marks these two endpoints `audited: false` even though the handler calls `writeAudit`. |

## PRC-013 — Stock movement and branch transfer

| Field | Content |
| --- | --- |
| Purpose | Change on-hand quantity, once, with a ledger row for every change. |
| Owner role | parts |
| Actors | parts, procurement, manager, owner |
| Trigger | Stock is received, issued, returned, damaged, transferred or counted |
| Preconditions | Caller holds `inventory:e`; an `Idempotency-Key` header of 8 to 128 characters is mandatory |
| Main flow | 1. `POST /api/v1/inventory/:id/movement`. 2. `requirePermission(principal, 'inventory', 'e')`. 3. `movementCreate` parsed. 4. A missing or malformed `Idempotency-Key` answers 400 — the body has no natural dedupe key, so an unkeyed retry would be a second receipt. 5. `findReplay` returns the stored response for a repeat of the same key and body. 6. `lockPart` selects `FOR UPDATE`. 7. For type `out`, `adjust` or `adjust_down`, `requireSodClear` checks the audit trail for the counterpart activity on this part. 8. `checkMovement` applies the invariants: positive quantity; a reservation-backed consumption bounded by the reservation; no negative stock unless the part is backorderable; only unreserved stock may be consumed or transferred. 9. `movementDelta` gives the sign. A transfer applies zero net to `on_hand` and writes two `inventory_movements` rows sharing a `transferId` — the debit and the paired credit against `to_branch_id`. 10. A reservation-backed `out` decrements `reserved` as it consumes. 11. `writeAudit` records `movement` on `part`. 12. `recordResult` stores the response against the idempotency key. |
| Alternative flow | Transfer destination must be a real branch of this org and must not be the part's current branch; both are checked under RLS. |
| Exceptions | Any invariant failure answers 422 on field `qty` or `toBranchId`. SOD conflict answers 403 and is audited in its own transaction. |
| Business rules applied | BR-INVENTORY-checkMovement, BR-INVENTORY-movementDelta |
| Approvals and SOD | SOD pair `Issue stock` and `Adjust stock count` — the pair no permission grant can express, because both duties are `inventory:e`. Enforced over the audit log. |
| Outputs | `parts.on_hand`, `parts.reserved`, one or two `inventory_movements` rows |
| Financial impact | None directly. NOT IMPLEMENTED — no journal entry is written for a stock movement. |
| Inventory impact | The only place `on_hand` changes |
| Audit events | `movement` on `part`; `reject` on `part` with reason `sod_violation:...` |
| Systems and APIs | `POST /api/v1/inventory/:id/movement`, `GET /api/v1/inventory/:id/movements` |
| Evidence | `server/src/routes/inventory.ts`, `packages/contract/src/rules/inventory.ts`, `server/src/security/sod.ts` |
| Known gaps | Both transfer rows carry the source branch in `branch_id`, so a branch-scoped storekeeper at the destination cannot see the credit row under RLS. |

## PRC-014 — Invoice creation

| Field | Content |
| --- | --- |
| Purpose | Build a tax document from lines, with every money figure decided by the server. |
| Owner role | accountant |
| Actors | advisor, frontdesk, accountant, manager, owner |
| Trigger | Work is done and is to be billed |
| Preconditions | Caller holds `invoices:c` |
| Main flow | 1. `POST /api/v1/invoices`, optionally with an `Idempotency-Key`. 2. `requirePermission(principal, 'invoices', 'c')`. 3. `invoiceCreate` parsed. 4. `once` wraps the work: with a key, a replay returns the stored 201 body; the same key with a different body answers 409. 5. `computeInvoiceTotals` derives subtotal, tax on the discounted net, discount and total. Rounding happens at the subtotal and at the tax, once, never per line. 6. `nextCode` assigns `INV-YYYY-nnnn` by counting inside the tenant transaction. 7. Invoice inserted at status `draft`, then its lines. 8. `writeAudit` records `create` on `invoice`. Answers 201. |
| Alternative flow | `PATCH /api/v1/invoices/:id` re-prices a draft by replacing all lines. |
| Exceptions | Editing an issued invoice answers 409 telling the caller to raise a credit note. |
| Business rules applied | BR-MONEY-computeInvoiceTotals, BR-MONEY-roundHalfUp, BR-MONEY-VAT_RATE_BPS |
| Approvals and SOD | None at creation |
| Outputs | One `invoices` row and its `invoice_lines` |
| Financial impact | A draft liability. No ledger entry. |
| Inventory impact | None. An invoice line does not consume stock. |
| Audit events | `create` on `invoice`, `update` on `invoice` |
| Systems and APIs | `POST /api/v1/invoices`, `PATCH /api/v1/invoices/:id`, `GET /api/v1/invoices/:id/lines` |
| Evidence | `server/src/routes/invoices.ts`, `packages/contract/src/rules/money.ts` |
| Known gaps | `checkInvoiceable` is never called. NOT IMPLEMENTED — an invoice can be created against a job card at any stage, or against no job card at all. Nothing copies an approved estimate's lines onto an invoice. |

## PRC-015 — Invoice issue with ZATCA hash chain

| Field | Content |
| --- | --- |
| Purpose | Make the invoice a real tax document: immutable, hash-chained and carrying a ZATCA QR payload. |
| Owner role | accountant |
| Actors | accountant, manager, owner |
| Trigger | The draft is final |
| Preconditions | Caller holds `invoices:e` — manager, accountant, owner — and, because `requireApproval` defaults to module `approvals`, also `approvals:a` |
| Main flow | 1. `POST /api/v1/invoices/:id/issue`. 2. `requirePermission(principal, 'invoices', 'e')`. 3. Already issued answers 409; cancelled answers 409. 4. `requireApproval(principal, before.totalHalalas)` applies the same ceiling the approval inbox would, so bypassing the inbox does not bypass the ceiling. 5. `previousHash` reads the most recently issued invoice's `hash_self`. 6. `invoiceHash` computes SHA-256 over previous hash, id, code, customer name, total and tax. 7. `zatcaQr` builds the phase-2 TLV payload base64-encoded — seller name, VAT number, timestamp, total, VAT. 8. Status moves to `unpaid`, `issued_at`, `hash_prev`, `hash_self` and `qr_code` are written under the `version` predicate. 9. `writeAudit` records `issue` on `invoice`. |
| Alternative flow | None. There is no un-issue. |
| Exceptions | Above ceiling answers the approval-required envelope. Concurrent change answers 409. |
| Business rules applied | BR-APPROVALS-checkApprovalCeiling through `requireApproval` |
| Approvals and SOD | Ceiling only. There is no submitter check on issue, so the person who created the invoice may issue it. |
| Outputs | `invoices.status` = `unpaid`, `issued_at`, `hash_prev`, `hash_self`, `qr_code` |
| Financial impact | Commits the receivable. NOT IMPLEMENTED — no journal entry is written to `journal_entries`. |
| Inventory impact | None |
| Audit events | `issue` on `invoice` |
| Systems and APIs | `POST /api/v1/invoices/:id/issue` |
| Evidence | `server/src/routes/invoices.ts` |
| Known gaps | `previousHash` orders by `issued_at desc` with no org predicate in the query itself; it relies entirely on RLS for tenant scoping, and two invoices issued in the same clock tick can read the same predecessor. The seller VAT number comes from the invoice row rather than an organization setting. |

## PRC-016 — Payment recording and receipt

| Field | Content |
| --- | --- |
| Purpose | Record money received against an invoice, once, and issue the receipt. |
| Owner role | accountant |
| Actors | accountant, advisor, frontdesk, manager, owner |
| Trigger | A customer pays |
| Preconditions | Caller holds `payments:c`; the invoice exists |
| Main flow | 1. `POST /api/v1/invoices/:id/payments`, optionally with an `Idempotency-Key`. 2. `requirePermission(principal, 'payments', 'c')`. 3. `paymentCreate` parsed. 4. `once` handles replay. 5. The invoice is locked `FOR UPDATE`, so two simultaneous payments serialise and the second re-reads a balance that already includes the first. 6. `checkPayment` refuses an amount above the remaining balance and refuses any payment against a cancelled invoice. 7. A `payments` row is inserted with method, reference and `paidOn`. 8. `invoices.paid_halalas` is incremented and the status moves to `paid` when the total is met, otherwise `partial`. 9. A `receipts` row is inserted at status `cleared` with code `RCP-YYYY-nnnn`. 10. `writeAudit` records `pay` on `invoice`. Answers 201 with both the payment and the updated invoice. |
| Alternative flow | `POST /api/v1/receipts` creates a standalone receipt for an invoice's outstanding balance at status `pending`; it records no payment and moves no invoice figure. |
| Exceptions | Overpayment and payment against a cancelled invoice both answer 422 `rule_violated`. |
| Business rules applied | BR-MONEY-checkPayment |
| Approvals and SOD | None. There is no ceiling on recording a payment. |
| Outputs | One `payments` row, one `receipts` row, updated `invoices.paid_halalas` and `status` |
| Financial impact | Reduces the receivable. NOT IMPLEMENTED — no journal entry is written. |
| Inventory impact | None |
| Audit events | `pay` on `invoice`, `create` on `receipt` |
| Systems and APIs | `POST /api/v1/invoices/:id/payments`, `GET /api/v1/invoices/:id/payments`, `POST /api/v1/receipts` |
| Evidence | `server/src/routes/invoices.ts`, `packages/contract/src/rules/money.ts` |
| Known gaps | `checkRefund` exists in `packages/contract/src/rules/money.ts` and has no caller. NOT IMPLEMENTED — there is no refund or credit-note endpoint, so a payment cannot be reversed through the API. The two receipt-creation paths write different statuses for the same event. |

## PRC-017 — Requisition raise, submit and approve

| Field | Content |
| --- | --- |
| Purpose | Get internal agreement to spend before a supplier is approached. |
| Owner role | procurement |
| Actors | parts, procurement, accountant, manager, owner |
| Trigger | A branch needs stock or a service bought |
| Preconditions | Caller holds `procurement:c` to raise, `procurement:e` to submit, `procurement:a` to decide |
| Main flow | 1. `POST /api/v1/procurement/requisitions` — `procurement:c`; `requisitionEstimatedTotalHalalas` sums the lines VAT-exclusive; code `REQ-nnnn`; status `draft`; `submittedBy` set. 2. `PATCH /api/v1/procurement/requisitions/:id` — `procurement:e`; only a draft may be edited; lines are replaced wholesale and the estimated total recomputed. 3. `POST /api/v1/procurement/requisitions/:id/submit` — `procurement:e`; only a draft may be submitted; status moves to `submitted`; `writeAudit` records `transition`. 4. `POST /api/v1/procurement/requisitions/:id/approve` — `procurement:a`; the row is locked; a requisition must be `submitted` to be approved; `requireApproval` against `estimatedTotalHalalas` on module `procurement`; `requireDifferentApprover` against `submittedBy`; status `approved` with `approvedBy` and `approvedAt`. |
| Alternative flow | `POST /api/v1/procurement/requisitions/:id/reject` requires a reason and refuses to reject an approved or ordered requisition. |
| Exceptions | Wrong status answers 409. Above ceiling answers the approval-required envelope. Self-approval answers 403. |
| Business rules applied | BR-PROCUREMENT-requisitionEstimatedTotalHalalas, BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkSelfApproval |
| Approvals and SOD | Ceiling on module `procurement`: procurement 2000000 halalas, manager 5000000, accountant 2500000, owner unlimited. Submitter may not approve. |
| Outputs | `requisitions` row and `requisition_lines` |
| Financial impact | A budget commitment. No ledger entry. |
| Inventory impact | None |
| Audit events | `create`, `update`, `transition`, `approve`, `reject` on `requisition` |
| Systems and APIs | `POST /api/v1/procurement/requisitions`, `PATCH .../:id`, `.../:id/submit`, `.../:id/approve`, `.../:id/reject`, `GET .../:id/lines` |
| Evidence | `server/src/routes/procurement.ts`, `packages/contract/src/rules/procurement.ts` |
| Known gaps | Requisitions never appear in the approval inbox at PRC-011, so an approver has to know to go looking. `SM-PROCUREMENT-requisitionStatus` is `STATE_SET_ONLY`; the legal moves live only in these handlers' status checks. |

## PRC-018 — Purchase order raise and approve

| Field | Content |
| --- | --- |
| Purpose | Commit the organization to a supplier spend, at a total the server computed, approved by someone other than the raiser. |
| Owner role | procurement |
| Actors | parts and procurement raise; procurement, manager, accountant and owner approve; supplier is a read-only party. Only procurement and owner hold `procurement:e`, so only they may edit a draft. |
| Trigger | An approved requisition, or a direct buy |
| Preconditions | Caller holds `procurement:c`; the supplier row is in the caller's tenant |
| Main flow | 1. `POST /api/v1/procurement/purchase-orders` — `procurement:c`. 2. A named `supplierId` is resolved under RLS; a cross-tenant supplier 404s rather than leaks. 3. A named `requisitionId` must be at status `approved`, is locked `FOR UPDATE`, and is moved to `ordered` in the same transaction so it cannot be raised twice. 4. `purchaseOrderTotals` computes subtotal plus VAT from the lines; no total is ever client-sent. 5. Code `PO-nnnn`; status `draft`; `submittedBy` set; `orderedAt` stamped when `place` is true. 6. `PATCH .../:id` edits a draft only and recomputes totals when lines change. 7. `POST /api/v1/procurement/purchase-orders/:id/approve` — `procurement:a`; row locked; `checkPurchaseOrderApprovable` allows approval only from `draft`; `requireApproval` against `totalHalalas` on module `procurement`; `requireDifferentApprover` against `submittedBy`; status `approved` with `approvedBy` and `approvedAt`. |
| Alternative flow | A purchase order may be raised without a requisition. |
| Exceptions | Non-draft approval answers 409 with a message naming the status. Above ceiling answers the approval-required envelope. Self-approval answers 403. |
| Business rules applied | BR-PROCUREMENT-purchaseOrderTotals, BR-PROCUREMENT-checkPurchaseOrderApprovable, BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkSelfApproval, BR-MONEY-computeInvoiceTotals through `purchaseOrderTotals` |
| Approvals and SOD | SOD pair `Raise purchase order` and `Approve purchase order`. The primary guard is the `submittedBy` column check. The audit-trail signatures for `create` and `approve` on `purchase_order` exist in `server/src/security/sod.ts`, but `requireSodClear` is not called on the approve route — only `requireDifferentApprover` is. |
| Outputs | `purchase_orders` row and `purchase_order_lines`; the source requisition at `ordered` |
| Financial impact | Commits the spend. NOT IMPLEMENTED — no journal entry, no supplier liability row. |
| Inventory impact | None until receipt |
| Audit events | `create`, `update`, `approve` on `purchase_order` |
| Systems and APIs | `POST /api/v1/procurement/purchase-orders`, `PATCH .../:id`, `.../:id/approve`, `GET .../:id/lines` |
| Evidence | `server/src/routes/procurement.ts`, `packages/contract/src/rules/procurement.ts`, `server/src/security/sod.ts` |
| Known gaps | There is no send-to-supplier action. `SM-PROCUREMENT-purchaseOrderStatus` includes `sent` and `closed`, and no endpoint writes either; `sent` is only ever read, as one of the statuses receiving will accept. |

## PRC-019 — Goods receipt against a purchase order

| Field | Content |
| --- | --- |
| Purpose | Book what actually arrived against what was ordered, once, refusing a silent over-receipt. |
| Owner role | procurement |
| Actors | procurement, owner |
| Trigger | A delivery arrives |
| Preconditions | Caller holds `procurement:e`; an `Idempotency-Key` header is mandatory; the order is at `approved`, `sent` or `receiving` |
| Main flow | 1. `POST /api/v1/procurement/purchase-orders/:id/receive`. 2. `requirePermission(principal, MODULE, 'e')`. 3. `purchaseOrderReceiveBody` parsed. 4. A missing or malformed `Idempotency-Key` answers 400; a replay of the same key and body returns the stored 200. 5. The order is locked `FOR UPDATE`; a status outside `approved`, `sent`, `receiving` answers 422 telling the caller to approve it first. 6. An `overReceiptApproved` flag from a caller who does not hold `procurement:a` answers 422. 7. All lines are locked under one `SELECT ... FOR UPDATE`, so two concurrent receipts of the same last unit cannot both pass. 8. Per line, `checkReceive` returns `ok`, `invalid` or `over`; `over` without the approval flag answers 422 naming the overage. 9. `received_qty` is incremented per line. 10. The lines are re-read under the same lock; the order moves to `received` when every line has met its ordered quantity, otherwise `receiving`. 11. `writeAudit` records `receive` on `purchase_order` with the per-line quantities and the over-receipt flag. 12. `recordResult` stores the response. |
| Alternative flow | A partial delivery leaves the order at `receiving` and the same endpoint is called again with a new key. |
| Exceptions | Unknown line answers 400 on field `lineId`. Over-receipt without approval answers 422. |
| Business rules applied | BR-PROCUREMENT-checkReceive |
| Approvals and SOD | Over-receipt requires a caller holding `procurement:a`; the check is `hasPermission`, so it is authority without a ceiling. No submitter check — the person who raised and approved the order may receive it. |
| Outputs | `purchase_order_lines.received_qty`, `purchase_orders.status` |
| Financial impact | None. NOT IMPLEMENTED — no supplier invoice, no accrual, no journal entry. |
| Inventory impact | None. Receiving does **not** move stock: no `parts.on_hand` change and no `inventory_movements` row. The route comment states this explicitly — the PO line's part reference is optional free text that need not resolve to a `parts` row, so the received quantity is the authoritative ledger until that integration is built. Booking stock into inventory is a separate manual PRC-013 call. |
| Audit events | `receive` on `purchase_order` |
| Systems and APIs | `POST /api/v1/procurement/purchase-orders/:id/receive` |
| Evidence | `server/src/routes/procurement.ts`, `packages/contract/src/rules/procurement.ts` |
| Known gaps | `BR-INVENTORY-checkReceipt` in `packages/contract/src/rules/inventory.ts` duplicates the over-receipt rule and has no caller; the procurement route uses `checkReceive` instead. The two disagree in shape: one takes an `approved` flag, the other returns an `over` outcome. |

## PRC-020 — Insurance claim lifecycle

| Field | Content |
| --- | --- |
| Purpose | Record a claim against a policy, decide it within an approval ceiling, and settle it. |
| Owner role | accountant |
| Actors | accountant submits and pays; accountant or owner decides |
| Trigger | Insured work is done, or an incident is reported |
| Preconditions | The policy row is in the caller's tenant. Submit needs `accounting:c` and pay needs `accounting:e`, which only accountant holds — owner's grant on accounting is `vax`, so an owner can approve or reject a claim but can neither submit nor pay one. |
| Main flow | 1. `POST /api/v1/insurance-claims` — `accounting:c`; the policy is loaded under RLS; the claim copies the policy number and, absent an explicit vehicle, the policy's vehicle; claim number assigned; status `submitted`; `submittedBy` set. 2. `POST /api/v1/insurance-claims/:id/approve` — `accounting:a`; row locked; already approved, paid or rejected each answer 409; the approved amount defaults to the claimed amount and may never exceed it; `requireApproval` against the approved amount on module `accounting`; `requireDifferentApprover` against `submittedBy`; status `approved` with `amountApprovedHalalas`, `approvedBy`, `approvedAt`. 3. `POST /api/v1/insurance-claims/:id/pay` — `accounting:e`; a claim must be `approved` to be paid; status `paid` with `paidAt`. |
| Alternative flow | `POST /api/v1/insurance-claims/:id/reject` requires a reason and refuses an approved or paid claim. |
| Exceptions | Approved amount above claimed answers 400 on field `approvedAmountHalalas`. Wrong status answers 409. Above ceiling answers the approval-required envelope. |
| Business rules applied | BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkSelfApproval |
| Approvals and SOD | Ceiling on module `accounting`: accountant 2500000 halalas, owner unlimited. Submitter may not approve. |
| Outputs | `insurance_claims` row through `submitted`, `approved` or `rejected`, then `paid` |
| Financial impact | Records a receivable from the insurer and its settlement. NOT IMPLEMENTED — no journal entry, and no link to the customer invoice the claim offsets. |
| Inventory impact | None |
| Audit events | `create`, `approve`, `reject` on `insurance_claim`; the pay step writes its own audit row |
| Systems and APIs | `POST /api/v1/insurance-claims`, `.../:id/approve`, `.../:id/reject`, `.../:id/pay` |
| Evidence | `server/src/routes/insurance-claims.ts` |
| Known gaps | The RBAC matrix has no `insurance` module, so claims are gated on `accounting`, which means anyone who may approve accounting may approve a claim. `SM-INSURANCE-insuranceClaimStatus` includes `under_review` and no endpoint writes it. |

## PRC-021 — Leave request and decision

| Field | Content |
| --- | --- |
| Purpose | Let an employee request leave and an HR approver decide it, with the approver recorded. |
| Owner role | hr |
| Actors | hr, owner |
| Trigger | An employee requests leave |
| Preconditions | An `employees` row exists; the requester holds `hr:c`; the decider holds `hr:a` |
| Main flow | 1. `POST /api/v1/leave-requests` — the generated create route; `hr:c`. The `leaveRequests` writer resolves `employeeName` from the employee row and forces `status` to `submitted` on create. 2. `POST /api/v1/leave-requests/:id/approve` — `hr:a`; `leaveDecisionBody` parsed; the row is loaded `FOR UPDATE` and a request already approved or rejected answers 409; status `approved`, `approverId`, `decidedAt` written under the `version` predicate; `writeAudit` records `approve` on `leave_request`. 3. `POST /api/v1/leave-requests/:id/reject` — `hr:a`; a reason is mandatory; same shape. |
| Alternative flow | None |
| Exceptions | Already decided answers 409. Rejection without a reason answers 400 on field `reason`. Concurrent change answers 409. |
| Business rules applied | None from `BUSINESS_RULES.json` |
| Approvals and SOD | Authority only. `requireApproval` is not called, so there is no ceiling — correctly, since leave carries no amount. There is no submitter check: an HR approver may approve their own leave request. |
| Outputs | `leave_requests` row at `approved` or `rejected` |
| Financial impact | None recorded. Leave does not feed payroll. |
| Inventory impact | None |
| Audit events | `approve` or `reject` on `leave_request` |
| Systems and APIs | `POST /api/v1/leave-requests`, `.../:id/approve`, `.../:id/reject` |
| Evidence | `server/src/routes/leave.ts`, `server/src/writers.ts` |
| Known gaps | No balance is tracked and no balance is checked, so leave can be approved without limit. Approved leave does not move `employees` to `on_leave`. |

## PRC-022 — Payroll run and posting

| Field | Content |
| --- | --- |
| Purpose | Freeze a month's payroll totals from its lines, once. |
| Owner role | hr |
| Actors | hr, owner |
| Trigger | The period closes |
| Preconditions | The run is at status `draft`; caller holds `hr:e` |
| Main flow | 1. `POST /api/v1/payroll/runs` and `POST /api/v1/payroll/lines` — the generated create routes, `hr:c`. The `payrollLines` writer computes `netHalalas` with `payrollLineNetHalalas`, which is earnings plus allowances less deductions in integer halalas. 2. `POST /api/v1/payroll/runs/:id/post` — `requirePermission(principal, 'hr', 'e')`. 3. The run is loaded `FOR UPDATE`; already posted answers 409 saying it cannot be reopened; any other non-draft status answers 409. 4. Gross, allowances, deductions and net are summed in SQL over the run's live lines, inside the tenant transaction. 5. Status `posted`, the four totals, `postedAt` and `postedBy` are written under the `version` predicate. 6. `writeAudit` records `post` on `payroll_run`. |
| Alternative flow | None. There is no un-post. |
| Exceptions | Second post answers 409. Concurrent change answers 409. |
| Business rules applied | BR-HR-payrollLineNetHalalas, BR-HR-sumPayrollLines |
| Approvals and SOD | None. Posting is gated on `hr:e`, not `hr:a`, and `requireApproval` is not called — the route comment is explicit that posting is treated as an edit rather than an approval against a ceiling. SOD pair `Create employee` and `Approve payroll run` is declared but listed in `UNOBSERVABLE` in `server/src/security/sod.ts`. |
| Outputs | `payroll_runs` at `posted` with frozen totals |
| Financial impact | Freezes the payroll figure. NOT IMPLEMENTED — no journal entry, no payment, no bank file. |
| Inventory impact | None |
| Audit events | `post` on `payroll_run` |
| Systems and APIs | `POST /api/v1/payroll/runs/:id/post` |
| Evidence | `server/src/routes/payroll.ts`, `server/src/writers.ts`, `packages/contract/src/rules/hr.ts` |
| Known gaps | The salary figures on payroll payloads are nulled by `GLOBAL_REDACTIONS` for every role that does not hold the `Employee salary` field — but the redaction rule's hidden-from list does not include `hr` or `owner`, so those two see them, which is the intent. Payroll runs do not appear in the approval inbox. |

## PRC-023 — Bank statement matching

| Field | Content |
| --- | --- |
| Purpose | Reconcile a bank statement line to a book entry, idempotently. |
| Owner role | accountant |
| Actors | accountant only |
| Trigger | A statement is imported and reconciled |
| Preconditions | Caller holds `accounting:e`, which only accountant holds; a `bank_statements` row exists |
| Main flow | 1. `POST /api/v1/bank-statements/:id/match` with an optional `receiptId`. 2. `requirePermission(principal, 'accounting', 'e')`. 3. `bankStatementMatch` parsed. 4. The line is locked `FOR UPDATE`. 5. An already-matched line is returned as-is with 200 — a replay is a no-op, not a 409 and not a re-stamp. 6. `matched`, `matchedReceiptId` and `matchedAt` are written under the `version` predicate. 7. `writeAudit` records `transition` on `bank_statement` with reason `reconciled to book entry`. |
| Alternative flow | None. There is no unmatch. |
| Exceptions | Missing line answers 404 under RLS. |
| Business rules applied | None from `BUSINESS_RULES.json` |
| Approvals and SOD | None |
| Outputs | `bank_statements.matched`, `matched_receipt_id`, `matched_at` |
| Financial impact | Marks a book entry reconciled. No ledger entry. |
| Inventory impact | None |
| Audit events | `transition` on `bank_statement` |
| Systems and APIs | `POST /api/v1/bank-statements/:id/match` |
| Evidence | `server/src/routes/bank.ts` |
| Known gaps | The `receiptId` is stored without being validated against a `receipts` row, so a line can be matched to a receipt that does not exist. `bankStatements` is a read-only collection with no import endpoint. NOT IMPLEMENTED — statement lines can only arrive by seed or direct database write. |

## PRC-024 — Fleet contract renewal

| Field | Content |
| --- | --- |
| Purpose | Move a fleet contract's term forward and put it back to active in one named action rather than an arbitrary patch. |
| Owner role | manager |
| Actors | advisor, frontdesk, callcenter, manager, owner |
| Trigger | A contract approaches its end date |
| Preconditions | Caller holds `customers:e` |
| Main flow | 1. `POST /api/v1/fleets/:id/renew`. 2. `requirePermission(principal, 'customers', 'e')` — fleets are gated on the customers module, like the collection. 3. `fleetRenewBody` parsed. 4. `contractStatus` is set to `active` and `contractEndDate` to the new date; start date, renewal date, contract value and contract type are applied when supplied. 5. Written under the `version` predicate. 6. `writeAudit` records `update` on `fleet` with reason `contract renewed`. |
| Alternative flow | None |
| Exceptions | Concurrent change answers 409. |
| Business rules applied | None from `BUSINESS_RULES.json` |
| Approvals and SOD | None, and no ceiling on `contractValueHalalas` |
| Outputs | `fleets` row at `active` with a new term |
| Financial impact | Changes the contract value with no approval and no ledger entry |
| Inventory impact | None |
| Audit events | `update` on `fleet` |
| Systems and APIs | `POST /api/v1/fleets/:id/renew` |
| Evidence | `server/src/routes/fleets.ts` |
| Known gaps | Nothing moves a contract to `renewal` or `expired`; `SM-FLEET-fleetContractStatus` is `STATE_SET_ONLY` and only `active` is ever written by a named action. |

## PRC-025 — OBD diagnostic rescan and code clearing

| Field | Content |
| --- | --- |
| Purpose | Pull live fault codes from a connected OBD device and clear them after a repair. |
| Owner role | technician |
| Actors | technician, advisor, manager, owner |
| Trigger | A diagnostic step on a job card |
| Preconditions | Caller holds `jobcards:e`; an OBD bridge is configured |
| Main flow | 1. `POST /api/v1/diagnostics/devices/:id/rescan` — `jobcards:e`; the configured bridge is asked to rescan and the readings are recorded. 2. `POST /api/v1/diagnostics/devices/:id/clear-codes` — `jobcards:e`; the bridge clears the codes and `writeAudit` records the command. 3. `GET /api/v1/diagnostics/devices/:id/readings` — `jobcards:v`. 4. `GET /api/v1/diagnostics/integrations` — `jobcards:v`, reports which integrations are actually configured. |
| Alternative flow | None |
| Exceptions | No bridge configured answers 503 naming the missing dependency rather than faking a scan. |
| Business rules applied | None |
| Approvals and SOD | None |
| Outputs | `obd_dtc_readings` rows |
| Financial impact | None |
| Inventory impact | None |
| Audit events | `command` on the device for clear-codes |
| Systems and APIs | `POST /api/v1/diagnostics/devices/:id/rescan`, `.../clear-codes`, `GET .../readings`, `GET /api/v1/diagnostics/integrations` |
| Evidence | `server/src/routes/obd.ts`, `server/src/integrations/obd.ts`, `server/src/app.ts` |
| Known gaps | The default bridge refuses, so this process is inert unless `OBD_TRANSPORT` is configured. The registry marks `rescan` as not audited while `clear-codes` is. |

## PRC-026 — Governed bulk export

| Field | Content |
| --- | --- |
| Purpose | Let a role that holds export authority pull a whole collection as CSV without leaking a column or a row their screen would hide. |
| Owner role | varies by module |
| Actors | any role holding `x` on the module |
| Trigger | A user asks for a spreadsheet |
| Preconditions | Caller holds `x` on the module, which is a stricter gate than `v` |
| Main flow | 1. `GET /api/v1/{collection}/export`. 2. `requirePermission(principal, def.module, 'x')` — a role with `v` but not `x` is refused, which is the point of the route. 3. `?includeDeleted` additionally requires `d`. 4. The rows travel through the same RLS transaction, the same `listRows` query and the same `presentRow` as the list route, so `?q=`, `?sort=` and `?filter[]=` narrow the export exactly as they narrow the list, and field redaction holds byte for byte. 5. Pages are walked at 200 rows until the set is complete or the 50000-row egress cap is reached. 6. `csvCell` applies RFC 4180 quoting and neutralises formula injection by prefixing a single quote to any value starting with `=`, `+`, `-`, `@`, tab or carriage return. 7. A truncated export sets `x-export-truncated: true` and logs a warning rather than cutting off silently. |
| Alternative flow | None |
| Exceptions | No `x` grant answers 403. |
| Business rules applied | None; the controls are the grant, RLS and `redact` |
| Approvals and SOD | None |
| Outputs | A CSV attachment named `{entity}-{date}.csv` |
| Financial impact | None |
| Inventory impact | None |
| Audit events | None — the export route writes no audit row |
| Systems and APIs | `GET /api/v1/{collection}/export` for all 52 collections |
| Evidence | `server/src/routes/collections.ts`, `server/src/security/permissions.ts` |
| Known gaps | Bulk egress of an entire collection is not audited. An operator cannot answer who exported the customer list and when from the audit log. |

---

## Processes deliberately not catalogued

| Candidate | Why it is not here |
| --- | --- |
| Loan repayment recording | `loanContracts` and `loanRepayments` are read-only collections with no writer and no action route. `buildRepaymentPlan`, `amortisedInstalmentHalalas` and `monthlyInterestHalalas` exist in `packages/contract/src/rules/loans.ts` and have no caller in `server/src`. Only `GET /api/v1/loans/summary` reads the tables. NOT IMPLEMENTED — no endpoint originates a loan or records a repayment. |
| Journal entry posting | `journalEntries` is a read-only collection. `checkJournalBalanced` exists in `packages/contract/src/rules/money.ts` with no caller. `server/src/security/sod.ts` lists both halves of the `Post journal entry` pair as unobservable. NOT IMPLEMENTED — nothing in the API writes a journal entry, so the double-entry ledger is populated only by seed. |
| Supplier payment approval | Declared as an SOD counterpart and listed in `UNOBSERVABLE`. NOT IMPLEMENTED — no supplier payment route exists. |
| Timesheet approval | `SM-HR-timesheetStatus` declares `submitted`, `approved`, `rejected`, and the only write path is a plain `PATCH /api/v1/timesheets/:id` under `hr:e`. There is no approval route and no approver is recorded. |
| Expense submission and approval | `expenses` is a read-only collection with no writer and no action route. |
| Refund or credit note | `checkRefund` exists with no caller and there is no endpoint. |
| Vehicle service history and warranty | No route beyond the generic `vehicles` collection and `GET /api/v1/vehicles/:id/history`, which reads the audit log rather than a service record. |
