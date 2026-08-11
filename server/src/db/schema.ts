/** The database, derived from `project/handoff/DATA_MODEL.md` and the 35 mock
 *  tables in `app/src/data/generated/tables.ts`.
 *
 *  Three rules hold everywhere in this file:
 *
 *  1. **Universal fields** (`DATA_MODEL.md` §1) — `id` (ULID), `org_id`,
 *     `branch_id`, `created_at`, `updated_at`, `created_by`, `updated_by`,
 *     `deleted_at` and an optimistic-concurrency `version`.
 *  2. **Money is an integer count of halalas.** Any column holding money is
 *     `bigint` and named `*_halalas`, so a `numeric` rounding surprise cannot
 *     reach a ledger.
 *  3. **`org_id` on every tenant-owned table**, because row-level security
 *     anchors on it. Isolation must not depend on a `WHERE` clause someone
 *     remembers to write.
 *
 *  Columns suffixed `_label` hold a presentation string the design bundle
 *  carried where it had no machine value at all (`"2 weeks ago"`, `"9:00 AM"`).
 *  They are seeded verbatim so a rebuilt screen renders exactly what the
 *  prototype rendered; where a machine value exists it sits beside them.
 */
import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

/** A ULID is 26 characters. The columns are `varchar`, not `char`: `char`
 *  blank-pads to its declared width, so an identifier that is not exactly 26
 *  characters would compare unequal to the value that was written — a class of
 *  bug that shows up as an authorization check silently failing. */
const ULID_LENGTH = 26

