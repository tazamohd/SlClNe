/** The seam between screens and their data.
 *
 *  Screens never import the mock tables directly — they go through a
 *  `Repository`. Swapping the mock for the REST client in API_ENDPOINTS.md is
 *  then a one-line change in `RepositoryProvider`, and no screen has to move.
 */
import * as T from './generated/tables'
import { apiBaseUrl, refreshSession } from './auth'
import { readStored, STORAGE_KEYS } from '../lib/storage'

/** Thrown by the mock repository when a screen tries to write. The mock is a
 *  read-only view of the design fixtures; faking persistence would let a screen
 *  "succeed" at saving in mock mode and then silently lose the write, so it
 *  fails loudly instead. Screens catch it and surface a toast — the real write
 *  only happens when `VITE_API_BASE_URL` points the seam at the API. */
export class MockWriteError extends Error {
  constructor(
    readonly collection: string,
    readonly op: 'create' | 'update' | 'remove',
  ) {
    super(
      `Cannot ${op} "${collection}" in mock mode — the mock repository is read-only ` +
        `and will not fake persistence. Set VITE_API_BASE_URL to write through the real API.`,
    )
    this.name = 'MockWriteError'
  }
}

/** A collection.
 *
 *  Reads are always available. Writes are optional on the interface — a
 *  collection the REST contract has no write route for simply omits them — but
 *  both concrete repositories implement all three: the mock throws
 *  `MockWriteError`, and the HTTP repo either calls the API or rejects with
 *  `MissingEndpointError` when the contract defines no path.
 *
 *  Actions that are not plain CRUD (a job's `transition`, an invoice's `issue`)
 *  are deliberately kept OFF this generic seam — they are resource-specific and
 *  called directly on the API client by the screen that needs them, so the
 *  generic interface stays a clean list/create/update/remove. */
export interface Collection<TRow> {
  list(): Promise<readonly TRow[]>
  /** Create a row; resolves with the created row in its served shape. */
  create?(body: Partial<TRow>): Promise<TRow>
  /** Patch a row by its id (natural id, or the surrogate pk for pk-only
   *  resources); resolves with the updated row. */
  update?(id: string | number, body: Partial<TRow>): Promise<TRow>
  /** Delete a row by its id. */
  remove?(id: string | number): Promise<void>
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

function fixture<TRow>(rows: readonly TRow[], key: string): Collection<TRow> {
  return {
    list: async () => rows,
    create: () => Promise.reject(new MockWriteError(key, 'create')),
    update: () => Promise.reject(new MockWriteError(key, 'update')),
    remove: () => Promise.reject(new MockWriteError(key, 'remove')),
  }
}

/** Demo data straight from the design bundle. Same rows every screen in the
 *  prototypes showed, so a rebuilt screen can be diffed against its `.dc.html`
 *  original without accounting for different content. */
export const mockRepository: Repository = {
  vehicles: fixture(T.VEHICLES, 'vehicles'),
  invoices: fixture(T.INVOICES, 'invoices'),
  invoiceLines: fixture(T.INVOICE_LINES, 'invoiceLines'),
  invoicePayments: fixture(T.INVOICE_PAYMENTS, 'invoicePayments'),
  jobs: fixture(T.JOBS, 'jobs'),
  appointments: fixture(T.APPOINTMENTS, 'appointments'),
  estimates: fixture(T.ESTIMATES, 'estimates'),
  customers: fixture(T.CUSTOMERS, 'customers'),
  fleets: fixture(T.FLEETS, 'fleets'),
  parts: fixture(T.PARTS, 'parts'),
  technicians: fixture(T.TECHS, 'technicians'),
  services: fixture(T.SERVICES, 'services'),
  leads: fixture(T.LEADS, 'leads'),
  opportunities: fixture(T.OPPORTUNITIES, 'opportunities'),
  campaigns: fixture(T.CAMPAIGNS, 'campaigns'),
  segments: fixture(T.SEGMENTS, 'segments'),
  crmTasks: fixture(T.CRM_TASKS, 'crmTasks'),
  chartOfAccounts: fixture(T.ACCOUNTS_COA, 'chartOfAccounts'),
  journalEntries: fixture(T.JOURNAL_ENTRIES, 'journalEntries'),
  expenses: fixture(T.EXPENSES_DATA, 'expenses'),
  receipts: fixture(T.RECEIPTS, 'receipts'),
  departments: fixture(T.DEPARTMENTS, 'departments'),
  aiAgents: fixture(T.AI_AGENTS, 'aiAgents'),
  conversations: fixture(T.CONVERSATIONS, 'conversations'),
  obdDevices: fixture(T.OBD_DEVICES, 'obdDevices'),
  dtcCodes: fixture(T.DTC_CODES, 'dtcCodes'),
  oemTools: fixture(T.OEM_TOOLS, 'oemTools'),
  integrations: fixture(T.SYS_INTEGRATIONS, 'integrations'),
  kbProcedures: fixture(T.KB_PROCEDURES, 'kbProcedures'),
  approvalLines: fixture(T.APPROVAL_LINES, 'approvalLines'),
  diagStages: fixture(T.DIAG_STAGES, 'diagStages'),
  diagFindings: fixture(T.DIAG_FINDINGS, 'diagFindings'),
  diagParts: fixture(T.DIAG_PARTS, 'diagParts'),
  diagLabour: fixture(T.DIAG_LABOUR, 'diagLabour'),
  diagCopies: fixture(T.DIAG_COPIES, 'diagCopies'),
}

/** Chooses the backing implementation.
 *
 *  The mock stays the default so `npm run dev` and the smoke suite work with no
 *  server running. Set `VITE_API_BASE_URL` to point the same screens at a real
 *  API — this is the one-line swap the seam exists for.
 *
 *  Imported lazily so the HTTP layer is not pulled into the bundle (or
 *  evaluated in tests) when no base URL is configured. */
export async function createRepository(): Promise<Repository> {
  const baseUrl = apiBaseUrl()
  if (!baseUrl) return mockRepository

  const [{ ApiClient }, { createHttpRepository }] = await Promise.all([
    import('./http/client'),
    import('./http/repository'),
  ])
  return createHttpRepository(
    new ApiClient({
      baseUrl,
      getToken: () => readStored(STORAGE_KEYS.token),
      onAuthFailure: refreshSession,
    }),
  )
}
