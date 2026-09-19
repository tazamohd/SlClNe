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
      /* F-027: exposed so the `customers.fleetId → vehicles.customerId` join a
       * fleet needs to list its vehicles is reachable client-side. */
      fleetId: row.fleetId,
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
    search: ['name', 'contactName'],
    sortable: ['name', 'vehicleCount', 'contractValueHalalas', 'renewalDate', 'createdAt'],
    filterable: ['contractStatus', 'contractType'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      name: row.name,
      vehicles: count(row.vehicleCount),
      active: count(row.activeCount),
      contract: row.contractStatus,
      /* F-027 contract terms. */
      contractType: row.contractType ?? '',
      contractValue: sarString(row.contractValueHalalas),
      contractValueHalalas: count(row.contractValueHalalas),
      start: dateUS(row.contractStartDate),
      end: dateUS(row.contractEndDate),
      renewal: dateUS(row.renewalDate),
      contact: row.contactName ?? '',
      contactPhone: row.contactPhone ?? '',
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
      /* The appointment this job card was opened from (DF-007), or null for a
       * car that arrived at the counter. */
      appointmentId: row.appointmentId ?? null,
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
      /* The VAT breakdown EstimateDetail / DiagnosticReport need (F-029). The
       * schema has carried these since the estimate router summed them from the
       * lines; `present()` omitted all but the total, so no screen could show a
       * subtotal-plus-VAT split without recomputing it client-side — which §5b
       * forbids. */
      subtotalHalalas: count(row.subtotalHalalas),
      taxHalalas: count(row.taxHalalas),
      discountHalalas: count(row.discountHalalas),
      totalHalalas: count(row.totalHalalas),
      jobCardId: row.jobCardId,
      /* The submitter, for the SOD row check: whoever raised the estimate may
       * not also approve it (F-004 client half). `approvedBy` is exposed beside
       * it so a screen can show who did approve, once one has. */
      submittedBy: row.submittedBy ?? null,
      approvedBy: row.approvedBy ?? null,
      /* The customer's e-signature (DF-007), beside the internal approval and
       * never instead of it: `customerSignedAt` is the customer saying yes,
       * `approvedBy` is the shop authorising the spend. A screen showing one as
       * the other would misstate who agreed to what. */
      customerSignedAt: row.customerSignedAt
        ? new Date(row.customerSignedAt as string | Date).toISOString()
        : null,
      customerSignatureChannel: row.customerSignatureChannel ?? null,
      /* The column has been on the schema since the estimate router accepted
       * it on create; `present()` never exposed it, so no screen could refuse
       * an approval on an expired estimate or show the customer a deadline —
       * both of which need the date on the wire, not just enforced server-side
       * on write. Read-only here: nothing changes what a create/patch accepts. */
      validUntil: row.validUntil ? new Date(row.validUntil as string | Date).toISOString() : null,
    }),
  }),

  /* Canned Jobs — predefined, priced service packages (build-order item 5).
   * Read-only through the generic router, same as `estimates` itself: no
   * `writable` here, because every write needs the same full-replace-lines-
   * and-recompute-price transaction `estimates`' bespoke routes already run,
   * which `server/src/routes/canned-jobs.ts` provides at this same path. */
  define({
    key: 'cannedJobs',
    path: 'canned-jobs',
    table: s.cannedJobs,
    module: 'estimates',
    entity: 'canned_job',
    search: ['name', 'category'],
    sortable: ['name', 'priceHalalas', 'createdAt'],
    filterable: ['active', 'category'],
    defaultSort: { column: 'name', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      name: row.name,
      nameAr: row.nameAr ?? null,
      category: row.category ?? null,
      description: row.description ?? null,
      active: row.active,
      priceHalalas: count(row.priceHalalas),
      lineCount: count(row.lineCount),
    }),
  }),

  /* Declined Job Tracking & Follow-Up (Sprint 1, P0). Read + follow-up-`PATCH`
   * only — `writable: true` is what turns `PATCH` on at all (§`registerOne`),
   * and `WRITERS.declinedJobs.create` is `z.never()`, so a direct
   * `POST /declined-jobs` always 400s: every row is created by
   * `POST /estimates/:id/lines/:lineId/decline` or the whole-estimate
   * `/reject` fan-out, never by the generic collection route. */
  define({
    key: 'declinedJobs',
    path: 'declined-jobs',
    table: s.declinedJobs,
    module: 'estimates',
    entity: 'declined_job',
    search: ['customerName', 'vehicleLabel', 'description'],
    sortable: ['declinedAt', 'followUpDate', 'valueHalalas', 'status', 'createdAt'],
    filterable: ['status', 'estimateId', 'reasonCategory', 'safetySeverity', 'advisorId'],
    defaultSort: { column: 'declinedAt', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      estimateId: row.estimateId,
      estimateLineId: row.estimateLineId ?? null,
      jobCardId: row.jobCardId ?? null,
      customer: row.customerName,
      vehicle: row.vehicleLabel,
      advisorId: row.advisorId ?? null,
      description: row.description,
      reasonCategory: row.reasonCategory,
      reasonNotes: row.reasonNotes ?? null,
      safetySeverity: row.safetySeverity,
      value: sarString(row.valueHalalas),
      valueHalalas: count(row.valueHalalas),
      status: row.status,
      followUpDate: row.followUpDate ?? null,
      followUpNotes: row.followUpNotes ?? null,
      declinedAt: row.declinedAt ? new Date(row.declinedAt as string | Date).toISOString() : null,
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt as string | Date).toISOString() : null,
    }),
  }),

  /* Digital Vehicle Health Check — inspection findings (Sprint 2, P0). Read +
   * `PATCH` (severity/notes/estimate-line link) through the generic router;
   * `writable: true` is what turns `PATCH` on, and
   * `WRITERS.inspectionFindings.create` is `z.never()` — every row is born
   * from `POST /job-cards/:id/inspection-findings`
   * (`server/src/routes/inspection.ts`), the bespoke route gated on
   * `jobcards:e` rather than `jobcards:c`, because the matrix gives
   * technician view-and-edit on job cards and never create — and creating a
   * finding while walking an inspection is exactly the technician's own act. */
  define({
    key: 'inspectionFindings',
    path: 'inspection-findings',
    table: s.inspectionFindings,
    module: 'jobcards',
    entity: 'inspection_finding',
    search: ['category', 'item'],
    sortable: ['createdAt', 'severity'],
    filterable: ['jobCardId', 'severity', 'estimateLineId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      jobCardId: row.jobCardId,
      category: row.category,
      categoryAr: row.categoryAr ?? null,
      item: row.item,
      itemAr: row.itemAr ?? null,
      severity: row.severity,
      internalNote: row.internalNote ?? null,
      customerNote: row.customerNote ?? null,
      estimateLineId: row.estimateLineId ?? null,
      recordedBy: row.recordedBy ?? null,
    }),
  }),

  /* The evidence attached to a finding above. Read + `PATCH` (annotations
   * only) through the generic router; `WRITERS.inspectionMedia.create` is
   * `z.never()` — every row is born from the multipart upload route, the only
   * place a file's bytes can arrive. `url` never exposes the on-disk
   * `storageKey`; it points at the gated streaming route instead. */
  define({
    key: 'inspectionMedia',
    path: 'inspection-media',
    table: s.inspectionMedia,
    module: 'jobcards',
    entity: 'inspection_media',
    search: [],
    sortable: ['createdAt'],
    filterable: ['findingId', 'jobCardId', 'kind', 'stage'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      findingId: row.findingId,
      jobCardId: row.jobCardId,
      kind: row.kind,
      stage: row.stage,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      annotations: row.annotations ?? [],
      uploadedBy: row.uploadedBy ?? null,
      /* Relative to the API root, no leading slash — the same convention
       * every bespoke action path in the app's `api.ts`/`inspection-api.ts`
       * uses (`jobs/:id/transition`, `inspection-findings/:id/media`), so the
       * client can join it onto `API_URL` (which already carries `/api/v1`)
       * without knowing this is a special case. */
      url: `inspection-media/${row.id}/file`,
    }),
  }),

  /* Customer sign-off at delivery (Sprint 2, P0). Read + `PATCH` (checklist,
   * odometer) through the generic router; `WRITERS.deliverySignoffs.create`
   * is `z.never()` — every row is born from
   * `POST /job-cards/:id/delivery-signoff` (`server/src/routes/delivery.ts`),
   * the multipart route that is the only place a signature image's bytes can
   * arrive. `url` never exposes the on-disk `storageKey`; it points at the
   * gated streaming route instead, same convention as `inspectionMedia`. */
  define({
    key: 'deliverySignoffs',
    path: 'delivery-signoffs',
    table: s.deliverySignoffs,
    module: 'jobcards',
    entity: 'delivery_signoff',
    search: [],
    sortable: ['createdAt'],
    filterable: ['jobCardId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      jobCardId: row.jobCardId,
      signedByName: row.signedByName,
      agreedAt: row.agreedAt ? new Date(row.agreedAt as string | Date).toISOString() : null,
      checklist: row.checklist ?? {},
      odometerOut: row.odometerOut ?? null,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      url: `delivery-signoffs/${row.id}/signature`,
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
      jobCardId: row.jobCardId ?? null,
      /* The estimate this was raised from (DF-007), so a screen can walk the
       * chain back without a second lookup. */
      estimateId: row.estimateId ?? null,
      /* The buyer's VAT number was already on the wire; the seller's was not,
       * so no screen could show the real registration a document was actually
       * issued under — only a literal a screen hardcoded. Null until issued:
       * `POST /invoices/:id/issue` is what captures it, from the organization,
       * onto the row. */
      buyerVatNumber: row.buyerVatNumber ?? null,
      sellerVatNumber: row.sellerVatNumber ?? null,
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
      /* Which bay this part is put away in (BLK-004). The zone code rather
       * than a ULID, because that is what the floor and `InternalWarehouse.tsx`
       * group on, and a composite FK keeps it honest. Null until the part is
       * put away. */
      zoneCode: row.zoneCode ?? null,
    }),
  }),

  /* Warehouse zones (BLK-004) — the bays stock is put away in, which
   * `InternalWarehouse.tsx` rendered as a hardcoded six-row array with
   * invented capacity, utilisation and item counts.
   *
   * What is presented here is only what the zone row records. There is no
   * `itemCount` and no `utilization` field, deliberately: those are facts
   * about stock, and the screen derives them by grouping `parts` on
   * `zoneCode`, so they cannot drift from the inventory they describe.
   * `capacityUnits` is recorded, because how big a bay is is a property of
   * the bay and nothing in the ledger knows it.
   *
   * Writable through the generic router under `inventory` — the same module
   * as the parts it holds — with one lifecycle move (active <-> maintenance)
   * as an ordinary field write, so no bespoke router is needed. */
  define({
    key: 'warehouseZones',
    path: 'warehouse-zones',
    table: s.warehouseZones,
    module: 'inventory',
    entity: 'warehouse_zone',
    search: ['code', 'name', 'nameAr'],
    sortable: ['code', 'name', 'capacityUnits', 'status', 'createdAt'],
    filterable: ['status', 'kind'],
    defaultSort: { column: 'code', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      name: row.name,
      nameAr: row.nameAr ?? null,
      kind: row.kind,
      capacityUnits: count(row.capacityUnits),
      status: row.status,
      maintenanceSince: row.maintenanceSince
        ? new Date(row.maintenanceSince as string | Date).toISOString()
        : null,
      notes: row.notes ?? null,
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
    /* Split from 'admin' (F-038): Staff-Directory/HR-Management/Departments
     * are all 'hr'-module screens, and HR (and Accountant, who also holds an
     * 'hr' grant) need to read this collection without gaining 'admin'
     * itself — branches, users, integrations and templates are not an HR
     * concern. See packages/contract/src/rbac.ts's 'departments' module. */
    module: 'departments',
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
    /* F-039: the collection had no writer at all — DepartmentFormModal's "Add
     * Department" 404'd for every role, owner and superadmin included. */
    writable: true,
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
    writable: true,
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
    writable: true,
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
    writable: true,
    present: (row) => ({
      ...meta(row),
      name: row.name,
      type: row.type,
      status: row.status,
      start: dateUS(row.startDate),
      end: dateUS(row.endDate),
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
    writable: true,
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

  define({
    /** Customer feedback (F-027). Gated on `crm` — the module the customer
     *  success surfaces live under. Writable, so the capture form persists;
     *  read-back is tenant-scoped by RLS like everything else. */
    key: 'feedback',
    path: 'customer-feedback',
    table: s.customerFeedback,
    module: 'crm',
    entity: 'customer_feedback',
    search: ['comment', 'customerName'],
    sortable: ['rating', 'createdAt'],
    filterable: ['rating', 'jobCardId', 'customerId'],
    defaultSort: { column: 'createdAt', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      rating: count(row.rating),
      comment: row.comment ?? '',
      customer: row.customerName ?? '',
      jobCardId: row.jobCardId,
      customerId: row.customerId,
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

  define({
    /** Bank statement lines (F-028) — the bank side BankReconciliation matches
     *  the recorded receipts against. Gated on `accounting`, the module the
     *  reconciliation surface declares (ReportSuite). Read-only through the
     *  generic router; the reconciling write is `POST /bank-statements/:id/match`
     *  (routes/bank.ts), gated on `accounting:e`. */
    key: 'bankStatements',
    path: 'bank-statements',
    table: s.bankStatements,
    module: 'accounting',
    entity: 'bank_statement',
    search: ['description', 'reference'],
    sortable: ['statementDate', 'amountHalalas', 'createdAt'],
    filterable: ['matched', 'direction'],
    defaultSort: { column: 'statementDate', dir: 'desc' },
    present: (row) => ({
      ...meta(row),
      date: dateUS(row.statementDate),
      description: row.description,
      reference: row.reference ?? '',
      account: row.bankAccount ?? '',
      amount: sarString(row.amountHalalas),
      amountHalalas: count(row.amountHalalas),
      direction: row.direction,
      matched: row.matched,
      matchedReceiptId: row.matchedReceiptId,
    }),
  }),

  define({
    /** Saved report definitions (F-028) so CustomReports can persist a report.
     *  Gated on `accounting`, the module the Custom Reports surface declares;
     *  writable through the generic router, and tenant-scoped by RLS so a user
     *  sees their organization's saved reports. */
    key: 'savedReports',
    path: 'saved-reports',
    table: s.savedReports,
    module: 'accounting',
    entity: 'saved_report',
    search: ['name', 'source'],
    sortable: ['name', 'createdAt'],
    filterable: ['source'],
    defaultSort: { column: 'createdAt', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      name: row.name,
      source: row.source ?? '',
      owner: row.ownerName ?? '',
      definition: row.definition ?? {},
    }),
  }),

  /* ------------------------------------------------------ financial products */
  define({
    /** Insurance policies — the cover a customer holds on a vehicle (vertical A).
     *  Read-only through the generic router. Gated on `insurance` (F-034: split
     *  from `accounting`, which conflated ledger authority with claim
     *  adjudication — every grant here is `accounting`'s copied onto its own
     *  column, since no dedicated role exists yet to diverge them). Money is
     *  integer halalas; premium and coverage carry both the formatted string
     *  and the raw halalas. */
    key: 'insurancePolicies',
    path: 'insurance-policies',
    table: s.insurancePolicies,
    module: 'insurance',
    entity: 'insurance_policy',
    search: ['policyNumber', 'insurer', 'holderName', 'vehicleLabel'],
    sortable: ['policyNumber', 'insurer', 'premiumHalalas', 'endDate', 'status', 'createdAt'],
    filterable: ['status', 'type', 'customerId', 'vehicleId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'policyNumber',
    present: (row) => ({
      ...meta(row),
      policyNumber: row.policyNumber,
      insurer: row.insurer,
      type: row.type,
      holder: row.holderName,
      customerId: row.customerId,
      vehicleId: row.vehicleId,
      vehicleLabel: row.vehicleLabel,
      premium: sarString(row.premiumHalalas),
      premiumHalalas: count(row.premiumHalalas),
      coverage: sarString(row.coverageHalalas),
      coverageHalalas: count(row.coverageHalalas),
      start: dateUS(row.startDate),
      end: dateUS(row.endDate),
      status: row.status,
    }),
  }),

  define({
    /** Insurance claims — a request against a policy (vertical A). Read-only
     *  through the generic router; the lifecycle (submit/approve/reject/pay) is
     *  the bespoke router in `routes/insurance-claims.ts`, gated on the ceiling
     *  and segregation of duties like the estimate. Gated on `insurance` for
     *  the same reason as policies (F-034). `amountApproved` is null until
     *  approval. */
    key: 'insuranceClaims',
    path: 'insurance-claims',
    table: s.insuranceClaims,
    module: 'insurance',
    entity: 'insurance_claim',
    search: ['claimNumber', 'policyNumber', 'vehicleLabel', 'description'],
    sortable: ['claimNumber', 'amountClaimedHalalas', 'status', 'incidentDate', 'createdAt'],
    filterable: ['status', 'policyId', 'vehicleId', 'jobCardId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'claimNumber',
    present: (row) => ({
      ...meta(row),
      claimNumber: row.claimNumber,
      policyId: row.policyId,
      policyNumber: row.policyNumber,
      vehicleId: row.vehicleId,
      vehicleLabel: row.vehicleLabel,
      jobCardId: row.jobCardId,
      amountClaimed: sarString(row.amountClaimedHalalas),
      amountClaimedHalalas: count(row.amountClaimedHalalas),
      amountApproved: row.amountApprovedHalalas == null ? null : sarString(row.amountApprovedHalalas),
      amountApprovedHalalas: row.amountApprovedHalalas == null ? null : count(row.amountApprovedHalalas),
      status: row.status,
      incidentDate: dateUS(row.incidentDate),
      description: row.description,
      submittedBy: row.submittedBy ?? null,
      approvedBy: row.approvedBy ?? null,
    }),
  }),

  define({
    /** Auto-loan contracts (vertical A). Read-only through the generic router;
     *  the monthly instalment is amortised by the server at origination
     *  (`rules/loans.ts`) and served as both a formatted string and raw halalas.
     *  Gated on `insurance` (F-034 — the vertical-A module covers loans too). */
    key: 'loanContracts',
    path: 'loan-contracts',
    table: s.loanContracts,
    module: 'insurance',
    entity: 'loan_contract',
    search: ['contractNumber', 'borrowerName'],
    sortable: ['contractNumber', 'principalHalalas', 'status', 'startDate', 'createdAt'],
    filterable: ['status', 'customerId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'contractNumber',
    present: (row) => ({
      ...meta(row),
      contractNumber: row.contractNumber,
      borrower: row.borrowerName,
      customerId: row.customerId,
      principal: sarString(row.principalHalalas),
      principalHalalas: count(row.principalHalalas),
      rateBps: count(row.rateBps),
      termMonths: count(row.termMonths),
      start: dateUS(row.startDate),
      status: row.status,
      monthlyInstalment: sarString(row.monthlyInstalmentHalalas),
      monthlyInstalmentHalalas: count(row.monthlyInstalmentHalalas),
    }),
  }),

  define({
    /** Loan repayments — the amortised schedule a contract implies (vertical A).
     *  Read-only through the generic router; filter by `loanContractId`. Money is
     *  integer halalas and the schedule's amounts sum to principal + interest.
     *  Gated on `insurance` (F-034). */
    key: 'loanRepayments',
    path: 'loan-repayments',
    table: s.loanRepayments,
    module: 'insurance',
    entity: 'loan_repayment',
    search: ['contractNumber'],
    sortable: ['sequence', 'dueDate', 'amountDueHalalas', 'status', 'createdAt'],
    filterable: ['status', 'loanContractId'],
    defaultSort: { column: 'sequence', dir: 'asc' },
    present: (row) => ({
      ...meta(row),
      contractId: row.loanContractId,
      contractNumber: row.contractNumber,
      sequence: count(row.sequence),
      dueDate: dateUS(row.dueDate),
      amountDue: sarString(row.amountDueHalalas),
      amountDueHalalas: count(row.amountDueHalalas),
      amountPaid: sarString(row.amountPaidHalalas),
      amountPaidHalalas: count(row.amountPaidHalalas),
      paidDate: row.paidDate ? dateUS(row.paidDate) : null,
      status: row.status,
    }),
  }),

  /* Equipment warranties (BLK-004) — cover on the shop's own tools and fixed
   * assets, not a customer's vehicle. Writable through the generic router,
   * the same shape `suppliers` gets: a flat directory with no lines, no
   * derived money and one lifecycle move (active -> claimed), so it needs
   * no bespoke router the way estimates or purchase orders do. */
  define({
    key: 'equipmentWarranties',
    path: 'equipment-warranties',
    table: s.equipmentWarranties,
    module: 'accounting',
    entity: 'equipment_warranty',
    search: ['warrantyNumber', 'itemName', 'provider'],
    sortable: ['warrantyNumber', 'itemName', 'endDate', 'status', 'createdAt'],
    filterable: ['status', 'coverage'],
    defaultSort: { column: 'endDate', dir: 'asc' },
    codeColumn: 'warrantyNumber',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.warrantyNumber,
      warrantyNumber: row.warrantyNumber,
      itemName: row.itemName,
      provider: row.provider,
      coverage: row.coverage,
      start: dateUS(row.startDate),
      end: dateUS(row.endDate),
      status: row.status,
      claimedAt: row.claimedAt ? new Date(row.claimedAt as string | Date).toISOString() : null,
      claimNotes: row.claimNotes ?? null,
      notes: row.notes ?? null,
    }),
  }),

  /* Notifications (BLK-004) — a per-tenant feed of job, appointment,
   * invoice and stock alerts. Writable through the generic router, the same
   * shape `equipmentWarranties` gets: a flat directory with no lines, no
   * derived money and one lifecycle move (unread -> read), so it needs no
   * bespoke router. Gated on `dashboard` — the module every operating role
   * already holds view on — because a notification is directory data about
   * a user's own tenant, not a privilege the way an accounting record is. */
  define({
    key: 'notifications',
    path: 'notifications',
    table: s.notifications,
    module: 'dashboard',
    entity: 'notification',
    search: ['title', 'message'],
    sortable: ['createdAt', 'severity', 'category', 'readAt'],
    filterable: ['category', 'severity'],
    defaultSort: { column: 'createdAt', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      category: row.category,
      severity: row.severity,
      title: row.title,
      message: row.message,
      link: row.link ?? null,
      read: row.readAt != null,
      readAt: row.readAt ? new Date(row.readAt as string | Date).toISOString() : null,
    }),
  }),

  /* ------------------------------------------- parts supply network (BLK-004)
   *
   * Four collections behind the eight parts-network screens that all rendered
   * an honest "no data source yet" shell. Gated on `network`, the module that
   * already expresses parts-network authority — `procurement`/`owner` hold the
   * full set, `parts` holds `vced`, `supplier` holds `vce`, and `technician`
   * holds nothing, so a technician can neither request nor order through the
   * network. No grant was widened for this feature.
   *
   * Members, requests and quotations are writable through the generic router:
   * flat rows, no line items, and lifecycle moves that are ordinary field
   * writes. Accepting a quotation is the one exception and has its own router
   * (`routes/parts-network.ts`), because it must reject the request's other
   * quotations, move the request to `ordered` and create the order atomically.
   *
   * Nothing here crosses the tenant boundary: every row is `org_id`-owned
   * under the same RLS as `equipment_warranties`. See
   * `drizzle/0024_parts_network.sql`.
   */
  define({
    key: 'partsNetworkMembers',
    path: 'parts-network/members',
    table: s.partsNetworkMembers,
    module: 'network',
    entity: 'parts_network_member',
    search: ['code', 'name', 'city', 'contactName'],
    sortable: ['code', 'name', 'kind', 'city', 'status', 'ratingTenths', 'createdAt'],
    filterable: ['kind', 'status'],
    defaultSort: { column: 'name', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      name: row.name,
      nameAr: row.nameAr ?? null,
      kind: row.kind,
      city: row.city ?? null,
      contactName: row.contactName ?? null,
      contactPhone: row.contactPhone ?? null,
      contactEmail: row.contactEmail ?? null,
      supplierId: row.supplierId ?? null,
      status: row.status,
      ratingTenths: row.ratingTenths ?? null,
      /* Null stays null — an unrated member shows no stars rather than a
       * fabricated zero. */
      rating: row.ratingTenths == null ? null : row.ratingTenths / 10,
      notes: row.notes ?? null,
    }),
  }),

  define({
    key: 'partsNetworkRequests',
    path: 'parts-network/requests',
    table: s.partsNetworkRequests,
    module: 'network',
    entity: 'parts_network_request',
    search: ['code', 'partName', 'partNumber', 'memberName', 'vehicleInfo'],
    sortable: ['code', 'partName', 'qty', 'urgency', 'status', 'neededBy', 'createdAt'],
    /* `direction` is filterable because it is how the Incoming view is served:
     * a filtered read over this one collection, not a second table. */
    filterable: ['direction', 'status', 'urgency', 'memberId'],
    defaultSort: { column: 'createdAt', dir: 'desc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      direction: row.direction,
      memberId: row.memberId ?? null,
      memberName: row.memberName ?? null,
      partSku: row.partSku ?? null,
      partName: row.partName,
      partNumber: row.partNumber ?? null,
      qty: count(row.qty),
      urgency: row.urgency,
      vehicleInfo: row.vehicleInfo ?? null,
      jobCode: row.jobCode ?? null,
      neededBy: row.neededBy ? dateUS(row.neededBy) : null,
      status: row.status,
      quotationCount: count(row.quotationCount),
      quotedAt: row.quotedAt ? new Date(row.quotedAt as string | Date).toISOString() : null,
      orderedAt: row.orderedAt ? new Date(row.orderedAt as string | Date).toISOString() : null,
      closedAt: row.closedAt ? new Date(row.closedAt as string | Date).toISOString() : null,
      notes: row.notes ?? null,
    }),
  }),

  define({
    key: 'partsNetworkQuotations',
    path: 'parts-network/quotations',
    table: s.partsNetworkQuotations,
    module: 'network',
    entity: 'parts_network_quotation',
    search: ['code', 'memberName'],
    sortable: ['code', 'memberName', 'unitPriceHalalas', 'leadTimeDays', 'status', 'createdAt'],
    filterable: ['requestId', 'status', 'condition', 'memberId'],
    defaultSort: { column: 'unitPriceHalalas', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      requestId: row.requestId,
      memberId: row.memberId ?? null,
      memberName: row.memberName,
      unitPriceHalalas: count(row.unitPriceHalalas),
      unitPrice: sarString(row.unitPriceHalalas),
      qtyAvailable: count(row.qtyAvailable),
      leadTimeDays: row.leadTimeDays ?? null,
      condition: row.condition,
      warrantyMonths: row.warrantyMonths ?? null,
      status: row.status,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt as string | Date).toISOString() : null,
      rejectedAt: row.rejectedAt ? new Date(row.rejectedAt as string | Date).toISOString() : null,
      notes: row.notes ?? null,
    }),
  }),

  define({
    key: 'partsNetworkOrders',
    path: 'parts-network/orders',
    table: s.partsNetworkOrders,
    module: 'network',
    entity: 'parts_network_order',
    search: ['code', 'memberName', 'partName', 'trackingRef'],
    sortable: ['code', 'memberName', 'partName', 'totalHalalas', 'status', 'expectedAt', 'createdAt'],
    filterable: ['direction', 'status', 'memberId', 'requestId'],
    defaultSort: { column: 'createdAt', dir: 'desc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      requestId: row.requestId ?? null,
      quotationId: row.quotationId ?? null,
      memberId: row.memberId ?? null,
      memberName: row.memberName,
      direction: row.direction,
      partName: row.partName,
      qty: count(row.qty),
      unitPriceHalalas: count(row.unitPriceHalalas),
      totalHalalas: count(row.totalHalalas),
      total: sarString(row.totalHalalas),
      status: row.status,
      trackingRef: row.trackingRef ?? null,
      expectedAt: row.expectedAt ? dateUS(row.expectedAt) : null,
      shippedAt: row.shippedAt ? new Date(row.shippedAt as string | Date).toISOString() : null,
      receivedAt: row.receivedAt ? new Date(row.receivedAt as string | Date).toISOString() : null,
      cancelledAt: row.cancelledAt ? new Date(row.cancelledAt as string | Date).toISOString() : null,
      notes: row.notes ?? null,
    }),
  }),

  /* ------------------------------------------------------------------- HR */
  define({
    /** Employees (vertical B) — staff who belong to a department (the existing
     *  `departments` collection) and a branch. Writable through the generic
     *  router; gated on `hr`, the dedicated HR module in the RBAC matrix (its
     *  viewers are owner, superadmin, manager, accountant and hr).
     *
     *  **Salary is sensitive.** `salaryHalalas` is presented under the exact key
     *  the `Employee salary` GLOBAL_REDACTIONS sweep nulls, and the formatted
     *  `salary` string is nulled by this collection's REDACTIONS entry, so a role
     *  the field rule hides pay from never receives either on the wire. (No
     *  role that passes the `hr` view-gate is itself in that hidden list, so on
     *  the live route this is defence in depth like F-005 — but the mechanism is
     *  proven by `tests/hr.test.ts` and fires the instant a hidden role reads a
     *  row, e.g. if employees are ever exposed under a broader module.) */
    key: 'employees',
    path: 'employees',
    table: s.employees,
    module: 'hr',
    entity: 'employee',
    search: ['employeeNumber', 'name', 'nameAr', 'title'],
    sortable: ['employeeNumber', 'name', 'status', 'hireDate', 'createdAt'],
    filterable: ['status', 'departmentId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'employeeNumber',
    writable: true,
    present: (row) => ({
      ...meta(row),
      employeeNumber: row.employeeNumber,
      name: row.name,
      nameAr: row.nameAr ?? '',
      title: row.title ?? '',
      departmentId: row.departmentId,
      hireDate: row.hireDate ? dateUS(row.hireDate) : '',
      status: row.status,
      salary: sarString(row.salaryHalalas),
      salaryHalalas: count(row.salaryHalalas),
    }),
  }),

  define({
    /** Payroll runs (vertical B) — one calendar month. Writable through the
     *  generic router for create/edit of a *draft*; the totals are frozen from
     *  the lines by the bespoke `POST /payroll/runs/:id/post` route, and a posted
     *  run cannot be reopened or edited (§5b, enforced in the payroll writer).
     *  Gated on `hr`. Pay figures carry both the formatted string and raw
     *  halalas; both are nulled for a role the `Employee salary` rule hides pay
     *  from (halalas by GLOBAL_REDACTIONS, strings by this collection's
     *  REDACTIONS entry). */
    key: 'payrollRuns',
    path: 'payroll/runs',
    table: s.payrollRuns,
    module: 'hr',
    entity: 'payroll_run',
    search: ['period', 'status'],
    sortable: ['period', 'status', 'netHalalas', 'createdAt'],
    filterable: ['status', 'period'],
    defaultSort: { column: 'period', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      period: row.period,
      status: row.status,
      grossPay: sarString(row.grossHalalas),
      grossPayHalalas: count(row.grossHalalas),
      allowances: sarString(row.allowancesHalalas),
      allowancesHalalas: count(row.allowancesHalalas),
      deductions: sarString(row.deductionsHalalas),
      deductionsHalalas: count(row.deductionsHalalas),
      netPay: sarString(row.netHalalas),
      netPayHalalas: count(row.netHalalas),
      postedAt: row.postedAt ? new Date(row.postedAt).toISOString() : null,
    }),
  }),

  define({
    /** Payroll lines (vertical B) — one employee's pay within a run. Writable
     *  through the generic router while the run is a draft (the writer refuses a
     *  line write against a posted run); the net is computed on the server as
     *  `gross + allowances − deductions`, never sent. Gated on `hr`. Pay figures
     *  are redacted exactly as the run's are. Filter by `payrollRunId`. */
    key: 'payrollLines',
    path: 'payroll/lines',
    table: s.payrollLines,
    module: 'hr',
    entity: 'payroll_line',
    search: ['employeeName'],
    sortable: ['employeeName', 'netHalalas', 'createdAt'],
    filterable: ['payrollRunId', 'employeeId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      payrollRunId: row.payrollRunId,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      grossPay: sarString(row.grossHalalas),
      grossPayHalalas: count(row.grossHalalas),
      allowances: sarString(row.allowancesHalalas),
      allowancesHalalas: count(row.allowancesHalalas),
      deductions: sarString(row.deductionsHalalas),
      deductionsHalalas: count(row.deductionsHalalas),
      netPay: sarString(row.netHalalas),
      netPayHalalas: count(row.netHalalas),
    }),
  }),

  define({
    /** Timesheets (vertical B) — a day's clock-in/out or worked minutes for one
     *  employee. Writable through the generic router; gated on `hr`. Worked
     *  minutes are an integer (no fractional-hour float); `hours` is the decimal
     *  presentation. Filter by `employeeId`. */
    key: 'timesheets',
    path: 'timesheets',
    table: s.timesheets,
    module: 'hr',
    entity: 'timesheet',
    search: ['employeeName'],
    sortable: ['workDate', 'employeeName', 'minutes', 'createdAt'],
    filterable: ['employeeId', 'status'],
    defaultSort: { column: 'workDate', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      workDate: dateUS(row.workDate),
      clockIn: row.clockIn ?? null,
      clockOut: row.clockOut ?? null,
      minutes: count(row.minutes),
      hours: Math.round((row.minutes / 60) * 100) / 100,
      status: row.status,
    }),
  }),

  define({
    /** Leave requests (vertical B) — a range of days an employee asks off.
     *  Writable through the generic router for submission; the approve/reject
     *  decision is the bespoke `routes/leave.ts` router, gated on the `hr` `a`
     *  grant and audited, with the approver recorded for segregation of duties.
     *  Gated on `hr`. Filter by `employeeId`. */
    key: 'leaveRequests',
    path: 'leave-requests',
    table: s.leaveRequests,
    module: 'hr',
    entity: 'leave_request',
    search: ['employeeName', 'type'],
    sortable: ['startDate', 'employeeName', 'status', 'createdAt'],
    filterable: ['employeeId', 'status', 'type'],
    defaultSort: { column: 'startDate', dir: 'desc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      type: row.type,
      startDate: dateUS(row.startDate),
      endDate: dateUS(row.endDate),
      days: count(row.days),
      status: row.status,
      reason: row.reason ?? null,
      approverId: row.approverId ?? null,
    }),
  }),

  /* Training courses (BLK-004) — the staff course catalogue `TrainingLMS.tsx`
   * rendered as a hardcoded array whose `enrolled` head counts and `completion`
   * percentages were invented, and whose KPIs were then computed from them.
   *
   * What is presented here is only what a course row records. There is no
   * `enrolled` and no `completion` field, deliberately: both are aggregates
   * over `trainingEnrolments`, and the screen counts the roster, so neither can
   * drift from it. `durationMinutes` is recorded, because how long a course
   * takes to sit is a property of the course and nothing in the roster knows it.
   *
   * Writable through the generic router under the existing `hr` module — a flat
   * catalogue whose only moves are publish and archive, so no bespoke router. */
  define({
    key: 'trainingCourses',
    path: 'training/courses',
    table: s.trainingCourses,
    module: 'hr',
    entity: 'training_course',
    search: ['code', 'title', 'titleAr'],
    sortable: ['code', 'title', 'category', 'durationMinutes', 'status', 'createdAt'],
    filterable: ['status', 'category'],
    defaultSort: { column: 'code', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      title: row.title,
      titleAr: row.titleAr ?? null,
      category: row.category,
      durationMinutes: count(row.durationMinutes),
      status: row.status,
      publishedAt: row.publishedAt ? new Date(row.publishedAt as string | Date).toISOString() : null,
      archivedAt: row.archivedAt ? new Date(row.archivedAt as string | Date).toISOString() : null,
      notes: row.notes ?? null,
    }),
  }),

  /* Training enrolments (BLK-004) — one row per (employee, course). This is the
   * collection a course's head count and completion rate are *counted from*:
   * `enrolled` is the rows naming a course (minus the withdrawn), and
   * `completion` is how many of those are `completed`. Because the aggregate is
   * computed from these rows, it cannot disagree with them.
   *
   * `employeeName` is echoed so a roster reads without a second request — the
   * denormalised shape `timesheets`, `leaveRequests` and `payrollLines` already
   * carry — and is written from the referenced employee rather than posted.
   * There is deliberately no `courseTitle`: the screen holds the catalogue it
   * groups by, so copying the title onto every enrolment would create a second
   * owner of the text and one more thing to go stale. Filter by `courseCode` or
   * `employeeId`. Gated on `hr`. */
  define({
    key: 'trainingEnrolments',
    path: 'training/enrolments',
    table: s.trainingEnrolments,
    module: 'hr',
    entity: 'training_enrolment',
    search: ['employeeName', 'courseCode'],
    sortable: ['employeeName', 'courseCode', 'status', 'completedAt', 'createdAt'],
    filterable: ['courseCode', 'employeeId', 'status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    writable: true,
    present: (row) => ({
      ...meta(row),
      courseCode: row.courseCode,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      status: row.status,
      completedAt: row.completedAt ? new Date(row.completedAt as string | Date).toISOString() : null,
      notes: row.notes ?? null,
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
    /** Per-device DTC readings (F-029) — the device↔dtc link an OBD re-scan or
     *  clear-codes command records. Read-only through the generic router (filter
     *  by `deviceId`); the writes are the command routes in `routes/obd.ts`,
     *  which are the ones that touch the external bridge. Gated on `jobcards`,
     *  the module the diagnostics surfaces live under. */
    key: 'obdReadings',
    path: 'diagnostics/readings',
    table: s.obdDtcReadings,
    module: 'jobcards',
    entity: 'obd_dtc_reading',
    search: ['dtcCode', 'description'],
    sortable: ['readAt', 'createdAt', 'severity'],
    filterable: ['deviceId', 'source', 'cleared', 'severity'],
    defaultSort: { column: 'readAt', dir: 'desc' },
    present: (row) => ({
      ...meta(row),
      deviceId: row.deviceId,
      deviceCode: row.deviceCode ?? '',
      dtc: row.dtcCode,
      desc: row.description ?? '',
      severity: row.severity ?? '',
      source: row.source,
      cleared: row.cleared,
      at: row.readAt ? new Date(row.readAt).toISOString() : null,
      mock: row.mock,
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

  /* --------------------------------------------------------- procurement (F-022)
   * Suppliers are a writable directory; requisitions and purchase orders are
   * read-only through the generic router — their line items, derived money and
   * lifecycle (submit / approve / raise / receive) live in the bespoke
   * `routes/procurement.ts`, like estimates and invoices. All three gate on the
   * `procurement` module and are RLS-scoped, so another tenant's rows 404. */
  define({
    key: 'suppliers',
    path: 'procurement/suppliers',
    table: s.suppliers,
    module: 'procurement',
    entity: 'supplier',
    search: ['code', 'name', 'nameAr', 'contactName'],
    sortable: ['code', 'name', 'status', 'createdAt'],
    filterable: ['status'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    writable: true,
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      name: row.name,
      nameAr: row.nameAr ?? null,
      contact: row.contactName ?? null,
      contactPhone: row.contactPhone ?? null,
      contactEmail: row.contactEmail ?? null,
      status: row.status,
    }),
  }),

  define({
    key: 'requisitions',
    path: 'procurement/requisitions',
    table: s.requisitions,
    module: 'procurement',
    entity: 'requisition',
    search: ['code', 'requesterName', 'department'],
    sortable: ['code', 'requesterName', 'estimatedTotalHalalas', 'status', 'neededBy', 'createdAt'],
    filterable: ['status', 'priority'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      requester: row.requesterName,
      department: row.department ?? null,
      priority: row.priority,
      status: row.status,
      neededBy: row.neededBy ? dateUS(row.neededBy) : null,
      amount: sarString(row.estimatedTotalHalalas),
      estimatedTotalHalalas: count(row.estimatedTotalHalalas),
      notes: row.notes ?? null,
      submittedBy: row.submittedBy ?? null,
      approvedBy: row.approvedBy ?? null,
    }),
  }),

  define({
    key: 'purchaseOrders',
    path: 'procurement/purchase-orders',
    table: s.purchaseOrders,
    module: 'procurement',
    entity: 'purchase_order',
    search: ['code', 'supplierName'],
    sortable: ['code', 'supplierName', 'totalHalalas', 'status', 'expectedAt', 'createdAt'],
    filterable: ['status', 'supplierId', 'requisitionId'],
    defaultSort: { column: 'createdAt', dir: 'asc' },
    codeColumn: 'code',
    present: (row) => ({
      ...meta(row),
      id: row.code,
      code: row.code,
      supplierId: row.supplierId ?? null,
      supplierName: row.supplierName,
      requisitionId: row.requisitionId ?? null,
      status: row.status,
      amount: sarString(row.totalHalalas),
      subtotalHalalas: count(row.subtotalHalalas),
      taxHalalas: count(row.taxHalalas),
      totalHalalas: count(row.totalHalalas),
      orderedAt: row.orderedAt ? new Date(row.orderedAt as Date).toISOString() : null,
      expectedAt: row.expectedAt ? new Date(row.expectedAt as Date).toISOString() : null,
      submittedBy: row.submittedBy ?? null,
      approvedBy: row.approvedBy ?? null,
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
  /* Salary and pay (vertical B). The raw `*Halalas` keys are already swept by
   * `GLOBAL_REDACTIONS` for the `Employee salary` rule; these entries add the
   * *formatted* strings the presenter emits beside them, so a role the rule
   * hides pay from receives neither the number nor `"SAR 8,500"` on the wire —
   * redacting one without the other would leak the value in the string. */
  employees: [{ ruleField: 'Employee salary', rowKeys: ['salary'] }],
  payrollRuns: [
    { ruleField: 'Employee salary', rowKeys: ['grossPay', 'allowances', 'deductions', 'netPay'] },
  ],
  payrollLines: [
    { ruleField: 'Employee salary', rowKeys: ['grossPay', 'allowances', 'deductions', 'netPay'] },
  ],
  /* DVHC (Sprint 2, P0). RLS's `r_self` narrows `inspection_findings` to a
   * customer's own job card — they are meant to read their own vehicle's
   * findings — but `internal_note` is the technician's shop-only note, not
   * theirs to see. Row visibility and column visibility are answering
   * different questions here, same as `customers`' phone/email above. */
  inspectionFindings: [{ ruleField: 'Inspection internal notes', rowKeys: ['internalNote'] }],
}
