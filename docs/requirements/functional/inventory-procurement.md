# Inventory & Procurement — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-INV-005                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Parts & Inventory                        |
| Modules     | inventory, procurement, network          |

## 1. Overview

The Inventory and Procurement domain manages parts inventory with real-time stock tracking, inventory movements via a signed-delta ledger, supplier directory, purchase requisition and order workflows with approval and segregation of duties, and a B2B parts supply network. All monetary values are stored as integer halalas.

## 2. Parts Inventory

### 2.1 Data Model

The `parts` table:

| Field           | Type          | Constraint                                  |
|-----------------|---------------|---------------------------------------------|
| id              | varchar(26)   | ULID primary key                            |
| org_id          | varchar(26)   | Tenant isolation                            |
| name            | varchar(200)  | Part name (required)                        |
| sku             | varchar(64)   | Stock-keeping unit; unique per org          |
| price_halalas   | bigint        | Selling price in halalas                    |
| cost_halalas    | bigint        | Cost price in halalas (redacted by role)    |
| on_hand         | integer       | Current on-hand quantity                    |
| reserved        | integer       | Quantity reserved for open jobs             |
| reorder_level   | integer       | Minimum stock threshold                     |
| backorderable   | boolean       | Whether backordering is allowed             |
| deleted_at      | timestamptz   | Soft delete marker                          |
| version         | integer       | Optimistic concurrency                      |

### 2.2 SKU Uniqueness

The `parts_org_sku_idx` unique index on `(org_id, sku)` prevents duplicate SKUs within one organization.

### 2.3 Stock Quantities

- **on_hand** — Physical stock available in the warehouse
- **reserved** — Quantity allocated to open job cards but not yet issued
- **available** = on_hand - reserved (calculated, not stored)
- Parts with `on_hand <= reorder_level` trigger reorder alerts

### 2.4 Backorder Flag

When `backorderable = true`, parts can be ordered for job cards even when `available = 0`. When `false`, the system prevents allocation beyond available stock.

### 2.5 Field-Level Redaction

The `cost_halalas` field is protected by two redaction rules:

| Rule                     | Hidden From                                                |
|--------------------------|------------------------------------------------------------|
| Part cost / margin       | Advisor, Technician, QC, Receptionist, Call Center, Customer, Supplier |
| Supplier purchase price  | Advisor, Technician, QC, Receptionist, Call Center, Customer |

The server nulls these fields in the API response via the `redact()` function — the value never reaches the wire.

### 2.6 Permissions

| Role        | Grants  | Notes                                  |
|-------------|---------|----------------------------------------|
| Owner       | vcedax  | Full access                            |
| Manager     | vcedax  | Full access                            |
| Advisor     | v       | View only                              |
| Technician  | v       | View only                              |
| Storekeeper | vcedax  | Full access (primary inventory role)   |
| Accountant  | vx      | View and export                        |
| Procurement | vcex    | View, create, edit, export             |
| Super Admin | v       | View only                              |

## 3. Inventory Movements

### 3.1 Data Model

The `inventory_movements` table implements a signed-delta ledger:

| Field         | Type          | Description                                  |
|---------------|---------------|----------------------------------------------|
| id            | varchar(26)   | ULID primary key                             |
| org_id        | varchar(26)   | Tenant isolation                             |
| part_id       | varchar(26)   | FK to parts                                  |
| type          | varchar(16)   | Movement type (see below)                    |
| qty           | integer       | Absolute quantity moved                      |
| delta         | integer       | Signed effect on on_hand                     |
| ref           | varchar(64)   | Reference (job card code, PO code, etc.)     |
| reason        | text          | Movement reason                              |
| to_branch_id  | varchar(26)   | Destination branch (for transfers)           |
| transfer_id   | varchar(26)   | Shared by debit/credit rows of one transfer  |

### 3.2 Movement Types

