/** The seam between screens and their data.
 *
 *  Screens never import the mock tables directly — they go through a
 *  `Repository`. Swapping the fixtures for the REST API in `API_ENDPOINTS.md`
 *  is then a matter of setting `VITE_API_URL`, and no screen has to move. That
 *  is the whole point of this file: the shape below is the contract, and both
 *  implementations satisfy it.
 *
 *  Money crossing this boundary is already formatted by the server. A row also
 *  carries the underlying halalas (`totalHalalas`, `amountHalalas`, …) for the
 *  rare case a screen needs to compare two amounts — but a total a screen
 *  computes is a display convenience, never a value the server will accept
 *  back.
 */
import * as T from './generated/tables'

/* ------------------------------------------------------------------- types */

/** The standard list query from `API_ENDPOINTS.md`. */
export interface Query {
  page?: number
  pageSize?: number
  /** `field` or `field:asc` / `field:desc`. */
  sort?: string
  /** Free-text search across the collection's searchable columns. */
  q?: string
  filter?: Record<string, string | number | boolean>
  includeDeleted?: boolean
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** The pagination envelope every list endpoint returns. */
export interface Paged<TRow> {
  rows: readonly TRow[]
  page: PageMeta
}

/** Server-assigned fields present on every row the API returns. The mock rows
 *  do not carry them, which is why they are optional here rather than
 *  required — a screen must not depend on one existing. */
export interface EntityMeta {
  _id?: string
  _version?: number
  _createdAt?: string
  _updatedAt?: string
}

export interface MutationOptions {
  /** The row version the caller read. A mismatch is a 409, not an overwrite. */
  version?: number
  /** Replay protection for anything that moves money or stock. */
  idempotencyKey?: string
  /** Recorded in the audit trail beside the change. */
  reason?: string
}

export type RepositoryErrorCode =
  | 'bad_request'
  | 'validation_failed'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'version_conflict'
  | 'idempotency_conflict'
  | 'rule_violated'
  | 'approval_required'
  | 'rate_limited'
  /** An integration exists as an adapter but has no credentials configured
   *  (the OBD bridge, SMS/WhatsApp, SSO/WebAuthn) — the server's real code,
   *  mirrored from `packages/contract`'s `ErrorCode`. Screens already branch
   *  on `error.status === 503` for this (workshop/api.ts's
   *  `isExternalDependency`); naming the code here just lets that check stop
   *  casting `error.code as string` to compare against a literal outside the
   *  union. */
  | 'external_dependency_unavailable'
  | 'internal'
  | 'network'
  | 'unsupported'

/** A failure a screen can act on: `version_conflict` prompts a reload,
 *  `approval_required` names the ceiling, `forbidden` is final. */
export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode
  readonly field?: string
  readonly status?: number
  readonly requestId?: string

  constructor(
    code: RepositoryErrorCode,
    message: string,
    options: { field?: string; status?: number; requestId?: string } = {},
  ) {
    super(message)
    this.name = 'RepositoryError'
    this.code = code
    this.field = options.field
    this.status = options.status
    this.requestId = options.requestId
  }
}

export function isVersionConflict(error: unknown): boolean {
  return error instanceof RepositoryError && error.code === 'version_conflict'
}

/** A collection of rows. Reads are implemented by both repositories; writes
 *  need a server, and the mock refuses them rather than pretending. */
export interface Collection<TRow> {
  list(query?: Query): Promise<Paged<TRow>>
  get(id: string): Promise<TRow>
  create(input: Partial<TRow>, options?: MutationOptions): Promise<TRow>
  update(id: string, patch: Partial<TRow>, options?: MutationOptions): Promise<TRow>
  delete(id: string): Promise<void>
  bulkCreate(inputs: readonly Partial<TRow>[]): Promise<TRow[]>
  bulkUpdate(ids: readonly string[], patch: Partial<TRow>): Promise<TRow[]>
  bulkDelete(ids: readonly string[]): Promise<void>
}

/** A branch of the organization, as `GET /branches` presents it. There is no
 *  design fixture for branches — the bundle never listed them — so the shape
 *  is declared here rather than inferred from `generated/tables.ts`. The
 *  collection is read-only on the server; it exists so a transfer destination
 *  can be picked from a directory instead of typed as a raw ULID (F-017). */
export interface BranchRow extends EntityMeta {
  name: string
  nameAr: string
  city: string
  isMain: boolean
}

/** Customer feedback, as `GET /customer-feedback` presents it (F-027). The
 *  design bundle carries no feedback fixture — the capture form was write-only
 *  in the prototype — so the shape is declared here rather than inferred from
 *  `generated/tables.ts`, like `BranchRow`. */
export interface FeedbackRow extends EntityMeta {
  rating: number
  comment: string
  customer: string
  jobCardId: string | null
  customerId: string | null
}

/** A bank statement line, as `GET /bank-statements` presents it (F-028). The
 *  design bundle carries no bank-statement fixture — the reconciliation screen
 *  was gapped in the prototype — so the shape is declared here rather than
 *  inferred from `generated/tables.ts`, like `BranchRow`. Read-only through the
 *  collection; the reconciling write is `POST /bank-statements/:id/match`. */
/** A declined job, as `GET /declined-jobs` presents it (Sprint 1, P0). No
 *  design fixture — the capability is new — so the shape is declared here
 *  rather than inferred, like `BankStatementRow`. Read-only through the
 *  collection except for the follow-up lifecycle (`status`, `followUpDate`,
 *  `followUpNotes`), which the server accepts on `PATCH`; every other field,
 *  including creation itself, is server-owned and only ever set by
 *  `POST /estimates/:id/lines/:lineId/decline` or a whole-estimate reject. */
export interface DeclinedJobRow extends EntityMeta {
  estimateId: string
  estimateLineId: string | null
  jobCardId: string | null
  customer: string
  vehicle: string
  advisorId: string | null
  description: string
  reasonCategory: 'cost' | 'timing' | 'second_opinion' | 'not_urgent' | 'trust' | 'other'
  reasonNotes: string | null
  safetySeverity: 'monitor' | 'attention' | 'urgent' | 'unsafe'
  value: string
  valueHalalas: number
  status:
    | 'declined'
    | 'follow_up_scheduled'
    | 'contacted'
    | 'reconsidering'
    | 'approved_later'
    | 'permanently_declined'
    | 'expired'
  followUpDate: string | null
  followUpNotes: string | null
  declinedAt: string | null
  resolvedAt: string | null
}

/** One overlay drawn on a piece of DVHC evidence, in the media's own 0–1
 *  fractional coordinates. Mirrors `packages/contract/src/entities/inspection.ts`'s
 *  `inspectionAnnotation`. */
export interface InspectionAnnotation {
  type: 'arrow' | 'box' | 'text'
  x: number
  y: number
  x2?: number
  y2?: number
  text?: string
  color: 'blue' | 'orange'
}

/** A DVHC inspection finding, as `GET /inspection-findings` presents it
 *  (Sprint 2, P0). No design fixture — the capability is new — so the shape is
 *  declared here rather than inferred, like `DeclinedJobRow`. Read-only
 *  through the collection except for `PATCH` (severity, notes, the estimate
 *  line link); creation is only ever `POST /job-cards/:id/inspection-findings`
 *  (`screens/workshop/inspection-api.ts`), never this collection's `POST`. */
export interface InspectionFindingRow extends EntityMeta {
  jobCardId: string
  category: string
  categoryAr: string | null
  item: string
  itemAr: string | null
  severity: 'ok' | 'monitor' | 'attention' | 'urgent' | 'unsafe'
  /** Shop-only. Server-redacted to `null` for a customer-scoped principal —
   *  see `server/src/registry.ts`'s `REDACTIONS` — so this can genuinely be
   *  `null` here even on a row the caller may otherwise fully read. */
  internalNote: string | null
  customerNote: string | null
  estimateLineId: string | null
  recordedBy: string | null
}

/** The photo/video evidence attached to a finding, as `GET /inspection-media`
 *  presents it. `url` is the only way to reach the bytes — never a storage
 *  path — and works the same way whether the row came from this collection or
 *  from a health-check report. Read-only except for `PATCH` (`annotations`);
 *  creation is only ever the multipart `POST /inspection-findings/:id/media`. */
export interface InspectionMediaRow extends EntityMeta {
  findingId: string
  jobCardId: string
  kind: 'photo' | 'video'
  stage: 'before' | 'after'
  mimeType: string
  sizeBytes: number
  annotations: InspectionAnnotation[]
  uploadedBy: string | null
  url: string
}

/** The six items `WorkshopDelivery.tsx`'s checklist walks. Mirrors
 *  `packages/contract/src/entities/deliverySignoff.ts`'s
 *  `deliverySignoffChecklist`. */
export interface DeliverySignoffChecklist {
  customerNotified: boolean
  keysReturned: boolean
  documentsReady: boolean
  invoiceAttached: boolean
  cleaned: boolean
  qualityCheck: boolean
}

/** Customer sign-off at delivery, as `GET /delivery-signoffs` presents it
 *  (Sprint 2, P0). No design fixture — the capability is new — so the shape
 *  is declared here rather than inferred, like `InspectionFindingRow`.
 *  Read-only through the collection except for `PATCH` (checklist,
 *  odometer); creation is only ever the multipart
 *  `POST /job-cards/:id/delivery-signoff` (`screens/workshop/delivery-api.ts`),
 *  never this collection's `POST`. */
export interface DeliverySignoffRow extends EntityMeta {
  jobCardId: string
  signedByName: string
  agreedAt: string
  checklist: DeliverySignoffChecklist
  odometerOut: number | null
  mimeType: string
  sizeBytes: number
  /** `GET /delivery-signoffs/:id/signature` — the only way to reach the
   *  signature image's bytes, never a storage path. */
  url: string
}

/** A canned job — a predefined, priced service package (build-order item
 *  5), as `GET /canned-jobs` presents it. No design fixture — the capability
 *  is new — so the shape is declared here rather than inferred, like
 *  `DeclinedJobRow`. Read-only through the collection except for `PATCH`;
 *  creation is only ever `POST /canned-jobs`
 *  (`screens/workshop/canned-job-api.ts`), never this collection's `POST`. */
export interface CannedJobRow extends EntityMeta {
  name: string
  nameAr: string | null
  category: string | null
  description: string | null
  active: boolean
  priceHalalas: number
  lineCount: number
}

/** An equipment warranty — cover on the shop's own tools and fixed assets
 *  (a lift, a scanner, a paint booth), never a customer's vehicle (BLK-004),
 *  as `GET /equipment-warranties` presents it. No design fixture — the shape
 *  is declared here rather than inferred, like `CannedJobRow`. Writable
 *  through the generic collection: create, edit, delete and the one
 *  lifecycle move (`active` → `claimed`) are all a plain `POST`/`PATCH`/
 *  `DELETE` on this same collection, unlike `cannedJobs`, which needs a
 *  bespoke route. */
export interface EquipmentWarrantyRow extends EntityMeta {
  warrantyNumber: string
  itemName: string
  provider: string
  coverage: 'full' | 'limited' | 'extended'
  start: string
  end: string
  status: 'active' | 'claimed' | 'expired'
  claimedAt: string | null
  claimNotes: string | null
  notes: string | null
}

/** A notification — a job, appointment, invoice or stock alert on the
 *  tenant's own feed (BLK-004), as `GET /notifications` presents it. No
 *  design fixture — the shape is declared here rather than inferred, like
 *  `EquipmentWarrantyRow`. Writable through the generic collection: create,
 *  edit, delete and the one lifecycle move (unread → read) are all a plain
 *  `POST`/`PATCH`/`DELETE` on this same collection. */
export interface NotificationRow extends EntityMeta {
  category: 'job' | 'appointment' | 'invoice' | 'stock' | 'system'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  link: string | null
  read: boolean
  readAt: string | null
}

/* ------------------------------------------- parts supply network (BLK-004)
 *
 * The four collections behind the eight parts-network screens, which all
 * rendered an honest "no data source yet" shell. No design fixture — the
 * shapes are declared here rather than inferred, like `NotificationRow`.
 *
 * Nothing in this domain crosses the tenant boundary: every row belongs to one
 * organization, and a `memberId` names a counterparty in *this* tenant's own
 * directory, never a foreign org. `direction` is what makes that honest — an
 * `incoming` request is one this workshop recorded as sent to it. See
 * `server/drizzle/0024_parts_network.sql`. */

