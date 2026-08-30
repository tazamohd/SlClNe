# Invoice & Payment Workflow

This document describes how invoices are created, validated for ZATCA compliance, issued, and paid in SALIS AUTO. All monetary calculations are performed server-side; amounts shown during draft creation are provisional.

---

## Overview

```
Create invoice (from job card or standalone)
    --> Add line items (parts, labour, fees)
        --> Server calculates subtotal, VAT, total
            --> Save as draft
                --> Issue invoice (sets issuedAt, generates ZATCA fields)
                    --> Customer pays
                        --> Record payment, generate receipt
                            --> Invoice fully paid --> status: Paid
```

---

## Creating an Invoice

**Who**: Accountant (primary), Branch Manager, Service Advisor, or Receptionist (with `vc` access to invoices)

**Screen**: Invoice Create (`/invoice-create`)

### Starting Point

Invoices can be created in two ways:

| Method | When to Use |
|---|---|
| From a job card | After a job reaches the Delivery or Invoiced stage. Line items pre-populate from the estimate. |
| Standalone | For charges not tied to a specific job (e.g., towing fees, diagnostic-only charges). |

### Adding Line Items

The Invoice Create screen starts with a form and a line-item editor.

Each line item has:

| Field | Description | Required |
|---|---|---|
| Description | What the charge is for | Yes |
| Kind | Part, Labour, or Fee | Yes |
| Quantity | Number of units | Yes (must be > 0) |
| Unit Price (SAR) | Price per unit | Yes (>= 0) |
| Part SKU | For parts, the inventory SKU | No (for parts) |

**Adding a line**: Click the **Add Line** button. A new empty row appears.

**Removing a line**: Click the remove icon on the row you want to delete.

**Validation rules**:
- Every line needs a description.
- Quantity must be greater than zero.
- Unit price must be zero or more.

The screen starts with sample line items from the job card. All are editable and removable.

### Provisional Summary

While composing the draft, the screen shows a **provisional** total:

| Row | Calculation |
|---|---|
| Parts subtotal | Sum of (qty x unit price) for all "Part" lines |
| Labour subtotal | Sum of (qty x unit price) for all "Labour" lines |
| Fees subtotal | Sum of (qty x unit price) for all "Fee" lines |
| Subtotal | Parts + Labour + Fees |
| VAT (15%) | Subtotal x 0.15 |
| Grand Total | Subtotal + VAT |

> **Important**: This total is labeled "provisional" because the server computes the authoritative figure when the invoice is saved. The browser uses the same formula as the server for display purposes, but the server's number is what gets stored. No financial value computed in the browser is trusted.

### Header Fields

| Field | Description |
|---|---|
| Customer | Who the invoice is for (auto-filled from job card, or select manually) |
| Job Reference | Linked job card ID (if applicable) |
| Invoice Date | Defaults to today |
| Due Date | When payment is expected |
| Notes | Optional text that appears on the printed invoice |

### Saving the Draft

1. Review all line items and the provisional total.
2. Click **Save Draft**.
3. The system sends the line items to the server.
4. The server validates the data, computes the authoritative totals, and stores the invoice.
5. The summary panel updates to show the **server-computed total** (no longer labeled provisional).
6. The invoice status is **Draft**.

### Form Validation

If any line item fails validation, the **Form Error Summary** appears at the top listing all issues:

- "Every line needs a description."
- "Every line needs a quantity above zero."
- "Every line needs a unit price of zero or more."

Fix the issues before saving.

---

## ZATCA Compliance

Saudi Arabia's Zakat, Tax and Customs Authority (ZATCA) requires electronic invoicing. SALIS AUTO handles compliance automatically.

### ZATCA Fields

When an invoice is **issued** (not just saved as draft), the system populates:

| ZATCA Field | Description |
|---|---|
| Seller VAT Number | Your organization's VAT registration (from Settings) |
| Buyer VAT Number | Customer's VAT registration (from customer record) |
| Invoice Date and Time | Timestamp of issuance (`issuedAt`) |
| Total with VAT | Grand total including 15% VAT |
| VAT Amount | The tax portion |
| QR Code | Encoded invoice data for verification scanning |
| Hash Self | Cryptographic hash of this invoice's content |
| Hash Previous | Hash of the previous invoice in the chain |

### Hash Chain

The hash chain provides tamper detection:

1. Each invoice computes `hashSelf` from its content.
2. Each invoice stores `hashPrev` -- the hash of the most recently issued invoice.
3. This creates an unbreakable chain: modifying any past invoice would invalidate every subsequent hash.
4. The QR code encodes the hash for external verification.

### VAT Calculation

- VAT is always **15%** of the subtotal (current ZATCA rate).
- VAT is computed server-side, never from browser calculations.
- The rate is not hardcoded per invoice -- it comes from the system configuration, so a future rate change applies automatically to new invoices.

---

## Issuing an Invoice

**Who**: Accountant or authorized role with create access to invoices

### Steps

