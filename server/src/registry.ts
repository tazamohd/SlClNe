/** One description per collection, and the routes are generated from it.
 *
 *  The alternative — thirty-five hand-written routers — guarantees that the
 *  twenty-ninth forgets the soft-delete filter or the permission check. A
 *  single description names the table, the permission module it is gated by,
 *  the columns `?q=` searches, the columns `?sort=` and `?filter[]=` accept,
 *  and how a row is presented to a screen. Everything else is uniform.
 *
 *  `present` is what keeps the mock → HTTP swap non-destructive: it returns the
 *  exact shape `app/src/data/generated/tables.ts` carries today, with the
 *  entity metadata added, so no screen has to change.
 */
import type { PgTable } from 'drizzle-orm/pg-core'
import type { ModuleId } from '@salis/contract'
import * as s from './db/schema'
import {
  count,
  dateGB,
  dateUS,
  kilometres,
  meta,
  sarNumber,
  sarString,
} from './present'

/** The row as it comes out of the driver. Each `define` call below narrows it
 *  to the table's own inferred type; the erased form is what the generic
 *  router works with. */
type DbRow = Record<string, unknown>

export interface CollectionDef {
  /** The key `app/src/data/repository.ts` uses. */
  key: string
  /** The path segment under the API root, e.g. `customers`. */
  path: string
  table: PgTable
  /** Permission module from `RBAC.md`. */
  module: ModuleId
  /** Name recorded in the audit log. */
  entity: string
  /** Columns `?q=` searches, as `ilike`. */
  search: readonly string[]
  /** Columns `?sort=` accepts. Anything else is a 400 rather than a silent
   *  fallback, so a typo in a sort key is visible instead of ignored. */
  sortable: readonly string[]
  /** Columns `?filter[x]=` accepts, matched for equality. */
  filterable: readonly string[]
  defaultSort: { column: string; dir: 'asc' | 'desc' }
  /** Human business code, when the design shows one (`INV-2026-0142`). Detail
   *  routes accept either it or the ULID. */
  codeColumn?: string
  /** `services` presents as a two-element tuple because that is the shape the
   *  design's service picker destructures; everything else presents as an
   *  object. Hence `unknown` rather than a record. */
  present: (row: DbRow) => unknown
  /** Collections that take writes through the generic router. Estimates,
   *  invoices and payments are not here: they carry line items, derived money
   *  and idempotency, and have their own routers. */
  writable?: boolean
}

const define = <T extends PgTable>(
  def: Omit<CollectionDef, 'table' | 'present'> & {
    table: T
    present: (row: T['$inferSelect']) => unknown
  },
): CollectionDef => def as unknown as CollectionDef

