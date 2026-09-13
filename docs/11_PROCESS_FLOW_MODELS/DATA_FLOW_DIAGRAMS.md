**Status:** NORMATIVE · **Owner:** Process architect

# Data flow diagrams

This file traces where data actually moves in SALIS AUTO: level 0 for the system in its context, level 1 for the major processes and the stores they read and write, and level 2 for the two flows where the detail earns its place — money from estimate to payment, and stock from requisition to inventory movement. Every data store named is a real table in `project-control/ENTITY_REGISTRY.json`, spelled as the database spells it. Every flow corresponds to an endpoint in `PROCESS_CATALOG.md`. Flows that a reader would expect and that do not exist are drawn as broken links and named, rather than omitted so the picture looks complete.

## Notation

- Rounded nodes are processes, each labelled with its PRC id.
- `DS` nodes are data stores, labelled with the real table name.
- Square nodes at the edges are external entities.
- A dashed arrow labelled NOT IMPLEMENTED is a flow the business needs and the code does not have.
- Every store access shown happens inside a transaction that has already run `SET LOCAL app.org_id`, so RLS narrows it to one tenant. That is not drawn per arrow.

---

## Level 0 — context

```mermaid
flowchart LR
    CUST[Customer]
    VISITOR[Website visitor]
    STAFF[Workshop staff]
    SUPP[Supplier]
    SMS[SMS transport, unconfigured by default]
    OBD[OBD bridge, unconfigured by default]
    ZATCA[ZATCA e-invoicing regime]
    BANK[Bank statement source]

    SYS(((SALIS AUTO<br/>multi tenant API and SPA)))

    VISITOR -->|contact form submission| SYS
    CUST -->|booking request, portal sign in| SYS
    SYS -->|appointment confirmation data, own job cards and invoices| CUST
    SYS -->|one time approval code| SMS
    SMS -->|delivery or refusal| SYS
    CUST -->|approval code read back to the advisor| STAFF
    STAFF -->|job cards, estimates, invoices, payments, stock, procurement| SYS
    SYS -->|work lists, approval queue, reports, CSV exports| STAFF
    SUPP -->|goods against a purchase order| STAFF
    SYS -->|purchase order records, supplier portal reads| SUPP
    SYS -->|invoice hash chain and QR payload| ZATCA
    OBD -->|fault code readings| SYS
    SYS -->|rescan and clear code commands| OBD
    BANK -.->|statement lines, NOT IMPLEMENTED, no import endpoint| SYS
```

Four of the eight external interfaces are honest about not working. The SMS transport and the OBD bridge both default to refusing with a 503 that names the missing dependency rather than pretending. The ZATCA flow is one-directional: the system computes a hash chain and a TLV QR payload on issue and there is no submission or clearance call. Bank statement lines have a matching endpoint but no import endpoint, so they can only arrive by seed.

---

## Level 1 — major processes and stores

```mermaid
flowchart TB
    CUST[Customer]
    STAFF[Workshop staff]
    SUPP[Supplier]

    subgraph Front of house
        P1(PRC-004 Appointment booking)
        P2(PRC-005 and PRC-006 Job card lifecycle)
    end
    subgraph Commercial
        P3(PRC-008 to PRC-010 Estimating and customer signature)
        P4(PRC-014 to PRC-016 Invoicing and collection)
    end
    subgraph Supply
        P5(PRC-017 to PRC-019 Procure to receive)
        P6(PRC-012 and PRC-013 Stock control)
    end
    subgraph Back office
        P7(PRC-020 Insurance claims)
        P8(PRC-021 and PRC-022 HR and payroll)
        P9(PRC-023 Bank matching)
        P10(PRC-011 Approval queue)
    end

    DS1[(appointments)]
    DS2[(job_cards)]
    DS3[(estimates and estimate_lines)]
    DS4[(invoices and invoice_lines)]
    DS5[(payments and receipts)]
    DS6[(parts and inventory_movements)]
    DS7[(requisitions and requisition_lines)]
    DS8[(purchase_orders and purchase_order_lines)]
    DS9[(insurance_policies and insurance_claims)]
    DS10[(employees, payroll_runs, payroll_lines, leave_requests, timesheets)]
    DS11[(bank_statements)]
    DS12[(audit_log)]
    DS13[(otp_challenges)]
    DS14[(idempotency_keys)]
    DS15[(chart_of_accounts and journal_entries)]

    CUST --> P1
    STAFF --> P1
    P1 --> DS1
    P1 -.->|NOT IMPLEMENTED, no endpoint creates a job card from an appointment| P2
    STAFF --> P2
    P2 --> DS2
    P2 --> P3
    STAFF --> P3
    P3 --> DS3
    P3 --> DS13
    P3 -.->|NOT IMPLEMENTED, approved estimate lines are not copied| P4
    STAFF --> P4
    P4 --> DS4
    P4 --> DS5
    P4 --> DS14
    P4 -.->|NOT IMPLEMENTED, no posting on issue or payment| DS15
    STAFF --> P5
    P5 --> DS7
    P5 --> DS8
    P5 --> DS14
    SUPP --> P5
    P5 -.->|NOT IMPLEMENTED, receiving does not move stock| P6
    STAFF --> P6
    P6 --> DS6
    P6 --> DS14
    STAFF --> P7
    P7 --> DS9
    STAFF --> P8
    P8 --> DS10
    STAFF --> P9
    P9 --> DS11
    DS3 --> P10
    P10 --> STAFF
    P2 --> DS12
    P3 --> DS12
    P4 --> DS12
    P5 --> DS12
    P6 --> DS12
    P7 --> DS12
    P8 --> DS12
    P9 --> DS12
    DS12 --> P6
    DS12 --> P2
```