1. Open a **Draft** invoice from the Invoices list (`/invoices`).
2. Review all details one final time.
3. Click **Issue Invoice**.
4. The system:
   - Sets `issuedAt` to the current timestamp.
   - Changes the status to **Issued**.
   - Generates the QR code.
   - Computes the hash chain.
   - The invoice is now a legal ZATCA document.

> **Note**: Once issued, an invoice cannot be edited. If corrections are needed, a credit note or cancellation must be used.

---

## Invoice Statuses

| Status | Meaning | Next Action |
|---|---|---|
| Draft | Being prepared, not yet legal | Edit or issue |
| Issued | Legal document, sent to customer | Await payment |
| Paid | Fully paid | Archive |
| Partially Paid | Some payment received | Await remaining |
| Overdue | Past due date, not fully paid | Follow up |
| Cancelled | Voided (requires reason) | No action |

---

## Payment Recording

**Who**: Accountant (primary), Branch Manager, Service Advisor, Receptionist (with `vc` access to payments)

**Screen**: Record Payment Modal (accessed from Invoice Detail)

### Steps

1. Navigate to **Finance > Invoices** (`/invoices`).
2. Find the invoice (search by invoice number, customer name, or job reference).
3. Click the invoice to open **Invoice Detail** (`/invoice-detail`).
4. Click **Record Payment**.
5. The payment modal appears:

| Field | Description |
|---|---|
| Payment Method | Card, Bank Transfer, or Cash |
| Amount (SAR) | The amount being paid |
| Reference | Transaction reference number (for card/bank) |
| Date | Payment date (defaults to today) |
| Notes | Optional payment notes |

6. Enter the payment details.
7. Click **Record**.

### What Happens

- The payment amount is added to the invoice's `paidHalalas` running total.
- A **receipt** is automatically generated with a unique receipt code.
- If the total paid equals the invoice total, the status changes to **Paid**.
- If the total paid is less than the invoice total, the status remains **Issued** or changes to **Partially Paid**.

### Partial Payments

Multiple payments can be recorded against a single invoice:

- Payment 1: SAR 500 (Card) -- Invoice balance: SAR 1,046.75
- Payment 2: SAR 1,046.75 (Bank Transfer) -- Invoice balance: SAR 0 --> Status: Paid

### Payment Rules

| Rule | Enforcement |
|---|---|
| Payment amount cannot exceed invoice balance | Validated on submission |
| A cancelled invoice cannot take a normal payment | Status check before recording |
| Refund cannot exceed amount collected | Balance check |

---

## Receipt Generation

When a payment is recorded, a receipt is automatically created:

| Receipt Field | Source |
|---|---|
| Receipt Code | Auto-generated unique code |
| Invoice Reference | Linked invoice number |
| Amount Paid (SAR) | The payment amount |
| Payment Method | Card / Bank / Cash |
| Date | Payment date |
| Customer | From the invoice |
| Cashier / Recorder | The user who recorded the payment |

Receipts are viewable from the Payments screen (`/payments`) and from the invoice detail.

---

## Overdue Tracking

Invoices that remain unpaid past their due date are tracked:

1. The system automatically marks invoices as **Overdue** when the current date passes the due date and the balance is greater than zero.
2. Overdue invoices appear with a red status badge in the Invoices list.
3. The Accountant can filter the Invoices list by status to see all overdue items.
4. Follow-up actions can be taken: phone the customer, send a reminder, or escalate to management.

---

## Money Handling Rules

SALIS AUTO follows strict rules for financial calculations:

| Rule | How It Works |
|---|---|
| Amounts stored as halalas | All money is stored as integer halalas (1 SAR = 100 halalas) to avoid floating-point errors |
| Formatted at the boundary | Amounts are converted to SAR with two decimals only for display |
| Rounding | Half-up rounding at two decimals, applied once at the total level |
| Server authority | The server computes all totals; the client displays them |
| JetBrains Mono | All SAR amounts render in JetBrains Mono monospace font for clarity |

---

## Common Scenarios

### Invoice from a Completed Job

1. Job reaches Delivery stage.
2. Accountant navigates to Invoice Create.
3. Selects the job card -- line items pre-populate from the estimate.
4. Reviews and adjusts if needed.
5. Saves draft, then issues.
6. Customer pays at the front desk or via the Customer App.

### Standalone Invoice

1. Accountant navigates to Invoice Create.
2. Selects the customer manually.
3. Adds line items from scratch.
4. Saves draft, then issues.

### Refund

1. Open the paid invoice.
2. Issue a credit note (negative invoice) referencing the original.
3. Record the refund payment.

---

## Related Guides

- [Job Lifecycle](job-lifecycle.md) -- how invoicing fits into the workshop flow
- [Estimate Approval](estimate-approval.md) -- what happens before invoicing
- [Finance Staff Guide](../guides/finance-staff-guide.md) -- Accountant's full workflow
- [Customer App Guide](../portals/customer-app-guide.md) -- customer payment experience
- [Owner & Super Admin Guide](../guides/owner-superadmin-guide.md) -- ZATCA configuration