/** Organizations sit above tenancy — a row *is* the tenant. */
export const organizations = pgTable('organizations', {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  nameAr: varchar('name_ar', { length: 200 }),
  slug: varchar('slug', { length: 80 }).notNull(),
  crNumber: varchar('cr_number', { length: 20 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  plan: varchar('plan', { length: 40 }).notNull().default('starter'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
})

/** The universal columns, spread into every tenant-owned table. */
const tenant = {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  orgId: varchar('org_id', { length: ULID_LENGTH })
    .notNull()
    .references(() => organizations.id, { onDelete: 'restrict' }),
  /** Null for rows owned by the organization rather than one branch. */
  branchId: varchar('branch_id', { length: ULID_LENGTH }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: varchar('created_by', { length: ULID_LENGTH }),
  updatedBy: varchar('updated_by', { length: ULID_LENGTH }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
}

const money = (name: string) => bigint(name, { mode: 'number' })

/* ------------------------------------------------------------------ tenancy */

export const branches = pgTable(
  'branches',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    nameAr: varchar('name_ar', { length: 200 }),
    city: varchar('city', { length: 120 }),
    isMain: boolean('is_main').notNull().default(false),
  },
  (t) => ({ byOrg: index('branches_org_idx').on(t.orgId) }),
)

export const users = pgTable(
  'users',
  {
    ...tenant,
    email: varchar('email', { length: 254 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    nameAr: varchar('name_ar', { length: 200 }),
    /** One of the 14 `RBAC.md` roles. */
    role: varchar('role', { length: 32 }).notNull(),
    passwordHash: text('password_hash'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => ({
    emailPerOrg: uniqueIndex('users_org_email_idx').on(t.orgId, t.email),
  }),
)

export const userSessions = pgTable(
  'user_sessions',
  {
    ...tenant,
    userId: varchar('user_id', { length: ULID_LENGTH }).notNull(),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    /** Rotating refresh tokens share a family; reuse of a retired token in the
     *  family is the signal that one was stolen. */
    familyId: varchar('family_id', { length: ULID_LENGTH }).notNull(),
    userAgent: text('user_agent'),
    ip: varchar('ip', { length: 64 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedBy: varchar('replaced_by', { length: ULID_LENGTH }),
  },
  (t) => ({ byUser: index('user_sessions_user_idx').on(t.orgId, t.userId) }),
)

/* ---------------------------------------------------- customers & vehicles */

export const fleets = pgTable(
  'fleets',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    vehicleCount: integer('vehicle_count').notNull().default(0),
    activeCount: integer('active_count').notNull().default(0),
    contractStatus: varchar('contract_status', { length: 32 }).notNull().default('active'),
  },
  (t) => ({ byOrg: index('fleets_org_idx').on(t.orgId) }),
)

export const customers = pgTable(
  'customers',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    email: varchar('email', { length: 254 }),
    type: varchar('type', { length: 16 }).notNull().default('individual'),
    fleetId: varchar('fleet_id', { length: ULID_LENGTH }),
    /** Derived from `vehicles`; never accepted from a client. */
    vehicleCount: integer('vehicle_count').notNull().default(0),
    /** Derived from paid invoices; never accepted from a client. */
    totalSpentHalalas: money('total_spent_halalas').notNull().default(0),
    lastVisitAt: timestamp('last_visit_at', { withTimezone: true }),
    lastVisitLabel: varchar('last_visit_label', { length: 64 }),
    notes: text('notes'),
  },
  (t) => ({
    byOrg: index('customers_org_idx').on(t.orgId, t.branchId),
    phonePerOrg: uniqueIndex('customers_org_phone_idx').on(t.orgId, t.phone),
  }),
)

export const vehicles = pgTable(
  'vehicles',
  {
    ...tenant,
    plate: varchar('plate', { length: 16 }).notNull(),
    makeModel: varchar('make_model', { length: 160 }).notNull(),
    customerId: varchar('customer_id', { length: ULID_LENGTH }),
    ownerName: varchar('owner_name', { length: 200 }),
    vin: varchar('vin', { length: 17 }),
    mileageKm: integer('mileage_km').notNull().default(0),
    lastServiceAt: timestamp('last_service_at', { withTimezone: true }),
    lastServiceLabel: varchar('last_service_label', { length: 64 }),
    status: varchar('status', { length: 16 }).notNull().default('active'),
  },
  (t) => ({
    byOrg: index('vehicles_org_idx').on(t.orgId, t.branchId),
    platePerOrg: uniqueIndex('vehicles_org_plate_idx').on(t.orgId, t.plate),
    /** `DATA_MODEL.md`: VIN unique per tenant. */
    vinPerOrg: uniqueIndex('vehicles_org_vin_idx').on(t.orgId, t.vin),
  }),
)

export const services = pgTable('services', {
  ...tenant,
  icon: varchar('icon', { length: 64 }).notNull(),
  label: varchar('label', { length: 120 }).notNull(),
})

/* ------------------------------------------------------------ workshop core */

export const jobCards = pgTable(
  'job_cards',
  {
    ...tenant,
    /** The human code the board shows, e.g. `A3F8B2C1`. */
    code: varchar('code', { length: 32 }).notNull(),
    customerId: varchar('customer_id', { length: ULID_LENGTH }),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    vehicleId: varchar('vehicle_id', { length: ULID_LENGTH }),
    vehicleLabel: varchar('vehicle_label', { length: 160 }).notNull(),
    service: varchar('service', { length: 32 }).notNull(),
    status: varchar('status', { length: 24 }).notNull().default('pending'),
    stage: varchar('stage', { length: 24 }).notNull().default('checkin'),
    priority: varchar('priority', { length: 16 }).notNull().default('medium'),
    /** The `own`/`assigned` data scope keys off this column. */
    assignedTechId: varchar('assigned_tech_id', { length: ULID_LENGTH }),
    complaint: text('complaint'),
    qcPassedBy: varchar('qc_passed_by', { length: ULID_LENGTH }),
  },
  (t) => ({
    codePerOrg: uniqueIndex('job_cards_org_code_idx').on(t.orgId, t.code),
    byOrg: index('job_cards_org_idx').on(t.orgId, t.branchId, t.status),
    byTech: index('job_cards_tech_idx').on(t.orgId, t.assignedTechId),
  }),
)

export const appointments = pgTable(
  'appointments',
  {
    ...tenant,
    scheduledDate: date('scheduled_date').notNull(),
    timeLabel: varchar('time_label', { length: 16 }).notNull(),
    /** Minutes past midnight — the machine value the bay-overlap check uses. */
    startMinute: integer('start_minute').notNull(),
    durationMins: integer('duration_mins').notNull(),
    customerId: varchar('customer_id', { length: ULID_LENGTH }),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    vehicleId: varchar('vehicle_id', { length: ULID_LENGTH }),
    vehicleLabel: varchar('vehicle_label', { length: 160 }).notNull(),
    plate: varchar('plate', { length: 16 }).notNull(),
    serviceLabel: varchar('service_label', { length: 80 }).notNull(),
    bay: varchar('bay', { length: 32 }).notNull(),
    technicianId: varchar('technician_id', { length: ULID_LENGTH }),
    technicianName: varchar('technician_name', { length: 200 }),
    status: varchar('status', { length: 16 }).notNull().default('awaiting'),
  },
  (t) => ({
    byDate: index('appointments_date_idx').on(t.orgId, t.branchId, t.scheduledDate),
    byBay: index('appointments_bay_idx').on(t.orgId, t.scheduledDate, t.bay),
  }),
)

export const estimates = pgTable(
  'estimates',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    jobCardId: varchar('job_card_id', { length: ULID_LENGTH }),
    customerId: varchar('customer_id', { length: ULID_LENGTH }),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    vehicleId: varchar('vehicle_id', { length: ULID_LENGTH }),
    vehicleLabel: varchar('vehicle_label', { length: 160 }).notNull(),
    subtotalHalalas: money('subtotal_halalas').notNull().default(0),
    taxHalalas: money('tax_halalas').notNull().default(0),
    discountHalalas: money('discount_halalas').notNull().default(0),
    totalHalalas: money('total_halalas').notNull().default(0),
    status: varchar('status', { length: 16 }).notNull().default('draft'),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    /** Segregation of duties: the submitter may not also approve. */
    submittedBy: varchar('submitted_by', { length: ULID_LENGTH }),
    approvedBy: varchar('approved_by', { length: ULID_LENGTH }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    notes: text('notes'),
  },
  (t) => ({
    codePerOrg: uniqueIndex('estimates_org_code_idx').on(t.orgId, t.code),
    byOrg: index('estimates_org_idx').on(t.orgId, t.branchId, t.status),
  }),
)

export const estimateLines = pgTable(
  'estimate_lines',
  {
    ...tenant,
    estimateId: varchar('estimate_id', { length: ULID_LENGTH }).notNull(),
    description: varchar('description', { length: 300 }).notNull(),
    descriptionAr: varchar('description_ar', { length: 300 }),
    kind: varchar('kind', { length: 16 }).notNull(),
    qty: doublePrecision('qty').notNull(),
    unitPriceHalalas: money('unit_price_halalas').notNull(),
    partSku: varchar('part_sku', { length: 64 }),
    sort: integer('sort').notNull().default(0),
  },
  (t) => ({ byEstimate: index('estimate_lines_estimate_idx').on(t.orgId, t.estimateId) }),
)

export const invoices = pgTable(
  'invoices',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    customerId: varchar('customer_id', { length: ULID_LENGTH }),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    jobCardId: varchar('job_card_id', { length: ULID_LENGTH }),
    vehicleId: varchar('vehicle_id', { length: ULID_LENGTH }),
    dueDate: date('due_date').notNull(),
    status: varchar('status', { length: 16 }).notNull().default('draft'),
    subtotalHalalas: money('subtotal_halalas').notNull().default(0),
    taxHalalas: money('tax_halalas').notNull().default(0),
    discountHalalas: money('discount_halalas').notNull().default(0),
    totalHalalas: money('total_halalas').notNull().default(0),
    /** Sum of cleared payments — maintained by the payment route, never by a
     *  client-supplied figure. */
    paidHalalas: money('paid_halalas').notNull().default(0),
    /* ZATCA phase-2 fields (`DATA_MODEL.md` §INVOICES). */
    sellerVatNumber: varchar('seller_vat_number', { length: 20 }),
    buyerVatNumber: varchar('buyer_vat_number', { length: 20 }),
    qrCode: text('qr_code'),
    hashPrev: varchar('hash_prev', { length: 64 }),
    hashSelf: varchar('hash_self', { length: 64 }),
    issuedAt: timestamp('issued_at', { withTimezone: true }),
    notes: text('notes'),
  },
  (t) => ({
    codePerOrg: uniqueIndex('invoices_org_code_idx').on(t.orgId, t.code),
    byOrg: index('invoices_org_idx').on(t.orgId, t.branchId, t.status),
  }),
)

export const invoiceLines = pgTable(
  'invoice_lines',
  {
    ...tenant,
    invoiceId: varchar('invoice_id', { length: ULID_LENGTH }).notNull(),
    description: varchar('description', { length: 300 }).notNull(),
    descriptionAr: varchar('description_ar', { length: 300 }),
    kind: varchar('kind', { length: 16 }).notNull(),
    qty: doublePrecision('qty').notNull(),
    /** Net unit price. VAT is computed at the invoice level, never per line. */
    unitPriceHalalas: money('unit_price_halalas').notNull(),
    partSku: varchar('part_sku', { length: 64 }),
    sort: integer('sort').notNull().default(0),
  },
  (t) => ({ byInvoice: index('invoice_lines_invoice_idx').on(t.orgId, t.invoiceId) }),
)

export const payments = pgTable(
  'payments',
  {
    ...tenant,
    invoiceId: varchar('invoice_id', { length: ULID_LENGTH }),
    paidOn: date('paid_on').notNull(),
    method: varchar('method', { length: 40 }).notNull(),
    methodAr: varchar('method_ar', { length: 60 }),
    reference: varchar('reference', { length: 64 }),
    amountHalalas: money('amount_halalas').notNull(),
    note: text('note'),
  },
  (t) => ({ byInvoice: index('payments_invoice_idx').on(t.orgId, t.invoiceId) }),
)

export const receipts = pgTable(
  'receipts',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    receiptDate: date('receipt_date').notNull(),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    invoiceCode: varchar('invoice_code', { length: 32 }),
    method: varchar('method', { length: 40 }).notNull(),
    amountHalalas: money('amount_halalas').notNull(),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
  },
  (t) => ({ codePerOrg: uniqueIndex('receipts_org_code_idx').on(t.orgId, t.code) }),
)

/* --------------------------------------------------------- parts & purchase */

export const parts = pgTable(
  'parts',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    sku: varchar('sku', { length: 64 }).notNull(),
    priceHalalas: money('price_halalas').notNull().default(0),
    /** Redacted from roles that may not see margin (`FIELD_RULES`). */
    costHalalas: money('cost_halalas'),
    onHand: integer('on_hand').notNull().default(0),
    reserved: integer('reserved').notNull().default(0),
    reorderLevel: integer('reorder_level').notNull().default(0),
    backorderable: boolean('backorderable').notNull().default(false),
  },
  (t) => ({
    skuPerOrg: uniqueIndex('parts_org_sku_idx').on(t.orgId, t.sku),
    byOrg: index('parts_org_idx').on(t.orgId, t.branchId),
  }),
)

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    ...tenant,
    partId: varchar('part_id', { length: ULID_LENGTH }).notNull(),
    type: varchar('type', { length: 16 }).notNull(),
    qty: integer('qty').notNull(),
    /** Signed effect on hand, so the ledger reconstructs on-hand by summation. */
    delta: integer('delta').notNull(),
    ref: varchar('ref', { length: 64 }),
    reason: text('reason'),
    toBranchId: varchar('to_branch_id', { length: ULID_LENGTH }),
  },
  (t) => ({ byPart: index('inventory_movements_part_idx').on(t.orgId, t.partId) }),
)

export const purchaseOrders = pgTable(
  'purchase_orders',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    supplierName: varchar('supplier_name', { length: 200 }).notNull(),
    status: varchar('status', { length: 24 }).notNull().default('draft'),
    totalHalalas: money('total_halalas').notNull().default(0),
    orderedAt: timestamp('ordered_at', { withTimezone: true }),
    expectedAt: timestamp('expected_at', { withTimezone: true }),
    submittedBy: varchar('submitted_by', { length: ULID_LENGTH }),
    approvedBy: varchar('approved_by', { length: ULID_LENGTH }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
  },
  (t) => ({ codePerOrg: uniqueIndex('purchase_orders_org_code_idx').on(t.orgId, t.code) }),
)

export const purchaseOrderLines = pgTable(
  'purchase_order_lines',
  {
    ...tenant,
    purchaseOrderId: varchar('purchase_order_id', { length: ULID_LENGTH }).notNull(),
    partSku: varchar('part_sku', { length: 64 }),
    description: varchar('description', { length: 300 }).notNull(),
    qty: integer('qty').notNull(),
    receivedQty: integer('received_qty').notNull().default(0),
    unitPriceHalalas: money('unit_price_halalas').notNull(),
  },
  (t) => ({ byPo: index('po_lines_po_idx').on(t.orgId, t.purchaseOrderId) }),
)

/* ------------------------------------------------------------------- people */

export const technicians = pgTable(
  'technicians',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    specialty: varchar('specialty', { length: 160 }),
    activeJobs: integer('active_jobs').notNull().default(0),
    rating: doublePrecision('rating'),
    userId: varchar('user_id', { length: ULID_LENGTH }),
  },
  (t) => ({ byOrg: index('technicians_org_idx').on(t.orgId, t.branchId) }),
)

export const departments = pgTable('departments', {
  ...tenant,
  name: varchar('name', { length: 200 }).notNull(),
  head: varchar('head', { length: 200 }),
  headcount: integer('headcount').notNull().default(0),
  costCenter: varchar('cost_center', { length: 40 }),
  branchLabel: varchar('branch_label', { length: 160 }),
  icon: varchar('icon', { length: 64 }),
})

/* ---------------------------------------------------------------------- CRM */

export const leads = pgTable(
  'leads',
  {
    ...tenant,
    name: varchar('name', { length: 200 }).notNull(),
    company: varchar('company', { length: 200 }),
    valueHalalas: money('value_halalas').notNull().default(0),
    source: varchar('source', { length: 64 }),
    stage: varchar('stage', { length: 32 }).notNull().default('new'),
    leadDate: date('lead_date'),
    score: integer('score'),
  },
  (t) => ({ byStage: index('leads_stage_idx').on(t.orgId, t.stage) }),
)

export const opportunities = pgTable('opportunities', {
  ...tenant,
  name: varchar('name', { length: 200 }).notNull(),
  company: varchar('company', { length: 200 }),
  valueHalalas: money('value_halalas').notNull().default(0),
  stage: varchar('stage', { length: 32 }).notNull(),
  probabilityPct: integer('probability_pct'),
  closeDate: date('close_date'),
  ownerName: varchar('owner_name', { length: 200 }),
})

export const campaigns = pgTable('campaigns', {
  ...tenant,
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 24 }).notNull(),
  status: varchar('status', { length: 24 }).notNull(),
  reach: integer('reach').notNull().default(0),
  opens: integer('opens').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  conversions: integer('conversions').notNull().default(0),
  budgetHalalas: money('budget_halalas').notNull().default(0),
  spentHalalas: money('spent_halalas').notNull().default(0),
})