Two arrows out of `audit_log` run backwards into a process. That is not a drawing error: `requireSodClear` in `server/src/security/sod.ts` reads the trail as an input to the decision, because four of the six declared segregation-of-duties pairs cannot be expressed by any permission grant and only the history of who did what can answer them.

`chart_of_accounts` and `journal_entries` receive nothing. The double-entry ledger exists as tables and as read endpoints — `GET /api/v1/accounting/journal-entries`, `GET /api/v1/accounting/reports/trial-balance` — and no process writes to it.

---

## Level 2 — money: estimate to invoice to payment to accounting

```mermaid
flowchart TB
    ADV[Advisor]
    APPR[Manager or owner]
    ACC[Accountant]
    CUSTOMER[Customer]
    SMSX[SMS transport]

    E1(PRC-008 Create estimate<br/>POST /api/v1/estimates)
    E2(PRC-010 Request approval code<br/>POST /estimates/:id/request-approval-otp)
    E3(PRC-010 Verify approval code<br/>POST /estimates/:id/verify-approval-otp)
    E4(PRC-009 Approve estimate<br/>POST /estimates/:id/approve)
    I1(PRC-014 Create invoice<br/>POST /api/v1/invoices)
    I2(PRC-015 Issue invoice<br/>POST /invoices/:id/issue)
    M1(PRC-016 Record payment<br/>POST /invoices/:id/payments)
    B1(PRC-023 Match statement line<br/>POST /bank-statements/:id/match)
    R1(Finance reports<br/>GET /accounting/reports/trial-balance)

    DSE[(estimates)]
    DSEL[(estimate_lines)]
    DSO[(otp_challenges)]
    DSI[(invoices)]
    DSIL[(invoice_lines)]
    DSP[(payments)]
    DSR[(receipts)]
    DSB[(bank_statements)]
    DSJ[(journal_entries)]
    DSC[(chart_of_accounts)]
    DSA[(audit_log)]
    DSK[(idempotency_keys)]

    ADV --> E1
    E1 -->|computeInvoiceTotals, integer halalas| DSE
    E1 --> DSEL
    E1 --> DSA
    ADV --> E2
    E2 -->|issueChallenge, code hashed at rest| DSO
    E2 -->|masked destination only| SMSX
    SMSX --> CUSTOMER
    CUSTOMER -->|reads the code back| ADV
    ADV --> E3
    E3 -->|verified_at stamped| DSO
    E3 -->|approve row, reason customer_otp_signature| DSA
    E3 -.->|NOT IMPLEMENTED, the signature does not change estimates.status| DSE
    APPR --> E4
    E4 -->|checkEstimateFresh, requireApproval, requireDifferentApprover| DSE
    E4 --> DSA
    E4 -.->|NOT IMPLEMENTED, no estimate to invoice carry over| I1
    ACC --> I1
    I1 -->|computeInvoiceTotals with discount, status draft| DSI
    I1 --> DSIL
    I1 --> DSK
    I1 --> DSA
    ACC --> I2
    DSI -->|hash_self of the last issued invoice| I2
    I2 -->|status unpaid, hash_prev, hash_self, qr_code| DSI
    I2 --> DSA
    ACC --> M1
    DSI -->|balance read under SELECT FOR UPDATE| M1
    M1 -->|checkPayment against the balance| DSP
    M1 -->|paid_halalas and status paid or partial| DSI
    M1 -->|status cleared| DSR
    M1 --> DSK
    M1 --> DSA
    ACC --> B1
    DSR -.->|receiptId stored without validation| B1
    B1 -->|matched, matched_receipt_id, matched_at| DSB
    B1 --> DSA
    I2 -.->|NOT IMPLEMENTED, no receivable posted| DSJ
    M1 -.->|NOT IMPLEMENTED, no cash or revenue posted| DSJ
    DSJ --> R1
    DSC --> R1
```

