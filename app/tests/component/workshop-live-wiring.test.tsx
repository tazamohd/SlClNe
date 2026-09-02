import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApprovalInbox } from '@/screens/workshop/ApprovalInbox'
import { EstimateDetail } from '@/screens/workshop/EstimateDetail'
import { WorkshopQC } from '@/screens/workshop/WorkshopQC'
import { WorkshopReports } from '@/screens/workshop/WorkshopReports'
import { OBDDiagnostics } from '@/screens/workshop/OBDDiagnostics'
import { CustomerApproval } from '@/screens/workshop/CustomerApproval'
import { RepositoryError } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** The live half of the F-029 wiring. Each screen has two paths: the accessor is
 *  present and it shows real server data (here), or the accessor is null and it
 *  keeps its honest gap state (the tranche-3 gap tests, which mock nothing so the
 *  accessors are null). This file mocks `@/data/repository` so every workshop
 *  accessor is live, and each test configures what its screen consumes through
 *  the hoisted `wire` holder.
 *
 *  The mock spreads the real module, so `repository`, `RepositoryError`,
 *  `mockRepository` and the session token plumbing are untouched — only the
 *  workshop accessors and, where a screen reads its record from a collection, the
 *  `estimates` collection, are overridden. */
const wire = vi.hoisted(() => ({
  approvalsList: null as null | (() => Promise<unknown>),
  historyEstimate: null as null | ((id: string) => Promise<unknown>),
  historyJob: null as null | ((id: string) => Promise<unknown>),
  workshopReport: null as null | (() => Promise<unknown>),
  diagIntegrations: null as null | (() => Promise<unknown>),
  diagCommand: null as null | ((deviceId: string) => Promise<unknown>),
  diagReadings: null as null | ((deviceId: string) => Promise<unknown>),
  otpRequest: null as null | ((id: string) => Promise<unknown>),
  otpVerify: null as null | ((id: string, code: string) => Promise<unknown>),
  estimateRows: null as null | Record<string, unknown>[],
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    approvals: { list: () => wire.approvalsList!() },
    history: {
      estimate: (id: string) => wire.historyEstimate!(id),
      job: (id: string) => wire.historyJob!(id),
    },
    workshopReports: { workshop: () => wire.workshopReport!() },
    diagnostics: {
      integrations: () => wire.diagIntegrations!(),
      rescan: (id: string) => wire.diagCommand!(id),
      clearCodes: (id: string) => wire.diagCommand!(id),
      readings: (id: string) => wire.diagReadings!(id),
    },
    estimateOtp: {
      request: (id: string) => wire.otpRequest!(id),
      verify: (id: string, code: string) => wire.otpVerify!(id, code),
    },
    repository: {
      ...mod.repository,
      estimates: {
        ...mod.repository.estimates,
        list: (query?: unknown) =>
          wire.estimateRows
            ? Promise.resolve({
                rows: wire.estimateRows,
                page: { page: 1, pageSize: 50, total: wire.estimateRows.length, totalPages: 1 },
              })
            : mod.repository.estimates.list(query as never),
      },
    },
  }
})

// The real error class (from the spread), for the §40 503 refusals.
const dep503 = (message: string) =>
  new RepositoryError('external_dependency_unavailable' as never, message, { status: 503 })

afterEach(() => {
  for (const key of Object.keys(wire) as (keyof typeof wire)[]) wire[key] = null as never
  vi.clearAllMocks()
})

/* ------------------------------------------------------------- ApprovalInbox */

describe('ApprovalInbox — live queue (approvals.list)', () => {
  beforeEach(() => {
    wire.approvalsList = () =>
      Promise.resolve({
        rows: [
          approval('EST-9001', 'Ahmed', 125_000, {
            canApprove: true,
            withinCeiling: true,
            isSubmitter: false,
          }),
          approval('EST-9002', 'Mohammed', 9_900_000, {
            canApprove: false,
            withinCeiling: false,
            isSubmitter: false,
          }),
          approval('EST-9003', 'Sara', 48_000, {
            canApprove: false,
            withinCeiling: true,
            isSubmitter: true,
          }),
        ],
        summary: { count: 3, pendingHalalas: 0, byModule: {} },
      })
  })

  function approval(
    reference: string,
    customerName: string,
    amountHalalas: number,
    standing: { canApprove: boolean; withinCeiling: boolean; isSubmitter: boolean }
  ) {
    return {
      kind: 'estimate',
      module: 'workshop',
      entityId: `id-${reference}`,
      reference,
      title: reference,
      customerName,
      vehicleLabel: 'Toyota Camry',
      amountHalalas,
      amount: `SAR ${(amountHalalas / 100).toLocaleString()}`,
      submittedBy: 'Layla',
      status: 'sent',
      submittedAt: '2026-08-01',
      approval: { ceilingHalalas: 5_000_000, ...standing },
    }
  }

  it('renders the server rows the unified queue returned', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    expect(await screen.findByText('EST-9001')).toBeInTheDocument()
    expect(screen.getByText('EST-9002')).toBeInTheDocument()
    expect(screen.getByText('EST-9003')).toBeInTheDocument()
  })

  it('gates the approve button on the server canApprove standing', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    // Row EST-9001 (canApprove) offers an enabled Approve; the others do not.
    const enabled = (await screen.findAllByRole('button', { name: /^Approve$/ })).filter(
      (b) => !(b as HTMLButtonElement).disabled
    )
    expect(enabled.length).toBe(1)
  })

  it('explains an over-ceiling refusal as Escalate', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    await screen.findByText('EST-9002')
    expect(screen.getByRole('button', { name: /Escalate/ })).toBeInTheDocument()
  })

  it('flags the estimate the caller raised as their own', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    await screen.findByText('EST-9003')
    expect(screen.getByText('You raised this')).toBeInTheDocument()
  })
})

