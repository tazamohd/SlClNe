**Status:** NORMATIVE · **Owner:** Process architect

# User flows

This file shows what each role can actually do, as a flowchart of the human's path through the product. The roles, their data scope and their approval ceiling are the fifteen in `packages/contract/src/rbac.ts`, which is the matrix `server/src/security/permissions.ts` enforces; every branch drawn below is permitted by that matrix, and where a role would expect a step it does not hold the grant for, the diagram says the gate refuses. Nothing here is drawn from a screen mock — a flow that the matrix denies is not shown as a flow, it is listed as a denial.

## Roles, scope and ceiling

`scope` and `limitSar` come from `ROLE_META` in `packages/contract/src/rbac.ts`, mirrored into `roleMeta` in `project-control/PERMISSION_REGISTRY.json`. The ceiling in halalas is `limitSar × 100`, computed in one place by `ceilingHalalas` in `server/src/security/approvals.ts`.

| Role | Data scope | Approval ceiling SAR | Ceiling halalas | Holds `a` on |
| --- | --- | --- | --- | --- |
| owner | all | unlimited | unlimited | jobcards, appointments, estimates, customers, vehicles, inventory, procurement, invoices, payments, accounting, hr, technicians, crm, approvals, ai, admin, settings, network |
| superadmin | platform | unlimited | unlimited | ai, admin, settings only — **not** on any business module |
| manager | branch | 50000 | 5000000 | jobcards, appointments, estimates, inventory, procurement, invoices, payments, technicians, approvals |
| advisor | branch | 5000 | 500000 | jobcards, approvals |
| technician | own | 0 | 0 | nothing |
| qc | branch | 0 | 0 | jobcards |
| parts | branch | 10000 | 1000000 | inventory, approvals |
| accountant | all | 25000 | 2500000 | procurement, invoices, payments, accounting, approvals |
| hr | all | 15000 | 1500000 | hr, approvals |
| frontdesk | branch | 0 | 0 | nothing |
| callcenter | all | 0 | 0 | nothing |
| procurement | all | 20000 | 2000000 | procurement, approvals, network |
| supplier | external | 0 | 0 | nothing |
| customer | self | 0 | 0 | nothing |
| test | all | unlimited | unlimited | every module — the QA account, not a business role |

Two consequences of `canApprove` in `server/src/security/approvals.ts` that the ceiling column alone does not show:

- **A ceiling of zero is not a licence.** `canApprove` returns true for a zero-ceiling role only when no amount is supplied. So qc may pass a quality check, which carries no amount, and may approve nothing that does.
- **An unlimited ceiling is not authority.** superadmin has no `a` grant on any business module, so despite the null ceiling it can approve no estimate, purchase order, invoice or claim. The refusal reason is `authority`, not `ceiling`.

## Field redaction by role

`FIELD_RULES` in `packages/contract/src/rbac.ts`, applied on the way out by `redact` in `server/src/security/permissions.ts`, so a hidden field is never serialised.

| Field | Hidden from |
| --- | --- |
| Part cost and margin | advisor, technician, qc, frontdesk, callcenter, customer, supplier |
| Labour cost rate | technician, qc, frontdesk, callcenter, customer, supplier |
| Employee salary | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |
| Supplier purchase price | advisor, technician, qc, frontdesk, callcenter, customer |
| Customer contact details | technician, qc, supplier |
| Bank account details | advisor, technician, qc, parts, frontdesk, callcenter, hr, procurement, supplier, customer |
| Branch P and L | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |

`Employee salary` and `Branch P and L` are recorded in `DEFENCE_IN_DEPTH_FIELDS`: they hide fields only from roles the module gate already turns away, so they protect nothing today and are swept globally in case a future payload starts carrying those keys.

---

## owner — scope all, unlimited ceiling

