# SALIS AUTO — Business Rules

Every rule here is encoded once in `packages/contract/rules/`, enforced
server-side, surfaced as client validation, and covered by a unit test. A rule
that lives only in a component is a rule that a second component will contradict.

**Status** marks what is enforced today versus what awaits the server.

---

## Money

| Rule | Status |
|---|---|
| `Invoice.total = subtotal + tax − discount` | derived in `InvoiceCreate`, not yet server-enforced |
| VAT computed at the ZATCA rate, never stored from the client | planned |
| Amounts stored as integer halalas; formatted only at the boundary | planned |
| `Payment.amount ≤ invoice.balance` | planned |
| A cancelled invoice cannot take a normal payment | planned |
| `Refund ≤ amount collected` | planned |
| Journal entry debits = credits | planned |
| Rounding is half-up at two decimals, applied once at the total | planned |

No financial value is computed in the browser and trusted. The client may
display a total; the server decides it.

---

## Approvals

| Rule | Status |
|---|---|
| A value above the role's SAR ceiling must escalate | **enforced** — `canApprove()` |
| Ceilings: owner ∞ · superadmin ∞ · manager 50,000 · accountant 25,000 · HR 15,000 · storekeeper 10,000 · advisor 5,000 · all others 0 | **enforced** |
| The screen states the ceiling up front rather than failing on submit | **enforced** on estimates |
| A purchase order cannot exceed its approver's ceiling | planned |
| Approval writes an audit record naming actor, role, amount and reason | planned |

## Segregation of duties

| Rule | Status |
|---|---|
| The technician who performed a repair cannot pass its QC | **enforced** — `WorkshopQC` |
| The remaining `SOD` pairs are declared but not yet wired | planned |

## Field-level redaction

`FIELD_RULES` hides named fields from named roles. **Verify reachability before
trusting one**: the Branch P&L rule turned out unreachable, because module RBAC
already denies `execreports` to every role the rule hides it from. It is kept as
documented defence-in-depth, so widening `execreports` cannot silently expose
P&L figures — but it was never doing the work it appeared to do. Every other rule
must be checked the same way rather than assumed.

---

## Workshop

| Rule | Status |
|---|---|
| An inspection cannot be submitted half-complete — the estimate is built on it | **enforced** |
| A stage gate cannot be skipped | **enforced** in the six-stage loop |
| QC must pass before delivery | **enforced** |
| A completed job card is required before invoicing | planned |
| An expired estimate cannot be approved | planned |
| An appointment cannot double-book a bay | planned |

## Inventory

| Rule | Status |
|---|---|
| `OnHand = Opening + Received + TransferIn − Consumed − TransferOut ± Adjustments − Damaged` | planned |
| `Reserved ≤ Available`; consumption ≤ reservation | planned |
| No negative stock where the part is not backorderable | planned |
| No double consumption, double receiving, duplicate transfer or duplicate reservation | planned — idempotency keys |
| Receiving quantity ≤ ordered quantity; over-receipt needs approval | planned |

## Tenancy

| Rule | Status |
|---|---|
| A user cannot cross an organization boundary | planned — RLS |
| A branch-scoped user cannot reach another branch | planned — RLS |
| An `own`-scoped user sees only their own records | planned — RLS |
| A cross-tenant read returns 404, never 403 — a 403 confirms the record exists | planned |

## HR

| Rule | Status |
|---|---|
| A payroll period cannot be reopened after posting | planned |
| Leave cannot overlap an approved leave for the same employee | planned |

---

## How a rule gets added

1. Write it here, in one sentence, in the language the business uses.
2. Encode it in `packages/contract/rules/` as a pure function.
3. Call it from the server handler — that is the enforcement point.
4. Call it from the form for the inline message — that is the courtesy.
5. Write the unit test, including the boundary and the failing case.
6. If it protects money or stock, add the concurrency and idempotency cases too.

A rule in prose and nowhere else is documentation of an intention.