/** A participant this workshop trades parts with. `supplierId` points at the
 *  matching `suppliers` row when the member is also a vendor of record, rather
 *  than duplicating the vendor concept. */
export interface PartsNetworkMemberRow extends EntityMeta {
  id: string
  code: string
  name: string
  nameAr: string | null
  kind: 'garage' | 'dealer' | 'store' | 'supplier'
  city: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  supplierId: string | null
  status: 'active' | 'pending' | 'suspended'
  ratingTenths: number | null
  /** `46` presented as `4.6`; null when unrated, never a fabricated default. */
  rating: number | null
  notes: string | null
}

/** A part request. `outgoing` went out to the network, `incoming` came in from
 *  a member — the Incoming view is a filtered read over this one collection,
 *  not a second table. `quotationCount` and every `*At` are server-maintained. */
export interface PartsNetworkRequestRow extends EntityMeta {
  id: string
  code: string
  direction: 'outgoing' | 'incoming'
  memberId: string | null
  memberName: string | null
  partSku: string | null
  partName: string
  partNumber: string | null
  qty: number
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  vehicleInfo: string | null
  jobCode: string | null
  neededBy: string | null
  status: 'open' | 'quoted' | 'ordered' | 'closed' | 'cancelled'
  quotationCount: number
  quotedAt: string | null
  orderedAt: string | null
  closedAt: string | null
  notes: string | null
}

/** A member's offer against a request. `accepted` is unreachable through the
 *  generic `PATCH` — accepting also rejects the siblings and raises the order,
 *  so it goes through `partsNetwork.acceptQuotation` (live only). */
export interface PartsNetworkQuotationRow extends EntityMeta {
  id: string
  code: string
  requestId: string
  memberId: string | null
  memberName: string
  unitPriceHalalas: number
  unitPrice: string
  qtyAvailable: number
  leadTimeDays: number | null
  condition: 'new' | 'used' | 'oem' | 'aftermarket'
  warrantyMonths: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  acceptedAt: string | null
  rejectedAt: string | null
  notes: string | null
}

/** An accepted quotation, become an order. `outbound` is one this workshop
 *  placed, `inbound` one it is fulfilling; the total is computed server-side. */
export interface PartsNetworkOrderRow extends EntityMeta {
  id: string
  code: string
  requestId: string | null
  quotationId: string | null
  memberId: string | null
  memberName: string
  direction: 'outbound' | 'inbound'
  partName: string
  qty: number
  unitPriceHalalas: number
  totalHalalas: number
  total: string
  status: 'placed' | 'shipped' | 'received' | 'cancelled'
  trackingRef: string | null
  expectedAt: string | null
  shippedAt: string | null
  receivedAt: string | null
  cancelledAt: string | null
  notes: string | null
}

export interface BankStatementRow extends EntityMeta {
  date: string
  description: string
  reference: string
  account: string
  amount: string
  amountHalalas: number
  direction: 'credit' | 'debit'
  matched: boolean
  matchedReceiptId: string | null
}

/** A per-device DTC reading, as `GET /diagnostics/readings` presents it
 *  (F-029). No design fixture — the device↔dtc link is new — so the shape is
 *  declared here, like `BranchRow`. Read-only through the collection; the writes
 *  are the OBD command routes, which touch the external bridge. `mock` is true
 *  when the reading came from the mock bridge rather than a live scan. */
export interface ObdReadingRow extends EntityMeta {
  deviceId: string
  deviceCode: string
  dtc: string
  desc: string
  severity: string
  source: string
  cleared: boolean
  at: string | null
  mock: boolean
}

/** A saved report definition, as `GET /saved-reports` presents it (F-028). No
 *  design fixture — the builder could not persist in the prototype — so the
 *  shape is declared here. Writable through the collection. */
export interface SavedReportRow extends EntityMeta {
  name: string
  source: string
  owner: string
  definition: Record<string, unknown>
}

/** An insurance policy, as `GET /insurance-policies` presents it (vertical A).
 *  No design fixture — the financial-products surfaces were mock in the
 *  prototype — so the shape is declared here, like `BranchRow`. Read-only through
 *  the collection. Money crosses formatted, with the raw halalas beside it. */
export interface InsurancePolicyRow extends EntityMeta {
  policyNumber: string
  insurer: string
  type: 'comprehensive' | 'third_party' | 'own_damage'
  holder: string
  customerId: string | null
  vehicleId: string | null
  vehicleLabel: string
  premium: string
  premiumHalalas: number
  coverage: string
  coverageHalalas: number
  start: string
  end: string
  status: 'active' | 'expired' | 'cancelled'
}

/** An insurance claim, as `GET /insurance-claims` presents it (vertical A). No
 *  design fixture, so declared here. Read-only through the collection; the
 *  lifecycle (submit/approve/reject/pay) is the bespoke `insuranceClaims` API
 *  below. `amountApproved` is null until the claim is approved. */
export interface InsuranceClaimRow extends EntityMeta {
  claimNumber: string
  policyId: string | null
  policyNumber: string
  vehicleId: string | null
  vehicleLabel: string
  jobCardId: string | null
  amountClaimed: string
  amountClaimedHalalas: number
  amountApproved: string | null
  amountApprovedHalalas: number | null
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid'
  incidentDate: string
  description: string
  submittedBy: string | null
  approvedBy: string | null
}

/** An auto-loan contract, as `GET /loan-contracts` presents it (vertical A). No
 *  design fixture, so declared here. Read-only; the monthly instalment is the
 *  amortised figure the server computes at origination. */
export interface LoanContractRow extends EntityMeta {
  contractNumber: string
  borrower: string
  customerId: string | null
  principal: string
  principalHalalas: number
  rateBps: number
  termMonths: number
  start: string
  status: 'active' | 'settled' | 'defaulted' | 'cancelled'
  monthlyInstalment: string
  monthlyInstalmentHalalas: number
}

/** A loan repayment, as `GET /loan-repayments` presents it (vertical A). No
 *  design fixture, so declared here. Read-only; the schedule's amounts sum to
 *  principal + interest across the contract. */
export interface LoanRepaymentRow extends EntityMeta {
  contractId: string | null
  contractNumber: string
  sequence: number
  dueDate: string
  amountDue: string
  amountDueHalalas: number
  amountPaid: string
  amountPaidHalalas: number
  paidDate: string | null
  status: 'due' | 'paid' | 'overdue'
}

/** An employee, as `GET /employees` presents it (vertical B). No design fixture,
 *  so declared here. **Salary is sensitive**: both `salary` and `salaryHalalas`
 *  arrive null for a role the `Employee salary` field rule hides pay from, so
 *  each is nullable. Writable through the collection; gated on `hr`. */
export interface EmployeeRow extends EntityMeta {
  employeeNumber: string
  name: string
  nameAr: string
  title: string
  departmentId: string | null
  hireDate: string
  status: 'active' | 'on_leave' | 'terminated'
  salary: string | null
  salaryHalalas: number | null
}

/** A payroll run, as `GET /payroll/runs` presents it (vertical B). The totals
 *  are frozen from the lines when the run is posted (`POST /payroll/runs/:id/
 *  post`); a posted run cannot be reopened or edited. Pay figures arrive null
 *  for a role the salary rule hides pay from. */
export interface PayrollRunRow extends EntityMeta {
  period: string
  status: 'draft' | 'posted'
  grossPay: string | null
  grossPayHalalas: number | null
  allowances: string | null
  allowancesHalalas: number | null
  deductions: string | null
  deductionsHalalas: number | null
  netPay: string | null
  netPayHalalas: number | null
  postedAt: string | null
}

/** A payroll line, as `GET /payroll/lines` presents it (vertical B). The net is
 *  computed on the server as gross + allowances − deductions. Pay figures are
 *  redacted exactly as the run's are. */
export interface PayrollLineRow extends EntityMeta {
  payrollRunId: string
  employeeId: string
  employeeName: string
  grossPay: string | null
  grossPayHalalas: number | null
  allowances: string | null
  allowancesHalalas: number | null
  deductions: string | null
  deductionsHalalas: number | null
  netPay: string | null
  netPayHalalas: number | null
}

/** A timesheet, as `GET /timesheets` presents it (vertical B). Worked minutes
 *  are the stored integer; `hours` is the decimal presentation. */
export interface TimesheetRow extends EntityMeta {
  employeeId: string
  employeeName: string
  workDate: string
  clockIn: string | null
  clockOut: string | null
  minutes: number
  hours: number
  status: 'submitted' | 'approved' | 'rejected'
}

/** A leave request, as `GET /leave-requests` presents it (vertical B). The
 *  approve/reject decision is the bespoke leave-request API; the approver is
 *  recorded for segregation of duties. */
export interface LeaveRequestRow extends EntityMeta {
  employeeId: string
  employeeName: string
  type: 'annual' | 'sick' | 'unpaid' | 'other'
  startDate: string
  endDate: string
  days: number
  status: 'submitted' | 'approved' | 'rejected'
  reason: string | null
  approverId: string | null
}

/** A training course, as `GET /training/courses` presents it (BLK-004). No
 *  design fixture, so the shape is declared here like `EmployeeRow`.
 *
 *  Note what is absent: no `enrolled` and no `completion`. Those are aggregates
 *  over `trainingEnrolments`, not properties of a course, and
 *  `screens/hr/TrainingLMS.tsx` counts the roster for them — so neither can
 *  drift from the enrolments it describes. `durationMinutes` is the one recorded
 *  number, and correctly so: how long a course takes to sit is a property of the
 *  course, and no roster knows it.
 *
 *  Writable through the generic collection: publishing and archiving are plain
 *  `PATCH`es, and `publishedAt`/`archivedAt` are derived server-side from the
 *  status transition rather than accepted as input. */
export interface TrainingCourseRow extends EntityMeta {
  /** The catalogue code, `TRN-0001` — the id the detail route accepts. */
  id: string
  code: string
  title: string
  titleAr: string | null
  category: 'safety' | 'technical' | 'customer_service' | 'compliance'
  durationMinutes: number
  status: 'draft' | 'active' | 'archived'
  publishedAt: string | null
  archivedAt: string | null
  notes: string | null
}

/** One employee's enrolment on one course, as `GET /training/enrolments`
 *  presents it (BLK-004). This is the collection a course's head count and
 *  completion percentage are *counted from*: `enrolled` is the rows naming a
 *  course minus the withdrawn ones, and completion is how many of those are
 *  `completed`.
 *
 *  `withdrawn` is a state rather than a deletion — somebody who started and
 *  stopped is a fact about the course — and is excluded from both the count and
 *  the completion denominator. `completedAt` is derived from the status
 *  transition server-side, never posted. */
export interface TrainingEnrolmentRow extends EntityMeta {
  courseCode: string
  employeeId: string
  employeeName: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'withdrawn'
  completedAt: string | null
  notes: string | null
}

/** A supplier, as `GET /procurement/suppliers` presents it (F-022). No design
 *  fixture — the parts network carried only free-text supplier names — so the
 *  shape is declared here, like `BranchRow`. Writable through the collection;
 *  gated on `procurement`. */
export interface SupplierRow extends EntityMeta {
  id: string
  code: string
  name: string
  nameAr: string | null
  contact: string | null
  contactPhone: string | null
  contactEmail: string | null
  status: 'active' | 'inactive'
}

/** A requisition, as `GET /procurement/requisitions` presents it (F-022). No
 *  design fixture, so declared here. Read-only through the collection; the
 *  lifecycle (create/submit/approve/reject) is the bespoke `procurement` API
 *  below. The estimated total is summed from the lines by the server. */
export interface RequisitionRow extends EntityMeta {
  id: string
  code: string
  requester: string
  department: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'ordered'
  neededBy: string | null
  amount: string
  estimatedTotalHalalas: number
  notes: string | null
  submittedBy: string | null
  approvedBy: string | null
}

/** A purchase order, as `GET /procurement/purchase-orders` presents it (F-022).
 *  No design fixture, so declared here. Read-only through the collection; the
 *  lifecycle (raise/approve/receive) is the bespoke `procurement` API below. The
 *  total is the server's subtotal + VAT of the lines, never client-computed. */