```mermaid
flowchart TD
    A[Sign in] --> B[Dashboard across every branch]
    B --> C{What today}
    C -->|Workshop| D[Open or edit any job card, assign, transition, release through QC]
    C -->|Money| E[Create and issue invoices, record payments]
    C -->|Approvals| F[Approval inbox]
    F --> G[Approve an estimate at any amount]
    F --> H[Approve a requisition or purchase order at any amount]
    C -->|Insurance| I[Approve or reject a claim]
    I --> I2[Cannot submit or pay a claim, accounting grant is view approve export only]
    C -->|People| J[HR module in full, payroll runs and lines, post a run]
    C -->|Platform| K[Admin, settings, network, audit log, exports on every module]
    G --> L[Refused when owner raised the same document, self approval is blocked]
    H --> L
```

The owner's only routine refusal is segregation of duties: `requireDifferentApprover` blocks self-approval regardless of role, and `requireSodClear` blocks an owner who moved a job through repair from passing its quality check. The owner's grant on `accounting` is `vax`, so bank matching, claim submission and claim payment — all `accounting:e` — are refused.

## superadmin — scope platform, unlimited ceiling, no business approval

```mermaid
flowchart TD
    A[Sign in] --> B[Platform view across tenants]
    B --> C[Read only on every business module, grant is v]
    B --> D[Full control of ai, admin and settings]
    C --> E{Try to approve a business document}
    E --> F[Refused with reason authority, not ceiling]
    B --> G[Export reports, approvals queue and audit log]
```

## manager — scope branch, ceiling 5000000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[Branch dashboard]
    B --> C[Open job cards, assign technicians, drive every stage]
    B --> D[Create and edit estimates, then approve up to the branch ceiling]
    D --> D2{Total above 5000000 halalas}
    D2 -->|Yes| D3[Escalate to owner, the answer is approvalRequired not forbidden]
    D2 -->|No| D4[Approved, approvedBy and approvedAt stamped]
    B --> E[Create and issue invoices, record payments]
    B --> F[Inventory in full, movements and reservations]
    B --> G[Raise and approve requisitions and purchase orders]
    G --> G2[Cannot edit a draft purchase order or receive goods, no procurement edit grant]
    B --> H[Approval inbox with per row standing]
    B --> I[Reports, exec reports, audit log, exports]
    B --> J[Accounting is view and export only, no posting]
```

## advisor — scope branch, ceiling 500000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[Branch work list]
    B --> C[Create a job card and book appointments]
    C --> D[Assign a technician and move stages]
    D --> E[Pass quality check, advisor holds jobcards approve]
    E --> E2[Blocked when the advisor performed the repair, checked over the audit trail]
    B --> F[Create and edit an estimate]
    F --> G[Send the customer an approval code over SMS]
    G --> H[Verify the code, the signature is recorded]
    F --> I{Approve the estimate}
    I --> J[Refused, advisor holds estimates view create edit only]
    B --> K[Create an invoice and record a payment]
    K --> K2[Cannot issue the invoice, no invoices edit grant]
    B --> L[Approval inbox, sees rows but no estimate approve action]
    B --> M[Part cost, labour cost, supplier price and bank details are nulled on the wire]
```

The advisor is the clearest case where the inbox and the action disagree by design: `approvals:va` puts the queue in front of them, `estimates:vce` keeps the decision away from them. The `approval.canApprove` flag the queue returns is computed per caller and will be false on every estimate row for this role.

## technician — scope own, ceiling zero

```mermaid
flowchart TD
    A[Sign in] --> B[Technician portal, own work only]
    B --> C[View assigned job cards]
    C --> D[Move a job through the working stages, jobcards edit]
    D --> E{Move to delivery}
    E --> F[Refused, that transition needs jobcards approve]
    B --> G[View parts, vehicles, customers and estimates, read only]
    B --> H[Export own portal data]
    B --> I[Part cost, labour rate and customer contact details are nulled on the wire]
```

## qc — scope branch, ceiling zero