export const COLLECTIONS: readonly CollectionDef[] = [
  /* ----------------------------------------------------------------- tenancy */
  define({
    /** Read-only directory of the organization's branches, so a transfer
     *  destination is *picked* rather than typed as a raw ULID (F-017). Gated
     *  on `dashboard:v` — the one module every operating role holds view on —
     *  because a branch name is directory data, not a privilege; external
     *  roles (supplier, customer) hold no dashboard grant and are refused.
     *  Not `writable`: branches are created by administration flows that do
     *  not exist yet, never through the generic router. */
    key: 'branches',
    path: 'branches',
    table: s.branches,
    module: 'dashboard',
    entity: 'branch',
    search: ['name', 'city'],
    sortable: ['name', 'city', 'createdAt'],
    filterable: ['isMain'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      nameAr: row.nameAr ?? '',
      city: row.city ?? '',
      isMain: row.isMain,
    }),
  }),

  /* ------------------------------------------------ customers and vehicles */
  define({
    key: 'customers',
    path: 'customers',
    table: s.customers,
    module: 'customers',
    entity: 'customer',
    search: ['name', 'phone', 'email'],
    sortable: ['name', 'phone', 'totalSpentHalalas', 'vehicleCount', 'createdAt'],
    filterable: ['type', 'fleetId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      name: row.name,
      phone: row.phone,
      vehicles: count(row.vehicleCount),
      spent: sarString(row.totalSpentHalalas),
      last: row.lastVisitLabel ?? '',
      type: row.type,
      email: row.email,
      totalSpentHalalas: count(row.totalSpentHalalas),
    }),
  }),

  define({
    key: 'vehicles',
    path: 'vehicles',
    table: s.vehicles,
    module: 'vehicles',
    entity: 'vehicle',
    search: ['plate', 'makeModel', 'ownerName', 'vin'],
    sortable: ['plate', 'makeModel', 'mileageKm', 'status', 'createdAt'],
    filterable: ['status', 'customerId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      plate: row.plate,
      make: row.makeModel,
      owner: row.ownerName ?? '',
      mileage: kilometres(row.mileageKm),
      last: row.lastServiceLabel ?? '',
      status: row.status,
      mileageKm: count(row.mileageKm),
      vin: row.vin,
      customerId: row.customerId,
    }),
  }),

  define({
    key: 'fleets',
    path: 'fleets',
    table: s.fleets,
    module: 'customers',
    entity: 'fleet',
    search: ['name'],
    sortable: ['name', 'vehicleCount', 'createdAt'],
    filterable: ['contractStatus'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      vehicles: count(row.vehicleCount),
      active: count(row.activeCount),
      contract: row.contractStatus,
    }),
  }),

  define({
    key: 'services',
    path: 'services',
    table: s.services,
    module: 'jobcards',
    entity: 'service',
    search: ['label'],
    sortable: ['label', 'createdAt'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    /** The design carries this table as `[icon, label]` tuples and the service
     *  picker destructures it positionally, so this is the one collection that
     *  presents as an array. It therefore carries no entity metadata — JSON
     *  drops non-index properties on an array — and is read-only. */
    present: (row) => [row.icon, row.label],
  }),

  /* ------------------------------------------------------------- workshop */
  define({
    key: 'jobs',
    path: 'jobs',
    table: s.jobCards,
    module: 'jobcards',
    entity: 'job_card',
    search: ['code', 'customerName', 'vehicleLabel'],
    sortable: ['code', 'customerName', 'status', 'priority', 'createdAt'],
    filterable: ['status', 'stage', 'priority', 'service', 'assignedTechId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      cust: row.customerName,
      veh: row.vehicleLabel,
      svc: row.service,
      st: row.status,
      pr: row.priority,
      stage: row.stage,
      assignedTechId: row.assignedTechId,
    }),
  }),

  define({
    key: 'appointments',
    path: 'appointments',
    table: s.appointments,
    module: 'appointments',
    entity: 'appointment',
    search: ['customerName', 'vehicleLabel', 'plate', 'serviceLabel', 'technicianName'],
    sortable: ['scheduledDate', 'startMinute', 'bay', 'status', 'createdAt'],
    filterable: ['status', 'bay', 'scheduledDate', 'technicianId'],
    defaultSort: { column: 'startMinute', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      time: row.timeLabel,
      cust: row.customerName,
      veh: row.vehicleLabel,
      plate: row.plate,
      svc: row.serviceLabel,
      status: row.status,
      bay: row.bay,
      tech: row.technicianName ?? '',
      mins: count(row.durationMins),
      scheduledDate: row.scheduledDate,
      startMinute: count(row.startMinute),
    }),
  }),

  define({
    key: 'estimates',
    path: 'estimates',
    table: s.estimates,
    module: 'estimates',
    entity: 'estimate',
    search: ['code', 'customerName', 'vehicleLabel'],
    sortable: ['code', 'customerName', 'totalHalalas', 'status', 'createdAt'],
    filterable: ['status', 'jobCardId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      cust: row.customerName,
      veh: row.vehicleLabel,
      amount: sarString(row.totalHalalas),
      status: row.status,
      totalHalalas: count(row.totalHalalas),
      jobCardId: row.jobCardId,
    }),
  }),

  /* ------------------------------------------------------------- invoicing */
  define({
    key: 'invoices',
    path: 'invoices',
    table: s.invoices,
    module: 'invoices',
    entity: 'invoice',
    search: ['code', 'customerName'],
    sortable: ['code', 'customerName', 'dueDate', 'totalHalalas', 'status', 'createdAt'],
    filterable: ['status', 'customerId', 'jobCardId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      cust: row.customerName,
      amount: sarString(row.totalHalalas),
      due: dateUS(row.dueDate),
      status: row.status,
      subtotalHalalas: count(row.subtotalHalalas),
      taxHalalas: count(row.taxHalalas),
      discountHalalas: count(row.discountHalalas),
      totalHalalas: count(row.totalHalalas),
      paidHalalas: count(row.paidHalalas),
      balanceHalalas: count(row.totalHalalas) - count(row.paidHalalas),
      issuedAt: row.issuedAt ? new Date(row.issuedAt).toISOString() : null,
      qrCode: row.qrCode,
    }),
  }),

  define({
    key: 'invoiceLines',
    path: 'invoice-lines',
    table: s.invoiceLines,
    module: 'invoices',
    entity: 'invoice_line',
    search: ['description', 'partSku'],
    sortable: ['sort', 'createdAt'],
    filterable: ['invoiceId', 'kind'],
    defaultSort: { column: 'sort', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      desc: row.description,
      ar: row.descriptionAr ?? '',
      kind: row.kind,
      qty: row.qty,
      unit: sarNumber(row.unitPriceHalalas),
      part: row.partSku ?? '',
      unitPriceHalalas: count(row.unitPriceHalalas),
      invoiceId: row.invoiceId,
    }),
  }),

  define({
    key: 'invoicePayments',
    path: 'payments',
    table: s.payments,
    module: 'payments',
    entity: 'payment',
    search: ['reference', 'method'],
    sortable: ['paidOn', 'amountHalalas', 'createdAt'],
    filterable: ['invoiceId', 'method'],
    defaultSort: { column: 'paidOn', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      date: dateGB(row.paidOn),
      method: row.method,
      ar_method: row.methodAr ?? '',
      ref: row.reference ?? '',
      amount: sarNumber(row.amountHalalas),
      amountHalalas: count(row.amountHalalas),
      invoiceId: row.invoiceId,
    }),
  }),

  define({
    key: 'receipts',
    path: 'receipts',
    table: s.receipts,
    module: 'payments',
    entity: 'receipt',
    search: ['code', 'customerName', 'invoiceCode'],
    sortable: ['code', 'receiptDate', 'amountHalalas', 'createdAt'],
    filterable: ['status', 'method'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      date: dateUS(row.receiptDate),
      customer: row.customerName,
      invoice: row.invoiceCode ?? '',
      method: row.method,
      amount: sarString(row.amountHalalas),
      status: row.status,
      amountHalalas: count(row.amountHalalas),
    }),
  }),

  /* ----------------------------------------------------------------- parts */
  define({
    key: 'parts',
    path: 'inventory',
    table: s.parts,
    module: 'inventory',
    entity: 'part',
    search: ['name', 'sku'],
    sortable: ['name', 'sku', 'onHand', 'priceHalalas', 'createdAt'],
    filterable: ['backorderable'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'sku',
    writable: true,
    present: (row) => ({
      ...meta(row),
      name: row.name,
      sku: row.sku,
      stock: count(row.onHand),
      reorder: count(row.reorderLevel),
      price: sarString(row.priceHalalas),
      priceHalalas: count(row.priceHalalas),
      costHalalas: row.costHalalas ?? null,
      reserved: count(row.reserved),
      available: count(row.onHand) - count(row.reserved),
    }),
  }),

  /* ------------------------------------------------------------------ team */
  define({
    key: 'technicians',
    path: 'technicians',
    table: s.technicians,
    module: 'technicians',
    entity: 'technician',
    search: ['name', 'specialty'],
    sortable: ['name', 'activeJobs', 'rating', 'createdAt'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      specialty: row.specialty ?? '',
      jobs: count(row.activeJobs),
      rating: row.rating == null ? '' : row.rating.toFixed(1),
    }),
  }),

  define({
    key: 'departments',
    path: 'admin/departments',
    table: s.departments,
    module: 'admin',
    entity: 'department',
    search: ['name', 'head', 'costCenter'],
    sortable: ['name', 'headcount', 'createdAt'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      head: row.head ?? '',
      headcount: count(row.headcount),
      costCenter: row.costCenter ?? '',
      branch: row.branchLabel ?? '',
      icon: row.icon ?? '',
    }),
  }),

  /* ------------------------------------------------------------------- CRM */
  define({
    key: 'leads',
    path: 'crm/leads',
    table: s.leads,
    module: 'crm',
    entity: 'lead',
    search: ['name', 'company', 'source'],
    sortable: ['name', 'valueHalalas', 'score', 'stage', 'createdAt'],
    filterable: ['stage', 'source'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      company: row.company ?? '',
      value: sarString(row.valueHalalas),
      source: row.source ?? '',
      stage: row.stage,
      date: dateUS(row.leadDate),
      score: count(row.score),
    }),
  }),

  define({
    key: 'opportunities',
    path: 'crm/opportunities',
    table: s.opportunities,
    module: 'crm',
    entity: 'opportunity',
    search: ['name', 'company', 'ownerName'],
    sortable: ['name', 'valueHalalas', 'stage', 'closeDate', 'createdAt'],
    filterable: ['stage'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      company: row.company ?? '',
      value: sarString(row.valueHalalas),
      stage: row.stage,
      prob: `${count(row.probabilityPct)}%`,
      close: dateUS(row.closeDate),
      owner: row.ownerName ?? '',
    }),
  }),

  define({
    key: 'campaigns',
    path: 'crm/campaigns',
    table: s.campaigns,
    module: 'crm',
    entity: 'campaign',
    search: ['name'],
    sortable: ['name', 'reach', 'conversions', 'createdAt'],
    filterable: ['type', 'status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      type: row.type,
      status: row.status,
      reach: count(row.reach),
      opens: count(row.opens),
      clicks: count(row.clicks),
      conversions: count(row.conversions),
      budget: sarString(row.budgetHalalas),
      spent: sarString(row.spentHalalas),
    }),
  }),

  define({
    key: 'segments',
    path: 'crm/segments',
    table: s.segments,
    module: 'crm',
    entity: 'segment',
    search: ['name', 'rules'],
    sortable: ['name', 'memberCount', 'createdAt'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      count: count(row.memberCount),
      rules: row.rules ?? '',
      lastUpdated: row.lastUpdatedLabel ?? '',
    }),
  }),

  define({
    key: 'crmTasks',
    path: 'crm/tasks',
    table: s.crmTasks,
    module: 'crm',
    entity: 'crm_task',
    search: ['title', 'assignedTo'],
    sortable: ['title', 'dueDate', 'priority', 'status', 'createdAt'],
    filterable: ['status', 'priority', 'type'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      title: row.title,
      assigned: row.assignedTo ?? '',
      due: dateUS(row.dueDate),
      priority: row.priority,
      status: row.status,
      type: row.type ?? '',
    }),
  }),

  /* ------------------------------------------------------------ accounting */
  define({
    key: 'chartOfAccounts',
    path: 'accounting/coa',
    table: s.chartOfAccounts,
    module: 'accounting',
    entity: 'account',
    search: ['code', 'name'],
    sortable: ['code', 'name', 'balanceHalalas'],
    filterable: ['type', 'parentId'],
    defaultSort: { column: 'code', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      code: row.code,
      name: row.name,
      type: row.type,
      balance: sarString(row.balanceHalalas),
      children: count(row.childrenCount),
    }),
  }),

  define({
    key: 'journalEntries',
    path: 'accounting/journal-entries',
    table: s.journalEntries,
    module: 'accounting',
    entity: 'journal_entry',
    search: ['code', 'ref', 'narration'],
    sortable: ['code', 'entryDate', 'debitHalalas', 'status'],
    filterable: ['status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      date: dateUS(row.entryDate),
      ref: row.ref ?? '',
      narration: row.narration ?? '',
      debit: sarString(row.debitHalalas),
      credit: sarString(row.creditHalalas),
      status: row.status,
    }),
  }),

  define({
    key: 'expenses',
    path: 'accounting/expenses',
    table: s.expenses,
    module: 'accounting',
    entity: 'expense',
    search: ['code', 'category', 'vendor'],
    sortable: ['code', 'expenseDate', 'amountHalalas', 'status'],
    filterable: ['status', 'category'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      date: dateUS(row.expenseDate),
      category: row.category ?? '',
      vendor: row.vendor ?? '',
      amount: sarString(row.amountHalalas),
      status: row.status,
    }),
  }),

  /* --------------------------------------------------------------------- AI */
  define({
    key: 'aiAgents',
    path: 'ai/agents',
    table: s.aiAgents,
    module: 'ai',
    entity: 'ai_agent',
    search: ['name', 'role', 'model'],
    sortable: ['name', 'tasks', 'createdAt'],
    filterable: ['status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      role: row.role ?? '',
      model: row.model ?? '',
      status: row.status,
      tasks: count(row.tasks),
      success: row.successRateLabel ?? '',
      icon: row.icon ?? '',
    }),
  }),

  define({
    key: 'conversations',
    path: 'ai/conversations',
    table: s.conversations,
    module: 'ai',
    entity: 'conversation',
    search: ['title', 'userName'],
    sortable: ['title', 'conversationDate', 'messageCount'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      title: row.title,
      user: row.userName ?? '',
      msgs: count(row.messageCount),
      date: dateUS(row.conversationDate),
      tokens: row.tokensLabel ?? '',
    }),
  }),

  /* -------------------------------------------------------- diagnostics/KB */
  define({
    key: 'obdDevices',
    path: 'diagnostics/devices',
    table: s.obdDevices,
    module: 'jobcards',
    entity: 'obd_device',
    search: ['code', 'vehicleLabel', 'plate', 'vin'],
    sortable: ['code', 'bay', 'createdAt'],
    filterable: ['status', 'bay'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      bay: row.bay ?? '',
      vehicle: row.vehicleLabel ?? '',
      plate: row.plate ?? '',
      status: row.status,
      vin: row.vin ?? '',
      rpm: count(row.rpm),
      coolant: count(row.coolant),
      voltage: row.voltage ?? 0,
      load: count(row.load),
      dtc: count(row.dtcCount),
    }),
  }),

  define({
    key: 'dtcCodes',
    path: 'kb/dtc',
    table: s.dtcCodes,
    module: 'jobcards',
    entity: 'dtc_code',
    search: ['code', 'description'],
    sortable: ['code', 'severity'],
    filterable: ['severity', 'system'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      code: row.code,
      desc: row.description,
      ar: row.descriptionAr ?? '',
      severity: row.severity,
      system: row.system ?? '',
      freeze: row.freezeFrame,
    }),
  }),

  define({
    key: 'oemTools',
    path: 'integrations/oem-tools',
    table: s.oemTools,
    module: 'settings',
    entity: 'oem_tool',
    search: ['brand', 'tool', 'protocol'],
    sortable: ['brand', 'vehicleCount', 'expiresOn'],
    filterable: ['status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      brand: row.brand,
      tool: row.tool,
      status: row.status,
      vehicles: count(row.vehicleCount),
      protocol: row.protocol ?? '',
      licence: row.licence ?? '',
      expires: row.expiresLabel ?? row.expiresOn ?? '',
    }),
  }),

  define({
    key: 'integrations',
    path: 'integrations',
    table: s.integrations,
    module: 'settings',
    entity: 'integration',
    search: ['name', 'category'],
    sortable: ['name', 'category'],
    filterable: ['status', 'category'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      ar: row.nameAr ?? '',
      cat: row.category ?? '',
      icon: row.icon ?? '',
      status: row.status,
      detail: row.detail ?? '',
      ar_detail: row.detailAr ?? '',
    }),
  }),

  define({
    key: 'kbProcedures',
    path: 'kb/procedures',
    table: s.kbProcedures,
    module: 'jobcards',
    entity: 'kb_procedure',
    search: ['code', 'title', 'make', 'category'],
    sortable: ['code', 'title', 'views', 'mins'],
    filterable: ['category', 'tsb'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      title: row.title,
      ar: row.titleAr ?? '',
      cat: row.category ?? '',
      make: row.make ?? '',
      mins: count(row.mins),
      torque: row.torque ?? '',
      ar_torque: row.torqueAr ?? '',
      steps: count(row.steps),
      views: count(row.views),
      tsb: row.tsb,
      media: row.media ?? '',
    }),
  }),

  define({
    key: 'approvalLines',
    path: 'approvals/lines',
    table: s.approvalLines,
    module: 'approvals',
    entity: 'approval_line',
    search: ['item'],
    sortable: ['seq'],
    filterable: ['kind', 'urgency'],
    defaultSort: { column: 'seq', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      id: count(row.seq),
      item: row.item,
      ar: row.itemAr ?? '',
      qty: row.qty,
      unit: sarNumber(row.unitPriceHalalas),
      kind: row.kind ?? '',
      urgency: row.urgency ?? '',
      note: row.note ?? '',
      ar_note: row.noteAr ?? '',
    }),
  }),

  define({
    key: 'diagStages',
    path: 'diagnostics/stages',
    table: s.diagStages,
    module: 'jobcards',
    entity: 'diag_stage',
    search: ['label', 'ownerName'],
    sortable: ['createdAt'],
    filterable: ['role'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      id: row.stageKey,
      role: row.role ?? '',
      label: row.label,
      ar: row.labelAr ?? '',
      owner: row.ownerName ?? '',
      ar_owner: row.ownerNameAr ?? '',
      at: row.atLabel ?? '',
      act: row.action ?? '',
      ar_act: row.actionAr ?? '',
      adds: row.adds ?? '',
      ar_adds: row.addsAr ?? '',
    }),
  }),

  define({
    key: 'diagFindings',
    path: 'diagnostics/findings',
    table: s.diagFindings,
    module: 'jobcards',
    entity: 'diag_finding',
    search: ['finding', 'dtc'],
    sortable: ['createdAt', 'severity'],
    filterable: ['severity', 'system'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      dtc: row.dtc ?? '',
      finding: row.finding,
      ar: row.findingAr ?? '',
      system: row.system ?? '',
      ar_system: row.systemAr ?? '',
      severity: row.severity ?? '',
      evidence: row.evidence ?? '',
    }),
  }),

  define({
    key: 'diagParts',
    path: 'diagnostics/parts',
    table: s.diagParts,
    module: 'jobcards',
    entity: 'diag_part',
    search: ['partSku', 'description'],
    sortable: ['createdAt'],
    filterable: ['stock'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      part: row.partSku,
      desc: row.description,
      ar: row.descriptionAr ?? '',
      qty: row.qty,
      price: sarNumber(row.priceHalalas),
      stock: row.stock ?? '',
      eta: row.eta ?? '',
    }),
  }),

  define({
    key: 'diagLabour',
    path: 'diagnostics/labour',
    table: s.diagLabour,
    module: 'jobcards',
    entity: 'diag_labour',
    search: ['task'],
    sortable: ['createdAt'],
    filterable: [],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      task: row.task,
      ar: row.taskAr ?? '',
      hrs: row.hours,
      rate: sarNumber(row.rateHalalas),
    }),
  }),

  define({
    key: 'diagCopies',
    path: 'diagnostics/copies',
    table: s.diagCopies,
    module: 'jobcards',
    entity: 'diag_copy',
    search: ['recipient'],
    sortable: ['createdAt'],
    filterable: ['state'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      to: row.recipient,
      ar: row.recipientAr ?? '',
      icon: row.icon ?? '',
      at: row.atLabel ?? '',
      state: row.state ?? '',
    }),
  }),
]