What this diagram says plainly:

- **The money arithmetic is server-side and integral.** `computeInvoiceTotals` in `packages/contract/src/rules/money.ts` derives every figure from quantities and net unit prices; `roundHalfUp` is applied once at the subtotal and once at the tax, never per line; `VAT_RATE_BPS` is basis points so the rate is exact. No client-sent total is read at any point on this path.
- **The chain that binds documents together is missing.** An approved estimate does not become an invoice, and a verified customer signature does not move the estimate's status. Both handovers are a person re-keying.
- **The ledger is never written.** `journal_entries` and `chart_of_accounts` feed the trial balance and the tax return, and nothing on this path posts to them. `checkJournalBalanced` exists in the rules package with no caller.
- **Reconciliation is one-way and unvalidated.** A statement line can be matched to a `receiptId` that does not name a real `receipts` row, and there is no unmatch.

---

## Level 2 — stock: requisition to purchase order to receipt to inventory movement

```mermaid
flowchart TB
    REQR[Parts or procurement raiser]
    APPR[Procurement, manager, accountant or owner]
    RECV[Procurement receiver]
    STORE[Storekeeper]
    SUPPLIER[Supplier]

    Q1(PRC-017 Raise requisition<br/>POST /procurement/requisitions)
    Q2(PRC-017 Submit<br/>POST /requisitions/:id/submit)
    Q3(PRC-017 Approve<br/>POST /requisitions/:id/approve)
    O1(PRC-018 Raise purchase order<br/>POST /procurement/purchase-orders)
    O2(PRC-018 Approve purchase order<br/>POST /purchase-orders/:id/approve)
    G1(PRC-019 Receive goods<br/>POST /purchase-orders/:id/receive)
    V1(PRC-012 Reserve stock<br/>POST /inventory/:id/reservation)
    V2(PRC-013 Record movement<br/>POST /inventory/:id/movement)

    DSQ[(requisitions)]
    DSQL[(requisition_lines)]
    DSO[(purchase_orders)]
    DSOL[(purchase_order_lines)]
    DSS[(suppliers)]
    DSP[(parts)]
    DSM[(inventory_movements)]
    DSBR[(branches)]
    DSK[(idempotency_keys)]
    DSA[(audit_log)]

    REQR --> Q1
    Q1 -->|requisitionEstimatedTotalHalalas, VAT exclusive, status draft| DSQ
    Q1 --> DSQL
    Q1 --> DSA
    REQR --> Q2
    Q2 -->|status submitted, submittedBy| DSQ
    Q2 --> DSA
    APPR --> Q3
    DSQ -->|estimated total read under SELECT FOR UPDATE| Q3
    Q3 -->|requireApproval then requireDifferentApprover, status approved| DSQ
    Q3 --> DSA
    REQR --> O1
    DSS -->|supplier resolved under RLS or 404| O1
    DSQ -->|must be approved, then moved to ordered in the same transaction| O1
    O1 -->|purchaseOrderTotals, subtotal plus VAT, status draft| DSO
    O1 --> DSOL
    O1 --> DSA
    APPR --> O2
    O2 -->|checkPurchaseOrderApprovable, ceiling, submitter check, status approved| DSO
    O2 --> DSA
    SUPPLIER -->|physical delivery| RECV
    RECV --> G1
    DSOL -->|all lines locked under one SELECT FOR UPDATE| G1
    G1 -->|checkReceive per line, received_qty incremented| DSOL
    G1 -->|status receiving or received| DSO
    G1 --> DSK
    G1 --> DSA
    G1 -.->|NOT IMPLEMENTED, no stock booked and no movement row| DSP
    G1 -.->|NOT IMPLEMENTED| DSM
    STORE --> V1
    DSP -->|on hand and reserved read under SELECT FOR UPDATE| V1
    V1 -->|checkReservation, reserved updated| DSP
    V1 --> DSA
    STORE --> V2
    DSA -->|readHistory for a prior Issue stock or Adjust count on this part| V2
    DSBR -->|destination branch resolved under RLS| V2
    DSP -->|locked row| V2
    V2 -->|checkMovement then movementDelta, on hand and reserved updated| DSP
    V2 -->|one row, or two sharing a transferId for a transfer| DSM
    V2 --> DSK
    V2 --> DSA
```