```mermaid
flowchart TD
    A[Sign in] --> B[Technician portal view of the branch]
    B --> C[Open a job card at stage qc]
    C --> D[Pass the quality check, the one transition qc may make]
    D --> E{Did this person perform the repair}
    E -->|Yes on the record| F[Refused by checkQcIndependence]
    E -->|Yes in the audit trail| G[Refused by requireSodClear and the refusal is itself audited]
    E -->|No| H[Job moves to delivery, qcPassedBy stamped]
    B --> I{Any other stage move}
    I --> J[Refused, qc holds no jobcards edit grant]
    B --> K[Reports and vehicles, read only]
```

## parts — scope branch, ceiling 1000000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[Stock room]
    B --> C[Create and edit parts, full inventory grant]
    B --> D[Reserve stock against committed work]
    D --> D2[Refused when reserved plus quantity exceeds on hand]
    B --> E[Record a movement with a mandatory Idempotency-Key]
    E --> F{Movement type}
    F -->|Issue stock| G[Checked against the audit trail for a prior count adjustment on this part]
    F -->|Adjust count| H[Checked against the audit trail for a prior issue on this part]
    F -->|Transfer| I[Destination branch resolved under RLS, two ledger rows written]
    B --> J[Raise a requisition, procurement create only]
    J --> J2[Cannot approve it, no procurement approve grant]
    B --> K[Approval inbox, approvals approve held]
    B --> L[Supplier and procurement portals, read only]
```

## accountant — scope all, ceiling 2500000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[Finance desk across all branches]
    B --> C[Create, edit, issue and cancel invoices]
    C --> C2{Total above 2500000 halalas}
    C2 -->|Yes| C3[Issue refused, escalate]
    B --> D[Record payments and receipts]
    B --> E[Accounting module in full, chart of accounts, expenses, journal entries]
    E --> E2[Reads only, nothing in the API posts a journal entry]
    B --> F[Match a bank statement line to a book entry]
    B --> G[Submit an insurance claim, approve it, then pay it]
    G --> G2[Approval refused when the accountant submitted the claim]
    B --> H[Approve requisitions and purchase orders, procurement approve held]
    B --> I[Approval inbox, exec reports, audit log, exports on most modules]
    B --> J[No workshop write access, job cards and estimates are view and export only]
```

## hr — scope all, ceiling 1500000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[People]
    B --> C[Create and edit employees, timesheets and payroll lines]
    C --> D[Net pay computed by payrollLineNetHalalas, never client sent]
    B --> E[Post a payroll run]
    E --> E2[Totals summed in SQL, status posted, cannot be reopened]
    B --> F[Decide a leave request, approve or reject with a reason]
    F --> F2[No balance is checked and the approver may be the requester]
    B --> G[Technicians directory, create edit delete]
    B --> H[Reports and approval inbox]
    B --> I[Bank account details are nulled on the wire even for hr]
```

## frontdesk — scope branch, ceiling zero

```mermaid
flowchart TD
    A[Sign in] --> B[Reception and kiosk]
    B --> C[Register a customer and their vehicle]
    C --> D[Book, edit or cancel an appointment]
    D --> D2[Refused when the bay is already booked for that interval]
    B --> E[Open a job card, jobcards create]
    E --> E2[Cannot move a stage, no jobcards edit grant]
    B --> F[Create an invoice and record a payment]
    F --> F2[Cannot issue the invoice]
    B --> G[Kiosk module, create and export]
    B --> H[Customer portal view, estimates read only]
    B --> I[Part cost, labour rate, supplier price and bank details are nulled on the wire]
```

## callcenter — scope all, ceiling zero

```mermaid
flowchart TD
    A[Sign in] --> B[Call queue across all branches]
    B --> C[Find or create a customer, edit their details]
    C --> D[Book, edit or cancel an appointment]
    B --> E[CRM, create and work leads, opportunities and tasks]
    E --> F[Convert a lead into an opportunity, crm create and edit both held]
    B --> G[Read job cards, estimates, invoices and vehicles]
    G --> G2[No write on any of them]
    B --> H[Callcenter module in full, export included]
    B --> I[No approvals queue, callcenter holds no approvals grant]
