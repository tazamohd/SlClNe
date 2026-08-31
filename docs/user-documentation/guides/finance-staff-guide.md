# Finance & Procurement Staff Guide

This guide covers the workflows for three roles that handle the financial and supply chain operations of SALIS AUTO: **Accountant**, **Storekeeper**, and **Procurement Agent**.

> **Prerequisites**: Complete the [Getting Started](getting-started.md) guide first.

---

## Role Comparison

| Detail | Accountant | Storekeeper | Procurement Agent |
|---|---|---|---|
| Scope | All (organization-wide) | Branch | All (organization-wide) |
| Approval ceiling | SAR 25,000 | SAR 10,000 | SAR 20,000 |
| Landing page | Dashboard | Dashboard | Procurement Portal |
| Primary modules | Accounting, invoices, payments, reports | Inventory, network, procurement | Procurement, network, inventory |

---

## Accountant Workflow

As Accountant, you manage the financial backbone of the organization: chart of accounts, journal entries, expenses, invoices, payments, and ZATCA compliance.

### Chart of Accounts

Navigate to **Accounting > Chart of Accounts** (`/chart-of-accounts`).

The chart is displayed as a tree structure organized by account type:

- **Assets**: Current assets, fixed assets, bank accounts
- **Liabilities**: Current liabilities, long-term liabilities
- **Equity**: Owner's equity, retained earnings
- **Revenue**: Service revenue, parts revenue
- **Expenses**: Operating expenses, cost of goods sold

Each account shows its code, name (EN/AR), type, and current balance.

**Adding an account**:
1. Click **Add Account**.
2. Fill in account code, name, parent account (to place it in the tree), and type.
3. Click **Save**.

### Journal Entries

Navigate to **Accounting > Journal Entries** (`/journal-entries`).

Every financial transaction is recorded as a journal entry with balanced debits and credits.

**Creating a journal entry**:
1. Click **New Entry**.
2. Enter the entry date and description.
3. Add lines -- each line has an account, debit amount, and credit amount.
4. The system validates that total debits equal total credits. An imbalanced entry cannot be saved.
5. Click **Post** to record the entry.

> **Rule**: Journal entry debits must always equal credits. The system prevents saving an imbalanced entry.

### Expense Tracking

Navigate to **Accounting > Expenses** (`/expenses`).

Track and categorize all business expenses:

1. Click **Add Expense**.
2. Select the expense category and account.
3. Enter the amount, date, vendor, and description.
4. Attach a receipt if available.
5. Click **Save**.

Expenses feed into the income statement and operational reports.

### Invoice Management

Navigate to **Finance > Invoices** (`/invoices`).

View all invoices across the organization. The DataTable shows:

- Invoice number
- Customer name
- Issue date and due date
- Total amount (SAR) displayed in JetBrains Mono font
- Status badge: Draft, Issued, Paid, Overdue, Cancelled

**Creating an invoice**:

See [Invoice & Payment Workflow](../workflows/invoice-payment.md) for the step-by-step creation process.

**Key invoice fields**:

| Field | Description |
|---|---|
| Line items | Parts (with SKU), labour (with description), fees |
| Subtotal | Sum of all line items |
| VAT (15%) | Calculated automatically per ZATCA requirements |
| Discount | Optional reduction |
| Total | Final amount in SAR |

### Payment Recording

Navigate to **Finance > Payments** (`/payments`).

When a customer pays:

1. Open the invoice from the Invoices list.
2. Click **Record Payment**.
3. Select the payment method: Card, Bank Transfer, or Cash.
4. Enter the amount received.
5. Click **Record**.
6. A receipt is automatically generated with a unique receipt code.
7. When the total paid equals the invoice total, the status changes to "Paid".

Partial payments are supported. The invoice tracks `paidHalalas` and updates the balance accordingly.

### ZATCA Compliance

Saudi Arabia mandates ZATCA-compliant e-invoicing. SALIS AUTO handles this automatically:

| ZATCA Requirement | How SALIS AUTO Handles It |
|---|---|
| Seller VAT number | Configured in Settings, applied to every invoice |
| Buyer VAT number | Stored in customer record, included on invoice |
| QR code | Generated automatically on each invoice |
| Hash chain | Each invoice computes `hashSelf` and links to `hashPrev` from the previous invoice |
| XML format | Invoices stored in ZATCA-compliant format |

> **Important**: VAT is always computed server-side at the current ZATCA rate (15%). The amount displayed during draft creation is provisional; the final total comes from the server when the invoice is saved.

### Financial Reports

As Accountant, you have access to comprehensive financial reporting:

| Report | Route | What It Shows |
|---|---|---|
| General Ledger | `/general-ledger` | All transactions by account |
| Trial Balance | `/trial-balance` | Account balances for a period |
| Balance Sheet | `/balance-sheet` | Assets, liabilities, equity snapshot |
| Income Statement | `/income-statement` | Revenue minus expenses for a period |
| Cash Flow Statement | `/cash-flow-statement` | Cash inflows and outflows |
| Accounts Receivable | `/accounts-receivable` | Outstanding customer balances |
| Accounts Payable | `/accounts-payable` | Outstanding supplier balances |

---

## Storekeeper Workflow

As Storekeeper, you manage the parts inventory, process stock movements, and fulfill parts requests from technicians.

### Spare Parts List

Navigate to **Inventory > Spare Parts** (`/spare-parts`).

The parts catalog shows all items with:

- Part number / SKU
- Description (EN/AR)
- Category
- Current stock (on-hand quantity)
- Minimum stock level
- Unit price (SAR)
- Location in warehouse

### Stock Management