export interface PurchaseOrderRow extends EntityMeta {
  id: string
  code: string
  supplierId: string | null
  supplierName: string
  requisitionId: string | null
  status: 'draft' | 'approved' | 'sent' | 'receiving' | 'received' | 'closed'
  amount: string
  subtotalHalalas: number
  taxHalalas: number
  totalHalalas: number
  orderedAt: string | null
  expectedAt: string | null
  submittedBy: string | null
  approvedBy: string | null
}

/** A purchase-order line, as `GET /procurement/purchase-orders/:id/lines`
 *  presents it (F-022). `receivedQty` is the running total the receiving route
 *  maintains under `received ≤ ordered`. */
export interface PurchaseOrderLineRow {
  _id: string
  partSku: string | null
  description: string
  descriptionAr: string | null
  qty: number
  receivedQty: number
  unitPriceHalalas: number
  lineTotalHalalas: number
  sort: number
}

/** A requisition line, as `GET /procurement/requisitions/:id/lines` presents it
 *  (F-022). The estimated unit price is the budget figure at request time. */
export interface RequisitionLineRow {
  _id: string
  partSku: string | null
  description: string
  descriptionAr: string | null
  qty: number
  estUnitPriceHalalas: number
  sort: number
}

/** A fixture-backed collection's row: the design shape (`generated/tables.ts`,
 *  literally the JSON the `.dc.html` prototypes carried) plus the entity
 *  metadata every real record has. `EntityMeta`'s fields are optional, same as
 *  `BranchRow`/`FeedbackRow`/every other hand-declared row below, because the
 *  mock's seed rows do not carry them either — only `create`/`update` mint one
 *  (F-020: this used to be missing project-wide, so most screens re-declared
 *  `& { _id?: string }` themselves, one guess per file). */
type WithMeta<TRow> = TRow & EntityMeta

/** Columns `GET /vehicles` serves that the design fixture never carried
 *  (F-020) — every screen reading vehicles used to widen `RowOf<'vehicles'>`
 *  with its own copy of this. */
export type VehicleRow = WithMeta<(typeof T.VEHICLES)[number]> & {
  vin?: string | null
  mileageKm?: number
  customerId?: string | null
}

/** Columns `GET /customers` serves that the design fixture never carried
 *  (F-020), same story as `VehicleRow`. `totalSpentHalalas` is the halalas
 *  figure `spent` is formatted from — see `customerRow` in
 *  `packages/contract`. */
export type CustomerRow = WithMeta<(typeof T.CUSTOMERS)[number]> & {
  email?: string | null
  type?: 'individual' | 'fleet'
  totalSpentHalalas?: number
}

/** `costHalalas` is redacted (null) for a role the margin field rule hides it
 *  from, and every column here is absent entirely from the design fixture
 *  either way (F-020) — `Inventory.tsx` and `ProcurementPurchaseOrder.tsx`
 *  each re-declared this same set by hand as a local `PartExtras`. */
export type PartRow = WithMeta<(typeof T.PARTS)[number]> & {
  reserved?: number
  available?: number
  priceHalalas?: number
  costHalalas?: number | null
  backorderable?: boolean
  /** The `warehouseZones.code` this part is racked in, or null when it has not
   *  been put away yet (BLK-004). This is the field `InternalWarehouse.tsx`
   *  groups on, which is what makes each zone's item count and utilisation
   *  *derived* from the stock rather than a number typed onto the zone. Unlike
   *  the other extras here it is present in the fixture build too (see
   *  `PART_ZONE_CODES`), because Golden Path 7 asserts a real per-zone
   *  utilisation with no API at all. */
  zoneCode?: string | null
}

/** A warehouse zone — a bay, rack or bin stock is put away in (BLK-004), as
 *  `GET /warehouse-zones` presents it. No design fixture; the shape is
 *  declared here rather than inferred, like `EquipmentWarrantyRow`.
 *
 *  Note what is absent: no `itemCount`, no `utilization`. Those are facts about
 *  stock, not about the bay, and `screens/inventory/InternalWarehouse.tsx`
 *  derives them by grouping `parts` on `zoneCode`, so they cannot drift from
 *  the inventory they describe. `capacityUnits` is the one recorded number, and
 *  correctly so: how many units a bay holds is a property of the bay.
 *
 *  Writable through the generic collection: the lifecycle move a bay makes
 *  (`active` ⇄ `maintenance`) is a plain `PATCH`, and `maintenanceSince` is
 *  derived server-side from that transition rather than accepted as input. */
export interface WarehouseZoneRow extends EntityMeta {
  id: string
  code: string
  name: string
  nameAr: string | null
  kind: 'storage' | 'receiving' | 'shipping' | 'cold' | 'hazmat'
  capacityUnits: number
  status: 'active' | 'maintenance' | 'closed'
  maintenanceSince: string | null
  notes: string | null
}

/** `scheduledDate`/`startMinute` are the machine values `timeLabel` is
 *  rendered from; the design fixture carries only the label (F-020). */
export type AppointmentRow = WithMeta<(typeof T.APPOINTMENTS)[number]> & {
  scheduledDate?: string | null
  startMinute?: number
}

/** The VAT breakdown and document chain `GET /invoices` serves beside the
 *  design's `amount`/`due` strings (F-029, F-020). */
export type InvoiceRow = WithMeta<(typeof T.INVOICES)[number]> & {
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
  jobCardId?: string | null
  estimateId?: string | null
}

/** The VAT breakdown and approval chain `GET /estimates` serves beside the
 *  design's `amount` string (F-029, F-020). */
export type EstimateRow = WithMeta<(typeof T.ESTIMATES)[number]> & {
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  totalHalalas?: number
  jobCardId?: string | null
  submittedBy?: string | null
  approvedBy?: string | null
}

export interface Repository {
  branches: Collection<BranchRow>
  vehicles: Collection<VehicleRow>
  invoices: Collection<InvoiceRow>
  invoiceLines: Collection<WithMeta<(typeof T.INVOICE_LINES)[number]>>
  invoicePayments: Collection<WithMeta<(typeof T.INVOICE_PAYMENTS)[number]>>
  jobs: Collection<WithMeta<(typeof T.JOBS)[number]>>
  appointments: Collection<AppointmentRow>
  estimates: Collection<EstimateRow>
  declinedJobs: Collection<DeclinedJobRow>
  inspectionFindings: Collection<InspectionFindingRow>
  inspectionMedia: Collection<InspectionMediaRow>
  deliverySignoffs: Collection<DeliverySignoffRow>
  cannedJobs: Collection<CannedJobRow>
  customers: Collection<CustomerRow>
  fleets: Collection<WithMeta<(typeof T.FLEETS)[number]>>
  parts: Collection<PartRow>
  warehouseZones: Collection<WarehouseZoneRow>
  technicians: Collection<WithMeta<(typeof T.TECHS)[number]>>
  services: Collection<WithMeta<(typeof T.SERVICES)[number]>>
  leads: Collection<WithMeta<(typeof T.LEADS)[number]>>
  opportunities: Collection<WithMeta<(typeof T.OPPORTUNITIES)[number]>>
  campaigns: Collection<WithMeta<(typeof T.CAMPAIGNS)[number]>>
  segments: Collection<WithMeta<(typeof T.SEGMENTS)[number]>>
  crmTasks: Collection<WithMeta<(typeof T.CRM_TASKS)[number]>>
  feedback: Collection<FeedbackRow>
  chartOfAccounts: Collection<WithMeta<(typeof T.ACCOUNTS_COA)[number]>>
  journalEntries: Collection<WithMeta<(typeof T.JOURNAL_ENTRIES)[number]>>
  expenses: Collection<WithMeta<(typeof T.EXPENSES_DATA)[number]>>
  bankStatements: Collection<BankStatementRow>
  savedReports: Collection<SavedReportRow>
  insurancePolicies: Collection<InsurancePolicyRow>
  insuranceClaims: Collection<InsuranceClaimRow>
  loanContracts: Collection<LoanContractRow>
  loanRepayments: Collection<LoanRepaymentRow>
  employees: Collection<EmployeeRow>
  payrollRuns: Collection<PayrollRunRow>
  payrollLines: Collection<PayrollLineRow>
  timesheets: Collection<TimesheetRow>
  leaveRequests: Collection<LeaveRequestRow>
  trainingCourses: Collection<TrainingCourseRow>
  trainingEnrolments: Collection<TrainingEnrolmentRow>
  suppliers: Collection<SupplierRow>
  requisitions: Collection<RequisitionRow>
  purchaseOrders: Collection<PurchaseOrderRow>
  equipmentWarranties: Collection<EquipmentWarrantyRow>
  notifications: Collection<NotificationRow>
  partsNetworkMembers: Collection<PartsNetworkMemberRow>
  partsNetworkRequests: Collection<PartsNetworkRequestRow>
  partsNetworkQuotations: Collection<PartsNetworkQuotationRow>
  partsNetworkOrders: Collection<PartsNetworkOrderRow>
  receipts: Collection<WithMeta<(typeof T.RECEIPTS)[number]>>
  departments: Collection<WithMeta<(typeof T.DEPARTMENTS)[number]>>
  aiAgents: Collection<WithMeta<(typeof T.AI_AGENTS)[number]>>
  conversations: Collection<WithMeta<(typeof T.CONVERSATIONS)[number]>>
  obdDevices: Collection<WithMeta<(typeof T.OBD_DEVICES)[number]>>
  obdReadings: Collection<ObdReadingRow>
  dtcCodes: Collection<WithMeta<(typeof T.DTC_CODES)[number]>>
  oemTools: Collection<WithMeta<(typeof T.OEM_TOOLS)[number]>>
  integrations: Collection<WithMeta<(typeof T.SYS_INTEGRATIONS)[number]>>
  kbProcedures: Collection<WithMeta<(typeof T.KB_PROCEDURES)[number]>>
  approvalLines: Collection<WithMeta<(typeof T.APPROVAL_LINES)[number]>>
  diagStages: Collection<WithMeta<(typeof T.DIAG_STAGES)[number]>>
  diagFindings: Collection<WithMeta<(typeof T.DIAG_FINDINGS)[number]>>
  diagParts: Collection<WithMeta<(typeof T.DIAG_PARTS)[number]>>
  diagLabour: Collection<WithMeta<(typeof T.DIAG_LABOUR)[number]>>
  diagCopies: Collection<WithMeta<(typeof T.DIAG_COPIES)[number]>>
}

export type CollectionKey = keyof Repository

/** Where each collection lives on the API. Mirrors `server/src/registry.ts`;
 *  the seed-fidelity suite fetches every one of these paths, so a name that
 *  drifts fails a test rather than a screen. */
export const ENDPOINTS: Readonly<Record<CollectionKey, string>> = {
  branches: 'branches',
  customers: 'customers',
  vehicles: 'vehicles',
  fleets: 'fleets',
  services: 'services',
  jobs: 'jobs',
  appointments: 'appointments',
  estimates: 'estimates',
  declinedJobs: 'declined-jobs',
  inspectionFindings: 'inspection-findings',
  inspectionMedia: 'inspection-media',
  deliverySignoffs: 'delivery-signoffs',
  cannedJobs: 'canned-jobs',
  invoices: 'invoices',
  invoiceLines: 'invoice-lines',
  invoicePayments: 'payments',
  receipts: 'receipts',
  parts: 'inventory',
  warehouseZones: 'warehouse-zones',
  technicians: 'technicians',
  departments: 'admin/departments',
  leads: 'crm/leads',
  opportunities: 'crm/opportunities',
  campaigns: 'crm/campaigns',
  segments: 'crm/segments',
  crmTasks: 'crm/tasks',
  feedback: 'customer-feedback',
  chartOfAccounts: 'accounting/coa',
  journalEntries: 'accounting/journal-entries',
  expenses: 'accounting/expenses',
  bankStatements: 'bank-statements',
  savedReports: 'saved-reports',
  insurancePolicies: 'insurance-policies',
  insuranceClaims: 'insurance-claims',
  loanContracts: 'loan-contracts',
  loanRepayments: 'loan-repayments',
  employees: 'employees',
  payrollRuns: 'payroll/runs',
  payrollLines: 'payroll/lines',
  timesheets: 'timesheets',
  leaveRequests: 'leave-requests',
  trainingCourses: 'training/courses',
  trainingEnrolments: 'training/enrolments',
  suppliers: 'procurement/suppliers',
  requisitions: 'procurement/requisitions',
  purchaseOrders: 'procurement/purchase-orders',
  equipmentWarranties: 'equipment-warranties',
  notifications: 'notifications',
  partsNetworkMembers: 'parts-network/members',
  partsNetworkRequests: 'parts-network/requests',
  partsNetworkQuotations: 'parts-network/quotations',
  partsNetworkOrders: 'parts-network/orders',
  aiAgents: 'ai/agents',
  conversations: 'ai/conversations',
  obdDevices: 'diagnostics/devices',
  obdReadings: 'diagnostics/readings',
  dtcCodes: 'kb/dtc',
  oemTools: 'integrations/oem-tools',
  integrations: 'integrations',
  kbProcedures: 'kb/procedures',
  approvalLines: 'approvals/lines',
  diagStages: 'diagnostics/stages',
  diagFindings: 'diagnostics/findings',
  diagParts: 'diagnostics/parts',
  diagLabour: 'diagnostics/labour',
  diagCopies: 'diagnostics/copies',
}