```

## procurement — scope all, ceiling 2000000 halalas

```mermaid
flowchart TD
    A[Sign in] --> B[Procurement desk]
    B --> C[Maintain the supplier directory]
    B --> D[Raise a requisition, submit it]
    D --> E{Approve it}
    E --> E2[Refused when the same person submitted it]
    E --> E3[Refused above 2000000 halalas, escalate]
    E --> F[Approved, then raise a purchase order from it]
    F --> G[Requisition moves to ordered in the same transaction]
    G --> H[Approve the purchase order, same ceiling and same self approval block]
    H --> I[Receive goods against the order with a mandatory Idempotency-Key]
    I --> I2{Receipt exceeds the ordered quantity}
    I2 -->|Over receipt approved and caller holds procurement approve| I3[Booked, flagged in the audit row]
    I2 -->|Otherwise| I4[Refused, the overage is named]
    I --> J[Stock is not moved, a separate inventory movement is required]
    B --> K[Inventory view create edit and export, no delete]
    B --> L[Approval inbox, network module, supplier and procurement portals]
```

## supplier — scope external, ceiling zero

```mermaid
flowchart TD
    A[Sign in] --> B[Supplier portal]
    B --> C[View own procurement records, procurement view only]
    B --> D[Network module, create and edit]
    B --> E[Export from the supplier portal]
    B --> F[No inventory, no invoices, no customers, no approvals]
    B --> G[Part cost, labour rate, customer contact and bank details are nulled on the wire]
```

## customer — scope self, ceiling zero

```mermaid
flowchart TD
    A[Sign in to the portal] --> B[Own records only, narrowed by the r_self policy on customer_id]
    B --> C[Book an appointment]
    C --> C2[The server writes customer_id from the token, not from the body]
    B --> D[View own job cards, estimates, invoices and vehicles]
    D --> E{Approve an estimate in the portal}
    E --> F[No such flow, the customer signature is an SMS code the advisor triggers]
    B --> G[Export own portal data]
    B --> H[Part cost, labour rate, supplier price and bank details are nulled on the wire]
```

A self-scoped principal with no `customer_id` on its user row sees nothing rather than everything, because NULL matches no row under the `r_self` policies in `server/drizzle/0014_customer_id_link.sql`.

## test — scope all, unlimited, QA only

```mermaid
flowchart TD
    A[Sign in as the QA account] --> B[Every action on every module]
    B --> C[Walk any process end to end in one session]
    B --> D[Switch role, the only role auth switch-role will act as another from]
    B --> E[Every action still written to the audit log with actorRole test]
```

This is not a business role. Its breadth is the reason the audit module is enforced rather than assumed.

## Denials worth knowing

| Role | Wants to | Refused because |
| --- | --- | --- |
| advisor | approve an estimate | `estimates` grant is `vce`; only manager and owner hold `a` |
| advisor | issue an invoice | `invoices` grant is `vc`, issue needs `e` |
| superadmin | approve anything financial | holds no `a` on any business module; reason is `authority` |
| owner | match a bank statement, submit or pay an insurance claim | `accounting` grant is `vax`, all three need `e` |
| manager | edit a draft purchase order or receive goods | `procurement` grant is `vcax`, both need `e` |
| parts | approve the requisition they raised | `procurement` grant is `vc`, and self-approval is blocked anyway |
| qc | move a job through any stage other than the QC release | `jobcards` grant is `va`, every other transition needs `e` |
| technician | move a job to delivery | that one transition is gated on `jobcards:a` |
| frontdesk | move a job card stage | `jobcards` grant is `vc` |
| callcenter | open the approval inbox | holds no `approvals` grant |
| customer, supplier | see any cost, margin or bank detail | redacted server-side before serialisation |

## Source note

The grants above are `packages/contract/src/rbac.ts`, the matrix `server/src/security/actions.ts` reads and `server/src/security/permissions.ts` enforces. `project-control/PERMISSION_REGISTRY.json` is generated from that file and agrees with it cell for cell; either may be read, and the registry carries the cell counts in `totals`.
