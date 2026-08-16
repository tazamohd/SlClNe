/** The proof that swapping the mock repository for the API is non-destructive.
 *
 *  Every collection is fetched from the running API and compared, field by
 *  field and row by row, with the fixture the app renders today. Money makes a
 *  full round trip on the way: `"SAR 1,840"` → 184000 halalas in a bigint
 *  column → `"SAR 1,840"`. If a single formatting decision drifts, a screen
 *  would render differently after the swap, and this fails instead.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as T from '../../app/src/data/generated/tables'
import { SEED_COHERENCE_EXTRAS } from '../scripts/seed'
import { COLLECTIONS } from '../src/registry'
import { startHarness, type Harness } from './harness'

/** Repository key → the fixture that key serves today. */
const FIXTURES: Record<string, readonly unknown[]> = {
  /** No branches fixture exists — the design bundle never listed them. The
   *  collection serves the seeded branch directory (SEED_COHERENCE_EXTRAS). */
  branches: [],
  vehicles: T.VEHICLES,
  invoices: T.INVOICES,
  invoiceLines: T.INVOICE_LINES,
  invoicePayments: T.INVOICE_PAYMENTS,
  jobs: T.JOBS,
  appointments: T.APPOINTMENTS,
  estimates: T.ESTIMATES,
  customers: T.CUSTOMERS,
  fleets: T.FLEETS,
  parts: T.PARTS,
  technicians: T.TECHS,
  services: T.SERVICES,
  leads: T.LEADS,
  opportunities: T.OPPORTUNITIES,
  campaigns: T.CAMPAIGNS,
  segments: T.SEGMENTS,
  crmTasks: T.CRM_TASKS,
  /** No feedback fixture exists — the capture form was write-only in the
   *  prototype. The collection serves the seeded feedback rows
   *  (SEED_COHERENCE_EXTRAS). */
  feedback: [],
  chartOfAccounts: T.ACCOUNTS_COA,
  journalEntries: T.JOURNAL_ENTRIES,
  expenses: T.EXPENSES_DATA,
  /** No design fixture for either — both report-source tables are new (F-028).
   *  The collections serve the seeded coherence rows (SEED_COHERENCE_EXTRAS). */
  bankStatements: [],
  savedReports: [],
  /** No design fixture for any financial-products table (vertical A). The
   *  collections serve the seeded coherence rows (SEED_COHERENCE_EXTRAS). */
  insurancePolicies: [],
  insuranceClaims: [],
  loanContracts: [],
  loanRepayments: [],
  /** No design fixture for any HR table (vertical B). The collections serve the
   *  seeded coherence rows (SEED_COHERENCE_EXTRAS). */
  employees: [],
  payrollRuns: [],
  payrollLines: [],
  timesheets: [],
  leaveRequests: [],
  /** No design fixture for any procurement table (F-022) — the procurement
   *  server did not exist in the prototype. The collections serve the seeded
   *  coherence rows (SEED_COHERENCE_EXTRAS). */
  suppliers: [],
  requisitions: [],
  purchaseOrders: [],
  receipts: T.RECEIPTS,
  departments: T.DEPARTMENTS,
  aiAgents: T.AI_AGENTS,
  conversations: T.CONVERSATIONS,
  obdDevices: T.OBD_DEVICES,
  /** No design fixture — the device↔dtc readings link is new (F-029). Nothing
   *  is seeded into it, so the collection serves an empty set. */
  obdReadings: [],
  dtcCodes: T.DTC_CODES,
  oemTools: T.OEM_TOOLS,
  integrations: T.SYS_INTEGRATIONS,
  kbProcedures: T.KB_PROCEDURES,
  approvalLines: T.APPROVAL_LINES,
  diagStages: T.DIAG_STAGES,
  diagFindings: T.DIAG_FINDINGS,
  diagParts: T.DIAG_PARTS,
  diagLabour: T.DIAG_LABOUR,
  diagCopies: T.DIAG_COPIES,
}

/** Keeps only the keys the fixture carries: the API adds `_id`, `_version` and
 *  the halalas values a screen may want, and extra keys are additive by
 *  design. What must not change is any key a screen already reads. */
function pickLike(expected: unknown, actual: unknown): unknown {
  if (Array.isArray(expected)) return actual
  if (expected && typeof expected === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(expected as Record<string, unknown>)) {
      out[key] = (actual as Record<string, unknown>)[key]
    }
    return out
  }
  return actual
}

let harness: Harness

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

describe('the seeded API serves exactly what the fixtures serve', () => {
  it('covers every collection the app repository exposes', () => {
    expect(COLLECTIONS.map((c) => c.key).sort()).toEqual(Object.keys(FIXTURES).sort())
  })

  for (const def of COLLECTIONS) {
    it(`${def.key} matches app/src/data/generated/tables.ts`, async () => {
      const token = await harness.token('owner')
      const response = await harness.app.inject({
        method: 'GET',
        url: `/api/v1/${def.path}?pageSize=200`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode, response.body).toBe(200)
      const body = response.json() as { rows: unknown[]; page: { total: number } }
      const fixture = FIXTURES[def.key]

      /* The fixtures come first and unchanged; the seed may then add exactly
       * the declared coherence rows (F-015, F-016) — a linked technician, the
       * historical invoices the receipts settle — and nothing else. */
      const extras = SEED_COHERENCE_EXTRAS[def.key] ?? 0
      expect(body.rows.length, `${def.key} row count`).toBe(fixture.length + extras)
      expect(body.page.total).toBe(fixture.length + extras)

      fixture.forEach((expectedRow, index) => {
        expect(pickLike(expectedRow, body.rows[index]), `${def.key}[${index}]`).toEqual(expectedRow)
      })
    })
  }

  it('carries an addressable id and version on every object row', async () => {
    const token = await harness.token('owner')
    for (const def of COLLECTIONS) {
      if (def.key === 'services') continue
      const response = await harness.app.inject({
        method: 'GET',
        url: `/api/v1/${def.path}?pageSize=1`,
        headers: { authorization: `Bearer ${token}` },
      })
      const [row] = (response.json() as { rows: Record<string, unknown>[] }).rows
      expect(typeof row?._id, def.key).toBe('string')
      expect(typeof row?._version, def.key).toBe('number')
    }
  })
})
