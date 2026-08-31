# How To: Manage Inventory

Complete guide for parts management, stock operations, reorder alerts, purchase requisition workflow, and inventory movements in SALIS AUTO.

---

## Prerequisites

- Inventory management requires the `inventory` RBAC module.
- Key roles and their access:

| Role | inventory Access | Key Actions |
|------|-----------------|-------------|
| Owner / CEO | `vcedax` | Full access |
| Branch Manager | `vcedax` | Full access (branch-scoped) |
| Service Advisor | `v` | View only |
| Technician | `v` | View only |
| Storekeeper | `vcedax` | Full access (branch-scoped) |
| Accountant | `vx` | View and delete |
| Procurement Agent | `vcex` | Create, view, edit, delete |

---

## Viewing the Parts List

1. Navigate to **Inventory** in the sidebar, or go directly to `/inventory`.
2. The parts list displays in a `DataTable` with these columns:

| Column | Description | Searchable |
|--------|-------------|------------|
| Name | Part name (varchar 200) | Yes |
| SKU | Stock Keeping Unit (varchar 64, unique per org) | Yes |
| Stock | Current on-hand quantity |  |
| Reorder | Reorder level threshold |  |
| Price | Selling price in SAR (displayed via `Money` component) |  |

3. Use the search bar to filter by name or SKU.
4. On mobile, parts render as `MobileCard` components.

---

## Adding a New Part

1. Click the **Add Part** button.
2. Fill in the required fields:

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Name | Yes | varchar(200) | Part name |
| SKU | Yes | varchar(64) | Must be unique within the organization. Enforced by `parts_org_sku_idx` unique index. |
| Price | Yes | bigint (halalas) | Selling price. Stored as integer halalas. Enter SAR value; it is converted to halalas (multiply by 100). |
| Cost Price | No | bigint (halalas) | Purchase cost. **Redacted** for roles that should not see margin (see Field Redaction below). |
| On Hand | Yes | integer | Current stock quantity. Defaults to 0. |
| Reorder Level | Yes | integer | When `on_hand` drops to this level, a reorder alert triggers. Defaults to 0. |
| Backorderable | No | boolean | If `true`, the part can be promised even when out of stock. Defaults to `false`. |

3. Click **Save**. The system generates a ULID as the part `id` and sets `org_id` and `branch_id`.

### SKU Uniqueness

The SKU must be unique per organization (`parts_org_sku_idx` on `(org_id, sku)`). Attempting to create a duplicate SKU returns `400 bad_request` or `409 conflict`.

---

## Editing a Part

1. Navigate to `/inventory` and click on the part row.
2. Modify the desired fields (name, price, reorder level, backorderable flag).
3. Click **Save**.
4. The `version` field is incremented for optimistic concurrency control.
5. The `updated_at` and `updated_by` fields are automatically set.

**Note:** Changing the price does not retroactively affect existing estimates or invoices. Those records store a snapshot of the price at the time of creation via `unitPriceHalalas` on their line items.

---

## Stock Management

Stock operations are tracked in the `inventory_movements` table. Each movement creates an immutable ledger entry.

### Movement Types

| Type | Delta | Description |
|------|-------|-------------|
| `receive` | Positive | Stock received from a purchase order or supplier |
| `issue` | Negative | Stock issued for a job card or service |
| `adjust` | Positive or negative | Manual stock count adjustment |
| `transfer` | Negative at source, positive at destination | Transfer between branches |
| `return` | Positive | Stock returned from a job (e.g., unused part) |
| `damage` | Negative | Stock written off due to damage |

### Issuing Stock

1. Navigate to the part's detail view.
2. Select **Issue Stock**.
3. Enter:
   - **Quantity**: Number of units to issue
   - **Reference**: Job card code or other reference
   - **Reason**: Why the stock is being issued
4. Click **Confirm**.
5. The movement creates a record with a negative `delta`, reducing `on_hand`.

### Receiving Stock

1. Navigate to the part's detail view.
2. Select **Receive Stock**.
3. Enter:
   - **Quantity**: Number of units received
   - **Reference**: Purchase order code
   - **Reason**: Receiving note
4. Click **Confirm**.
5. The movement creates a record with a positive `delta`, increasing `on_hand`.

For purchase order receiving, the `receivedQty` on `purchase_order_lines` is updated. The invariant `received <= ordered` is enforced; over-receipt requires approval.

### Adjusting Stock Count

1. Navigate to the part's detail view.
2. Select **Adjust Stock**.
3. Enter the actual count. The system computes the delta.
4. Provide a reason for the adjustment (required for audit).
5. Click **Confirm**.

**Segregation of Duties:** The user who issues stock cannot adjust stock for the same part. This is the "Issue Stock / Adjust Stock" separation of duties rule.

### Inventory Movement Ledger

Each movement in `inventory_movements` records:

| Field | Type | Description |
|-------|------|-------------|
| `partId` | ULID | The affected part |
| `type` | varchar(16) | Movement type (receive, issue, adjust, transfer, return, damage) |
| `qty` | integer | Absolute quantity |
| `delta` | integer | Signed effect on `on_hand` (positive = increase, negative = decrease) |
| `ref` | varchar(64) | Reference (job card code, PO code, etc.) |
| `reason` | text | Free-text reason |
| `toBranchId` | ULID | Destination branch (for transfers only) |
| `transferId` | ULID | Shared by debit/credit rows of a transfer |