const BY_KEY = new Map(COLLECTIONS.map((c) => [c.key, c]))
const BY_PATH = new Map(COLLECTIONS.map((c) => [c.path, c]))

export function collectionByKey(key: string): CollectionDef | undefined {
  return BY_KEY.get(key)
}

export function collectionByPath(path: string): CollectionDef | undefined {
  return BY_PATH.get(path)
}

/** Per-collection field redaction, keyed to the `FIELD_RULES` a role fails.
 *  Declared here so the value is dropped on serialisation rather than hidden in
 *  a component, which would leave it on the wire — and §36 is explicit that the
 *  wire, not the component, is the boundary.
 *
 *  `customers` was missing, and the gap was live: `FIELD_RULES` hides "Customer
 *  contact details" from technician, qc and supplier, the client dutifully hid
 *  the column — and the API shipped `phone` and `email` in the row regardless,
 *  because nothing here told it not to. A technician token reading
 *  `GET /customers` got every customer's phone number. The redaction the
 *  designers specified existed only in CSS until this line. */
export const REDACTIONS: Readonly<Record<string, readonly { ruleField: string; rowKeys: readonly string[] }[]>> = {
  parts: [{ ruleField: 'Part cost / margin', rowKeys: ['costHalalas'] }],
  customers: [{ ruleField: 'Customer contact details', rowKeys: ['phone', 'email'] }],
}