/* ------------------------------------------------------------ EstimateDetail */

describe('EstimateDetail — live VAT split and audit trail', () => {
  beforeEach(() => {
    wire.estimateRows = [
      {
        _id: 'id-EST-9001',
        id: 'EST-9001',
        cust: 'Ahmed Al-Rashid',
        veh: 'Toyota Camry 2022',
        amount: 'SAR 1,437.50',
        status: 'approved',
        subtotalHalalas: 125_000,
        taxHalalas: 18_750,
        discountHalalas: 0,
        totalHalalas: 143_750,
        submittedBy: 'Layla Advisor',
        approvedBy: 'Omar Owner',
      },
    ]
  })

  it('shows the server VAT split — subtotal, VAT and grand total', async () => {
    wire.historyEstimate = () => Promise.resolve({ entityId: 'EST-9001', entries: [], sodConflicts: [] })
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-9001' })
    await screen.findByRole('heading', { name: 'EST-9001' })
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('VAT')).toBeInTheDocument()
    expect(screen.getByText('Grand total')).toBeInTheDocument()
    // Every figure is a server value, formatted not summed.
    expect(screen.getByText(/SAR\s*1,250\.00/)).toBeInTheDocument()
    expect(screen.getByText(/SAR\s*187\.50/)).toBeInTheDocument()
  })

  it('names who raised versus who approved, and flags a SOD conflict', async () => {
    wire.historyEstimate = () =>
      Promise.resolve({
        entityId: 'EST-9001',
        entries: [
          {
            id: 'h1',
            actorId: 'u-omar',
            actorRole: 'owner',
            action: 'estimate.raise',
            at: '2026-08-01',
            reason: null,
            before: null,
            after: null,
            activities: ['Raise estimate'],
          },
          {
            id: 'h2',
            actorId: 'u-omar',
            actorRole: 'owner',
            action: 'estimate.approve',
            at: '2026-08-02',
            reason: null,
            before: null,
            after: null,
            activities: ['Approve estimate'],
          },
        ],
        sodConflicts: [
          { actorId: 'u-omar', a: 'Raise estimate', b: 'Approve estimate', risk: 'self-approval' },
        ],
      })
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-9001' })
    await screen.findByRole('heading', { name: 'EST-9001' })
    // The trail resolves a tick after the estimate loads.
    expect((await screen.findAllByText('Layla Advisor')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Omar Owner').length).toBeGreaterThan(0)
    expect(await screen.findByText('Segregation-of-duties conflict')).toBeInTheDocument()
  })

  it('keeps the honest note when the estimate carries no VAT split (gap within live)', async () => {
    wire.estimateRows = [
      { _id: 'id-x', id: 'EST-9009', cust: 'Test', veh: 'Kia', amount: 'SAR 500', status: 'sent' },
    ]
    wire.historyEstimate = () => Promise.resolve({ entityId: 'EST-9009', entries: [], sodConflicts: [] })
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-9009' })
    await screen.findByRole('heading', { name: 'EST-9009' })
    expect(screen.queryByText('Subtotal')).toBeNull()
    expect(screen.getByText('Grand total')).toBeInTheDocument()
  })
})

/* -------------------------------------------------------------- WorkshopQC */

describe('WorkshopQC — live audit trail (history.job)', () => {
  it('renders the trail and highlights a segregation-of-duties conflict', async () => {
    wire.historyJob = () =>
      Promise.resolve({
        entityId: 'A3F8B2C1',
        entries: [
          {
            id: 'j1',
            actorId: 'u-mgr',
            actorRole: 'manager',
            action: 'job.repair',
            at: '2026-08-01',
            reason: null,
            before: null,
            after: null,
            activities: ['Perform repair'],
          },
        ],
        sodConflicts: [
          { actorId: 'u-mgr', a: 'Perform repair', b: 'Pass quality check', risk: 'self-QC' },
        ],
      })
    renderWithProviders(<WorkshopQC />, { role: 'manager' })
    expect(await screen.findByText('Audit trail')).toBeInTheDocument()
    expect(await screen.findByText('Segregation-of-duties conflict')).toBeInTheDocument()
  })
})

/* ------------------------------------------------------------ WorkshopReports */

describe('WorkshopReports — live analytics (workshopReports.workshop)', () => {
  it('shows the server QC pass rate, bay time and technician hours', async () => {
    wire.workshopReport = () =>
      Promise.resolve({
        jobs: { total: 12, byStatus: [], byStage: [], serviceMix: [] },
        qc: { decisions: 10, passes: 9, reworks: 1, passRatePct: 90 },
        bay: { appointments: 8, totalBayMinutes: 960, averageBayMinutes: 120 },
        technicians: [
          { technicianId: 't1', name: 'Khalid', appointments: 4, bayMinutes: 480, hours: 8 },
          { technicianId: 't2', name: 'Nora', appointments: 4, bayMinutes: 480, hours: 8.5 },
        ],
        diagnostics: { rateBps: 1500, subtotalHalalas: 0, taxHalalas: 0, totalHalalas: 0 },
      })
    renderWithProviders(<WorkshopReports />, { role: 'owner' })
    expect(await screen.findByText('QC pass rate')).toBeInTheDocument()
    expect(screen.getByText('90.0%')).toBeInTheDocument()
    expect(screen.getByText(/120 /)).toBeInTheDocument()
    // Technician hours summed server-side (8 + 8.5).
    expect(screen.getByText(/16\.5 /)).toBeInTheDocument()
    // The gap banner is gone in live mode.
    expect(screen.queryByText(/Awaiting GET \/reports\/workshop/)).toBeNull()
  })
})

/* ------------------------------------------------------------ OBDDiagnostics */

describe('OBDDiagnostics — live commands and integration status', () => {
  beforeEach(() => {
    wire.diagIntegrations = () =>
      Promise.resolve({
        integrations: [
          {
            id: 'obd-bridge',
            configured: false,
            requires: ['OBD_BRIDGE_URL'],
            state: 'EXTERNAL_DEPENDENCY',
            dependency: 'the OBD bridge',
          },
        ],
      })
    wire.diagReadings = () => Promise.resolve({ rows: [] })
  })

  it('renders the EXTERNAL_DEPENDENCY banner from diagnostics.integrations', async () => {
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    expect(
      await screen.findByText(/The OBD bridge is not configured in this deployment/)
    ).toBeInTheDocument()
  })

  it('handles a 503 from a device command as the honest bridge-not-connected state', async () => {
    const user = userEvent.setup()
    wire.diagCommand = () => Promise.reject(dep503('The OBD bridge is not connected.'))
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    await user.click(await screen.findByRole('button', { name: /Re-scan/ }))
    expect(await screen.findByText('OBD bridge not connected')).toBeInTheDocument()
  })

  it('shows the per-device DTC readings from diagnostics.readings', async () => {
    wire.diagReadings = () =>
      Promise.resolve({
        rows: [
          {
            _id: 'r1',
            deviceId: 'OBD-014',
            deviceCode: 'OBD-014',
            dtc: 'P0301',
            desc: 'Cylinder 1 misfire',
            severity: 'high',
            source: 'scan',
            cleared: false,
            at: '2026-08-10',
            mock: true,
          },
        ],
      })
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    expect(await screen.findByText('P0301')).toBeInTheDocument()
    expect(screen.getByText('Cylinder 1 misfire')).toBeInTheDocument()
  })
})

/* ----------------------------------------------------------- CustomerApproval */

describe('CustomerApproval — live OTP e-signature (estimateOtp)', () => {
  it('handles the SMS 503 as the honest not-connected state', async () => {
    const user = userEvent.setup()
    wire.otpRequest = () => Promise.reject(dep503('SMS provider is not configured.'))
    renderWithProviders(<CustomerApproval />, {
      role: 'customer',
      route: '/customer-approval?estimate=EST-9001',
    })
    await user.click(await screen.findByRole('button', { name: /Send one-time code/ }))
    expect(await screen.findByText('SMS not connected')).toBeInTheDocument()
  })

  it('completes the sign-off when the code verifies', async () => {
    const user = userEvent.setup()
    wire.otpRequest = () =>
      Promise.resolve({ challengeId: 'c1', expiresAt: '2026-08-16', destination: '••• 4471' })
    wire.otpVerify = () => Promise.resolve({ verified: true })
    renderWithProviders(<CustomerApproval />, {
      role: 'customer',
      route: '/customer-approval?estimate=EST-9001',
    })
    await user.click(await screen.findByRole('button', { name: /Send one-time code/ }))
    const input = await screen.findByPlaceholderText('One-time code')
    await user.type(input, '123456')
    await user.click(screen.getByRole('button', { name: /Verify and sign/ }))
    expect(await screen.findByText('Signed and authorised')).toBeInTheDocument()
  })

  it('keeps the Not connected gap when no estimate is linked', async () => {
    wire.otpRequest = () => Promise.resolve({ challengeId: '', expiresAt: '', destination: '' })
    renderWithProviders(<CustomerApproval />, { role: 'customer' })
    expect(await screen.findByText('Authorise the work')).toBeInTheDocument()
    expect(screen.getAllByText('Not connected').length).toBeGreaterThanOrEqual(3)
  })
})
