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

export interface Repository {
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
  chartOfAccounts: Collection<(typeof T.ACCOUNTS_COA)[number]>
  journalEntries: Collection<(typeof T.JOURNAL_ENTRIES)[number]>
  expenses: Collection<(typeof T.EXPENSES_DATA)[number]>
  receipts: Collection<(typeof T.RECEIPTS)[number]>
  departments: Collection<(typeof T.DEPARTMENTS)[number]>
  aiAgents: Collection<(typeof T.AI_AGENTS)[number]>
  conversations: Collection<(typeof T.CONVERSATIONS)[number]>
  obdDevices: Collection<(typeof T.OBD_DEVICES)[number]>
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
  chartOfAccounts: 'accounting/coa',
  journalEntries: 'accounting/journal-entries',
  expenses: 'accounting/expenses',
  aiAgents: 'ai/agents',
  conversations: 'ai/conversations',
  obdDevices: 'diagnostics/devices',
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
  chartOfAccounts: fixture(T.ACCOUNTS_COA),
  journalEntries: fixture(T.JOURNAL_ENTRIES),
  expenses: fixture(T.EXPENSES_DATA),
  receipts: fixture(T.RECEIPTS),
  departments: fixture(T.DEPARTMENTS),
  aiAgents: fixture(T.AI_AGENTS),
  conversations: fixture(T.CONVERSATIONS),
  obdDevices: fixture(T.OBD_DEVICES),
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

/** True when writes will actually persist. A screen can use it to explain why
 *  a save button is unavailable rather than letting the click fail. */
export const isLive: boolean = httpRepository !== null

export { DEFAULT_PAGE_SIZE }