**Receiving parts** (when a delivery arrives):
1. Open the relevant Purchase Order.
2. Click **Receive**.
3. Enter the received quantity (must not exceed ordered quantity; over-receipt requires approval).
4. The system updates on-hand stock automatically.

**Issuing parts** (when a technician requests):
1. Parts requests appear in your notification queue.
2. Open the request to see the job card, part requested, and quantity.
3. Verify stock availability.
4. Click **Issue** to deduct from inventory and assign to the job.

**Stock adjustments**:
1. Navigate to **Inventory > Inventory Management** (`/inventory-management`).
2. Select the part to adjust.
3. Enter the adjustment quantity (positive for additions, negative for reductions).
4. Provide a reason (damage, count correction, etc.).
5. Click **Save**.

### Inventory Formula

Stock levels follow this calculation:

```
On-Hand = Opening + Received + Transfer-In - Consumed - Transfer-Out +/- Adjustments - Damaged
```

### Reorder Management

Navigate to **Inventory > Automated Reordering** (`/automated-reordering`).

When a part's on-hand quantity drops below its minimum stock level:

1. The system flags it on the Dashboard and in the parts list.
2. Review the reorder suggestions showing recommended quantities.
3. Approve to generate a Purchase Requisition that goes to the Procurement Agent.

### Segregation of Duties

The Storekeeper has `vc` (view and create) access to procurement but not `a` (approve). You can create purchase orders but cannot approve them. This prevents the same person from ordering parts and approving the purchase.

### Barcode Scanner

Navigate to **Inventory > Barcode Scanner** (`/barcode-scanner`).

Use the barcode scanner for fast part lookup and stock operations:

1. Scan a part's barcode.
2. The part details load instantly.
3. Perform issue, receive, or adjustment operations directly from the scanned part.

---

## Procurement Agent Workflow

As Procurement Agent, you manage the supply chain: purchase requisitions, supplier relationships, purchase orders, and delivery tracking.

### Procurement Portal

After login, you land on the **Procurement Portal** (`/procurement-portal`).

The portal shows:

- Active purchase orders count
- Pending requisitions
- Supplier performance metrics
- Recent delivery tracking

### Purchase Requisitions

Navigate to **Procurement > Requisitions** (`/procurement-portal/requisitions`).

When a Storekeeper or Branch Manager identifies a need for parts:

1. A Purchase Requisition arrives in your queue.
2. Review the requested items, quantities, and justification.
3. Select one or more suppliers to request quotes from.
4. Compare quotes when they arrive (see Price Comparison below).
5. Create a Purchase Order with the selected supplier.

### Supplier Management

Navigate to **Inventory > Suppliers** (`/suppliers`).

Manage your supplier database:

- **Supplier profiles**: Company name, contact details, categories, regions served
- **Performance ratings**: Based on delivery time, quality, and pricing
- **Order history**: Past purchase orders with this supplier

**Adding a supplier**:
1. Click **Add Supplier**.
2. Enter company name, contact person, phone, email, categories, and regions.
3. Click **Save**.

### Purchase Orders

Navigate to **Inventory > Purchase Orders** (`/purchase-orders`).

**Creating a purchase order**:
1. Click **New Purchase Order**.
2. Select the supplier.
3. Add line items with part descriptions, quantities, and agreed prices.
4. Set the expected delivery date.
5. Click **Submit**.

If the total is within your SAR 20,000 ceiling, the PO is approved automatically. Above that, it routes to the Branch Manager or Owner.

### Price Comparison

When requesting quotes from multiple suppliers, use the **Price Compare** screen (`/purchase-agent-price-compare`) to:

1. View side-by-side pricing for the same parts across suppliers.
2. Compare delivery timelines.
3. Factor in supplier ratings.
4. Select the best option and generate a PO.

### Delivery Tracking

Navigate to **Procurement > Delivery Tracking** (`/purchase-agent-tracking`).

Track incoming deliveries:

- **Expected date**: When the supplier committed to deliver.
- **Status**: Ordered, Shipped, In Transit, Delivered.
- **Quantity tracking**: Ordered versus received.

When parts arrive, coordinate with the Storekeeper for receiving.

---

## Cross-Role Interactions

The three roles interact frequently:

```
Storekeeper identifies low stock
    --> Creates Purchase Requisition
        --> Procurement Agent reviews and contacts suppliers
            --> Supplier sends quote
                --> Procurement Agent creates Purchase Order
                    --> Supplier delivers parts
                        --> Storekeeper receives and shelves parts
```

For invoicing:
```
Job completed
    --> Accountant creates invoice from job card
        --> Customer pays
            --> Accountant records payment and issues receipt
```

---

## Common Tasks Quick Reference

| Task | Role | Navigation |
|---|---|---|
| Record a journal entry | Accountant | Accounting > Journal Entries > New Entry |
| Create an invoice | Accountant | Finance > Invoices > Create |
| Record a payment | Accountant | Finance > Invoices > select > Record Payment |
| Issue parts to a job | Storekeeper | Inventory > Spare Parts > select > Issue |
| Receive a delivery | Storekeeper | Inventory > Purchase Orders > select > Receive |
| Adjust stock | Storekeeper | Inventory > Inventory Management > select > Adjust |
| Create a purchase order | Procurement | Inventory > Purchase Orders > New |
| Compare supplier prices | Procurement | Procurement > Price Compare |
| Track a delivery | Procurement | Procurement > Delivery Tracking |

---

## Related Guides

- [Invoice & Payment Workflow](../workflows/invoice-payment.md) -- full invoicing process
- [Supplier Portal Guide](../portals/supplier-portal-guide.md) -- how suppliers interact with you
- [Branch Manager Guide](manager-guide.md) -- approval escalation paths
- [Job Lifecycle](../workflows/job-lifecycle.md) -- how workshop operations feed into finance