/* ------------------------------------------------------------ mock backend */

const DEFAULT_PAGE_SIZE = 25

function matchesSearch(row: unknown, term: string): boolean {
  const needle = term.toLowerCase()
  if (Array.isArray(row)) return row.some((v) => String(v).toLowerCase().includes(needle))
  if (row && typeof row === 'object') {
    return Object.values(row as Record<string, unknown>).some(
      (value) =>
        (typeof value === 'string' || typeof value === 'number') &&
        String(value).toLowerCase().includes(needle),
    )
  }
  return false
}

function matchesFilter(row: unknown, filter: Record<string, string | number | boolean>): boolean {
  if (!row || typeof row !== 'object') return false
  return Object.entries(filter).every(
    ([field, value]) => String((row as Record<string, unknown>)[field]) === String(value),
  )
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

let nextSeq = 1
function generateId(): string {
  return `demo_${Date.now()}_${nextSeq++}`
}

function applyMeta<TRow>(row: TRow, id: string, version: number): TRow & EntityMeta {
  const now = new Date().toISOString()
  return { ...row, _id: id, _version: version, _createdAt: now, _updatedAt: now }
}

function rowId(row: unknown): string {
  const r = row as Record<string, unknown> & EntityMeta
  return r._id ?? String(r.id ?? '')
}

function listSlice<TRow>(data: TRow[], query: Query) {
  let result = data.slice()
  if (query.q) result = result.filter((row) => matchesSearch(row, query.q as string))
  if (query.filter) {
    result = result.filter((row) => matchesFilter(row, query.filter as Record<string, string>))
  }
  if (query.sort) {
    const [field = '', dir = 'asc'] = query.sort.split(':')
    result.sort((a, b) => {
      const order = compare(
        (a as Record<string, unknown>)[field],
        (b as Record<string, unknown>)[field],
      )
      return dir === 'desc' ? -order : order
    })
  }
  const total = result.length
  const pageSize = query.pageSize ?? Math.max(total, 1)
  const page = query.page ?? 1
  const start = (page - 1) * pageSize
  return {
    rows: result.slice(start, start + pageSize),
    page: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  }
}

/** In-memory collection seeded from the design bundle.
 *
 *  Reads work identically to the old fixture. Writes mutate a session-local
 *  copy — data resets on reload, which is honest: no fake persistence, no
 *  silent data loss. This lets every screen with mutation hooks work in demo
 *  mode without a backend. */
function fixture<TRow>(seed: readonly TRow[]): Collection<TRow> {
  const data: TRow[] = seed.slice()

  const idempotencyLog = new Map<string, TRow | TRow[] | void>()

  return {
    async list(query = {}) {
      return listSlice(data, query)
    },

    async get(id) {
      const found = data.find((row) => rowId(row) === id)
      if (!found) throw new RepositoryError('not_found', `No record with id "${id}".`)
      return found
    },

    async create(input, options) {
      if (options?.idempotencyKey && idempotencyLog.has(options.idempotencyKey)) {
        return idempotencyLog.get(options.idempotencyKey) as TRow
      }
      const id = generateId()
      const created = applyMeta(input as TRow, id, 1)
      data.unshift(created)
      if (options?.idempotencyKey) idempotencyLog.set(options.idempotencyKey, created)
      return created
    },

    async update(id, patch, options) {
      const idx = data.findIndex((row) => rowId(row) === id)
      if (idx === -1) throw new RepositoryError('not_found', `No record with id "${id}".`)
      const existing = data[idx] as TRow & EntityMeta
      if (options?.version !== undefined && existing._version !== undefined
          && options.version !== existing._version) {
        throw new RepositoryError('version_conflict', 'Record was modified by another user.')
      }
      const updated = {
        ...existing,
        ...patch,
        _id: existing._id ?? id,
        _version: (existing._version ?? 0) + 1,
        _updatedAt: new Date().toISOString(),
      }
      data[idx] = updated
      return updated
    },

    async delete(id) {
      const idx = data.findIndex((row) => rowId(row) === id)
      if (idx === -1) throw new RepositoryError('not_found', `No record with id "${id}".`)
      data.splice(idx, 1)
    },

    async bulkCreate(inputs) {
      const results: TRow[] = []
      for (const input of inputs) {
        const id = generateId()
        const created = applyMeta(input as TRow, id, 1)
        data.unshift(created)
        results.push(created)
      }
      return results
    },

    async bulkUpdate(ids, patch) {
      const results: TRow[] = []
      for (const id of ids) {
        const idx = data.findIndex((row) => rowId(row) === id)
        if (idx === -1) throw new RepositoryError('not_found', `No record with id "${id}".`)
        const existing = data[idx] as TRow & EntityMeta
        const updated = {
          ...existing,
          ...patch,
          _id: existing._id ?? id,
          _version: (existing._version ?? 0) + 1,
          _updatedAt: new Date().toISOString(),
        }
        data[idx] = updated
        results.push(updated)
      }
      return results
    },

    async bulkDelete(ids) {
      for (const id of ids) {
        const idx = data.findIndex((row) => rowId(row) === id)
        if (idx === -1) throw new RepositoryError('not_found', `No record with id "${id}".`)
        data.splice(idx, 1)
      }
    },
  }
}

/** Which warehouse zone each design-bundle part is racked in (BLK-004), by
 *  SKU. The prototype had no zones, so this assignment lives here rather than
 *  in the generated fixture — filters and pads on the main floor, the smaller
 *  service items on the mezzanine.
 *
 *  Mirrored by `PART_ZONE_CODES` in `server/scripts/seed.ts`, which assigns the
 *  same zone to the same SKU; `server/tests/repository-swap.test.ts` compares
 *  the fixture rows against the seeded ones field by field, so the two copies
 *  cannot drift apart unnoticed. */
export const PART_ZONE_CODES: Readonly<Record<string, string>> = {
  'OF-TY-118': 'A1',
  'BP-FR-220': 'A1',
  'AF-UN-002': 'A2',
  'SP-SET-04': 'A2',
}

/** The eight training courses the fixture build serves (BLK-004).
 *
 *  Most collections new to BLK-004 ship an **empty** fixture, because
 *  `server/tests/repository-swap.test.ts` asserts each collection's live rows are
 *  exactly this fixture's rows plus `SEED_COHERENCE_EXTRAS`. The course
 *  catalogue is an exception on purpose, the same one `WAREHOUSE_ZONE_FIXTURE`
 *  below is: Golden Path 14 (`app/e2e/employee-onboarding.spec.ts`) asserts the
 *  catalogue contains `Workplace Safety Essentials` in a build with **no API**,
 *  so an empty fixture here would leave the screen with nothing real to render.
 *  The answer is not to weaken the assertion but to ship the same eight courses
 *  the server seeds: `server/scripts/seed.ts` inserts these rows, in this order,
 *  with `SEED_COHERENCE_EXTRAS.trainingCourses = 0`, and both
 *  `repository-swap.test.ts` and `seed-fidelity.test.ts` compare the two copies
 *  field by field.
 *
 *  The titles, categories and durations are ported from the array
 *  `TrainingLMS.tsx` used to render (course names, not invented people). What is
 *  deliberately *not* ported is that array's `enrolled` and `completion`: both
 *  are counted from `trainingEnrolments`, so a course row has no place to record
 *  them. One title is not verbatim — the mock's `Regulatory Compliance 2024` is
 *  `Regulatory Compliance 2026` here, so a course published in 2026 is not named
 *  after a compliance year two years gone.
 *
 *  There is no matching enrolment fixture, and so no head count in this build:
 *  an enrolment names an employee, and the app's `employees` fixture is
 *  deliberately empty (the prototype had no staff records). Inventing fixture
 *  employees to make the percentages look busy is exactly the fabrication this
 *  change removes, so a fixture build reads 0 enrolled and no completion figure —
 *  which is what "nobody is enrolled" honestly looks like. */
export const TRAINING_COURSE_FIXTURE: readonly TrainingCourseRow[] = [
  { id: 'TRN-0001', code: 'TRN-0001', title: 'Workplace Safety Essentials', titleAr: 'أساسيات السلامة في مكان العمل', category: 'safety', durationMinutes: 240, status: 'active', publishedAt: '2026-01-15T08:00:00.000Z', archivedAt: null, notes: null },
  { id: 'TRN-0002', code: 'TRN-0002', title: 'Advanced Engine Diagnostics', titleAr: 'تشخيص المحركات المتقدم', category: 'technical', durationMinutes: 480, status: 'active', publishedAt: '2026-02-01T08:00:00.000Z', archivedAt: null, notes: null },
  { id: 'TRN-0003', code: 'TRN-0003', title: 'Customer Communication Skills', titleAr: 'مهارات التواصل مع العملاء', category: 'customer_service', durationMinutes: 180, status: 'active', publishedAt: '2026-02-20T08:00:00.000Z', archivedAt: null, notes: null },
  { id: 'TRN-0004', code: 'TRN-0004', title: 'Regulatory Compliance 2026', titleAr: 'الالتزام التنظيمي 2026', category: 'compliance', durationMinutes: 120, status: 'active', publishedAt: '2026-03-05T08:00:00.000Z', archivedAt: null, notes: null },
  { id: 'TRN-0005', code: 'TRN-0005', title: 'Electrical Systems Overview', titleAr: 'نظرة عامة على الأنظمة الكهربائية', category: 'technical', durationMinutes: 360, status: 'active', publishedAt: '2026-03-18T08:00:00.000Z', archivedAt: null, notes: null },
  /* Two courses still being written, so the publish move the screen can drive is
   * visible in the demo build too. */
  { id: 'TRN-0006', code: 'TRN-0006', title: 'Fire Safety Procedures', titleAr: 'إجراءات السلامة من الحرائق', category: 'safety', durationMinutes: 90, status: 'draft', publishedAt: null, archivedAt: null, notes: null },
  { id: 'TRN-0007', code: 'TRN-0007', title: 'Hybrid Vehicle Maintenance', titleAr: 'صيانة المركبات الهجينة', category: 'technical', durationMinutes: 600, status: 'draft', publishedAt: null, archivedAt: null, notes: null },
  /* Retired from the catalogue. Its roster outlives it on the server: who has
   * done a course is a fact the course being withdrawn does not undo. */
  { id: 'TRN-0008', code: 'TRN-0008', title: 'Service Desk Best Practices', titleAr: 'أفضل ممارسات مكتب الخدمة', category: 'customer_service', durationMinutes: 150, status: 'archived', publishedAt: '2025-06-01T08:00:00.000Z', archivedAt: '2026-06-30T08:00:00.000Z', notes: null },
]

/** The six warehouse zones the fixture build serves (BLK-004).
 *
 *  Every other collection new to BLK-004 ships an **empty** fixture, because
 *  `server/tests/repository-swap.test.ts` asserts each collection's live rows
 *  are exactly this fixture's rows plus `SEED_COHERENCE_EXTRAS`. Zones are the
 *  exception on purpose: Golden Path 7 (`app/e2e/inventory-receiving.spec.ts`)
 *  asserts a real numeric utilisation per zone in a build with **no API**, so an
 *  empty fixture here would leave the screen with nothing real to render. The
 *  answer is not to weaken the assertion but to ship the same six zones the
 *  server seeds: `server/scripts/seed.ts` inserts these rows, in this order,
 *  with `SEED_COHERENCE_EXTRAS.warehouseZones = 0`, and both
 *  `repository-swap.test.ts` and `seed-fidelity.test.ts` compare the two copies
 *  field by field.
 *
 *  The names and capacities are ported from the array `InternalWarehouse.tsx`
 *  used to render (they are plausible shop bays, not invented people or
 *  customers). What is deliberately *not* ported is that array's `utilized` and
 *  `itemCount`: those are derived from the parts assigned to each zone, so a
 *  zone row has no place to record them. */
export const WAREHOUSE_ZONE_FIXTURE: readonly WarehouseZoneRow[] = [
  { id: 'A1', code: 'A1', name: 'Main Floor', nameAr: 'الصالة الرئيسية', kind: 'storage', capacityUnits: 500, status: 'active', maintenanceSince: null, notes: null },
  { id: 'A2', code: 'A2', name: 'Mezzanine', nameAr: 'الميزانين', kind: 'storage', capacityUnits: 200, status: 'active', maintenanceSince: null, notes: null },
  /* One bay genuinely out of service, so the lifecycle the screen can drive is
   * visible in the demo build too. `maintenanceSince` matches the seed's fixed
   * timestamp exactly — through the API it is derived from the status
   * transition and never posted. */
  {
    id: 'A3',
    code: 'A3',
    name: 'Cold Storage',
    nameAr: 'التخزين المبرد',
    kind: 'cold',
    capacityUnits: 80,
    status: 'maintenance',
    maintenanceSince: '2026-09-10T06:00:00.000Z',
    notes: 'Compressor service; chiller offline.',
  },
  { id: 'A4', code: 'A4', name: 'Hazmat', nameAr: 'المواد الخطرة', kind: 'hazmat', capacityUnits: 50, status: 'active', maintenanceSince: null, notes: null },
  { id: 'A5', code: 'A5', name: 'Receiving', nameAr: 'الاستلام', kind: 'receiving', capacityUnits: 150, status: 'active', maintenanceSince: null, notes: null },
  { id: 'A6', code: 'A6', name: 'Shipping', nameAr: 'الشحن', kind: 'shipping', capacityUnits: 120, status: 'active', maintenanceSince: null, notes: null },
]

/** Demo data straight from the design bundle. Same rows every screen in the
 *  prototypes showed, so a rebuilt screen can be diffed against its `.dc.html`
 *  original without accounting for different content — and the same rows
 *  `server/scripts/seed.ts` loads, so the API serves them identically. */
export const mockRepository: Repository = {
  /* The bundle carries no branches. An empty read-only collection is the
   * honest mock: the fixture repository never invents rows, and the transfer
   * form already explains that a live API is needed for stock operations. */
  branches: fixture<BranchRow>([]),
  vehicles: fixture(T.VEHICLES),
  invoices: fixture(T.INVOICES),
  invoiceLines: fixture(T.INVOICE_LINES),
  invoicePayments: fixture(T.INVOICE_PAYMENTS),
  jobs: fixture(T.JOBS),
  appointments: fixture(T.APPOINTMENTS),
  estimates: fixture(T.ESTIMATES),
  /* No design fixture — declined job tracking is new (Sprint 1, P0). An empty
   * read-only mock is the honest fixture: every row is born from an estimate
   * decline action, which the fixture repository cannot perform (`isLive` is
   * false), so there is nothing to seed here. The live API serves rows once a
   * line has actually been declined. */
  declinedJobs: fixture<DeclinedJobRow>([]),
  /* No design fixture — DVHC is new (Sprint 2, P0). An empty read-only mock is
   * the honest fixture, same reasoning as declinedJobs: every finding is born
   * from `POST /job-cards/:id/inspection-findings` and every media row from a
   * multipart upload, neither of which the fixture repository can perform
   * (`isLive` is false) — `screens/workshop/inspection-api.ts` refuses both
   * outright in that mode rather than routing through this collection. */
  inspectionFindings: fixture<InspectionFindingRow>([]),
  inspectionMedia: fixture<InspectionMediaRow>([]),
  /* No design fixture — customer sign-off at delivery is new (Sprint 2, P0).
   * An empty read-only mock is the honest fixture, same reasoning as
   * inspectionFindings: every row is born from
   * `POST /job-cards/:id/delivery-signoff`, which the fixture repository
   * cannot perform (`isLive` is false) — `screens/workshop/delivery-api.ts`
   * refuses it outright in that mode rather than routing through this
   * collection. */
  deliverySignoffs: fixture<DeliverySignoffRow>([]),
  /* No design fixture — canned jobs are new (build-order item 5). An empty
   * read-only mock is the honest fixture, same reasoning as declinedJobs:
   * every row is born from `POST /canned-jobs`, which the fixture
   * repository cannot perform (`isLive` is false) —
   * `screens/workshop/canned-job-api.ts` refuses it outright in that mode
   * rather than routing through this collection. */
  cannedJobs: fixture<CannedJobRow>([]),
  customers: fixture(T.CUSTOMERS),
  fleets: fixture(T.FLEETS),
  /* The design bundle's parts, each with the bay it is racked in (BLK-004).
   * `zoneCode` is absent from the generated fixture — the prototype had no
   * warehouse zones — so it is added here rather than left undefined, because
   * Golden Path 7 asserts a real numeric utilisation per zone in a build with
   * no API, and a fixture with no zone assignment could only ever show 0%. */
  parts: fixture<PartRow>(
    T.PARTS.map((part) => ({ ...part, zoneCode: PART_ZONE_CODES[part.sku] ?? null }) as PartRow),
  ),
  warehouseZones: fixture<WarehouseZoneRow>(WAREHOUSE_ZONE_FIXTURE),
  technicians: fixture(T.TECHS),
  services: fixture(T.SERVICES),
  leads: fixture(T.LEADS),
  opportunities: fixture(T.OPPORTUNITIES),
  campaigns: fixture(T.CAMPAIGNS),
  segments: fixture(T.SEGMENTS),
  crmTasks: fixture(T.CRM_TASKS),
  /* The bundle carries no feedback fixture — the capture form was write-only in
   * the prototype. An empty read-only collection is the honest mock; the live
   * API serves the seeded feedback rows. */
  feedback: fixture<FeedbackRow>([]),
  chartOfAccounts: fixture(T.ACCOUNTS_COA),
  journalEntries: fixture(T.JOURNAL_ENTRIES),
  expenses: fixture(T.EXPENSES_DATA),
  /* No design fixture for either report-source table (F-028). An empty
   * read-only collection is the honest mock; the live API serves the seeded
   * rows. Writes to `savedReports` need a server and are refused by the mock. */
  bankStatements: fixture<BankStatementRow>([]),
  savedReports: fixture<SavedReportRow>([]),
  /* No design fixture for any financial-products table (vertical A) — they were
   * mock in the prototype. An empty read-only collection is the honest mock; the
   * live API serves the seeded coherent rows. */
  insurancePolicies: fixture<InsurancePolicyRow>([]),
  insuranceClaims: fixture<InsuranceClaimRow>([]),
  loanContracts: fixture<LoanContractRow>([]),
  loanRepayments: fixture<LoanRepaymentRow>([]),
  /* No design fixture for any HR table (vertical B) — they were mock in the
   * prototype. An empty read-only collection is the honest mock; the live API
   * serves the seeded coherent rows, and writes need a server. */
  employees: fixture<EmployeeRow>([]),
  payrollRuns: fixture<PayrollRunRow>([]),
  payrollLines: fixture<PayrollLineRow>([]),
  timesheets: fixture<TimesheetRow>([]),
  leaveRequests: fixture<LeaveRequestRow>([]),
  /* The course catalogue is the one HR collection with a real fixture, because
   * Golden Path 14 asserts a course *title* in a build with no API (see
   * `TRAINING_COURSE_FIXTURE`). The roster stays empty: an enrolment names an
   * employee, and there are no fixture employees to name — so this build shows
   * no head count rather than an invented one. */
  trainingCourses: fixture<TrainingCourseRow>(TRAINING_COURSE_FIXTURE),
  trainingEnrolments: fixture<TrainingEnrolmentRow>([]),
  /* No design fixture for any procurement table (F-022) — the procurement
   * server did not exist in the prototype. An empty read-only collection is the
   * honest mock; the live API serves the seeded coherent rows, and the writes
   * (raise/approve/receive) need a server. */
  suppliers: fixture<SupplierRow>([]),
  requisitions: fixture<RequisitionRow>([]),
  purchaseOrders: fixture<PurchaseOrderRow>([]),
  /* No design fixture — equipment warranties are new (BLK-004). Unlike
   * `cannedJobs`/`declinedJobs`, a warranty is born from a plain create on
   * this same collection rather than a bespoke route, so `fixture()`'s
   * generic create/update/delete genuinely works here in demo mode too —
   * session-local, same as everywhere else `isLive` is false. */
  equipmentWarranties: fixture<EquipmentWarrantyRow>([]),
  /* No design fixture — notifications are new (BLK-004). Empty, same as
   * `equipmentWarranties`: `tests/repository-swap.test.ts` asserts every
   * collection's live rows are exactly this fixture's rows plus
   * `SEED_COHERENCE_EXTRAS`, so a literal seed here would have to match the
   * server's seeded rows verbatim or break that check. Unlike
   * `equipmentWarranties` there is no create action on the real screen (a
   * notification is filed by the system, not typed in by a user, so
   * `dashboard` grants `c` only to `test` — see `writers.ts`), so
   * `app/tests/component/notification-center.test.tsx` seeds this fixture
   * directly through `repository.notifications.create(...)` before
   * rendering, the same generic write path the real API's `test` role
   * uses. */
  notifications: fixture<NotificationRow>([]),
  /* No design fixture — the parts network is new (BLK-004). Empty, for the
   * same reason `notifications` is: `tests/repository-swap.test.ts` asserts
   * every collection's live rows are exactly this fixture's rows plus
   * `SEED_COHERENCE_EXTRAS`, so a literal seed here would have to match the
   * server's seeded rows verbatim or break that check. The generic
   * create/update/delete genuinely works against these in demo mode, so
   * `app/tests/component/parts-network.test.tsx` seeds them through
   * `repository.partsNetworkRequests.create(...)` and friends before
   * rendering — the same write path a live deployment uses. */
  partsNetworkMembers: fixture<PartsNetworkMemberRow>([]),
  partsNetworkRequests: fixture<PartsNetworkRequestRow>([]),
  partsNetworkQuotations: fixture<PartsNetworkQuotationRow>([]),
  partsNetworkOrders: fixture<PartsNetworkOrderRow>([]),
  receipts: fixture(T.RECEIPTS),
  departments: fixture(T.DEPARTMENTS),
  aiAgents: fixture(T.AI_AGENTS),
  conversations: fixture(T.CONVERSATIONS),
  obdDevices: fixture(T.OBD_DEVICES),
  /* No design fixture — the device↔dtc readings link is new (F-029). An empty
   * read-only collection is the honest mock; the live API serves recorded
   * readings, and the commands that write them refuse without a bridge. */
  obdReadings: fixture<ObdReadingRow>([]),
  dtcCodes: fixture(T.DTC_CODES),
  oemTools: fixture(T.OEM_TOOLS),
  integrations: fixture(T.SYS_INTEGRATIONS),
  kbProcedures: fixture(T.KB_PROCEDURES),
  approvalLines: fixture(T.APPROVAL_LINES),
  diagStages: fixture(T.DIAG_STAGES),
  diagFindings: fixture(T.DIAG_FINDINGS),
  diagParts: fixture(T.DIAG_PARTS),
  diagLabour: fixture(T.DIAG_LABOUR),
  diagCopies: fixture(T.DIAG_COPIES),
}

/* ------------------------------------------------------------ HTTP backend */

/** The access token is owned by the session layer, not by this module. It
 *  registers a provider here so the repository never reaches into storage that
 *  belongs to somebody else — and so a test can supply a token without a DOM. */
type TokenProvider = () => string | null | undefined

let accessToken: TokenProvider = () => null

export function setAccessTokenProvider(provider: TokenProvider): void {
  accessToken = provider
}

/** Reads the current access token.
 *
 *  Exported for the handful of screens that call an *action* endpoint —
 *  `POST /jobs/:id/transition`, `POST /invoices/:id/issue`,
 *  `POST /inventory/:id/movement` — which have no collection shape and so make
 *  the request themselves rather than through `createHttpRepository`. Without
 *  this they defaulted to sending no token, so every such call was a 401 in a
 *  live build (reported honestly as a failure, never faked). They register the
 *  same token the session already gave this module, so there is one source of
 *  truth for who the caller is, not four. */
export function getAccessToken(): string | null | undefined {
  return accessToken()
}

function buildUrl(base: string, path: string, query: Query = {}): string {
  const url = new URL(`${base.replace(/\/$/, '')}/${path}`)
  if (query.page !== undefined) url.searchParams.set('page', String(query.page))
  if (query.pageSize !== undefined) url.searchParams.set('pageSize', String(query.pageSize))
  if (query.sort) url.searchParams.set('sort', query.sort)
  if (query.q) url.searchParams.set('q', query.q)
  if (query.includeDeleted) url.searchParams.set('includeDeleted', 'true')
  for (const [field, value] of Object.entries(query.filter ?? {})) {
    url.searchParams.set(`filter[${field}]`, String(value))
  }
  return url.toString()
}

interface ErrorBody {
  error?: { code?: string; message?: string; field?: string; requestId?: string }
}

async function request<TResult>(
  url: string,
  init: RequestInit & { idempotencyKey?: string; version?: number } = {},
): Promise<TResult> {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body) headers.set('content-type', 'application/json')
  const token = accessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  if (init.idempotencyKey) headers.set('idempotency-key', init.idempotencyKey)
  if (init.version !== undefined) headers.set('if-match-version', String(init.version))

  let response: Response
  try {
    response = await fetch(url, { ...init, headers, credentials: 'include' })
  } catch (cause) {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  if (response.status === 204) return undefined as TResult
  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const envelope = (body ?? {}) as ErrorBody
    throw new RepositoryError(
      (envelope.error?.code as RepositoryErrorCode) ?? 'internal',
      envelope.error?.message ?? `Request failed with status ${response.status}.`,
      {
        field: envelope.error?.field,
        status: response.status,
        requestId: envelope.error?.requestId,
      },
    )
  }
  return body as TResult
}