export const segments = pgTable('segments', {
  ...tenant,
  name: varchar('name', { length: 200 }).notNull(),
  memberCount: integer('member_count').notNull().default(0),
  rules: text('rules'),
  lastUpdatedLabel: varchar('last_updated_label', { length: 64 }),
})

export const crmTasks = pgTable('crm_tasks', {
  ...tenant,
  title: varchar('title', { length: 300 }).notNull(),
  assignedTo: varchar('assigned_to', { length: 200 }),
  dueDate: date('due_date'),
  priority: varchar('priority', { length: 16 }).notNull().default('medium'),
  status: varchar('status', { length: 16 }).notNull().default('todo'),
  type: varchar('type', { length: 24 }),
})

/* --------------------------------------------------------------- accounting */

export const chartOfAccounts = pgTable(
  'chart_of_accounts',
  {
    ...tenant,
    code: varchar('code', { length: 24 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    type: varchar('type', { length: 40 }).notNull(),
    balanceHalalas: money('balance_halalas').notNull().default(0),
    childrenCount: integer('children_count').notNull().default(0),
    parentId: varchar('parent_id', { length: ULID_LENGTH }),
  },
  (t) => ({ codePerOrg: uniqueIndex('coa_org_code_idx').on(t.orgId, t.code) }),
)

export const journalEntries = pgTable(
  'journal_entries',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    entryDate: date('entry_date').notNull(),
    ref: varchar('ref', { length: 64 }),
    narration: text('narration'),
    debitHalalas: money('debit_halalas').notNull().default(0),
    creditHalalas: money('credit_halalas').notNull().default(0),
    status: varchar('status', { length: 16 }).notNull().default('draft'),
  },
  (t) => ({ codePerOrg: uniqueIndex('journal_org_code_idx').on(t.orgId, t.code) }),
)

export const expenses = pgTable(
  'expenses',
  {
    ...tenant,
    code: varchar('code', { length: 32 }).notNull(),
    expenseDate: date('expense_date').notNull(),
    category: varchar('category', { length: 120 }),
    vendor: varchar('vendor', { length: 200 }),
    amountHalalas: money('amount_halalas').notNull().default(0),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
  },
  (t) => ({ codePerOrg: uniqueIndex('expenses_org_code_idx').on(t.orgId, t.code) }),
)

/* -------------------------------------------------- diagnostics & knowledge */

export const obdDevices = pgTable('obd_devices', {
  ...tenant,
  code: varchar('code', { length: 32 }).notNull(),
  bay: varchar('bay', { length: 32 }),
  vehicleLabel: varchar('vehicle_label', { length: 160 }),
  plate: varchar('plate', { length: 16 }),
  status: varchar('status', { length: 24 }).notNull(),
  vin: varchar('vin', { length: 40 }),
  rpm: integer('rpm'),
  coolant: integer('coolant'),
  voltage: doublePrecision('voltage'),
  load: integer('load'),
  dtcCount: integer('dtc_count').notNull().default(0),
})

export const dtcCodes = pgTable('dtc_codes', {
  ...tenant,
  code: varchar('code', { length: 16 }).notNull(),
  description: varchar('description', { length: 300 }).notNull(),
  descriptionAr: varchar('description_ar', { length: 300 }),
  severity: varchar('severity', { length: 16 }).notNull(),
  system: varchar('system', { length: 64 }),
  freezeFrame: boolean('freeze_frame').notNull().default(false),
})

export const oemTools = pgTable('oem_tools', {
  ...tenant,
  brand: varchar('brand', { length: 120 }).notNull(),
  tool: varchar('tool', { length: 120 }).notNull(),
  status: varchar('status', { length: 24 }).notNull(),
  vehicleCount: integer('vehicle_count').notNull().default(0),
  protocol: varchar('protocol', { length: 120 }),
  licence: varchar('licence', { length: 64 }),
  expiresOn: date('expires_on'),
  /** The design shows an em-dash where a tool has no licence expiry. Keeping
   *  the label beside the date means "no expiry" renders as the product wrote
   *  it rather than as an empty cell. */
  expiresLabel: varchar('expires_label', { length: 32 }),
})

export const integrations = pgTable('integrations', {
  ...tenant,
  name: varchar('name', { length: 160 }).notNull(),
  nameAr: varchar('name_ar', { length: 160 }),
  category: varchar('category', { length: 64 }),
  icon: varchar('icon', { length: 64 }),
  status: varchar('status', { length: 24 }).notNull(),
  detail: text('detail'),
  detailAr: text('detail_ar'),
})

export const kbProcedures = pgTable('kb_procedures', {
  ...tenant,
  code: varchar('code', { length: 32 }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  titleAr: varchar('title_ar', { length: 300 }),
  category: varchar('category', { length: 64 }),
  make: varchar('make', { length: 160 }),
  mins: integer('mins'),
  torque: text('torque'),
  torqueAr: text('torque_ar'),
  steps: integer('steps'),
  views: integer('views'),
  tsb: boolean('tsb').notNull().default(false),
  media: varchar('media', { length: 64 }),
})

export const approvalLines = pgTable('approval_lines', {
  ...tenant,
  seq: integer('seq').notNull(),
  item: varchar('item', { length: 300 }).notNull(),
  itemAr: varchar('item_ar', { length: 300 }),
  qty: doublePrecision('qty').notNull().default(1),
  unitPriceHalalas: money('unit_price_halalas').notNull().default(0),
  kind: varchar('kind', { length: 16 }),
  urgency: varchar('urgency', { length: 16 }),
  note: text('note'),
  noteAr: text('note_ar'),
})

export const diagStages = pgTable('diag_stages', {
  ...tenant,
  stageKey: varchar('stage_key', { length: 40 }).notNull(),
  role: varchar('role', { length: 32 }),
  label: varchar('label', { length: 160 }).notNull(),
  labelAr: varchar('label_ar', { length: 160 }),
  ownerName: varchar('owner_name', { length: 200 }),
  ownerNameAr: varchar('owner_name_ar', { length: 200 }),
  atLabel: varchar('at_label', { length: 64 }),
  action: varchar('action', { length: 160 }),
  actionAr: varchar('action_ar', { length: 160 }),
  adds: text('adds'),
  addsAr: text('adds_ar'),
})

export const diagFindings = pgTable('diag_findings', {
  ...tenant,
  dtc: varchar('dtc', { length: 16 }),
  finding: varchar('finding', { length: 300 }).notNull(),
  findingAr: varchar('finding_ar', { length: 300 }),
  system: varchar('system', { length: 64 }),
  systemAr: varchar('system_ar', { length: 64 }),
  severity: varchar('severity', { length: 16 }),
  evidence: varchar('evidence', { length: 32 }),
})

export const diagParts = pgTable('diag_parts', {
  ...tenant,
  partSku: varchar('part_sku', { length: 64 }).notNull(),
  description: varchar('description', { length: 300 }).notNull(),
  descriptionAr: varchar('description_ar', { length: 300 }),
  qty: doublePrecision('qty').notNull().default(1),
  priceHalalas: money('price_halalas').notNull().default(0),
  stock: varchar('stock', { length: 16 }),
  eta: varchar('eta', { length: 32 }),
})

export const diagLabour = pgTable('diag_labour', {
  ...tenant,
  task: varchar('task', { length: 300 }).notNull(),
  taskAr: varchar('task_ar', { length: 300 }),
  hours: doublePrecision('hours').notNull().default(0),
  rateHalalas: money('rate_halalas').notNull().default(0),
})

export const diagCopies = pgTable('diag_copies', {
  ...tenant,
  recipient: varchar('recipient', { length: 120 }).notNull(),
  recipientAr: varchar('recipient_ar', { length: 120 }),
  icon: varchar('icon', { length: 64 }),
  atLabel: varchar('at_label', { length: 64 }),
  state: varchar('state', { length: 24 }),
})

/* ---------------------------------------------------------------- AI tables */

export const aiAgents = pgTable('ai_agents', {
  ...tenant,
  name: varchar('name', { length: 160 }).notNull(),
  role: varchar('role', { length: 120 }),
  model: varchar('model', { length: 120 }),
  status: varchar('status', { length: 24 }).notNull(),
  tasks: integer('tasks').notNull().default(0),
  successRateLabel: varchar('success_rate_label', { length: 16 }),
  icon: varchar('icon', { length: 64 }),
})

export const conversations = pgTable('conversations', {
  ...tenant,
  title: varchar('title', { length: 300 }).notNull(),
  userName: varchar('user_name', { length: 200 }),
  messageCount: integer('message_count').notNull().default(0),
  conversationDate: date('conversation_date'),
  tokensLabel: varchar('tokens_label', { length: 24 }),
})

/* --------------------------------------------- platform control plane (new) */

export const garageApplications = pgTable('garage_applications', {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  legalName: varchar('legal_name', { length: 200 }).notNull(),
  crNumber: varchar('cr_number', { length: 20 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  contactName: varchar('contact_name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  city: varchar('city', { length: 120 }),
  planRequested: varchar('plan_requested', { length: 40 }),
  notes: text('notes'),
  status: varchar('status', { length: 16 }).notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: ULID_LENGTH }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const supplierApplications = pgTable('supplier_applications', {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  company: varchar('company', { length: 200 }).notNull(),
  crNumber: varchar('cr_number', { length: 20 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  contactName: varchar('contact_name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  categories: jsonb('categories').$type<string[]>().notNull().default([]),
  regions: jsonb('regions').$type<string[]>().notNull().default([]),
  status: varchar('status', { length: 16 }).notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: ULID_LENGTH }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const subscriptionRequests = pgTable('subscription_requests', {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  orgId: varchar('org_id', { length: ULID_LENGTH })
    .notNull()
    .references(() => organizations.id),
  fromPlan: varchar('from_plan', { length: 40 }).notNull(),
  toPlan: varchar('to_plan', { length: 40 }).notNull(),
  direction: varchar('direction', { length: 16 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 16 }).notNull().default('pending'),
  requestedBy: varchar('requested_by', { length: ULID_LENGTH }),
  reviewedBy: varchar('reviewed_by', { length: ULID_LENGTH }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  effectiveAt: timestamp('effective_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const supportTickets = pgTable('support_tickets', {
  ...tenant,
  subject: varchar('subject', { length: 300 }).notNull(),
  body: text('body'),
  priority: varchar('priority', { length: 16 }).notNull().default('low'),
  status: varchar('status', { length: 16 }).notNull().default('open'),
  assignedTo: varchar('assigned_to', { length: ULID_LENGTH }),
  thread: jsonb('thread').$type<unknown[]>().notNull().default([]),
})

export const systemHealth = pgTable('system_health', {
  id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
  ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  uptimePct: doublePrecision('uptime_pct'),
  queueDepth: integer('queue_depth'),
  errorRatePct: doublePrecision('error_rate_pct'),
  dbSizeGb: doublePrecision('db_size_gb'),
  activeSessions: integer('active_sessions'),
  notes: text('notes'),
})

export const otpChallenges = pgTable(
  'otp_challenges',
  {
    id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
    channel: varchar('channel', { length: 8 }).notNull(),
    destination: varchar('destination', { length: 254 }).notNull(),
    /** Hashed. A plaintext OTP column is a credential at rest. */
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byDestination: index('otp_destination_idx').on(t.destination, t.createdAt) }),
)

/* ------------------------------------------------------- audit & idempotency */

/** Append-only. A trigger refuses UPDATE and DELETE, so an application user
 *  cannot edit history even holding the application role. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
    orgId: varchar('org_id', { length: ULID_LENGTH }),
    branchId: varchar('branch_id', { length: ULID_LENGTH }),
    actorId: varchar('actor_id', { length: ULID_LENGTH }),
    actorRole: varchar('actor_role', { length: 32 }),
    action: varchar('action', { length: 40 }).notNull(),
    entity: varchar('entity', { length: 64 }).notNull(),
    entityId: varchar('entity_id', { length: 64 }),
    before: jsonb('before'),
    after: jsonb('after'),
    reason: text('reason'),
    /** `api` · `seed` · `job` · `import` — how the change arrived. */
    source: varchar('source', { length: 24 }).notNull().default('api'),
    requestId: varchar('request_id', { length: 64 }),
    ip: varchar('ip', { length: 64 }),
    userAgent: text('user_agent'),
    ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEntity: index('audit_entity_idx').on(t.orgId, t.entity, t.entityId),
    byTs: index('audit_ts_idx').on(t.orgId, t.ts),
  }),
)

/** A replayed `Idempotency-Key` returns the stored response and creates no
 *  second business effect. */
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: varchar('id', { length: ULID_LENGTH }).primaryKey(),
    orgId: varchar('org_id', { length: ULID_LENGTH }).notNull(),
    key: varchar('key', { length: 128 }).notNull(),
    endpoint: varchar('endpoint', { length: 160 }).notNull(),
    /** Digest of the request body: the same key with a different body is a bug
     *  on the caller's side, and is refused rather than silently replayed. */
    requestHash: varchar('request_hash', { length: 64 }).notNull(),
    responseStatus: integer('response_status').notNull(),
    responseBody: jsonb('response_body'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    unique: uniqueIndex('idempotency_org_key_idx').on(t.orgId, t.key, t.endpoint),
  }),
)

/* ------------------------------------------------------------------ relations */

export const organizationRelations = relations(organizations, ({ many }) => ({
  branches: many(branches),
  users: many(users),
}))

export const invoiceRelations = relations(invoices, ({ many }) => ({
  lines: many(invoiceLines),
  payments: many(payments),
}))

export const estimateRelations = relations(estimates, ({ many }) => ({
  lines: many(estimateLines),
}))

export const customerRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
}))

/** Every tenant-owned table, in the order RLS is applied to them. Kept beside
 *  the definitions so a new table cannot be added without deciding whether it
 *  is tenant-owned — the migration that applies RLS reads this list. */
export const TENANT_TABLES = [
  'branches',
  'users',
  'user_sessions',
  'fleets',
  'customers',
  'vehicles',
  'services',
  'job_cards',
  'appointments',
  'estimates',
  'estimate_lines',
  'invoices',
  'invoice_lines',
  'payments',
  'receipts',
  'parts',
  'inventory_movements',
  'purchase_orders',
  'purchase_order_lines',
  'technicians',
  'departments',
  'leads',
  'opportunities',
  'campaigns',
  'segments',
  'crm_tasks',
  'chart_of_accounts',
  'journal_entries',
  'expenses',
  'obd_devices',
  'dtc_codes',
  'oem_tools',
  'integrations',
  'kb_procedures',
  'approval_lines',
  'diag_stages',
  'diag_findings',
  'diag_parts',
  'diag_labour',
  'diag_copies',
  'ai_agents',
  'conversations',
  'support_tickets',
] as const

/** Tables whose rows narrow further under the `own` / `assigned` / `self`
 *  scopes, and the column that decides ownership. */
export const OWNED_TABLES: Readonly<Record<string, string>> = {
  job_cards: 'assigned_tech_id',
  appointments: 'technician_id',
  crm_tasks: 'created_by',
  user_sessions: 'user_id',
}
