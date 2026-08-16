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

export interface Repository {
  branches: Collection<BranchRow>
  vehicles: Collection<(typeof T.VEHICLES)[number]>
  invoices: Collection<(typeof T.INVOICES)[number]>
  invoiceLines: Collection<(typeof T.INVOICE_LINES)[number]>
  invoicePayments: Collection<(typeof T.INVOICE_PAYMENTS)[number]>
  jobs: Collection<(typeof T.JOBS)[number]>
  appointments: Collection<(typeof T.APPOINTMENTS)[number]>
  estimates: Collection<(typeof T.ESTIMATES)[number]>
  customers: Collection<(typeof T.CUSTOMERS)[number]>
  fleets: Collection<(typeof T.FLEETS)[number]>
  parts: Collection<(typeof T.PARTS)[number]>
  technicians: Collection<(typeof T.TECHS)[number]>
  services: Collection<(typeof T.SERVICES)[number]>
  leads: Collection<(typeof T.LEADS)[number]>
  opportunities: Collection<(typeof T.OPPORTUNITIES)[number]>
  campaigns: Collection<(typeof T.CAMPAIGNS)[number]>
  segments: Collection<(typeof T.SEGMENTS)[number]>
  crmTasks: Collection<(typeof T.CRM_TASKS)[number]>
  feedback: Collection<FeedbackRow>
  chartOfAccounts: Collection<(typeof T.ACCOUNTS_COA)[number]>
  journalEntries: Collection<(typeof T.JOURNAL_ENTRIES)[number]>
  expenses: Collection<(typeof T.EXPENSES_DATA)[number]>
  bankStatements: Collection<BankStatementRow>
  savedReports: Collection<SavedReportRow>
  receipts: Collection<(typeof T.RECEIPTS)[number]>
  departments: Collection<(typeof T.DEPARTMENTS)[number]>
  aiAgents: Collection<(typeof T.AI_AGENTS)[number]>
  conversations: Collection<(typeof T.CONVERSATIONS)[number]>
  obdDevices: Collection<(typeof T.OBD_DEVICES)[number]>
  obdReadings: Collection<ObdReadingRow>
  dtcCodes: Collection<(typeof T.DTC_CODES)[number]>
  oemTools: Collection<(typeof T.OEM_TOOLS)[number]>
  integrations: Collection<(typeof T.SYS_INTEGRATIONS)[number]>
  kbProcedures: Collection<(typeof T.KB_PROCEDURES)[number]>
  approvalLines: Collection<(typeof T.APPROVAL_LINES)[number]>
  diagStages: Collection<(typeof T.DIAG_STAGES)[number]>
  diagFindings: Collection<(typeof T.DIAG_FINDINGS)[number]>
  diagParts: Collection<(typeof T.DIAG_PARTS)[number]>
  diagLabour: Collection<(typeof T.DIAG_LABOUR)[number]>
  diagCopies: Collection<(typeof T.DIAG_COPIES)[number]>
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
  invoices: 'invoices',
  invoiceLines: 'invoice-lines',
  invoicePayments: 'payments',
  receipts: 'receipts',
  parts: 'inventory',
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

function unsupported(operation: string): never {
  throw new RepositoryError(
    'unsupported',
    `The fixture repository cannot ${operation}. Set VITE_API_URL to run against the API.`,
  )
}

/** Reads over the design bundle's fixtures.
 *
 *  Writes throw. A fixture repository that accepted a write and mutated an
 *  array would report success for something that did not happen — the exact
 *  fake-completion this codebase gates against — and the first reload would
 *  contradict it. */
function fixture<TRow>(rows: readonly TRow[]): Collection<TRow> {
  return {
    async list(query = {}) {
      let result = rows.slice()
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
        page: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      }
    },

    async get(id) {
      const found = rows.find((row) => {
        const candidate = row as Record<string, unknown> & EntityMeta
        return candidate._id === id || String(candidate.id ?? '') === id
      })
      if (!found) throw new RepositoryError('not_found', `No record with id "${id}".`)
      return found
    },

    async create() {
      return unsupported('create records')
    },
    async update() {
      return unsupported('update records')
    },
    async delete() {
      return unsupported('delete records')
    },
    async bulkCreate() {
      return unsupported('create records')
    },
    async bulkUpdate() {
      return unsupported('update records')
    },
    async bulkDelete() {
      return unsupported('delete records')
    },
  }
}

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
  customers: fixture(T.CUSTOMERS),
  fleets: fixture(T.FLEETS),
  parts: fixture(T.PARTS),
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
 *  (F-029). Uniform across sources: a `kind` discriminates estimate / purchase
 *  order / journal / payroll, but the fields a screen renders are the same. The
 *  row carries `amountHalalas` and `module` so the client's own `canApprove`
 *  reads honestly, plus the server's standing so the two cannot disagree. */
export interface ApprovalItem extends EntityMeta {
  kind: 'estimate'
  module: string
  entityId: string
  reference: string
  title: string
  customerName: string
  vehicleLabel: string
  amountHalalas: number
  amount: string
  submittedBy: string | null
  status: string
  submittedAt: string
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

/** The OBD device commands and integration status (F-029), live only. Null on
 *  the fixtures: a device command touches an external bridge, and even live it
 *  refuses with a 503 until a bridge is deployed (§40) — the mock never fakes a
 *  scan. */
export const diagnostics: DiagnosticsApi | null = API_URL ? createDiagnosticsApi(API_URL) : null

/** The customer-approval OTP e-signature (F-029), live only. SMS is an external
 *  dependency; the request refuses with a 503 until a provider is configured. */
export const estimateOtp: EstimateOtpApi | null = API_URL ? createEstimateOtpApi(API_URL) : null

/** True when writes will actually persist. A screen can use it to explain why
 *  a save button is unavailable rather than letting the click fail. */
export const isLive: boolean = httpRepository !== null

export { DEFAULT_PAGE_SIZE }