The ledger is append-only. On-hand can be reconstructed by summing all `delta` values for a part.

---

## Reorder Alerts

When a part's `on_hand` quantity drops to or below its `reorder_level`, a reorder alert is triggered.

### How Reorder Alerts Work

1. After each stock movement that reduces `on_hand`, the system checks: `on_hand <= reorder_level`.
2. If true, the Storekeeper and Procurement Agent are notified.
3. The alert appears in the notification center (bell icon in Topbar with orange dot).

### Responding to Reorder Alerts

1. Review the part's current stock and consumption history.
2. Create a **Purchase Requisition** to initiate restocking (see below).
3. Or, if using the auto-reorder feature, the system can generate requisitions automatically.

---

## Supplier Network

Navigate to `/parts-network` to access the B2B parts marketplace.

### Features

- Browse parts from network suppliers.
- Compare prices across suppliers.
- Request quotes.
- Place orders directly.
- The `network` RBAC module controls access.

### Supplier Directory

Suppliers are managed in the `suppliers` table:

| Field | Type | Description |
|-------|------|-------------|
| `code` | varchar(32) | Supplier code (unique per org) |
| `name` | varchar(200) | Supplier company name |
| `nameAr` | varchar(200) | Arabic name |
| `contactName` | varchar(200) | Primary contact |
| `contactPhone` | varchar(32) | Contact phone |
| `contactEmail` | varchar(254) | Contact email |
| `status` | varchar(16) | `active`, `inactive`, `suspended` |

---

## Purchase Requisition Flow

The procurement cycle follows a structured flow with approval gates.

### Step 1: Create Requisition

1. Navigate to the procurement section.
2. Click **New Requisition**.
3. Fill in header fields:

| Field | Description |
|-------|-------------|
| Requester Name | Auto-filled from current user |
| Department | Requesting department |
| Priority | `low`, `normal`, `high`, `urgent` |
| Needed By | Target delivery date |
| Notes | Additional instructions |

4. Add line items:

| Field | Description |
|-------|-------------|
| Part SKU | Link to existing part (optional) |
| Description | Item description (varchar 300) |
| Description (Arabic) | Arabic description |
| Quantity | Number of units needed |
| Estimated Unit Price | Expected unit cost (halalas) |

5. Save as draft or submit for approval.

### Step 2: Approval

1. The `estimatedTotalHalalas` is computed from the line items.
2. The approver must have:
   - `procurement:a` (Approve) permission
   - A SAR ceiling >= the estimated total
3. The approver must be different from the submitter (segregation of duties).
4. `submittedBy` and `approvedBy` are tracked on the requisition.

### Step 3: Purchase Order

1. Once approved, the requisition can be converted to a **Purchase Order**.
2. The PO references the requisition via `requisitionId`.
3. Select a supplier from the `suppliers` table.
4. PO line items carry:

| Field | Description |
|-------|-------------|
| `partSku` | Part SKU reference |
| `description` | Item description |
| `qty` | Ordered quantity |
| `receivedQty` | Running total of received quantity (starts at 0) |
| `unitPriceHalalas` | Agreed unit price |

5. The PO total is computed: `totalHalalas = subtotalHalalas + taxHalalas`.
6. Submit for approval (same ceiling and segregation rules apply).

### Step 4: Receive Goods

1. When goods arrive, navigate to the PO.
2. Record received quantities per line.
3. The system enforces: `receivedQty <= qty` (ordered quantity).
4. Over-receipt is rejected unless specifically approved.
5. Receiving creates `inventory_movements` with `type: 'receive'` and positive `delta`.
6. The part's `on_hand` is updated.

### Step 5: Update Stock

1. Stock levels are automatically updated when goods are received.
2. Verify the updated `on_hand` in the inventory screen.
3. The movement ledger provides a complete audit trail.

---

## Transferring Between Branches

1. Navigate to the part's detail view at the source branch.
2. Select **Transfer**.
3. Enter:
   - **Destination Branch**: Must belong to the same organization.
   - **Quantity**: Units to transfer.
4. The system creates two linked `inventory_movements` records:
   - **Debit** at the source branch: negative `delta`
   - **Credit** at the destination branch: positive `delta`
   - Both share the same `transferId` for audit pairing.
5. Transfers to branches outside the organization are rejected with `422 rule_violated`.

---

## Field Redaction

Certain inventory fields are redacted based on role:

| Field | Hidden From | Display |
|-------|-------------|---------|
| Cost Price (`costHalalas`) | Roles without full inventory access | Em-dash with "Hidden for your role" |
| Profit Margin (derived) | Same as cost price | Not displayed |

The `ReadField` component with the `redacted` prop handles this display. The server nulls redacted values on the way out (`GLOBAL_REDACTIONS`).

---

## Inventory Formula

The theoretical on-hand quantity at any point follows:

```
OnHand = Opening
       + Received
       + TransferIn
       - Consumed (Issued)
       - TransferOut
       +/- Adjustments
       - Damaged
```

This can be verified by summing all `delta` values in `inventory_movements` for a given `partId`.

---

## See Also

- [Setup Integrations](./setup-integrations.md) — Supplier network configuration
- [Customize Workflows](./customize-workflows.md) — Approval thresholds
- [Data Dictionary](../reference/data-dictionary.md) — Parts and inventory table schemas
- [RBAC Matrix](../reference/rbac-matrix.md) — Inventory module permissions