| Type     | Delta | Description                              |
|----------|-------|------------------------------------------|
| in       | +N    | Stock receipt (from PO delivery)         |
| out      | -N    | Stock issue (to job card)                |
| adjust   | +N    | Count adjustment upward                  |
| adjust_down | -N | Count adjustment downward               |
| transfer | -N/+N | Inter-branch transfer (paired rows)     |
| return   | +N    | Part returned from job                   |

### 3.3 Ledger Reconstruction

On-hand quantity can be reconstructed by summing all `delta` values for a part:

```
on_hand = SUM(delta) WHERE part_id = :id
```

This provides a complete audit trail of every stock change.

### 3.4 Inter-Branch Transfers

Transfers create two linked movement rows sharing the same `transfer_id`:

1. A debit row (delta = -N) for the source branch
2. A credit row (delta = +N) for the destination branch (`to_branch_id`)

The shared `transfer_id` makes the pairing provable from the ledger.

### 3.5 Segregation of Duties

The SOD pair "Issue stock / Adjust stock count" is enforced via audit signatures:

- **Issue stock**: Evidenced by a movement with `type = 'out'`
- **Adjust stock count**: Evidenced by a movement with `type = 'adjust'` or `type = 'adjust_down'`

The same person who issues stock may not adjust the count for the same part — preventing inventory theft concealment. This is enforced by `requireSodClear()` consulting the audit log.

## 4. Suppliers

### 4.1 Data Model

The `suppliers` table:

| Field          | Type          | Description                           |
|----------------|---------------|---------------------------------------|
| id             | varchar(26)   | ULID primary key                      |
| org_id         | varchar(26)   | Tenant isolation                      |
| code           | varchar(32)   | Supplier code, unique per org         |
| name           | varchar(200)  | Supplier name (required)              |
| name_ar        | varchar(200)  | Arabic name                           |
| contact_name   | varchar(200)  | Contact person                        |
| contact_phone  | varchar(32)   | Contact phone                         |
| contact_email  | varchar(254)  | Contact email                         |
| status         | varchar(16)   | active (default), inactive, suspended |
| notes          | text          | Free-text notes                       |

### 4.2 SOD Note

The SOD pair "Create supplier / Approve supplier payment" is declared but currently unobservable — no supplier-payment approval route exists yet. Both activities will be enforced once the relevant routes are implemented.

## 5. Requisitions

### 5.1 Data Model

The `requisitions` table (header) and `requisition_lines` table:

**Header:**

| Field                     | Type          | Description                          |
|---------------------------|---------------|--------------------------------------|
| code                      | varchar(32)   | Requisition code, unique per org     |
| requester_name            | varchar(200)  | Person requesting (required)         |
| department                | varchar(160)  | Requesting department                |
| priority                  | varchar(16)   | normal (default), high, urgent       |
| status                    | varchar(16)   | draft, submitted, approved, rejected |
| needed_by                 | date          | Required-by date                     |
| estimated_total_halalas   | bigint        | Server-computed from lines           |
| submitted_by              | varchar(26)   | Submitter user ID (SoD enforcement)  |
| approved_by               | varchar(26)   | Approver user ID (SoD enforcement)   |
| approved_at               | timestamptz   | Approval timestamp                   |

**Line items:**

| Field                 | Type          | Description                          |
|-----------------------|---------------|--------------------------------------|
| requisition_id        | varchar(26)   | FK to requisition header             |
| part_sku              | varchar(64)   | Part reference                       |
| description           | varchar(300)  | Item description (EN)                |
| description_ar        | varchar(300)  | Item description (AR)                |
| qty                   | integer       | Requested quantity                   |
| est_unit_price_halalas| bigint        | Estimated unit price                 |
| sort                  | integer       | Display order                        |

### 5.2 Approval Flow

Requisitions follow the standard approval ceiling:

- The `estimated_total_halalas` is computed server-side from lines (never client-supplied)
- `submitted_by != approved_by` is enforced (segregation of duties)
- Amount-based routing applies per role ceiling