What this diagram says plainly:

- **The approval chain is real and doubly guarded.** Both the requisition and the purchase order check the ceiling against a server-computed total and then check that the approver is not the submitter. A requisition raised from nothing cannot skip to a purchase order: the raise step refuses a requisition that is not `approved`, and marks it `ordered` in the same transaction so it cannot be drawn on twice.
- **The receipt does not touch stock.** This is the largest structural gap in the supply flow and it is deliberate rather than accidental — the route's own comment explains that a purchase order line's part reference is optional free text that need not resolve to a `parts` row, so booking the lines that happen to resolve and skipping the rest would be worse than not booking at all. The consequence stands regardless: `purchase_order_lines.received_qty` and `parts.on_hand` are two independent ledgers, and nothing reconciles them.
- **Both quantity-changing endpoints are idempotent by force.** Receiving and movement both refuse a request without an `Idempotency-Key`, because neither body carries a natural dedupe key and a retried request would otherwise book the quantity twice.
- **The audit log is an input, not just an output.** The movement endpoint reads it to answer whether this person already performed the counterpart duty on this part — the one segregation-of-duties pair that no permission grant can express, because both duties are `inventory:e`.

---

## Store inventory

Every data store referenced above, with the endpoint families that write it. Table names are as spelled in `project-control/ENTITY_REGISTRY.json`.

| Store | Written by | Read by |
| --- | --- | --- |
| `appointments` | PRC-004, generated collection routes | booking screens, workshop reports |
| `job_cards` | PRC-005, PRC-006, PRC-007 | workshop board, estimates, invoices, claims |
| `estimates`, `estimate_lines` | PRC-008, PRC-009 | PRC-011 approval queue |
| `invoices`, `invoice_lines` | PRC-014, PRC-015, PRC-016 | finance reports, tax return |
| `payments`, `receipts` | PRC-016 | invoice screens, PRC-023 |
| `parts`, `inventory_movements` | PRC-012, PRC-013 | stock screens, product reports |
| `requisitions`, `requisition_lines` | PRC-017 | PRC-018 |
| `purchase_orders`, `purchase_order_lines` | PRC-018, PRC-019 | supplier and procurement portals |
| `suppliers` | generated collection routes under `procurement` | PRC-018 |
| `insurance_policies`, `insurance_claims` | PRC-020, policies by seed only | claims summary report |
| `employees`, `payroll_runs`, `payroll_lines`, `timesheets`, `leave_requests` | PRC-021, PRC-022, generated collection routes under `hr` | HR screens |
| `bank_statements` | PRC-023 only, no import path | reconciliation screen |
| `chart_of_accounts`, `journal_entries`, `expenses` | nothing in the API | trial balance, tax return |
| `loan_contracts`, `loan_repayments` | nothing in the API | loans summary report |
| `leads`, `opportunities`, `crm_tasks`, `customer_feedback` | PRC-003, generated collection routes under `crm` | CRM screens |
| `public_leads` | PRC-002 | nothing — no endpoint reads this table |
| `otp_challenges` | PRC-001, PRC-010, auth OTP routes | the verify handlers |
| `idempotency_keys` | PRC-013, PRC-014, PRC-016, PRC-019 | the same endpoints on replay |
| `audit_log` | every mutating endpoint, append-only at the database level | PRC-006 and PRC-013 SOD checks, `GET /{collection}/:id/history` |
| `user_sessions` | login, refresh, logout, session revocation | refresh reuse detection |
| `organizations`, `branches`, `departments` | seed and admin routes | tenancy and RLS |

Five tables in the entity registry have no write path in the API at all: `chart_of_accounts`, `journal_entries`, `expenses`, `loan_contracts` and `loan_repayments`. Each has read endpoints and at least one report built on it — the trial balance, the tax return, the loans summary — so those reports render against seed data and against nothing else. `bank_statements` is a sixth near-miss: the only write it accepts is the reconciliation flag from PRC-023, and the lines themselves have no import endpoint.