function httpCollection<TRow>(base: string, path: string): Collection<TRow> {
  const root = `${base.replace(/\/$/, '')}/${path}`
  return {
    async list(query = {}) {
      const result = await request<Paged<TRow>>(buildUrl(base, path, query))
      /* A malformed envelope is a server bug, and surfacing it as one beats
       * letting `undefined.map` fail three components away. */
      if (!result || !Array.isArray(result.rows) || !result.page) {
        throw new RepositoryError('internal', `The API returned an unexpected shape for ${path}.`)
      }
      return result
    },

    async get(id) {
      return request<TRow>(`${root}/${encodeURIComponent(id)}`)
    },

    async create(input, options = {}) {
      return request<TRow>(root, {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: options.idempotencyKey,
      })
    },

    async update(id, patch, options = {}) {
      return request<TRow>(`${root}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
        version: options.version,
        idempotencyKey: options.idempotencyKey,
      })
    },

    async delete(id) {
      await request<void>(`${root}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },

    async bulkCreate(inputs) {
      const created: TRow[] = []
      for (const input of inputs) {
        created.push(await this.create(input))
      }
      return created
    },

    async bulkUpdate(ids, patch) {
      const result = await request<{ rows: TRow[] }>(`${root}/bulk-update`, {
        method: 'POST',
        body: JSON.stringify({ ids, patch }),
      })
      return result.rows
    },

    async bulkDelete(ids) {
      await request<{ deleted: number }>(`${root}/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
      })
    },
  }
}

export function createHttpRepository(baseUrl: string): Repository {
  const entries = Object.entries(ENDPOINTS).map(([key, path]) => [
    key,
    httpCollection(baseUrl, path),
  ])
  return Object.fromEntries(entries) as Repository
}

/* --------------------------------------------------------- approval queue */

/** One pending decision in the unified queue, as `GET /approvals` presents it
 *  (F-029). Uniform across sources: a `kind` discriminates estimate /
 *  requisition / purchase order / insurance claim, but the fields a screen
 *  renders are the same. The row carries `amountHalalas` and `module` so the
 *  client's own `canApprove` reads honestly, plus the server's standing so the
 *  two cannot disagree, and `approvePath`/`rejectPath` so a mixed queue posts
 *  each decision to the endpoint that actually decides it. */
export interface ApprovalItem extends EntityMeta {
  kind: 'estimate' | 'requisition' | 'purchase_order' | 'insurance_claim'
  module: string
  entityId: string
  reference: string
  title: string
  /** Whoever the document is with — customer, supplier, requester, policy. */
  party: string
  /** What it is about — vehicle, department. Empty where the source has none. */
  subject: string
  amountHalalas: number
  amount: string
  submittedBy: string | null
  status: string
  submittedAt: string
  approvePath: string
  /** Null where the source has no reject endpoint (a purchase order). */
  rejectPath: string | null
  approval: {
    canApprove: boolean
    ceilingHalalas: number | null
    withinCeiling: boolean
    isSubmitter: boolean
  }
}

export interface ApprovalQueue {
  rows: ApprovalItem[]
  summary: {
    count: number
    pendingHalalas: number
    byModule: Record<string, { count: number; totalHalalas: number }>
    /** Beside `byModule`, because requisitions and purchase orders share the
     *  `procurement` module and a badge per source needs them apart. */
    byKind: Record<string, { count: number; totalHalalas: number }>
  }
}

/** The unified approval queue the ApprovalInbox reads. Live only: it aggregates
 *  pending records across modules under the caller's scope, which the fixtures
 *  cannot reproduce without inventing an approval standing. */
export interface ApprovalsApi {
  list(): Promise<ApprovalQueue>
}

export function createApprovalsApi(baseUrl: string): ApprovalsApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async list() {
      return request<ApprovalQueue>(`${root}/approvals`)
    },
  }
}

/* --------------------------------------------------------- audit history */

/** One entry in a record's audit trail, as `GET /:collection/:id/history`
 *  presents it (F-029, the F-004 client half). The `activities` a row evidences
 *  and the `sodConflicts` an actor holding both sides of a pair would create are
 *  computed server-side, so a screen flags a segregation-of-duties conflict per
 *  row rather than re-deriving the control. Read-only. */
export interface HistoryEntry extends EntityMeta {
  id: string
  actorId: string | null
  actorRole: string | null
  action: string
  at: string | null
  reason: string | null
  before: unknown
  after: unknown
  /** SOD activities this row evidences, e.g. `['Perform repair']`. */
  activities: string[]
}

export interface SodConflict {
  actorId: string
  a: string
  b: string
  risk: string
}

export interface EntityHistory {
  entityId: string
  entries: HistoryEntry[]
  sodConflicts: SodConflict[]
}

/** The audit-trail reads WorkshopQC and EstimateDetail use to show who did what
 *  and flag a segregation-of-duties conflict. Live only: the trail is a server
 *  computation over the audit log, so there is no fixture — a mock that invented
 *  a history would be exactly the fake-completion this seam refuses. `id` is the
 *  record's ULID or its human code. */
export interface HistoryApi {
  estimate(id: string): Promise<EntityHistory>
  job(id: string): Promise<EntityHistory>
}

export function createHistoryApi(baseUrl: string): HistoryApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async estimate(id) {
      return request<EntityHistory>(`${root}/estimates/${encodeURIComponent(id)}/history`)
    },
    async job(id) {
      return request<EntityHistory>(`${root}/jobs/${encodeURIComponent(id)}/history`)
    },
  }
}

/* ------------------------------------------------------------ audit log */

/** One entry in the org-wide audit feed, as `GET /audit-log` presents it.
 *  `category` is a server-derived classification (auth / data / system),
 *  not a stored column — see the route's own docstring for the partition. */
export interface AuditLogEntry {
  id: string
  actorId: string | null
  actorName: string | null
  actorRole: string | null
  action: string
  entity: string
  entityId: string | null
  reason: string | null
  source: string
  ip: string | null
  category: 'auth' | 'data' | 'system'
  at: string
}

export interface AuditLogQuery {
  category?: 'auth' | 'data' | 'system'
  q?: string
  limit?: number
}

/** The org-wide audit trail AuditLog reads. Live only: the feed is a server
 *  computation over the append-only audit log across every entity in the
 *  tenant scope, and there is no fixture that could reproduce it without
 *  fabricating history that never happened. */
export interface AuditLogApi {
  list(query?: AuditLogQuery): Promise<AuditLogEntry[]>
}

export function createAuditLogApi(baseUrl: string): AuditLogApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async list(query = {}) {
      const url = new URL(`${root}/audit-log`)
      if (query.category) url.searchParams.set('category', query.category)
      if (query.q) url.searchParams.set('q', query.q)
      if (query.limit) url.searchParams.set('limit', String(query.limit))
      const { entries } = await request<{ entries: AuditLogEntry[] }>(url.toString())
      return entries
    },
  }
}

/* ------------------------------------------------- financial aggregates */

export interface ReportRange {
  /** `YYYY-MM-DD`, inclusive. Omit for an open bound. */
  from?: string
  to?: string
}

/** The period totals `GET /invoices/summary` computes — what SalesReports and
 *  the invoice dashboards display. Every figure is integer halalas the server
 *  summed over the whole tenant scope, never a page the client added up. */
export interface InvoiceSummary {
  range: { from: string | null; to: string | null }
  count: number
  invoicedHalalas: number
  subtotalHalalas: number
  vatHalalas: number
  discountHalalas: number
  paidHalalas: number
  outstandingHalalas: number
  byStatus: {
    status: string
    count: number
    invoicedHalalas: number
    outstandingHalalas: number
  }[]
}

/** `GET /accounting/tax/return` — TaxManagement's figure. `rateBps` is the
 *  configured ZATCA rate the return is reported under (§A37); `inputVatModelled`
 *  is false because expense-side VAT is not tracked yet, so its zero reads as
 *  "not tracked" rather than "reconciled". */
export interface TaxReturn {
  range: { from: string | null; to: string | null }
  rateBps: number
  invoiceCount: number
  taxableSalesHalalas: number
  grossSalesHalalas: number
  outputVatHalalas: number
  inputVatModelled: boolean
  inputVatHalalas: number
  netVatPayableHalalas: number
}

export interface TrialBalanceAccount {
  code: string
  name: string
  type: string
  debitHalalas: number
  creditHalalas: number
}

/** `GET /accounting/reports/trial-balance`. Reports reality: `balanced` and
 *  `balanceSheet.differenceHalalas` surface F-008's SAR 257,050 imbalance rather
 *  than forcing the books to tie. */
export interface TrialBalance {
  accounts: TrialBalanceAccount[]
  totals: { debitHalalas: number; creditHalalas: number; differenceHalalas: number }
  balanced: boolean
  balanceSheet: {
    assetsHalalas: number
    liabilitiesHalalas: number
    equityHalalas: number
    liabilitiesPlusEquityHalalas: number
    differenceHalalas: number
    balanced: boolean
  }
  profitAndLoss: { revenueHalalas: number; expenseHalalas: number; netHalalas: number }
  journal: {
    postedDebitHalalas: number
    postedCreditHalalas: number
    postedCount: number
    draftCount: number
  }
}

/** The financial aggregates the server computes and the client only displays
 *  (§A10). Not a `Collection` — an aggregate has no row identity and no writes —
 *  so it lives beside the repository rather than inside it, and there is no mock
 *  implementation: a cross-record total is a server computation the client must
 *  not fabricate. */
export interface FinanceReportsApi {
  invoicesSummary(query?: ReportRange & { status?: string }): Promise<InvoiceSummary>
  taxReturn(query?: ReportRange): Promise<TaxReturn>
  trialBalance(): Promise<TrialBalance>
}

function reportUrl(
  base: string,
  path: string,
  query: Record<string, string | undefined> = {},
): string {
  const url = new URL(`${base.replace(/\/$/, '')}/${path}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, value)
  }
  return url.toString()
}

export function createFinanceReports(baseUrl: string): FinanceReportsApi {
  return {
    async invoicesSummary(query = {}) {
      return request<InvoiceSummary>(
        reportUrl(baseUrl, 'invoices/summary', {
          from: query.from,
          to: query.to,
          'filter[status]': query.status,
        }),
      )
    },
    async taxReturn(query = {}) {
      return request<TaxReturn>(
        reportUrl(baseUrl, 'accounting/tax/return', { from: query.from, to: query.to }),
      )
    },
    async trialBalance() {
      return request<TrialBalance>(reportUrl(baseUrl, 'accounting/reports/trial-balance'))
    },
  }
}

/* ------------------------------------------- organization tax identity */

/** `GET /organization/tax-profile` — what the organization has *recorded* about
 *  its own tax identity, plus the VAT rate the deployment *enforces*.
 *
 *  The two are different kinds of fact and the field names keep them apart.
 *  `vatNumber` and `crNumber` are recorded properties of the organization's own
 *  row; `POST /invoices/:id/issue` reads the VAT number, stamps it onto the
 *  invoice and its ZATCA QR, and refuses to issue when it is null — so `null`
 *  here means "not recorded, and invoicing is blocked", which is a state a
 *  screen must show rather than paper over with a plausible-looking number.
 *  `vatRateBps` is read from the server's own configuration, the same value the
 *  invoice pricing rule charges at, so a screen displaying it cannot quote a
 *  rate the ledger did not apply. Nothing here is editable: the rate is a
 *  deployment setting, and a form over it would be a control the enforcement
 *  ignores. */
export interface OrgTaxProfile {
  name: string
  nameAr: string | null
  /** The ZATCA VAT registration number on the organization's row, or null when
   *  it has recorded none. Never a stand-in. */
  vatNumber: string | null
  /** Commercial-registration number, same discipline. */
  crNumber: string | null
  /** The enforced rate, in basis points — 1500 is 15%. */
  vatRateBps: number
  /** Where `vatRateBps` came from, so a screen can label it honestly. */
  vatRateSource: string
}

export interface OrganizationApi {
  taxProfile(): Promise<OrgTaxProfile>
}

export function createOrganizationApi(baseUrl: string): OrganizationApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async taxProfile() {
      return request<OrgTaxProfile>(`${root}/organization/tax-profile`)
    },
  }
}