## 6. Purchase Orders

### 6.1 Data Model

The `purchase_orders` table (header) and `purchase_order_lines` table:

**Header:**

| Field             | Type          | Description                              |
|-------------------|---------------|------------------------------------------|
| code              | varchar(32)   | PO code, unique per org                  |
| supplier_id       | varchar(26)   | FK to suppliers                          |
| supplier_name     | varchar(200)  | Denormalized for display                 |
| requisition_id    | varchar(26)   | FK to originating requisition            |
| status            | varchar(24)   | draft, submitted, approved, ordered, partial, received, cancelled |
| subtotal_halalas  | bigint        | Sum of line totals                       |
| tax_halalas       | bigint        | VAT amount                               |
| total_halalas     | bigint        | Total with VAT                           |
| ordered_at        | timestamptz   | When the PO was sent to supplier         |
| expected_at       | timestamptz   | Expected delivery date                   |
| submitted_by      | varchar(26)   | Submitter (SoD enforcement)              |
| approved_by       | varchar(26)   | Approver (SoD enforcement)               |

**Line items:**

| Field              | Type          | Description                             |
|--------------------|---------------|-----------------------------------------|
| purchase_order_id  | varchar(26)   | FK to PO header                         |
| part_sku           | varchar(64)   | Part reference                          |
| description        | varchar(300)  | Item description (EN/AR)                |
| qty                | integer       | Ordered quantity                        |
| received_qty       | integer       | Running total received (invariant: received <= ordered) |
| unit_price_halalas | bigint        | Unit price in halalas                   |

### 6.2 Receiving

The `received_qty` field tracks partial deliveries against each line, maintaining the invariant `received_qty <= qty`. When all lines are fully received, the PO status transitions to `received`.

### 6.3 Segregation of Duties

The SOD pair "Raise purchase order / Approve purchase order" is fully enforced:

- **Raise PO**: Evidenced by audit action `create` on entity `purchase_order`
- **Approve PO**: Evidenced by audit action `approve` on entity `purchase_order`
- `requireDifferentApprover()` enforces `submitted_by != approved_by`
- `requireSodClear()` additionally checks the audit trail for conflicts

### 6.4 Procurement Permissions

| Role        | Grants  | Notes                                    |
|-------------|---------|------------------------------------------|
| Owner       | vcedax  | Full access                              |
| Manager     | vcax    | View, create, approve, export            |
| Storekeeper | vc      | View and create                          |
| Accountant  | vax     | View, approve, export                    |
| Procurement | vcedax  | Full access (primary procurement role)   |
| Supplier    | v       | View only (their own POs)                |
| Super Admin | v       | View only                                |

## 7. Parts Supply Network

### 7.1 Overview

The parts supply network is a B2B marketplace enabling inter-workshop parts sharing and procurement:

| Screen                    | Module  | Description                            |
|---------------------------|---------|----------------------------------------|
| PartsNetwork              | network | Network overview                       |
| PartsSupplyNetwork        | network | Supply network management              |

### 7.2 Network Permissions

| Role        | Grants  | Notes                                 |
|-------------|---------|---------------------------------------|
| Owner       | vcedax  | Full access                           |
| Manager     | vcedx   | All except approve                    |
| Storekeeper | vced    | View, create, edit, delete            |
| Procurement | vcedax  | Full access                           |
| Supplier    | vce     | View, create, edit                    |
| Super Admin | v       | View only                             |

## 8. Cross-References

- [Workshop Operations](./workshop-operations.md) — Parts consumption via stock issues
- [Finance & Accounting](./finance-accounting.md) — PO costs flow into accounting
- [Registry](./registry.md) — Supplier directory for vendor management
- [Security](../non-functional/security.md) — SoD enforcement on raise/approve PO
- [Compliance](../non-functional/compliance.md) — Audit trail for all inventory movements
