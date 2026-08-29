/** The seam between screens and their data.
 *
 *  Screens never import the mock tables directly — they go through a
 *  `Repository`. Swapping the mock for the REST client in API_ENDPOINTS.md is
 *  then a one-line change in `RepositoryProvider`, and no screen has to move.
 */
import * as T from './generated/tables'
import { apiBaseUrl, refreshSession } from './auth'
import { readStored, STORAGE_KEYS } from '../lib/storage'

/** A read collection. Writes land here too once the API exists — the mock
 *  implementation throws on them rather than pretending to persist. */
export interface Collection<TRow> {
  list(): Promise<readonly TRow[]>
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

function fixture<TRow>(rows: readonly TRow[]): Collection<TRow> {
  return { list: async () => rows }
}

/** Demo data straight from the design bundle. Same rows every screen in the
 *  prototypes showed, so a rebuilt screen can be diffed against its `.dc.html`
 *  original without accounting for different content. */
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