/* ------------------------------------------ external integrations (§40) */

/** The status of one external-integration adapter, as `GET
 *  /diagnostics/integrations` reports it (F-029). `configured` is the honest
 *  answer — false for the OBD bridge and the SMS transport in every deployment
 *  this code has run in — and `dependency`/`requires` name what is missing. A
 *  screen shows the EXTERNAL_DEPENDENCY state from this rather than assuming a
 *  command will work. */
export interface IntegrationStatus {
  id: string
  configured: boolean
  requires: string[]
  state: string
  dependency: string
}

/** The outcome of an OBD command. `mock` is true when the reading came from the
 *  mock bridge, never a live device — a screen showing the result must be able
 *  to say the scan was not real. */
export interface ObdCommandResult {
  command: string
  deviceId: string
  status: string
  found?: number
  cleared?: number
  dtcs?: { code: string; description: string; severity: string }[]
  mock: boolean
}

/** The OBD device commands and the integration-status read (F-029). Live only:
 *  a command touches an external bridge, so there is no fixture — a mock that
 *  returned a scan result would be the faked-live integration §40 forbids. The
 *  command itself still refuses with a 503 (RepositoryError code
 *  `external_dependency_unavailable`) until a bridge is deployed. */
export interface DiagnosticsApi {
  rescan(deviceId: string): Promise<ObdCommandResult>
  clearCodes(deviceId: string): Promise<ObdCommandResult>
  readings(deviceId: string): Promise<{ rows: ObdReadingRow[] }>
  integrations(): Promise<{ integrations: IntegrationStatus[] }>
}

export function createDiagnosticsApi(baseUrl: string): DiagnosticsApi {
  const root = baseUrl.replace(/\/$/, '')
  const device = (id: string) => `${root}/diagnostics/devices/${encodeURIComponent(id)}`
  return {
    async rescan(deviceId) {
      return request<ObdCommandResult>(`${device(deviceId)}/rescan`, { method: 'POST', body: '{}' })
    },
    async clearCodes(deviceId) {
      return request<ObdCommandResult>(`${device(deviceId)}/clear-codes`, { method: 'POST', body: '{}' })
    },
    async readings(deviceId) {
      return request<{ rows: ObdReadingRow[] }>(`${device(deviceId)}/readings`)
    },
    async integrations() {
      return request<{ integrations: IntegrationStatus[] }>(`${root}/diagnostics/integrations`)
    },
  }
}

/** The customer-approval OTP e-signature over an estimate (F-029). Live only,
 *  and SMS is an external dependency: `request` refuses with a 503
 *  (`external_dependency_unavailable`) until a messaging provider is set — it
 *  never reports a code as sent that was not. `destination` comes back masked. */
export interface EstimateOtpApi {
  request(estimateId: string): Promise<{ challengeId: string; expiresAt: string; destination: string }>
  verify(
    estimateId: string,
    code: string,
  ): Promise<{ verified: boolean; challengeId?: string; reason?: string; attemptsLeft?: number }>
}

export function createEstimateOtpApi(baseUrl: string): EstimateOtpApi {
  const root = baseUrl.replace(/\/$/, '')
  const estimate = (id: string) => `${root}/estimates/${encodeURIComponent(id)}`
  return {
    async request(estimateId) {
      return request(`${estimate(estimateId)}/request-approval-otp`, { method: 'POST', body: '{}' })
    },
    async verify(estimateId, code) {
      return request(`${estimate(estimateId)}/verify-approval-otp`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
    },
  }
}

/* --------------------------------------------------- workshop analytics */

/** The server-computed workshop analytics `GET /reports/workshop` returns
 *  (F-029). Every figure is summed in SQL over the whole tenant scope — job
 *  counts, the QC pass rate from the audit trail, bay time, technician hours and
 *  the diagnostic-report total (VAT at the configured rate, §5b). The client
 *  displays; it never re-derives one of these from a page of rows. */
export interface WorkshopReport {
  jobs: {
    total: number
    byStatus: { status: string; count: number }[]
    byStage: { stage: string; count: number }[]
    serviceMix: { service: string; count: number }[]
  }
  qc: {
    decisions: number
    passes: number
    reworks: number
    /** Null when nothing has been through QC — undefined, not zero. */
    passRatePct: number | null
  }
  bay: { appointments: number; totalBayMinutes: number; averageBayMinutes: number }
  technicians: {
    technicianId: string
    name: string
    appointments: number
    bayMinutes: number
    hours: number
  }[]
  diagnostics: {
    rateBps: number
    subtotalHalalas: number
    taxHalalas: number
    totalHalalas: number
  }
}

export interface WorkshopReportsApi {
  workshop(): Promise<WorkshopReport>
}

export function createWorkshopReports(baseUrl: string): WorkshopReportsApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async workshop() {
      return request<WorkshopReport>(`${root}/reports/workshop`)
    },
  }
}

/* ------------------------------------------ technician leaderboard aggregate */

/** One technician's derived performance figures, as
 *  `GET /reports/technician-leaderboard` returns them (BLK-004).
 *
 *  Every field is computed by the server from records the workshop holds — job
 *  cards grouped by `assignedTechId`, the invoices raised against those jobs and
 *  the customer feedback left on them. None of it is stored against the
 *  technician, and there is deliberately no `rank`: a rank is an ordering over
 *  these numbers, so the screen derives it from the order rather than reading a
 *  column that could disagree with the figures beside it. */
export interface TechnicianLeaderboardRow {
  technicianId: string
  name: string
  specialty: string | null
  jobsAssigned: number
  jobsCompleted: number
  /** Invoices raised against their completed jobs, excluding draft/cancelled. */
  invoiceCount: number
  invoicedHalalas: number
  /** How many of their jobs a customer rated — the denominator of the average. */
  ratedJobs: number
  /** Tenths (4.6 reads as 46), or null when none of their jobs is rated. */
  avgRatingTenths: number | null
}

export interface TechnicianLeaderboard {
  /** The metric the server ordered by, named rather than implied. */
  rankedBy: string
  /** The job statuses counted as completed work. */
  completedStatuses: string[]
  /** Invoice statuses left out of the invoiced total. */
  excludedInvoiceStatuses: string[]
  counted: {
    technicians: number
    jobCards: number
    assignedJobCards: number
    completedJobCards: number
    ratedJobCards: number
    invoices: number
  }
  rows: TechnicianLeaderboardRow[]
}

export interface HrReportsApi {
  technicianLeaderboard(): Promise<TechnicianLeaderboard>
}

export function createHrReports(baseUrl: string): HrReportsApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async technicianLeaderboard() {
      return request<TechnicianLeaderboard>(`${root}/reports/technician-leaderboard`)
    },
  }
}

/* --------------------------------------------- insurance claim lifecycle */

/** The insurance-claim lifecycle actions (vertical A). Live only: each action
 *  transitions a claim server-side under the ceiling and segregation-of-duties
 *  controls, so there is no fixture — a mock that faked an approval would be the
 *  fake-completion this seam refuses. `submit` records a new claim against a
 *  policy; `approve` may approve less than was claimed; `reject` needs a reason;
 *  `pay` settles an approved claim. All return the updated `InsuranceClaimRow`. */
export interface InsuranceClaimSubmit {
  policyId: string
  vehicleId?: string
  vehicleLabel?: string
  jobCardId?: string
  amountClaimedHalalas: number
  incidentDate: string
  description: string
}

export interface InsuranceClaimsApi {
  submit(input: InsuranceClaimSubmit, options?: MutationOptions): Promise<InsuranceClaimRow>
  approve(
    id: string,
    body?: { approvedAmountHalalas?: number; reason?: string },
  ): Promise<InsuranceClaimRow>
  reject(id: string, reason: string): Promise<InsuranceClaimRow>
  pay(id: string): Promise<InsuranceClaimRow>
}

export function createInsuranceClaimsApi(baseUrl: string): InsuranceClaimsApi {
  const root = baseUrl.replace(/\/$/, '')
  const claim = (id: string) => `${root}/insurance-claims/${encodeURIComponent(id)}`
  return {
    async submit(input, options = {}) {
      return request<InsuranceClaimRow>(`${root}/insurance-claims`, {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: options.idempotencyKey,
      })
    },
    async approve(id, body = {}) {
      return request<InsuranceClaimRow>(`${claim(id)}/approve`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    async reject(id, reason) {
      return request<InsuranceClaimRow>(`${claim(id)}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },
    async pay(id) {
      return request<InsuranceClaimRow>(`${claim(id)}/pay`, { method: 'POST', body: '{}' })
    },
  }
}

/* ------------------------------------------------ procurement lifecycle */

/** A requisition line a create or edit sends. Money crosses as integer halalas. */
export interface RequisitionLineInput {
  partSku?: string
  description: string
  descriptionAr?: string
  qty: number
  estUnitPriceHalalas: number
}

export interface RequisitionInput {
  requesterName: string
  department?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  neededBy?: string
  notes?: string
  lines: readonly RequisitionLineInput[]
}

export interface PurchaseOrderLineInput {
  partSku?: string
  description: string
  descriptionAr?: string
  qty: number
  unitPriceHalalas: number
}

export interface PurchaseOrderInput {
  supplierId?: string
  supplierName?: string
  requisitionId?: string
  expectedDate?: string
  /** `true` stamps the order date on raise; approval remains a separate action. */
  place?: boolean
  notes?: string
  lines: readonly PurchaseOrderLineInput[]
}

/** One line's incoming quantity, addressed by the line's ULID (`_id`). */
export interface PurchaseOrderReceipt {
  lineId: string
  qty: number
}

/** The procurement lifecycle actions (F-022). Live only: each transitions a
 *  record server-side under the ceiling, segregation-of-duties and
 *  received-≤-ordered controls, so there is no fixture — a mock that faked an
 *  approval or a receipt would be the fake-completion this seam refuses.
 *  `raisePurchaseOrder` optionally converts an approved requisition; `approve`
 *  is refused above the caller's procurement ceiling and to the raiser; `receive`
 *  refuses an over-receipt unless `overReceiptApproved` is set by a caller with
 *  approval authority, and needs an idempotency key so a retry cannot double-book. */
export interface ProcurementApi {
  createRequisition(input: RequisitionInput, options?: MutationOptions): Promise<RequisitionRow>
  updateRequisition(
    id: string,
    patch: Partial<RequisitionInput>,
    options?: MutationOptions,
  ): Promise<RequisitionRow>
  submitRequisition(id: string): Promise<RequisitionRow>
  approveRequisition(id: string, reason?: string): Promise<RequisitionRow>
  rejectRequisition(id: string, reason: string): Promise<RequisitionRow>
  requisitionLines(id: string): Promise<{ rows: RequisitionLineRow[] }>
  raisePurchaseOrder(input: PurchaseOrderInput, options?: MutationOptions): Promise<PurchaseOrderRow>
  updatePurchaseOrder(
    id: string,
    patch: Partial<PurchaseOrderInput>,
    options?: MutationOptions,
  ): Promise<PurchaseOrderRow>
  approvePurchaseOrder(id: string, reason?: string): Promise<PurchaseOrderRow>
  receivePurchaseOrder(
    id: string,
    body: { lines: readonly PurchaseOrderReceipt[]; overReceiptApproved?: boolean; reason?: string },
    options: MutationOptions & { idempotencyKey: string },
  ): Promise<PurchaseOrderRow>
  purchaseOrderLines(id: string): Promise<{ rows: PurchaseOrderLineRow[] }>
}

export function createProcurementApi(baseUrl: string): ProcurementApi {
  const root = baseUrl.replace(/\/$/, '')
  const req = (id: string) => `${root}/procurement/requisitions/${encodeURIComponent(id)}`
  const po = (id: string) => `${root}/procurement/purchase-orders/${encodeURIComponent(id)}`
  return {
    async createRequisition(input, options = {}) {
      return request<RequisitionRow>(`${root}/procurement/requisitions`, {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: options.idempotencyKey,
      })
    },
    async updateRequisition(id, patch, options = {}) {
      return request<RequisitionRow>(req(id), {
        method: 'PATCH',
        body: JSON.stringify(patch),
        version: options.version,
      })
    },
    async submitRequisition(id) {
      return request<RequisitionRow>(`${req(id)}/submit`, { method: 'POST', body: '{}' })
    },
    async approveRequisition(id, reason) {
      return request<RequisitionRow>(`${req(id)}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },
    async rejectRequisition(id, reason) {
      return request<RequisitionRow>(`${req(id)}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },
    async requisitionLines(id) {
      return request<{ rows: RequisitionLineRow[] }>(`${req(id)}/lines`)
    },
    async raisePurchaseOrder(input, options = {}) {
      return request<PurchaseOrderRow>(`${root}/procurement/purchase-orders`, {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: options.idempotencyKey,
      })
    },
    async updatePurchaseOrder(id, patch, options = {}) {
      return request<PurchaseOrderRow>(po(id), {
        method: 'PATCH',
        body: JSON.stringify(patch),
        version: options.version,
      })
    },
    async approvePurchaseOrder(id, reason) {
      return request<PurchaseOrderRow>(`${po(id)}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },
    async receivePurchaseOrder(id, body, options) {
      return request<PurchaseOrderRow>(`${po(id)}/receive`, {
        method: 'POST',
        body: JSON.stringify(body),
        idempotencyKey: options.idempotencyKey,
      })
    },
    async purchaseOrderLines(id) {
      return request<{ rows: PurchaseOrderLineRow[] }>(`${po(id)}/lines`)
    },
  }
}

/* ------------------------------------------ financial-product aggregates */

/** The insurance-claim totals `GET /insurance/claims/summary` computes — what
 *  the Insurance report displays. Every figure is integer halalas the server
 *  summed over the whole tenant scope, never a page the client added up. */
export interface InsuranceClaimsSummary {
  count: number
  claimedHalalas: number
  approvedHalalas: number
  paidHalalas: number
  byStatus: { status: string; count: number; claimedHalalas: number; approvedHalalas: number }[]
}

/** The loan-portfolio totals `GET /loans/summary` computes — what the Loan
 *  report displays. `outstandingHalalas` is the unpaid portion of every
 *  scheduled repayment, summed in SQL. */
export interface LoansSummary {
  contractCount: number
  principalHalalas: number
  monthlyInstalmentHalalas: number
  scheduledHalalas: number
  collectedHalalas: number
  outstandingHalalas: number
  overdueHalalas: number
  byStatus: { status: string; count: number; principalHalalas: number }[]
}

/** The financial-product aggregates the server computes and the client only
 *  displays (§A10). Not a `Collection` — an aggregate has no row identity — and
 *  there is no mock: a cross-record total is a server computation the client
 *  must not fabricate. */
export interface ProductReportsApi {
  insuranceClaimsSummary(): Promise<InsuranceClaimsSummary>
  loansSummary(): Promise<LoansSummary>
}

export function createProductReports(baseUrl: string): ProductReportsApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async insuranceClaimsSummary() {
      return request<InsuranceClaimsSummary>(`${root}/insurance/claims/summary`)
    },
    async loansSummary() {
      return request<LoansSummary>(`${root}/loans/summary`)
    },
  }
}

/* ------------------------------------------------------------- the choice */

/** `VITE_API_URL` selects the backend. Unset — which is every build until the
 *  API is deployed — keeps the fixtures, so the app runs with no server at
 *  all and every screen renders the same rows either way.
 *
 *  Read through a widened `import.meta` so this module also imports cleanly
 *  outside Vite: the server's contract tests drive `createHttpRepository` in
 *  Node, and a bare `import.meta.env` would not type-check there. */
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env

export const API_URL: string = viteEnv?.VITE_API_URL ?? ''

export const httpRepository: Repository | null = API_URL
  ? createHttpRepository(API_URL)
  : null

export const repository: Repository = httpRepository ?? mockRepository

/** The financial aggregates (§A10), live only against the API. Null on the
 *  fixtures: a period total or a trial balance is a server computation, and a
 *  mock that invented one would be the fake-completion this seam refuses. A
 *  screen reads it when `isLive`, and shows the §A10 gap notice otherwise. */
export const financeReports: FinanceReportsApi | null = API_URL
  ? createFinanceReports(API_URL)
  : null

/** The audit-trail reads (F-029), live only against the API. Null on the
 *  fixtures: a record's history is a server computation over the append-only
 *  audit log, and a mock that fabricated one would be fake completion. A screen
 *  reads it when `isLive` and shows the honest gap otherwise. */
export const history: HistoryApi | null = API_URL ? createHistoryApi(API_URL) : null

/** The org-wide audit feed (BLK-004), live only against the API. Null on the
 *  fixtures: the trail is a server computation across every entity in the
 *  tenant scope, and there is no fixture set rich enough to reproduce it
 *  without fabricating history. AuditLog reads this when `isLive` and shows
 *  the honest gap otherwise. */
export const auditLogApi: AuditLogApi | null = API_URL ? createAuditLogApi(API_URL) : null

/** The unified approval queue (F-029), live only against the API. Null on the
 *  fixtures: a per-caller approval standing is a server computation, and a mock
 *  that invented one would misinform the gate it drives. */
export const approvals: ApprovalsApi | null = API_URL ? createApprovalsApi(API_URL) : null

/** The server-computed workshop analytics (F-029), live only against the API.
 *  Null on the fixtures: a QC pass rate or an average bay time is a server
 *  computation over the whole tenant scope, and a mock that averaged the pages
 *  it holds would be the §A10-style fabrication this seam refuses. */
export const workshopReports: WorkshopReportsApi | null = API_URL
  ? createWorkshopReports(API_URL)
  : null

/** The server-computed technician leaderboard (BLK-004), live only against the
 *  API. Null on the fixtures, for the same reason as the workshop analytics
 *  above: the invoiced value of a technician's completed jobs is a cross-record
 *  money total, and §5b puts that on the server. In that build the screen
 *  derives its job counts and ratings from the real `jobs`, `technicians` and
 *  `feedback` collections — tallies a client may compute — and shows the money
 *  column as unavailable rather than summing the page of invoices it holds. */
export const hrReports: HrReportsApi | null = API_URL ? createHrReports(API_URL) : null

/** The OBD device commands and integration status (F-029), live only. Null on
 *  the fixtures: a device command touches an external bridge, and even live it
 *  refuses with a 503 until a bridge is deployed (§40) — the mock never fakes a
 *  scan. */
export const diagnostics: DiagnosticsApi | null = API_URL ? createDiagnosticsApi(API_URL) : null

/** The organization's recorded tax identity and the enforced VAT rate
 *  (BLK-004), live only. Null on the fixtures, and deliberately with no mock: a
 *  VAT registration number is the seller identity on every tax document this
 *  system issues, and a fixture that invented one is exactly what the compliance
 *  screens used to do. Those screens read this where it exists and say plainly
 *  that they cannot know it otherwise. */
export const organizationApi: OrganizationApi | null = API_URL
  ? createOrganizationApi(API_URL)
  : null

/** The customer-approval OTP e-signature (F-029), live only. SMS is an external
 *  dependency; the request refuses with a 503 until a provider is configured. */
export const estimateOtp: EstimateOtpApi | null = API_URL ? createEstimateOtpApi(API_URL) : null

/** The insurance-claim lifecycle actions (vertical A), live only. Null on the
 *  fixtures: a claim approval is a server transition under the ceiling and SOD
 *  controls, and a mock that faked one would be the fake-completion this seam
 *  refuses. */
export const insuranceClaimsApi: InsuranceClaimsApi | null = API_URL
  ? createInsuranceClaimsApi(API_URL)
  : null

/** The financial-product aggregates (vertical A), live only. Null on the
 *  fixtures: a claim total or a loan-outstanding figure is a server computation
 *  over the whole tenant scope, and a mock that summed the pages it holds would
 *  be the §A10-style fabrication this seam refuses. */
export const productReports: ProductReportsApi | null = API_URL
  ? createProductReports(API_URL)
  : null

/** The procurement lifecycle actions (F-022), live only. Null on the fixtures:
 *  a requisition approval, a purchase-order approval under the ceiling, or a
 *  receipt under `received ≤ ordered` is a server transition, and a mock that
 *  faked one would be the fake-completion this seam refuses. Agent 11's
 *  Procurement screens read this when `isLive` and show the honest gap otherwise. */
export const procurement: ProcurementApi | null = API_URL ? createProcurementApi(API_URL) : null

/** Accepting a parts-network quotation (BLK-004). Not a field write: it rejects
 *  the request's other pending quotations, moves the request to `ordered` and
 *  creates the order, all in one server transaction with its audit entry
 *  (`server/src/routes/parts-network.ts`), and it is gated on `network:a`
 *  because it commits money.
 *
 *  Live only, and `null` on the fixtures for the same reason
 *  `procurement`/`insuranceClaimsApi` are: a mock that faked the acceptance
 *  would leave the siblings pending, the request `quoted` and no order
 *  anywhere — the false-success write BLK-004 forbids. The Quotations screen
 *  shows an honest read-only notice instead of an Accept button when this is
 *  null, rather than offering a button that cannot work. */
export interface PartsNetworkApi {
  acceptQuotation(
    id: string,
    body?: { qty?: number; expectedAt?: string; notes?: string },
  ): Promise<{
    quotation: PartsNetworkQuotationRow
    order: PartsNetworkOrderRow
    rejectedQuotationCodes: string[]
  }>
}

export function createPartsNetworkApi(baseUrl: string): PartsNetworkApi {
  const root = baseUrl.replace(/\/$/, '')
  return {
    async acceptQuotation(id, body = {}) {
      return request(`${root}/parts-network/quotations/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  }
}

export const partsNetwork: PartsNetworkApi | null = API_URL ? createPartsNetworkApi(API_URL) : null

/** True when writes will actually persist. A screen can use it to explain why
 *  a save button is unavailable rather than letting the click fail. */
export const isLive: boolean = httpRepository !== null

export async function createRepository(): Promise<Repository> {
  return repository
}

export { DEFAULT_PAGE_SIZE }
